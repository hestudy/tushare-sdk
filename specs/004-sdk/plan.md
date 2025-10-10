# Implementation Plan: SDK每日指标快捷方法

**Branch**: `004-sdk` | **Date**: 2025-10-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-sdk/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

为 Tushare SDK 添加每日指标(daily_basic)快捷方法,支持按交易日期和股票代码查询每日基本面指标数据(换手率、市盈率、市净率等)。实现方式将遵循现有 SDK 的架构模式:
- 在 `src/models/` 中定义类型接口(Params 和 Item)
- 在 `src/api/` 中实现快捷函数,调用 `client.query()` 方法
- 保持与 `getStockBasic`、`getDailyQuote`、`getTradeCalendar` 等现有方法一致的命名和结构风格

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.x+ (严格模式)
**Primary Dependencies**: 无新增依赖,使用现有 TushareClient
**Storage**: N/A (API 客户端,无本地存储)
**Testing**: Jest/Vitest (遵循现有测试框架)
**Target Platform**: Node.js 18+ LTS
**Project Type**: 单一项目 (monorepo 中的 packages/tushare-sdk)
**Performance Goals**: API 响应时间 < 30s (单个交易日全市场约4000只股票)
**Constraints**: 
- Tushare API 单次请求限制 6000 条数据
- 需要 2000+ 积分权限
- 必须遵循现有 SDK 的代码风格和架构模式
**Scale/Scope**: 
- 新增 1 个 API 方法 (getDailyBasic)
- 新增 2 个类型接口 (DailyBasicParams, DailyBasicItem)
- 新增对应的单元测试和集成测试

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 核心原则检查

✅ **I. Test-First Development**: 将严格遵循 TDD 流程
- 先编写测试用例(基于 spec.md 中的 acceptance scenarios)
- 测试失败后再实现功能代码
- 测试必须经过用户审批

✅ **II. TypeScript 技术栈**: 完全符合
- 使用 TypeScript 5.x+ 严格模式
- 为所有 API 提供完整类型定义
- 不使用 `any` 类型

✅ **III. 清晰的代码注释**: 将遵循现有风格
- 所有公共函数使用 JSDoc 中文注释
- 包含功能描述、参数说明、返回值、示例代码
- 参考 `getStockBasic`、`getDailyQuote` 的注释风格

✅ **IV. 清晰的代码结构**: 完全符合现有结构
- 类型定义放在 `src/models/daily-basic.ts`
- API 函数放在 `src/api/daily-basic.ts`
- 测试放在 `tests/` 对应目录
- 遵循现有命名约定(kebab-case 文件名)

✅ **V. 完整的测试覆盖**: 将达到 ≥80% 覆盖率
- 单元测试:覆盖所有参数组合
- 集成测试:覆盖 spec 中的 3 个 user stories
- 边界测试:覆盖 edge cases

**结论**: 无宪法违规,可以继续 Phase 0

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
packages/tushare-sdk/
├── src/
│   ├── models/
│   │   ├── calendar.ts       # 现有:交易日历模型
│   │   ├── stock.ts          # 现有:股票基础信息模型
│   │   ├── quote.ts          # 现有:行情数据模型
│   │   └── daily-basic.ts    # 新增:每日指标模型 ⭐
│   ├── api/
│   │   ├── calendar.ts       # 现有:交易日历API
│   │   ├── stock.ts          # 现有:股票基础信息API
│   │   ├── quote.ts          # 现有:行情数据API
│   │   └── daily-basic.ts    # 新增:每日指标API ⭐
│   ├── client/
│   │   └── TushareClient.ts  # 现有:核心客户端
│   └── index.ts              # 现有:导出入口(需更新) ⭐
│
└── tests/
    ├── unit/
    │   └── daily-basic.test.ts      # 新增:单元测试 ⭐
    └── integration/
        └── daily-basic.integration.test.ts  # 新增:集成测试 ⭐
