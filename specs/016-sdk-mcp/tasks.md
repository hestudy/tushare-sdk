# Tasks: MCP 服务补充 SDK 未集成功能

**Feature**: 016-sdk-mcp | **Branch**: `016-sdk-mcp` | **Date**: 2025-10-14

**Input**: 设计文档来自 `/specs/016-sdk-mcp/`
- plan.md (技术栈和架构)
- spec.md (用户故事和需求)
- research.md (技术调研)
- data-model.md (数据模型)
- contracts/ (API 定义)
- quickstart.md (测试场景)

**开发方式**: 测试优先 (TDD) - 先编写测试,确保失败后再实现功能

**组织方式**: 任务按用户故事分组,每个故事可独立实现和测试

## 格式说明: `[ID] [P?] [Story] Description`
- **[P]**: 可并行运行 (不同文件,无依赖)
- **[Story]**: 任务所属用户故事 (US1, US2, US3)
- 任务描述包含具体文件路径

---

## Phase 1: Setup (项目初始化)

**目的**: 配置开发环境和基础结构

- [x] T001 验证 MCP 项目依赖已正确安装 (`apps/tushare-mcp/package.json`)
- [x] T002 验证 SDK 包在 workspace 中正确链接 (`@hestudy/tushare-sdk`)
- [x] T003 [P] 验证 vitest 测试环境配置 (`apps/tushare-mcp/vitest.config.ts`)

---

## Phase 2: Foundational (基础设施 - 阻塞前置)

**目的**: 所有用户故事依赖的核心基础设施

**⚠️ 关键**: 在此阶段完成前,不能开始任何用户故事的实现

- [x] T004 创建通用日期格式化工具函数 (`apps/tushare-mcp/src/utils/date-formatter.ts`)
- [x] T005 [P] 创建通用数值格式化工具函数 (`apps/tushare-mcp/src/utils/number-formatter.ts`)
- [x] T006 [P] 创建日期范围验证工具函数 (`apps/tushare-mcp/src/utils/date-validator.ts`)

**Checkpoint**: 基础设施就绪 - 用户故事实现可以开始

---

## Phase 3: User Story 1 - 查询股票基本信息 (Priority: P1) 🎯 MVP

**目标**: 用户可以通过股票代码、交易所或上市状态查询股票基本信息

**独立测试**: 用户询问"查询贵州茅台的基本信息"或"600519.SH 是什么股票",系统返回包含股票名称、上市日期、所属行业等基本信息

### 测试任务 (US1) - 先编写测试

**注意: 这些测试必须先写,并确保失败后再实现功能**

- [ ] T007 [P] [US1] 编写股票基本信息工具定义测试 (`apps/tushare-mcp/tests/tools/stock-basic.test.ts`)
  - 验证工具 schema 正确性
  - 验证参数验证规则 (ts_code 正则、exchange 枚举等)
  - 验证至少需要一个筛选条件

- [ ] T008 [P] [US1] 编写股票基本信息处理器单元测试 (`apps/tushare-mcp/tests/handlers/stock-basic.handler.test.ts`)
  - 测试正常场景:单个股票查询
  - 测试批量场景:按交易所筛选
  - 测试错误场景:股票代码格式错误
  - 测试错误场景:股票不存在
  - 测试错误场景:无筛选条件
  - 测试数据格式化逻辑

**运行测试**: `pnpm test stock-basic` (应全部失败 ❌)

### 实现任务 (US1)

- [ ] T009 [US1] 创建股票基本信息工具定义 (`apps/tushare-mcp/src/tools/stock-basic.ts`)
  - 定义工具名称: `query_stock_basic`
  - 定义 inputSchema (参考 `contracts/query_stock_basic.json`)
  - 参数: ts_code (可选), exchange (可选), list_status (可选)
  - 验证规则: 至少提供一个筛选条件

- [ ] T010 [US1] 实现股票基本信息处理器 (`apps/tushare-mcp/src/handlers/stock-basic.handler.ts`)
  - 参数验证 (使用 zod schema)
  - 调用 SDK: `client.getStockBasic()`
  - 格式化单个股票响应
  - 格式化股票列表响应 (限制前 50 条)
  - 错误处理 (复用 `handleTushareError`)
  - 日志记录

