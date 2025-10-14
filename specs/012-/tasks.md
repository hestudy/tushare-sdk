---
description: "财务数据文档功能实现任务列表"
---

# Tasks: 财务数据文档

**Input**: Design documents from `/specs/012-/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Organization**: 任务按用户故事组织,确保每个故事可以独立实现和测试。

## Format: `[ID] [P?] [Story] Description`
- **[P]**: 可并行执行(不同文件,无依赖)
- **[Story]**: 任务所属用户故事(US1, US2, US3)
- 包含具体文件路径

## 技术栈
- **语言/版本**: TypeScript 5.3+ / Node.js 18+ LTS
- **主要依赖**: rspress (静态站点生成器), @playwright/test (E2E测试), vitest (单元测试)
- **存储**: 静态文件 (Markdown 文档源文件在 `apps/docs/docs/` 目录)
- **测试**: Playwright (E2E文档可用性测试) + vitest (文档内容验证测试)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 基础项目结构和测试框架准备

- [X] T001 [P] 验证文档站基础结构存在 (`apps/docs/` 目录结构)
- [X] T002 [P] 验证 rspress 配置文件存在 (`apps/docs/rspress.config.ts`)
- [X] T003 [P] 验证财务数据目录结构 (`apps/docs/docs/api/finance/`)
- [X] T004 [P] 创建 E2E 测试目录结构 (`apps/docs/e2e/` 如不存在)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 测试优先开发 - 先编写文档测试,再完善文档内容

**⚠️ CRITICAL**: 遵循宪法原则 I - 测试优先开发,所有文档测试必须在文档完善前编写完成

### 测试基础设施

- [X] T005 验证 Playwright 测试环境配置 (`apps/docs/playwright.config.ts`)
- [X] T006 验证 vitest 测试环境配置 (`apps/docs/vitest.config.ts` 或 `vitest.config.mts`)

### 文档可用性测试(E2E)

- [X] T007 [P] 创建财务数据导航 E2E 测试文件 (`apps/docs/tests/e2e/finance-navigation.spec.ts`)
- [X] T008 [P] 实现测试用例: 从文档首页导航到财务数据章节
- [X] T009 [P] 实现测试用例: 导航到利润表文档页面
- [X] T010 [P] 实现测试用例: 导航到资产负债表文档页面
- [X] T011 [P] 实现测试用例: 导航到现金流量表文档页面
- [X] T012 [P] 实现测试用例: 在三大报表文档间交叉导航
- [X] T013 [P] 实现测试用例: 验证相关 API 链接可用

### 文档内容验证测试(单元测试)

- [X] T014 [P] 创建文档内容验证测试目录 (`tests/unit/docs/` 如不存在)
- [X] T015 [P] 创建财务数据文档内容验证测试文件 (`tests/unit/docs/finance-content.test.ts`)
- [X] T016 [P] 实现现金流量表文档结构验证测试(验证必需章节存在)
- [X] T017 [P] 实现现金流量表参数表格验证测试(验证至少5个参数)
- [X] T018 [P] 实现现金流量表返回字段验证测试(验证至少50个字段,与SDK模型一致)
- [X] T019 [P] 实现现金流量表代码示例语法验证测试(TypeScript编译检查)
- [X] T020 [P] 实现链接有效性验证测试(验证内部链接指向存在的页面)

**Checkpoint**: 所有测试已编写完成,测试应该处于失败状态(因为文档尚未完善)。现在可以开始按用户故事实现文档内容。

---

## Phase 3: User Story 1 - 快速上手财务数据 API (Priority: P1) 🎯 MVP

**Goal**: SDK 使用者能够快速找到财务数据文档,理解基础使用方法,并成功执行第一次 API 调用

**Independent Test**: 用户能在文档站找到财务数据章节,复制现金流量表查询示例到本地,配置token后成功执行并获取数据

### 实现现金流量表基础文档

- [X] T021 [US1] 创建现金流量表文档文件 (`apps/docs/docs/api/finance/cashflow.md`)
- [X] T022 [US1] 编写文档 frontmatter (title, description, keywords, type, order)
- [X] T023 [US1] 编写标题和简介章节(说明现金流量表API用途)
- [X] T024 [US1] 编写函数签名章节(TypeScript签名: `async function getCashFlow(params: FinancialQueryParams): Promise<CashFlowItem[]>`)
- [X] T025 [US1] 编写基础调用示例(场景1: 获取指定公司最新现金流量表)
- [X] T026 [US1] 验证示例代码语法正确且可执行(使用真实股票代码如 000001.SZ)

### 启用财务数据导航

- [X] T027 [US1] 更新 `_meta.json` 添加现金流量表配置 (`apps/docs/docs/api/finance/_meta.json`)
- [X] T028 [US1] 取消 `rspress.config.ts` 中财务数据导航的注释 (`apps/docs/rspress.config.ts`)
- [X] T029 [US1] 验证导航配置包含三个子项(利润表、资产负债表、现金流量表)

### 验证 User Story 1

- [X] T030 [US1] 运行 E2E 导航测试,验证能从首页导航到现金流量表文档
- [X] T031 [US1] 运行文档结构验证测试,验证基础章节存在
- [X] T032 [US1] 本地启动文档站验证用户体验 (`npm run docs:dev`)

**Checkpoint**: User Story 1 完成 - 用户可以找到财务数据文档并看到基础示例

---

## Phase 4: User Story 2 - 理解 API 参数与返回结构 (Priority: P2)

**Goal**: SDK 使用者能够深入了解现金流量表 API 的详细参数和返回字段,正确使用参数满足业务需求

**Independent Test**: 用户能在文档中找到完整的参数表格和字段说明,根据业务需求调整查询参数(如修改报告期),并理解返回数据中每个字段的含义

### 完善参数说明

- [X] T033 [P] [US2] 编写参数说明章节 - 创建参数表格结构
- [X] T034 [P] [US2] 添加 `ts_code` 参数说明(股票代码,格式要求,示例)
- [X] T035 [P] [US2] 添加 `period` 参数说明(报告期,YYYYMMDD格式,优先级最高)
- [X] T036 [P] [US2] 添加 `start_date` / `end_date` 参数说明(报告期区间查询)
- [X] T037 [P] [US2] 添加 `ann_date` 参数说明(公告日期)
- [X] T038 [P] [US2] 添加 `report_type` 参数说明(报表类型: 1-合并报表, 2-单季合并等)
- [X] T039 [P] [US2] 添加 `comp_type` 参数说明(公司类型)

### 完善返回字段说明

- [X] T040 [US2] 编写返回值说明章节 - 说明返回类型 `Promise<CashFlowItem[]>`
- [X] T041 [US2] 创建返回字段列表结构(按三大活动分类)
- [X] T042 [P] [US2] 添加基本标识字段说明(ts_code, ann_date, end_date, report_type, comp_type等8个字段)
- [X] T043 [P] [US2] 添加经营活动现金流字段说明(n_cashflow_act等16个核心字段,标注核心)
- [X] T044 [P] [US2] 添加投资活动现金流字段说明(n_cashflow_inv_act等9个核心字段)
- [X] T045 [P] [US2] 添加筹资活动现金流字段说明(n_cash_flows_fnc_act等8个核心字段)
- [X] T046 [P] [US2] 添加现金汇总指标字段说明(n_incr_cash_cash_equ等7个核心字段)
- [X] T047 [P] [US2] 添加补充项目字段说明(39个补充字段,可分批添加)

### 验证 User Story 2

- [X] T048 [US2] 运行参数完整性验证测试(验证至少5个参数)
- [X] T049 [US2] 运行字段完整性验证测试(验证至少50个核心字段与SDK模型一致)
- [X] T050 [US2] 验证参数表格和字段表格格式正确

**Checkpoint**: User Story 2 完成 - 用户能理解所有参数和返回字段的含义

---

## Phase 5: User Story 3 - 学习财务分析场景示例 (Priority: P3)

**Goal**: SDK 使用者能够学习现金流量表的典型应用场景,理解最佳实践,快速应用到自己的业务中

**Independent Test**: 用户能在文档中找到至少2个业务场景示例(如现金流健康度分析、自由现金流计算),理解示例逻辑并能改造应用

### 添加业务场景示例

- [X] T051 [P] [US3] 编写场景示例2: 现金流健康度分析(分析经营、投资、筹资三大活动的健康度)
- [X] T052 [P] [US3] 编写场景示例3: 自由现金流计算(FCF = 经营现金流 - 资本支出)
- [X] T053 [P] [US3] 编写场景示例4(可选): 多期现金流趋势分析(查询多个报告期并计算变化趋势)
- [X] T054 [US3] 为每个场景示例添加清晰的注释和业务说明
- [X] T055 [US3] 验证所有场景示例代码语法正确且可执行

### 验证 User Story 3

- [X] T056 [US3] 运行代码示例验证测试(验证至少2个示例,语法正确)
- [X] T057 [US3] 验证示例使用真实股票代码和合理时间参数
- [X] T058 [US3] 手动验证示例代码的业务逻辑正确性

**Checkpoint**: User Story 3 完成 - 用户能学习实际业务场景应用

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 完善文档质量,添加异常说明、注意事项和相关链接

### 添加异常说明和注意事项

- [X] T059 [P] 编写异常说明章节 - 创建异常表格(ApiError, ValidationError, NotFoundError等)
- [X] T060 [P] 编写注意事项章节 - 至少5条重要提示
- [X] T061 [P] 添加金额单位说明(元)
- [X] T062 [P] 添加日期格式说明(YYYYMMDD)
- [X] T063 [P] 添加报告期格式说明(季度末日期: 0331, 0630, 0930, 1231)
- [X] T064 [P] 添加权限要求说明(财务数据需要至少2000积分)
- [X] T065 [P] 添加数据时效性说明(公告后T+1日更新)

### 添加相关 API 链接

- [X] T066 [P] 添加相关 API 章节(可选)
- [X] T067 [P] 添加指向利润表文档的链接 (`/api/finance/income`)
- [X] T068 [P] 添加指向资产负债表文档的链接 (`/api/finance/balance`)

### 最终验证

- [X] T069 运行所有 E2E 导航测试,确保全部通过
- [X] T070 运行所有文档内容验证测试,确保全部通过
- [X] T071 验证文档与 SDK 实际实现一致性(函数签名、参数类型、返回字段)
- [X] T072 本地构建文档站验证构建成功 (`npm run docs:build`)
- [X] T073 本地预览验证用户体验 (`npm run docs:dev` 手动检查)
- [X] T074 代码审查和格式化检查

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 可立即开始
- **Foundational (Phase 2)**: 依赖 Setup 完成 - **阻塞所有用户故事**
- **User Stories (Phase 3-5)**: 所有依赖 Foundational 完成
  - User Story 1 → User Story 2 → User Story 3 (顺序执行,因为都修改同一个文档文件)
- **Polish (Phase 6)**: 依赖所有用户故事完成

### User Story Dependencies

- **User Story 1 (P1)**: 依赖 Foundational - 创建基础文档和启用导航
- **User Story 2 (P2)**: 依赖 US1 - 在同一文档中添加参数和字段说明
- **User Story 3 (P3)**: 依赖 US1 - 在同一文档中添加更多业务场景示例
- **注意**: 由于所有用户故事都修改同一个文档文件 (`cashflow.md`),必须顺序执行

### Within Each User Story

- **User Story 1**: T021-T026 顺序执行(文档编写) → T027-T029 顺序执行(导航配置) → T030-T032 并行执行(验证)
- **User Story 2**: T033-T039 可并行(参数说明) → T040-T047 有依赖(先创建结构T040-T041,再并行添加字段T042-T047) → T048-T050 并行(验证)
- **User Story 3**: T051-T053 可并行(不同示例) → T054-T055 顺序(统一处理) → T056-T058 并行(验证)

### Parallel Opportunities

- **Phase 1**: T001-T004 可并行(验证不同目录)
- **Phase 2 - 测试基础设施**: T005-T006 可并行(不同配置文件)
- **Phase 2 - E2E 测试**: T008-T013 可并行(不同测试用例,不同文件可能)
- **Phase 2 - 单元测试**: T016-T020 可并行(不同测试用例)
- **Phase 3 - US1 验证**: T030-T032 可并行(不同类型的验证)
- **Phase 4 - US2 参数**: T034-T039 可并行(不同参数行)
- **Phase 4 - US2 字段**: T042-T047 可并行(不同字段分类)
- **Phase 4 - US2 验证**: T048-T050 可并行(不同类型验证)
- **Phase 5 - US3 示例**: T051-T053 可并行(不同场景示例)
- **Phase 5 - US3 验证**: T056-T058 可并行(不同类型验证)
- **Phase 6 - 注意事项**: T061-T065 可并行(不同注意事项)
- **Phase 6 - 相关链接**: T067-T068 可并行(不同链接)

---

## Parallel Example: Phase 2 Foundational Tests

**重要**: 测试优先开发的关键阶段,所有测试必须先编写完成

```bash
# 并行编写所有 E2E 测试用例:
Task: "实现测试用例: 从文档首页导航到财务数据章节 (T008)"
Task: "实现测试用例: 导航到利润表文档页面 (T009)"
Task: "实现测试用例: 导航到资产负债表文档页面 (T010)"
Task: "实现测试用例: 导航到现金流量表文档页面 (T011)"
Task: "实现测试用例: 在三大报表文档间交叉导航 (T012)"

