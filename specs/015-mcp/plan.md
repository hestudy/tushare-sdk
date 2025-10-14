# Implementation Plan: 文档站点 MCP 使用指南

**Branch**: `015-mcp` | **Date**: 2025-10-14 | **Spec**: [spec.md](/Users/hestudy/Documents/project/tushare-sdk/specs/015-mcp/spec.md)
**Input**: 在README中补充mcp的用法,以及文档站中增加mcp使用指南

## Summary

本功能旨在为 Tushare SDK 项目补充 MCP (Model Context Protocol) 服务的使用文档,包括:
1. 在项目根目录 README.md 中添加 MCP 服务的功能介绍和快速使用指引
2. 在文档站点 (apps/docs) 中新增完整的 MCP 使用指南页面,涵盖安装、配置、工具说明、示例对话和问题排查

**技术方案**: 基于现有的 `apps/tushare-mcp/README.md` 内容进行提炼和扩展,在项目 README 中添加简洁的 MCP 功能介绍,在文档站点中新增独立的 MCP 使用指南页面 (`apps/docs/docs/guide/mcp-usage.md`),并更新 rspress 配置文件的导航和侧边栏配置。

## Technical Context

**Language/Version**: Markdown (文档格式) / TypeScript 5.3+ (文档站点构建)
**Primary Dependencies**: rspress (静态站点生成器), 现有的 MCP 服务文档 (apps/tushare-mcp/README.md)
**Storage**: 静态文件 (Markdown 文档源文件)
**Testing**: 文档链接验证 (手动检查), rspress 构建验证 (确保站点正常生成)
**Target Platform**: 静态文档站点 (浏览器访问), GitHub README
**Project Type**: 文档站点 (rspress) - 单一文档项目
**Performance Goals**: 文档页面加载时间 < 2 秒
**Constraints**: 文档内容需与现有 MCP 服务实现(feature 013-apps-sdk-mcp)保持一致, 不涉及代码修改
**Scale/Scope**: 新增 2 个文档文件(README 更新 + 新增 MCP 使用指南), 更新 1 个配置文件(rspress.config.ts)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Test-First Development (NON-NEGOTIABLE) - ✅ PASS (文档项目豁免)

**状态**: PASS (EXEMPT)
**理由**: 本功能仅涉及文档编写,不涉及可执行代码实现。文档的"测试"通过以下方式验证:
- 文档站点能否成功构建 (rspress build)
- 文档内链接是否有效 (手动检查)
- 配置示例是否可用 (通过现有 MCP 服务验证)

**合规性**: 文档项目不需要编写自动化测试,但会确保所有示例代码和配置经过现有 MCP 服务的验证。

### II. TypeScript 技术栈 - ✅ PASS (部分适用)

**状态**: PASS
**理由**:
- 文档站点基于 rspress,使用 TypeScript 配置文件 (rspress.config.ts)
- 文档内容为 Markdown 格式,不涉及 TypeScript 代码编写
- 配置文件修改遵循 TypeScript 类型安全原则

**合规性**: rspress 配置文件已使用 TypeScript,修改时保持类型安全。

### III. 清晰的代码注释 - ✅ PASS (文档项目适配)

**状态**: PASS
**理由**:
- 文档本身即为"注释",为用户提供清晰的使用说明
- 所有配置示例、命令、参数都会提供详细说明
- rspress.config.ts 的修改会添加必要的注释

**合规性**: 文档内容将遵循清晰、简洁的原则,所有示例都会有详细说明。

### IV. 清晰的代码结构 - ✅ PASS

**状态**: PASS
**理由**:
- 文档结构遵循 rspress 标准组织方式
- MCP 使用指南作为独立页面放置在 `apps/docs/docs/guide/mcp-usage.md`
- 侧边栏配置在 rspress.config.ts 中统一管理

**合规性**: 遵循现有文档站点的目录结构和命名规范。

### V. 完整的测试覆盖 - ✅ PASS (文档项目适配)

**状态**: PASS (ADAPTED)
**理由**:
- 文档的"测试"通过构建验证: `pnpm docs:build` 成功执行
- 所有配置示例基于现有 MCP 服务,已在 feature 013 中验证通过
- 链接和路径会在 Phase 1 设计时明确并验证

