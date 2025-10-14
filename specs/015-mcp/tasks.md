---
description: "Task list for MCP Usage Guide documentation feature"
---

# Tasks: 文档站点 MCP 使用指南

**Feature**: 015-mcp
**Branch**: `015-mcp`
**Input**: Design documents from `/specs/015-mcp/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: 文档项目不需要自动化测试,通过构建验证和手动检查来确保质量。

**Organization**: 任务按用户故事组织,确保每个故事都能独立完成和验证。

## Format: `[ID] [P?] [Story] Description`
- **[P]**: 可以并行执行 (不同文件,无依赖关系)
- **[Story]**: 任务所属的用户故事 (US1, US2, US3, US4)
- 包含确切的文件路径

## Path Conventions
- **文档站点**: `/apps/docs/docs/guide/mcp-usage.md`
- **项目 README**: `/README.md`
- **rspress 配置**: `/apps/docs/rspress.config.ts`

---

## Phase 1: Setup (项目初始化)

**Purpose**: 创建文档文件和更新配置

- [ ] T001 [P] [Setup] 创建 MCP 使用指南文档文件 `/apps/docs/docs/guide/mcp-usage.md`,包含 frontmatter
- [ ] T002 [P] [Setup] 备份项目 README.md,创建 `/README.md.backup`

---

## Phase 2: Foundational (基础内容)

**Purpose**: 核心文档内容,必须在其他内容之前完成

**⚠️ CRITICAL**: 这些是所有用户故事的基础,必须首先完成

- [ ] T003 [Foundational] 在 `/apps/docs/rspress.config.ts` 中更新侧边栏配置,添加 MCP 使用指南链接

**Checkpoint**: 基础结构就绪 - 可以开始编写具体用户故事内容

---

## Phase 3: User Story 1 - AI 开发者快速理解 MCP 服务能力 (Priority: P1) 🎯 MVP

**Goal**: 让开发者能够快速了解项目提供的 MCP 服务是什么、能做什么,以及如何使用

**Independent Test**: 访问文档站点,检查是否包含 MCP 服务介绍、功能概述和使用场景说明

### Implementation for User Story 1

- [ ] T004 [P] [US1] 编写 MCP 使用指南的"简介"章节 (`/apps/docs/docs/guide/mcp-usage.md`)
  - 一句话说明文档用途
  - 标注预计完成时间和前置要求

- [ ] T005 [P] [US1] 编写 MCP 使用指南的"什么是 MCP"章节 (`/apps/docs/docs/guide/mcp-usage.md`)
  - 引用 research.md 中的 MCP 协议简介(150 字)
  - 说明 Tushare MCP 服务的具体功能(4 项)
  - 提供 MCP 协议官网链接
  - 字数: 200-300 字

- [ ] T006 [US1] 在项目 README.md 中添加"MCP 服务"章节 (`/README.md`)
  - 位置: 在"特性"章节之后,"快速开始"章节之前
  - 包含: 简介、功能特性列表(4 项)
  - 字数: 100-150 字

**Checkpoint**: 用户现在可以理解 MCP 服务的基本概念和功能

---

## Phase 4: User Story 2 - 开发者按照文档完成 MCP 服务配置 (Priority: P2)

**Goal**: 开发者能够按照文档提供的步骤,完成安装、配置环境变量、设置客户端配置文件,最终成功连接 MCP 服务

**Independent Test**: 新用户按照文档从零开始配置 MCP 服务,验证每个步骤是否清晰、准确且可执行,最终成功连接到 MCP 服务

### Implementation for User Story 2

- [ ] T007 [P] [US2] 编写 MCP 使用指南的"前置要求"章节 (`/apps/docs/docs/guide/mcp-usage.md`)
  - Node.js 版本要求和验证命令
  - Tushare API Token 获取步骤(详细说明 3 个步骤)
  - 支持的 AI 客户端列表(重点推荐 Claude Desktop)
  - 字数: 300-400 字

- [ ] T008 [P] [US2] 编写 MCP 使用指南的"安装"章节 (`/apps/docs/docs/guide/mcp-usage.md`)
  - 方式 1: 通过 npm 安装(推荐)
  - 方式 2: 本地开发
  - 说明各自的适用场景
  - 字数: 150-200 字

- [ ] T009 [US2] 编写 MCP 使用指南的"配置"章节 - Claude Desktop 部分 (`/apps/docs/docs/guide/mcp-usage.md`)
  - 步骤 1: 配置文件路径表格(macOS/Windows/Linux)
  - 步骤 2: npx 方式配置示例 + 本地开发方式配置示例
  - 步骤 3: 重启 Claude Desktop 的说明和验证方法
  - 字数: 600-700 字

- [ ] T010 [P] [US2] 编写 MCP 使用指南的"配置"章节 - 其他客户端部分 (`/apps/docs/docs/guide/mcp-usage.md`)
  - Cursor 配置(折叠块)
  - VSCode with Cline 配置(折叠块)
  - Zed Editor 配置(折叠块)
  - 字数: 200-300 字

- [ ] T011 [US2] 在项目 README.md 的"MCP 服务"章节中添加"快速使用"部分 (`/README.md`)
  - 安装命令(1 行)
  - Claude Desktop 配置示例(简化的 JSON 配置,3-5 行)
  - 重启客户端提示
  - 链接到详细文档
  - 字数: 100-150 字

**Checkpoint**: 用户现在可以成功配置一种 AI 客户端并连接到 MCP 服务

---

## Phase 5: User Story 3 - 用户通过示例学习 MCP 工具的使用方法 (Priority: P3)

**Goal**: 开发者能够理解如何在 AI 对话中调用各种数据查询工具(如查询股票行情、财务数据、K线数据)

**Independent Test**: 用户阅读文档中的示例对话,然后在自己的 AI 客户端中复现相同的查询,验证能否得到预期的数据响应

### Implementation for User Story 3

- [ ] T012 [US3] 编写 MCP 使用指南的"可用工具"章节 (`/apps/docs/docs/guide/mcp-usage.md`)
  - 工具 1: query_stock_quote (用途、参数表格、示例参数)
  - 工具 2: query_financial (用途、参数表格、示例参数)
  - 工具 3: query_kline (用途、参数表格、示例参数)
  - 工具 4: query_index (用途、参数表格、常用指数代码、示例参数)
  - 字数: 600-800 字

- [ ] T013 [P] [US3] 编写 MCP 使用指南的"使用示例"章节 - 示例 1 股票行情 (`/apps/docs/docs/guide/mcp-usage.md`)
  - 用户提问示例
  - AI 工具调用说明(JSON 格式)
  - 返回数据格式示例(表格)
  - 字数: 180-220 字

- [ ] T014 [P] [US3] 编写 MCP 使用指南的"使用示例"章节 - 示例 2 财务数据 (`/apps/docs/docs/guide/mcp-usage.md`)
  - 用户提问示例
  - AI 工具调用说明(JSON 格式)
  - 返回数据格式示例(表格)
  - 字数: 180-220 字

- [ ] T015 [P] [US3] 编写 MCP 使用指南的"使用示例"章节 - 示例 3 K线数据 (`/apps/docs/docs/guide/mcp-usage.md`)
  - 用户提问示例
  - AI 工具调用说明(JSON 格式)
  - 返回数据格式示例(表格)
  - 字数: 180-220 字

- [ ] T016 [US3] 编写 MCP 使用指南的"使用示例"章节 - 更多使用技巧 (`/apps/docs/docs/guide/mcp-usage.md`)
  - 组合查询说明
  - 数据分析能力说明
  - 自然语言优势说明
  - 字数: 100-150 字

- [ ] T017 [US3] 在项目 README.md 的"MCP 服务"章节中添加"使用示例"部分 (`/README.md`)
  - 3 个自然语言问题示例
  - 说明 AI 会自动调用服务
  - 字数: 50-100 字

**Checkpoint**: 用户现在可以通过示例学习如何使用各种 MCP 工具

---

## Phase 6: User Story 4 - 开发者通过进阶技巧优化 MCP 使用体验 (Priority: P4)

**Goal**: 有经验的用户能够更高效地使用 MCP 服务,比如理解限流策略、调整日志级别、处理高并发查询场景

**Independent Test**: 高级用户按照文档调整配置(如限流参数、日志级别),验证配置是否生效,并观察性能或调试体验的改善

### Implementation for User Story 4

- [ ] T018 [P] [US4] 编写 MCP 使用指南的"进阶配置"章节 (`/apps/docs/docs/guide/mcp-usage.md`)
  - 环境变量说明表格(4 个变量)
  - 调整限流参数示例和积分等级参考
  - 调试日志设置和日志文件位置
  - 字数: 300-400 字

- [ ] T019 [P] [US4] 编写 MCP 使用指南的"常见问题"章节 (`/apps/docs/docs/guide/mcp-usage.md`)
  - Q1: Token 无效或认证失败
  - Q2: 配置文件找不到或修改不生效
  - Q3: MCP 服务启动失败
  - Q4: 查询返回空数据
  - Q5: 如何查看 AI 调用了哪些工具?
  - Q6: 支持哪些 AI 客户端?
  - 每个问题包含问题描述、可能原因、解决方案
  - 字数: 500-600 字

- [ ] T020 [P] [US4] 编写 MCP 使用指南的"相关链接"章节 (`/apps/docs/docs/guide/mcp-usage.md`)
  - 官方资源(MCP 协议、MCP 文档、MCP 客户端)
  - Tushare Pro(官网、注册、文档)
  - AI 客户端(Claude Desktop、Cursor、Cline、Zed)
  - 本项目(GitHub、MCP 源码、SDK 文档、问题反馈)
  - 字数: 100-150 字

- [ ] T021 [US4] 在项目 README.md 的"MCP 服务"章节中添加"相关链接"部分 (`/README.md`)
  - MCP 使用指南链接
  - MCP 服务源码链接
  - Tushare Pro 链接
  - Model Context Protocol 链接
  - 字数: 50 字

**Checkpoint**: 用户现在可以通过进阶技巧优化 MCP 使用体验,并能够自行排查常见问题

---

## Phase 7: Polish & Cross-Cutting Concerns (优化与验证)

**Purpose**: 确保文档质量和站点正常运行

- [ ] T022 [P] [Polish] 验证所有外部链接有效性 (使用 linkinator 或手动检查)
  - MCP 协议官网链接
  - Tushare Pro 相关链接
  - AI 客户端下载链接
  - GitHub 仓库链接

- [ ] T023 [P] [Polish] 验证文档字数符合要求
  - README MCP 章节: 200-300 字
  - MCP 使用指南: 3000-5000 字
  - 使用 `wc -m` 命令检查

- [ ] T024 [Polish] 运行 TypeScript 类型检查 (`pnpm --filter @hestudy/tushare-sdk type-check`)
  - 确保 rspress.config.ts 无类型错误

- [ ] T025 [Polish] 构建文档站点 (`pnpm docs:build`)
  - 确保构建成功,无错误
  - 验证 MCP 使用指南页面生成

- [ ] T026 [Polish] 本地预览文档站点 (`pnpm docs:dev`)
  - 访问 http://localhost:3000
  - 检查侧边栏是否显示"MCP 使用指南"链接
  - 检查页面内容格式(代码块高亮、表格对齐、链接有效)
  - 检查右侧目录是否正确显示所有章节
  - 检查移动端响应式设计

- [ ] T027 [Polish] 执行 quickstart.md 中的所有验证步骤
  - 文件完整性检查
  - Markdown 语法检查
  - TypeScript 类型检查
  - 文档站点构建验证
  - 本地预览验证
  - 配置示例可用性验证(可选)
  - README 修改验证

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 可以立即开始
- **Foundational (Phase 2)**: 依赖 Setup 完成 - 阻塞所有用户故事
- **User Stories (Phase 3-6)**: 都依赖 Foundational 完成
  - 用户故事可以并行执行(如果有多个编辑者)
  - 或按优先级顺序执行(P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: 依赖所有用户故事完成

### User Story Dependencies

- **User Story 1 (P1)**: 在 Foundational 完成后可以开始 - 无其他故事依赖
- **User Story 2 (P2)**: 在 Foundational 完成后可以开始 - 建议在 US1 之后(引用 US1 的概念)
- **User Story 3 (P3)**: 在 Foundational 完成后可以开始 - 建议在 US2 之后(需要配置完成才能使用工具)
- **User Story 4 (P4)**: 在 Foundational 完成后可以开始 - 建议在 US1-3 之后(进阶内容)

### Within Each User Story

- US1: T004、T005 可以并行 → T006 最后完成(引用前两者内容)
- US2: T007、T008 可以并行 → T009 → T010 可以与 T009 并行 → T011 最后完成
- US3: T012 先完成 → T013、T014、T015 可以并行 → T016 → T017 最后完成
- US4: T018、T019、T020 可以并行 → T021 最后完成

### Parallel Opportunities

- Phase 1: T001、T002 可以并行
- Phase 2: T003 单独执行(配置文件修改)
- US1: T004、T005 可以并行
- US2: T007、T008 可以并行;T010 可以与 T009 并行
- US3: T013、T014、T015 可以并行
- US4: T018、T019、T020 可以并行
- Polish: T022、T023 可以并行;T024、T025 顺序执行

---

## Parallel Example: User Story 3

```bash
# 在 MCP 使用指南中同时编写 3 个示例:
Task: "编写示例 1 股票行情 in /apps/docs/docs/guide/mcp-usage.md"
Task: "编写示例 2 财务数据 in /apps/docs/docs/guide/mcp-usage.md"
Task: "编写示例 3 K线数据 in /apps/docs/docs/guide/mcp-usage.md"

