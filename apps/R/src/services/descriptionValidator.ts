export interface DescriptionIssue {
    readonly line: number;
    readonly message: string;
    readonly severity: "error" | "warning";
}

const REQUIRED_FIELDS = ["Package", "Version", "Title"] as const;
const DEPENDENCY_FIELDS = ["Imports", "Depends", "Suggests", "Enhances", "LinkingTo"] as const;
// Requires at least MAJOR.MINOR.PATCH (R-DOMAIN §2.6 quick-fix: "Version: 1.0" -> "Version: 1.0.0").
const VERSION_PATTERN = /^\d+(\.\d+){2,3}$/;
const MISSING_COLON_PATTERN = /^([A-Za-z][A-Za-z.]*)\s+(?!:)\S/;

interface DcfField {
    readonly key: string;
    readonly value: string;
    readonly line: number;
}

/** Parses a DCF (Debian Control File) style DESCRIPTION into fields, tolerating continuation lines. Pure. */
export function parseDcf(content: string): DcfField[] {
    const fields: DcfField[] = [];
    const lines = content.split(/\r?\n/);
    let current: { key: string; value: string; line: number } | undefined;

    lines.forEach((line, index) => {
        const isContinuation = /^\s+/.test(line) && current !== undefined;
        if (isContinuation) {
            current!.value += ` ${line.trim()}`;
            return;
        }
        if (current) fields.push(trimField(current));
        const separatorIndex = line.indexOf(":");
        current =
            separatorIndex === -1
                ? undefined
                : {
                      key: line.slice(0, separatorIndex).trim(),
                      value: line.slice(separatorIndex + 1).trim(),
                      line: index,
                  };
    });
    if (current) fields.push(trimField(current));

    return fields;
}

function trimField(field: DcfField): DcfField {
    return { ...field, value: field.value.trim() };
}

/** Validates required fields, version format, and dependency-field colon syntax. Pure, unit-testable. */
export function validateDescription(content: string): DescriptionIssue[] {
    const fields = parseDcf(content);
    const issues: DescriptionIssue[] = [];

    checkRequiredFields(fields, issues);
    checkVersionFormat(fields, issues);
    checkMissingColons(content, issues);

    return issues;
}

function checkRequiredFields(fields: DcfField[], issues: DescriptionIssue[]): void {
    const present = new Set(fields.map((f) => f.key));
    for (const required of REQUIRED_FIELDS) {
        if (!present.has(required)) {
            issues.push({
                line: 0,
                message: `Missing required field: ${required}`,
                severity: "error",
            });
        }
    }
}

function checkVersionFormat(fields: DcfField[], issues: DescriptionIssue[]): void {
    const version = fields.find((f) => f.key === "Version");
    if (version && !VERSION_PATTERN.test(version.value)) {
        issues.push({
            line: version.line,
            message: `Version "${version.value}" should look like MAJOR.MINOR.PATCH (e.g. 1.0.0).`,
            severity: "warning",
        });
    }
}

/** Flags dependency-field lines missing the `:` separator, e.g. "Imports dplyr". */
function checkMissingColons(content: string, issues: DescriptionIssue[]): void {
    content.split(/\r?\n/).forEach((line, index) => {
        const fieldName = DEPENDENCY_FIELDS.find((name) => line.startsWith(name));
        if (fieldName && MISSING_COLON_PATTERN.test(line)) {
            issues.push({
                line: index,
                message: `"${fieldName}" is missing a colon — did you mean "${fieldName}: ..."?`,
                severity: "error",
            });
        }
    });
}
