import * as vscode from "vscode";
import type { REnvironmentService } from "../services/rEnvironment.service";

export function registerInstallRPackagesCommand(
    context: vscode.ExtensionContext,
    rEnvironment: REnvironmentService,
): void {
    const disposable = vscode.commands.registerCommand("r.installRPackages", async () => {
        const rExecutable = await rEnvironment.resolveExecutable();
        if (rExecutable.kind === "err") {
            void vscode.window.showErrorMessage(`R: ${rExecutable.error.message}`);
            return;
        }

        const missing = await rEnvironment.listMissingPackages(rExecutable.value);
        if (missing.kind === "err") {
            void vscode.window.showErrorMessage(`R: ${missing.error.message}`);
            return;
        }
        if (missing.value.length === 0) {
            void vscode.window.showInformationMessage(
                "R: all required packages are already installed.",
            );
            return;
        }

        await installWithConfirmation(rEnvironment, rExecutable.value, missing.value);
    });
    context.subscriptions.push(disposable);
}

async function installWithConfirmation(
    rEnvironment: REnvironmentService,
    rExecutable: string,
    missing: string[],
): Promise<void> {
    const choice = await vscode.window.showInformationMessage(
        `R: install missing packages (${missing.join(", ")})?`,
        "Install",
        "Cancel",
    );
    if (choice !== "Install") return;

    const result = await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: "Installing R packages…" },
        () => rEnvironment.installPackages(rExecutable, missing),
    );
    if (result.kind === "ok") void vscode.window.showInformationMessage("R: packages installed.");
    else void vscode.window.showErrorMessage(`R: install failed — ${result.error.message}`);
}
