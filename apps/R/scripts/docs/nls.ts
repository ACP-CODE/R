import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Load the English localization map (package.nls.json). Missing or invalid
 * file is not fatal — this one file isn't worth failing the whole
 * docs:update run over, so we warn and return an empty map instead.
 */
export function loadNlsMap(pkgRoot: string): Record<string, string> {
    try {
        const content = readFileSync(join(pkgRoot, "package.nls.json"), "utf-8");
        return JSON.parse(content) as Record<string, string>;
    } catch (err) {
        console.warn("⚠️ package.nls.json not found or invalid, skipping localization.", err);
        return {};
    }
}

/** Resolve a "%key%" placeholder against the nls map; anything else passes through unchanged. */
export function localize(text: string | undefined, nlsMap: Record<string, string>): string {
    if (!text) return "";
    const match = text.match(/^%(.+)%$/);
    return match && nlsMap[match[1]] ? nlsMap[match[1]] : text;
}
