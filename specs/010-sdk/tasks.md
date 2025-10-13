# Tasks: SDK财务数据功能测试

**Input**: Design documents from `/specs/010-sdk/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: 任务按用户故事分组,每个故事可以独立实现和测试

## 格式: `[ID] [P?] [Story] Description`
- **[P]**: 可并行运行(不同文件,无依赖)
- **[Story]**: 此任务属于哪个用户故事(US1, US2, US3, US4, US5)
- 描述中包含精确的文件路径

---

## Phase 1: Setup (共享基础设施)

**目的**: 项目初始化和基本结构准备

- [X] T001 [P] 验证vitest测试框架配置 - 检查 `packages/tushare-sdk/vitest.config.ts`
- [X] T002 [P] 验证TypeScript配置 - 确认 `packages/tushare-sdk/tsconfig.json` 启用严格模式
- [X] T003 [P] 检查现有测试文件结构 - 确认 `tests/unit/` 和 `tests/integration/` 目录存在

---

## Phase 2: Foundational (阻塞性前置条件)

**目的**: 在任何用户故事实现之前必须完成的核心基础设施

**⚠️ 关键**: 此阶段完成前,无法开始任何用户故事工作

- [X] T004 创建测试辅助函数 - 在 `tests/unit/financial.test.ts` 中实现 `createMinimalIncomeStatement`, `createMinimalBalanceSheet`, `createMinimalCashFlow` 辅助函数
- [X] T005 [P] 验证被测试模块可用性 - 确认 `src/api/financial.ts` 和 `src/models/financial.ts` 存在且可导入
- [X] T006 [P] 配置测试环境 - 设置mock client基础结构和beforeEach钩子

**Checkpoint**: 基础设施就绪 - 用户故事实现现在可以并行开始

---

## Phase 3: User Story 1 - 财务数据API单元测试 (Priority: P1) 🎯 MVP

**目标**: 为三大财务报表API(利润表、资产负债表、现金流量表)编写完整的单元测试,验证API函数能够正确调用底层client.query方法,并传递正确的参数格式。使用mock技术,不依赖真实API调用。

**独立测试**: 可以通过运行 `pnpm --filter @hestudy/tushare-sdk test tests/unit/financial.test.ts` 独立验证单元测试是否全部通过,测试覆盖率是否达到80%以上。

### 实现 User Story 1

- [X] T007 [P] [US1] 实现getIncomeStatement单元测试 - 在 `tests/unit/financial.test.ts` 中编写TC-001至TC-006测试用例
  - TC-001: 带完整参数调用,验证参数传递
  - TC-002: 不带参数调用
  - TC-003: 多种参数组合(start_date/end_date, report_type等)
  - TC-004: 返回空数组
  - TC-005: 返回多条数据
  - TC-006: 异常抛出

- [X] T008 [P] [US1] 实现getBalanceSheet单元测试 - 在 `tests/unit/financial.test.ts` 中编写TC-007至TC-012测试用例
  - TC-007: 带完整参数调用
  - TC-008: 不带参数调用
  - TC-009: 多种参数组合
  - TC-010: 返回空数组
  - TC-011: 返回多条数据
  - TC-012: 异常抛出

- [X] T009 [P] [US1] 实现getCashFlow单元测试 - 在 `tests/unit/financial.test.ts` 中编写TC-013至TC-018测试用例
  - TC-013: 带完整参数调用
  - TC-014: 不带参数调用
  - TC-015: 多种参数组合
  - TC-016: 返回空数组
  - TC-017: 返回多条数据
  - TC-018: 异常抛出

- [X] T010 [US1] 运行单元测试并验证通过 - 执行 `pnpm --filter @hestudy/tushare-sdk test tests/unit/financial.test.ts` 确保所有测试通过

- [X] T011 [US1] 检查单元测试覆盖率 - 执行 `pnpm --filter @hestudy/tushare-sdk test --coverage` 验证覆盖率 ≥ 80%

**Checkpoint**: 此时,User Story 1应该完全可用且可独立测试

---

## Phase 4: User Story 2 - 财务数据类型定义测试 (Priority: P1)

**目标**: 验证财务数据的TypeScript类型定义是否完整且准确,确保利润表94个字段、资产负债表81个字段、现金流量表87个字段的类型定义都符合Tushare API官方文档规范。

**独立测试**: 可以通过TypeScript编译检查和专门的类型测试用例独立验证,使用 `pnpm --filter @hestudy/tushare-sdk type-check` 验证类型推断是否正确。

### 实现 User Story 2

- [X] T012 [P] [US2] 实现IncomeStatementItem类型测试 - 在 `tests/unit/financial.test.ts` 中编写TC-019测试用例
  - TTC-001: 必填字段完整性
  - TTC-002: 可选字段类型正确性
  - TTC-004: 每股指标字段类型
  - TTC-005: 收入类指标字段类型
  - TTC-006: 利润类指标字段类型
  - TTC-007: 类型导入导出

- [X] T013 [P] [US2] 实现BalanceSheetItem类型测试 - 在 `tests/unit/financial.test.ts` 中编写TC-020测试用例
  - TTC-008: 必填字段完整性
  - TTC-009: 资产类字段类型
  - TTC-010: 负债类字段类型
  - TTC-011: 所有者权益字段类型

- [X] T014 [P] [US2] 实现CashFlowItem类型测试 - 在 `tests/unit/financial.test.ts` 中编写TC-021测试用例
  - TTC-013: 必填字段完整性
  - TTC-014: 经营活动现金流字段类型
  - TTC-015: 投资活动现金流字段类型
  - TTC-016: 筹资活动现金流字段类型
  - TTC-017: 现金汇总字段类型

- [X] T015 [P] [US2] 实现FinancialQueryParams类型测试 - 在 `tests/unit/financial.test.ts` 中编写TC-022测试用例
  - TTC-019: 参数类型定义
  - TTC-020: report_type字面量类型
  - TTC-021: 参数可选性验证

- [X] T016 [US2] 运行TypeScript类型检查 - 执行 `pnpm --filter @hestudy/tushare-sdk type-check` 确认无类型错误

- [X] T017 [US2] 验证类型测试通过 - 执行 `pnpm --filter @hestudy/tushare-sdk test tests/unit/financial.test.ts` 确保类型相关测试通过

**Checkpoint**: 此时,User Stories 1 和 2 应该都独立工作

---

## Phase 5: User Story 3 - 财务数据集成测试 (Priority: P2)

**目标**: 编写集成测试,使用真实的Tushare API Token验证财务数据功能在实际环境中的表现,包括数据获取、缓存机制、错误处理等端到端场景。

**独立测试**: 可以通过设置TUSHARE_TOKEN环境变量后运行集成测试独立验证 `export TUSHARE_TOKEN=xxx && pnpm --filter @hestudy/tushare-sdk test tests/integration/financial.integration.test.ts`

### 实现 User Story 3

- [X] T018 [US3] 创建集成测试文件 - 创建 `tests/integration/financial.integration.test.ts` 并配置基本结构(skipIf, client setup)

- [X] T019 [P] [US3] 实现利润表集成测试 - 在 `tests/integration/financial.integration.test.ts` 中编写ITC-001至ITC-005测试用例
  - ITC-001: 查询指定公司的年报利润表
  - ITC-002: 查询不同报告期类型
  - ITC-003: 按日期范围查询
  - ITC-004: 查询不存在的股票代码
  - ITC-005: 验证数据完整性

- [X] T020 [P] [US3] 实现资产负债表集成测试 - 在 `tests/integration/financial.integration.test.ts` 中编写ITC-006至ITC-008测试用例
  - ITC-006: 查询指定公司的资产负债表
  - ITC-007: 验证资产负债平衡
  - ITC-008: 查询不同公司类型

- [X] T021 [P] [US3] 实现现金流量表集成测试 - 在 `tests/integration/financial.integration.test.ts` 中编写ITC-009至ITC-011测试用例
  - ITC-009: 查询现金流量表
  - ITC-010: 验证现金流平衡
  - ITC-011: 查询多个报告期

- [X] T022 [US3] 实现缓存机制测试 - 在 `tests/integration/financial.integration.test.ts` 中编写ITC-014测试用例,验证第二次请求使用缓存

- [X] T023 [US3] 实现错误处理集成测试 - 在 `tests/integration/financial.integration.test.ts` 中编写ITC-015至ITC-017测试用例
  - ITC-015: 无效token应该抛出错误
  - ITC-016: 权限不足应该有明确错误提示
  - ITC-017: 无效参数格式

- [X] T024 [US3] 运行集成测试(有token) - 设置TUSHARE_TOKEN后执行集成测试,确保所有测试通过

- [X] T025 [US3] 验证集成测试跳过机制 - 不设置TUSHARE_TOKEN运行测试,确认优雅跳过而不是失败

**Checkpoint**: 所有用户故事(US1, US2, US3)应该现在独立功能正常

---

## Phase 6: User Story 4 - TushareClient类方法测试 (Priority: P2)

**目标**: 验证TushareClient类上的财务数据方法(client.getIncomeStatement、client.getBalanceSheet、client.getCashFlow)能够正确工作,与直接调用API函数的行为一致,确保用户体验的一致性。

**独立测试**: 可以通过单独的测试套件验证TushareClient类的三个方法是否正确调用内部的API函数,测试方法签名和返回值是否符合预期。

### 实现 User Story 4

- [X] T026 [P] [US4] 实现client.getIncomeStatement方法测试 - 在 `tests/unit/financial.test.ts` 中编写TC-023测试用例,验证client方法与函数调用一致性

- [X] T027 [P] [US4] 实现client.getBalanceSheet方法测试 - 在 `tests/unit/financial.test.ts` 中编写TC-024测试用例

- [X] T028 [P] [US4] 实现client.getCashFlow方法测试 - 在 `tests/unit/financial.test.ts` 中编写TC-025测试用例

- [X] T029 [US4] 实现client方法配置继承测试 - 在 `tests/integration/financial.integration.test.ts` 中编写ITC-012和ITC-013测试用例
  - ITC-012: 通过client方法调用
  - ITC-013: 配置继承测试(重试机制)

- [X] T030 [US4] 运行client方法测试并验证 - 执行单元测试和集成测试,确保client方法测试通过

**Checkpoint**: User Story 4 完成,client方法功能验证

---

## Phase 7: User Story 5 - 边界条件和错误处理测试 (Priority: P3)

**目标**: 编写测试验证财务数据功能在各种边界条件和错误场景下的行为,确保系统的健壮性和用户友好的错误提示。

**独立测试**: 可以通过专门的测试套件独立验证各种边界条件的处理,包括空参数、无效参数、异常数据等场景。

### 实现 User Story 5

- [X] T031 [P] [US5] 实现空参数边界条件测试 - 在 `tests/unit/financial.test.ts` 中添加空字符串、空对象等边界条件测试

- [X] T032 [P] [US5] 实现参数优先级测试 - 测试period和start_date同时提供时的处理逻辑

- [X] T033 [P] [US5] 实现null值处理测试 - 验证API返回null值时TypeScript类型系统的正确处理

- [X] T034 [P] [US5] 实现未公布报告期测试 - 测试查询尚未公布的报告期数据的处理

- [X] T035 [US5] 实现日期格式错误测试 - 测试不正确的日期格式(如"2023-12-31")的错误提示

- [X] T036 [US5] 实现特殊字符股票代码测试 - 测试包含特殊字符或空格的股票代码验证

- [X] T037 [US5] 运行边界条件测试并验证 - 执行所有边界条件测试,确保健壮性

**Checkpoint**: 所有用户故事独立功能正常,边界条件处理完善

---

## Phase 8: Polish & Cross-Cutting Concerns

**目的**: 影响多个用户故事的改进和完善

- [X] T038 [P] 验证整体测试覆盖率达标 - 运行 `pnpm --filter @hestudy/tushare-sdk test --coverage`,确认覆盖率 ≥ 80%

- [X] T039 [P] 验证所有测试通过 - 运行完整测试套件(单元+集成),确保无失败用例

- [X] T040 [P] 代码风格检查 - 确保测试代码遵循现有代码风格(参考daily-basic.test.ts)

- [X] T041 [P] 添加测试注释和文档 - 为复杂测试逻辑添加清晰注释,更新相关文档

- [X] T042 运行quickstart.md验证 - 按照 `specs/010-sdk/quickstart.md` 步骤验证测试功能完整性

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 可立即开始
- **Foundational (Phase 2)**: 依赖Setup完成 - 阻塞所有用户故事
- **User Stories (Phase 3-7)**: 全部依赖Foundational阶段完成
  - 用户故事可并行进行(如有人力配置)
  - 或按优先级顺序执行(P1 → P2 → P3)
- **Polish (Phase 8)**: 依赖所有期望的用户故事完成

### User Story Dependencies

- **User Story 1 (P1)**: 可在Foundational (Phase 2)后开始 - 无其他故事依赖
- **User Story 2 (P1)**: 可在Foundational (Phase 2)后开始 - 无其他故事依赖
- **User Story 3 (P2)**: 可在Foundational (Phase 2)后开始 - 无其他故事依赖(独立可测)
- **User Story 4 (P2)**: 可在Foundational (Phase 2)后开始 - 与US1集成但独立可测
- **User Story 5 (P3)**: 可在Foundational (Phase 2)后开始 - 补充US1-US4的边界测试

### Within Each User Story

- 模型创建在服务实现前
- 测试辅助函数在测试用例前
- 核心实现在集成测试前
- 故事完成后再进入下一优先级

### Parallel Opportunities

- Phase 1中所有标记[P]的任务可并行
- Phase 2中所有标记[P]的任务可并行
- Foundational阶段完成后,所有用户故事可并行开始(如团队容量允许)
- 每个用户故事内标记[P]的任务可并行
- US1和US2可完全并行(都是P1优先级,无依赖)
- US3和US4可并行(都是P2优先级,无相互依赖)

---

## Parallel Example: User Story 1 & User Story 2

```bash
# Phase 2完成后,可同时启动US1和US2:

