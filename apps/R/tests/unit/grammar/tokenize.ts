import * as fs from "node:fs";
import * as path from "node:path";
import * as oniguruma from "vscode-oniguruma";
import * as vsctm from "vscode-textmate";

const GRAMMAR_PATH = path.join(__dirname, "../../../syntaxes/r.tmLanguage.json");
const WASM_PATH = require.resolve("vscode-oniguruma/release/onig.wasm");

let registryPromise: Promise<vsctm.Registry> | undefined;

function getRegistry(): Promise<vsctm.Registry> {
    if (registryPromise) return registryPromise;

    registryPromise = oniguruma.loadWASM(fs.readFileSync(WASM_PATH)).then(() => {
        const onigLib = Promise.resolve({
            createOnigScanner: (patterns: string[]) => new oniguruma.OnigScanner(patterns),
            createOnigString: (source: string) => new oniguruma.OnigString(source),
        });
        return new vsctm.Registry({
            onigLib,
            loadGrammar: async (scopeName) => {
                if (scopeName !== "source.r") return null;
                return vsctm.parseRawGrammar(fs.readFileSync(GRAMMAR_PATH, "utf8"), GRAMMAR_PATH);
            },
        });
    });
    return registryPromise;
}

export interface Token {
    readonly text: string;
    readonly scopes: readonly string[];
}

/** Tokenizes a single line of R source and returns each token's text + full scope stack. */
export async function tokenizeLine(line: string): Promise<Token[]> {
    const registry = await getRegistry();
    const grammar = await registry.loadGrammar("source.r");
    if (!grammar) throw new Error("Failed to load source.r grammar");

    const result = grammar.tokenizeLine(line, vsctm.INITIAL);
    return result.tokens.map((token) => ({
        text: line.slice(token.startIndex, token.endIndex),
        scopes: token.scopes,
    }));
}

/** True if any token covering `text` carries a scope containing `scopeFragment`. */
export function hasScope(tokens: Token[], text: string, scopeFragment: string): boolean {
    return tokens.some(
        (token) =>
            token.text === text && token.scopes.some((scope) => scope.includes(scopeFragment)),
    );
}
