# Tasks: Tushare TypeScript SDK

**Feature Branch**: `001-tushare-typescript-sdk`  
**Generated**: 2025-10-09  
**Input**: Design documents from `/specs/001-tushare-typescript-sdk/`

**Organization**: 任务按用户故事分组，每个故事可独立实现和测试

## 格式说明: `[ID] [P?] [Story] 描述`
- **[P]**: 可并行执行（不同文件，无依赖）
- **[Story]**: 任务所属用户故事（US1, US2, US3, US4, US5）
- 所有任务包含精确的文件路径

---

## Phase 1: 项目初始化（共享基础设施）

**目的**: 创建 monorepo 结构和基础配置

- [x] T001 创建 Turborepo monorepo 根目录结构（turbo.json, pnpm-workspace.yaml, package.json）
- [x] T002 创建 packages/tushare-sdk 目录结构（src/, tests/, rslib.config.ts, tsconfig.json, vitest.config.ts, package.json）
- [x] T003 [P] 配置根 tsconfig.base.json（strict: true, target: ES2020）
- [x] T004 [P] 配置 ESLint（.eslintrc.js）和 Prettier（.prettierrc）
- [x] T005 [P] 配置 Turborepo 任务管道（turbo.json: build, test, lint）
- [x] T006 安装核心依赖（typescript, rslib, vitest, turborepo）
- [x] T007 创建 .gitignore 和 README.md

---

## Phase 2: 基础设施（阻塞性前置条件）

**目的**: 核心基础设施，必须在任何用户故事之前完成

**⚠️ 关键**: 所有用户故事工作必须等待此阶段完成

- [x] T008 [P] 实现 Logger 接口和 ConsoleLogger（packages/tushare-sdk/src/utils/logger.ts）
- [x] T009 [P] 实现日期工具函数（packages/tushare-sdk/src/utils/date.ts: formatDate, parseDate）
- [x] T010 [P] 定义核心类型（packages/tushare-sdk/src/types/config.ts: TushareConfig, RetryConfig, LogLevel）
- [x] T011 [P] 定义错误类型（packages/tushare-sdk/src/types/error.ts: ApiError, ApiErrorType）
- [x] T012 [P] 定义响应类型（packages/tushare-sdk/src/types/response.ts: TushareResponse, TushareRequest）
- [x] T013 实现 HTTP 客户端（packages/tushare-sdk/src/client/http.ts: 基于 fetch API）
- [x] T014 实现参数验证服务（packages/tushare-sdk/src/services/validator.ts: validateConfig, validateParams）
- [x] T015 实现重试服务（packages/tushare-sdk/src/services/retry.ts: RetryService 类）
- [x] T016 实现 CacheProvider 接口和 MemoryCacheProvider（packages/tushare-sdk/src/services/cache.ts）
- [x] T017 实现并发控制器（packages/tushare-sdk/src/services/concurrency.ts: ConcurrencyLimiter 类）

**Checkpoint**: 基础设施就绪 - 用户故事实现现在可以并行开始

---

## Phase 3: User Story 1 - 基础 API 调用 (Priority: P1) 🎯 MVP

**目标**: 实现核心客户端类，支持基本的 API 调用功能（股票列表、日线行情）

**独立测试**: 创建客户端实例 → 配置 Token → 调用 stock_basic 接口 → 验证返回数据结构

### 测试 - User Story 1

**注意: 先编写测试，确保测试失败后再实现功能**

- [x] T018 [P] [US1] 契约测试：验证 stock_basic API 响应格式（tests/contract/tushare-api.test.ts）
- [x] T019 [P] [US1] 契约测试：验证 daily API 响应格式（tests/contract/tushare-api.test.ts）
- [x] T020 [P] [US1] 集成测试：完整的 API 调用流程（tests/integration/api.test.ts）
- [x] T021 [P] [US1] 单元测试：TushareClient 初始化和配置验证（tests/unit/client.test.ts）

### 实现 - User Story 1

