import { describe, it, expect } from "vite-plus/test";
import { parseWindowsRegistryOutput, parseWhichOutput } from "../../src/platform/detectR";

describe("parseWindowsRegistryOutput", () => {
    it("extracts the default value path", () => {
        const stdout =
            "HKEY_LOCAL_MACHINE\\Software\\...\\App Paths\\R.exe\n    (Default)    REG_SZ    C:\\Program Files\\R\\R-4.3.2\\bin\\R.exe\n";
        expect(parseWindowsRegistryOutput(stdout)).toBe(
            "C:\\Program Files\\R\\R-4.3.2\\bin\\R.exe",
        );
    });

    it("returns undefined when the pattern is absent", () => {
        expect(parseWindowsRegistryOutput("ERROR: not found")).toBeUndefined();
    });
});

describe("parseWhichOutput", () => {
    it("returns the first non-empty line", () => {
        expect(parseWhichOutput("\n/usr/local/bin/R\n/usr/bin/R\n")).toBe("/usr/local/bin/R");
    });

    it("returns undefined for empty output", () => {
        expect(parseWhichOutput("\n\n")).toBeUndefined();
    });
});
