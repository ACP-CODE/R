import type { PackageJsonShape } from "./types.ts";
import { localize } from "./nls.ts";

/**
 * Render the README's Features section straight from package.json#contributes —
 * commands / views / viewsWelcome / walkthroughs. Any new contribution shows up
 * automatically on the next docs:update; there's no separate list to remember to update.
 */
export function generateFeaturesSection(
    pkg: PackageJsonShape,
    nlsMap: Record<string, string>,
): string {
    const c = pkg.contributes;
    const sections: string[] = [];

    const commands = c?.commands ?? [];
    if (commands.length > 0) {
        const rows = [...commands]
            .sort((a, b) => a.command.localeCompare(b.command))
            .map(
                (cmd) =>
                    `| \`${cmd.command}\` | ${localize(cmd.title, nlsMap)} | ${cmd.category ?? "-"} |`,
            );
        sections.push(
            [
                "### Commands",
                "",
                "| Command | Title | Category |",
                "| --- | --- | --- |",
                ...rows,
            ].join("\n"),
        );
    }

    const viewEntries = Object.entries(c?.views ?? {}).flatMap(([container, views]) =>
        views.map((v) => ({ container, ...v })),
    );
    if (viewEntries.length > 0) {
        const rows = viewEntries.map((v) => `| ${localize(v.name, nlsMap)} | \`${v.container}\` |`);
        sections.push(
            ["### Views", "", "| View | Container |", "| --- | --- |", ...rows].join("\n"),
        );
    }

    const walkthroughs = c?.walkthroughs ?? [];
    if (walkthroughs.length > 0) {
        const items = walkthroughs.map((w) => {
            const title = localize(w.title, nlsMap);
            const description = localize(w.description, nlsMap);
            return description ? `- **${title}** — ${description}` : `- **${title}**`;
        });
        sections.push(["### Walkthroughs", "", ...items].join("\n"));
    }

    if (sections.length === 0) {
        return "_This extension does not contribute any commands, views, or walkthroughs yet._\n";
    }

    return `${sections.join("\n\n")}\n`;
}
