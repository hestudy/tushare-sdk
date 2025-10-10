# Implementation Plan: Node Demo 每日指标演示

**Branch**: `005-node-demo` | **Date**: 2025-10-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-node-demo/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

在现有的 node-demo 应用中增加每日指标(daily_basic)的演示示例,展示如何使用 SDK 的 `getDailyBasic` API 获取股票每日基本面指标数据。该演示将遵循现有示例(stock-list、daily-data、trade-calendar)的代码风格和结构,包含多种查询方式、完整的错误处理和清晰的注释说明。

## Technical Context

**Language/Version**: TypeScript 5.x+ / Node.js 18+ LTS  
**Primary Dependencies**: @hestudy/tushare-sdk (本地 workspace 依赖), 现有 node-demo 工具函数  
**Storage**: N/A (演示应用不需要持久化存储)  
**Testing**: Vitest (与主项目保持一致)  
**Target Platform**: Node.js 运行时环境 (开发和 CI 环境)
**Project Type**: single (现有演示应用扩展)  
**Performance Goals**: 示例执行时间 < 10s (查询单个交易日全市场数据)  
**Constraints**: 必须遵循现有示例的代码风格和结构;必须支持 --example=daily-basic 和 --example=all 两种运行模式;必须包含详细注释  
**Scale/Scope**: 新增 1 个示例文件 (~100-150 行代码), 3 种查询方式, 完整错误处理, README 更新

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Test-First Development ✅
- **状态**: 符合
- **说明**: 演示应用将遵循 TDD 流程,先编写测试验证示例功能,再实现演示代码
- **测试策略**: 
  - 单元测试:验证示例函数的返回值结构
  - 集成测试:验证 getDailyBasic API 调用和数据展示
  - E2E 测试:验证命令行参数解析和输出格式

### II. TypeScript 技术栈 ✅
- **状态**: 符合
- **说明**: 示例使用 TypeScript 5.x+ 编写,启用严格模式
- **类型安全**: 所有函数和变量都有明确类型定义,复用现有类型
- **依赖管理**: 使用 pnpm workspace 管理依赖

### III. 清晰的代码注释 ✅
- **状态**: 符合
- **说明**: 所有函数使用 JSDoc 注释,包含功能描述、参数说明和返回值说明
- **注释语言**: 中文
- **示例代码**: 每个查询场景都有清晰的注释说明使用场景和参数含义

### IV. 清晰的代码结构 ✅
- **状态**: 符合
- **说明**: 遵循现有示例的结构模式
- **文件位置**: `apps/node-demo/src/examples/daily-basic.ts`
- **代码风格**: 与 stock-list.ts、daily-data.ts、trade-calendar.ts 保持一致
- **命名规范**: 遵循 kebab-case 文件命名,camelCase 变量命名

### V. 完整的测试覆盖 ✅
- **状态**: 符合
- **说明**: 示例包含完整测试,验证 API 功能和输出格式
- **测试框架**: Vitest (与主项目保持一致)
- **覆盖目标**: ≥ 80% 代码覆盖率
- **测试类型**:
  - 单元测试:示例函数返回值验证
  - 集成测试:API 调用和数据处理
  - E2E 测试:命令行运行和输出验证

### 宪法合规性总结
✅ **所有宪法原则均符合要求,无需豁免或特殊处理**

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
apps/
└── node-demo/
    ├── src/
    │   ├── index.ts              # 现有:主入口(需更新,添加 daily-basic 到示例列表) ⭐
    │   ├── config.ts             # 现有:配置管理
    │   ├── types.ts              # 现有:类型定义(需更新,添加 'daily-basic' 到 ExampleName) ⭐
    │   ├── examples/
    │   │   ├── stock-list.ts     # 现有:股票列表示例
    │   │   ├── daily-data.ts     # 现有:日线数据示例
    │   │   ├── trade-calendar.ts # 现有:交易日历示例
    │   │   └── daily-basic.ts    # 新增:每日指标示例 ⭐
    │   └── utils/
    │       ├── example-runner.ts # 现有:示例运行器
    │       ├── formatter.ts      # 现有:输出格式化
    │       ├── error-handler.ts  # 现有:错误处理
    │       └── logger.ts         # 现有:日志工具
    ├── tests/
    │   ├── unit/
    │   │   └── daily-basic.test.ts      # 新增:单元测试 ⭐
    │   └── integration/
    │       └── daily-basic.integration.test.ts  # 新增:集成测试 ⭐
    ├── README.md                 # 现有:使用说明(需更新,添加 daily-basic 示例说明) ⭐
    └── package.json              # 现有:依赖配置

packages/
└── tushare-sdk/                  # 现有:SDK 主包(已包含 getDailyBasic 方法)
    └── ...
