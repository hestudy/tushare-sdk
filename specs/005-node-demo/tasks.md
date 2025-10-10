---
description: "Task list for Node Demo 每日指标演示 implementation"
---

# Tasks: Node Demo 每日指标演示

**Feature Branch**: `005-node-demo`  
**Input**: Design documents from `/specs/005-node-demo/`  
**Prerequisites**: ✅ plan.md, ✅ spec.md, ✅ research.md, ✅ data-model.md, ✅ contracts/

**Tests**: 根据项目宪法要求,本功能采用 TDD 方法,测试任务在实现任务之前执行。

**Organization**: 任务按用户故事组织,每个故事可以独立实现和测试。

## Format: `[ID] [P?] [Story] Description`
- **[P]**: 可并行执行(不同文件,无依赖)
- **[Story]**: 任务所属用户故事(US1, US2, US3)
- 所有任务包含精确的文件路径

## Path Conventions
- **项目类型**: Single project (现有 node-demo 应用扩展)
- **源代码**: `apps/node-demo/src/`
- **测试**: `apps/node-demo/tests/`
- **文档**: `apps/node-demo/README.md`

---

## Phase 1: Setup (共享基础设施)

**目的**: 项目初始化和基本结构验证

- [X] T001 验证现有 node-demo 应用结构和依赖完整性
- [X] T002 [P] 验证 SDK 的 getDailyBasic API 可用性(已在 004-sdk 中实现)
- [X] T003 [P] 验证现有工具函数(logger, formatter, error-handler)可复用性

**Checkpoint**: 基础设施验证完成,可以开始用户故事实现

---

## Phase 2: User Story 1 - 查看每日指标基本用法 (Priority: P1) 🎯 MVP

**Goal**: 实现 daily-basic 示例的核心功能,展示按日期查询全市场数据的基本用法

**Independent Test**: 运行 `pnpm --filter node-demo start --example=daily-basic` 成功返回数据并在控制台展示

### Tests for User Story 1 (TDD - 先写测试)

**NOTE: 先编写这些测试,确保它们失败后再实现功能**

- [X] T004 [P] [US1] 创建单元测试文件 `apps/node-demo/tests/unit/daily-basic.test.ts`,测试示例函数返回值结构
- [X] T005 [P] [US1] 创建集成测试文件 `apps/node-demo/tests/integration/daily-basic.integration.test.ts`,测试真实 API 调用

### Implementation for User Story 1

- [X] T006 [US1] 创建每日指标示例文件 `apps/node-demo/src/examples/daily-basic.ts`,实现 `runDailyBasicExample` 函数
  - 导入 SDK 客户端和类型
  - 实现场景 1: 按交易日期查询全市场数据
  - 实现基本错误处理
  - 返回 `{ count, sample }` 结构
  - 添加完整的 JSDoc 中文注释

- [X] T007 [US1] 更新类型定义 `apps/node-demo/src/types.ts`,添加 'daily-basic' 到 ExampleName 类型

- [X] T008 [US1] 更新主入口 `apps/node-demo/src/index.ts`,将 daily-basic 添加到示例列表
  - 添加到 allExamples 数组
  - 更新参数解析逻辑

- [X] T009 [US1] 运行单元测试,验证测试通过

- [X] T010 [US1] 运行集成测试,验证 API 调用成功

**Checkpoint**: User Story 1 完成 - 基本的每日指标示例可以独立运行和测试

---

## Phase 3: User Story 2 - 查看多种查询方式 (Priority: P2)

**Goal**: 扩展示例以展示多种查询方式(按股票、自定义字段),提升学习效果

**Independent Test**: 查看控制台输出,验证展示了 3 种不同的查询方式,每种都有清晰说明

### Tests for User Story 2 (TDD - 先写测试)

- [X] T011 [US2] 更新单元测试 `apps/node-demo/tests/unit/daily-basic.test.ts`,添加多场景测试用例
  - 测试场景 2: 按股票代码查询
  - 测试场景 3: 自定义返回字段

- [X] T012 [US2] 更新集成测试 `apps/node-demo/tests/integration/daily-basic.integration.test.ts`,验证多场景数据格式

### Implementation for User Story 2

