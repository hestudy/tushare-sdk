---
description: "演示应用财务数据功能集成任务清单"
---

# Tasks: 演示应用财务数据功能集成

**Input**: 设计文档来自 `/specs/011-/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: 本功能采用手动测试为主的策略(见 research.md 第7节),不包含自动化测试任务。

**Organization**: 任务按用户故事组织,确保每个故事可以独立实现和验证。

## Format: `[ID] [P?] [Story] Description`
- **[P]**: 可并行执行(不同文件,无依赖)
- **[Story]**: 任务所属的用户故事(US1, US2, US3, US4)
- 任务描述中包含精确的文件路径

## Path Conventions
- **项目类型**: Single project (演示应用位于 apps/node-demo)
- **源代码路径**: `apps/node-demo/src/`
- **示例模块**: `apps/node-demo/src/examples/`
- **工具模块**: `apps/node-demo/src/utils/`

---

## Phase 1: Setup (共享基础设施)

**Purpose**: 项目初始化和基本结构验证(此功能为集成工作,无需创建新结构)

- [ ] T001 验证现有项目结构符合规范(`apps/node-demo/src/` 包含 examples/, utils/, config.ts, types.ts, index.ts)
- [ ] T002 验证依赖已安装(@hestudy/tushare-sdk, dotenv, vitest)
- [ ] T003 验证 TypeScript 编译配置正确(`npm run build` 可正常执行)

---

## Phase 2: Foundational (阻塞性前置条件)

**Purpose**: 核心基础设施,必须在任何用户故事开始前完成

**⚠️ CRITICAL**: 所有用户故事工作必须等待此阶段完成

- [ ] T004 扩展 ExampleName 类型定义,在 `apps/node-demo/src/types.ts:84` 添加 `'financial-data'`
- [ ] T005 在 `apps/node-demo/src/index.ts` 添加 runFinancialDataExample 导入
- [ ] T006 在 `apps/node-demo/src/index.ts:84-106` 的 allExamples 数组中注册财务数据示例

**Checkpoint**: 基础设施就绪 - 用户故事实现可以并行开始

---

## Phase 3: User Story 1 - 查询单一财务报表数据 (Priority: P1) 🎯 MVP

**Goal**: 通过演示应用快速验证 SDK 的财务报表查询功能(利润表、资产负债表、现金流量表)

**Independent Test**: 用户可以通过命令 `npm start -- --example=financial-data` 独立运行财务数据示例,查看三大报表的查询结果和数据展示

### 实现 User Story 1

- [ ] T007 [US1] 重构 `apps/node-demo/src/examples/financial-data.ts` 主函数,将 `runFinancialExamples()` 改为 `runFinancialDataExample(config: AppConfig)`
- [ ] T008 [US1] 修改 financial-data.ts 导出接口,符合 ExampleResult 契约(返回 Promise&lt;FinancialDataResult&gt;)
- [ ] T009 [US1] 在 financial-data.ts 中使用 `config.tushareToken` 和 `config.apiBaseUrl` 创建 TushareClient 实例
- [ ] T010 [US1] 实现利润表查询逻辑,调用 `client.getIncomeStatement()` 并处理返回数据
- [ ] T011 [US1] 实现资产负债表查询逻辑,调用 `client.getBalanceSheet()` 并处理返回数据
- [ ] T012 [US1] 实现现金流量表查询逻辑,调用 `client.getCashFlow()` 并处理返回数据
- [ ] T013 [US1] 使用 logger 工具(`logApiRequest`, `logApiResponse`)替代所有 console.log,记录 API 调用
- [ ] T014 [US1] 构建 reports 对象,包含三大报表数组数据
- [ ] T015 [US1] 实现 buildSummary() 辅助函数,计算 totalRecords, reportTypes, stockCodes, periods
- [ ] T016 [US1] 在 financial-data.ts 中添加错误处理,使用 `printError` 工具记录错误并重新抛出
- [ ] T017 [US1] 验证 financial-data.ts 返回结构化数据(不直接输出到控制台)
- [ ] T018 [US1] 在 `apps/node-demo/src/index.ts:44` 参数解析逻辑中添加 `'financial-data'` 检查

**Checkpoint**: User Story 1 完成 - 用户可以通过 `--example=financial-data` 查看三大报表数据

---

## Phase 4: User Story 2 - 财务指标计算与分析展示 (Priority: P2)

**Goal**: 展示基于原始数据计算的财务指标(净利率、流动比率、资产负债率等)

**Independent Test**: 用户查看财务数据示例输出时,可以看到除原始数据外还有自动计算的财务比率和指标

### 实现 User Story 2

- [ ] T019 [US2] 在 financial-data.ts 中定义 CalculatedMetrics 接口(或使用 data-model.md 中的定义)
- [ ] T020 [US2] 实现 calculateNetProfitMargin() 函数,计算净利率(净利润/营业收入)
- [ ] T021 [US2] 实现 calculateCurrentRatio() 函数,计算流动比率(流动资产/流动负债)
- [ ] T022 [US2] 实现 calculateQuickRatio() 函数,计算速动比率((流动资产-存货)/流动负债)
- [ ] T023 [US2] 实现 calculateDebtRatio() 函数,计算资产负债率(负债合计/总资产)
- [ ] T024 [US2] 实现 calculateROE() 函数,计算简化 ROE(净利润/未分配利润)
- [ ] T025 [US2] 实现 calculateMetrics() 主函数,整合所有指标计算,优雅处理数据缺失(返回 undefined)
- [ ] T026 [US2] 在 runFinancialDataExample 中调用 calculateMetrics() 并将结果添加到返回对象的 calculatedMetrics 字段
- [ ] T027 [US2] 验证当数据不完整时,系统跳过无法计算的指标而不影响其他数据展示

**Checkpoint**: User Story 2 完成 - 用户可以看到自动计算的财务指标

---

## Phase 5: User Story 3 - 与其他示例统一的命令行体验 (Priority: P1)

**Goal**: 财务数据示例与其他示例保持一致的命令行交互方式

**Independent Test**: 用户使用 `--example=financial-data`、`--example=all`、`--verbose`、`--format=json` 参数均能正常工作

### 实现 User Story 3

- [ ] T028 [US3] 验证 `npm start -- --example=financial-data` 只运行财务数据示例
- [ ] T029 [US3] 验证 `npm start` 或 `npm start -- --example=all` 包含财务数据示例
- [ ] T030 [US3] 在 financial-data.ts 的子示例函数中添加 verbose 参数支持(根据 config.debug 决定详细输出)
- [ ] T031 [US3] 使用 logVerbose 工具记录详细的 API 调用日志(请求参数、响应数据条数、响应时间)
- [ ] T032 [US3] 验证 `npm start -- --example=financial-data --verbose` 输出详细日志
- [ ] T033 [US3] 验证 `npm start -- --example=financial-data --format=json` 输出标准 JSON 格式
- [ ] T034 [US3] 确保财务数据示例的输出格式与其他示例一致(使用相同的 formatter 工具)
- [ ] T035 [US3] 验证财务数据示例的执行结果被正确记录到总体摘要统计中

**Checkpoint**: User Story 3 完成 - 命令行交互体验与其他示例100%一致

---

## Phase 6: User Story 4 - 综合财务分析演示 (Priority: P3)

**Goal**: 展示如何组合使用多个财务 API 进行综合分析

**Independent Test**: 用户可以在财务数据示例输出中看到综合分析部分,展示如何并行查询多个报表并进行关联计算

### 实现 User Story 4

- [ ] T036 [US4] 保留现有的 comprehensiveFinancialAnalysis() 子示例函数(如果存在)
- [ ] T037 [US4] 在 comprehensiveFinancialAnalysis 中实现并行查询三大报表(Promise.all)
- [ ] T038 [US4] 实现财务健康度分析逻辑(整合利润表、资产负债表、现金流量表数据)
- [ ] T039 [US4] 保留或实现 multiPeriodComparison() 子示例函数
- [ ] T040 [US4] 在 multiPeriodComparison 中实现多期数据查询(至少3个连续报告期)
- [ ] T041 [US4] 实现关键指标时间序列对比(营业收入、净利润趋势)
- [ ] T042 [US4] 在 runFinancialDataExample 中调用这些高级分析函数
- [ ] T043 [US4] 使用 logVerbose 记录综合分析的中间步骤和结果

**Checkpoint**: User Story 4 完成 - 用户可以看到综合财务分析和多期数据对比

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 影响多个用户故事的改进和完善

- [ ] T044 [P] 在 financial-data.ts 中添加完整的 JSDoc 注释(函数、参数、返回值)
- [ ] T045 [P] 在 types.ts 中为 ExampleName 扩展添加注释
- [ ] T046 代码审查:确保所有代码符合 TypeScript 严格模式和项目编码规范
- [ ] T047 验证所有错误场景的优雅处理(无效 token、API 超时、数据缺失、null/undefined 字段)
- [ ] T048 [P] 运行 `npm run lint` 并修复所有警告和错误
- [ ] T049 [P] 运行 `npm run build` 验证 TypeScript 编译通过
- [ ] T050 执行手动测试清单(见 quickstart.md 第5节):
  - `npm start -- --example=financial-data`
  - `npm start` (all 模式)
  - `npm start -- --example=financial-data --verbose`
  - `npm start -- --example=financial-data --format=json`
  - 使用无效 token 测试错误处理
- [ ] T051 清理代码:移除调试用的 console.log,确保只使用 logger 工具
- [ ] T052 验证 quickstart.md 中的代码示例和步骤准确无误

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 可立即开始
- **Foundational (Phase 2)**: 依赖 Setup 完成 - 阻塞所有用户故事
- **User Stories (Phase 3-6)**: 全部依赖 Foundational 完成
  - User Story 1 (P1): 核心功能,优先实现
  - User Story 3 (P1): 与 US1 同级,确保命令行体验一致
  - User Story 2 (P2): 依赖 US1 的数据查询,增强功能
  - User Story 4 (P3): 依赖 US1 和 US2,展示高级用法
- **Polish (Phase 7)**: 依赖所有用户故事完成

### User Story Dependencies

- **User Story 1 (P1)**: Foundational 完成后可开始 - 无依赖其他故事
- **User Story 3 (P1)**: Foundational 完成后可开始 - 可与 US1 并行或立即跟随
- **User Story 2 (P2)**: 依赖 US1 的数据查询逻辑 - 但可独立测试财务指标计算
- **User Story 4 (P3)**: 依赖 US1 的基础功能和 US2 的指标计算 - 最后实现

### Within Each User Story

- **US1**: T007-T009(接口适配) → T010-T012(API 调用)[P] → T013(日志) → T014-T015(数据构建) → T016-T018(错误处理和集成)
- **US2**: T019(类型定义) → T020-T024(指标计算函数)[P] → T025(整合) → T026-T027(集成和验证)
- **US3**: T028-T029(基础验证)[P] → T030-T031(verbose 支持) → T032-T035(格式验证)[P]
- **US4**: T036-T038(综合分析) → T039-T041(多期对比) → T042-T043(集成和日志)

### Parallel Opportunities

- **Setup 阶段**: T001, T002, T003 可并行执行
- **Foundational 阶段**: T004, T005, T006 因修改不同部分可并行(但需注意文件冲突)
- **US1 内部**: T010, T011, T012 (三个 API 查询函数)可并行实现
- **US2 内部**: T020-T024 (五个指标计算函数)可并行实现
- **US3 内部**: T028-T029, T032-T035(验证任务)可并行执行
- **Polish 阶段**: T044, T045, T048, T049 可并行执行

---

## Parallel Example: User Story 1

```bash
# 并行实现三个 API 查询函数:
Task: "实现利润表查询逻辑,调用 client.getIncomeStatement()"
Task: "实现资产负债表查询逻辑,调用 client.getBalanceSheet()"
Task: "实现现金流量表查询逻辑,调用 client.getCashFlow()"

