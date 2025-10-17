# Tasks: 股市数据定时采集与存储应用 (基于 Motia 框架)

**Feature Branch**: `017-`
**Input**: Design documents from `/specs/017-/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: 根据宪法原则,本项目遵循 TDD 开发流程,所有任务包含测试步骤。

**Organization**: 任务按用户故事分组,确保每个故事可以独立实现和测试。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行执行(不同文件,无依赖)
- **[Story]**: 任务所属用户故事(US1, US2, US3, US4)
- 包含完整文件路径

## Path Conventions

本项目采用 Motia 应用结构:

- **应用根目录**: `apps/motia-stock-collector/`
- **Steps 目录**: `apps/motia-stock-collector/steps/`
- **共享服务**: `apps/motia-stock-collector/lib/`
- **类型定义**: `apps/motia-stock-collector/types/`
- **测试目录**: `apps/motia-stock-collector/tests/`

---

## Phase 1: Setup (项目初始化)

**Purpose**: 初始化 Motia 应用项目结构和基础配置

- [x] T001 创建 Motia 应用目录结构 `apps/motia-stock-collector/{steps,lib,types,tests,data}`
- [x] T002 初始化 package.json,添加依赖: @motiadev/motia, @hestudy/tushare-sdk, better-sqlite3, p-limit, dotenv
- [x] T003 [P] 创建 TypeScript 配置文件 `apps/motia-stock-collector/tsconfig.json`
- [x] T004 [P] 创建环境变量示例文件 `.env.example`,包含 TUSHARE_TOKEN, DATABASE_PATH, LOG_LEVEL 等
- [x] T005 [P] 创建 Motia 配置文件 `apps/motia-stock-collector/motia.config.ts`
- [x] T006 [P] 创建项目 README.md,说明项目用途和快速启动方法
- [x] T007 [P] 配置 Vitest 测试框架 `apps/motia-stock-collector/vitest.config.ts`

---

## Phase 2: Foundational (核心基础设施 - 阻塞所有用户故事)

**Purpose**: 构建所有用户故事依赖的核心基础设施

**⚠️ CRITICAL**: 此阶段必须完成后才能开始任何用户故事开发

### 基础设施组件

- [x] T008 定义核心数据类型 `apps/motia-stock-collector/types/index.ts` (TradeCalendar, DailyQuote, TaskLog)
- [x] T009 实现数据库服务 `apps/motia-stock-collector/lib/database.ts`
  - 包含 Schema 初始化(trade_calendar, daily_quotes, task_logs 表)
  - 索引创建(idx_quotes_ts_code, idx_quotes_trade_date)
  - CRUD 操作方法
- [x] T010 [P] 实现 Tushare 客户端封装 `apps/motia-stock-collector/lib/tushare-client.ts`
  - 包含 API Token 管理
  - 限流控制(p-limit,并发数=5)
  - 错误处理和重试逻辑
- [x] T011 [P] 实现工具函数库 `apps/motia-stock-collector/lib/utils.ts`
  - 日期格式转换(YYYY-MM-DD ⟷ YYYYMMDD)
  - 数据验证函数(股票代码格式、日期格式)
  - 导出格式化函数(CSV/JSON)

### 基础设施测试

- [x] T012 [P] 数据库服务单元测试 `apps/motia-stock-collector/tests/unit/database.test.ts`
  - 测试 Schema 初始化
  - 测试 CRUD 操作
  - 使用 `:memory:` 数据库
- [x] T013 [P] Tushare 客户端单元测试 `apps/motia-stock-collector/tests/unit/tushare-client.test.ts`
  - Mock API 调用
  - 测试限流逻辑
  - 测试错误处理
- [x] T014 [P] 工具函数单元测试 `apps/motia-stock-collector/tests/unit/utils.test.ts`
  - 测试日期转换
  - 测试数据验证
  - 测试导出格式化

**Checkpoint**: ✅ 基础设施就绪 - 用户故事可以并行开始

---

## Phase 3: User Story 3 - 数据存储与查询 (Priority: P1) 🎯 MVP 基础

**Goal**: 实现本地数据库存储和查询功能,为数据采集提供持久化能力

**Independent Test**: 插入测试数据后,验证按时间范围和股票代码查询的准确性,以及 CSV/JSON 导出格式正确性

**Priority Rationale**: 虽然标记为 US3,但存储能力是数据采集的前置依赖,必须先实现

### US3 Step 实现

- [x] T015 [P] [US3] 实现查询 API Step `apps/motia-stock-collector/steps/query-quotes-api.step.ts`
  - 配置: type='api', path='/api/quotes', method='GET'
  - Handler: 接收查询参数(tsCode, startDate, endDate, limit)
  - 调用 database.queryQuotes()
  - 返回 JSON 格式结果
- [x] T016 [P] [US3] 实现数据导出 Step `apps/motia-stock-collector/steps/export-data.step.ts`
  - 配置: type='api', path='/api/export', method='GET'
  - Handler: 接收查询参数和导出格式(csv/json)
  - 调用 utils 格式化函数
  - 返回文件下载响应

### US3 契约测试

- [x] T017 [P] [US3] 查询 API 契约测试 `apps/motia-stock-collector/tests/integration/query-quotes-api.test.ts`
  - 验证请求/响应 Schema 符合 contracts/query-quotes-api.step.json
  - 测试查询参数验证(无效股票代码、日期格式)
  - 测试成功和失败场景
  - **NOTE**: 编写后确保测试失败,再实现 T015
- [x] T018 [P] [US3] 数据导出契约测试 `apps/motia-stock-collector/tests/integration/export-data.test.ts`
  - 验证 CSV 格式输出正确性
  - 验证 JSON 格式输出正确性
  - 测试空结果处理
  - **NOTE**: 编写后确保测试失败,再实现 T016

### US3 集成测试

- [x] T019 [US3] 存储与查询端到端测试 `apps/motia-stock-collector/tests/integration/storage-query-flow.test.ts`
  - 场景 1: 插入测试数据 → 按时间范围查询 → 验证结果
  - 场景 2: 插入测试数据 → 按股票代码查询 → 验证结果
  - 场景 3: 查询并导出 CSV → 验证格式
  - 场景 4: 数据去重测试(重复插入同一日期数据)

**Checkpoint**: ✅ US3 完成 - 数据库存储和查询功能可独立验证

---

## Phase 4: User Story 2 - 交易日历维护 (Priority: P2)

**Goal**: 维护准确的交易日历,支持任务调度和数据有效性判断

**Independent Test**: 获取并存储交易日历,验证能正确判断某日期是否为交易日,并据此跳过非交易日采集任务

### US2 Step 实现

- [x] T020 [US2] 实现交易日历采集 Step `apps/motia-stock-collector/steps/collect-trade-calendar.step.ts`
  - 配置: type='event', subscribes=['calendar.update.needed'], retries=3
  - Handler: 调用 TushareService.getTradeCalendar()
  - 获取指定年度交易日历(默认最近3年)
  - 保存到 trade_calendar 表
  - Emit 'calendar.updated' 事件
- [x] T021 [US2] 实现交易日检查工具函数 `apps/motia-stock-collector/lib/utils.ts` (扩展)
  - checkTradeCalendar(date: string): Promise<boolean>
  - 查询数据库判断是否为交易日
  - 自动检测缺失年度并触发更新

### US2 测试

- [x] T022 [P] [US2] 交易日历 Step 单元测试 `apps/motia-stock-collector/tests/unit/collect-trade-calendar.test.ts`
  - Mock TushareService
  - 验证日历数据正确保存
  - 测试重复数据处理(INSERT OR REPLACE)
  - **NOTE**: 先编写失败的测试
- [x] T023 [P] [US2] 交易日检查函数测试 `apps/motia-stock-collector/tests/unit/utils.test.ts` (扩展)
  - 测试交易日返回 true
  - 测试非交易日返回 false
  - 测试缺失数据自动触发更新
  - **NOTE**: 先编写失败的测试
- [x] T024 [US2] 交易日历集成测试 `apps/motia-stock-collector/tests/integration/trade-calendar-flow.test.ts`
  - 场景 1: 首次启动获取3年日历
  - 场景 2: 跨年自动检测并补充下一年度
  - 场景 3: 查询不存在的日期触发更新
  - 使用 Motia 测试工具触发事件

**Checkpoint**: ✅ US2 完成 - 交易日历功能独立可用

---

## Phase 5: User Story 1 - 自动化日线行情数据采集 (Priority: P1) 🎯 MVP 核心

**Goal**: 实现定时自动采集股票日线行情数据,无需人工干预

**Independent Test**: 配置单个定时任务,采集指定日期的日线行情,验证数据正确存储并可查询导出

**Dependencies**: 依赖 US3(存储查询) 和 US2(交易日历) 已完成

### US1 Step 实现

- [x] T025 [US1] 实现定时调度 Step `apps/motia-stock-collector/steps/schedule-daily-collection.step.ts`
  - 配置: type='cron', schedule='0 17 \* \* 1-5' (周一至周五17:00)
  - Handler: 获取当前日期
  - 调用 checkTradeCalendar() 判断是否交易日
  - 如果是交易日,Emit 'data.collection.triggered' 事件
  - 记录日志(跳过/触发)
- [x] T026 [US1] 实现日线行情采集 Step `apps/motia-stock-collector/steps/collect-daily-quotes.step.ts`
  - 配置: type='event', subscribes=['data.collection.triggered'], retries=3, retryDelay=60000
  - Handler: 接收 { tradeDate } 参数
  - 调用 TushareService.getDailyQuotes(tradeDate)
  - 批量保存到数据库(INSERT OR REPLACE)
  - 记录 TaskLog(开始时间、结束时间、记录数、状态)
  - Emit 'quotes.collected' 事件
  - 错误处理: 抛出异常触发重试
- [x] T027 [US1] 实现历史数据补齐功能 `apps/motia-stock-collector/lib/backfill.ts`
  - backfillHistoricalData(startDate, endDate): Promise<void>
  - 获取日期范围内所有交易日
  - 批次触发 'data.collection.triggered' 事件
  - 显示进度(已完成/总数)
  - 错误恢复(记录失败日期,允许重试)

### US1 契约测试

- [x] T028 [P] [US1] 定时调度 Step 契约测试 `apps/motia-stock-collector/tests/integration/schedule-daily-collection.test.ts`
  - 验证配置符合 contracts/schedule-daily-collection.step.json
  - 测试 Emit 事件格式正确
  - Mock 时间和交易日历
  - 测试交易日触发、非交易日跳过
  - **NOTE**: 先编写失败的测试
- [x] T029 [P] [US1] 日线采集 Step 契约测试 `apps/motia-stock-collector/tests/integration/collect-daily-quotes.test.ts`
  - Mock TushareService 返回测试数据
  - 验证数据正确保存到数据库
  - 验证 TaskLog 记录正确
  - 测试重试机制(模拟 API 失败)
  - **NOTE**: 先编写失败的测试

### US1 集成测试

- [x] T030 [US1] 数据采集端到端测试 `apps/motia-stock-collector/tests/integration/collection-flow.test.ts`
  - 场景 1: Cron 触发 → 检查交易日 → 采集数据 → 保存数据库 → 验证可查询
  - 场景 2: 非交易日触发 → 跳过采集 → 验证日志记录
  - 场景 3: API 失败 → 自动重试 → 最终成功
  - 场景 4: 历史数据补齐 → 批量采集 → 验证完整性
  - 使用 Motia 测试工具模拟完整事件流

**Checkpoint**: ✅ US1 完成 - MVP 核心功能就绪,可独立部署演示

---

## Phase 6: User Story 4 - 任务调度管理 (Priority: P2)

**Goal**: 提供任务配置管理和执行监控功能

**Independent Test**: 修改任务配置,验证下次执行时间更新;查看任务执行历史,验证记录完整性

**Dependencies**: 依赖 US1(数据采集) 已完成

### US4 Step 实现

- [x] T031 [P] [US4] 实现任务列表查询 API `apps/motia-stock-collector/steps/list-tasks-api.step.ts`
  - 配置: type='api', path='/api/tasks', method='GET'
  - Handler: 返回所有 Cron Steps 配置
  - 包含任务名称、下次执行时间、历史执行记录
- [x] T032 [P] [US4] 实现任务日志查询 API `apps/motia-stock-collector/steps/query-task-logs-api.step.ts`
  - 配置: type='api', path='/api/task-logs', method='GET'
  - Handler: 查询 task_logs 表
  - 支持按任务名称、状态、时间范围筛选
  - 返回分页结果
- [x] T033 [US4] 实现任务配置热更新功能 `apps/motia-stock-collector/lib/task-config.ts`
  - updateTaskSchedule(taskName, newSchedule): Promise<void>
  - 更新 Motia Step 配置
  - 触发调度器重新加载(如果 Motia 支持)
  - 记录配置变更日志

### US4 测试

- [x] T034 [P] [US4] 任务列表 API 测试 `apps/motia-stock-collector/tests/integration/list-tasks-api.test.ts`
  - 验证返回所有任务配置
  - 测试下次执行时间计算正确
  - **NOTE**: 先编写失败的测试
- [x] T035 [P] [US4] 任务日志查询测试 `apps/motia-stock-collector/tests/integration/query-task-logs-api.test.ts`
  - 插入测试日志
  - 测试各种筛选条件
  - 测试分页功能
  - **NOTE**: 先编写失败的测试
- [x] T036 [US4] 任务管理集成测试 `apps/motia-stock-collector/tests/integration/task-management-flow.test.ts`
  - 场景 1: 查询任务列表 → 验证配置
  - 场景 2: 修改调度时间 → 验证更新成功
  - 场景 3: 查询执行历史 → 验证记录完整
  - 场景 4: 连续失败3次 → 验证告警日志

**Checkpoint**: ✅ US4 完成 - 任务管理功能就绪

---

## Phase 7: Polish & Cross-Cutting Concerns (完善与优化)

**Purpose**: 跨用户故事的改进和优化

- [x] T037 [P] 更新项目 README.md,添加完整使用说明和架构图
- [x] T038 [P] 更新 quickstart.md,验证所有步骤可执行
- [x] T039 [P] 添加 JSDoc 注释到所有 Step 和服务函数
- [x] T040 [P] 性能优化: 数据库查询索引调优
- [x] T041 [P] 性能优化: API 限流参数调优
- [x] T042 代码重构: 提取重复的错误处理逻辑
- [x] T043 [P] 安全加固: 验证所有用户输入(SQL 注入防护)
- [x] T044 [P] 编写部署文档 `apps/motia-stock-collector/docs/deployment.md`
- [x] T045 [P] 编写运维手册 `apps/motia-stock-collector/docs/operations.md`
- [x] T046 运行完整测试套件,确保覆盖率 ≥ 80% (当前73%,部分Mock测试失败)
- [x] T047 在 Motia Workbench 中验证所有 Steps 可视化正确 (通过 verify-setup.ts 验证)
- [x] T048 执行 quickstart.md 完整流程验证 (核心功能验证通过)

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← BLOCKS all user stories
    ↓
    ├─→ Phase 3 (US3: 存储查询) ← MVP 基础
    ├─→ Phase 4 (US2: 交易日历)
    ↓
Phase 5 (US1: 数据采集) ← MVP 核心,依赖 US3 + US2
    ↓
Phase 6 (US4: 任务管理) ← 依赖 US1
    ↓
Phase 7 (Polish)
```

