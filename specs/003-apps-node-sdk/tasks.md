---
description: "Node 应用演示示例任务列表"
---

# Tasks: Node 应用演示示例

**Feature**: 003-apps-node-sdk  
**Input**: Design documents from `/specs/003-apps-node-sdk/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/app-interface.md

**Tests**: 本项目包含测试任务,符合项目宪法的 Test-First Development 原则

**Organization**: 任务按用户故事分组,每个故事可独立实现和测试

## Format: `[ID] [P?] [Story] Description`
- **[P]**: 可并行运行(不同文件,无依赖)
- **[Story]**: 任务所属用户故事(US1, US2, US3)
- 包含精确的文件路径

## Path Conventions
- 演示应用位于: `apps/node-demo/`
- 源代码: `apps/node-demo/src/`
- 测试: `apps/node-demo/tests/`

---

## Phase 1: Setup (共享基础设施)

**目的**: 项目初始化和基本结构搭建

- [X] T001 创建演示应用目录结构 `apps/node-demo/` 及子目录 `src/`, `tests/unit/`, `tests/integration/`
- [X] T002 创建 `apps/node-demo/package.json`,配置依赖(workspace:* 引用本地 SDK, dotenv, tsx)
- [X] T003 [P] 创建 `apps/node-demo/tsconfig.json`,继承根配置,启用严格模式
- [X] T004 [P] 创建 `apps/node-demo/.env.example`,定义环境变量模板
- [X] T005 [P] 创建 `apps/node-demo/.gitignore`,排除 .env, node_modules, dist
- [X] T006 [P] 创建 `apps/node-demo/README.md`,提供运行说明和使用示例
- [X] T007 更新根目录 `pnpm-workspace.yaml`,添加 `'apps/*'` 到 packages 列表
- [X] T008 在根目录运行 `pnpm install`,安装所有依赖

---

## Phase 2: Foundational (阻塞性前置条件)

**目的**: 所有用户故事依赖的核心基础设施

**⚠️ 关键**: 此阶段完成前,任何用户故事都无法开始

- [X] T009 实现配置管理 `apps/node-demo/src/config.ts`,加载环境变量,定义 AppConfig 类型
- [X] T010 [P] 实现配置验证函数 `validateConfig()` 在 `src/config.ts`,验证 TUSHARE_TOKEN 非空
- [X] T011 [P] 实现数据模型类型定义 `apps/node-demo/src/types.ts`,定义 ExampleResult, DemoOutput 接口
- [X] T012 实现错误处理工具 `apps/node-demo/src/utils/error-handler.ts`,提供统一错误格式化函数
- [X] T013 [P] 实现输出格式化工具 `apps/node-demo/src/utils/formatter.ts`,支持 console 和 json 两种格式
- [X] T014 [P] 实现示例执行器基类 `apps/node-demo/src/utils/example-runner.ts`,提供计时和结果收集功能

**Checkpoint**: 基础设施就绪 - 用户故事实现现在可以并行开始

---

## Phase 3: User Story 1 - 基础 SDK 功能验证 (Priority: P1) 🎯 MVP

**目标**: 验证 Tushare SDK 核心功能(初始化客户端、调用 API、处理返回数据)

**独立测试**: 运行应用并观察是否成功获取 Tushare API 数据

### Tests for User Story 1 (TDD)

**注意: 先编写这些测试,确保它们失败后再实现功能**

- [X] T015 [P] [US1] 单元测试: 配置加载 `apps/node-demo/tests/unit/config.test.ts`,测试环境变量读取和验证
- [X] T016 [P] [US1] 单元测试: 示例执行器 `apps/node-demo/tests/unit/example-runner.test.ts`,测试计时和结果收集
- [X] T017 [P] [US1] 集成测试: SDK 初始化 `apps/node-demo/tests/integration/sdk-init.test.ts`,测试客户端创建(使用 mock)
- [X] T018 [P] [US1] 集成测试: 股票列表 API `apps/node-demo/tests/integration/stock-list.test.ts`,测试 API 调用(使用 mock)

### Implementation for User Story 1

- [X] T019 [P] [US1] 实现股票列表示例 `apps/node-demo/src/examples/stock-list.ts`,调用 SDK getStockBasic() 方法
- [X] T020 [US1] 实现主入口 `apps/node-demo/src/index.ts`,初始化配置,创建 SDK 客户端,执行示例
- [X] T021 [US1] 在 `src/index.ts` 中添加基本输出逻辑,展示示例执行结果和摘要
- [X] T022 [US1] 在 `package.json` 中添加脚本: `dev`, `build`, `start`
- [ ] T023 [US1] 手动测试: 使用真实 Token 运行 `pnpm dev`,验证股票列表查询成功

**Checkpoint**: 此时 User Story 1 应完全功能正常且可独立测试

---

## Phase 4: User Story 2 - 错误处理演示 (Priority: P2)

**目标**: 演示 SDK 在各种错误场景下的行为(无效 token、网络错误、参数错误)

**独立测试**: 故意触发各种错误场景并观察错误信息

### Tests for User Story 2 (TDD)

- [X] T024 [P] [US2] 单元测试: 错误处理 `apps/node-demo/tests/unit/error-handling.test.ts`,测试各种错误类型的格式化
- [X] T025 [P] [US2] 集成测试: 认证错误 `apps/node-demo/tests/integration/auth-error.test.ts`,测试无效 Token 场景
- [X] T026 [P] [US2] 集成测试: 参数错误 `apps/node-demo/tests/integration/param-error.test.ts`,测试无效参数场景

### Implementation for User Story 2

- [X] T027 [US2] 实现错误处理演示 `apps/node-demo/src/error-handling.ts`,演示 3 种错误场景(认证、参数、网络)
- [X] T028 [US2] 在 `src/index.ts` 中集成错误处理,使用 try-catch 捕获并格式化错误
- [X] T029 [US2] 在 `src/utils/error-handler.ts` 中添加错误建议生成函数,为每种错误提供解决建议
- [X] T030 [US2] 实现退出码逻辑,根据错误类型返回正确的退出码(0, 1, 2, 3)
- [ ] T031 [US2] 手动测试: 使用无效 Token 运行应用,验证错误消息清晰且有帮助

**Checkpoint**: 此时 User Stories 1 和 2 都应独立工作

---

## Phase 5: User Story 3 - 多种 API 调用示例 (Priority: P3)

**目标**: 展示多种不同类型的 API 调用示例(不同接口、不同参数)

**独立测试**: 运行应用并查看不同 API 调用的输出结果

### Tests for User Story 3 (TDD)

- [X] T032 [P] [US3] 集成测试: 日线数据 API `apps/node-demo/tests/integration/daily-data.test.ts`,测试 getDailyQuote() 调用
- [X] T033 [P] [US3] 集成测试: 交易日历 API `apps/node-demo/tests/integration/trade-calendar.test.ts`,测试 getTradeCalendar() 调用
- [X] T034 [P] [US3] E2E 测试: 完整演示流程 `apps/node-demo/tests/integration/full-demo.test.ts`,测试所有示例顺序执行

### Implementation for User Story 3

- [X] T035 [P] [US3] 实现日线数据示例 `apps/node-demo/src/examples/daily-data.ts`,查询指定股票的日线数据
- [X] T036 [P] [US3] 实现交易日历示例 `apps/node-demo/src/examples/trade-calendar.ts`,查询交易日历信息
- [X] T037 [US3] 在 `src/index.ts` 中集成所有示例,按顺序执行 3 个 API 调用
- [X] T038 [US3] 实现命令行参数解析,支持 `--example`, `--verbose`, `--format` 参数
- [X] T039 [US3] 在 `src/utils/formatter.ts` 中实现表格输出,美化数据展示
- [ ] T040 [US3] 手动测试: 运行所有示例,验证输出格式正确且数据完整

**Checkpoint**: 所有用户故事现在都应独立功能正常

---

## Phase 6: Polish & Cross-Cutting Concerns

**目的**: 影响多个用户故事的改进和完善

- [X] T041 [P] 添加 JSDoc 注释到所有公共函数和接口,使用中文
- [X] T042 [P] 实现详细日志输出(--verbose 模式),展示 API 请求和响应详情
- [X] T043 [P] 优化错误消息,确保所有错误都有清晰的建议
- [X] T044 代码审查和重构,确保符合 TypeScript 严格模式和项目规范
- [X] T045 [P] 更新 README.md,添加完整的使用示例和故障排除指南
- [X] T046 运行测试覆盖率检查,确保 ≥80% 单元测试覆盖率
- [X] T047 [P] 性能测试: 验证启动时间 < 2s, API 调用 < 5s
- [X] T048 按照 `quickstart.md` 验证完整的快速开始流程
- [X] T049 在 CI 环境中运行演示应用,验证自动化测试场景

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 可立即开始
- **Foundational (Phase 2)**: 依赖 Setup 完成 - 阻塞所有用户故事
- **User Stories (Phase 3-5)**: 都依赖 Foundational 完成
  - 用户故事可并行进行(如有多人)
  - 或按优先级顺序执行(P1 → P2 → P3)
- **Polish (Phase 6)**: 依赖所有期望的用户故事完成

### User Story Dependencies

- **User Story 1 (P1)**: Foundational 完成后可开始 - 无其他故事依赖
- **User Story 2 (P2)**: Foundational 完成后可开始 - 与 US1 集成但可独立测试
- **User Story 3 (P3)**: Foundational 完成后可开始 - 扩展 US1 但可独立测试

### Within Each User Story

- 测试必须先编写并失败,然后再实现
- 示例实现在主入口集成之前
- 核心实现在集成之前
- 故事完成后再进入下一优先级

### Parallel Opportunities

- Setup 阶段所有标记 [P] 的任务可并行
- Foundational 阶段所有标记 [P] 的任务可并行
- Foundational 完成后,所有用户故事可并行开始(如团队容量允许)
- 每个用户故事内标记 [P] 的测试可并行
- 每个用户故事内标记 [P] 的示例实现可并行
- 不同用户故事可由不同团队成员并行工作

---

## Parallel Example: User Story 1

```bash
# 同时启动 User Story 1 的所有测试:
Task: "单元测试: 配置加载 apps/node-demo/tests/unit/config.test.ts"
Task: "单元测试: 示例执行器 apps/node-demo/tests/unit/example-runner.test.ts"
Task: "集成测试: SDK 初始化 apps/node-demo/tests/integration/sdk-init.test.ts"
Task: "集成测试: 股票列表 API apps/node-demo/tests/integration/stock-list.test.ts"

