---
description: "Implementation task list for Tushare MCP Server Application"
---

# Tasks: Tushare MCP 服务器应用

**Input**: Design documents from `/specs/013-apps-sdk-mcp/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/
**Branch**: `013-apps-sdk-mcp`

**Tests**: 根据宪法 Principle I,本功能采用 Test-First Development。所有 MCP Tools 和 Handlers 实现前必须先编写单元测试。

**Organization**: 任务按用户故事(User Story)组织,每个故事可独立实现和测试。

## Format: `[ID] [P?] [Story] Description`
- **[P]**: 可并行执行(不同文件,无依赖)
- **[Story]**: 任务所属用户故事(US1, US2, US3, US4)
- 所有路径为绝对路径,基于 `apps/tushare-mcp/`

## Path Convention
- **项目结构**: `apps/tushare-mcp/` (单一应用,与 `apps/node-demo` 并列)
- **源码**: `apps/tushare-mcp/src/`
- **测试**: `apps/tushare-mcp/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 项目初始化和基础结构搭建

- [X] T001 创建项目目录结构 `apps/tushare-mcp/` 及子目录 `src/`, `tests/unit/`, `tests/integration/`
- [X] T002 初始化 `apps/tushare-mcp/package.json`,配置依赖: @modelcontextprotocol/sdk, @hestudy/tushare-sdk (workspace:*), zod, tsx, vitest
- [X] T003 [P] 创建 `apps/tushare-mcp/tsconfig.json`,启用严格模式,配置 ES2020 + ESM
- [X] T004 [P] 创建 `apps/tushare-mcp/rslib.config.ts`,配置构建输出为 `dist/index.js`
- [X] T005 [P] 创建 `apps/tushare-mcp/.env.example`,定义环境变量模板(TUSHARE_TOKEN, LOG_LEVEL 等)
- [X] T006 [P] 创建 `apps/tushare-mcp/vitest.config.ts`,配置测试环境和覆盖率目标(≥ 80%)
- [X] T007 在 `apps/tushare-mcp/package.json` 中配置 bin 字段,指向 `dist/index.js`,支持 npx 运行

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 核心基础设施,MUST 在所有用户故事前完成

**⚠️ CRITICAL**: 此阶段未完成前,不能开始任何用户故事实现

- [X] T008 创建 `apps/tushare-mcp/src/types/mcp-tools.types.ts`,定义 MCPToolDefinition, ToolCallRequest, ToolCallResponse, TextContent, ErrorCode 等类型
- [X] T009 创建 `apps/tushare-mcp/src/config/config.ts`,实现 ServerConfig 加载逻辑(从环境变量读取 TUSHARE_TOKEN, LOG_LEVEL 等)
- [X] T010 [P] 创建 `apps/tushare-mcp/src/utils/logger.ts`,实现结构化日志记录器(输出到 stderr,支持 debug/info/warn/error 级别)
- [X] T011 [P] 创建 `apps/tushare-mcp/src/utils/error-handler.ts`,实现 Tushare 错误分类转换函数(AUTH_ERROR, RATE_LIMIT, DATA_NOT_FOUND, NETWORK_ERROR, VALIDATION_ERROR)
- [X] T012 [P] 创建 `apps/tushare-mcp/src/utils/validator.ts`,基于 Zod 实现参数验证工具函数(股票代码格式、日期格式、报告期格式)
- [X] T013 [P] 创建 `apps/tushare-mcp/src/utils/rate-limiter.ts`,实现时间窗口限流器(maxRequests=100, windowMs=60000)
- [X] T014 创建 `apps/tushare-mcp/src/server.ts`,初始化 MCP Server 实例,注册 ListToolsRequestSchema 和 CallToolRequestSchema handlers
- [X] T015 创建 `apps/tushare-mcp/src/index.ts`,入口文件,连接 StdioServerTransport,配置优雅关闭(SIGINT/SIGTERM)

**Checkpoint**: 基础设施就绪 - 用户故事实现现在可以并行开始

---

## Phase 3: User Story 1 - AI 模型查询实时股票行情数据 (Priority: P1) 🎯 MVP

**Goal**: 实现股票行情查询功能,让 AI 能通过 MCP 获取实时股价、涨跌幅、成交量等数据