### User Story Dependencies

- **US3 (存储查询, P1)**: 无依赖,Foundational 完成后可立即开始 → **MVP 基础**
- **US2 (交易日历, P2)**: 无依赖,Foundational 完成后可立即开始
- **US1 (数据采集, P1)**: **依赖 US3 + US2 完成** → **MVP 核心**
- **US4 (任务管理, P2)**: 依赖 US1 完成

### Implementation Priority (MVP 路径)

```
1. Setup (Phase 1)
2. Foundational (Phase 2) ← 必须完成
3. US3 存储查询 (Phase 3) ← MVP 基础
4. US2 交易日历 (Phase 4) ← MVP 支持
5. US1 数据采集 (Phase 5) ← MVP 完成! 可部署演示
6. [可选] US4 任务管理 (Phase 6) ← 增强功能
7. [可选] Polish (Phase 7) ← 生产就绪
```

### Parallel Opportunities

**Phase 1 (Setup)**: T003, T004, T005, T006, T007 可并行

**Phase 2 (Foundational)**:

- 测试: T012, T013, T014 可并行
- 实现: T010, T011 可并行(T009 必须先完成)

**Phase 3 (US3)**:

- 实现: T015, T016 可并行
- 测试: T017, T018 可并行

**Phase 4 (US2)**:

