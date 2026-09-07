import type { ProjectTier } from "../projectScaffold";

export interface ProjectTierOption {
    readonly tier: ProjectTier;
    readonly label: string;
    readonly description: string;
    readonly detail: string;
    /** Codicon id (no `$()` wrapper), rendered via vscode.ThemeIcon by the caller. */
    readonly iconId: string;
    /** Docs the "?" button opens so a beginner can learn what this tier actually gives them. */
    readonly helpUrl: string;
}

/**
 * Data for the "项目类型" group in `r.createProject`'s QuickPick (R-DOMAIN §9.1).
 *
 * This is the first (and currently only) group. Template selection (R-DOMAIN §9.2,
 * not yet implemented) will add a second "模板" group below this one, pushed after
 * its own QuickPickItemKind.Separator — see createProjectQuickPick.ts.
 */
export const PROJECT_TIER_OPTIONS: readonly ProjectTierOption[] = [
    {
        tier: "L0",
        label: "L0 — 裸奔脚本",
        description: "仅创建一个 .R 文件",
        detail: "适合快速测试、跟着入门课程练手，没有任何额外配置。",
        iconId: "file",
        helpUrl: "https://cran.r-project.org/doc/manuals/r-release/R-intro.html",
    },
    {
        tier: "L1",
        label: "L1 — 标准项目",
        description: ".Rproj + .Rprofile",
        detail: "生成固定工作目录与 UTF-8 编码配置，日常数据分析项目的起点。",
        iconId: "folder",
        helpUrl: "https://support.posit.co/hc/en-us/articles/200526207-Using-Projects",
    },
    {
        tier: "L2",
        label: "L2 — 工业级项目",
        description: "L1 + renv::init()",
        detail: "额外生成 renv.lock 锁定依赖版本，适合团队协作与生产级项目。",
        iconId: "package",
        helpUrl: "https://rstudio.github.io/renv/articles/renv.html",
    },
] as const;
