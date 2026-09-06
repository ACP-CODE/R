import * as vscode from "vscode";
import type { EcosystemDiagnosticsService } from "../services/ecosystemDiagnostics.service";

export function registerValidateProjectFilesCommand(
    context: vscode.ExtensionContext,
    diagnostics: EcosystemDiagnosticsService,
): void {
    const disposable = vscode.commands.registerCommand("r.validateProjectFiles", async () => {
        diagnostics.validateAllOpenDocuments();
        await openEcosystemFilesInWorkspace();
        void vscode.window.showInformationMessage("R: validated DESCRIPTION and .Rbuildignore.");
    });
    context.subscriptions.push(disposable);
}

/** Opens ecosystem files that exist but weren't already loaded, so their diagnostics get computed. */
async function openEcosystemFilesInWorkspace(): Promise<void> {
    const matches = await vscode.workspace.findFiles(
        "{DESCRIPTION,.Rbuildignore}",
        "**/node_modules/**",
        10,
    );
    for (const uri of matches) {
        await vscode.workspace.openTextDocument(uri);
    }
}