- [X] T013 [US2] 扩展 `apps/node-demo/src/examples/daily-basic.ts`,添加场景 2 和场景 3
  - 场景 2: 按股票代码查询历史数据 (ts_code + start_date + end_date)
  - 场景 3: 自定义返回字段 (fields 参数)
  - 为每个场景添加清晰的注释说明

- [X] T014 [US2] 优化控制台输出格式,清晰展示每个场景的查询参数和结果
  - 使用分隔符区分不同场景
  - 突出显示关键字段(ts_code, trade_date, pe, pb, turnover_rate, total_mv)

- [X] T015 [US2] 运行单元测试,验证多场景测试通过

- [X] T016 [US2] 运行集成测试,验证多场景 API 调用成功

**Checkpoint**: User Story 2 完成 - 示例展示了 3 种查询方式,用户可以理解 API 的灵活性

---

## Phase 4: User Story 3 - 查看错误处理演示 (Priority: P3)

**Goal**: 完善错误处理,展示如何处理各种异常情况,提升代码健壮性

**Independent Test**: 查看示例代码中的 try-catch 块和错误处理逻辑,验证错误处理完整性

### Tests for User Story 3 (TDD - 先写测试)

- [X] T017 [US3] 更新单元测试 `apps/node-demo/tests/unit/daily-basic.test.ts`,添加错误处理测试
  - 测试无数据返回情况(空数组)
  - 测试错误抛出和传播

- [X] T018 [US3] 更新集成测试 `apps/node-demo/tests/integration/daily-basic.integration.test.ts`,添加权限验证测试

### Implementation for User Story 3

- [X] T019 [US3] 完善 `apps/node-demo/src/examples/daily-basic.ts` 的错误处理
  - 添加完整的 try-catch 错误处理
  - 处理无数据返回情况(周末/节假日)
  - 添加友好的错误提示信息
  - 在 verbose 模式下显示详细错误堆栈

- [X] T020 [US3] 运行单元测试,验证错误处理测试通过

- [X] T021 [US3] 运行集成测试,验证错误场景处理正确

**Checkpoint**: User Story 3 完成 - 示例包含完整的错误处理,代码健壮性达标

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: 文档更新、代码优化和最终验证

- [X] T022 [P] 更新 `apps/node-demo/README.md`,添加每日指标示例的使用说明
  - 添加"4. 每日指标查询 (daily-basic)"章节
  - 包含运行命令、演示内容、关键字段说明
  - 说明权限要求(2000+ 积分)

- [X] T023 [P] 代码风格检查,确保与现有示例一致
  - 运行 TypeScript 类型检查
  - 验证命名规范(kebab-case 文件名,camelCase 变量名)
  - 验证注释覆盖率 ≥ 80%

- [X] T024 运行完整测试套件,验证所有测试通过
  - 单元测试覆盖率 ≥ 80%
  - 集成测试全部通过
  - 无测试失败或跳过

- [ ] T025 E2E 测试:运行 `pnpm --filter node-demo dev --example=daily-basic`,验证输出正确
  - **注意**: 需要配置 .env 文件中的 TUSHARE_TOKEN
  - **注意**: 需要 2000+ 积分

- [ ] T026 E2E 测试:运行 `pnpm --filter node-demo dev --example=all`,验证 daily-basic 包含在内
  - **注意**: 需要配置 .env 文件中的 TUSHARE_TOKEN

- [ ] T027 E2E 测试:运行 `pnpm --filter node-demo dev --example=daily-basic --format=json`,验证 JSON 输出
  - **注意**: 需要配置 .env 文件中的 TUSHARE_TOKEN

- [ ] T028 E2E 测试:运行 `pnpm --filter node-demo dev --example=daily-basic --verbose`,验证详细日志
  - **注意**: 需要配置 .env 文件中的 TUSHARE_TOKEN

- [ ] T029 验证 quickstart.md 中的所有命令和示例可以正常运行
  - **注意**: 需要配置 .env 文件中的 TUSHARE_TOKEN

**E2E 测试说明**: 
- 这些测试需要有效的 Tushare Token 和网络连接
- 请先配置 `apps/node-demo/.env` 文件(参考 .env.example)
- 详细步骤请参考 `IMPLEMENTATION_STATUS.md`