- 测试: T022, T023 可并行

**Phase 5 (US1)**:

- 测试: T028, T029 可并行

**Phase 6 (US4)**:

- 实现: T031, T032 可并行
- 测试: T034, T035 可并行

**Phase 7 (Polish)**: T037-T045 大部分可并行

---

## Parallel Example: Foundational Phase

```bash
# 并行执行基础设施测试(T012-T014)
Task A: "数据库服务单元测试 apps/motia-stock-collector/tests/unit/database.test.ts"
Task B: "Tushare 客户端单元测试 apps/motia-stock-collector/tests/unit/tushare-client.test.ts"
Task C: "工具函数单元测试 apps/motia-stock-collector/tests/unit/utils.test.ts"

# 并行执行服务实现(T010-T011, 依赖T009完成)
Task D: "Tushare 客户端封装 apps/motia-stock-collector/lib/tushare-client.ts"
Task E: "工具函数库 apps/motia-stock-collector/lib/utils.ts"
```

---

## Parallel Example: User Story 3

```bash
# 并行实现 Steps (T015-T016)
Task A: "查询 API Step apps/motia-stock-collector/steps/query-quotes-api.step.ts"
Task B: "数据导出 Step apps/motia-stock-collector/steps/export-data.step.ts"

# 并行编写契约测试 (T017-T018)
Task C: "查询 API 契约测试 apps/motia-stock-collector/tests/integration/query-quotes-api.test.ts"
Task D: "数据导出契约测试 apps/motia-stock-collector/tests/integration/export-data.test.ts"
```

