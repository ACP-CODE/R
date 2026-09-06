import * as vscode from "vscode";

/** Resolves the "R" terminal profile contribution into an interactive R console. */
export class RTerminalProfileProvider implements vscode.TerminalProfileProvider {
    constructor(private readonly resolveRExecutable: () => Promise<string | undefined>) {}

    public async provideTerminalProfile(): Promise<vscode.TerminalProfile | undefined> {
        const rExecutable = await this.resolveRExecutable();
        if (!rExecutable) {
            void vscode.window.showWarningMessage(
                "R executable not found. Set `R.rpath.executable` or install R first.",
            );
            return undefined;
        }
        return new vscode.TerminalProfile({
            name: "R",
            shellPath: rExecutable,
            shellArgs: ["--no-save"],
        });
    }
}