# 串行执行后续集成任务:
Task: "使用 logger 工具替代所有 console.log"
Task: "构建 reports 对象"
Task: "添加错误处理"
```

## Parallel Example: User Story 2

```bash
# 并行实现五个指标计算函数:
Task: "实现 calculateNetProfitMargin() 函数"
Task: "实现 calculateCurrentRatio() 函数"
Task: "实现 calculateQuickRatio() 函数"
Task: "实现 calculateDebtRatio() 函数"
Task: "实现 calculateROE() 函数"

# 串行执行整合任务:
Task: "实现 calculateMetrics() 主函数"
Task: "在 runFinancialDataExample 中调用 calculateMetrics()"
```

---

## Implementation Strategy

### MVP First (User Story 1 + 3)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational (CRITICAL - 阻塞所有故事)
3. 完成 Phase 3: User Story 1 (核心数据查询功能)
4. 完成 Phase 5: User Story 3 (命令行体验一致性)
5. **STOP and VALIDATE**: 独立测试 US1 和 US3
6. 演示/部署 MVP 版本

### Incremental Delivery

1. 完成 Setup + Foundational → 基础就绪
2. 添加 User Story 1 → 独立测试 → 演示(最小功能)
3. 添加 User Story 3 → 独立测试 → 演示(完整命令行体验)
4. 添加 User Story 2 → 独立测试 → 演示(增强财务指标)
5. 添加 User Story 4 → 独立测试 → 演示(高级分析)
6. 每个故事增加价值,不破坏已有功能

### Parallel Team Strategy

如果有多个开发者:

1. 团队共同完成 Setup + Foundational
2. Foundational 完成后:
   - 开发者 A: User Story 1 (核心数据查询)
   - 开发者 B: User Story 3 (命令行集成)
   - (US1 完成后)开发者 A: User Story 2 (财务指标)
   - (US2 完成后)开发者 A 或 B: User Story 4 (高级分析)
3. 各故事独立完成和集成

---

## Notes

- [P] 任务 = 不同文件或独立功能,无依赖
- [Story] 标签将任务映射到特定用户故事,便于追踪
- 每个用户故事应可独立完成和测试
- 在每个 checkpoint 停下来,独立验证该故事
- 每完成一个任务或逻辑组提交代码
- 避免:模糊任务描述、文件冲突、破坏故事独立性的跨故事依赖

---

## Task Summary

**总任务数**: 52
**按用户故事统计**:
- Setup (Phase 1): 3 任务
- Foundational (Phase 2): 3 任务(CRITICAL - 阻塞所有故事)
- User Story 1 (P1): 12 任务
- User Story 2 (P2): 9 任务
- User Story 3 (P1): 8 任务
- User Story 4 (P3): 8 任务
- Polish (Phase 7): 9 任务

**并行机会**:
- Setup 阶段: 3 个任务可并行
- US1 实现: 3 个 API 查询函数可并行
- US2 实现: 5 个指标计算函数可并行
- US3 验证: 多个验证任务可并行
- Polish 阶段: 4 个任务可并行

**建议 MVP 范围**: Phase 1-3 + Phase 5 (User Story 1 + User Story 3)
- 预计实现时间: 1-2 小时
- 难度: ⭐⭐☆☆☆ (中等偏易)
- 风险: 低(主要是集成工作,不涉及新功能开发)

---

## Independent Test Criteria

### User Story 1 (P1)
✅ 运行 `npm start -- --example=financial-data` 能成功查询并展示利润表、资产负债表、现金流量表数据

### User Story 2 (P2)
✅ 查看财务数据示例输出,能看到至少3个自动计算的财务指标(净利率、流动比率、资产负债率等)

### User Story 3 (P1)
✅ `--example=financial-data`、`--example=all`、`--verbose`、`--format=json` 参数均能正常工作,输出格式与其他示例一致

### User Story 4 (P3)
✅ 示例输出包含综合财务分析和多期数据对比(至少3个报告期)

---

**Generated**: 2025-10-13 by `/speckit.tasks` command
**Feature Branch**: `011-`
**Ready for implementation**: ✅ 所有设计文档已就绪,任务清单可执行
