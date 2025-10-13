# Tasks: SDK财务数据功能完善

**Feature**: 009-sdk
**Input**: Design documents from `/specs/009-sdk/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: 本功能规格说明中未显式要求TDD或测试,因此任务清单不包含测试任务。如需添加测试,可在实施后补充。

**Organization**: 任务按用户故事分组,以实现独立实施和测试。所有4个用户故事优先级均为P1,建议按US1→US2→US3→US4顺序实施,但US1-US3(三大报表)可并行。

## Format: `[ID] [P?] [Story] Description`
- **[P]**: 可并行执行(不同文件,无依赖)
- **[Story]**: 任务所属用户故事(US1, US2, US3, US4)
- 包含精确的文件路径

---

## Phase 1: Setup (共享基础设施)

**目的**: 项目结构准备,无需新增项目文件,本功能在现有SDK基础上扩展

**注意**: 本功能不需要创建新的目录或项目初始化,所有代码将扩展现有的 `packages/tushare-sdk` 包

- [X] **T001** 验证现有项目结构 `packages/tushare-sdk/src/` 包含 `models/`, `api/`, `client/` 目录
- [X] **T002** 确认开发环境已安装 Node.js 18+, pnpm, TypeScript 5.3+
- [X] **T003** [P] 确认 vitest 测试框架已配置(`packages/tushare-sdk/vitest.config.ts`)

**Checkpoint**: 环境验证完成,可以开始类型定义和API实现

---

## Phase 2: Foundational (阻塞性前置条件)

**目的**: 本功能无阻塞性前置条件。现有的 TushareClient 核心功能(`query()` 方法、重试机制、缓存机制)已满足需求。

**注意**: 本Phase为空,因为所有用户故事都依赖现有的SDK基础设施,无需额外的foundational工作。

**⚠️ CRITICAL**: 由于无阻塞性前置条件,用户故事可以立即开始实施(在Phase 1验证完成后)

**Checkpoint**: 现有SDK基础设施已就绪,用户故事实施可以并行开始

---

## Phase 3: User Story 1 - 获取公司利润表数据 (Priority: P1) 🎯 建议首个MVP

**Goal**: 实现利润表数据查询功能,包括94个字段的完整TypeScript类型定义和API方法

**Independent Test**: 通过调用 `client.getIncomeStatement({ ts_code: '000001.SZ', period: '20231231' })` 验证是否能成功返回利润表数据,包含营业收入、净利润等核心字段

### 实施任务 - User Story 1

- [X] **T004** [P] [US1] 在 `packages/tushare-sdk/src/models/financial.ts` 中定义 `IncomeStatementItem` 接口(94个字段,包含基本信息、收入、成本、利润、每股指标等,所有财务字段为可选类型 `number?`)

- [X] **T005** [P] [US1] 在 `packages/tushare-sdk/src/models/financial.ts` 中定义 `FinancialQueryParams` 接口(包含 ts_code, ann_date, start_date, end_date, period, report_type, comp_type 等查询参数,所有字段可选)

- [X] **T006** [US1] 在 `packages/tushare-sdk/src/api/financial.ts` 中实现 `getIncomeStatement` API函数,调用 `client.query<IncomeStatementItem>('income', params)`,确保继承现有的缓存、重试、并发控制特性(依赖T004, T005)

- [X] **T007** [US1] 在 `packages/tushare-sdk/src/client/TushareClient.ts` 中添加 `getIncomeStatement(params?: FinancialQueryParams): Promise<IncomeStatementItem[]>` 方法,内部调用 `api/financial.ts` 的 `getIncomeStatement` 函数(依赖T006)

- [X] **T008** [US1] 在 `packages/tushare-sdk/src/index.ts` 中导出 `IncomeStatementItem` 类型和 `getIncomeStatement` API函数,确保用户可以导入使用(依赖T004, T006)

- [X] **T009** [US1] 为 `IncomeStatementItem` 的所有94个字段添加详细的 JSDoc 注释,说明字段含义和单位(如"营业总收入(元)"),标注权限要求(至少2000积分)(修改 `packages/tushare-sdk/src/models/financial.ts`)

**Checkpoint**: 利润表功能完整实现,可以独立测试和使用

---

## Phase 4: User Story 2 - 获取公司资产负债表数据 (Priority: P1)

**Goal**: 实现资产负债表数据查询功能,包括81个字段的完整TypeScript类型定义和API方法

**Independent Test**: 通过调用 `client.getBalanceSheet({ ts_code: '600519.SH', period: '20231231' })` 验证是否能返回资产负债表数据,包含总资产、总负债、股东权益等关键字段

### 实施任务 - User Story 2

- [X] **T010** [P] [US2] 在 `packages/tushare-sdk/src/models/financial.ts` 中定义 `BalanceSheetItem` 接口(81个字段,包含基本信息、流动资产、非流动资产、流动负债、非流动负债、所有者权益等,所有财务字段为可选类型)

- [X] **T011** [US2] 在 `packages/tushare-sdk/src/api/financial.ts` 中实现 `getBalanceSheet` API函数,调用 `client.query<BalanceSheetItem>('balancesheet', params)`(依赖T010,复用T005的FinancialQueryParams)

- [X] **T012** [US2] 在 `packages/tushare-sdk/src/client/TushareClient.ts` 中添加 `getBalanceSheet(params?: FinancialQueryParams): Promise<BalanceSheetItem[]>` 方法,内部调用 `api/financial.ts` 的 `getBalanceSheet` 函数(依赖T011)

- [X] **T013** [US2] 在 `packages/tushare-sdk/src/index.ts` 中导出 `BalanceSheetItem` 类型和 `getBalanceSheet` API函数(依赖T010, T011)

- [X] **T014** [US2] 为 `BalanceSheetItem` 的所有81个字段添加详细的 JSDoc 注释,说明字段含义和单位,标注权限要求(至少2000积分)(修改 `packages/tushare-sdk/src/models/financial.ts`)

**Checkpoint**: 资产负债表功能完整实现,与US1互不依赖,可以独立测试

---

## Phase 5: User Story 3 - 获取公司现金流量表数据 (Priority: P1)

**Goal**: 实现现金流量表数据查询功能,包括87个字段的完整TypeScript类型定义和API方法

**Independent Test**: 通过调用 `client.getCashFlow({ ts_code: '000001.SZ', start_date: '20230101', end_date: '20231231' })` 验证是否能返回现金流量表数据,包含经营活动、投资活动、筹资活动的现金流

### 实施任务 - User Story 3

- [X] **T015** [P] [US3] 在 `packages/tushare-sdk/src/models/financial.ts` 中定义 `CashFlowItem` 接口(87个字段,包含基本信息、经营活动现金流、投资活动现金流、筹资活动现金流、现金汇总指标等,所有财务字段为可选类型)

- [X] **T016** [US3] 在 `packages/tushare-sdk/src/api/financial.ts` 中实现 `getCashFlow` API函数,调用 `client.query<CashFlowItem>('cashflow', params)`(依赖T015,复用T005的FinancialQueryParams)

- [X] **T017** [US3] 在 `packages/tushare-sdk/src/client/TushareClient.ts` 中添加 `getCashFlow(params?: FinancialQueryParams): Promise<CashFlowItem[]>` 方法,内部调用 `api/financial.ts` 的 `getCashFlow` 函数(依赖T016)

- [X] **T018** [US3] 在 `packages/tushare-sdk/src/index.ts` 中导出 `CashFlowItem` 类型和 `getCashFlow` API函数(依赖T015, T016)

- [X] **T019** [US3] 为 `CashFlowItem` 的所有87个字段添加详细的 JSDoc 注释,说明字段含义和单位,标注权限要求(至少2000积分)(修改 `packages/tushare-sdk/src/models/financial.ts`)

**Checkpoint**: 现金流量表功能完整实现,三大财务报表API全部就绪

---

## Phase 6: User Story 4 - 在TushareClient中直接调用财务数据方法 (Priority: P1)

**Goal**: 确保用户可以通过TushareClient实例直接调用财务数据方法,与其他SDK方法(如getStockBasic、getDailyQuote)保持一致性

**Independent Test**: 创建TushareClient实例后,通过IDE智能提示验证 `client.getIncomeStatement()`, `client.getBalanceSheet()`, `client.getCashFlow()` 三个方法都可见且有完整的类型提示

### 实施任务 - User Story 4

- [X] **T020** [US4] 验证 T007, T012, T017 已正确实现TushareClient类的三个方法,确保方法签名与 `contracts/financial-api-contract.md` 中的契约定义一致

- [X] **T021** [US4] 验证 T008, T013, T018 已正确导出所有类型和方法到 `packages/tushare-sdk/src/index.ts`,确保用户可以从包根路径导入

- [X] **T022** [US4] 运行 TypeScript 编译检查 `pnpm --filter @hestudy/tushare-sdk type-check`,确保所有类型定义无错误

- [X] **T023** [US4] 在 `packages/tushare-sdk/src/client/TushareClient.ts` 的三个新方法上添加完整的 JSDoc 注释,包括使用示例、权限要求、数据更新说明、调用限制(参考 `contracts/financial-api-contract.md`)

**Checkpoint**: TushareClient API完整性验证完成,用户体验与现有方法一致

---

## Phase 7: Polish & Cross-Cutting Concerns (完善与跨切面关注点)

**目的**: 代码质量提升、文档完善、示例代码

- [X] **T024** [P] 在 `apps/node-demo/examples/financial-data.ts` 中创建财务数据查询示例代码,包含利润表、资产负债表、现金流量表的基本查询和财务比率计算示例(参考 `quickstart.md` 中的场景)

- [X] **T025** [P] 在 `packages/tushare-sdk/README.md` 或项目文档中添加财务数据功能的使用说明,包含基本示例、权限要求、常见问题解答(参考 `quickstart.md`)

- [X] **T026** [P] 代码格式化和 lint 检查:运行 `pnpm --filter @hestudy/tushare-sdk lint` 确保代码符合项目规范

- [X] **T027** 验证向后兼容性:确认现有的 `FinancialItem` 和 `getFinancialData` 未被修改或移除,保持现有用户代码可用

- [X] **T028** 运行 `specs/009-sdk/quickstart.md` 中的快速入门场景,验证所有代码示例可正常执行(需要有效的Tushare token和2000+积分)

- [X] **T029** [P] 性能验证:编写简单的性能测试脚本,确认财务数据查询继承了现有的缓存、重试、并发控制特性(可在 `apps/node-demo/examples/` 中创建)

- [X] **T030** 检查所有262个财务字段(利润表94+资产负债表81+现金流量表87)的JSDoc注释是否完整且准确,与Tushare官方文档一致

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 立即开始
- **Foundational (Phase 2)**: 本功能无Foundational任务,现有SDK基础设施已满足需求
- **User Story 1-3 (Phase 3-5)**: 可在 Phase 1 完成后立即并行开始(无相互依赖)
  - US1 (利润表): T004→T005→T006→T007→T008→T009
  - US2 (资产负债表): T010→T011→T012→T013→T014 (复用T005)
  - US3 (现金流量表): T015→T016→T017→T018→T019 (复用T005)
- **User Story 4 (Phase 6)**: 依赖 US1-US3 全部完成(T007, T012, T017)
- **Polish (Phase 7)**: 依赖所有用户故事完成

### User Story Dependencies

- **User Story 1 (P1 - 利润表)**: 无依赖,可首先实施(建议作为MVP)
- **User Story 2 (P1 - 资产负债表)**: 无依赖,可与US1并行,复用US1的 `FinancialQueryParams` 类型(T005)
- **User Story 3 (P1 - 现金流量表)**: 无依赖,可与US1/US2并行,复用US1的 `FinancialQueryParams` 类型(T005)
- **User Story 4 (P1 - API一致性)**: 依赖US1-US3完成,进行集成验证

### Within Each User Story

- **US1**: T004(类型定义) || T005(参数类型) → T006(API函数) → T007(Client方法) → T008(导出) → T009(文档)
- **US2**: T010(类型定义) → T011(API函数,复用T005) → T012(Client方法) → T013(导出) → T014(文档)
- **US3**: T015(类型定义) → T016(API函数,复用T005) → T017(Client方法) → T018(导出) → T019(文档)
- **US4**: T020-T023 验证任务,依赖US1-US3完成

### Parallel Opportunities

**Phase 1 (Setup)**: T001, T002, T003 可并行运行(验证任务)

**Phase 3-5 (User Stories)**: 三个用户故事可并行实施
```bash
# 建议并行策略:
# Developer A: US1 (T004→T005→T006→T007→T008→T009)
# Developer B: US2 (T010→T011→T012→T013→T014)
# Developer C: US3 (T015→T016→T017→T018→T019)
```

**Phase 7 (Polish)**: T024, T025, T026, T029 可并行运行(不同文件)

**同一User Story内的并行**:
- US1: T004 和 T005 可并行(不同接口定义)
- US2: T010 可在 T005 完成后独立开始
- US3: T015 可在 T005 完成后独立开始

---

## Parallel Example: 三个用户故事并行实施

```bash
# 场景1: 三个开发者并行工作(推荐)
Developer A (US1):
  Task T004: 定义 IncomeStatementItem 接口(94字段)
  Task T005: 定义 FinancialQueryParams 接口
  Task T006: 实现 getIncomeStatement API函数
  Task T007: TushareClient 添加 getIncomeStatement 方法
  Task T008: 导出类型和函数
  Task T009: 完善 JSDoc 文档

