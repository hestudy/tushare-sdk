# Tasks: 基于SDK源代码完善文档站内容

**Input**: Design documents from `/specs/007-sdk/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: 本功能为纯文档更新任务,不涉及测试代码编写。文档正确性通过 rspress 构建验证和手动审阅确认。

**Organization**: 任务按用户故事组织,确保每个用户故事的文档内容可以独立更新和验证。

## Format: `[ID] [P?] [Story] Description`
- **[P]**: 可以并行执行(不同文件,无依赖关系)
- **[Story]**: 任务所属的用户故事(US1, US2, US3, US4)
- 包含精确的文件路径

## Path Conventions
- 文档目录: `apps/docs/docs/`
- SDK 源代码: `packages/tushare-sdk/src/`

---

## Phase 1: Setup (项目初始化)

**Purpose**: 准备文档更新所需的基础环境

- [X] T001 验证 rspress 文档站可以正常构建 (运行 `pnpm docs:build`)
- [X] T002 验证 SDK 源代码类型检查通过 (运行 `pnpm --filter @hestudy/tushare-sdk type-check`)
- [X] T003 [P] 备份现有文档文件 (apps/docs/docs/guide/ 和 apps/docs/docs/api/)

---

## Phase 2: Foundational (基础准备 - 所有用户故事的前置任务)

**Purpose**: 检查和纠正基础配置错误,为所有用户故事的文档更新做准备

**⚠️ CRITICAL**: 必须完成本阶段,才能开始任何用户故事的文档更新

- [X] T004 检查 rspress.config.ts 中的导航配置,移除或标注指向未实现 API 的链接 (如 fund/basic, finance/income)
- [X] T005 [P] 更新 apps/docs/docs/guide/installation.md - 纠正包名为 `@hestudy/tushare-sdk`
- [X] T006 [P] 检查现有文档中所有 import 语句,批量替换错误的包名引用

**Checkpoint**: ✅ 基础配置纠正完成 - 可以开始各用户故事的文档更新

---

## Phase 3: User Story 1 - 从SDK源代码提取API文档 (Priority: P1) 🎯 MVP

**Goal**: 为所有 SDK 核心 API 方法生成完整、准确的文档页面,确保类型定义与源代码100%一致

**Independent Test**: 访问文档站任意 API 页面(如 /api/stock/basic),验证页面显示完整的类型定义和参数说明,并与 SDK 源代码进行对比确认一致性

### API 文档更新任务 - 股票基础信息

- [X] T007 [US1] 更新 apps/docs/docs/api/stock/basic.md - 股票基础信息 API
  - 从 packages/tushare-sdk/src/client/TushareClient.ts 提取 getStockBasic 方法签名和 JSDoc
  - 从 packages/tushare-sdk/src/models/stock.ts 提取 StockBasicParams 和 StockBasicItem 类型定义
  - 使用 contracts/api-page-structure.md 模板更新文档
  - 包含至少3个不同场景的示例代码

### API 文档更新任务 - 日线行情

- [X] T008 [US1] 更新 apps/docs/docs/api/stock/daily.md - 日线行情 API
  - 纠正方法名为 getDailyQuote (而不是 getStockDaily)
  - 从 packages/tushare-sdk/src/client/TushareClient.ts 提取 getDailyQuote 方法
  - 从 packages/tushare-sdk/src/models/quote.ts 提取 DailyQuoteParams 和 DailyQuoteItem 类型定义
  - 使用 contracts/api-page-structure.md 模板更新文档

### API 文档创建任务 - 交易日历

- [X] T009 [US1] 创建 apps/docs/docs/api/calendar.md - 交易日历 API (新文档)
  - 从 packages/tushare-sdk/src/client/TushareClient.ts 提取 getTradeCalendar 方法
  - 从 packages/tushare-sdk/src/models/calendar.ts 提取 TradeCalParams 和 TradeCalItem 类型定义
  - 使用 contracts/api-page-structure.md 模板创建文档
  - 更新 rspress.config.ts 添加导航链接

### API 文档创建任务 - 每日指标

- [X] T010 [US1] 创建 apps/docs/docs/api/daily-basic.md - 每日指标 API (新文档)
  - 标注权限要求: 至少 2000 积分
  - 从 packages/tushare-sdk/src/client/TushareClient.ts 提取 getDailyBasic 方法
  - 从 packages/tushare-sdk/src/models/daily-basic.ts 提取 DailyBasicParams 和 DailyBasicItem 类型定义
  - 特别注意: 必须包含所有15个字段的完整说明,包括计算公式 (如市盈率、市净率、换手率等)
  - 使用 contracts/api-page-structure.md 模板创建文档
  - 更新 rspress.config.ts 添加导航链接

### 验证和构建

- [X] T011 [US1] 运行 pnpm docs:build 验证所有 API 文档页面构建成功
- [X] T012 [US1] 使用 contracts/api-page-structure.md 中的 Validation Checklist 检查每个 API 文档

**Checkpoint**: User Story 1 完成 - 所有核心 API 方法都有完整的文档页面,类型定义与源代码一致

---

## Phase 4: User Story 2 - 了解SDK的高级特性和配置选项 (Priority: P2)

**Goal**: 完善配置指南文档,详细说明 SDK 的重试机制、缓存策略、并发控制等高级特性

**Independent Test**: 访问 /guide/configuration 页面,验证是否详细说明了所有配置接口(TushareConfig, RetryConfig, CacheConfig, ConcurrencyConfig)的配置项和应用场景

### 配置指南更新任务

- [X] T013 [US2] 更新 apps/docs/docs/guide/configuration.md - 配置指南
  - 从 packages/tushare-sdk/src/types/config.ts 提取所有配置接口定义
  - 包含 TushareConfig 主配置(7个属性)
  - 包含 RetryConfig 重试配置(4个属性) + 延迟计算公式说明
  - 包含 CacheConfig 缓存配置(3个属性) + 自定义 Redis 缓存提供者示例
  - 包含 ConcurrencyConfig 并发配置(2个属性) + 积分等级推荐配置表
  - 包含 Logger 接口说明和自定义日志记录器示例
  - 使用 contracts/guide-page-structure.md 的 Type 3 模板

### 快速开始指南更新任务

- [X] T014 [US2] 更新 apps/docs/docs/guide/quick-start.md - 快速开始指南
  - 纠正所有方法名 (确保使用 getStockBasic, getDailyQuote 等实际存在的方法)
  - 纠正所有包名引用为 `@hestudy/tushare-sdk`
  - 更新完整示例代码,确保可直接运行
  - 添加常见问题部分(Token 错误、限流错误)
  - 使用 contracts/guide-page-structure.md 的 Type 2 模板

### 验证

- [X] T015 [US2] 运行 pnpm docs:build 验证配置指南和快速开始页面构建成功
- [X] T016 [US2] 使用 contracts/guide-page-structure.md 中的 Validation Checklist 检查指南文档

**Checkpoint**: User Story 2 完成 - 用户可以查看完整的配置选项说明和高级特性应用指南

---

## Phase 5: User Story 3 - 查看完整的类型系统和错误处理指南 (Priority: P2)

**Goal**: 创建错误处理指南,说明所有错误类型和处理机制

**Independent Test**: 访问错误处理页面,验证是否列出所有 7 个 ApiErrorType 枚举值和错误处理方式

### 错误处理指南创建任务

- [X] T017 [US3] 创建 apps/docs/docs/guide/error-handling.md - 错误处理指南 (新文档)
  - 从 packages/tushare-sdk/src/types/error.ts 提取 ApiErrorType 枚举(7个值)
  - 从 packages/tushare-sdk/src/types/error.ts 提取 ApiError 类属性
  - 包含错误类型表格(错误类型、说明、可重试性)
  - 包含捕获错误示例(使用 try-catch 和 instanceof ApiError)
  - 包含处理特定错误示例(AUTH_ERROR, RATE_LIMIT)
  - 包含自动重试机制说明
  - 使用 contracts/guide-page-structure.md 的 Type 4 模板
  - 更新 rspress.config.ts 添加导航链接

### API 文档相关链接更新

- [ ] T018 [P] [US3] 更新所有 API 文档的"相关 API"部分,确保链接指向实际存在的页面
  - 检查 apps/docs/docs/api/stock/basic.md
  - 检查 apps/docs/docs/api/stock/daily.md
  - 检查 apps/docs/docs/api/calendar.md
  - 检查 apps/docs/docs/api/daily-basic.md

### 验证

- [X] T019 [US3] 运行 pnpm docs:build 验证错误处理指南构建成功
- [X] T020 [US3] 使用 contracts/guide-page-structure.md 中的 Validation Checklist 检查错误处理指南

**Checkpoint**: User Story 3 完成 - 用户可以查看完整的错误处理机制和类型系统说明

---

## Phase 6: User Story 4 - 通过实际示例学习SDK用法 (Priority: P3)

**Goal**: 为所有 API 文档和指南页面补充丰富的代码示例,涵盖基本用法、高级场景、错误处理等

**Independent Test**: 访问任意 API 文档页面,验证每个 API 至少提供 3 个不同场景的可运行示例

### 示例代码补充任务

- [ ] T021 [P] [US4] 为 apps/docs/docs/api/stock/basic.md 补充高级示例
  - 批量查询多个股票
  - 使用缓存优化性能
  - 错误处理示例

- [ ] T022 [P] [US4] 为 apps/docs/docs/api/stock/daily.md 补充高级示例
  - 查询时间范围内的日线数据
  - 并发请求多个股票的行情
  - 使用日期过滤优化查询

- [ ] T023 [P] [US4] 为 apps/docs/docs/api/calendar.md 补充高级示例
  - 查询特定交易所的交易日
  - 判断某日是否为交易日
  - 获取下一个交易日

- [ ] T024 [P] [US4] 为 apps/docs/docs/api/daily-basic.md 补充高级示例
  - 查询特定日期的所有股票指标
  - 过滤市盈率范围的股票
  - 批量查询并分析估值指标

### 性能优化和最佳实践文档

- [ ] T025 [US4] 在 apps/docs/docs/guide/quick-start.md 中添加"性能优化技巧"部分
  - 启用缓存减少重复请求
  - 合理配置并发限制
  - 使用日期过滤减少数据量
  - 批量请求的注意事项

### 验证

- [ ] T026 [US4] 运行 pnpm docs:build 验证所有示例代码更新后构建成功
- [ ] T027 [US4] 手动复制每个 API 的示例代码到测试文件,验证代码可运行

**Checkpoint**: User Story 4 完成 - 所有 API 和指南都包含丰富的实际示例,用户可以快速学习

---

## Phase 7: Polish & Cross-Cutting Concerns (完善和跨功能优化)

**Purpose**: 最终验证、优化和文档质量保证

- [ ] T028 [P] 更新 apps/docs/docs/index.md - 首页,确保导航链接正确
- [ ] T029 [P] 更新 apps/docs/docs/changelog/index.md - 添加本次文档更新的变更记录
- [ ] T030 全局搜索文档目录,确认所有 `@tushare/sdk` 已替换为 `@hestudy/tushare-sdk`
- [ ] T031 全局搜索文档目录,确认所有错误的方法名已纠正
- [ ] T032 运行 pnpm docs:test:e2e 执行文档站 E2E 测试
- [ ] T033 运行 pnpm docs:dev 启动开发服务器,手动浏览所有更新的页面
- [ ] T034 使用 data-model.md 中的验证规则检查所有文档页面
- [ ] T035 运行 quickstart.md 中的验证步骤,确认文档更新流程可复现

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 可立即开始
- **Foundational (Phase 2)**: 依赖 Setup 完成 - 阻塞所有用户故事
- **User Stories (Phase 3-6)**: 所有依赖 Foundational 完成
  - User Story 1 (P1) → 独立,可并行
  - User Story 2 (P2) → 依赖 US1 中的 API 文档完成 (T007-T010)
  - User Story 3 (P2) → 独立,可并行
  - User Story 4 (P3) → 依赖 US1-US3 的所有文档页面创建完成
- **Polish (Phase 7)**: 依赖所有用户故事完成

### User Story Dependencies

- **User Story 1 (P1)**: Foundational 完成后可开始 - 无其他故事依赖
- **User Story 2 (P2)**: Foundational 完成后可开始 - 但 T014 需要 T007-T010 完成(需要引用正确的 API 方法名)
- **User Story 3 (P2)**: Foundational 完成后可开始 - T018 需要 T007-T010 完成(需要链接到已存在的 API 页面)
- **User Story 4 (P3)**: 需要 US1-US3 的所有文档页面已创建 - 为这些页面补充示例

### Within Each User Story

**User Story 1**:
- T007, T008 可并行 (不同文件)
- T009, T010 可并行 (不同文件)
- T011 需要 T007-T010 全部完成 (验证构建)
- T012 需要 T011 完成 (验证清单检查)

**User Story 2**:
- T013, T014 可并行 (不同文件),但 T014 需要确认 US1 的 API 方法名已纠正
- T015 需要 T013, T014 完成 (验证构建)
- T016 需要 T015 完成 (验证清单检查)

**User Story 3**:
- T017 独立执行
- T018 需要 T009, T010 完成 (链接到已创建的 API 页面)
- T019 需要 T017, T018 完成 (验证构建)
- T020 需要 T019 完成 (验证清单检查)

**User Story 4**:
- T021, T022, T023, T024 可并行 (不同文件)
- T025 独立执行
- T026 需要 T021-T025 完成 (验证构建)
- T027 需要 T026 完成 (手动验证示例代码)

### Parallel Opportunities

- Phase 1: T001, T002, T003 可并行执行
- Phase 2: T005, T006 可并行执行 (不同文件)
- Phase 3 (US1): T007, T008 并行 | T009, T010 并行
- Phase 4 (US2): T013, T014 可并行
- Phase 5 (US3): T017, T018 可并行执行
- Phase 6 (US4): T021, T022, T023, T024 可并行执行
- Phase 7: T028, T029 可并行执行

---

## Parallel Example: User Story 1 (API 文档更新)

```bash
# 并行更新现有 API 文档:
Task: "更新 apps/docs/docs/api/stock/basic.md - 股票基础信息 API"
Task: "更新 apps/docs/docs/api/stock/daily.md - 日线行情 API"