# 注意: 虽然是同一个文件,但这 3 个示例是独立的章节,可以由不同编辑者同时编写,
# 最后通过 git merge 合并即可
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational (关键 - 阻塞所有故事)
3. 完成 Phase 3: User Story 1
4. **STOP and VALIDATE**: 独立测试 User Story 1
   - 访问文档站点,检查 MCP 服务介绍是否清晰
   - 检查 README 是否包含 MCP 功能介绍
5. 如果就绪可以部署/演示 MVP

### Incremental Delivery

1. 完成 Setup + Foundational → 基础就绪
2. 添加 User Story 1 → 独立测试 → 部署/演示 (MVP!)
3. 添加 User Story 2 → 独立测试 → 部署/演示 (配置指南)
4. 添加 User Story 3 → 独立测试 → 部署/演示 (使用示例)
5. 添加 User Story 4 → 独立测试 → 部署/演示 (进阶技巧)
6. 每个故事都增加价值,不会破坏之前的故事

### Parallel Team Strategy

如果有多个编辑者:

1. 团队一起完成 Setup + Foundational
2. Foundational 完成后:
   - 编辑者 A: User Story 1 (概念介绍)
   - 编辑者 B: User Story 2 (配置步骤)
   - 编辑者 C: User Story 3 (使用示例)
   - 编辑者 D: User Story 4 (进阶技巧)