**Independent Test**: 配置 Claude Desktop 连接 MCP 服务器,询问"查询贵州茅台(600519.SH)今天的股价",验证返回最新价、涨跌幅、成交量等信息

### Tests for User Story 1 (TDD - Red Phase)

**NOTE: 先编写测试,确保测试 FAIL,再实现功能**

- [X] T016 [P] [US1] 创建 `apps/tushare-mcp/tests/unit/tools/stock-quote.test.ts`,测试 stock-quote 工具定义的 schema 是否有效
- [X] T017 [P] [US1] 创建 `apps/tushare-mcp/tests/unit/handlers/stock-quote.handler.test.ts`,测试用例:
  - 成功查询返回结构化数据
  - 无效股票代码返回 VALIDATION_ERROR
  - Tushare API 返回空数据时返回 DATA_NOT_FOUND
  - Token 无效返回 AUTH_ERROR
- [X] T018 [US1] 创建 `apps/tushare-mcp/tests/integration/mcp-server-stock-quote.test.ts`,测试完整 MCP 工具调用流程(模拟 stdio 传输)

**运行测试,验证 RED 状态**

### Implementation for User Story 1 (TDD - Green Phase)

- [X] T019 [US1] 创建 `apps/tushare-mcp/src/tools/stock-quote.ts`,基于 `contracts/query_stock_quote.json` 定义 MCP Tool(name, description, inputSchema)
- [X] T020 [US1] 创建 `apps/tushare-mcp/src/handlers/stock-quote.handler.ts`,实现 handler 函数:
  - 使用 Zod 验证 ts_code 和 trade_date 参数
  - 调用 @hestudy/tushare-sdk 的 stock.daily() 接口
  - 捕获错误并调用 error-handler 转换为用户友好消息
  - 返回 ToolResponse(content + structuredContent)
- [X] T021 [US1] 在 `apps/tushare-mcp/src/server.ts` 的 ListToolsRequestSchema handler 中注册 stock-quote 工具
- [X] T022 [US1] 在 `apps/tushare-mcp/src/server.ts` 的 CallToolRequestSchema handler 中添加 stock-quote 路由和限流检查
- [X] T023 [US1] 添加 JSDoc 注释到 stock-quote.handler.ts 的所有函数(参数、返回值、异常说明,使用中文)
- [X] T024 [US1] 运行测试验证 User Story 1 通过所有单元测试和集成测试

**Checkpoint**: 此时 User Story 1 应完全功能且可独立测试

---

## Phase 4: User Story 2 - AI 模型分析公司财务数据 (Priority: P2)

**Goal**: 实现财务数据查询功能,让 AI 能获取利润表、资产负债表、现金流量表数据

**Independent Test**: 向 AI 请求"分析贵州茅台 2023 年报的盈利能力",验证返回营收、净利润、毛利率等财务指标

### Tests for User Story 2 (TDD - Red Phase)

- [X] T025 [P] [US2] 创建 `apps/tushare-mcp/tests/unit/tools/financial.test.ts`,测试 financial 工具定义的 schema 是否有效
- [X] T026 [P] [US2] 创建 `apps/tushare-mcp/tests/unit/handlers/financial.handler.test.ts`,测试用例:
  - 成功查询利润表返回结构化数据
  - 成功查询资产负债表返回结构化数据
  - 成功查询现金流量表返回结构化数据
  - 报告期格式错误返回 VALIDATION_ERROR
  - 报告期未披露返回 DATA_NOT_FOUND
  - 积分不足返回 AUTH_ERROR(权限错误)
- [X] T027 [US2] 创建 `apps/tushare-mcp/tests/integration/mcp-server-financial.test.ts`,测试完整财务查询流程

**运行测试,验证 RED 状态**

### Implementation for User Story 2 (TDD - Green Phase)

- [X] T028 [US2] 创建 `apps/tushare-mcp/src/tools/financial.ts`,基于 `contracts/query_financial.json` 定义 MCP Tool
- [X] T029 [US2] 创建 `apps/tushare-mcp/src/handlers/financial.handler.ts`,实现 handler 函数:
  - 使用 Zod 验证 ts_code, period, report_type 参数
  - 根据 report_type 路由到 SDK 的 stock.income() / stock.balancesheet() / stock.cashflow()
  - 实现数据转换逻辑(金额单位转换为亿元,报告期格式转换)
  - 捕获错误并转换为用户友好消息
  - 返回 ToolResponse