# US1: 并行启动三个API的单元测试
Task: "实现getIncomeStatement单元测试"
Task: "实现getBalanceSheet单元测试"
Task: "实现getCashFlow单元测试"

# US2: 并行启动三个类型的类型测试
Task: "实现IncomeStatementItem类型测试"
Task: "实现BalanceSheetItem类型测试"
Task: "实现CashFlowItem类型测试"
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2 Only)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational (关键 - 阻塞所有故事)
3. 完成 Phase 3: User Story 1 (单元测试)
4. 完成 Phase 4: User Story 2 (类型测试)
5. **停止并验证**: 测试US1和US2独立工作
6. 部署/演示MVP(核心单元测试+类型测试完成)

### Incremental Delivery

1. 完成 Setup + Foundational → 基础就绪
2. 添加 US1 + US2 → 独立测试 → 部署/演示 (MVP!)
3. 添加 US3 → 独立测试 → 部署/演示 (集成测试)
4. 添加 US4 → 独立测试 → 部署/演示 (Client方法)
5. 添加 US5 → 独立测试 → 部署/演示 (边界条件)
6. 每个故事添加价值而不破坏之前的故事

### Parallel Team Strategy

多个开发人员:

1. 团队共同完成 Setup + Foundational
2. Foundational完成后:
   - Developer A: User Story 1 (单元测试)
   - Developer B: User Story 2 (类型测试)
   - Developer C: User Story 3 (集成测试)
3. 故事独立完成并集成

---

## Task Count Summary

- **Setup**: 3 tasks
- **Foundational**: 3 tasks (阻塞所有用户故事)
- **User Story 1** (P1): 5 tasks (API单元测试)
- **User Story 2** (P1): 6 tasks (类型测试)
- **User Story 3** (P2): 8 tasks (集成测试)
- **User Story 4** (P2): 5 tasks (Client方法测试)
- **User Story 5** (P3): 7 tasks (边界条件)
- **Polish**: 5 tasks
- **Total**: 42 tasks

---

## Notes

- [P] 任务 = 不同文件,无依赖
- [Story] 标签将任务映射到特定用户故事以便追溯
- 每个用户故事应该可独立完成和测试
- 每个任务或逻辑组后提交
- 在任何检查点停止以独立验证故事
- 避免: 模糊任务、同文件冲突、破坏独立性的跨故事依赖