**合规性**: 确保文档站点构建成功,所有示例代码可用。

### 总结

所有章程检查项目均通过或获得合理豁免。文档项目本质上是为用户提供清晰的使用指导,不涉及可测试的业务逻辑,因此"测试优先"原则适配为"验证优先"(确保示例可用、站点可构建)。

## Project Structure

### Documentation (this feature)

```
specs/015-mcp/
├── plan.md              # 本文件 (/speckit.plan 命令输出)
├── research.md          # Phase 0 输出 (文档资源调研)
├── data-model.md        # Phase 1 输出 (文档结构和内容框架)
├── quickstart.md        # Phase 1 输出 (快速验证步骤)
├── contracts/           # Phase 1 输出 (文档大纲和示例清单)
└── tasks.md             # Phase 2 输出 (/speckit.tasks 命令 - 不在本命令中创建)
```

### Source Code (repository root)

```
# 文档项目结构 (现有)
apps/docs/
├── docs/
│   ├── guide/
│   │   ├── installation.md
│   │   ├── quick-start.md
│   │   ├── configuration.md
│   │   ├── error-handling.md
│   │   └── mcp-usage.md       # [新增] MCP 使用指南
│   ├── api/
│   │   └── ... (现有 API 文档)
│   └── index.md
├── rspress.config.ts           # [修改] 添加 MCP 使用指南的导航和侧边栏配置
└── package.json

# MCP 服务目录 (参考)
apps/tushare-mcp/
├── README.md                   # [参考] 现有的 MCP 服务文档
├── src/
│   └── ... (MCP 服务实现)
└── package.json

# 项目根目录
README.md                       # [修改] 添加 MCP 功能介绍章节
```

**Structure Decision**:
本功能遵循文档站点标准结构,新增文档放置在 `apps/docs/docs/guide/` 目录下,与现有的指南文档保持一致。选择 `guide` 而非 `api` 是因为 MCP 使用指南面向最终用户,属于"如何使用"而非"API 参考"。

**修改清单**:
1. 修改 `/README.md`: 添加"MCP 服务"章节,简要介绍功能和快速使用
2. 新增 `/apps/docs/docs/guide/mcp-usage.md`: 完整的 MCP 使用指南
3. 修改 `/apps/docs/rspress.config.ts`: 更新侧边栏配置,添加 MCP 使用指南链接

## Complexity Tracking

*本部分为空,因为没有违反章程的情况需要说明。*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

## Phase 0: Research & Outline

### 研究目标

本阶段需要明确以下问题,为后续文档编写提供依据:

1. **现有 MCP 文档资源分析**:
   - `apps/tushare-mcp/README.md` 包含哪些内容?哪些适合提炼到项目 README?
   - 哪些内容需要在文档站点中扩展说明?

2. **文档站点结构设计**:
   - MCP 使用指南应放在哪个目录?(已确定: `apps/docs/docs/guide/mcp-usage.md`)
   - 侧边栏如何配置?与现有指南页面如何排序?

3. **目标用户场景覆盖**:
   - 根据 spec.md 的 4 个用户故事(P1-P4),文档需要覆盖哪些具体内容?
   - 不同 AI 客户端(Claude Desktop, Cline 等)的配置示例如何提供?

4. **外部参考资源**:
   - MCP 协议官网链接: https://modelcontextprotocol.io
   - Tushare Pro 官网链接: https://tushare.pro
   - Claude Desktop 下载链接: https://claude.ai/download
   - 其他 MCP 客户端资源链接

5. **文档结构最佳实践**:
   - rspress 文档站点的侧边栏配置最佳实践
   - 技术文档的"前置要求 → 安装 → 配置 → 使用示例 → 问题排查"标准结构

### 研究任务

将派发以下研究任务(由 research agents 完成):

1. **任务 1: MCP 协议简介和外部资源整理**
   - 收集 MCP 协议官网的简介内容(用于文档中的"什么是 MCP"部分)
   - 整理不同 AI 客户端的配置文档链接(Claude Desktop, Cline, 其他)
   - 确定 Tushare Token 获取的官方链接

2. **任务 2: 多客户端配置示例调研**
   - 调研 Claude Desktop 在不同操作系统(macOS/Windows/Linux)的配置文件路径
   - 调研其他主流 MCP 客户端(如 VSCode Cline)的配置方式
   - 确定通用配置说明的最佳实践

