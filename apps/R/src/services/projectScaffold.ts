export type ProjectTier = "L0" | "L1" | "L2";

export interface ScaffoldFile {
    readonly relativePath: string;
    readonly content: string;
}

/** Builds the ".Rproj" file contents (RStudio-compatible defaults). Pure. */
export function buildRprojContent(): string {
    return [
        "Version: 1.0",
        "",
        "RestoreWorkspace: Default",
        "SaveWorkspace: Default",
        "AlwaysSaveHistory: Default",
        "",
        "EnableCodeIndexing: Yes",
        "Encoding: UTF-8",
        "",
        "RnwWeave: Sweave",
        "LaTeX: pdfLaTeX",
        "",
    ].join("\n");
}

/** Builds the ".Rprofile" contents, always setting UTF-8 per R-DOMAIN §3.4. Pure. */
export function buildRprofileContent(): string {
    return ['options(encoding = "UTF-8")', ""].join("\n");
}

/** Decides which files a given tier scaffolds. Pure — L2 additionally runs `renv::init()`,
 *  which is a side effect handled by ProjectCreatorService, not by this planner. */
export function planScaffoldFiles(tier: ProjectTier, entryFileName: string): ScaffoldFile[] {
    if (tier === "L0") return [{ relativePath: entryFileName, content: "" }];

    return [
        { relativePath: entryFileName, content: "" },
        { relativePath: "project.Rproj", content: buildRprojContent() },
        { relativePath: ".Rprofile", content: buildRprofileContent() },
    ];
}
