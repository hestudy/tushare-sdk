# Implementation Plan: MCP 服务补充 SDK 未集成功能

**Branch**: `016-sdk-mcp` | **Date**: 2025-10-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/016-sdk-mcp/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

本功能旨在将 Tushare SDK 中已实现但尚未集成到 MCP 服务中的三个核心 API 进行补充集成:

1. **股票基本信息查询 (stock_basic)**: 提供股票代码、名称、行业、上市日期等基础属性查询
2. **交易日历查询 (trade_cal)**: 判断指定日期是否为交易日,查询交易日列表
3. **每日技术指标查询 (daily_basic)**: 提供市盈率、市净率、换手率、流通市值等技术指标

技术实现将采用**测试优先**的开发方式,参考现有 MCP 工具的实现模式(`query_stock_quote`, `query_financial` 等),复用统一的错误处理、日志记录和响应格式化机制。

## Technical Context

**Language/Version**: TypeScript 5.3+ / Node.js 18+ LTS
**Primary Dependencies**:
  - `@modelcontextprotocol/sdk` (MCP TypeScript SDK)
  - `@hestudy/tushare-sdk` (本地 workspace 依赖)
  - stdio 传输协议

**Storage**: N/A (无状态 MCP 服务器,不需要持久化存储)
**Testing**: vitest (已配置在 MCP 项目中,采用测试优先开发方式)
**Target Platform**: Node.js 环境,通过 stdio 与 AI 客户端通信
**Project Type**: MCP 服务器扩展 (在现有 `apps/tushare-mcp` 项目中添加新工具)
**Performance Goals**:
  - 股票基本信息查询: < 2秒响应时间
  - 交易日历查询: < 3秒响应时间
  - 每日技术指标查询: < 3秒响应时间

**Constraints**:
  - 需遵循 Tushare API 调用限制(复用现有限流机制)
  - 需保持与现有 MCP 工具的一致性体验
  - 交易日历查询单次最多 1 年范围
  - 技术指标查询单次最多 3 个月范围

**Scale/Scope**:
  - 新增 3 个 MCP 工具定义
  - 新增 3 个工具处理器
  - 新增测试用例(单元测试 + 集成测试)
  - 预计新增代码约 500-800 行

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 简洁性检查 (Simplicity Gate)

- ✅ **最小化新增组件**: 本功能在现有 MCP 架构中添加 3 个工具定义和 3 个处理器,不引入新的架构层
- ✅ **复用现有模式**: 完全复用现有的 `MCPToolDefinition` 接口、错误处理 (`handleTushareError`)、日志记录和限流机制
- ✅ **避免重复**: SDK 层的 `getStockBasic`、`getTradeCalendar`、`getDailyBasic` 已存在,仅需添加 MCP 适配层
- ✅ **测试优先**: 采用 TDD 方法,先编写测试,确保代码质量和可维护性

### 一致性检查 (Consistency Gate)

- ✅ **工具命名一致**: 遵循现有命名规范 `query_*` (如 `query_stock_basic`, `query_trade_calendar`, `query_daily_basic`)
- ✅ **参数验证一致**: 使用与现有工具相同的参数模式(股票代码格式 `^\d{6}\.(SH|SZ)$`, 日期格式 `^\d{8}$`)
- ✅ **响应格式一致**: 返回统一的 `ToolCallResponse` 结构,包含结构化数据和格式化文本
- ✅ **错误处理一致**: 使用统一的 `handleTushareError` 函数和错误提示格式

### 必要性检查 (Necessity Gate)

- ✅ **填补功能缺口**: SDK 已实现的 3 个 API 在 MCP 中缺失,用户无法通过自然语言查询这些数据
- ✅ **用户价值明确**: spec.md 中定义了 3 个优先级明确的用户故事,解决实际用户需求
- ✅ **依赖关系合理**: 股票基本信息是其他查询的基础,交易日历可优化非交易日查询体验
- ⚠️ **无冗余功能**: 每个功能都有独特价值,不存在重叠(但需在 research 阶段确认是否可复用部分格式化逻辑)

