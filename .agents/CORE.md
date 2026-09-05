# 铁律（CORE）

本仓库所有代码必须遵守以下强制性原则。

## 模块组织
- **激活入口**（如vscode 插件的主入口函数 `activate`）**只做组装**：注册命令、订阅事件、初始化服务等，逻辑不超过 15 行。
- 所有具体功能（补全、诊断、调试等）放在独立模块或服务类中，通过依赖注入或简单工厂组装。
- 每个文件只导出一个主要功能（类/函数），辅助工具可内聚于同一文件。

## 函数与类
- **单一职责**：每个函数只做一件事。
- **函数体 ≤ 20 行**（不含空行和注释），否则拆分子函数。
- **命名**：
  - 函数/变量：`camelCase`，动词开头。
  - 类/接口/类型：`PascalCase`，名词。
  - 常量（字面量）：`UPPER_SNAKE_CASE`。
- 参数不超过 3 个，多于 3 个封装为对象。

## 错误与异步
- 禁止抛出未捕获异常，使用 `Result<T, E>` 或 `neverthrow`。
- 统一 `async/await`，避免 `.then` 回调。

## 工具链
- 代码风格由 `vite-plus` 的 `fmt`/`lint`/`check` 自动管理，提交前必须通过 `pnpm check`。
- TypeScript 严格模式已由 `tsconfig.base.json` 开启，无需重复声明。

## 测试
- 核心逻辑覆盖率 ≥ 80%，使用 vite-plus 内置的 vitest（`vp test`）。

## 提交
- 遵循 [Conventional Commits](https://www.conventionalcommits.org/)。

## 工作流
- 禁止直接 `cd` 进子包执行命令，必须通过根目录 `scripts/run.ts` 转发。
- 调试：`pnpm watch [--target=<pkg>]`。
- 调试配置同步：`pnpm vscode:sync`（`prewatch` 自动触发）。