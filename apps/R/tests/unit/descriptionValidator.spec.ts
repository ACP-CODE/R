import { describe, it, expect } from "vitest";
import { parseDcf, validateDescription } from "../../src/services/descriptionValidator";

const VALID_DESCRIPTION = [
    "Package: mypkg",
    "Version: 1.0.0",
    "Title: My Package",
    "Imports: dplyr, ggplot2",
].join("\n");

describe("parseDcf", () => {
    it("parses simple fields", () => {
        const fields = parseDcf(VALID_DESCRIPTION);
        expect(fields.find((f) => f.key === "Package")?.value).toBe("mypkg");
        expect(fields.find((f) => f.key === "Version")?.value).toBe("1.0.0");
    });

    it("folds continuation lines into the previous field", () => {
        const fields = parseDcf("Imports:\n    dplyr,\n    ggplot2");
        expect(fields.find((f) => f.key === "Imports")?.value).toBe("dplyr, ggplot2");
    });
});

describe("validateDescription", () => {
    it("passes a well-formed DESCRIPTION", () => {
        expect(validateDescription(VALID_DESCRIPTION)).toEqual([]);
    });

    it("flags missing required fields", () => {
        const issues = validateDescription("Package: mypkg");
        const messages = issues.map((i) => i.message);
        expect(messages).toContain("Missing required field: Version");
        expect(messages).toContain("Missing required field: Title");
    });

    it("warns on a non-semver version", () => {
        const issues = validateDescription(
            ["Package: mypkg", "Version: 1.0", "Title: t"].join("\n"),
        );
        expect(issues.some((i) => i.message.includes("MAJOR.MINOR.PATCH"))).toBe(true);
    });

    it("flags a dependency field missing its colon", () => {
        const issues = validateDescription(
            ["Package: mypkg", "Version: 1.0.0", "Title: t", "Imports dplyr"].join("\n"),
        );
        expect(issues.some((i) => i.message.includes("Imports"))).toBe(true);
    });
});
