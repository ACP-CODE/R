import * as vscode from "vscode";
import type { ProjectCreatorService, ProjectTier } from "../services/projectCreator.service";
import type { REnvironmentService } from "../services/rEnvironment.service";

const TIER_OPTIONS: { label: string; description: string; tier: ProjectTier }[] = [
    { label: "L0 — Script only", description: "Just a .R file, no config", tier: "L0" },
    { label: "L1 — Standard project", description: ".Rproj + .Rprofile", tier: "L1" },
    { label: "L2 — Industrial project", description: "L1 + renv::init()", tier: "L2" },
];

export function registerCreateProjectCommand(
    context: vscode.ExtensionContext,
    projectCreator: ProjectCreatorService,
    rEnvironment: REnvironmentService,
): void {
    const disposable = vscode.commands.registerCommand("r.createProject", async () => {
        const tier = await pickTier();
        if (!tier) return;

        const folder = await pickTargetFolder();
        if (!folder) return;

        await runCreation(tier, folder, projectCreator, rEnvironment);
    });
    context.subscriptions.push(disposable);
}

async function pickTier(): Promise<ProjectTier | undefined> {
    const picked = await vscode.window.showQuickPick(TIER_OPTIONS, {
        placeHolder: "Choose a project tier",
    });
    return picked?.tier;
}

async function pickTargetFolder(): Promise<vscode.Uri | undefined> {
    const picked = await vscode.window.showOpenDialog({
        canSelectFolders: true,
        canSelectFiles: false,
        canSelectMany: false,
        openLabel: "Create project here",
    });
    return picked?.[0];
}

async function runCreation(
    tier: ProjectTier,
    folder: vscode.Uri,
    projectCreator: ProjectCreatorService,
    rEnvironment: REnvironmentService,
): Promise<void> {
    const rExecutable = await rEnvironment.resolveExecutable();
    const result = await projectCreator.createProject(
        folder,
        tier,
        rExecutable.kind === "ok" ? rExecutable.value : undefined,
    );

    if (result.kind === "err") {
        void vscode.window.showErrorMessage(`R: Create Project failed — ${result.error.message}`);
        return;
    }
    void vscode.window
        .showInformationMessage(`R project (${tier}) created.`, "Open Folder")
        .then((choice) => {
            if (choice === "Open Folder")
                void vscode.commands.executeCommand("vscode.openFolder", folder);
        });
}
