/**
 * Single source of truth for workspace package discovery.
 *
 * `run.ts` and `vscode-sync.ts` both need the same answer to "what packages
 * exist, where do they live, what kind are they" — this module is the only
 * place that answer is computed, so there is never a second place to keep
 * in sync.
 *
 * Why `pnpm list -r --json` instead of walking pnpm-workspace.yaml globs:
 * a package's folder name and its package.json#name are not guaranteed to
 * match (e.g. `apps/vscode` here is actually named `extension`), and
 * `vpr --filter` matches on the real package name. Reading pnpm's own
 * resolution avoids re-implementing (and getting wrong) pnpm's glob rules.
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

export type PackageKind = "vscode-extension" | "tauri-app" | "web-app" | "library";

export interface WorkspacePackage {
    /** The real package.json#name — what `vpr --filter` matches on. */
    name: string;
    /** Absolute path. */
    path: string;
    /** Path relative to the workspace root, always "/"-separated (for JSON configs like launch.json). */
    relPath: string;
    kind: PackageKind;
    /** This package's own package.json#scripts, used to check whether an action actually exists before dispatching it. */
    scripts: Record<string, string>;
}

interface PnpmListEntry {
    name?: string;
    path: string;
    private?: boolean;
}

interface PackageJsonShape {
    name?: string;
    scripts?: Record<string, string>;
    engines?: Record<string, string>;
    contributes?: unknown;
}

let cache: WorkspacePackage[] | null = null;

/**
 * Classify a package by what it *declares*, not by scanning its filesystem tree.
 *
 * A package is a Tauri app if — and only if — it has a `tauri` script.
 * That's exactly the contract `run.ts` already dispatches on (`vpr --filter <pkg> tauri ...`),
 * so detection and dispatch agree by construction instead of by convention.
 * This also happens to be cheaper than checking for a `src-tauri/` directory:
 * package.json is already being read for `scripts` anyway, so classifying
 * from it costs nothing extra, versus one `existsSync` per candidate kind.
 */
function detectKind(pkgJson: PackageJsonShape): PackageKind {
    if (pkgJson.scripts?.tauri !== undefined) return "tauri-app";
    if (pkgJson.engines?.vscode !== undefined || pkgJson.contributes !== undefined)
        return "vscode-extension";
    if (pkgJson.scripts?.dev) return "web-app";
    return "library";
}

function readPackageJson(pkgPath: string): PackageJsonShape {
    return JSON.parse(readFileSync(join(pkgPath, "package.json"), "utf-8")) as PackageJsonShape;
}

/**
 * List every workspace package except the root. Cached per process — callers
 * can call this as often as they like without spawning `pnpm` more than once.
 */
export function listWorkspacePackages(cwd: string = process.cwd()): WorkspacePackage[] {
    if (cache) return cache;

    let entries: PnpmListEntry[];
    try {
        const raw = execFileSync("pnpm", ["list", "-r", "--depth", "-1", "--json"], {
            cwd,
            encoding: "utf-8",
            stdio: ["ignore", "pipe", "ignore"],
        });
        entries = JSON.parse(raw) as PnpmListEntry[];
    } catch (err) {
        throw new Error(
            `Failed to resolve workspace packages via \`pnpm list -r --json\`. Did you run pnpm install? Original error: ${(err as Error).message}`,
        );
    }

    cache = entries
        .filter((e): e is PnpmListEntry & { name: string } => !!e.name && e.path !== cwd)
        .map((e) => {
            const pkgJson = readPackageJson(e.path);
            return {
                name: e.name,
                path: e.path,
                relPath: relative(cwd, e.path).split(sep).join("/"),
                kind: detectKind(pkgJson),
                scripts: pkgJson.scripts ?? {},
            } satisfies WorkspacePackage;
        });

    return cache;
}

export function findPackageByName(name: string, cwd?: string): WorkspacePackage | undefined {
    return listWorkspacePackages(cwd).find((p) => p.name === name);
}

/** Test-only escape hatch. */
export function __resetWorkspaceCache(): void {
    cache = null;
}
