import * as vscode from "vscode";
import type { LspClientService } from "../services/lspClient.service";
import type { REnvironmentService } from "../services/rEnvironment.service";

export function registerRestartLanguageServerCommand(
    context: vscode.ExtensionContext,
    lspClient: LspClientService,
    rEnvironment: REnvironmentService,
): void {
    const disposable = vscode.commands.registerCommand("r.restartLanguageServer", async () => {
        const rExecutable = await rEnvironment.resolveExecutable();
        if (rExecutable.kind === "err") {
            void vscode.window.showErrorMessage(
                `R: cannot restart language server — ${rExecutable.error.message}`,
            );
            return;
        }

        const started = await lspClient.start(rExecutable.value);
        reportStartResult(started);
    });
    context.subscriptions.push(disposable);
}

function reportStartResult(started: Awaited<ReturnType<LspClientService["start"]>>): void {
    if (started.kind === "ok") {
        void vscode.window.showInformationMessage("R language server restarted.");
        return;
    }
    const hint = started.error.isKnownStartupError
        ? " Make sure the `languageserver` R package is installed (`R: Install R Packages`)."
        : "";
    void vscode.window.showErrorMessage(
        `R: language server failed to start — ${started.error.message}.${hint}`,
    );
}
