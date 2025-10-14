# Implementation Plan: 财务数据文档

**Branch**: `012-` | **Date**: 2025-10-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-/spec.md`

## Summary

为文档站新增财务数据文档,包含三大财务报表(利润表、资产负债表、现金流量表)的完整 API 说明、参数表格、返回字段表格和实际业务场景示例。文档已基本完成(利润表和资产负债表),但需要补充现金流量表文档、启用导航配置,并确保所有文档通过测试验证。采用测试优先方法,先编写文档可用性测试,再完善文档内容,最后验证文档质量。

## Technical Context

**Language/Version**: TypeScript 5.3+ / Node.js 18+ LTS
**Primary Dependencies**: rspress (静态站点生成器), @playwright/test (E2E测试), vitest (单元测试)
**Storage**: 静态文件 (Markdown 文档源文件在 `apps/docs/docs/` 目录)
**Testing**: Playwright (E2E文档可用性测试) + vitest (文档内容验证测试)
**Target Platform**: Web (文档站静态页面)
**Project Type**: 文档站 (Web应用的子项目)
**Performance Goals**: 文档页面加载时间 < 1s, 构建时间 < 30s
**Constraints**:
- 文档内容必须与 SDK 实际实现保持同步 (SDK已实现三大报表API)
- 示例代码必须可执行且不包含真实 token
- 必须遵循现有文档站的导航结构和样式规范
- 遵守测试优先原则,先写测试再完善文档
**Scale/Scope**: 3个财务报表文档页面 + 1个现金流量表新增页面 + 导航配置更新

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 测试优先开发 (宪法原则 I - NON-NEGOTIABLE)

✅ **PASS** - 本计划严格遵守测试优先原则:
- Phase 0: 先编写文档可用性测试和内容验证测试
- Phase 1: 基于测试要求完善现金流量表文档和导航配置
- Phase 2: 执行测试并验证文档质量

### TypeScript 技术栈 (宪法原则 II)

✅ **PASS** - 测试代码使用 TypeScript:
- E2E测试使用 Playwright + TypeScript
- 文档内容验证使用 vitest + TypeScript
- 所有示例代码使用 TypeScript

### 清晰的代码注释 (宪法原则 III)

✅ **PASS** - 文档本身就是注释的最佳形式:
- 所有 API 文档包含完整的参数说明和返回值说明
- 示例代码包含清晰的注释
- 测试代码包含测试意图的注释

### 清晰的代码结构 (宪法原则 IV)

✅ **PASS** - 文档结构清晰:
- 遵循现有文档站的目录结构 (`apps/docs/docs/api/finance/`)
- 导航配置结构化 (`rspress.config.ts` 和 `_meta.json`)
- 测试按类型组织 (E2E测试和内容验证测试分离)

### 完整的测试覆盖 (宪法原则 V)

✅ **PASS** - 测试覆盖全面:
- E2E测试覆盖文档页面的可访问性和导航
- 内容验证测试覆盖文档结构和示例代码的正确性
- 遵循测试优先流程,确保文档质量

## Project Structure

### Documentation (this feature)

```
specs/012-/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
apps/docs/
├── docs/
│   ├── api/
│   │   └── finance/
│   │       ├── _meta.json          # 财务数据章节元数据配置
│   │       ├── income.md           # 利润表文档 (已存在)
│   │       ├── balance.md          # 资产负债表文档 (已存在)
│   │       └── cashflow.md         # 现金流量表文档 (待新增)
│   ├── guide/                      # 指南文档
│   └── index.md                    # 文档站首页
├── rspress.config.ts               # rspress 配置文件 (需要启用财务数据导航)
└── e2e/
    └── finance-docs.spec.ts        # 财务数据文档 E2E 测试 (待新增)

packages/tushare-sdk/src/
├── api/
│   └── financial.ts                # 财务数据 API (已实现,包含三大报表)
└── models/
    └── financial.ts                # 财务数据模型 (已实现,包含完整字段定义)

apps/node-demo/src/examples/
└── financial-data.ts               # 财务数据示例 (已实现,可作为文档示例参考)

tests/
├── e2e/
│   └── docs/
│       └── finance-navigation.spec.ts  # 财务数据文档导航测试
└── unit/
    └── docs/
        └── finance-content.spec.ts     # 财务数据文档内容验证测试