# 并行创建新 API 文档:
Task: "创建 apps/docs/docs/api/calendar.md - 交易日历 API"
Task: "创建 apps/docs/docs/api/daily-basic.md - 每日指标 API"
```

---

## Implementation Strategy

### MVP First (仅 User Story 1)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (关键 - 阻塞所有故事)
3. Complete Phase 3: User Story 1 (核心 API 文档)
4. **STOP and VALIDATE**: 运行 docs:build 和 E2E 测试,验证 API 文档完整性
5. 此时已有完整的 API 参考文档,可供用户使用

### Incremental Delivery

1. Setup + Foundational → 基础准备完成
2. Add User Story 1 → 核心 API 文档完成 → 部署/演示 (MVP!)
3. Add User Story 2 → 配置指南完善 → 部署/演示
4. Add User Story 3 → 错误处理指南完成 → 部署/演示
5. Add User Story 4 → 所有文档包含丰富示例 → 部署/演示
6. 每个用户故事独立交付价值

### Parallel Team Strategy

如果有多个文档编写者:

1. 团队共同完成 Setup + Foundational
2. Foundational 完成后:
   - 编写者 A: User Story 1 (T007, T009) - 股票基础信息和交易日历
   - 编写者 B: User Story 1 (T008, T010) - 日线行情和每日指标
   - 编写者 C: User Story 2 (T013, T014) - 配置指南和快速开始
3. 各用户故事独立完成和验证

---

## Notes

- [P] 标记的任务可并行执行 (不同文件,无依赖)
- [Story] 标签将任务映射到特定用户故事,便于追踪
- 每个用户故事应该可以独立完成和验证
- 所有示例代码必须使用正确的包名 `@hestudy/tushare-sdk`
- 所有类型定义必须与源代码100%一致
- 在每个 checkpoint 停下来验证文档独立性
- 避免: 模糊的任务描述、同文件冲突、跨故事依赖破坏独立性

---

## Success Metrics

完成所有任务后,应达到以下目标:

1. ✅ 所有 API 方法都有对应的完整文档页面 (4个核心 API: getStockBasic, getDailyQuote, getTradeCalendar, getDailyBasic)
2. ✅ API 文档中的类型定义与源代码完全一致 (一致性 100%)
3. ✅ 所有示例代码使用正确的包名和方法名 (可运行性 100%)
4. ✅ 配置文档包含所有配置选项 (至少 15 个配置属性,覆盖率 100%)
5. ✅ DailyBasicItem 文档包含所有 15+ 个字段说明和计算公式
6. ✅ 错误处理文档列出所有 7 个 ApiErrorType 枚举值
7. ✅ 每个 API 文档包含至少 3 个不同场景的示例
8. ✅ pnpm docs:build 构建成功,无错误
9. ✅ pnpm docs:test:e2e E2E 测试通过
