import type { PackageJsonShape } from "./types.ts";

/**
 * Parse a GitHub owner/repo out of package.json#repository. Handles the
 * common shapes: "git+https://github.com/x/y.git", "https://github.com/x/y",
 * "git@github.com:x/y.git". Returns null when it can't — callers should skip
 * every GitHub-API-backed section rather than throw.
 */
export function parseGitHubRepo(
    repository: PackageJsonShape["repository"],
): { owner: string; repo: string } | null {
    const url = typeof repository === "string" ? repository : repository?.url;
    if (!url) return null;

    const match = url.match(/github\.com[/:]([^/]+)\/([^/.]+?)(?:\.git)?\/?$/);
    return match ? { owner: match[1], repo: match[2] } : null;
}
