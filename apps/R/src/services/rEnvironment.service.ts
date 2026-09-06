import * as vscode from "vscode";
import { type Result, ok, err } from "../core/result";
import { detectRExecutable } from "../platform/detectR";
import {
    findMissingPackages,
    buildInstallExpression,
    REQUIRED_R_PACKAGES,
} from "../platform/rPackages";
import { runCommand } from "../core/exec";

export interface REnvironmentFailure {
    readonly message: string;
}

/** Owns "where is R / what does it have installed" so every other service asks this one thing. */
export class REnvironmentService {
    private cachedPath: string | undefined;

    public async resolveExecutable(): Promise<Result<string, REnvironmentFailure>> {
        const configured = vscode.workspace.getConfiguration("R").get<string>("rpath.executable");
        if (configured && configured.trim().length > 0) return ok((this.cachedPath = configured));
        if (this.cachedPath) return ok(this.cachedPath);

        const detected = await detectRExecutable();
        if (detected.kind === "err") return err({ message: detected.error.message });

        this.cachedPath = detected.value;
        return ok(detected.value);
    }

    public async listMissingPackages(
        rExecutable: string,
    ): Promise<Result<string[], REnvironmentFailure>> {
        const result = await findMissingPackages(rExecutable, REQUIRED_R_PACKAGES);
        return result.kind === "ok" ? ok(result.value) : err({ message: result.error.message });
    }

    public async installPackages(
        rExecutable: string,
        packages: readonly string[],
    ): Promise<Result<void, REnvironmentFailure>> {
        const expression = buildInstallExpression(packages);
        const result = await runCommand(rExecutable, ["--slave", "-e", expression], {
            timeoutMs: 180_000,
        });
        return result.kind === "ok"
            ? ok(undefined)
            : err({ message: `Package installation failed: ${result.error.message}` });
    }

    /** Clears the cached path, used after the user edits R.rpath.executable or reinstalls R. */
    public invalidateCache(): void {
        this.cachedPath = undefined;
    }
}
