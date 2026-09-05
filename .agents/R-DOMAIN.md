# R 插件领域能力定义

本插件为 R 语言提供一站式开发体验，覆盖从“零基础入门”到“生产级项目交付”的完整链路：创建项目->引导式学习->智能编码->测试与调试->打包分发->报告产出(专业级文档)

## 1. Onboarding & Learning

**目标**：让零基础用户在 IDE 内完成从“第一次打开 R”到“独立完成项目”的完整学习路径。

### 1.1 Explorer

`contributes.viewsWelcome` 提供一个交互文案用于引导用户创建R项目或包，同时提供副文案链接进入`contributes.walkthroughs`所提供的向导课程。

- **触发条件**：未打开任何文件夹（`!workspaceFolderCount`）
- **UI 元素**：
    - 主按钮：主标题（引导点击创建项目按钮）-> (选择要创建的项目类型（R项目，R 包）)
    - 次级链接：副标题补充课程引导链接进入`walkthroughs`编排好好的课程体系
    - 底部提示：可随时从命令面板唤醒
- **多语言支持**：通过 `package.nls.{locale}.json` 实现中英文切换

### 1.2 Walkthrough

> 每个 Walkthrough 包含 3-5 个步骤，每步遵循 **“概念（15字内） + 操作按钮 + 终端回声”** 三要素。

| 阶段   | 标题             | 核心目标                 | 关键知识点                                       | 产出               |
| :----- | :--------------- | :----------------------- | :----------------------------------------------- | :----------------- |
| **L1** | 对话式编程入门   | 消除恐惧，建立直觉       | 控制台交互、变量与数据类型、基础函数、向量化思维 | 能独立执行 R 代码  |
| **L2** | 脚本化与函数     | 从“命令”到“程序”         | 脚本编写、自定义函数、条件判断与循环             | 能写可复用的脚本   |
| **L3** | 项目工程化管理   | 告别混乱，有序协作       | R项目结构、`.Rproj`与工作目录、`renv`依赖管理    | 能创建标准 R 项目  |
| **L4** | 数据导入与可视化 | 感受 R 的真正威力        | `readr`/`dplyr`数据操作、`ggplot2`绘图语法       | 能完成数据探索分析 |
| **L5** | 从代码到报告     | 产出专业成果，获得成就感 | R Markdown / Quarto、动态文档、一键导出PDF/HTML  | 能生成可交付的报告 |

## 2. Intelligent Coding

**目标**：对标 TypeScript 在 VS Code 中的开发体验（LSP + Lint + Format + 自动配置）。

### 2.1 语言服务器 (LSP) —— 对标 tsserver

| 能力     | R 实现                     | 触发条件            |
| :------- | :------------------------- | :------------------ |
| 悬停文档 | `languageserver`           | 鼠标悬停函数/变量   |
| 自动补全 | `languageserver`           | 输入时触发          |
| 函数签名 | `languageserver`           | 输入 `(` 时         |
| 跳转定义 | `languageserver`           | `Cmd+Click` / `F12` |
| 查找引用 | `languageserver`           | `Shift+F12`         |
| 重命名   | `languageserver`           | `F2`                |
| 实时诊断 | `languageserver` + `lintr` | 保存文件时自动检查  |

### 2.2 自动配置 LSP 环境（开箱即用）

1. **自动检测 R 路径**：跨平台检测（Windows Registry / macOS `which R` / Linux `which R`）
2. **自动安装依赖包**：检测 `languageserver`、`jsonlite`、`lintr`、`styler`，缺失时一键安装
3. **自动启动 LSP**：执行 `R --slave -e "languageserver::run()"`
4. **错误处理**：捕获常见错误（如“Failed to get list of R functions”），显示可操作的友好提示

### 2.3 代码风格检查 (Linting) —— 对标 ESLint

- 引擎：`lintr`
- 默认规则：赋值用 `<-`、行宽 ≤ 80、禁止连续空格 > 2、禁止未使用变量
- 支持项目级 `.lintr` 配置文件
- 保存时自动检查，结果在“问题”面板显示

### 2.4 自动格式化 (Formatting) —— 对标 Prettier

- 引擎：`styler`
- 保存时自动格式化（可配置开关）
- 手动触发：`R: Format Document`
- 支持区域格式化（选中代码块）