- [x] T022 [P] [US1] 定义股票数据模型（packages/tushare-sdk/src/models/stock.ts: StockBasicItem, StockBasicParams）
- [x] T023 [P] [US1] 定义行情数据模型（packages/tushare-sdk/src/models/quote.ts: DailyQuoteItem, DailyQuoteParams）
- [x] T024 [US1] 实现 TushareClient 核心类（packages/tushare-sdk/src/client/TushareClient.ts: 构造函数、query 方法）
- [x] T025 [US1] 实现响应数据转换逻辑（packages/tushare-sdk/src/client/TushareClient.ts: transformResponse 方法）
- [x] T026 [US1] 实现 stock_basic API 方法（packages/tushare-sdk/src/api/stock.ts: getStockBasic）
- [x] T027 [US1] 实现 daily API 方法（packages/tushare-sdk/src/api/quote.ts: getDailyQuote）
- [x] T028 [US1] 集成 HTTP 客户端、重试服务到 TushareClient（packages/tushare-sdk/src/client/TushareClient.ts）
- [x] T029 [US1] 添加请求/响应日志记录（packages/tushare-sdk/src/client/TushareClient.ts）
- [x] T030 [US1] 创建主入口文件并导出公共 API（packages/tushare-sdk/src/index.ts）

**Checkpoint**: 此时 User Story 1 应完全可用且可独立测试

---

## Phase 4: User Story 2 - TypeScript 类型安全 (Priority: P2)

**目标**: 完善所有 API 的 TypeScript 类型定义，提供完整的 JSDoc 注释

**独立测试**: 在 TypeScript 项目中导入 SDK → 调用 API 方法 → 验证 IDE 类型提示和编译时错误检查

### 测试 - User Story 2

- [x] T031 [P] [US2] 类型测试：验证严格模式下无 any 类型泄漏（tests/unit/types.test.ts）
- [x] T032 [P] [US2] 类型测试：验证错误参数在编译时被捕获（tests/unit/types.test.ts）

### 实现 - User Story 2

