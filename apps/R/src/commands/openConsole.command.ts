import * as vscode from "vscode";
import type { REnvironmentService } from "../services/rEnvironment.service";

/**
 * Registers `r.openConsole`.
 *
 * The walkthrough's "Open R Terminal" button previously linked to the built-in
 * `workbench.action.terminal.newWithProfile` command with a guessed argument shape.
 * That command's argument contract isn't part of our contract surface (it can change
 * between VS Code versions, and a markdown command-link has no way to report a
 * silent failure back to us). Owning the command ourselves means we control the
 * whole path: resolve R -> create the terminal -> show it -> report a clear error
 * if R can't be found, instead of a button that silently does nothing.
 */
export function registerOpenConsoleCommand(
    context: vscode.ExtensionContext,
    rEnvironment: REnvironmentService,
): void {
    const disposable = vscode.commands.registerCommand("r.openConsole", async () => {
        const rExecutable = await rEnvironment.resolveExecutable();
        if (rExecutable.kind === "err") {
            void vscode.window.showErrorMessage(
                `R: could not open console — ${rExecutable.error.message}. ` +
                    "Set `R.rpath.executable` in Settings if R is installed in a non-standard location.",
            );
            return;
        }

        const terminal = vscode.window.createTerminal({
            name: "R",
            shellPath: rExecutable.value,
            shellArgs: ["--no-save"],
        });
        terminal.show();
    });
    context.subscriptions.push(disposable);
}