### 2.5 文件图标支持

为 R 生态所有常见文件类型提供专业图标，覆盖：

- 包/项目管理：`DESCRIPTION`, `NAMESPACE`, `renv.lock`, `.Rprofile`, `Rbuildignore`, `.Rproj`
- 代码与脚本：`.R`, `.Rmd`, `.Rnw`, `.qmd`
- 文档与帮助：`.Rd`, `_pkgdown.yml`, `README.md`, `NEWS.md`
- 数据与序列化：`.rda`, `.RData`, `.rds`, `.feather`, `.csv`, `.tsv`, `.xlsx`, `.json`
- 输出与报告：`.pdf`, `.docx`, `.html`, `.tex`, `.log`
- 未来扩展预留：`.parquet`, `.qs` 等

### 2.6 生态文件验证（对标 JSON 语法检查）

> **目标**：确保 `DESCRIPTION`、`NAMESPACE`、`Rbuildignore` 等 R 生态文件的语法和结构正确，在“问题”面板中高亮显示错误（类似于 `package.json` 的 JSON 语法错误提示）。

#### 实现策略：复用 R 官方工具，无需重写解析器

所有验证逻辑通过调用 R 内置的 `tools` 包或 `devtools` 包来实现，插件仅负责捕获输出并转换为 VS Code 诊断信息。

### 2.6 生态文件验证（对标 JSON 语法检查）

> **目标**：确保 `DESCRIPTION`、`NAMESPACE`、`Rbuildignore` 等 R 生态文件的语法和结构正确，在“问题”面板中高亮显示错误（类似于 `package.json` 的 JSON 语法错误提示）。

#### 实现策略：复用 R 官方工具，无需重写解析器

所有验证逻辑通过调用 R 内置的 `tools` 包或 `devtools` 包来实现，插件仅负责捕获输出并转换为 VS Code 诊断信息。

| 文件               | 验证内容                                                                        | 后台 R 调用                          | 错误映射                                  |
| :----------------- | :------------------------------------------------------------------------------ | :----------------------------------- | :---------------------------------------- |
| **`DESCRIPTION`**  | DCF 格式合法性、必填字段（Package/Version/Title）、依赖语法（Imports/Suggests） | `tools::check_package_description()` | 捕获 `Warning` 和 `Error`，映射到对应行号 |
| **`NAMESPACE`**    | 导出（`export`）和导入（`import`）语法是否正确                                  | `tools::check_namespace()`           | 显示缺失函数、错误引用的包名              |
| **`renv.lock`**    | JSON 格式合法性（利用 VS Code 原生 JSON 验证）                                  | 无（原生 VS Code）                   | 自动高亮 JSON 解析错误                    |
| **`.Rprofile`**    | R 语法检查（同 `.R` 文件）                                                      | `languageserver`                     | 复用现有 LSP 诊断                         |
| **`Rbuildignore`** | 正则表达式是否合法（如 `^\.Rproj$`）                                            | 轻量级正则解析（JS 实现）            | 无效正则显示错误                          |
| **`.Rd`**          | 核心宏是否存在（`\name`、`\title`）                                             | `tools::checkRd()`                   | 缺失核心宏时警告                          |

#### 触发时机

- **保存文件时**（`onDidSaveTextDocument`）自动触发对应验证。
- **手动触发**：命令面板提供 `R: Validate Project Files`，一键检查所有关键文件。

#### 智能修复（Quick Fix / Code Actions）

对于常见错误，提供一键修复功能（Code Action）：

| 错误场景                      | 检测方式                         | 自动修复方案                     |
| :---------------------------- | :------------------------------- | :------------------------------- |
| `Imports dplyr`（缺冒号）     | 正则检测 `^Imports\s+[a-zA-Z]`   | 补全为 `Imports: dplyr`          |
| `Version: 1.0`（缺 PATCH 位） | 检测版本号格式                   | 提示改为 `Version: 1.0.0`        |
| `Rbuildignore` 多余空行       | 检测连续空行                     | 自动清理                         |
| 缺少 `LICENSE` 文件           | 检测 `DESCRIPTION` 含 `License:` | 自动生成 `LICENSE` 模板          |
| `NAMESPACE` 缺失导出          | 检测是否有 `export()`            | 提示添加 `export(your_function)` |

## 3. Project Engineering

