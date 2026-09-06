import * as vscode from "vscode";
import { REnvironmentService } from "./services/rEnvironment.service";
import { LspClientService } from "./services/lspClient.service";
import { RFormattingProvider } from "./services/formatProvider.service";
import { EcosystemDiagnosticsService } from "./services/ecosystemDiagnostics.service";
import { RTerminalProfileProvider } from "./services/terminalProfile.service";
import { registerAllCommands } from "./commands/index";

/**
 * Activation is assembly-only (CORE.md: ≤15 lines of logic): construct services,
 * register providers/commands, wire events. All behaviour lives in ./services and
 * ./commands.
 */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
    const rEnvironment = new REnvironmentService();
    const lspClient = new LspClientService();
    const diagnostics = new EcosystemDiagnosticsService();
    const resolveRExecutable = () => resolveOptionalRExecutable(rEnvironment);

    context.subscriptions.push(
        diagnostics,
        vscode.languages.registerDocumentFormattingEditProvider(
            "r",
            new RFormattingProvider(resolveRExecutable),
        ),
        vscode.window.registerTerminalProfileProvider(
            "r.terminalProfile",
            new RTerminalProfileProvider(resolveRExecutable),
        ),
        vscode.workspace.onDidSaveTextDocument((doc) => diagnostics.validateDocument(doc)),
        vscode.workspace.onDidOpenTextDocument((doc) => diagnostics.validateDocument(doc)),
        { dispose: () => void lspClient.stop() },
    );

    registerAllCommands(context, { rEnvironment, lspClient, diagnostics });
    await autoStartLanguageServer(rEnvironment, lspClient);
}

export function deactivate(): Promise<void> {
    return Promise.resolve();
}

async function resolveOptionalRExecutable(
    rEnvironment: REnvironmentService,
): Promise<string | undefined> {
    const result = await rEnvironment.resolveExecutable();
    return result.kind === "ok" ? result.value : undefined;
}

/** Starts the LSP only when an R file is already open, matching the "onLanguage" activation event (§8.2 decision A). */
async function autoStartLanguageServer(
    rEnvironment: REnvironmentService,
    lspClient: LspClientService,
): Promise<void> {
    const hasOpenRFile = vscode.workspace.textDocuments.some((doc) => doc.languageId === "r");
    if (!hasOpenRFile) return;

    const rExecutable = await rEnvironment.resolveExecutable();
    if (rExecutable.kind === "err") {
        void vscode.window.showWarningMessage(
            `R: language server not started — ${rExecutable.error.message}`,
        );
        return;
    }
    const started = await lspClient.start(rExecutable.value);
    if (started.kind === "err")
        void vscode.window.showWarningMessage(
            `R: language server failed — ${started.error.message}`,
        );
}
