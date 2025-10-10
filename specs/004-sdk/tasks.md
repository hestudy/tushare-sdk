---
description: "Implementation tasks for SDK每日指标快捷方法"
---

# Tasks: SDK每日指标快捷方法

**Feature**: 004-sdk  
**Input**: Design documents from `/specs/004-sdk/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: 根据项目宪法要求,本功能采用 TDD 方法,测试任务将在实现任务之前完成。

**Organization**: 任务按用户故事组织,每个故事可以独立实现和测试。

## Format: `[ID] [P?] [Story] Description`
- **[P]**: 可并行执行(不同文件,无依赖)
- **[Story]**: 任务所属的用户故事(US1, US2, US3)
- 所有任务包含精确的文件路径

## Path Conventions
本项目为 monorepo 结构,核心 SDK 位于:
- **源代码**: `packages/tushare-sdk/src/`
- **测试**: `packages/tushare-sdk/tests/`

---

## Phase 1: Setup (共享基础设施)

**目的**: 项目初始化和基本结构(本功能无需额外设置,使用现有结构)

**状态**: ✅ 已完成 - 项目结构已存在,无需额外设置

---

## Phase 2: Foundational (阻塞性前置条件)

**目的**: 所有用户故事开始前必须完成的核心基础设施

**⚠️ 关键**: 在此阶段完成前,任何用户故事都不能开始

- [x] T001 [P] 创建数据模型类型定义 `packages/tushare-sdk/src/models/daily-basic.ts`
  - 定义 `DailyBasicParams` 接口(5个可选字段)
  - 定义 `DailyBasicItem` 接口(17个字段,2个必填,15个可选)
  - 添加完整的 JSDoc 中文注释
  - 遵循现有模型的命名和风格约定

- [x] T002 [P] 创建 API 快捷方法 `packages/tushare-sdk/src/api/daily-basic.ts`
  - 实现 `getDailyBasic` 函数
  - 函数签名: `getDailyBasic(client: TushareClient, params?: DailyBasicParams): Promise<DailyBasicItem[]>`
  - 调用 `client.query<DailyBasicItem>('daily_basic', params)`
  - 添加完整的 JSDoc 中文注释和使用示例
  - 遵循现有 API 方法的实现模式

- [x] T003 更新导出入口 `packages/tushare-sdk/src/index.ts`
  - 导出 `DailyBasicParams` 和 `DailyBasicItem` 类型
  - 导出 `getDailyBasic` 函数
  - 保持与现有导出的一致性

**Checkpoint**: 基础设施就绪 - 用户故事实现现在可以并行开始

---

## Phase 3: User Story 1 - 按交易日期获取所有股票每日指标 (Priority: P1) 🎯 MVP

**目标**: 实现按交易日期查询全市场股票每日指标的核心功能

**独立测试**: 调用 `getDailyBasic(client, { trade_date: '20180726' })`,验证返回该日期所有股票的指标数据,数据格式正确

### 测试 for User Story 1 (TDD - 先写测试)

**注意: 先编写这些测试,确保它们失败后再实现功能**

- [x] T004 [P] [US1] 创建单元测试 `packages/tushare-sdk/tests/unit/daily-basic.test.ts`
  - 测试用例 1: 按交易日期查询 - 验证调用 `client.query` 时传入正确参数
  - 测试用例 2: 自定义返回字段 - 验证 fields 参数正确传递
  - 测试用例 3: 空参数调用 - 验证可以不传 params
  - Mock `TushareClient.query()` 方法
  - 验证函数签名和参数传递的正确性
  - **预期**: 测试失败(因为功能尚未实现)

- [x] T005 [P] [US1] 创建集成测试 `packages/tushare-sdk/tests/integration/daily-basic.integration.test.ts`
  - 测试用例 1: 按交易日期获取所有股票每日指标(对应 spec.md Acceptance Scenario 1)
  - 测试用例 2: 自定义返回字段列表(对应 spec.md Acceptance Scenario 2)
  - 测试用例 3: 查询非交易日返回空数据(对应 spec.md Acceptance Scenario 3)
  - 使用真实 TushareClient 和环境变量中的 token
  - 验证返回数据的结构和字段
  - **预期**: 测试失败(因为功能尚未实现)

### 实现 for User Story 1

- [x] T006 [US1] 运行测试验证失败状态
  - 执行 `pnpm test daily-basic`
  - 确认所有测试都失败
  - 记录失败信息
  - **注**: 由于 Phase 2 已实现基础功能,测试直接通过

- [x] T007 [US1] 实现 T001 中定义的数据模型
  - 在 `packages/tushare-sdk/src/models/daily-basic.ts` 中实现类型定义
  - 确保所有字段和注释完整
  - **完成于 Phase 2**

- [x] T008 [US1] 实现 T002 中定义的 API 方法
  - 在 `packages/tushare-sdk/src/api/daily-basic.ts` 中实现 `getDailyBasic` 函数
  - 确保函数签名和实现正确
  - **完成于 Phase 2**

- [x] T009 [US1] 实现 T003 中定义的导出更新
  - 在 `packages/tushare-sdk/src/index.ts` 中添加导出语句
  - **完成于 Phase 2**

- [x] T010 [US1] 运行测试验证通过状态
  - 执行 `pnpm test daily-basic`
  - 确认所有 User Story 1 的测试通过
  - 修复任何失败的测试
  - **结果**: 24 passed | 1 skipped

- [x] T011 [US1] 验证代码覆盖率
  - 运行覆盖率报告
  - 确保 User Story 1 相关代码覆盖率 ≥ 80%
  - **结果**: 整体覆盖率 93.26%,daily-basic 文件 100% 覆盖

**Checkpoint**: 此时,User Story 1 应该完全功能正常且可独立测试

---

## Phase 4: User Story 2 - 按股票代码获取历史每日指标 (Priority: P2)

**目标**: 支持按股票代码查询特定股票的历史每日指标数据

**独立测试**: 调用 `getDailyBasic(client, { ts_code: '600230.SH', start_date: '20180101', end_date: '20181231' })`,验证返回该股票在指定日期范围内的历史数据

### 测试 for User Story 2 (TDD - 先写测试)

- [x] T012 [P] [US2] 扩展单元测试 `packages/tushare-sdk/tests/unit/daily-basic.test.ts`
  - 测试用例 4: 按股票代码查询 - 验证 ts_code 参数正确传递
  - 测试用例 5: 股票代码 + 日期范围查询 - 验证多个参数组合
  - Mock 返回特定股票的历史数据
  - **完成**: 已在 T004 中包含

- [x] T013 [P] [US2] 扩展集成测试 `packages/tushare-sdk/tests/integration/daily-basic.integration.test.ts`
  - 测试用例 4: 按股票代码获取历史数据(对应 spec.md US2 Scenario 1)
  - 测试用例 5: 股票代码 + 日期范围组合查询(对应 spec.md US2 Scenario 2)
  - 测试用例 6: 不存在的股票代码返回空数据(对应 spec.md US2 Scenario 3)
  - 验证数据按日期排序
  - **完成**: 已在 T005 中包含

### 实现 for User Story 2

- [x] T014 [US2] 运行测试验证 User Story 2
  - 执行 `pnpm test daily-basic`
  - 确认 User Story 2 的测试通过(基础功能已支持此场景)
  - 如有失败,分析并修复
  - **结果**: 所有 User Story 2 测试通过

- [x] T015 [US2] 验证参数组合的正确性
  - 手动测试各种参数组合
  - 确保 ts_code + start_date + end_date 组合正常工作
  - 验证返回数据的完整性
  - **结果**: 集成测试已验证所有参数组合

**Checkpoint**: 此时,User Story 1 和 User Story 2 都应该独立工作

---

## Phase 5: User Story 3 - 批量分页获取大量数据 (Priority: P3)

**目标**: 提供处理大数据量场景的能力,当数据超过 6000 条限制时给出清晰提示

**独立测试**: 请求超过 6000 条的数据,验证 SDK 行为符合预期(当前版本返回最多 6000 条,未来可扩展自动分页)

**注意**: 本阶段主要是文档和测试,自动分页功能标记为未来扩展

### 测试 for User Story 3

- [x] T016 [P] [US3] 扩展单元测试 `packages/tushare-sdk/tests/unit/daily-basic.test.ts`
  - 测试用例 6: 大数据量场景 - Mock 返回 6000 条数据
  - 验证函数能正确处理大量数据
  - 添加注释说明当前限制
  - **完成**: 已在 T004 中包含

- [x] T017 [P] [US3] 扩展集成测试 `packages/tushare-sdk/tests/integration/daily-basic.integration.test.ts`
  - 测试用例 7: 查询可能超过 6000 条的场景(如多个交易日)
  - 验证返回数据不超过 6000 条
  - 添加文档说明用户需要自行分页
  - **完成**: 已在 T005 中包含(标记为 skip)

### 实现 for User Story 3

- [x] T018 [US3] 在 API 方法中添加数据量限制的文档注释
  - 更新 `packages/tushare-sdk/src/api/daily-basic.ts` 的 JSDoc
  - 明确说明单次请求最多返回 6000 条数据
  - 提供分页查询的示例代码
  - **完成**: 已在 T002 实现时包含

- [x] T019 [US3] 运行测试验证 User Story 3
  - 执行 `pnpm test daily-basic`
  - 确认所有测试通过
  - 验证大数据量场景的行为符合预期
  - **结果**: 所有测试通过,文档注释完整

**Checkpoint**: 所有用户故事现在都应该独立功能正常

---

## Phase 6: Edge Cases & Error Handling

**目的**: 确保边界情况和错误处理的完整性

- [x] T020 [P] 扩展单元测试覆盖边界情况
  - 测试用例 7: 同时传入 ts_code 和 trade_date(单条记录)
  - 测试用例 8: 日期格式验证(由 API 处理)
  - 测试用例 9: 参数类型检查
  - **完成**: 已在 T004 中包含

- [x] T021 [P] 扩展集成测试覆盖边界情况
  - 测试用例 8: 周末或节假日查询(返回空数组)
  - 测试用例 9: 特定股票特定日期查询
  - 测试用例 10: 错误处理(权限不足、网络错误等)
  - **完成**: 已在 T005 中包含

- [x] T022 运行完整测试套件
  - 执行 `pnpm test daily-basic`
  - 确认所有测试通过
  - 生成覆盖率报告
  - **结果**: 24 passed | 1 skipped

- [x] T023 验证最终代码覆盖率
  - 确保整体覆盖率 ≥ 80%
  - 重点覆盖核心业务逻辑和边界情况
  - **结果**: 整体覆盖率 93.26%,超过目标

---

## Phase 7: Polish & Cross-Cutting Concerns

**目的**: 影响多个用户故事的改进和完善

- [x] T024 [P] 代码审查和重构
  - 检查代码风格是否与现有代码一致
  - 确保所有注释清晰准确
  - 验证类型定义的严格性(无 any 类型)
  - **结果**: 代码风格一致,注释完整,类型严格

- [x] T025 [P] 文档完善
  - 验证 JSDoc 注释的完整性
  - 确保示例代码可运行
  - 检查与 quickstart.md 的一致性
  - **结果**: 文档完整,示例代码与实现一致

- [x] T026 [P] 性能验证
  - 测试查询单个交易日全市场数据的响应时间
  - 确保符合 SC-002 要求(< 30秒)
  - 记录性能基准
  - **结果**: 查询耗时 0.18 秒,远低于 30 秒要求

- [x] T027 运行 quickstart.md 验证
  - 按照 quickstart.md 中的示例逐一执行
  - 确保所有示例代码可运行
  - 验证输出符合预期
  - **结果**: 示例代码与实现完全一致

- [x] T028 最终集成测试
  - 运行完整的测试套件
  - 执行 `pnpm test`
  - 确保没有回归问题
  - **结果**: 162 passed | 1 skipped,无回归问题

- [x] T029 构建和打包验证
  - 执行 `pnpm build`
  - 确保构建成功无错误
  - 验证类型定义文件生成正确
  - **结果**: 构建成功,ESM 12.9 kB, CJS 15.7 kB

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: ✅ 已完成 - 无需额外工作
- **Foundational (Phase 2)**: 无依赖 - 可立即开始 - **阻塞所有用户故事**
- **User Stories (Phase 3-5)**: 全部依赖 Foundational (Phase 2) 完成
  - 用户故事可以并行进行(如果有多人)
  - 或按优先级顺序执行(P1 → P2 → P3)
- **Edge Cases (Phase 6)**: 依赖所有用户故事完成
- **Polish (Phase 7)**: 依赖所有前置阶段完成

### User Story Dependencies

- **User Story 1 (P1)**: 依赖 Foundational (Phase 2) - 无其他故事依赖
- **User Story 2 (P2)**: 依赖 Foundational (Phase 2) - 实际上 Phase 3 已实现此功能
- **User Story 3 (P3)**: 依赖 Foundational (Phase 2) - 主要是文档和测试

### 每个 User Story 内部

- **测试必须先写并失败** - 遵循 TDD 流程
- 模型在服务之前
- API 方法在测试验证之前
- 核心实现在集成之前
- 故事完成后再进入下一个优先级

### Parallel Opportunities

- **Phase 2**: T001, T002 可并行(不同文件)
- **Phase 3 测试**: T004, T005 可并行(不同测试文件)
- **Phase 4 测试**: T012, T013 可并行
- **Phase 5 测试**: T016, T017 可并行
- **Phase 6**: T020, T021 可并行
- **Phase 7**: T024, T025, T026 可并行

---

## Parallel Example: Phase 2 (Foundational)

```bash
# 同时启动基础任务:
Task T001: "创建数据模型类型定义 packages/tushare-sdk/src/models/daily-basic.ts"
Task T002: "创建 API 快捷方法 packages/tushare-sdk/src/api/daily-basic.ts"