- [X] T030 最终代码审查,确保符合项目宪法的所有要求
  - ✅ Test-First Development
  - ✅ TypeScript 技术栈
  - ✅ 清晰的代码注释
  - ✅ 清晰的代码结构
  - ✅ 完整的测试覆盖

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 可立即开始
- **User Story 1 (Phase 2)**: 依赖 Setup 完成 - MVP 核心功能
- **User Story 2 (Phase 3)**: 依赖 User Story 1 完成 - 扩展查询方式
- **User Story 3 (Phase 4)**: 依赖 User Story 2 完成 - 完善错误处理
- **Polish (Phase 5)**: 依赖所有用户故事完成 - 最终打磨

### User Story Dependencies

- **User Story 1 (P1)**: 依赖 Setup - 无其他故事依赖 - 可独立测试
- **User Story 2 (P2)**: 依赖 User Story 1 - 在现有示例文件上扩展 - 可独立测试
- **User Story 3 (P3)**: 依赖 User Story 2 - 在现有示例文件上完善 - 可独立测试

### Within Each User Story

- 测试必须先编写并失败,然后再实现功能(TDD)
- 示例文件实现在类型定义和主入口更新之前
- 类型定义更新在主入口更新之前
- 实现完成后立即运行测试验证

### Parallel Opportunities

- **Phase 1**: T002 和 T003 可并行执行(不同验证任务)
- **Phase 2 Tests**: T004 和 T005 可并行执行(不同测试文件)
- **Phase 5**: T022 和 T023 可并行执行(文档更新和代码检查)

**注意**: 由于所有实现任务都在同一个示例文件 `daily-basic.ts` 中,User Story 2 和 3 必须顺序执行,不能并行。

---

## Parallel Example: Phase 2 Tests

```bash
# 同时创建两个测试文件:
Task: "创建单元测试文件 apps/node-demo/tests/unit/daily-basic.test.ts"
Task: "创建集成测试文件 apps/node-demo/tests/integration/daily-basic.integration.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. 完成 Phase 1: Setup (验证基础设施)
2. 完成 Phase 2: User Story 1 (核心功能)
3. **STOP and VALIDATE**: 独立测试 User Story 1
4. 如果满足需求,可以先部署 MVP

### Incremental Delivery

1. Setup → 基础验证完成
2. User Story 1 → 独立测试 → 可演示基本用法(MVP!)
3. User Story 2 → 独立测试 → 可演示多种查询方式
4. User Story 3 → 独立测试 → 可演示完整错误处理
5. Polish → 最终打磨 → 生产就绪

### Sequential Strategy (推荐)

由于所有实现都在同一个文件中,推荐顺序执行:

1. 完成 Setup
2. 完成 User Story 1 → 测试验证
3. 完成 User Story 2 → 测试验证
4. 完成 User Story 3 → 测试验证
5. 完成 Polish → 最终验证

---

## Summary

### Task Statistics

- **总任务数**: 30 个任务
- **Setup**: 3 个任务
- **User Story 1 (P1)**: 7 个任务(2 测试 + 5 实现)
- **User Story 2 (P2)**: 6 个任务(2 测试 + 4 实现)
- **User Story 3 (P3)**: 5 个任务(2 测试 + 3 实现)
- **Polish**: 9 个任务(文档 + 验证)

### Parallel Opportunities

- **Phase 1**: 2 个任务可并行
- **Phase 2**: 2 个任务可并行(测试文件创建)
- **Phase 5**: 2 个任务可并行(文档和代码检查)
- **总计**: 6 个并行机会

### Independent Test Criteria

- **User Story 1**: 运行 `--example=daily-basic`,成功展示场景 1
- **User Story 2**: 运行 `--example=daily-basic`,成功展示 3 个场景
- **User Story 3**: 查看代码和运行测试,验证错误处理完整

### MVP Scope

**推荐 MVP**: User Story 1 only
- 提供核心功能:按日期查询全市场数据
- 可以独立运行和演示
- 满足最基本的学习需求
- 后续可增量添加 User Story 2 和 3

---

## Notes

- [P] 标记 = 不同文件,无依赖,可并行
- [Story] 标记 = 任务归属,便于追踪
- 每个用户故事可独立完成和测试
- 遵循 TDD:测试先行,确保测试失败后再实现
- 每个任务或逻辑组完成后提交代码
- 在每个 Checkpoint 停下来独立验证故事
- 避免:模糊任务、同文件冲突、破坏独立性的跨故事依赖

**状态**: 任务列表生成完成,可以开始实施