3. **任务 3: rspress 文档站点配置最佳实践**
   - 确认 rspress 侧边栏配置的正确语法
   - 确认如何在文档中使用 Markdown frontmatter (title, description)
   - 确认代码高亮和代码块的最佳实践

### 输出

研究结果将整理到 `specs/015-mcp/research.md` 文件中,包含:
- 决策: 选择了哪些技术方案或内容结构
- 理由: 为什么这样选择
- 备选方案: 考虑了哪些其他方案

## Phase 1: Design & Contracts

**前置条件**: `research.md` 完成

### 设计任务

1. **提取文档实体** → `data-model.md`:
   - 文档页面实体: README MCP 章节, MCP 使用指南页面
   - 配置示例实体: Claude Desktop 配置, 环境变量配置, npx 安装方式
   - 工具说明实体: query_stock_quote, query_financial, query_kline, query_index
   - 示例对话实体: 股票行情查询示例, 财务数据查询示例, K线数据查询示例

2. **生成文档大纲** → `contracts/`:
   - `contracts/readme-mcp-section.md`: 项目 README 中 MCP 章节的大纲
   - `contracts/mcp-usage-guide-outline.md`: 文档站点 MCP 使用指南的详细大纲
   - `contracts/rspress-config-changes.md`: rspress.config.ts 的修改清单

3. **快速开始验证** → `quickstart.md`:
   - 如何验证文档站点构建成功 (`pnpm docs:build`)
   - 如何在本地预览文档站点 (`pnpm docs:dev`)
   - 如何验证配置示例可用(基于现有 MCP 服务)

4. **代理上下文更新**:
   - 运行 `.specify/scripts/bash/update-agent-context.sh claude`
   - 更新 CLAUDE.md,添加本功能的技术栈信息(rspress, Markdown)

### 输出

- `data-model.md`: 文档结构和内容框架
- `contracts/`: 文档大纲和配置修改清单
- `quickstart.md`: 验证步骤
- `CLAUDE.md`: 更新后的项目上下文

## Next Steps (after Phase 1)

Phase 1 完成后,规划流程结束。后续步骤:

1. 用户审查 Phase 1 的设计输出(文档大纲、内容框架)
2. 如用户批准,执行 `/speckit.tasks` 命令生成具体任务清单
3. 按任务清单执行文档编写和配置修改
4. 本地验证文档站点构建和预览效果

## Key Decisions

1. **MCP 使用指南放置位置**: `apps/docs/docs/guide/mcp-usage.md`
   - 理由: 与现有指南页面保持一致,便于用户发现
   - 备选方案: 放在独立的 `/mcp/` 目录 → 拒绝,因为内容较少,无需单独分类

2. **README 中的 MCP 章节位置**: 放在"特性"章节之后,"快速开始"章节之前
   - 理由: MCP 是重要特性之一,应在用户阅读 README 时早期展示
   - 备选方案: 放在文档末尾 → 拒绝,用户可能不会滚动到底部

3. **多客户端配置支持策略**: 详细说明 Claude Desktop,其他客户端提供通用说明或外部链接
   - 理由: Claude Desktop 是主流且官方支持,其他客户端配置方式多变
   - 备选方案: 为所有客户端提供详细配置 → 拒绝,维护成本高且超出范围

4. **示例对话数量**: 至少 3 个,覆盖主要工具(股票行情、财务数据、K线数据)
   - 理由: 满足 spec.md 的 FR-011 要求,覆盖 75% 常见场景
   - 备选方案: 为每个工具提供示例 → 推迟到后续迭代,本次先覆盖核心场景

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| MCP 服务版本更新导致文档过期 | Medium | High | 在文档中标注适用的版本号,建立文档同步更新机制 |
| 用户不熟悉 MCP 协议概念 | High | Medium | 提供 MCP 协议简介和外部参考链接,降低理解门槛 |
| 不同操作系统配置路径错误 | Low | Medium | 提供所有主流操作系统的配置路径,并在常见问题中强调 |
| 文档站点导航结构混乱 | Low | Low | 遵循现有侧边栏结构,保持导航一致性 |

---

**Status**: Phase 0 待执行
**Next Command**: 执行 research agents 任务,生成 `research.md`
