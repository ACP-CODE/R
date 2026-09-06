import { describe, it, expect } from "vitest";
import { tokenizeLine, hasScope } from "./tokenize";

describe("R TextMate grammar", () => {
    it("scopes line comments and roxygen tags distinctly", async () => {
        const plain = await tokenizeLine("# a plain comment");
        expect(hasScope(plain, "# a plain comment", "comment.line.number-sign.r")).toBe(true);

        const roxygen = await tokenizeLine("#' @param x a number");
        expect(hasScope(roxygen, "#'", "punctuation.definition.comment.roxygen.r")).toBe(true);
        expect(hasScope(roxygen, "@param", "keyword.other.roxygen-tag.r")).toBe(true);
    });

    it("scopes a foldable section header", async () => {
        const tokens = await tokenizeLine("# Load data ----");
        expect(hasScope(tokens, "Load data", "comment.line.section-header.r")).toBe(true);
    });

    it("scopes double, single, and raw strings", async () => {
        expect(
            hasScope(
                await tokenizeLine('x <- "hello"'),
                '"hello"'.slice(0, 1),
                "punctuation.definition.string.begin.r",
            ),
        ).toBe(true);
        expect(
            hasScope(
                await tokenizeLine("x <- 'hello'"),
                "'",
                "punctuation.definition.string.begin.r",
            ),
        ).toBe(true);

        const raw = await tokenizeLine('x <- r"(C:\\path\\to)"');
        expect(hasScope(raw, "r", "storage.type.string.raw.r")).toBe(true);
    });

    it("scopes every numeric literal family", async () => {
        expect(hasScope(await tokenizeLine("x <- 0x1A"), "0x1A", "constant.numeric.hex.r")).toBe(
            true,
        );
        expect(hasScope(await tokenizeLine("x <- 3.14"), "3.14", "constant.numeric.float.r")).toBe(
            true,
        );
        expect(hasScope(await tokenizeLine("x <- 2L"), "2L", "constant.numeric.integer.r")).toBe(
            true,
        );
        expect(hasScope(await tokenizeLine("x <- 2i"), "2i", "constant.numeric.integer.r")).toBe(
            true,
        );
        expect(
            hasScope(await tokenizeLine("x <- 1e10"), "1e10", "constant.numeric.integer.r"),
        ).toBe(true);
    });

    it("scopes control keywords and language constants", async () => {
        expect(hasScope(await tokenizeLine("if (x) 1 else 2"), "if", "keyword.control.r")).toBe(
            true,
        );
        expect(hasScope(await tokenizeLine("x <- TRUE"), "TRUE", "constant.language.r")).toBe(true);
        expect(
            hasScope(
                await tokenizeLine("x <- NA_character_"),
                "NA_character_",
                "constant.language.r",
            ),
        ).toBe(true);
    });

    it("distinguishes a function definition from a function call", async () => {
        const def = await tokenizeLine("greet <- function(name) name");
        expect(hasScope(def, "greet", "entity.name.function.definition.r")).toBe(true);

        const call = await tokenizeLine("greet(name)");
        expect(hasScope(call, "greet", "entity.name.function.r")).toBe(true);
        expect(hasScope(call, "greet", "entity.name.function.definition.r")).toBe(false);
    });

    it("scopes named arguments as parameters, not variable reads", async () => {
        const tokens = await tokenizeLine('read.csv(file = "x.csv")');
        expect(hasScope(tokens, "file", "variable.parameter.r")).toBe(true);
    });

    it("scopes pipes, namespace access, and formulas distinctly from generic operators", async () => {
        expect(hasScope(await tokenizeLine("x |> f()"), "|>", "keyword.operator.pipe.r")).toBe(
            true,
        );
        expect(hasScope(await tokenizeLine("x %>% f()"), "%>%", "keyword.operator.pipe.r")).toBe(
            true,
        );
        expect(hasScope(await tokenizeLine("x %||% y"), "%||%", "keyword.operator.special.r")).toBe(
            true,
        );
        expect(
            hasScope(await tokenizeLine("dplyr::filter(x)"), "::", "keyword.operator.namespace.r"),
        ).toBe(true);
        expect(hasScope(await tokenizeLine("y ~ x"), "~", "keyword.operator.formula.r")).toBe(true);
    });
});
