export interface RbuildignoreIssue {
    readonly line: number;
    readonly message: string;
}

/** Validates each non-empty line of an .Rbuildignore file as a POSIX-ish regular expression.
 *  Pure function — no VS Code / R dependency, fully unit-testable. */
export function validateRbuildignore(content: string): RbuildignoreIssue[] {
    const issues: RbuildignoreIssue[] = [];
    const lines = content.split(/\r?\n/);

    lines.forEach((rawLine, index) => {
        const line = rawLine.trim();
        if (line.length === 0 || line.startsWith("#")) return;
        validateSingleLine(line, index, issues);
    });

    return dedupeConsecutiveBlankLineWarning(lines, issues);
}

function validateSingleLine(line: string, index: number, issues: RbuildignoreIssue[]): void {
    try {
        new RegExp(line);
    } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        issues.push({ line: index, message: `Invalid regular expression: ${detail}` });
    }
}

/** Flags 2+ consecutive blank lines (R-DOMAIN §2.6 quick-fix table). */
function dedupeConsecutiveBlankLineWarning(
    lines: string[],
    issues: RbuildignoreIssue[],
): RbuildignoreIssue[] {
    let blankRun = 0;
    lines.forEach((rawLine, index) => {
        if (rawLine.trim().length === 0) {
            blankRun += 1;
            if (blankRun === 2)
                issues.push({ line: index, message: "Remove redundant blank line." });
        } else {
            blankRun = 0;
        }
    });
    return issues;
}
