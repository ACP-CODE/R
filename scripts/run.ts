#!/usr/bin/env node
/**
 * scripts/run.ts — the one entry point every command in this monorepo goes through
 * (the "iron rule" in AGENTS.md).
 *
 * This script does exactly one job: resolve which package an action targets, then
 * hand off to `vpr` (`vp run`). It does not know how to build, test, or lint
 * anything — each package owns that logic in its own package.json#scripts, and
 * `vpr` is what actually dispatches into that package's directory and runs it
 * (which is also why you see `~/apps/vscode$ ...` printed before every command —
 * `vpr` always shows you exactly where a command is executing).
 *
 * Usage:
 *   node scripts/run.ts <action> [--target=<packageName> | --app=<packageName>] [...rest]
 *
 * Examples:
 *   node scripts/run.ts watch                          # uses the default target (package.json#config.app)
 *   node scripts/run.ts watch --target=extension       # explicit package name
 *   node scripts/run.ts test:ci -r                     # forwarded straight through to vpr
 */

import { spawnSync } from "node:child_process";
import process from "node:process";
import { listWorkspacePackages, type WorkspacePackage } from "./lib/workspace.ts";

function fail(message: string): never {
    if (message) console.error(message);
    try {
        const pkgs = listWorkspacePackages();
        if (pkgs.length > 0) {
            console.error("\nAvailable packages:");
            for (const p of pkgs) console.error(`  - ${p.name}  (${p.relPath}, ${p.kind})`);
        }
    } catch {
        // Can't resolve packages (e.g. pnpm install hasn't run yet) — the error above still stands.
    }
    process.exit(1);
}

/** The only supported way to pick a target: --target=<name> or --app=<name>. Explicit, no guessing. */
function extractTarget(rest: string[]): { target: string | undefined; extraArgs: string[] } {
    const idx = rest.findIndex((a) => /^--(app|target)=/.test(a));
    if (idx === -1) return { target: process.env.npm_package_config_app, extraArgs: rest };
    return {
        target: rest[idx].split("=")[1],
        extraArgs: [...rest.slice(0, idx), ...rest.slice(idx + 1)],
    };
}

function resolvePackage(name: string | undefined): WorkspacePackage {
    if (!name)
        fail(
            "No target package. Pass --target=<packageName>, or set config.app in the root package.json.",
        );
    const pkg = listWorkspacePackages().find((p) => p.name === name);
    return pkg ?? fail(`No package named "${name}".`);
}

/** Fail fast with the list of what's actually available, instead of `vpr` silently matching nothing. */
function assertScriptExists(pkg: WorkspacePackage, scriptName: string): void {
    if (pkg.scripts[scriptName]) return;
    fail(
        `Package "${pkg.name}" has no "${scriptName}" script.\n` +
            `Available scripts: ${Object.keys(pkg.scripts).join(", ") || "(none)"}`,
    );
}

const [action, ...rest] = process.argv.slice(2);
if (!action || action === "--help" || action === "-h") {
    fail(action ? "" : "Missing <action>. Example: node scripts/run.ts watch --target=extension");
}

const { target, extraArgs } = extractTarget(rest);
const pkg = resolvePackage(target);

const args = ["--filter", pkg.name, "--fail-if-no-match"];

if ((action === "dev" || action === "build") && pkg.kind === "tauri-app") {
    // Tauri apps expose `dev`/`build` through their `tauri` script, not a same-named one of their own.
    assertScriptExists(pkg, "tauri");
    args.push("tauri", action);
} else {
    // Everything else — compile, watch, test, lint, vsce, docs:update, tauri, whatever a package defines —
    // is forwarded as-is. `run.ts` doesn't need to know the full list; the target package's own
    // package.json#scripts is the only place that list has to be maintained.
    assertScriptExists(pkg, action);
    args.push(action);
}

const result = spawnSync("vpr", [...args, ...extraArgs], { stdio: "inherit", shell: true });
process.exit(result.status ?? 1);
