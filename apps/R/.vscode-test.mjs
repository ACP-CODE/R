// @ts-check
import { defineConfig } from "@vscode/test-cli";

/**
 * @type {import("@vscode/test-cli").TestConfiguration}
 */
const baseTest = {
    files: "out_test/**/*.test.js",
    workspaceFolder: "./tests/test_workspace",
    launchArgs: ["--disable-extensions"],
    mocha: {
        setTimeout: 10_000,
    },
};

/**
 * @type {Map<string, import("@vscode/test-cli").TestConfiguration>}
 */
const allTestSuites = new Map([
    [
        "unit",
        {
            ...baseTest,
            files: "out_test/unit/**/*.spec.js",
            env: {},
        },
    ],
]);

const selectedTests = process.env.TEST_SUITE
    ? [allTestSuites.get(process.env.TEST_SUITE)].filter(
          /**
           * @param {import("@vscode/test-cli").TestConfiguration | undefined} test
           * @returns {test is import("@vscode/test-cli").TestConfiguration}
           */
          (test) => !!test,
      )
    : Array.from(allTestSuites.values());

export default defineConfig({
    tests: selectedTests,
});
