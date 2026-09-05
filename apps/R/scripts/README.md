# VS Code Docs Generator

`scripts/docs/` 根据 `package.json` 与 GitHub API 自动生成/刷新 `README.md` 中的几个小节。README 里用一对 `<!-- START_GENERATED_XXX --> ... <!-- END_GENERATED_XXX -->` 注释标出每个小节的边界，脚本只替换标记内部的内容，标记外的手写内容不受影响。

| Marker          | 内容                                                             | 数据来源                                             | 是否需要网络 |
| --------------- | ---------------------------------------------------------------- | ---------------------------------------------------- | ------------ |
| `FEATURES`      | Commands / Views / Walkthroughs 列表                             | `package.json#contributes`                           | 否           |
| `CONFIGURATION` | 配置项表格（Window / Workspace，含 deprecated）                  | `package.json#contributes.configuration`             | 否           |
| `CONTRIBUTORS`  | 贡献者头像网格 SVG + 文字链接列表                                | GitHub REST API (`/repos/:owner/:repo/contributors`) | 是           |
| `SPONSORS`      | 赞助者头像网格 SVG，或回退为 `package.json#sponsor.url` 静态链接 | GitHub GraphQL（需要 `GITHUB_TOKEN`）                | 是（可选）   |

## Usage

```bash
# 完整模式：静态章节 + 动态章节（会请求 GitHub API）
pnpm run docs:update

# 静态模式：只刷新 Features / Configuration，不发任何网络请求
pnpm run docs:update:static
```

也可以在仓库根目录通过铁律脚本对任意包执行：

```bash
node scripts/run.ts docs:update --target=extension
```

## 为什么要分「静态」「动态」两种模式

- **静态部分**（Features / Configuration）完全由 `package.json` 决定，同一份输入永远得到同一份输出，适合放进 PR 级别的 CI 校验（`git diff --exit-code` 一旦不一致就说明 README 没跟着 `package.json` 一起更新）。
- **动态部分**（Contributors / Sponsors）依赖 GitHub API：未认证请求限额只有 60 次/小时，PR CI 共享出口 IP 很容易撞限流；把它们放进 PR 检查会导致“明明代码没问题，CI 却随机失败”。所以它们只在带 `GITHUB_TOKEN` 的定时 workflow（见 `.github/workflows/docs.yml`）里运行，并且任何失败路径（限流、网络错误、解析不出 owner/repo）都只是打印警告、跳过该小节，不会让整个命令非零退出。

## 头像网格 SVG 是怎么做到“点开头像能跳到主页”的

`scripts/docs/svg.ts` 生成的 SVG 里，每个头像都包了一层 `<a xlink:href="...">`。这在 GitHub 直接渲染 `.svg` 文件、或者本地浏览器打开时是可点击的。

但 VS Code 插件市场展示页面是通过 `<img src="....svg">` 把整张 SVG 当一张图片整体嵌入的，图片内部的超链接在这种嵌入方式下天生不可点击（这是 `<img>` 标签本身的限制）。所以 `docs/index.ts` 会在头像图下面额外生成一份纯文本 Markdown 链接列表（`[@login](https://github.com/login)`），作为市场页面下的可点击兜底；SVG 内部的链接则服务于其他能直接渲染 SVG 的场景。

## 目录结构

```
scripts/docs/
├── index.ts          # 入口：读 package.json / README，串联下面几个模块，写回 README
├── types.ts           # 共享类型
├── nls.ts              # package.nls.json 占位符解析
├── config-table.ts    # Configuration 表格
├── features.ts        # Features 小节
├── repo.ts             # 从 package.json#repository 解析 GitHub owner/repo
├── contributors.ts    # GitHub REST 贡献者列表（带限流降级）
├── sponsors.ts         # GitHub GraphQL 赞助者列表（需要 token，取不到就跳过）
└── svg.ts               # 头像网格 SVG 渲染
```

## CI Verification

`ci.yml` 会运行 `pnpm run docs:update:static` 后执行 `git diff --exit-code README.md`，确保 Features / Configuration 两个小节始终和 `package.json` 保持一致。Contributors / Sponsors 不参与这项校验（原因见上）。

## Node 版本要求

所有脚本使用 Node 22.18+ 原生 TypeScript type-stripping（`node scripts/docs/index.ts` 之类直接运行 `.ts`，无需构建步骤）。这些脚本用的是一个只作用于 `apps/vscode/scripts/**` 的独立 `package.json`（内容只有 `{"type": "module"}`），把这个子树标记成 ESM，而不需要在 `apps/vscode/package.json`（管的是 `src/**`，编译产物是 CommonJS）上加 `"type": "module"`——两者的模块系统需求是冲突的，用嵌套 `package.json` 划边界比用 `.mts` 扩展名划边界更明确、也更符合 Node 官方推荐做法。只使用可擦除语法（不含 `enum` / `namespace` / parameter properties），因此不需要额外的 `--experimental-transform-types` 参数。类型检查配置继承自根目录 `/tsconfig.base.json`，具体见 `scripts/tsconfig.json`。