3. 各故事独立完成并合并

---

## Task Summary

### Total Tasks: 27

### Tasks per User Story:
- **Setup (Phase 1)**: 2 tasks
- **Foundational (Phase 2)**: 1 task
- **User Story 1 (P1)**: 3 tasks
- **User Story 2 (P2)**: 5 tasks
- **User Story 3 (P3)**: 6 tasks
- **User Story 4 (P4)**: 4 tasks
- **Polish (Phase 7)**: 6 tasks

### Parallel Opportunities Identified: 15
- Phase 1: 2 tasks
- US1: 2 tasks
- US2: 4 tasks
- US3: 3 tasks
- US4: 3 tasks
- Polish: 2 tasks

### Independent Test Criteria:

**User Story 1**:
- 访问文档站点的相关页面,检查是否包含 MCP 服务介绍、功能概述和使用场景说明
- 检查 README 是否包含 MCP 功能介绍

**User Story 2**:
- 新用户按照文档从零开始配置 MCP 服务
- 验证每个步骤是否清晰、准确且可执行
- 最终成功连接到 MCP 服务

**User Story 3**:
- 用户阅读文档中的示例对话
- 在自己的 AI 客户端中复现相同的查询
- 验证能否得到预期的数据响应

**User Story 4**:
- 高级用户按照文档调整配置(如限流参数、日志级别)
- 验证配置是否生效
- 观察性能或调试体验的改善

