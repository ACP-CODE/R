# Agent Rules

[约束]: .agents/CORE.md
[蓝图]: .agents/ARCHITECTURE.md
[日志]: .agents/MEMORIES.md
[目标]: .agents/R-DOMAIN.md
[铁律]: scripts/run.ts

## Boot

1. 默认调试 `pnpm watch` （已通过 npm config 预设 target）
2. 切换子包 `pnpm watch --target=<pkgName>`
3. 同步调试配置 `pnpm vscode:sync` (已验证可通过`pre~`驱动)
4. 禁止直接 cd 进子包执行命令。所有命令必须经由[铁律]转发

## Navigation

1. 通用规范 -> [约束] (代码风格)
2. 架构设计 -> [蓝图]（按需读取）
3. 踩坑记录 -> [日志]（遇到报错先搜这里）
4. 项目需求 -> [目标] (R 语言支持的VS)

## Loop

1. 修复 `Bug` 后必须更新[日志];
2. 完成阶段性任务后必须同步[蓝图]与[目标]
3. 涉及开发规范，回读[约束]

## Fallback

若上述文件均无指引,必须先提问再动手,禁止臆想