**目标**：提供与 RStudio 同等水准的项目管理能力，并在 Explorer 上下文上超越。

### 3.1 项目创建（三档可选）

充分利用好 `contributes.views.explorer` 提供符合当前 R 项目/包类型的可视化配置视图。

| 级别       | 说明                                 | 适用场景             |
| :--------- | :----------------------------------- | :------------------- |
| L0（裸奔） | 仅创建 `.R` 文件，无额外配置         | 快速测试、学习前两步 |
| L1（标准） | 生成 `.Rproj` + `.Rprofile`          | 日常数据分析项目     |
| L2（工业） | L1 + `renv::init()` 生成 `renv.lock` | 团队协作、生产级项目 |

### 3.2 Explorer 上下文增强

- **检测到 `.Rproj` 后**：
  - 自动追加菜单
    - 📦 包管理：列出已加载包，提供 Install/Update 快捷按钮
    - ▶️ 任务运行：预设常用任务（如 Run Tests、Source Script）
    - 🔄 刷新 R 会话：`.rs.restartR()` 一键重置环境
  - `contributes.views.explorer` 会追加一些view(比如)
    - 包依赖管理与调试 （功能可能不止这些尼克根据常用的场景帮忙发散，其实有些功能实现都是可参考 swiftlang.swift-vscode 插件）
      - 图标
        - Update package dependencies
        - Resolve package dependencies
        - Reset package dependencies
        - Flat/Nested 切换依赖关系图
        - open document
        - 全部折叠/展开 切换
      - 默认的两个tree list
        - targets
        - tasks
    - 配置视图 （可能需要，也可能要稍后，用于挂载项目配置文件之类）


### 3.3 依赖管理（renv 集成）

- 检测到 `renv.lock` 时自动提示 `renv::restore()`
- 包安装引导：自动设置 CRAN 镜像（如清华源）
- Windows 检测 `Rtools`，缺失时引导安装

### 3.4 路径智能

- 工作目录自动设为 `.Rproj` 所在目录（若存在）
- 提供 `here::here()` 模板片段，建议用户使用相对路径
- `.Rprofile` 中自动写入 `options(encoding = "UTF-8")`

总之就是检测出当前的所打开的项目类型会有自动挂载相关原生ui交互的能力。

## 4. Testing & Debugging

**目标**：利用 VS Code 原生调试能力，让 R 开发获得与 TypeScript 同等的调试体验。

### 4.1 调试（launch.json）

- 预置 4 种调试配置（通过 R Debugger 插件 + `vscDebugger` 包）：
    1. **调试当前文件**：`debugMode: "file"`
    2. **调试整个工作区**：`debugMode: "workspace"`
    3. **调试 R 包**：`debugMode: "workspace"` + `loadPackages: ["."]`
    4. **附加到运行中的 R 进程**：`request: "attach"`
- 支持断点、单步执行、变量查看、监视表达式、调用堆栈
- `browser()` 和 `debugonce()` 在终端中也能工作

### 4.2 测试（tasks.json）

- 预置任务：`R: Test package` → 执行 `devtools::test()`
- `problemMatcher: "$testthat"`：将失败测试显示在“问题”面板
- 支持 `testthat` 和 `tinytest` 两种框架
- 测试覆盖率：集成 `covr` 包，生成覆盖率报告

## 5. Packaging & Distribution

**目标**：让用户能在 VS Code 内完成从开发到 CRAN 提交的全流程。

### 5.1 包开发工作流

| 命令                | 对应 R 操作                     | 说明                           |
| :------------------ | :------------------------------ | :----------------------------- |
| `R: Create Package` | `usethis::create_package()`     | 生成标准包骨架                 |
| `R: Document`       | `devtools::document()`          | 生成 `.Rd` 文档和 `NAMESPACE`  |
| `R: Test`           | `devtools::test()`              | 运行测试                       |
| `R: Check`          | `devtools::check()`             | 本地全面检查（模拟 CRAN 审核） |
| `R: Install`        | `devtools::install()`           | 安装到本地 R 库                |
| `R: Build`          | `devtools::build()`             | 构建源码包 `.tar.gz`           |
| `R: Release`        | `devtools::release()`           | 提交到 CRAN（含审核引导）      |
| `R: Check Win`      | `devtools::check_win_release()` | Windows 跨平台检查             |
| `R: Check Mac`      | `devtools::check_mac_release()` | macOS 跨平台检查               |

