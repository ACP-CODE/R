import * as vscode from "vscode";
import type { REnvironmentService } from "../services/rEnvironment.service";
import type { LspClientService } from "../services/lspClient.service";
import type { EcosystemDiagnosticsService } from "../services/ecosystemDiagnostics.service";
import { ProjectCreatorService } from "../services/projectCreator.service";
import { registerCreateProjectCommand } from "./createProject.command";
import { registerValidateProjectFilesCommand } from "./validateProjectFiles.command";
import { registerRestartLanguageServerCommand } from "./restartLanguageServer.command";
import { registerInstallRPackagesCommand } from "./installRPackages.command";
import { registerFormatDocumentCommand } from "./formatDocument.command";
import { registerOpenConsoleCommand } from "./openConsole.command";
import { registerInsertAssignmentOperatorCommand } from "./insertAssignmentOperator.command";

export interface CommandDependencies {
    readonly rEnvironment: REnvironmentService;
    readonly lspClient: LspClientService;
    readonly diagnostics: EcosystemDiagnosticsService;
}

export function registerAllCommands(
    context: vscode.ExtensionContext,
    deps: CommandDependencies,
): void {
    const projectCreator = new ProjectCreatorService();

    registerCreateProjectCommand(context, projectCreator, deps.rEnvironment);
    registerValidateProjectFilesCommand(context, deps.diagnostics);
    registerRestartLanguageServerCommand(context, deps.lspClient, deps.rEnvironment);
    registerInstallRPackagesCommand(context, deps.rEnvironment);
    registerFormatDocumentCommand(context);
    registerOpenConsoleCommand(context, deps.rEnvironment);
    registerInsertAssignmentOperatorCommand(context);
}