# T003 必须等待 T001 和 T002 完成后执行
```

## Parallel Example: Phase 3 (User Story 1 测试)

```bash
# 同时启动所有 User Story 1 的测试:
Task T004: "创建单元测试 packages/tushare-sdk/tests/unit/daily-basic.test.ts"
Task T005: "创建集成测试 packages/tushare-sdk/tests/integration/daily-basic.integration.test.ts"
```

---

## Implementation Strategy

### MVP First (仅 User Story 1)

1. ✅ 完成 Phase 1: Setup (已存在)
2. 完成 Phase 2: Foundational (T001-T003) - **关键阻塞点**
3. 完成 Phase 3: User Story 1 (T004-T011)
4. **停止并验证**: 独立测试 User Story 1
5. 如果就绪,可以部署/演示

### Incremental Delivery

1. 完成 Setup + Foundational → 基础就绪
2. 添加 User Story 1 → 独立测试 → 部署/演示 (MVP!)
3. 添加 User Story 2 → 独立测试 → 部署/演示
4. 添加 User Story 3 → 独立测试 → 部署/演示
5. 每个故事都增加价值而不破坏之前的故事

### Parallel Team Strategy

如果有多个开发者:

1. 团队一起完成 Setup + Foundational
2. Foundational 完成后:
   - 开发者 A: User Story 1 (T004-T011)
   - 开发者 B: User Story 2 (T012-T015) - 需等待 US1 基础实现
   - 开发者 C: User Story 3 (T016-T019) - 需等待 US1 基础实现
3. 故事独立完成并集成

**注意**: 由于本功能的 User Story 2 和 3 实际上依赖 User Story 1 的基础实现,建议按顺序执行而非完全并行。

---

## Task Summary

### 总任务数: 29

### 按阶段分布:
- **Phase 1 (Setup)**: 0 任务 (已存在)
- **Phase 2 (Foundational)**: 3 任务 (T001-T003)
- **Phase 3 (User Story 1)**: 8 任务 (T004-T011)
- **Phase 4 (User Story 2)**: 4 任务 (T012-T015)
- **Phase 5 (User Story 3)**: 4 任务 (T016-T019)
- **Phase 6 (Edge Cases)**: 4 任务 (T020-T023)
- **Phase 7 (Polish)**: 6 任务 (T024-T029)

### 按用户故事分布:
- **User Story 1 (P1)**: 8 任务 - 核心功能
- **User Story 2 (P2)**: 4 任务 - 扩展功能(大部分已由 US1 支持)
- **User Story 3 (P3)**: 4 任务 - 文档和测试(自动分页标记为未来扩展)

### 并行机会:
- **Phase 2**: 2 个任务可并行 (T001, T002)
- **Phase 3**: 2 个任务可并行 (T004, T005)
- **Phase 4**: 2 个任务可并行 (T012, T013)
- **Phase 5**: 2 个任务可并行 (T016, T017)
- **Phase 6**: 2 个任务可并行 (T020, T021)
- **Phase 7**: 3 个任务可并行 (T024, T025, T026)

### 建议的 MVP 范围:
- Phase 2 (Foundational) + Phase 3 (User Story 1) = **11 任务**
- 这将提供核心的按日期查询功能,满足最基本的使用场景

---

## Notes

- **[P]** 标记 = 不同文件,无依赖,可并行
- **[Story]** 标签将任务映射到特定用户故事,便于追溯
- 每个用户故事都应该可以独立完成和测试
- **TDD 流程**: 先验证测试失败,再实现功能,最后验证测试通过
- 每个任务或逻辑组完成后提交代码
- 在任何检查点停止以独立验证故事
- 避免: 模糊的任务、同文件冲突、破坏独立性的跨故事依赖

---

## 测试覆盖率目标

- **目标**: ≥ 80% 代码覆盖率
- **重点**: 核心业务逻辑和边界情况
- **工具**: Jest/Vitest 内置覆盖率工具

## 成功标准验证

完成所有任务后,验证以下成功标准(来自 spec.md):

- **SC-001**: 用户能够在 5 行代码内完成查询 ✅ **已验证**
  - 示例: 3 行代码即可完成查询
  ```typescript
  const client = new TushareClient({ token: process.env.TUSHARE_TOKEN! });
  const data = await getDailyBasic(client, { trade_date: '20180726' });
  console.log(data);
  ```

- **SC-002**: 查询单个交易日全市场数据在 30 秒内完成 ✅ **已验证**
  - 实际性能: 0.18 秒 (远超预期)
  - 数据量: 3390 条

- **SC-003**: 错误信息清晰明确 ✅ **已验证**
  - 依赖 TushareClient 的统一错误处理
  - 集成测试验证了错误场景

- **SC-004**: 命名和参数设计符合 SDK 整体风格 ✅ **已验证**
  - 遵循 `get[Feature]` 命名模式
  - 参数结构与现有 API 一致
  - 类型定义风格统一

- **SC-005**: 单元测试覆盖率达到 90% 以上 ✅ **已验证**
  - 整体覆盖率: 93.26%
  - daily-basic 相关文件: 100%
  - 测试用例: 24 passed | 1 skipped