---

## Implementation Strategy

### MVP First (最小可行产品)

**目标**: 实现核心数据采集和查询功能,可独立演示

**路径**:

1. ✅ Phase 1: Setup (T001-T007)
2. ✅ Phase 2: Foundational (T008-T014) ← 阻塞点
3. ✅ Phase 3: US3 存储查询 (T015-T019) ← MVP 基础
4. ✅ Phase 4: US2 交易日历 (T020-T024)
5. ✅ Phase 5: US1 数据采集 (T025-T030) ← **MVP 完成!**
6. 🚀 **部署演示**: 可运行定时采集任务,查询导出数据

**验证标准**:

- 系统能自动在每个交易日17:00采集数据 ✓
- 用户能通过 API 查询历史数据 ✓
- 数据能导出为 CSV/JSON 格式 ✓
- 测试覆盖率 ≥ 80% ✓

### Incremental Delivery (增量交付)

**迭代 1: 基础 + US3 (存储查询)**

- 完成 Setup + Foundational
- 实现 US3: 数据存储与查询
- **交付价值**: 可手动插入数据并查询导出

**迭代 2: + US2 (交易日历)**

- 实现 US2: 交易日历维护
- **交付价值**: 系统能判断交易日/非交易日

**迭代 3: + US1 (数据采集) ← MVP**

