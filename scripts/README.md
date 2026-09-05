# Root Scripts

All scripts here run as plain `.ts` files via Node 22.18+'s native TypeScript
type-stripping — no build step, no `ts-node`. That only works because the
code sticks to erasable TS syntax (interfaces, type annotations, generics —
no `enum`, `namespace`, or parameter properties), and because the root
`package.json` already declares `"type": "module"`, so `.ts` here is
unambiguously ESM.

## Layout

```
scripts/
├── run.ts            # the one command entry point (the "iron rule" in AGENTS.md)
├── vscode-sync.ts     # generates .vscode/launch.json and tasks.json
└── lib/
    └── workspace.ts    # single source of truth: discover workspace packages, classify their kind
```

Type-checking config lives in `/tsconfig.base.json` (shared strict options)
plus `scripts/tsconfig.json` (adds the Node/ESM-specific bits this folder
needs). `apps/vscode/tsconfig.json` and `apps/vscode/scripts/tsconfig.json`
extend the same base — each only overrides what's actually different for its
own runtime (see the comment in `tsconfig.base.json` for why).

## run.ts

```bash
node scripts/run.ts <action> [--target=<packageName> | --app=<packageName>] [...rest]
```

`run.ts` is deliberately thin: its only job is resolving _which package_ an
action targets, then handing off to `vpr` (`vp run`). It doesn't know how to
build, test, or lint anything itself — that's each package's own
`package.json#scripts`, and `vpr` is what actually executes it inside that
package's directory (which is why every command prints
`~/apps/vscode$ ...` first — you always see exactly where it's running).

- `--target=<name>` / `--app=<name>` is the **only** way to pick a target —
  by real package name, never by folder name (the two aren't always the
  same; `apps/vscode`'s package name is `extension`). No positional-argument
  guessing: one explicit way to say what you mean beats several implicit
  ones that might be wrong.
- No `--target`? Falls back to the root `package.json#config.app` default.
- Before dispatching, `run.ts` checks the action is a real script on the
  target package and fails with the list of what _is_ available — so a typo
  gives you a useful message instead of `vpr` silently matching nothing.
- Tauri apps (see below) get one small rewrite: `dev`/`build` become
  `tauri dev`/`tauri build`, since Tauri projects expose those through a
  `tauri` script rather than same-named ones of their own.

## lib/workspace.ts

Exposes `listWorkspacePackages()` / `findPackageByName()`. Package identity —
real name, path, kind — comes from `pnpm list -r --depth -1 --json`, not
from walking `pnpm-workspace.yaml` globs and guessing folder names.

Package kind is classified from what a package's own `package.json`
_declares_, not from scanning its file tree:

| Kind               | Detected by                                     |
| ------------------ | ----------------------------------------------- |
| `tauri-app`        | has a `tauri` script                            |
| `vscode-extension` | has `engines.vscode` or `contributes`           |
| `web-app`          | has a `dev` script (and isn't one of the above) |
| `library`          | everything else                                 |

Checking for a `tauri` script instead of an `existsSync("src-tauri")` call is
both cheaper (package.json is already being read for `scripts`; no extra
filesystem check) and more correct: it's the exact same field `run.ts`
dispatches `tauri dev`/`tauri build` on, so detection and dispatch can never
disagree with each other.

Results are cached per process — `run.ts` and `vscode-sync.ts` both call
this freely without spawning `pnpm` more than once per run.

## vscode-sync.ts — generates .vscode/launch.json and tasks.json

```bash
pnpm run vscode:sync         # regenerate by hand
pnpm run vscode:sync:check   # regenerate, then git diff --exit-code — used in CI
```

VS Code's `launch.json`/`tasks.json` are plain static JSON with no built-in
way to enumerate workspace packages at runtime (`pickString` options must be
a literal array). So the approach here is _dynamic at generation time,
static in the committed result_: the real package names/paths/kinds are read
exactly once, in this script, from `lib/workspace.ts`. Add, remove, or
rename a package and re-run `pnpm vscode:sync` (already wired into
`postinstall`, so this is normally automatic).

What gets generated:

- One `tasks.json` task per package per action that actually exists on that
  package's `scripts` (`dev`/`build`/`compile`/`watch`/`lint`/`test`/
  `test:unit`/`vsce`/`docs:update`/`tauri`/...), all dispatched through
  `node scripts/run.ts <action> --target=<pkg>` — no execution logic is
  duplicated here.
- For every `vscode-extension` package: a "Run Extension: `<pkg>`" launch
  config, plus "Extension Tests: `<pkg>`" if it has a `test:unit` script
  (paired with a dedicated `TEST=true` compile task, since
  `rolldown.config.ts` uses that env var to switch between building
  `src/extension.ts` and `tests/**`).
- One parameterized `workspace: run action on package` task, backed by a
  `pickString` package-name input (options generated from the real
  workspace) plus a free-text action input, for anything not covered above.

Both generated files start with a comment banner (VS Code's launch.json/
tasks.json are JSONC, so `//` comments are fine) marking them as generated
and pointing back at this script.

## Git Hooks

`vite.config.ts`'s `staged` config only takes effect once git's
`core.hooksPath` points at the `.vite-hooks/` directory pnpm install
generates. The root `package.json`'s `prepare` script sets that on every
`pnpm install`; `.vite-hooks/pre-commit` itself is committed to the repo.