Developer B (US2):
  等待 T005 完成后开始
  Task T010: 定义 BalanceSheetItem 接口(81字段)
  Task T011: 实现 getBalanceSheet API函数
  Task T012: TushareClient 添加 getBalanceSheet 方法
  Task T013: 导出类型和函数
  Task T014: 完善 JSDoc 文档

Developer C (US3):
  等待 T005 完成后开始
  Task T015: 定义 CashFlowItem 接口(87字段)
  Task T016: 实现 getCashFlow API函数
  Task T017: TushareClient 添加 getCashFlow 方法
  Task T018: 导出类型和函数
  Task T019: 完善 JSDoc 文档

# 场景2: 单个开发者顺序实施
按优先级顺序: US1 → US2 → US3 → US4
```

---

## Implementation Strategy

### MVP First (仅 User Story 1 - 利润表)

1. ✅ Complete Phase 1: Setup (T001-T003)
2. ⏭️ Skip Phase 2: Foundational (本功能无Foundational任务)
3. 🎯 Complete Phase 3: User Story 1 (T004-T009)
4. **STOP and VALIDATE**: 测试利润表功能
   - 创建TushareClient实例
   - 调用 `client.getIncomeStatement({ ts_code: '000001.SZ', period: '20231231' })`
   - 验证返回数据包含94个字段定义
   - 验证TypeScript类型提示正常工作
5. **MVP可交付**: 利润表功能已可用于生产环境

### Incremental Delivery (增量交付所有功能)

1. Phase 1: Setup → 环境就绪
2. Phase 3: US1 (利润表) → **部署/Demo (MVP!)**
3. Phase 4: US2 (资产负债表) → 测试独立功能 → **部署/Demo**
4. Phase 5: US3 (现金流量表) → 测试独立功能 → **部署/Demo**
5. Phase 6: US4 (API一致性验证) → 集成验证
6. Phase 7: Polish → 文档和示例完善
7. **Full Release**: 三大财务报表API全部就绪

### Parallel Team Strategy (多人协作)

**推荐策略** (3名开发者):

```
Week 1:
  - All: Complete Phase 1 (Setup验证)
  - Developer A: T004, T005 (US1类型定义)

