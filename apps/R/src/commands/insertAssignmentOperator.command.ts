import * as vscode from "vscode";

/**
 * Registers `r.insertAssignmentOperator`.
 *
 * `<-` is R's idiomatic assignment operator, but it's three keystrokes with an
 * awkward shift. RStudio binds Alt/Option+- to insert " <- " for this reason;
 * we do the same via a command + default keybinding (see package.json) rather
 * than trying to shoehorn it into language-configuration.json's auto-closing-pair
 * mechanism, which only handles brackets/quotes, not arbitrary operators.
 */
export function registerInsertAssignmentOperatorCommand(context: vscode.ExtensionContext): void {
    const disposable = vscode.commands.registerCommand("r.insertAssignmentOperator", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        await editor.edit((editBuilder) => {
            for (const selection of editor.selections) {
                editBuilder.replace(selection, " <- ");
            }
        });
    });
    context.subscriptions.push(disposable);
}
