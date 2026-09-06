import { describe, it, expect } from "vite-plus/test";
import {
    planScaffoldFiles,
    buildRprojContent,
    buildRprofileContent,
} from "../../src/services/projectScaffold";

describe("planScaffoldFiles", () => {
    it("L0 only creates the entry file", () => {
        const files = planScaffoldFiles("L0", "main.R");
        expect(files).toEqual([{ relativePath: "main.R", content: "" }]);
    });

    it("L1 adds .Rproj and .Rprofile alongside the entry file", () => {
        const files = planScaffoldFiles("L1", "main.R");
        expect(files.map((f) => f.relativePath)).toEqual(["main.R", "project.Rproj", ".Rprofile"]);
    });
});

describe("buildRprojContent / buildRprofileContent", () => {
    it("sets UTF-8 encoding in both files", () => {
        expect(buildRprojContent()).toMatch(/Encoding: UTF-8/);
        expect(buildRprofileContent()).toMatch(/options\(encoding = "UTF-8"\)/);
    });
});