- [ ] T011 [US1] 在 MCP 服务器中注册股票基本信息工具 (`apps/tushare-mcp/src/server.ts`)
  - 导入 `stockBasicTool`
  - 导入 `handleStockBasic`
  - 添加到 `tools` 数组
  - 添加到 `toolHandlers` Map

**运行测试**: `pnpm test stock-basic` (应全部通过 ✅)

**Checkpoint**: 用户故事 1 完成 - 可以独立测试股票基本信息查询功能

---

## Phase 4: User Story 2 - 查询交易日历信息 (Priority: P2)

**目标**: 用户可以查询指定日期是否为交易日,或查询时间段内的所有交易日

**独立测试**: 用户询问"2025年10月14日是交易日吗"或"查询2025年10月的所有交易日",系统返回明确的交易日判断或交易日列表

### 测试任务 (US2) - 先编写测试

- [ ] T012 [P] [US2] 编写交易日历工具定义测试 (`apps/tushare-mcp/tests/tools/trade-calendar.test.ts`)
  - 验证工具 schema 正确性
  - 验证日期格式验证 (YYYYMMDD)
  - 验证日期范围限制 (≤ 365 天)
  - 验证 start_date 和 end_date 必须同时提供

- [ ] T013 [P] [US2] 编写交易日历处理器单元测试 (`apps/tushare-mcp/tests/handlers/trade-calendar.handler.test.ts`)
  - 测试正常场景:单日查询 (交易日)
  - 测试正常场景:单日查询 (休市日)
  - 测试正常场景:日期范围查询
  - 测试错误场景:日期格式错误
  - 测试错误场景:日期范围超过 1 年
  - 测试错误场景:起始日期晚于结束日期
  - 测试数据格式化逻辑

**运行测试**: `pnpm test trade-calendar` (应全部失败 ❌)

### 实现任务 (US2)

- [ ] T014 [US2] 创建交易日历工具定义 (`apps/tushare-mcp/src/tools/trade-calendar.ts`)
  - 定义工具名称: `query_trade_calendar`
  - 定义 inputSchema (参考 `contracts/query_trade_calendar.json`)
  - 参数: start_date (必填), end_date (必填), exchange (可选,默认 SSE)
  - 验证规则: 日期格式、日期范围限制

- [ ] T015 [US2] 实现交易日历处理器 (`apps/tushare-mcp/src/handlers/trade-calendar.handler.ts`)
  - 参数验证 (使用 zod schema + 自定义日期范围验证)
  - 调用 SDK: `client.getTradeCalendar()`
  - 格式化单日查询响应 (交易日/休市日)
  - 格式化日期范围查询响应 (列出所有交易日)
  - 错误处理 (复用 `handleTushareError`)
  - 日志记录

- [ ] T016 [US2] 在 MCP 服务器中注册交易日历工具 (`apps/tushare-mcp/src/server.ts`)
  - 导入 `tradeCalendarTool`
  - 导入 `handleTradeCalendar`
  - 添加到 `tools` 数组
  - 添加到 `toolHandlers` Map

**运行测试**: `pnpm test trade-calendar` (应全部通过 ✅)

**Checkpoint**: 用户故事 2 完成 - 交易日历查询功能可独立测试

---

## Phase 5: User Story 3 - 查询每日技术指标 (Priority: P3)

**目标**: 用户可以查询股票的每日技术指标 (PE、PB、换手率、流通市值等)

**独立测试**: 用户询问"查询贵州茅台今天的市盈率和市净率"或"600519.SH 在 2025-10-14 的换手率是多少",系统返回包含 PE、PB、换手率等技术指标

### 测试任务 (US3) - 先编写测试

- [ ] T017 [P] [US3] 编写每日技术指标工具定义测试 (`apps/tushare-mcp/tests/tools/daily-basic.test.ts`)
  - 验证工具 schema 正确性
  - 验证 ts_code 必填
  - 验证 trade_date 与 (start_date + end_date) 二选一
  - 验证日期范围限制 (≤ 90 天)
  - 验证股票代码和日期格式