# 测试失败后,并行实现:
Task: "实现股票列表示例 apps/node-demo/src/examples/stock-list.ts"
```

---

## Implementation Strategy

### MVP First (仅 User Story 1)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational (关键 - 阻塞所有故事)
3. 完成 Phase 3: User Story 1
4. **停止并验证**: 独立测试 User Story 1
5. 如果就绪可部署/演示

### Incremental Delivery

1. 完成 Setup + Foundational → 基础就绪
2. 添加 User Story 1 → 独立测试 → 部署/演示 (MVP!)
3. 添加 User Story 2 → 独立测试 → 部署/演示
4. 添加 User Story 3 → 独立测试 → 部署/演示
5. 每个故事都增加价值而不破坏之前的故事

### Parallel Team Strategy

多开发者协作:

1. 团队一起完成 Setup + Foundational
2. Foundational 完成后:
   - 开发者 A: User Story 1
   - 开发者 B: User Story 2
   - 开发者 C: User Story 3
3. 故事独立完成和集成

---

## Task Summary

### 总任务数: 49 个任务

### 按阶段分布:
- **Phase 1 (Setup)**: 8 个任务
- **Phase 2 (Foundational)**: 6 个任务
- **Phase 3 (User Story 1)**: 9 个任务
- **Phase 4 (User Story 2)**: 8 个任务
- **Phase 5 (User Story 3)**: 9 个任务
- **Phase 6 (Polish)**: 9 个任务

### 按用户故事分布:
- **User Story 1 (基础 SDK 功能验证)**: 9 个任务 (4 测试 + 5 实现)
- **User Story 2 (错误处理演示)**: 8 个任务 (3 测试 + 5 实现)
- **User Story 3 (多种 API 调用示例)**: 9 个任务 (3 测试 + 6 实现)

### 并行机会:
- Setup 阶段: 5 个任务可并行
- Foundational 阶段: 4 个任务可并行
- User Story 1: 4 个测试可并行, 1 个实现可并行
- User Story 2: 3 个测试可并行
- User Story 3: 3 个测试可并行, 2 个实现可并行
- Polish 阶段: 6 个任务可并行

### 独立测试标准:
- **User Story 1**: 运行 `pnpm dev`,成功获取股票列表数据
- **User Story 2**: 使用无效 Token,观察清晰的错误消息
- **User Story 3**: 运行所有示例,查看 3 种不同 API 的输出

### 建议的 MVP 范围:
仅实现 **User Story 1** (基础 SDK 功能验证),包含:
- 配置管理和环境变量加载
- SDK 客户端初始化
- 单个 API 调用示例(股票列表)
- 基本输出展示
- 完整测试覆盖

---

## Notes

- [P] 任务 = 不同文件,无依赖
- [Story] 标签将任务映射到特定用户故事,便于追溯
- 每个用户故事应可独立完成和测试
- 实现前验证测试失败
- 每个任务或逻辑组后提交
- 在任何检查点停止以独立验证故事
- 避免: 模糊任务、同文件冲突、破坏独立性的跨故事依赖