```

**Structure Decision**:
采用现有的 rspress 文档站结构,财务数据文档位于 `apps/docs/docs/api/finance/` 目录下,遵循 API 文档的组织方式。测试分为 E2E 测试 (验证页面可访问性和导航) 和单元测试 (验证文档内容的结构和正确性)。

## Complexity Tracking

*No violations - no table needed.*

本功能未违反任何宪法原则,无需复杂度追踪。

## Phase 0: Research & Testing Preparation

### 研究任务

1. **现有文档站结构分析** ✅ (已完成)
   - 已确认: rspress 配置文件位于 `apps/docs/rspress.config.ts`
   - 已确认: 财务数据文档位于 `apps/docs/docs/api/finance/`
   - 已确认: 利润表和资产负债表文档已存在,但在配置中被注释
   - 待研究: 财务数据导航为何被注释,是否有未完成的工作

2. **SDK 财务数据 API 实现分析** ✅ (已完成)
   - 已确认: SDK 已实现 `getIncomeStatement`, `getBalanceSheet`, `getCashFlow` 三个 API
   - 已确认: 数据模型完整,包含 94+ 字段 (利润表), 81+ 字段 (资产负债表), 87+ 字段 (现金流量表)
   - 已确认: 演示应用中有完整的财务数据使用示例,可作为文档示例参考

3. **现金流量表文档需求分析**
   - 需研究: 现金流量表的关键字段和业务含义
   - 需研究: 现金流量表的典型使用场景 (经营/投资/筹资活动分析)
   - 需研究: Tushare 官方文档对现金流量表的定义和说明

4. **文档测试策略研究**
   - 需研究: E2E 测试如何验证文档页面的可访问性
   - 需研究: 如何验证文档中的代码示例是否可执行
   - 需研究: 如何确保文档内容与 SDK 实际实现一致

### 输出: research.md

Research.md 将包含:
- 现金流量表的关键概念和字段说明 (基于 Tushare 官方文档)
- 财务数据文档的测试策略和测试用例设计
- 文档站导航配置的最佳实践
- 示例代码的编写规范 (基于演示应用的实际代码)

## Phase 1: Design & Implementation Planning

### 数据模型设计

输出: `data-model.md`

**核心实体**:

1. **财务报表文档页面** (Document Page)
   - 属性: 标题、描述、API 签名、参数表格、返回字段表格、代码示例、注意事项
   - 关系: 属于"财务数据"章节,通过导航链接关联

2. **现金流量表数据模型** (CashFlowItem)
   - 属性: 87个字段,包含经营/投资/筹资三大活动的现金流数据
   - 关系: 已在 SDK 中定义 (`packages/tushare-sdk/src/models/financial.ts`)
   - 验证规则: 字段类型、必填性、业务逻辑约束

3. **文档导航结构** (Navigation Config)
   - 属性: 章节名称、排序、子项目列表
   - 关系: 在 `rspress.config.ts` 和 `_meta.json` 中配置
   - 状态转换: 从"被注释"状态转换为"启用"状态

### API 契约设计

输出: `contracts/`

**文档 API 契约** (Document Structure Contract):

```yaml
# contracts/cashflow-doc-structure.yaml
财务数据文档结构契约:
  标题: string (必填)
  描述: string (必填)
  函数签名:
    - 函数名: string
    - 参数类型: TypeScript接口
    - 返回类型: Promise<数组>
  参数表格:
    - 至少包含: 参数名、类型、必填、描述、示例
    - 必须与SDK实现一致
  返回字段表格:
    - 至少包含: 字段名、类型、说明
    - 字段数量: >= 50 (现金流量表核心字段)
  代码示例:
    - 至少2个场景示例
    - 代码必须使用TypeScript
    - 代码必须可执行 (除了token占位符)
  注意事项:
    - 必须说明数据时效性
    - 必须说明权限要求
    - 必须说明常见陷阱
```

**导航配置契约** (Navigation Config Contract):

```yaml
# contracts/navigation-config.yaml
导航配置契约:
  财务数据章节:
    text: "财务数据"
    items:
      - text: "利润表"
        link: "/api/finance/income"
      - text: "资产负债表"
        link: "/api/finance/balance"
      - text: "现金流量表"
        link: "/api/finance/cashflow"
  启用状态: true (当前为注释状态,需要启用)
```

### 快速开始指南

输出: `quickstart.md`

快速开始指南将包含:
1. 如何在文档站中找到财务数据文档
2. 如何理解财务报表文档的结构
3. 如何复制和执行示例代码
4. 如何处理常见错误 (token 配置、权限不足等)

### Agent Context Update

运行 `.specify/scripts/bash/update-agent-context.sh claude` 更新 `CLAUDE.md`:
- 添加技术: rspress (文档站生成器), Playwright (文档E2E测试), Markdown/MDX (文档格式)
- 更新项目结构: 添加 `apps/docs/docs/api/finance/` 文档目录
- 更新命令: `npm run docs:dev`, `npm run docs:build`, `npm test:e2e:docs`

### Constitution Re-check

重新评估 Phase 1 设计是否符合宪法要求:
- ✅ 测试优先: 先设计测试用例,再完善文档内容
- ✅ TypeScript: 所有代码示例和测试使用 TypeScript
- ✅ 清晰注释: 文档本身就是最佳的注释
- ✅ 清晰结构: 遵循现有文档站结构
- ✅ 测试覆盖: E2E测试 + 内容验证测试

---

**Phase 2 Planning Note**: Phase 2 (tasks.md generation) 将由 `/speckit.tasks` 命令执行,不在本计划范围内。
