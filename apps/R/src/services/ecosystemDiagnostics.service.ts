import * as vscode from "vscode";
import { validateDescription } from "./descriptionValidator";
import { validateRbuildignore } from "./rbuildignoreValidator";

const DIAGNOSTIC_SOURCE = "R (ecosystem)";

/** Publishes DESCRIPTION / .Rbuildignore diagnostics, mirroring package.json's JSON validation UX. */
export class EcosystemDiagnosticsService implements vscode.Disposable {
    private readonly collection = vscode.languages.createDiagnosticCollection("r-ecosystem");

    public validateDocument(document: vscode.TextDocument): void {
        const fileName = document.fileName.split(/[\\/]/).pop() ?? "";
        if (fileName === "DESCRIPTION")
            return this.publish(document, this.diagnoseDescription(document));
        if (fileName === ".Rbuildignore")
            return this.publish(document, this.diagnoseRbuildignore(document));
    }

    public validateAllOpenDocuments(): void {
        for (const document of vscode.workspace.textDocuments) this.validateDocument(document);
    }

    private diagnoseDescription(document: vscode.TextDocument): vscode.Diagnostic[] {
        return validateDescription(document.getText()).map(
            (issue) =>
                new vscode.Diagnostic(
                    lineRange(document, issue.line),
                    issue.message,
                    issue.severity === "error"
                        ? vscode.DiagnosticSeverity.Error
                        : vscode.DiagnosticSeverity.Warning,
                ),
        );
    }

    private diagnoseRbuildignore(document: vscode.TextDocument): vscode.Diagnostic[] {
        return validateRbuildignore(document.getText()).map(
            (issue) =>
                new vscode.Diagnostic(
                    lineRange(document, issue.line),
                    issue.message,
                    vscode.DiagnosticSeverity.Warning,
                ),
        );
    }

    private publish(document: vscode.TextDocument, diagnostics: vscode.Diagnostic[]): void {
        diagnostics.forEach((d) => (d.source = DIAGNOSTIC_SOURCE));
        this.collection.set(document.uri, diagnostics);
    }

    public dispose(): void {
        this.collection.dispose();
    }
}

function lineRange(document: vscode.TextDocument, line: number): vscode.Range {
    const clamped = Math.min(line, Math.max(document.lineCount - 1, 0));
    return document.lineAt(clamped).range;
}
