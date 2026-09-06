import * as os from "node:os";
import { type Result, ok, err } from "../core/result";
import { runCommand } from "../core/exec";

export interface RDetectionFailure {
    readonly reason: "not-found" | "lookup-failed";
    readonly message: string;
}

/** Parses `reg query ...\App Paths\R.exe` output into an executable path. Pure — unit-testable. */
export function parseWindowsRegistryOutput(stdout: string): string | undefined {
    const match = stdout.match(/\(Default\)\s+REG_SZ\s+(.+)/i);
    return match?.[1]?.trim();
}

/** Parses `which R` / `which -a R` style output, picking the first non-empty candidate. Pure. */
export function parseWhichOutput(stdout: string): string | undefined {
    const first = stdout
        .split(/\r?\n/)
        .map((line) => line.trim())
        .find((line) => line.length > 0);
    return first;
}

/** Detects the R executable following platform conventions described in R-DOMAIN §2.2.1. */
export async function detectRExecutable(
    platform: NodeJS.Platform = os.platform(),
): Promise<Result<string, RDetectionFailure>> {
    if (platform === "win32") return detectOnWindows();
    return detectOnUnix();
}

async function detectOnWindows(): Promise<Result<string, RDetectionFailure>> {
    const registryResult = await runCommand("reg", [
        "query",
        "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\App Paths\\R.exe",
        "/ve",
    ]);
    if (registryResult.kind === "err")
        return err({
            reason: "not-found",
            message: "R.exe was not found via the Windows registry.",
        });

    const path = parseWindowsRegistryOutput(registryResult.value);
    return path
        ? ok(path)
        : err({
              reason: "lookup-failed",
              message: "Registry entry found but could not be parsed.",
          });
}

async function detectOnUnix(): Promise<Result<string, RDetectionFailure>> {
    const whichResult = await runCommand("which", ["R"]);
    if (whichResult.kind === "err")
        return err({ reason: "not-found", message: "`R` was not found on PATH." });

    const path = parseWhichOutput(whichResult.value);
    return path
        ? ok(path)
        : err({ reason: "lookup-failed", message: "`which R` returned no usable path." });
}
