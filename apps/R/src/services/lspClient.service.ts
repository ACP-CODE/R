import * as vscode from "vscode";
import {
    LanguageClient,
    type LanguageClientOptions,
    type ServerOptions,
} from "vscode-languageclient/node";
import { type Result, ok, err } from "../core/result";

export interface LspStartFailure {
    readonly message: string;
    /** True when the failure matches the known "Failed to get list of R functions" startup error. */
    readonly isKnownStartupError: boolean;
}

const KNOWN_STARTUP_ERROR_PATTERN = /Failed to get list of R functions/i;

/** Wraps the `languageserver::run()` process so extension.ts stays assembly-only. */
export class LspClientService {
    private client: LanguageClient | undefined;

    public async start(rExecutable: string): Promise<Result<void, LspStartFailure>> {
        await this.stop();

        const serverOptions: ServerOptions = {
            command: rExecutable,
            args: ["--slave", "-e", "languageserver::run()"],
        };
        const clientOptions: LanguageClientOptions = {
            documentSelector: [{ scheme: "file", language: "r" }],
            synchronize: { fileEvents: vscode.workspace.createFileSystemWatcher("**/.Rprofile") },
        };

        this.client = new LanguageClient(
            "r.languageServer",
            "R Language Server",
            serverOptions,
            clientOptions,
        );

        try {
            await this.client.start();
            return ok(undefined);
        } catch (error) {
            return err(toStartFailure(error));
        }
    }

    public async stop(): Promise<void> {
        if (!this.client) return;
        await this.client.stop().catch(() => undefined);
        this.client = undefined;
    }

    public isRunning(): boolean {
        return this.client !== undefined;
    }
}

function toStartFailure(error: unknown): LspStartFailure {
    const message = error instanceof Error ? error.message : String(error);
    return { message, isKnownStartupError: KNOWN_STARTUP_ERROR_PATTERN.test(message) };
}