### 5.2 包结构自动生成

- 一键生成完整目录：`DESCRIPTION`、`NAMESPACE`、`R/`、`man/`、`tests/`、`vignettes/`
- 模板包含：MIT 许可证、`.Rbuildignore`、`.gitignore`
- 自动检测并补全缺失的包依赖

### 5.3 CRAN 提交辅助

- 检查清单：`devtools::check()` 全部通过后才能提交
- 审核备注生成：自动生成 `cran-comments.md` 模板
- 版本管理：语义化版本号（`0.1.0` → `0.1.1`）

## 6. Advanced Productivity

| 能力             | 说明                                                           |
| :--------------- | :------------------------------------------------------------- |
| **一键创建 Rmd** | 生成标准 YAML 头 + 示例代码块的 `.Rmd` 文件                    |
| **渲染多种格式** | 支持 `pdf_document`、`html_document`、`word_document`          |
| **中文排版**     | 自动检测 TinyTeX，缺失时引导安装 `xelatex`（解决中文乱码）     |
| **实时预览**     | 渲染 HTML 时在 VS Code 内置 Webview 中预览                     |
| **参数化报告**   | 支持 `params` 参数，一键生成多份报告                           |
| **模板库**       | 内置 5+ 常见报告模板（数据分析报告、学术论文初稿、数据字典等） |

#### 6.1.1 深度领域报告模板

| 领域         | 模板名称       | 核心 R 包                          | 说明                               |
| :----------- | :------------- | :--------------------------------- | :--------------------------------- |
| **金融分析** | 股票回测报告   | `quantmod`, `PerformanceAnalytics` | 含收益率计算、风险指标、可视化图表 |
| **生物信息** | 基因表达分析   | `DESeq2`, `limma`, `pheatmap`      | 含差异表达、热图、富集分析         |
| **市场调研** | 客户满意度报告 | `tidyverse`, `psych`, `ggplot2`    | 含描述性统计、因子分析、可视化     |
| **公共卫生** | 流行病学报告   | `epiR`, `ggplot2`, `sf`            | 含发病率、趋势图、地理分布         |
| **教育评估** | 学生成绩分析   | `dplyr`, `lme4`, `sjPlot`          | 含描述统计、混合模型、可视化       |

> **策略**：插件内置这些模板的 Rmd 骨架，用户只需替换数据路径即可生成初步报告。

### 6.2 Copilot 原生能力集成

| 能力                  | 触发方式                  | 说明                                               |
| :-------------------- | :------------------------ | :------------------------------------------------- |
| **自然语言生成 Rmd**  | 对话式交互                | 用户用中文描述需求，Copilot 自动生成完整 Rmd 骨架  |
| **Copilot Chat 辅助** | 命令面板 `R: Ask Copilot` | 基于当前文件上下文，解释代码、优化性能             |
| **智能代码补全**      | 自动触发                  | Copilot 原生能力，在 `.R` 和 `.Rmd` 中提供行内补全 |
| **调试辅助**          | 报错时                    | 捕获 R 错误信息，Copilot 解释原因并给出修复方案    |

> **实现说明**：`R: Ask Copilot` 通过 `vscode.commands.executeCommand('workbench.action.chat.open')` 调用。

## 7. Knowledge Loop

**目标**：让插件本身成为“活的教材”，随着用户使用而不断进化。

### 7.1 学习路径记录（LEARN.json）

- 在 `.vscode/` 目录下自动生成 `LEARN.json`
- 记录字段：`firstRunAt`, `completedWalkthroughs`, `usedTemplates`, `renderedReports`
- 粘性提醒：用户 3 天未打开，右下角提示“上次学习了创建项目，今天试试生成报告？”

### 7.2 社区贡献机制

- 用户可导出自己的领域模板为 `.Rtemplate` 文件，上传到 GitHub
- 插件内置“导入社区模板”功能，其他用户可一键下载使用

## 8. 边界与权衡（AI 开发前必读）

### 8.1 已知边界（不做 / 暂缓）