```

**Structure Decision**: 
- 遵循现有 node-demo 应用的单一项目结构
- 新增 `daily-basic.ts` 示例文件,与现有示例保持相同的命名和组织模式
- 需要更新 3 个现有文件:
  - `index.ts`: 添加 daily-basic 到示例列表
  - `types.ts`: 添加 'daily-basic' 到 ExampleName 类型
  - `README.md`: 添加使用说明
- 测试文件按类型分为 `unit/` 和 `integration/`

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**无违规项** - 所有设计决策均符合项目宪法要求。

---

## Phase 0: Research (✅ 完成)

**输出文件**: [research.md](./research.md)

**完成内容**:
- ✅ 分析现有示例代码结构和风格
- ✅ 研究 getDailyBasic API 使用方式
- ✅ 确定数据展示方式
- ✅ 确定错误处理场景
- ✅ 确定命令行参数集成方式
- ✅ 确定 README 文档更新方式

**关键决策**:
1. 遵循现有示例的标准结构(与 daily-data.ts、stock-list.ts 一致)
2. 演示 3 种典型查询方式:按日期、按股票、自定义字段
3. 复用现有工具函数(logger、formatter、error-handler)
4. 添加 'daily-basic' 到 ExampleName 类型和示例列表
5. 在 README 中添加完整的使用说明

---

## Phase 1: Design & Contracts (✅ 完成)

### 1.1 数据模型 (✅ 完成)

**输出文件**: [data-model.md](./data-model.md)

**完成内容**:
- ✅ 定义 `DailyBasicExampleResult` 返回值类型
- ✅ 定义 `DailyBasicQueryScenario` 查询场景类型
- ✅ 复用 SDK 的 `DailyBasicParams` 和 `DailyBasicItem` 类型
- ✅ 复用应用的 `AppConfig` 类型
- ✅ 定义数据流和展示格式

**核心实体**:
- `DailyBasicExampleResult`: 示例函数返回值 `{ count, sample }`
- `DailyBasicQueryScenario`: 3 种查询场景定义

### 1.2 API 契约 (✅ 完成)

**输出文件**: [contracts/example-interface.md](./contracts/example-interface.md)

**完成内容**:
- ✅ 定义 `runDailyBasicExample` 函数签名
- ✅ 文档化输入输出契约
- ✅ 定义错误处理契约
- ✅ 定义性能契约
- ✅ 定义测试契约
- ✅ 定义集成契约(与现有系统集成)

**API 签名**:
```typescript
export async function runDailyBasicExample(
  config: AppConfig
): Promise<{
  count: number;
  sample: unknown[];
}>
```

### 1.3 快速开始指南 (✅ 完成)

**输出文件**: [quickstart.md](./quickstart.md)

**完成内容**:
- ✅ 快速开始步骤(2 分钟)
- ✅ 3 种演示场景详细说明
- ✅ 进阶使用方法(verbose、JSON 输出)
- ✅ 完整的代码示例
- ✅ 常见问题解答(5 个问题)
- ✅ 下一步指引

### 1.4 Agent 上下文更新 (✅ 完成)

**执行命令**: `.specify/scripts/bash/update-agent-context.sh windsurf`

**更新内容**:
- ✅ 添加 TypeScript 5.x+ / Node.js 18+ LTS 技术栈信息
- ✅ 添加项目类型和依赖信息
- ✅ 更新 Windsurf 规则文件

---

## Phase 1 后宪法检查 (✅ 通过)

重新评估设计是否符合宪法:

✅ **I. Test-First Development**: 
- 已在 contracts 中定义测试契约
- 明确了单元测试、集成测试、E2E 测试场景
- 下一步将先编写测试(Phase 2 tasks.md)

✅ **II. TypeScript 技术栈**: 
- 所有类型定义完整且严格
- 复用 SDK 和应用现有类型
- 无 `any` 类型使用

✅ **III. 清晰的代码注释**: 
- 所有接口都有完整的 JSDoc 中文注释
- 参考现有示例代码风格
- 每个查询场景都有清晰说明

✅ **IV. 清晰的代码结构**: 
- 文件结构与现有示例完全一致
- 遵循命名约定(kebab-case 文件名)
- 集成到现有命令行参数系统

✅ **V. 完整的测试覆盖**: 
- 已规划单元测试、集成测试、E2E 测试
- 测试覆盖率目标 ≥ 80%
- 测试契约已定义

**结论**: 设计完全符合宪法要求,可以进入 Phase 2 (tasks.md 生成)

---

## 下一步: Phase 2 - Tasks Generation

Phase 1 计划已完成,下一步使用 `/speckit.tasks` 命令生成实施任务列表。

**注意**: 根据工作流定义,`/speckit.plan` 命令在 Phase 1 完成后停止,不生成 tasks.md。tasks.md 将由 `/speckit.tasks` 命令单独生成。
