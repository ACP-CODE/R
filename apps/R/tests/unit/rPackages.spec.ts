import { describe, it, expect } from "vite-plus/test";
import { buildInstallExpression, REQUIRED_R_PACKAGES } from "../../src/platform/rPackages";

describe("buildInstallExpression", () => {
    it("quotes each package name and targets CRAN", () => {
        const expr = buildInstallExpression(["lintr", "styler"]);
        expect(expr).toBe(
            'install.packages(c("lintr", "styler"), repos = "https://cloud.r-project.org")',
        );
    });

    it("covers the packages the MVP feature set needs", () => {
        expect(REQUIRED_R_PACKAGES).toEqual(["languageserver", "jsonlite", "lintr", "styler"]);
    });
});
