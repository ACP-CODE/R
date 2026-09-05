# 架构设计（ARCHITECTURE）

**目标**：为 VS Code / VS 提供 R 语言支持（LSP + REPL + 调试）。

## 技术栈
- `pnpm` + `vite-plus`（构建/检查）
- TypeScript（严格模式）
- VS Code Extension API + LSP

## 仓库结构（Monorepo）

- .agents
- .github
- .vite-hooks
- .vscode
- apps
  - R
    - l10n
    - out
    - scripts
    - snippets
    - syntaxes
    - src
      - extenstion.ts
    - .vscode-test.mjs
    - package.json
    - package.nls.json
    - package.nls.zh-cn.json
    - rolldown.config.ts
    - tsconfig.json
- packages (可共用的函数库，组件库，类等)
- scripts
  - run.ts
  - vscode-sync.ts
- package.json
- pnpm-workspace.yaml
- tsconfig.base.json
- vite.config.ts