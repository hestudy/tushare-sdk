# Implementation Plan: 演示应用财务数据功能集成

**Branch**: `011-` | **Date**: 2025-10-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

将现有的 `financial-data.ts` 示例集成到演示应用的主框架中,使其可以通过 `--example=financial-data` 参数独立运行,并在 `--example=all` 模式下自动包含。该功能展示 SDK 的财务数据查询能力,包括利润表、资产负债表、现金流量表的查询,以及基于这些数据计算的财务指标和综合分析。

## Technical Context

**Language/Version**: TypeScript 5.3+ / Node.js 18+ LTS
**Primary Dependencies**: @hestudy/tushare-sdk (本地 workspace 依赖), dotenv (环境变量管理), 现有演示框架工具模块
**Storage**: N/A (演示应用不需要持久化存储)
**Testing**: vitest (与其他示例保持一致)
**Target Platform**: Node.js CLI 应用
**Project Type**: single (演示应用,位于 apps/node-demo)
**Performance Goals**: 单个财务数据示例执行时间 < 5秒, API 响应时间取决于 Tushare 服务
**Constraints**: 必须与现有4个示例保持100%一致的命令行交互模式,输出格式与其他示例一致
**Scale/Scope**: 1个新示例模块,约300行代码(financial-data.ts 已存在),需要集成到主框架(修改 index.ts, types.ts)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Test-First Development (NON-NEGOTIABLE)
**Status**: ✅ **PASS**
- 本功能主要是集成现有代码到演示框架,不涉及新的业务逻辑实现
- 现有的 financial-data.ts 中的财务数据查询逻辑基于已测试的 SDK API
- 集成工作需要确保与其他示例的一致性,可以通过运行现有示例验证集成正确性
- 如果需要添加新的辅助函数,必须先编写测试

### II. TypeScript 技术栈
**Status**: ✅ **PASS**
- 项目使用 TypeScript 5.3+ 开发
- 严格模式已启用
- 所有类型定义完整(ExampleName, ExampleResult 等)
- 不使用 any 类型

### III. 清晰的代码注释
**Status**: ✅ **PASS**
- 现有代码已有完整的 JSDoc 注释
- 需要在集成时为新增的函数和修改的部分添加中文注释
- 确保注释准确描述功能、参数和返回值

### IV. 清晰的代码结构
**Status**: ✅ **PASS**
- 遵循现有演示应用的目录结构:
  ```
  apps/node-demo/src/
  ├── examples/          # 示例模块(包括 financial-data.ts)
  ├── utils/             # 工具函数(logger, formatter, error-handler, example-runner)
  ├── config.ts          # 配置加载
  ├── types.ts           # 类型定义
  └── index.ts           # 主入口
  ```
- 遵循单一职责原则,每个示例模块独立
- 命名规范一致(kebab-case 文件名,camelCase 函数名)

### V. 完整的测试覆盖
**Status**: ✅ **PASS** (with Note)
- 演示应用的测试策略侧重于手动验证和集成测试
- 核心 SDK 功能已在 SDK 包中进行了完整测试
- 演示应用可以通过运行 `npm start -- --example=financial-data` 进行手动验证
- 如果需要自动化测试,可以添加集成测试验证命令行参数解析和示例注册逻辑

**Overall Gate Status**: ✅ **PASS** - 可以进入 Phase 0 研究阶段

---

### Post-Design Constitution Re-check

**Re-evaluation Date**: 2025-10-13 (Phase 1 完成后)

#### I. Test-First Development (NON-NEGOTIABLE)
**Status**: ✅ **PASS**
- Phase 1 设计明确了接口契约和数据模型,为测试编写提供了清晰的规范
- 集成工作可以通过运行现有示例和手动测试验证
- 如需自动化测试,已在 research.md 中提供测试策略

#### II. TypeScript 技术栈
**Status**: ✅ **PASS**
- 所有类型定义在 data-model.md 中明确规范
- 接口契约确保类型安全
- 无 any 类型使用

#### III. 清晰的代码注释
**Status**: ✅ **PASS**
- quickstart.md 提供了代码示例和注释规范
- 要求为新增和修改的函数添加 JSDoc 注释

#### IV. 清晰的代码结构
**Status**: ✅ **PASS**
- 项目结构已在 plan.md 中明确定义
- 遵循现有演示应用的模块化结构
- 文件修改范围清晰(types.ts, index.ts, financial-data.ts)

#### V. 完整的测试覆盖
**Status**: ✅ **PASS**
- 测试策略在 research.md 第7节中明确定义
- quickstart.md 提供测试检查清单
- 手动测试和可选的自动化测试相结合

**Post-Design Gate Status**: ✅ **PASS** - 设计符合所有宪章要求,可以进入实现阶段 (Phase 2)

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
apps/node-demo/
├── src/
│   ├── examples/
│   │   ├── stock-list.ts           # 现有:股票列表示例
│   │   ├── daily-data.ts           # 现有:日线数据示例
│   │   ├── trade-calendar.ts       # 现有:交易日历示例
│   │   ├── daily-basic.ts          # 现有:每日指标示例
│   │   └── financial-data.ts       # 现有:财务数据示例(需要适配集成)
│   ├── utils/
│   │   ├── example-runner.ts       # 现有:示例运行器
│   │   ├── logger.ts               # 现有:日志工具
│   │   ├── formatter.ts            # 现有:格式化工具
│   │   └── error-handler.ts        # 现有:错误处理
│   ├── config.ts                   # 现有:配置加载
│   ├── types.ts                    # 需要修改:添加 'financial-data' 到 ExampleName
│   └── index.ts                    # 需要修改:注册财务数据示例
└── package.json
```

**Structure Decision**:
- 本功能属于 Single project 类型,位于 apps/node-demo 演示应用
- financial-data.ts 已存在,需要适配为与其他示例一致的接口
- 主要修改文件: types.ts (添加类型), index.ts (注册示例)
- 不需要创建新的目录或文件,只需要修改现有文件以集成财务数据示例

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

无违规项 - 所有宪章检查均通过。