- [ ] T018 [P] [US3] 编写每日技术指标处理器单元测试 (`apps/tushare-mcp/tests/handlers/daily-basic.handler.test.ts`)
  - 测试正常场景:单日查询
  - 测试正常场景:日期范围查询
  - 测试边界场景:新股无 PE/PB (显示 N/A)
  - 测试错误场景:股票代码格式错误
  - 测试错误场景:非交易日查询
  - 测试错误场景:日期范围超过 3 个月
  - 测试错误场景:缺少 ts_code
  - 测试错误场景:同时提供 trade_date 和 start_date/end_date
  - 测试数据格式化逻辑

**运行测试**: `pnpm test daily-basic` (应全部失败 ❌)

### 实现任务 (US3)

- [ ] T019 [US3] 创建每日技术指标工具定义 (`apps/tushare-mcp/src/tools/daily-basic.ts`)
  - 定义工具名称: `query_daily_basic`
  - 定义 inputSchema (参考 `contracts/query_daily_basic.json`)
  - 参数: ts_code (必填), trade_date (可选), start_date (可选), end_date (可选)
  - 验证规则: trade_date 与 (start_date + end_date) 互斥

- [ ] T020 [US3] 实现每日技术指标处理器 (`apps/tushare-mcp/src/handlers/daily-basic.handler.ts`)
  - 参数验证 (使用 zod schema + 自定义日期范围验证)
  - 调用 SDK: `client.getDailyBasic()`
  - 格式化单日查询响应 (显示关键指标)
  - 格式化日期范围查询响应 (表格 + 统计摘要)
  - 处理空值 (PE/PB 为 null 显示 "N/A")
  - 市值单位转换 (万元 → 亿元)
  - 错误处理 (复用 `handleTushareError`)
  - 日志记录

- [ ] T021 [US3] 在 MCP 服务器中注册每日技术指标工具 (`apps/tushare-mcp/src/server.ts`)
  - 导入 `dailyBasicTool`
  - 导入 `handleDailyBasic`
  - 添加到 `tools` 数组
  - 添加到 `toolHandlers` Map

**运行测试**: `pnpm test daily-basic` (应全部通过 ✅)

**Checkpoint**: 用户故事 3 完成 - 所有用户故事现在都可以独立测试

---

## Phase 6: Polish & Integration (完善和集成)

**目的**: 跨用户故事的改进和最终验证

- [ ] T022 [P] 运行完整测试套件 (`pnpm test`)
  - 确保所有单元测试通过
  - 确保测试覆盖率 > 80%

- [ ] T023 [P] 构建 MCP 服务器 (`pnpm build`)
  - 确保 TypeScript 编译无错误
  - 确保输出文件生成正确

- [ ] T024 运行 quickstart.md 中的验证场景
  - 场景 1: 查询贵州茅台基本信息
  - 场景 2: 查询 2025-10-14 是否为交易日
  - 场景 3: 查询贵州茅台今天的市盈率
  - 验证响应格式和内容正确性

- [ ] T025 [P] 代码审查和清理
  - 移除调试日志
  - 统一代码格式 (`pnpm format`)
  - 检查 TypeScript 类型安全

- [ ] T026 [P] 更新 MCP 服务文档 (`apps/tushare-mcp/README.md`)
  - 添加三个新工具的使用说明
  - 添加示例查询
  - 更新工具列表

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 可立即开始
- **Foundational (Phase 2)**: 依赖 Setup 完成 - 阻塞所有用户故事
- **User Stories (Phase 3-5)**: 全部依赖 Foundational 完成
  - 用户故事之间无依赖 - 可并行实现 (如有团队资源)
  - 或按优先级顺序实现 (P1 → P2 → P3)
- **Polish (Phase 6)**: 依赖所有用户故事完成

### User Story Dependencies

- **User Story 1 (P1)**: Foundational 完成后可开始 - 无其他故事依赖
- **User Story 2 (P2)**: Foundational 完成后可开始 - 无其他故事依赖
- **User Story 3 (P3)**: Foundational 完成后可开始 - 无其他故事依赖

### Within Each User Story