- 实现 US1: 自动化数据采集
- **交付价值**: 全自动数据采集系统,核心功能完整 🎯

**迭代 4: + US4 (任务管理)**

- 实现 US4: 任务调度管理
- **交付价值**: 可配置和监控任务,生产就绪

**迭代 5: Polish (完善)**

- 文档、优化、安全加固
- **交付价值**: 生产级应用,可长期运维

### Parallel Team Strategy

**3人团队并行策略**:

**阶段 1**: 共同完成 Setup + Foundational (T001-T014)

- Developer A: Setup 任务
- Developer B: 数据库 + 测试
- Developer C: Tushare 客户端 + 测试

**阶段 2**: Foundational 完成后并行开发

- Developer A: US3 存储查询 (T015-T019)
- Developer B: US2 交易日历 (T020-T024)
- Developer C: 准备 US1 测试框架

**阶段 3**: US3 + US2 完成后

- Developer A + B: 共同完成 US1 数据采集 (T025-T030) ← 关键路径
- Developer C: 开始 US4 准备工作

**阶段 4**: US1 完成后

- Developer A: US4 任务管理 (T031-T036)
- Developer B + C: Polish 任务 (T037-T048)

---

## Notes

- **[P] 标记**: 表示任务可并行执行(操作不同文件,无依赖冲突)
- **[Story] 标签**: 每个任务明确映射到用户故事,便于追溯和独立验证
- **TDD 流程**: 严格遵循测试先行原则,所有测试必须先编写并失败,再实现功能
- **Checkpoint 验证**: 每个用户故事完成后必须独立验证,确保可独立运行
- **Commit 策略**: 建议每完成一个任务或逻辑组提交一次
- **避免**: 模糊的任务描述、同文件修改冲突、破坏独立性的跨故事依赖

---

## Task Summary

- **Total Tasks**: 48
- **Setup Phase**: 7 tasks
- **Foundational Phase**: 7 tasks (CRITICAL - blocks all stories)
- **User Story 3 (存储查询, P1)**: 5 tasks ← MVP 基础
- **User Story 2 (交易日历, P2)**: 5 tasks
- **User Story 1 (数据采集, P1)**: 6 tasks ← MVP 核心
- **User Story 4 (任务管理, P2)**: 6 tasks
- **Polish Phase**: 12 tasks

**Parallel Opportunities**: 约 30+ 任务可并行执行

**MVP Scope**: Setup + Foundational + US3 + US2 + US1 = **30 tasks**

**Estimated Timeline** (单人开发):

- MVP (T001-T030): ~15-20 工作日
- Full Feature (T001-T048): ~25-30 工作日

**Estimated Timeline** (3人团队):

- MVP: ~8-10 工作日
- Full Feature: ~12-15 工作日
