# Implementation Plan: Node 应用演示示例

**Branch**: `003-apps-node-sdk` | **Date**: 2025-10-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-apps-node-sdk/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

在 `apps` 目录下搭建一个简单的 Node 应用,用于验证和演示 Tushare SDK 在真实环境中的功能。该应用将演示 SDK 的核心功能,包括客户端初始化、API 调用、数据处理和错误处理。应用使用 TypeScript 编写,通过 pnpm workspace 形式安装和管理依赖。

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.x+ / Node.js 18+ LTS  
**Primary Dependencies**: 本地 @tushare/sdk 包 (workspace 依赖), dotenv (环境变量管理)  
**Storage**: N/A (演示应用不需要持久化存储)  
**Testing**: Jest 或 Vitest (与主项目保持一致)  
**Target Platform**: Node.js 运行时环境 (开发和 CI 环境)
**Project Type**: single (独立演示应用)  
**Performance Goals**: 应用启动时间 < 2s, API 调用响应展示 < 5s  
**Constraints**: 必须使用本地 workspace SDK 包,不依赖外部发布版本;必须支持 CI 环境自动化运行  
**Scale/Scope**: 小型演示应用 (~200 行代码), 3-5 个 API 调用示例, 3 种错误场景处理

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Test-First Development ✅
- **状态**: 符合
- **说明**: 演示应用将遵循 TDD 流程,先编写测试验证 SDK 功能,再实现演示代码
- **测试策略**: 
  - 单元测试:验证配置加载、错误处理逻辑
  - 集成测试:验证 SDK 客户端初始化和 API 调用
  - 契约测试:验证演示应用与本地 SDK 包的集成

### II. TypeScript 技术栈 ✅
- **状态**: 符合
- **说明**: 应用使用 TypeScript 5.x+ 编写,启用严格模式
- **类型安全**: 所有函数和变量都有明确类型定义,禁止使用 `any`
- **依赖管理**: 使用 pnpm workspace 管理依赖

### III. 清晰的代码注释 ✅
- **状态**: 符合
- **说明**: 所有公共函数使用 JSDoc 注释,包含功能描述、参数说明和返回值说明
- **注释语言**: 中文
- **示例代码**: 演示应用本身作为 SDK 使用示例,注释尤为重要

### IV. 清晰的代码结构 ✅
- **状态**: 符合
- **说明**: 演示应用结构简单清晰
- **目录结构**:
  ```
  apps/node-demo/
  ├── src/
  │   ├── index.ts           # 主入口,演示基本功能
  │   ├── examples/          # 各种 API 调用示例
  │   ├── error-handling.ts  # 错误处理演示
  │   └── config.ts          # 配置管理
  ├── tests/
  │   ├── integration/       # 集成测试
  │   └── unit/              # 单元测试
  ├── .env.example           # 环境变量示例
  ├── package.json
  ├── tsconfig.json
  └── README.md              # 运行说明
  ```
- **命名规范**: 遵循 kebab-case 文件命名,camelCase 变量命名

### V. 完整的测试覆盖 ✅
- **状态**: 符合
- **说明**: 演示应用包含完整测试,验证 SDK 功能
- **测试框架**: 与主项目保持一致 (Jest 或 Vitest)
- **覆盖目标**: ≥ 80% 代码覆盖率
- **测试类型**:
  - 单元测试:配置加载、错误处理
  - 集成测试:SDK 初始化、API 调用、数据解析

### 宪法合规性总结
✅ **所有宪法原则均符合要求,无需豁免或特殊处理**

---

## Phase 1 完成后宪法复查

**复查时间**: 2025-10-10 (Phase 1 设计完成后)

### 设计文档审查

已生成的设计文档:
- ✅ `research.md` - 技术研究和决策
- ✅ `data-model.md` - 数据模型定义
- ✅ `contracts/app-interface.md` - 应用接口契约
- ✅ `quickstart.md` - 快速开始指南

### 宪法合规性确认

**I. Test-First Development** ✅
- 设计文档中明确定义了测试策略和测试场景
- `data-model.md` 包含验证规则和类型守卫
- `contracts/app-interface.md` 定义了测试覆盖率目标 (≥80%)
- 测试类型明确: 单元测试、集成测试、E2E 测试

**II. TypeScript 技术栈** ✅
- 所有代码示例使用 TypeScript 5.x+
- 启用严格模式配置已在 `research.md` 中定义
- 类型定义完整,禁止使用 `any`
- 使用 pnpm workspace 管理依赖

**III. 清晰的代码注释** ✅
- `data-model.md` 中所有接口都有 JSDoc 注释
- 注释使用中文,简洁明了
- 包含功能描述、参数说明、返回值说明

**IV. 清晰的代码结构** ✅
- 项目结构在 `plan.md` 中明确定义
- 遵循 `src/` 和 `tests/` 分离
- 文件命名规范明确 (kebab-case)
- 目录职责清晰

**V. 完整的测试覆盖** ✅
- 测试覆盖率目标: ≥80%
- 测试框架: Vitest (与主项目一致)
- 测试场景完整定义在 `contracts/app-interface.md`
- 包含单元测试、集成测试、E2E 测试

### 复查结论

✅ **Phase 1 设计完全符合项目宪法要求,可以进入 Phase 2 (任务生成)**

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
└── node-demo/                    # 新增:演示应用目录
    ├── src/
    │   ├── index.ts              # 主入口文件,演示基本 SDK 使用流程
    │   ├── config.ts             # 配置管理(加载环境变量)
    │   ├── error-handling.ts     # 错误处理演示
    │   └── examples/             # API 调用示例目录
    │       ├── stock-list.ts     # 股票列表查询示例
    │       ├── daily-data.ts     # 日线数据查询示例
    │       └── realtime-quote.ts # 实时行情查询示例
    ├── tests/
    │   ├── unit/
    │   │   ├── config.test.ts    # 配置加载测试
    │   │   └── error-handling.test.ts # 错误处理测试
    │   └── integration/
    │       ├── sdk-init.test.ts  # SDK 初始化集成测试
    │       └── api-calls.test.ts # API 调用集成测试
    ├── .env.example              # 环境变量示例文件
    ├── .gitignore
    ├── package.json              # 依赖配置(workspace 引用本地 SDK)
    ├── tsconfig.json             # TypeScript 配置
    └── README.md                 # 运行说明文档

packages/
└── tushare-sdk/                  # 现有:SDK 主包(演示应用依赖此包)
    └── ...

pnpm-workspace.yaml               # 现有:workspace 配置(需更新包含 apps/*)
```

**Structure Decision**: 
- 选择 **单项目结构** (Option 1),因为这是一个独立的演示应用
- 应用位于 `apps/node-demo/` 目录,与现有 `packages/` 目录平级
- 通过 pnpm workspace 机制引用本地 `@tushare/sdk` 包
- 遵循标准的 `src/` 和 `tests/` 分离结构
- 测试分为 `unit/` 和 `integration/` 两类,符合宪法要求

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**无违规项** - 所有设计决策均符合项目宪法要求。