### Suggested MVP Scope:
- Phase 1: Setup (2 tasks)
- Phase 2: Foundational (1 task)
- Phase 3: User Story 1 (3 tasks)
- **Total MVP tasks**: 6 tasks
- **MVP delivers**: MCP 服务的基本概念介绍,让用户能够快速了解 MCP 服务的能力

---

## Notes

- [P] 任务 = 不同文件或独立章节,无依赖关系
- [Story] 标签映射任务到具体用户故事,便于追溯
- 每个用户故事都应该是独立可完成和可测试的
- 文档项目的"测试"通过构建验证和手动检查完成
- 在每个任务或逻辑组之后提交
- 在任何检查点停止以独立验证故事
- 避免: 模糊的任务、同一文件冲突、破坏独立性的跨故事依赖

---

## Validation Checklist

完成所有任务后,使用此清单验证:

### 文件完整性
- [ ] `/README.md` 已修改,包含 MCP 服务章节
- [ ] `/apps/docs/docs/guide/mcp-usage.md` 已创建
- [ ] `/apps/docs/rspress.config.ts` 已修改,侧边栏配置更新

### 内容质量
- [ ] README MCP 章节字数在 200-300 字
- [ ] MCP 使用指南字数在 3000-5000 字
- [ ] 包含至少 3 个使用示例 (T013, T014, T015)
- [ ] 包含至少 6 种常见问题排查 (T019)
- [ ] 所有配置示例可直接复制粘贴使用

### 技术验证
- [ ] TypeScript 类型检查通过 (T024)
- [ ] 文档站点构建成功 (T025)
- [ ] 本地预览正常显示 (T026)
- [ ] 所有代码块正确高亮
- [ ] 所有表格格式正确

### 链接验证
- [ ] 所有内部链接可正常跳转
- [ ] 所有外部链接有效(HTTP 200) (T022)
- [ ] 包含所有必需的外部参考链接 (T020)

### 用户体验
- [ ] 页面在桌面和移动设备上正常显示
- [ ] 侧边栏导航清晰,MCP 使用指南易于发现
- [ ] 目录结构合理,章节顺序符合逻辑
- [ ] 代码示例和说明清晰易懂