```

**Structure Decision**: 
- 遵循现有 SDK 的单一项目结构(packages/tushare-sdk)
- 新增文件与现有文件保持相同的命名和组织模式
- models/ 存放类型定义,api/ 存放快捷方法实现
- 测试文件按类型分为 unit/ 和 integration/
- 需要更新 index.ts 导出新增的类型和方法

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**无违规项** - 本功能完全符合项目宪法的所有要求,无需复杂度豁免。

---

## Phase 0: Research (✅ 完成)

**输出文件**: [research.md](./research.md)

**完成内容**:
- ✅ 研究 Tushare API `daily_basic` 接口规范
- ✅ 分析现有 SDK 实现模式(getStockBasic, getDailyQuote, getTradeCalendar)
- ✅ 确定 TypeScript 类型设计最佳实践
- ✅ 制定测试策略(TDD + 单元测试 + 集成测试)
- ✅ 明确错误处理和性能考虑
- ✅ 解决所有 Technical Context 中的 NEEDS CLARIFICATION

**关键决策**:
1. 使用 `daily_basic` API,支持按日期和股票代码查询
2. 遵循现有三层架构: models/ + api/ + index.ts
3. 严格类型定义,所有可选字段使用 `?`
4. 依赖 TushareClient 的统一错误处理
5. 不做额外优化,保持简洁

---

## Phase 1: Design & Contracts (✅ 完成)

### 1.1 数据模型 (✅ 完成)

**输出文件**: [data-model.md](./data-model.md)

**完成内容**:
- ✅ 定义 `DailyBasicParams` 查询参数接口
- ✅ 定义 `DailyBasicItem` 数据项接口
- ✅ 文档化所有字段的含义和约束
- ✅ 提供测试数据示例
- ✅ 与现有模型保持一致的风格

**核心实体**:
- `DailyBasicParams`: 5个可选字段(ts_code, trade_date, start_date, end_date, fields)
- `DailyBasicItem`: 17个字段(2个必填,15个可选)

### 1.2 API 契约 (✅ 完成)

**输出文件**: [contracts/daily-basic-api.md](./contracts/daily-basic-api.md)

**完成内容**:
- ✅ 定义 `getDailyBasic` 函数签名
- ✅ 文档化参数、返回值、错误处理
- ✅ 提供丰富的使用示例
- ✅ 定义测试契约
- ✅ 明确行为规范

**API 签名**:
```typescript
export async function getDailyBasic(
  client: TushareClient,
  params?: DailyBasicParams
): Promise<DailyBasicItem[]>
```

### 1.3 快速开始指南 (✅ 完成)

**输出文件**: [quickstart.md](./quickstart.md)

**完成内容**:
- ✅ 安装和初始化说明
- ✅ 4个常见使用场景示例
- ✅ 完整的股票筛选器示例
- ✅ 错误处理和性能优化建议
- ✅ TypeScript 类型支持说明
- ✅ 常见问题解答

### 1.4 Agent 上下文更新 (✅ 完成)

**执行命令**: `.specify/scripts/bash/update-agent-context.sh windsurf`

**更新内容**:
- ✅ 添加 TypeScript 5.x+ 技术栈信息
- ✅ 添加项目类型和依赖信息
- ✅ 更新 Windsurf 规则文件

---

## Phase 1 后宪法检查 (✅ 通过)

重新评估设计是否符合宪法:

✅ **I. Test-First Development**: 
- 已在 contracts 中定义测试契约
- 下一步将先编写测试(Phase 2 tasks.md)

✅ **II. TypeScript 技术栈**: 
- 所有类型定义完整且严格
- 无 `any` 类型使用

✅ **III. 清晰的代码注释**: 
- 所有接口都有完整的 JSDoc 中文注释
- 参考现有代码风格

✅ **IV. 清晰的代码结构**: 
- 文件结构与现有代码完全一致
- 遵循命名约定

✅ **V. 完整的测试覆盖**: 
- 已规划单元测试和集成测试
- 测试契约已定义

**结论**: 设计完全符合宪法要求,可以进入 Phase 2 (tasks.md 生成)

---

## 下一步: Phase 2 - Tasks Generation

Phase 1 计划已完成,下一步使用 `/speckit.tasks` 命令生成实施任务列表。

**注意**: 根据工作流定义,`/speckit.plan` 命令在 Phase 1 完成后停止,不生成 tasks.md。tasks.md 将由 `/speckit.tasks` 命令单独生成。