- 测试任务优先 (TDD 方式)
- 测试必须先失败 (红灯)
- 工具定义 → 处理器实现 → 服务器注册
- 测试通过后 (绿灯) 再进入下一个故事

### Parallel Opportunities

- **Phase 1**: T003 可并行
- **Phase 2**: T005, T006 可并行
- **Phase 3 (US1)**: T007, T008 可并行 (测试任务)
- **Phase 4 (US2)**: T012, T013 可并行 (测试任务)
- **Phase 5 (US3)**: T017, T018 可并行 (测试任务)
- **Phase 6**: T022, T023, T025, T026 可并行
- **跨故事并行**: 如果有多个开发者,US1、US2、US3 可同时进行

---

## Parallel Example: User Story 1

```bash
# 并行启动 US1 的所有测试任务:
Task: "编写股票基本信息工具定义测试 (apps/tushare-mcp/tests/tools/stock-basic.test.ts)"
Task: "编写股票基本信息处理器单元测试 (apps/tushare-mcp/tests/handlers/stock-basic.handler.test.ts)"

# 测试失败后,顺序实现功能:
Task: "创建股票基本信息工具定义"
→ Task: "实现股票基本信息处理器"
→ Task: "在 MCP 服务器中注册工具"
```

---

## Implementation Strategy

### MVP First (仅 User Story 1)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational (关键 - 阻塞所有故事)
3. 完成 Phase 3: User Story 1
4. **停止并验证**: 独立测试 User Story 1
5. 如果就绪,可以部署/演示

### Incremental Delivery (增量交付)

1. 完成 Setup + Foundational → 基础就绪
2. 添加 User Story 1 → 独立测试 → 部署/演示 (MVP!)
3. 添加 User Story 2 → 独立测试 → 部署/演示
4. 添加 User Story 3 → 独立测试 → 部署/演示
5. 每个故事都增加价值,不破坏先前故事

### Parallel Team Strategy (并行团队策略)

如果有多个开发者:

1. 团队共同完成 Setup + Foundational
2. Foundational 完成后:
   - 开发者 A: User Story 1
   - 开发者 B: User Story 2
   - 开发者 C: User Story 3
3. 故事独立完成和集成

---

## Task Count Summary

- **总任务数**: 26 个任务
- **Setup**: 3 个任务
- **Foundational**: 3 个任务
- **User Story 1 (P1)**: 5 个任务 (2 测试 + 3 实现)
- **User Story 2 (P2)**: 5 个任务 (2 测试 + 3 实现)
- **User Story 3 (P3)**: 5 个任务 (2 测试 + 3 实现)
- **Polish**: 5 个任务

### Parallel Opportunities

- **Setup Phase**: 1 个并行机会
- **Foundational Phase**: 2 个并行机会
- **User Story 1**: 2 个并行测试任务
- **User Story 2**: 2 个并行测试任务
- **User Story 3**: 2 个并行测试任务
- **Polish Phase**: 4 个并行机会
- **跨故事**: 3 个用户故事可并行 (如有资源)

### MVP Scope Suggestion

**推荐 MVP 范围**: User Story 1 (查询股票基本信息)
- 理由: 最基础的功能,是其他查询的前置依赖
- 任务数: Setup (3) + Foundational (3) + US1 (5) = 11 个任务
- 预计时间: 1-2 天 (单开发者,TDD 方式)

---

## Notes

- [P] 标记 = 不同文件,无依赖,可并行
- [Story] 标记 = 任务归属的用户故事,便于追溯
- 每个用户故事应可独立完成和测试
- 采用 TDD 方式:先写测试(红灯) → 实现功能(绿灯) → 重构(如需要)
- 在每个故事完成后,在 checkpoint 处停止并验证
- 每个任务或逻辑组完成后提交代码
- 避免:模糊任务、相同文件冲突、跨故事依赖导致无法独立测试

---

## Related Documents

- **功能规格**: [spec.md](./spec.md)
- **实现计划**: [plan.md](./plan.md)
- **技术调研**: [research.md](./research.md)
- **数据模型**: [data-model.md](./data-model.md)
- **API Contracts**: [contracts/](./contracts/)
- **快速开始**: [quickstart.md](./quickstart.md)