**GATE 状态: PASSED** (有 1 个 ⚠️ 需在 Phase 0 研究阶段解决)

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
apps/tushare-mcp/
├── src/
│   ├── tools/
│   │   ├── stock-quote.ts          # 现有
│   │   ├── financial.ts            # 现有
│   │   ├── kline.ts                # 现有
│   │   ├── index-data.ts           # 现有
│   │   ├── stock-basic.ts          # 新增 - 股票基本信息工具定义
│   │   ├── trade-calendar.ts       # 新增 - 交易日历工具定义
│   │   └── daily-basic.ts          # 新增 - 每日技术指标工具定义
│   ├── handlers/
│   │   ├── stock-quote.handler.ts  # 现有
│   │   ├── financial.handler.ts    # 现有
│   │   ├── kline.handler.ts        # 现有
│   │   ├── index-data.handler.ts   # 现有
│   │   ├── stock-basic.handler.ts  # 新增 - 股票基本信息处理器
│   │   ├── trade-calendar.handler.ts # 新增 - 交易日历处理器
│   │   └── daily-basic.handler.ts  # 新增 - 每日技术指标处理器
│   ├── utils/
│   │   ├── error-handler.ts        # 现有 - 错误处理(复用)
│   │   ├── logger.ts               # 现有 - 日志记录(复用)
│   │   ├── rate-limiter.ts         # 现有 - 限流(复用)
│   │   └── formatter.ts            # 可能需要新增格式化工具函数
│   └── server.ts                   # 需更新 - 注册新工具
└── tests/
    ├── tools/
    │   ├── stock-basic.test.ts     # 新增 - 工具定义测试
    │   ├── trade-calendar.test.ts  # 新增
    │   └── daily-basic.test.ts     # 新增
    └── handlers/
        ├── stock-basic.handler.test.ts # 新增 - 处理器单元测试
        ├── trade-calendar.handler.test.ts # 新增
        └── daily-basic.handler.test.ts # 新增

packages/tushare-sdk/
└── src/
    ├── api/
    │   ├── stock.ts                # 已存在 - getStockBasic()
    │   ├── calendar.ts             # 已存在 - getTradeCalendar()
    │   └── daily-basic.ts          # 已存在 - getDailyBasic()
    └── models/
        ├── stock.ts                # 已存在 - StockBasicItem 类型
        ├── calendar.ts             # 已存在 - TradeCalItem 类型
        └── daily-basic.ts          # 已存在 - DailyBasicItem 类型
```

**Structure Decision**: 本功能是对现有 MCP 服务器的扩展,不新增目录结构。所有新增文件都放在现有的 `apps/tushare-mcp/src/` 目录下,遵循以下分层:

1. **tools/**: MCP 工具定义(schema + description)
2. **handlers/**: 工具处理器(业务逻辑 + SDK 调用)
3. **utils/**: 可复用的工具函数(错误处理、格式化等)
4. **tests/**: 对应的测试文件,采用相同的目录结构

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

N/A - Constitution Check 全部通过,无需记录复杂性违规。

---

## Post-Design Constitution Re-Check

**日期**: 2025-10-14 (Phase 1 完成后)

### 简洁性检查 (Simplicity Gate) - 重新评估

- ✅ **最小化新增组件**: 设计确认仅需 3 个工具文件 + 3 个处理器文件,无需新增 `utils/formatter.ts`(格式化逻辑保持内联)
- ✅ **复用现有模式**: 所有设计文档(data-model.md, contracts/)确认完全遵循现有模式,无新增架构复杂度
- ✅ **避免重复**: 三个工具虽有相似的日期格式化逻辑,但差异足够大,不值得抽取(如 research.md 中分析)
- ✅ **测试优先**: quickstart.md 提供了完整的测试指南,TDD 流程明确

**结论**: ✅ 简洁性检查通过,设计未引入不必要的复杂度

---

### 一致性检查 (Consistency Gate) - 重新评估

- ✅ **工具命名一致**: contracts/ 中确认工具名为 `query_stock_basic`, `query_trade_calendar`, `query_daily_basic`,符合现有 `query_*` 规范
- ✅ **参数验证一致**: 所有 contracts 使用相同的正则表达式和 zod schema 模式
- ✅ **响应格式一致**: data-model.md 确认 `ToolCallResponse` 结构与现有工具完全一致
- ✅ **错误处理一致**: research.md 确认复用 `handleTushareError`,无新增错误分类

**结论**: ✅ 一致性检查通过,设计完全遵循现有规范

---

### 必要性检查 (Necessity Gate) - 重新评估

- ✅ **填补功能缺口**: 设计确认三个工具填补了 MCP 与 SDK 之间的功能缺口,无冗余
- ✅ **用户价值明确**: quickstart.md 提供了清晰的使用场景和价值说明
- ✅ **依赖关系合理**: data-model.md 明确了实体间关系,设计合理无循环依赖
- ✅ **无冗余功能**: research.md 解决了 Phase 0 的 ⚠️ 项(格式化逻辑复用问题),确认不需要抽取

**结论**: ✅ 必要性检查通过,所有功能都有明确价值

---

### 最终 Constitution Check 结论

**状态**: ✅ **全部通过**

所有设计文档(research.md, data-model.md, contracts/, quickstart.md)均符合项目宪法要求:
- 简洁性: 无不必要的抽象和架构层
- 一致性: 完全遵循现有代码规范
- 必要性: 所有功能都有明确的用户价值

**下一步**: 可以安全地进入 Phase 2 实现阶段(通过 `/speckit.tasks` 生成任务清单)