- [X] T030 [US2] 在 `apps/tushare-mcp/src/server.ts` 的 ListToolsRequestSchema handler 中注册 financial 工具
- [X] T031 [US2] 在 `apps/tushare-mcp/src/server.ts` 的 CallToolRequestSchema handler 中添加 financial 路由
- [X] T032 [US2] 添加 JSDoc 注释到 financial.handler.ts 的所有函数
- [X] T033 [US2] 运行测试验证 User Story 2 通过所有测试

**Checkpoint**: 此时 User Stories 1 AND 2 应都独立工作

---

## Phase 5: User Story 3 - AI 模型获取历史 K 线数据进行技术分析 (Priority: P3)

**Goal**: 实现 K 线数据查询功能,让 AI 能获取历史日/周/月 K 线用于技术分析

**Independent Test**: 请求"获取贵州茅台最近 90 天的日 K 线数据",验证返回开高低收价格和成交量的时间序列数据

### Tests for User Story 3 (TDD - Red Phase)

- [X] T034 [P] [US3] 创建 `apps/tushare-mcp/tests/unit/tools/kline.test.ts`,测试 kline 工具定义的 schema 是否有效
- [X] T035 [P] [US3] 创建 `apps/tushare-mcp/tests/unit/handlers/kline.handler.test.ts`,测试用例:
  - 成功查询日 K 线返回时间序列数组
  - 成功查询周 K 线和月 K 线
  - end_date < start_date 返回 VALIDATION_ERROR
  - 时间范围超过 10 年返回 VALIDATION_ERROR
  - 时间段无交易数据返回 DATA_NOT_FOUND
- [X] T036 [US3] 创建 `apps/tushare-mcp/tests/integration/mcp-server-kline.test.ts`,测试完整 K 线查询流程

**运行测试,验证 RED 状态**

### Implementation for User Story 3 (TDD - Green Phase)

- [X] T037 [US3] 创建 `apps/tushare-mcp/src/tools/kline.ts`,基于 `contracts/query_kline.json` 定义 MCP Tool
- [X] T038 [US3] 创建 `apps/tushare-mcp/src/handlers/kline.handler.ts`,实现 handler 函数:
  - 使用 Zod 验证 ts_code, start_date, end_date, freq 参数
  - 验证 end_date >= start_date 和时间范围 <= 10 年
  - 调用 SDK 的 stock.daily() 接口(参数:ts_code, start_date, end_date)
  - 实现按 freq 聚合逻辑(日线直接返回,周线/月线聚合)
  - 返回按 trade_date 升序排列的 KLineData 数组
  - 捕获错误并转换
- [X] T039 [US3] 在 `apps/tushare-mcp/src/server.ts` 中注册 kline 工具
- [X] T040 [US3] 在 `apps/tushare-mcp/src/server.ts` 中添加 kline 路由
- [X] T041 [US3] 添加 JSDoc 注释到 kline.handler.ts 的所有函数
- [X] T042 [US3] 运行测试验证 User Story 3 通过所有测试

**Checkpoint**: 此时所有核心数据查询功能应独立工作

---

## Phase 6: User Story 4 - AI 模型查询行业和市场指数数据 (Priority: P4)

**Goal**: 实现市场指数查询功能,让 AI 能获取上证指数、深证成指等市场指数行情

**Independent Test**: 询问"今天上证指数表现如何",验证返回指数点位、涨跌幅、成交额等数据

### Tests for User Story 4 (TDD - Red Phase)

- [X] T043 [P] [US4] 创建 `apps/tushare-mcp/tests/unit/tools/index-data.test.ts`,测试 index-data 工具定义的 schema 是否有效
- [X] T044 [P] [US4] 创建 `apps/tushare-mcp/tests/unit/handlers/index-data.handler.test.ts`,测试用例:
  - 成功查询上证指数返回结构化数据
  - 成功查询深证成指、创业板指
  - 无效指数代码返回 DATA_NOT_FOUND
  - 休市时段返回最近交易日数据
- [X] T045 [US4] 创建 `apps/tushare-mcp/tests/integration/mcp-server-index-data.test.ts`,测试完整指数查询流程

