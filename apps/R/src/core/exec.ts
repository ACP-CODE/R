import { execFile, type ExecFileException } from "node:child_process";
import { type Result, ok, err } from "./result";

export interface ExecFailure {
    readonly reason: "spawn-failed" | "non-zero-exit" | "timeout";
    readonly message: string;
    readonly stderr?: string;
}

export interface ExecOptions {
    readonly cwd?: string;
    readonly timeoutMs?: number;
    /** Text written to the child process's stdin before it's closed (e.g. piping code to Rscript). */
    readonly input?: string;
}

/** Runs `command args...` and resolves with stdout, never throws. */
export async function runCommand(
    command: string,
    args: string[],
    options: ExecOptions = {},
): Promise<Result<string, ExecFailure>> {
    return new Promise((resolve) => {
        const child = execFile(
            command,
            args,
            { cwd: options.cwd, timeout: options.timeoutMs ?? 15_000 },
            (error, stdout, stderr) => {
                if (!error) return resolve(ok(stdout.toString()));
                resolve(err(toExecFailure(error, stderr?.toString())));
            },
        );
        if (options.input !== undefined && child.stdin) {
            child.stdin.write(options.input);
            child.stdin.end();
        }
    });
}

function toExecFailure(error: ExecFileException, stderr?: string): ExecFailure {
    if (error.killed) return { reason: "timeout", message: error.message, stderr };
    if (error.code === "ENOENT")
        return {
            reason: "spawn-failed",
            message: `Executable not found: ${error.message}`,
            stderr,
        };
    return { reason: "non-zero-exit", message: error.message, stderr };
}