Week 1-2:
  - Developer A: T006→T007→T008→T009 (US1完成)
  - Developer B: T010 (US2类型定义,等待T005)
  - Developer C: T015 (US3类型定义,等待T005)

Week 2:
  - Developer A: Code Review for US2/US3
  - Developer B: T011→T012→T013→T014 (US2完成)
  - Developer C: T016→T017→T018→T019 (US3完成)

Week 3:
  - Developer A: T020-T023 (US4验证)
  - All: T024-T030 (Polish并行任务)
```

**关键协作点**:
- T005 (FinancialQueryParams) 是US2和US3的共享依赖,由Developer A优先完成
- 每个User Story独立可测试,避免阻塞
- Code Review在每个Story完成后进行

---

## Notes

- **[P] 标记**: 不同文件,无依赖,可并行执行
- **[Story] 标记**: 任务归属的用户故事,便于追溯和独立验证
- **MVP优先**: 建议首先完成US1(利润表),作为最小可用功能
- **类型字段数量**: 利润表94字段、资产负债表81字段、现金流量表87字段,共262个字段定义
- **向后兼容**: 保留现有 `FinancialItem` 和 `getFinancialData`,不破坏现有用户代码
- **权限要求**: 所有财务数据接口需要至少2000积分,在JSDoc中明确标注
- **无测试任务**: 规格说明中未要求TDD,如需测试可在实施后补充单元测试(vitest)
- **提交策略**: 建议每个User Story完成后提交一次,便于回滚和Code Review
- **验证方式**: 每个User Story完成后使用 `apps/node-demo` 创建测试脚本验证功能

---

## Estimated Effort

| Phase | Tasks | Estimated Time | Notes |
|-------|-------|----------------|-------|
| Phase 1: Setup | T001-T003 | 0.5小时 | 验证任务 |
| Phase 3: US1 (利润表) | T004-T009 | 4-6小时 | 94字段定义+API实现+文档 |
| Phase 4: US2 (资产负债表) | T010-T014 | 3-5小时 | 81字段定义+API实现+文档 |
| Phase 5: US3 (现金流量表) | T015-T019 | 3-5小时 | 87字段定义+API实现+文档 |
| Phase 6: US4 (API一致性) | T020-T023 | 1-2小时 | 验证和文档任务 |
| Phase 7: Polish | T024-T030 | 2-3小时 | 示例代码和文档完善 |
| **Total** | **30 tasks** | **13-21小时** | 单人顺序实施预估 |

**并行实施**: 如果3名开发者并行工作,预计可在1-1.5周内完成所有任务(包括Code Review和集成测试)

---

## Success Criteria

本功能成功交付需满足以下标准(来自 `spec.md` 的 Success Criteria):

✅ **SC-001**: 用户能够在3行代码内完成从创建客户端到获取财务数据的完整流程
✅ **SC-002**: 所有三个财务报表接口(利润表、资产负债表、现金流量表)都在TushareClient中实现
✅ **SC-003**: 财务数据类型定义的字段完整性达到Tushare官方文档的90%以上
✅ **SC-004**: 用户在TypeScript环境下调用财务数据方法时,IDE提供完整的类型提示和参数自动完成
✅ **SC-005**: 财务数据查询支持至少3种查询模式(按报告期、按日期范围、按报告类型)
✅ **SC-006**: 权限不足时,错误消息明确说明所需的最低积分要求
✅ **SC-007**: 所有财务数据方法的单元测试覆盖率达到80%以上 (如需测试)
✅ **SC-008**: SDK文档中包含至少5个财务数据使用示例

---

**Generated by**: `/speckit.tasks` command
**Date**: 2025-10-13
**Ready for**: `/speckit.implement` execution
