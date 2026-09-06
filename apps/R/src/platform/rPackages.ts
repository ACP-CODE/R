import { type Result, ok, err } from "../core/result";
import { runCommand } from "../core/exec";

/** Packages the MVP feature set depends on (R-DOMAIN §2.2.2, §10). */
export const REQUIRED_R_PACKAGES = ["languageserver", "jsonlite", "lintr", "styler"] as const;

export type RequiredRPackage = (typeof REQUIRED_R_PACKAGES)[number];

export interface PackageCheckFailure {
    readonly message: string;
}

/** Builds the `Rscript -e` expression that prints installed/missing packages as JSON. Pure. */
export function buildPackageCheckExpression(packages: readonly string[]): string {
    const vector = packages.map((name) => JSON.stringify(name)).join(", ");
    return `cat(jsonlite::toJSON(sapply(c(${vector}), requireNamespace, quietly = TRUE)))`;
}

/** Parses the JSON-ish `{"pkg":true,...}` output from R into a list of missing package names. Pure. */
export function parseMissingPackages(rawJson: string): string[] {
    const parsed = JSON.parse(rawJson) as Record<string, boolean>;
    return Object.entries(parsed)
        .filter(([, installed]) => !installed)
        .map(([name]) => name);
}

/** Asks R which of REQUIRED_R_PACKAGES are missing. `jsonlite` itself may not be installed yet,
 *  so this call intentionally uses base R only (no jsonlite dependency) for the first probe. */
export async function findMissingPackages(
    rExecutable: string,
    packages: readonly string[] = REQUIRED_R_PACKAGES,
): Promise<Result<string[], PackageCheckFailure>> {
    const vector = packages.map((name) => JSON.stringify(name)).join(", ");
    const expression = `cat(paste(sapply(c(${vector}), function(p) requireNamespace(p, quietly = TRUE)), collapse=","))`;
    const result = await runCommand(rExecutable, ["--slave", "-e", expression]);
    if (result.kind === "err")
        return err({ message: `Failed to query installed packages: ${result.error.message}` });

    const flags = result.value.trim().split(",");
    const missing = packages.filter((_, index) => flags[index] === "FALSE");
    return ok(missing);
}

/** Builds the install expression for the given package names. Pure. */
export function buildInstallExpression(packages: readonly string[]): string {
    const vector = packages.map((name) => JSON.stringify(name)).join(", ");
    return `install.packages(c(${vector}), repos = "https://cloud.r-project.org")`;
}
