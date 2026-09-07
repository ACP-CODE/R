import * as vscode from "vscode";
import type { ProjectCreatorService, ProjectTier } from "../services/projectCreator.service";
import type { REnvironmentService } from "../services/rEnvironment.service";
import { pickProjectTier } from "../services/quickpick/createProjectQuickPick";

export function registerCreateProjectCommand(
    context: vscode.ExtensionContext,
    projectCreator: ProjectCreatorService,
    rEnvironment: REnvironmentService,
): void {
    const disposable = vscode.commands.registerCommand("r.createProject", async () => {
        const tier = await pickProjectTier();
        if (!tier) return;

        const folder = await pickTargetFolder();
        if (!folder) return;

        await runCreation(tier, folder, projectCreator, rEnvironment);
    });
    context.subscriptions.push(disposable);
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