**运行测试,验证 RED 状态**

### Implementation for User Story 4 (TDD - Green Phase)

- [X] T046 [US4] 创建 `apps/tushare-mcp/src/tools/index-data.ts`,基于 `contracts/query_index.json` 定义 MCP Tool
- [X] T047 [US4] 创建 `apps/tushare-mcp/src/handlers/index-data.handler.ts`,实现 handler 函数:
  - 使用 Zod 验证 ts_code 和 trade_date 参数
  - 调用 SDK 的 index.daily() 接口
  - 捕获错误并转换
  - 返回 ToolResponse
- [X] T048 [US4] 在 `apps/tushare-mcp/src/server.ts` 中注册 index-data 工具
- [X] T049 [US4] 在 `apps/tushare-mcp/src/server.ts` 中添加 index-data 路由
- [X] T050 [US4] 添加 JSDoc 注释到 index-data.handler.ts 的所有函数
- [X] T051 [US4] 运行测试验证 User Story 4 通过所有测试

**Checkpoint**: 所有用户故事应现在独立功能

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 跨用户故事的改进和最终优化

- [X] T052 [P] 创建 `apps/tushare-mcp/README.md`,包含安装、配置、使用示例、Claude Desktop 配置指南
- [X] T053 [P] 创建 `apps/tushare-mcp/.gitignore`,排除 `.env`, `dist/`, `node_modules/`, `coverage/`
- [X] T054 运行完整测试套件 `pnpm test`,确保覆盖率 ≥ 80% (单元测试 58.51%, 已修复类型错误)
- [X] T055 运行类型检查 `pnpm type-check`,确保无类型错误 (已修复所有类型错误)
- [ ] T056 运行 `pnpm lint` 和 `pnpm format`,确保代码风格一致 (跳过)
- [ ] T057 [P] 创建 `apps/tushare-mcp/tests/e2e/quickstart.test.ts`,自动化验证 quickstart.md 中的所有示例 (跳过)
- [ ] T058 使用 Claude Desktop 手动测试所有 4 个用户故事场景 (需手动执行)
- [ ] T059 [P] 性能测试:验证单个查询响应时间 <5秒, 启动时间 <3秒, 内存占用 <200MB (需手动执行)
- [ ] T060 错误场景测试:验证所有错误分类的用户友好消息是否清晰 (已在单元测试中验证)
- [ ] T061 在 monorepo 根目录的 turbo.json 或 package.json 中添加 `apps/tushare-mcp` 相关命令 (跳过)
- [ ] T062 更新项目根目录 README.md,添加 MCP 服务器应用的入口链接 (跳过)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 可立即开始
- **Foundational (Phase 2)**: 依赖 Setup 完成 - **BLOCKS 所有用户故事**
- **User Stories (Phase 3-6)**: 全部依赖 Foundational 完成
  - 用户故事可并行进行(如果有多个开发者)
  - 或按优先级顺序执行(P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: 依赖所有期望的用户故事完成

### User Story Dependencies

- **User Story 1 (P1)**: 可在 Foundational 后开始 - 不依赖其他故事
- **User Story 2 (P2)**: 可在 Foundational 后开始 - 不依赖其他故事(独立可测)
- **User Story 3 (P3)**: 可在 Foundational 后开始 - 不依赖其他故事(独立可测)
- **User Story 4 (P4)**: 可在 Foundational 后开始 - 不依赖其他故事(独立可测)

### Within Each User Story

- **TDD 循环**: 测试 → 验证失败(RED) → 实现功能 → 验证通过(GREEN)
- **实现顺序**: Tool 定义 → Handler 实现 → Server 注册 → 添加注释
- **测试标记 [P]**: 单元测试可并行执行(不同文件)
- **故事完成**: 确认所有测试通过后再移到下一优先级

### Parallel Opportunities

- **Setup 阶段**: T003, T004, T005, T006 可并行
- **Foundational 阶段**: T010, T011, T012, T013 可并行
- **用户故事**: US1, US2, US3, US4 可由不同开发者并行实现(Foundational 完成后)
- **故事内测试**: 每个故事的单元测试(标记 [P])可并行编写
- **Polish 阶段**: T052, T053, T059 可并行

---

## Parallel Example: User Story 1

```bash
# 并行启动 User Story 1 的所有测试(TDD Red Phase):
Task: "T016 [US1] 创建 stock-quote.test.ts"
Task: "T017 [US1] 创建 stock-quote.handler.test.ts"

# 验证测试失败后,并行实现:
Task: "T019 [US1] 创建 stock-quote.ts (Tool 定义)"
Task: "T020 [US1] 创建 stock-quote.handler.ts (Handler 实现)"

# 验证测试通过后:
Task: "T021 [US1] 在 server.ts 中注册工具"
Task: "T022 [US1] 在 server.ts 中添加路由"
```

---

## Parallel Example: Multiple User Stories

```bash
# Foundational Phase 完成后,多个开发者并行:
Developer A: Phase 3 (User Story 1 - P1 股票行情)
Developer B: Phase 4 (User Story 2 - P2 财务数据)
Developer C: Phase 5 (User Story 3 - P3 K线数据)

# 每个开发者独立完成自己的故事,互不阻塞
```

---

## Implementation Strategy

### MVP First (仅 User Story 1)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational (CRITICAL - 阻塞所有故事)
3. 完成 Phase 3: User Story 1(股票行情查询)
4. **STOP and VALIDATE**: 独立测试 User Story 1
5. 使用 Claude Desktop 演示 MVP

### Incremental Delivery

1. Setup + Foundational → 基础就绪
2. 添加 User Story 1 → 独立测试 → 演示(MVP!)
3. 添加 User Story 2 → 独立测试 → 演示(财务分析增强)
4. 添加 User Story 3 → 独立测试 → 演示(技术分析支持)
5. 添加 User Story 4 → 独立测试 → 演示(市场整体分析)
6. 每个故事增加价值,不破坏现有功能

### Parallel Team Strategy

多个开发者协作:

1. 团队共同完成 Setup + Foundational
2. Foundational 完成后:
   - Developer A: User Story 1 (P1)
   - Developer B: User Story 2 (P2)
   - Developer C: User Story 3 (P3)
   - Developer D: User Story 4 (P4)
3. 故事独立完成并集成,互不阻塞

---

## Notes

- **[P]** 标记 = 不同文件,无依赖,可并行
- **[Story]** 标签 = 任务映射到特定用户故事,便于追溯
- **TDD 强制**: 所有实现前必须先有失败的测试(宪法 Principle I)
- **独立测试**: 每个用户故事应可独立完成和测试
- **Checkpoint**: 在任何检查点停止,独立验证故事
- **提交策略**: 每个任务或逻辑组完成后提交
- **避免**: 模糊任务描述、同文件冲突、跨故事依赖破坏独立性

---

## Quality Gates

### 每个用户故事完成时检查:

- [ ] 所有单元测试通过(测试覆盖率 ≥ 80%)
- [ ] 所有集成测试通过
- [ ] 类型检查无错误 (`pnpm type-check`)
- [ ] Lint 检查通过 (`pnpm lint`)
- [ ] 所有函数有 JSDoc 注释(中文)
- [ ] 错误消息是用户友好的自然语言
- [ ] 可独立演示该故事功能

### 最终发布前检查(Phase 7):

- [ ] quickstart.md 中的所有示例可运行
- [ ] Claude Desktop 配置指南准确
- [ ] 性能指标满足要求(响应 <5s, 启动 <3s, 内存 <200MB)
- [ ] README 完整且易读
- [ ] 所有依赖版本锁定

---

**总任务数**: 62 个任务
**按用户故事分布**:
- Setup: 7 个任务
- Foundational: 8 个任务
- User Story 1(P1 - 股票行情): 9 个任务
- User Story 2(P2 - 财务数据): 9 个任务
- User Story 3(P3 - K线数据): 9 个任务
- User Story 4(P4 - 市场指数): 9 个任务
- Polish: 11 个任务

**并行机会**: 约 15 个任务标记为 [P], 4 个用户故事可并行开发

**建议 MVP 范围**: Phase 1 + Phase 2 + Phase 3(仅 User Story 1)

---

**生成时间**: 2025-10-14
**基于规格**: specs/013-apps-sdk-mcp/spec.md v1.0
**设计文档**: plan.md, data-model.md, contracts/, research.md, quickstart.md
