import * as vscode from "vscode";
import { runCommand } from "../core/exec";

/** Builds the Rscript expression that runs styler on stdin and prints the styled code. Pure. */
export function buildStyleExpression(): string {
    return 'cat(styler::style_text(readLines("stdin")), sep = "\\n")';
}

/** Formats a whole document by piping its text through `styler::style_text()`. */
export class RFormattingProvider implements vscode.DocumentFormattingEditProvider {
    constructor(private readonly resolveRExecutable: () => Promise<string | undefined>) {}

    public async provideDocumentFormattingEdits(
        document: vscode.TextDocument,
    ): Promise<vscode.TextEdit[]> {
        const rExecutable = await this.resolveRExecutable();
        if (!rExecutable) return [];

        const styled = await this.styleText(rExecutable, document.getText());
        if (styled.kind === "err") return [];

        const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(document.getText().length),
        );
        return [vscode.TextEdit.replace(fullRange, styled.value)];
    }

    private async styleText(rExecutable: string, source: string) {
        return runCommand(rExecutable, ["--slave", "-e", buildStyleExpression()], {
            input: source,
            timeoutMs: 30_000,
        });
    }
}
