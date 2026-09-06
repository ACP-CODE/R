import * as vscode from "vscode";
import { type Result, ok, err } from "../core/result";
import { runCommand } from "../core/exec";
import { type ProjectTier, type ScaffoldFile, planScaffoldFiles } from "./projectScaffold";

export type { ProjectTier } from "./projectScaffold";

export interface ProjectCreationFailure {
    readonly message: string;
}

/** Creates the files for the given tier under `targetFolder`, running `renv::init()` for L2 via R. */
export class ProjectCreatorService {
    public async createProject(
        targetFolder: vscode.Uri,
        tier: ProjectTier,
        rExecutable: string | undefined,
    ): Promise<Result<void, ProjectCreationFailure>> {
        const files = planScaffoldFiles(tier, "main.R");
        const writeResult = await this.writeFiles(targetFolder, files);
        if (writeResult.kind === "err") return writeResult;

        if (tier === "L2") return this.initRenv(targetFolder, rExecutable);
        return ok(undefined);
    }

    private async writeFiles(
        targetFolder: vscode.Uri,
        files: ScaffoldFile[],
    ): Promise<Result<void, ProjectCreationFailure>> {
        try {
            for (const file of files) {
                const uri = vscode.Uri.joinPath(targetFolder, file.relativePath);
                await vscode.workspace.fs.writeFile(uri, Buffer.from(file.content, "utf8"));
            }
            return ok(undefined);
        } catch (error) {
            return err({ message: `Failed to write project files: ${String(error)}` });
        }
    }

    private async initRenv(
        targetFolder: vscode.Uri,
        rExecutable: string | undefined,
    ): Promise<Result<void, ProjectCreationFailure>> {
        if (!rExecutable)
            return err({ message: "R executable not found; cannot run renv::init()." });

        const result = await runCommand(rExecutable, ["--slave", "-e", "renv::init()"], {
            cwd: targetFolder.fsPath,
            timeoutMs: 120_000,
        });
        return result.kind === "ok"
            ? ok(undefined)
            : err({ message: `renv::init() failed: ${result.error.message}` });
    }
}
