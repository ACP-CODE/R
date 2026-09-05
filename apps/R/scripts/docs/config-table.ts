import type { ConfigProperty, PackageJsonShape } from "./types.ts";
import { localize } from "./nls.ts";

interface ConfigRow {
    key: string;
    defaultValue: string;
    possibleValues: string;
    description: string;
}

function formatDefaultValue(value: unknown): string {
    if (value === null) return "`null`";
    if (typeof value === "boolean" || typeof value === "string" || typeof value === "number")
        return `\`${value}\``;
    if (typeof value === "object") return Array.isArray(value) ? "`[]`" : "`{}`";
    return "-";
}

function getTypeString(type: string | string[]): string {
    if (!type) return "-";
    if (type === "boolean") return "`true` \\| `false`";
    if (type === "string") return "`<string>`";
    if (type === "number") return "`<number>`";
    if (type === "object") return "`Record<string, string>`";
    if (Array.isArray(type)) return type.map((t) => getTypeString(t)).join(" \\| ");
    return `\`<${type}>\``;
}

function getPossibleValues(value: ConfigProperty): string {
    if (value.enum) return value.enum.map((v) => `\`${v}\``).join(" \\| ");
    if (!value.type) return "-";
    if (value.additionalProperties) {
        const types = Array.isArray(value.type) ? value.type : [value.type];
        return types
            .map((t) => (t === "object" ? "`Record<string, object>`" : getTypeString(t)))
            .join(" \\| ");
    }
    return getTypeString(value.type);
}

function cleanMarkdownForTable(text: string): string {
    return text
        .split("\n")
        .map((line) => line.trim())
        .join(" ")
        .trim();
}

function generateTable(configs: ConfigRow[], deprecatedConfigs: ConfigRow[]): string {
    let output = "| Key | Default Value | Possible Values | Description |\n";
    output += "| --- | ------------- | --------------- | ----------- |\n";

    for (const config of configs) {
        output += `| \`${config.key}\` | ${config.defaultValue} | ${config.possibleValues} | ${cleanMarkdownForTable(config.description)} |\n`;
    }

    if (deprecatedConfigs.length > 0) {
        output += "| Deprecated | | | |\n";
        for (const config of deprecatedConfigs) {
            output += `| \`${config.key}\` | ${config.defaultValue} | ${config.possibleValues} | ${cleanMarkdownForTable(config.description)} |\n`;
        }
    }

    return output;
}

/**
 * Render the Configuration section from package.json#contributes.configuration.properties.
 * Falls back to a short note when the extension declares no settings, instead of two empty tables.
 */
export function generateConfigurationDocs(
    pkg: PackageJsonShape,
    nlsMap: Record<string, string>,
): string {
    const properties = Object.entries(pkg.contributes?.configuration?.properties ?? {}).sort(
        ([a], [b]) => a.localeCompare(b),
    );

    if (properties.length === 0) {
        return "_This extension does not contribute any settings yet._\n";
    }

    const windowConfigs: ConfigRow[] = [];
    const windowDeprecated: ConfigRow[] = [];
    const workspaceConfigs: ConfigRow[] = [];
    const workspaceDeprecated: ConfigRow[] = [];

    for (const [key, value] of properties) {
        const row: ConfigRow = {
            key,
            defaultValue: formatDefaultValue(value.default),
            possibleValues: getPossibleValues(value),
            description: localize(value.markdownDescription ?? value.description, nlsMap),
        };
        const bucket =
            value.scope === "window"
                ? value.deprecated
                    ? windowDeprecated
                    : windowConfigs
                : value.deprecated
                  ? workspaceDeprecated
                  : workspaceConfigs;
        bucket.push(row);
    }

    let output = "\n### Window Configuration\n\n";
    output +=
        "These settings apply to the whole window and are configured via `settings.json`:\n\n";
    output += generateTable(windowConfigs, windowDeprecated);

    output += "\n### Workspace Configuration\n\n";
    output += "These settings can be overridden per workspace via `settings.json`:\n\n";
    output += generateTable(workspaceConfigs, workspaceDeprecated);

    return output;
}