# 并行编写所有单元测试:
Task: "实现现金流量表文档结构验证测试 (T016)"
Task: "实现现金流量表参数表格验证测试 (T017)"
Task: "实现现金流量表返回字段验证测试 (T018)"
Task: "实现现金流量表代码示例语法验证测试 (T019)"
Task: "实现链接有效性验证测试 (T020)"
```

---

## Parallel Example: User Story 2 - 参数和字段说明

```bash
# 并行添加所有参数说明:
Task: "添加 ts_code 参数说明 (T034)"
Task: "添加 period 参数说明 (T035)"
Task: "添加 start_date / end_date 参数说明 (T036)"
Task: "添加 ann_date 参数说明 (T037)"
Task: "添加 report_type 参数说明 (T038)"
Task: "添加 comp_type 参数说明 (T039)"

# 并行添加不同分类的字段说明:
Task: "添加基本标识字段说明 (T042)"
Task: "添加经营活动现金流字段说明 (T043)"
Task: "添加投资活动现金流字段说明 (T044)"
Task: "添加筹资活动现金流字段说明 (T045)"
Task: "添加现金汇总指标字段说明 (T046)"
Task: "添加补充项目字段说明 (T047)"
```

---

## Implementation Strategy

### 测试优先开发流程(遵循宪法原则 I)

1. **Phase 1: Setup** - 验证基础结构
2. **Phase 2: Foundational** - **先编写所有测试**
   - 编写 E2E 导航测试(T007-T013)
   - 编写文档内容验证测试(T014-T020)
   - **验证所有测试失败**(因为文档尚未创建)
3. **Phase 3-5: User Stories** - 基于测试要求实现文档
   - 每完成一个用户故事,运行相关测试验证
   - 测试从失败变为通过
4. **Phase 6: Polish** - 完善文档质量
5. **最终验证**: 确保所有测试通过

### MVP First (User Story 1 Only)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational(**关键**: 先写测试)
3. 完成 Phase 3: User Story 1(基础文档和导航)
4. **STOP and VALIDATE**: 运行 E2E 测试,验证用户能找到并访问文档
5. 如果验证通过,可以先部署/演示 MVP

### Incremental Delivery

1. Setup + Foundational → **测试已准备好**(测试应该失败)
2. Add User Story 1 → 测试变为通过 → 部署/演示(MVP!)
3. Add User Story 2 → 参数和字段文档完整 → 部署/演示
4. Add User Story 3 → 业务场景示例丰富 → 部署/演示
5. 每个故事增加价值,逐步完善文档

### Sequential Strategy (Recommended for This Feature)

由于所有用户故事都修改同一个文档文件,**推荐顺序执行**:

1. 团队一起完成 Setup + Foundational(特别是测试编写)
2. 按优先级顺序完成用户故事:
   - 开发者 A: User Story 1(基础文档)
   - 完成后,开发者 A: User Story 2(参数和字段)
   - 完成后,开发者 A: User Story 3(业务场景)
3. 最后一起完成 Polish 阶段

### 关键里程碑

- **里程碑 1**: 所有测试编写完成(Phase 2)
- **里程碑 2**: 现金流量表文档可访问(Phase 3)
- **里程碑 3**: 参数和字段说明完整(Phase 4)
- **里程碑 4**: 业务场景示例丰富(Phase 5)
- **里程碑 5**: 所有测试通过,文档发布(Phase 6)

---

## Notes

- **[P]** 任务 = 不同文件或无依赖,可并行执行
- **[Story]** 标签将任务映射到特定用户故事,便于追踪
- **测试优先**: 严格遵循宪法原则 I,先写测试再实现
- **同一文档**: 所有用户故事都修改 `cashflow.md`,建议顺序执行
- 每完成一个用户故事验证其测试通过
- 在每个 checkpoint 停下来验证用户故事独立可用
- 提交频率: 每完成一个任务或一组逻辑相关任务后提交
- 避免: 模糊任务描述、同文件冲突、跨故事依赖破坏独立性

---

## 文档参考

### 设计文档
- 功能规范: `/specs/012-/spec.md`
- 实现计划: `/specs/012-/plan.md`
- 研究报告: `/specs/012-/research.md`
- 数据模型: `/specs/012-/data-model.md`
- 文档结构契约: `/specs/012-/contracts/cashflow-doc-structure.yaml`
- 导航配置契约: `/specs/012-/contracts/navigation-config.yaml`

### SDK 参考
- 财务数据模型: `packages/tushare-sdk/src/models/financial.ts` (CashFlowItem 接口)
- 财务数据 API: `packages/tushare-sdk/src/api/financial.ts` (getCashFlow 函数)
- 演示应用示例: `apps/node-demo/src/examples/financial-data.ts`

### 现有文档参考
- 利润表文档: `apps/docs/docs/api/finance/income.md`
- 资产负债表文档: `apps/docs/docs/api/finance/balance.md`

---

**Tasks 生成日期**: 2025-10-13
**下一步**: 开始执行 Phase 1 Setup 任务
