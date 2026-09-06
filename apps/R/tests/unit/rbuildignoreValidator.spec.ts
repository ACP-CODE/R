import { describe, it, expect } from "vite-plus/test";
import { validateRbuildignore } from "../../src/services/rbuildignoreValidator";

describe("validateRbuildignore", () => {
    it("accepts valid regex lines", () => {
        expect(validateRbuildignore("^\\.Rproj$\n^tests$")).toEqual([]);
    });

    it("flags an invalid regular expression", () => {
        const issues = validateRbuildignore("^(unclosed");
        expect(issues).toHaveLength(1);
        expect(issues[0].line).toBe(0);
        expect(issues[0].message).toMatch(/Invalid regular expression/);
    });

    it("flags two or more consecutive blank lines", () => {
        const issues = validateRbuildignore("^a$\n\n\n^b$");
        expect(issues.some((i) => i.message.includes("blank line"))).toBe(true);
    });

    it("ignores comments and blank single lines", () => {
        expect(validateRbuildignore("# a comment\n\n^a$")).toEqual([]);
    });
});
