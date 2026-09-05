#!/usr/bin/env node
/**
 * apps/vscode/scripts/docs/index.ts
 *
 * Entry point for `pnpm --filter extension run docs:update`. Rewrites a few
 * marked sections of README.md:
 *
 *   - Features / Configuration: derived purely from package.json, so the
 *     same input always produces the same output. Safe for PR-level CI.
 *   - Contributors / Sponsors: call the GitHub API, so they depend on the
 *     network and can be rate-limited. Skip them with --no-dynamic (or
 *     DOCS_SKIP_DYNAMIC=true) for deterministic CI checks; run the full
 *     command from a scheduled job that has a GITHUB_TOKEN instead.
 *
 * Usage:
 *   node scripts/docs/index.ts update [--no-dynamic]
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { PackageJsonShape, Avatar } from "./types.ts";
import { loadNlsMap } from "./nls.ts";
import { generateConfigurationDocs } from "./config-table.ts";
import { generateFeaturesSection } from "./features.ts";
import { replaceMarkerSection } from "./readme.ts";
import { parseGitHubRepo } from "./repo.ts";
import { fetchContributors } from "./contributors.ts";
import { fetchGitHubSponsors } from "./sponsors.ts";
import { renderAvatarGridSvg } from "./svg.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
// scripts/docs/index.ts -> apps/vscode
const PKG_ROOT = join(__dirname, "..", "..");
const README_PATH = join(PKG_ROOT, "README.md");
const DOCS_ASSETS_DIR = join(PKG_ROOT, "docs");

function readPackageJson(): PackageJsonShape {
    return JSON.parse(readFileSync(join(PKG_ROOT, "package.json"), "utf-8")) as PackageJsonShape;
}

function writeSvgAsset(filename: string, svg: string): void {
    if (!existsSync(DOCS_ASSETS_DIR)) mkdirSync(DOCS_ASSETS_DIR, { recursive: true });
    writeFileSync(join(DOCS_ASSETS_DIR, filename), svg, "utf-8");
}

function renderAvatarSection(imageAlt: string, imagePath: string, people: Avatar[]): string {
    const links = people.map((p) => `[@${p.login}](${p.htmlUrl})`).join(" · ");
    return `![${imageAlt}](./${imagePath})\n\n${links}\n`;
}

async function buildContributorsSection(owner: string, repo: string): Promise<string | null> {
    const contributors = await fetchContributors(owner, repo);
    if (contributors === null) return null; // network/rate-limit failure: leave the README section untouched
    if (contributors.length === 0) return "_Be the first to contribute!_\n";

    writeSvgAsset("contributors.svg", renderAvatarGridSvg(contributors));
    return renderAvatarSection("Contributors", "docs/contributors.svg", contributors);
}

async function buildSponsorsSection(owner: string, pkg: PackageJsonShape): Promise<string | null> {
    const sponsors = await fetchGitHubSponsors(owner);
    if (sponsors && sponsors.length > 0) {
        writeSvgAsset("sponsors.svg", renderAvatarGridSvg(sponsors));
        return renderAvatarSection("Sponsors", "docs/sponsors.svg", sponsors);
    }
    // No data (no token / query failed / genuinely no sponsors yet) — fall back to the static link.
    return pkg.sponsor?.url ? `[❤️ Sponsor this project](${pkg.sponsor.url})\n` : null;
}

async function updateReadme(skipDynamic: boolean): Promise<void> {
    const pkg = readPackageJson();
    const nlsMap = loadNlsMap(PKG_ROOT);
    let readme = readFileSync(README_PATH, "utf-8");

    readme = replaceMarkerSection(readme, "CONFIGURATION", generateConfigurationDocs(pkg, nlsMap));
    readme = replaceMarkerSection(readme, "FEATURES", generateFeaturesSection(pkg, nlsMap));

    if (!skipDynamic) {
        const repoInfo = parseGitHubRepo(pkg.repository);
        if (!repoInfo) {
            console.warn(
                "⚠️ Could not parse a GitHub owner/repo from package.json#repository — skipping Contributors/Sponsors.",
            );
        } else {
            const contributorsSection = await buildContributorsSection(
                repoInfo.owner,
                repoInfo.repo,
            );
            if (contributorsSection !== null)
                readme = replaceMarkerSection(readme, "CONTRIBUTORS", contributorsSection);

            const sponsorsSection = await buildSponsorsSection(repoInfo.owner, pkg);
            if (sponsorsSection !== null)
                readme = replaceMarkerSection(readme, "SPONSORS", sponsorsSection);
        }
    }

    writeFileSync(README_PATH, readme, "utf-8");
    console.log(
        `✅ README.md updated${skipDynamic ? " (static mode — Contributors/Sponsors skipped)" : ""}`,
    );
}

async function main(): Promise<void> {
    const args = process.argv.slice(2);
    if (args[0] !== "update") {
        console.error("Usage: node scripts/docs/index.ts update [--no-dynamic]");
        process.exit(1);
    }

    const skipDynamic = args.includes("--no-dynamic") || process.env.DOCS_SKIP_DYNAMIC === "true";
    await updateReadme(skipDynamic);
}

main().catch((err: unknown) => {
    console.error(err);
    process.exit(1);
});
