import * as vscode from "vscode";

export function registerFormatDocumentCommand(context: vscode.ExtensionContext): void {
    const disposable = vscode.commands.registerCommand("r.formatDocument", async () => {
        await vscode.commands.executeCommand("editor.action.formatDocument");
    });
    context.subscriptions.push(disposable);
}
