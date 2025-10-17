# Implementation Plan: 股市数据定时采集与存储应用 (基于 Motia 框架)

**Branch**: `017-` | **Date**: 2025-10-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/017-/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

构建一个基于 Motia 框架的股市数据自动采集与存储应用。该应用将利用 Motia 的事件驱动架构和 Step 原语,实现定时采集 A 股市场日线行情数据、交易日历维护、本地数据存储和查询导出功能。通过 Motia 的任务调度能力,无需额外的队列基础设施即可实现可靠的数据采集流程。

## Technical Context

**Language/Version**: TypeScript 5.x + Node.js 18+ LTS (Motia 支持的主要语言)
**Primary Dependencies**:

- Motia (@motiadev/motia) - 核心框架
- @hestudy/tushare-sdk - 数据源 SDK
- better-sqlite3 - 本地数据库(Motia 推荐的轻量级存储)
  **Storage**: SQLite (本地文件数据库,便于分析工具集成)
  **Testing**: Vitest (与现有 monorepo 一致)
  **Target Platform**: Linux/macOS/Windows 服务器或本地开发环境
  **Project Type**: single (Motia 应用,事件驱动架构)
  **Performance Goals**:
- 单次数据采集任务完成时间 < 30分钟(4000+只股票)
- 数据查询响应时间 < 2秒(单只股票1年数据)
  **Constraints**:
- 遵守 Tushare API 限流规则(免费账户约200次/分钟)
- 本地存储空间 < 5GB(3年全市场数据)
  **Scale/Scope**:
- 支持 4000+ A股股票
- 存储最近3-5年历史数据
- 单用户/小团队使用场景

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                     | Status  | Notes                                                                    |
| ----------------------------- | ------- | ------------------------------------------------------------------------ |
| **I. Test-First Development** | ✅ PASS | 将遵循 TDD 流程,先编写单元测试和集成测试,验证数据采集、存储、查询功能    |
| **II. TypeScript 技术栈**     | ✅ PASS | Motia 原生支持 TypeScript,将使用 strict mode 和完整类型定义              |
| **III. 清晰的代码注释**       | ✅ PASS | 所有 Step config 和 handler 将包含 JSDoc 注释,说明业务逻辑和数据流       |
| **IV. 清晰的代码结构**        | ✅ PASS | 遵循 Motia 推荐的项目结构 (`/steps`, `/streams`, `/state`),模块化设计    |
| **V. 完整的测试覆盖**         | ✅ PASS | 单元测试覆盖 Step handler 逻辑,集成测试验证端到端数据流,目标覆盖率 ≥ 80% |

**Constitution Compliance**: ✅ 所有原则均符合,无需违规豁免。

### Phase 1 Re-evaluation (2025-10-15)

**设计审查结果**: ✅ 设计符合所有宪法原则

- **数据模型**: 使用 TypeScript interfaces 定义所有实体,类型安全 ✅
- **API Contracts**: 使用 JSON Schema 定义接口契约,文档完整 ✅
- **项目结构**: 遵循 Motia 推荐结构,清晰模块化 ✅
- **测试策略**: 明确单元测试、集成测试、契约测试范围 ✅

无新增违规项,可进入 Phase 2 任务分解。

## Project Structure

### Documentation (this feature)

```
specs/017-/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
apps/motia-stock-collector/       # Motia 应用根目录
├── package.json                   # 项目配置和依赖
├── tsconfig.json                  # TypeScript 配置
├── motia.config.ts               # Motia 框架配置
├── .env.example                   # 环境变量示例
├── README.md                      # 项目说明文档
├── steps/                         # Motia Steps 目录(核心业务逻辑)
│   ├── schedule-daily-collection.step.ts    # 定时触发日线数据采集
│   ├── collect-daily-quotes.step.ts         # 采集日线行情数据
│   ├── collect-trade-calendar.step.ts       # 采集交易日历
│   ├── save-quotes-to-db.step.ts            # 保存行情数据到数据库
│   ├── query-quotes-api.step.ts             # 查询接口 Step
│   └── export-data.step.ts                  # 数据导出 Step
├── lib/                           # 共享工具和服务
│   ├── database.ts                # 数据库连接和操作封装
│   ├── tushare-client.ts          # Tushare SDK 客户端封装
│   └── utils.ts                   # 工具函数
├── types/                         # 共享类型定义
│   └── index.ts                   # 数据模型类型定义
└── tests/                         # 测试目录
    ├── unit/                      # 单元测试
    │   ├── database.test.ts
    │   └── tushare-client.test.ts
    └── integration/               # 集成测试
        ├── collection-flow.test.ts
        └── query-flow.test.ts
```

**Structure Decision**:

- 采用 Motia 单项目架构(single project)
- 核心业务逻辑通过 Steps 实现,每个 Step 对应一个独立的任务单元
- 使用 `/steps` 目录存放所有 Step 文件,Motia 会自动发现和连接
- 使用 `/lib` 目录存放可重用的工具和服务层代码
- 测试遵循 monorepo 现有结构,使用 Vitest 框架

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

**无违规项** - 本项目完全符合宪法要求,无需额外复杂度豁免。