- [x] T033 [P] [US2] 为 TushareClient 添加完整 JSDoc 注释（packages/tushare-sdk/src/client/TushareClient.ts）
- [x] T034 [P] [US2] 为所有模型添加 JSDoc 注释（packages/tushare-sdk/src/models/*.ts）
- [x] T035 [P] [US2] 为所有 API 方法添加 JSDoc 注释（packages/tushare-sdk/src/api/*.ts）
- [x] T036 [P] [US2] 为配置类型添加详细 JSDoc（packages/tushare-sdk/src/types/config.ts）
- [x] T037 [P] [US2] 为错误类型添加详细 JSDoc（packages/tushare-sdk/src/types/error.ts）
- [x] T038 [US2] 定义财务数据模型和类型（packages/tushare-sdk/src/models/financial.ts: FinancialItem, FinancialParams）
- [x] T039 [US2] 实现 income API 方法（packages/tushare-sdk/src/api/financial.ts: getFinancialData）
- [x] T040 [US2] 配置 TypeScript 声明文件生成（packages/tushare-sdk/tsconfig.json: declaration: true）
- [x] T041 [US2] 验证所有导出类型在严格模式下编译通过（运行 tsc --noEmit）

**Checkpoint**: 所有类型定义完整，IDE 提供完整智能提示

---

## Phase 5: User Story 4 - 错误处理和重试机制 (Priority: P2)

**目标**: 实现完善的错误分类、自动重试和错误恢复机制

**独立测试**: 模拟各种错误场景（网络超时、429 限流、500 错误）→ 验证 SDK 正确处理和重试

### 测试 - User Story 4

- [ ] T042 [P] [US4] 单元测试：RetryService 指数退避逻辑（tests/unit/services.test.ts）
- [ ] T043 [P] [US4] 单元测试：ApiError 错误分类和 retryable 判断（tests/unit/services.test.ts）
- [ ] T044 [P] [US4] 集成测试：429 限流错误自动重试（tests/integration/retry.test.ts）
- [ ] T045 [P] [US4] 集成测试：网络超时错误重试（tests/integration/retry.test.ts）
- [ ] T046 [P] [US4] 集成测试：不可重试错误（401, 400）立即抛出（tests/integration/retry.test.ts）

### 实现 - User Story 4

- [ ] T047 [US4] 完善 ApiError 类：添加 retryable 判断和 retryAfter 属性（packages/tushare-sdk/src/types/error.ts）
- [ ] T048 [US4] 完善 RetryService：实现指数退避 + 抖动算法（packages/tushare-sdk/src/services/retry.ts）
- [ ] T049 [US4] 在 HTTP 客户端中集成错误分类逻辑（packages/tushare-sdk/src/client/http.ts）
- [ ] T050 [US4] 实现 429 错误的 Retry-After 响应头解析（packages/tushare-sdk/src/client/http.ts）
- [ ] T051 [US4] 在 TushareClient 中集成 RetryService（packages/tushare-sdk/src/client/TushareClient.ts）
- [ ] T052 [US4] 添加重试过程的详细日志记录（packages/tushare-sdk/src/services/retry.ts）
- [ ] T053 [US4] 实现自定义重试策略配置（packages/tushare-sdk/src/types/config.ts: RetryConfig）

**Checkpoint**: 错误处理机制完善，自动重试正常工作

---

## Phase 6: User Story 3 - 浏览器环境支持 (Priority: P3)

**目标**: 支持在浏览器环境中使用 SDK，配置正确的构建输出

**独立测试**: 在浏览器环境（或 jsdom）中导入 SDK → 调用 API → 验证请求发送和响应解析

### 测试 - User Story 3

- [ ] T054 [P] [US3] 集成测试：浏览器环境 API 调用（tests/integration/browser.test.ts，使用 jsdom）
- [ ] T055 [P] [US3] 构建测试：验证打包体积 < 50KB gzipped（tests/build/bundle-size.test.ts）

### 实现 - User Story 3

- [ ] T056 [US3] 配置 rslib 多格式输出（packages/tushare-sdk/rslib.config.ts: ESM, CJS, UMD）
- [ ] T057 [US3] 配置 package.json 条件导出（packages/tushare-sdk/package.json: exports 字段）
- [ ] T058 [US3] 添加浏览器环境检测和安全警告（packages/tushare-sdk/src/client/TushareClient.ts）
- [ ] T059 [US3] 确保 fetch API 在浏览器和 Node.js 中正确工作（packages/tushare-sdk/src/client/http.ts）
- [ ] T060 [US3] 优化打包配置以减小体积（packages/tushare-sdk/rslib.config.ts: tree-shaking, minify）
- [ ] T061 [US3] 在 quickstart.md 中添加浏览器使用示例和安全警告

**Checkpoint**: SDK 可在浏览器和 Node.js 环境中正常工作

---

## Phase 7: User Story 5 - 数据缓存机制 (Priority: P3)

**目标**: 实现可选的内存缓存和可插拔的外部缓存接口

**独立测试**: 启用缓存 → 连续调用相同接口 → 验证第二次调用从缓存返回

### 测试 - User Story 5

- [ ] T062 [P] [US5] 单元测试：MemoryCacheProvider 基本操作（tests/unit/services.test.ts）
- [ ] T063 [P] [US5] 单元测试：缓存过期机制（tests/unit/services.test.ts）
- [ ] T064 [P] [US5] 集成测试：缓存命中和未命中场景（tests/integration/cache.test.ts）
- [ ] T065 [P] [US5] 集成测试：自定义缓存提供者（tests/integration/cache.test.ts）

### 实现 - User Story 5

- [ ] T066 [US5] 完善 MemoryCacheProvider：实现 LRU 淘汰策略（packages/tushare-sdk/src/services/cache.ts）
- [ ] T067 [US5] 实现缓存键生成逻辑（packages/tushare-sdk/src/services/cache.ts: generateCacheKey）
- [ ] T068 [US5] 在 TushareClient 中集成缓存逻辑（packages/tushare-sdk/src/client/TushareClient.ts）
- [ ] T069 [US5] 实现缓存配置选项（packages/tushare-sdk/src/types/config.ts: CacheConfig）
- [ ] T070 [US5] 添加缓存命中/未命中日志（packages/tushare-sdk/src/client/TushareClient.ts）
- [ ] T071 [US5] 在 quickstart.md 中添加缓存使用示例（包括 Redis 集成示例）

**Checkpoint**: 缓存机制完整，支持自定义缓存提供者

---

## Phase 8: 完善和跨功能关注点

**目的**: 影响多个用户故事的改进和文档完善

- [ ] T072 [P] 实现并发控制逻辑（packages/tushare-sdk/src/services/concurrency.ts: 队列机制）
- [ ] T073 [P] 在 TushareClient 中集成并发控制（packages/tushare-sdk/src/client/TushareClient.ts）
- [ ] T074 [P] 添加 trade_cal API 方法（packages/tushare-sdk/src/api/calendar.ts）
- [ ] T075 [P] 创建完整的 README.md（根目录和 packages/tushare-sdk/）
- [ ] T076 [P] 创建 CHANGELOG.md（packages/tushare-sdk/CHANGELOG.md）
- [ ] T077 [P] 创建 API 文档（docs/api.md）
- [ ] T078 配置 vitest 覆盖率报告（packages/tushare-sdk/vitest.config.ts: coverage ≥ 80%）
- [ ] T079 运行完整测试套件并验证覆盖率（pnpm test --coverage）
- [ ] T080 运行 quickstart.md 中的所有示例验证（手动或自动化）
- [ ] T081 性能优化：响应数据转换（使用 for 循环代替 forEach）
- [ ] T082 添加 GitHub Actions CI/CD 配置（.github/workflows/ci.yml）
- [ ] T083 准备 npm 发布配置（packages/tushare-sdk/package.json: publishConfig）

---

## 依赖关系和执行顺序

### 阶段依赖

- **项目初始化 (Phase 1)**: 无依赖 - 可立即开始
- **基础设施 (Phase 2)**: 依赖 Phase 1 完成 - 阻塞所有用户故事
- **用户故事 (Phase 3-7)**: 全部依赖 Phase 2 完成
  - 用户故事之间可并行进行（如果有足够人力）
  - 或按优先级顺序执行（P1 → P2 → P3）
- **完善 (Phase 8)**: 依赖所需的用户故事完成

### 用户故事依赖

- **User Story 1 (P1)**: Phase 2 完成后可开始 - 无其他故事依赖
- **User Story 2 (P2)**: Phase 2 完成后可开始 - 依赖 US1 的基础 API（可并行开发，最后集成）
- **User Story 4 (P2)**: Phase 2 完成后可开始 - 依赖 US1 的基础 API（可并行开发，最后集成）
- **User Story 3 (P3)**: Phase 2 完成后可开始 - 依赖 US1 的基础 API（可并行开发，最后集成）
- **User Story 5 (P3)**: Phase 2 完成后可开始 - 依赖 US1 的基础 API（可并行开发，最后集成）

### 每个用户故事内部

- 测试必须先编写并失败，然后再实现
- 模型 → 服务 → API 方法
- 核心实现 → 集成
- 故事完成后再进入下一优先级

### 并行机会

- Phase 1 中所有标记 [P] 的任务可并行
- Phase 2 中所有标记 [P] 的任务可并行
- Phase 2 完成后，所有用户故事可并行开始（如果团队容量允许）
- 每个故事内标记 [P] 的测试可并行
- 每个故事内标记 [P] 的模型可并行
- 不同用户故事可由不同团队成员并行工作

---

## 并行示例: User Story 1

```bash
# 同时启动 User Story 1 的所有测试:
Task T018: "契约测试：验证 stock_basic API 响应格式"
Task T019: "契约测试：验证 daily API 响应格式"
Task T020: "集成测试：完整的 API 调用流程"
Task T021: "单元测试：TushareClient 初始化和配置验证"

# 同时启动 User Story 1 的所有模型:
Task T022: "定义股票数据模型"
Task T023: "定义行情数据模型"
```

---

## 实施策略

### MVP 优先（仅 User Story 1）

1. 完成 Phase 1: 项目初始化
2. 完成 Phase 2: 基础设施（关键 - 阻塞所有故事）
3. 完成 Phase 3: User Story 1
4. **停止并验证**: 独立测试 User Story 1
5. 如果就绪则部署/演示

### 增量交付

1. 完成初始化 + 基础设施 → 基础就绪
2. 添加 User Story 1 → 独立测试 → 部署/演示（MVP!）
3. 添加 User Story 2 → 独立测试 → 部署/演示
4. 添加 User Story 4 → 独立测试 → 部署/演示
5. 添加 User Story 3 → 独立测试 → 部署/演示
6. 添加 User Story 5 → 独立测试 → 部署/演示
7. 每个故事增加价值而不破坏之前的故事

### 并行团队策略

多个开发者的情况：

1. 团队一起完成初始化 + 基础设施
2. 基础设施完成后：
   - 开发者 A: User Story 1（P1）
   - 开发者 B: User Story 2（P2）
   - 开发者 C: User Story 4（P2）
3. P1 和 P2 完成后：
   - 开发者 D: User Story 3（P3）
   - 开发者 E: User Story 5（P3）
4. 故事独立完成和集成

---

## 任务统计

- **总任务数**: 83
- **Phase 1 (初始化)**: 7 任务
- **Phase 2 (基础设施)**: 10 任务
- **Phase 3 (US1 - P1)**: 13 任务（4 测试 + 9 实现）
- **Phase 4 (US2 - P2)**: 11 任务（2 测试 + 9 实现）
- **Phase 5 (US4 - P2)**: 12 任务（5 测试 + 7 实现）
- **Phase 6 (US3 - P3)**: 8 任务（2 测试 + 6 实现）
- **Phase 7 (US5 - P3)**: 10 任务（4 测试 + 6 实现）
- **Phase 8 (完善)**: 12 任务

### 按用户故事统计

- **User Story 1 (基础 API 调用)**: 13 任务
- **User Story 2 (TypeScript 类型安全)**: 11 任务
- **User Story 3 (浏览器环境支持)**: 8 任务
- **User Story 4 (错误处理和重试)**: 12 任务
- **User Story 5 (数据缓存机制)**: 10 任务

### 并行机会

- Phase 1: 4 个并行任务
- Phase 2: 7 个并行任务
- User Story 1: 6 个并行任务（4 测试 + 2 模型）
- User Story 2: 7 个并行任务
- User Story 4: 5 个并行任务
- User Story 3: 2 个并行任务
- User Story 5: 4 个并行任务
- Phase 8: 7 个并行任务

**总并行机会**: 约 42 个任务可并行执行

---

## 建议的 MVP 范围

**最小可行产品应包含**:
- Phase 1: 项目初始化（必需）
- Phase 2: 基础设施（必需）
- Phase 3: User Story 1 - 基础 API 调用（核心功能）

**MVP 交付物**:
- ✅ 可工作的 TypeScript SDK
- ✅ 支持股票列表和日线行情查询
- ✅ 完整的类型定义
- ✅ 基本的错误处理
- ✅ 测试覆盖率 ≥ 80%
- ✅ 可通过 npm 安装使用

**后续迭代可添加**:
- User Story 2: 完善类型和文档（提升开发体验）
- User Story 4: 高级错误处理和重试（提升稳定性）
- User Story 3: 浏览器支持（扩展使用场景）
- User Story 5: 缓存机制（优化性能）

---

## 注意事项

- [P] 标记 = 不同文件，无依赖，可并行
- [Story] 标签将任务映射到特定用户故事以便追溯
- 每个用户故事应可独立完成和测试
- 实现前验证测试失败
- 每个任务或逻辑组完成后提交
- 在任何检查点停止以独立验证故事
- 避免：模糊任务、同文件冲突、破坏独立性的跨故事依赖

---

**准备开始实施！使用 `/speckit.implement` 命令执行任务列表**