| 条目                                 | 原因                                                          | 优先级         |
| :----------------------------------- | :------------------------------------------------------------ | :------------- |
| **Shiny 应用调试**                   | 需要 Webview 与 R 进程的双向通信，复杂度高，依赖 RStudio 生态 | 暂缓（V3.0）   |
| **R 包交互式 UI（如 `manipulate`）** | 依赖 tcltk 等图形界面，跨平台兼容性差                         | 不支持         |
| **Reticulate（Python 互操作）调试**  | Python 与 R 混合调试超出 LSP 范围                             | 暂缓           |
| **自定义 Lint 规则热加载**           | 需要 `.lintr` 文件变化时自动重载，可能引入性能问题            | 暂缓           |
| **R CMD check --as-cran 全量模拟**   | 耗时过长，不适合实时验证                                      | 由用户手动触发 |

### 8.2 需权衡的决策（开发前 AI 需确认）

以下问题 **AI 在实现前必须先与用户确认**，避免走偏：

| 决策点                 | 选项                                                 | 建议（默认）                  |
| :--------------------- | :--------------------------------------------------- | :---------------------------- |
| **LSP 启动时机**       | A. 打开 `.R` 文件时启动 / B. 插件激活时立即启动      | **建议 A**（节省资源）        |
| **`renv` 自动激活**    | A. 检测到 `renv.lock` 自动运行 / B. 询问用户         | **建议 B**（避免意外）        |
| **Rmd 渲染默认格式**   | A. HTML / B. PDF                                     | **建议 A**（HTML 无需 LaTeX） |
| **Linting 默认严格度** | A. 使用 `lintr` 默认规则 / B. 严格模式（含所有警告） | **建议 A**（降低噪音）        |
| **CRAN 镜像设置**      | A. 自动设为清华源 / B. 询问用户                      | **建议 A**（国内用户需求）    |
| **包自动安装**         | A. 后台静默安装 / B. 弹窗询问                        | **建议 B**（尊重用户）        |

### 8.3 沟通策略（AI 行为准则）

1. 当遇到上述决策点时，**必须在开始写代码前通过提问确认**。
2. 若用户未回复，采用 **“建议（默认）”** 方案并注明。
3. 所有自动安装/自动配置动作，**必须在 VS Code 通知面板显示明确提示**，让用户知晓发生了什么。

## 9. 版本规划与路线图

| 里程碑   | 核心能力                                                                       | 预计版本 |
| :------- | :----------------------------------------------------------------------------- | :------- |
| **MVP**  | LSP + Lint + Format 自动配置、L1-L3 Walkthrough、创建项目、生态文件验证（2.6） | `0.1.0`  |
| **V1.0** | L4-L5 Walkthrough、测试与调试、Rmd 一键渲染、包开发工作流（5.1）               | `1.0.0`  |
| **V2.0** | 领域模板库（6.1.1）、Copilot 集成（6.2）、参数化报告                           | `2.0.0`  |
| **V3.0** | 社区模板市场（7.2）、Shiny 调试、LEARN.json 分析                               | `3.0.0`  |

## 10. 约束与兼容性

| 约束                     | 说明                                                                                                             |
| :----------------------- | :--------------------------------------------------------------------------------------------------------------- |
| **VS Code 最低版本**     | `^1.85.0`（支持 Walkthrough API）                                                                                |
| **R 最低版本**           | `4.0.0`（确保 `renv`、`languageserver` 兼容）                                                                    |
| **操作系统**             | Windows 10+、macOS 12+、Linux（glibc 2.28+）                                                                     |
| **核心依赖 R 包**        | `languageserver`, `jsonlite`, `lintr`, `styler`, `renv`, `rmarkdown`, `knitr`, `usethis`, `devtools`, `testthat` |
| **可选依赖（增强功能）** | `here`, `tidyverse`, `ggplot2`, `dplyr`, `tidyr`, `quarto`（渲染 `.qmd`）                                        |
| **报告生成依赖**         | `pandoc`（自动检测并引导安装）、`tinytex`（PDF 中文支持）                                                        |

---

> **本文档是 AI 开发本插件的“能力宪法”**。任何新功能的引入必须与本文档中的某一板块对齐。若用户提出超出本文档范围的需求，应先更新本文档再行开发。
>
> **AI 工作流**：在实现任何功能前，请先阅读 **第 8 节（边界与权衡）**，对其中标注的决策点进行确认。若未收到回复，采用“建议（默认）”方案并记录。
