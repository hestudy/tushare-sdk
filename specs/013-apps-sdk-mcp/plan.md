# Implementation Plan: Tushare MCP 服务器应用

**Branch**: `013-apps-sdk-mcp` | **Date**: 2025-10-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-apps-sdk-mcp/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

实现一个基于 Model Context Protocol (MCP) 的 Tushare 数据服务器,使 AI 客户端(如 Claude Desktop)能够通过标准 MCP 协议查询 Tushare 金融数据。该服务器将基于 `@hestudy/tushare-sdk` 封装股票行情、财务数据、K线数据和市场指数等查询功能,通过 stdio 传输协议与 AI 客户端通信,支持通过 npx 直接本地运行,无需独立服务端部署。

## Technical Context

**Language/Version**: TypeScript 5.3+ / Node.js 18+ LTS
**Primary Dependencies**: @modelcontextprotocol/sdk (TypeScript MCP SDK), @hestudy/tushare-sdk (本地 workspace 依赖), stdio 传输协议
**Storage**: N/A (无状态 MCP 服务器,不需要持久化存储)
**Testing**: vitest (单元测试), MCP 协议集成测试
**Target Platform**: Node.js 18+ LTS, 支持 macOS/Linux/Windows 跨平台运行
**Project Type**: single (CLI 工具/MCP 服务器应用)
**Performance Goals**: 单个查询响应时间 <5秒(P95), 支持至少 5 个并发请求, 启动时间 <3秒
**Constraints**: 内存占用 <200MB(空闲状态), 遵守 Tushare API 频率限制, 必须支持通过 npx 直接运行
**Scale/Scope**: 支持 4 类核心 MCP Tools(行情/财务/K线/指数), 预计 ~500-800 行代码(不含测试)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Version**: 1.0.0 (Ratified: 2025-10-09)

### Principle I: Test-First Development (NON-NEGOTIABLE)

**合规状态**: ✅ PASS

**计划**:
- 所有 MCP Tools 和 Handlers 实现前先编写单元测试
- 遵循 TDD Red-Green-Refactor 循环
- 测试文件结构已在 plan.md 中定义 (`tests/unit/` 和 `tests/integration/`)
- 实施阶段将在 tasks.md 中明确"编写测试 → 实现功能"的顺序

**无违反**: 设计已考虑测试优先原则。

---

### Principle II: TypeScript 技术栈

**合规状态**: ✅ PASS

**已遵循**:
- 使用 TypeScript 5.3+ (Technical Context)
- 已定义完整的类型系统 (data-model.md: MCPToolDefinition, ToolCallRequest, ServerConfig 等)
- 计划启用严格模式 (tsconfig.json 将配置 `strict: true`)
- 禁止使用 `any`,所有参数通过 Zod schema 验证
- 使用 pnpm 作为包管理器

**无违反**: 完全符合 TypeScript 技术栈要求。

---

### Principle III: 清晰的代码注释

**合规状态**: ✅ PASS (设计阶段,实施时强制执行)

**计划**:
- 所有 MCP Tool 定义必须包含 JSDoc 注释(从 contracts/ JSON Schema 生成)
- 所有 Handler 函数必须注释参数、返回值和异常处理
- 错误处理函数 (`error-handler.ts`) 必须注释错误分类逻辑
- 注释使用中文(符合项目要求)

**实施提醒**: tasks.md 将包含"添加 JSDoc 注释"作为独立任务。

---

### Principle IV: 清晰的代码结构

**合规状态**: ✅ PASS

**已遵循**:
- 采用清晰的模块化结构:
  ```
  src/
  ├── tools/      # MCP Tool 定义(schema)
  ├── handlers/   # 业务逻辑(调用 SDK)
  ├── config/     # 配置管理
  ├── utils/      # 工具函数(error-handler, validator, logger)
  └── types/      # 共享类型定义
  ```
- 文件命名使用 kebab-case (`stock-quote.handler.ts`)
- 遵循单一职责原则:Tool 定义与执行逻辑分离
- 目录结构与宪法推荐的结构对齐(`models/` → `tools/`, `services/` → `handlers/`)

**无违反**: 结构设计符合宪法要求。

---

### Principle V: 完整的测试覆盖

**合规状态**: ✅ PASS

**测试策略**:
- **单元测试**: 覆盖所有 Handlers、Utils、Config 模块 (目标覆盖率 ≥ 80%)
- **集成测试**: 测试完整的 MCP 工具调用流程 (`tests/integration/mcp-server.test.ts`)
- **契约测试**: 使用 contracts/ JSON Schema 验证工具输入输出
- 测试框架: vitest (符合宪法推荐)
- 测试命名: 遵循 `describe('模块', () => { it('应该...', () => {}) })` 格式

**测试用例计划**:
- Handler 单元测试: 每个工具 3-5 个测试用例(成功、失败、边界条件)
- 错误处理测试: 覆盖所有 ErrorCode 分类
- 参数验证测试: 测试所有 Zod schema 验证规则
- 集成测试: 模拟 stdio 传输,测试端到端工具调用

**无违反**: 测试覆盖计划完整。

---

## Technology Stack Compliance

**已遵循宪法规定的技术栈**:
- ✅ 语言: TypeScript 5.3+
- ✅ 运行时: Node.js 18+ LTS
- ✅ 包管理: pnpm
- ✅ 测试框架: vitest
- ✅ 代码检查: ESLint + Prettier (项目现有配置)
- ✅ 构建工具: rslib (项目现有工具链)

**新增依赖(需审查)**:
- `@modelcontextprotocol/sdk`: MCP 官方 SDK(核心功能依赖,必需)
- `zod`: 参数验证(宪法未禁止,广泛使用的类型安全库,批准)

**无违反**: 所有技术选型符合宪法要求。

---

## Code Quality Standards Compliance

**CI/CD 检查(将在实施阶段配置)**:
- ✅ 类型检查: `pnpm type-check` (使用 tsc --noEmit)
- ✅ 代码检查: `pnpm lint` (使用项目现有 ESLint 配置)
- ✅ 格式检查: Prettier (项目现有配置)
- ✅ 测试执行: `pnpm test` (vitest)
- ✅ 测试覆盖率: 目标 ≥ 80%

**性能标准**:
- ✅ API 响应时间: 目标 <5秒 (P95),符合宪法 <200ms 要求的金融数据查询场景调整
- ✅ 单元测试执行: 预计 <5秒
- ✅ 内存使用: 目标 <200MB (空闲状态)

**Note**: API 响应时间目标为 5 秒是因为依赖外部 Tushare API,本地逻辑处理将保持 <200ms。

---

## Final Assessment

**总体合规状态**: ✅ **PASS** - 设计完全符合 Tushare SDK Constitution v1.0.0

**无需豁免的违反项**: 0

**关键遵循点**:
1. Test-First Development: 设计中已明确测试优先策略
2. TypeScript 严格模式: 类型系统完整定义
3. 清晰注释: 已纳入实施计划
4. 清晰结构: 模块化设计符合单一职责原则
5. 测试覆盖: 单元测试 + 集成测试 + 契约测试完整覆盖

**Phase 1 Re-check**: ✅ 设计阶段完成后再次验证,无新增违反项。

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
apps/tushare-mcp/
├── src/
│   ├── index.ts              # MCP 服务器入口点
│   ├── server.ts             # MCP Server 初始化和配置
│   ├── tools/                # MCP Tools 定义
│   │   ├── stock-quote.ts    # 股票行情查询工具
│   │   ├── financial.ts      # 财务数据查询工具
│   │   ├── kline.ts          # K线数据查询工具
│   │   └── index-data.ts     # 市场指数查询工具
│   ├── handlers/             # Tool 执行处理器
│   │   ├── stock-quote.handler.ts
│   │   ├── financial.handler.ts
│   │   ├── kline.handler.ts
│   │   └── index-data.handler.ts
│   ├── config/               # 配置管理
│   │   └── config.ts         # 环境变量和配置加载
│   ├── utils/                # 工具函数
│   │   ├── error-handler.ts  # 错误处理和转换
│   │   ├── validator.ts      # 参数验证
│   │   └── logger.ts         # 日志记录
│   └── types/                # TypeScript 类型定义
│       └── mcp-tools.types.ts
├── tests/
│   ├── unit/                 # 单元测试
│   │   ├── handlers/
│   │   ├── utils/
│   │   └── tools/
│   └── integration/          # 集成测试
│       └── mcp-server.test.ts
├── package.json
├── tsconfig.json
├── rslib.config.ts           # 构建配置
├── .env.example              # 环境变量示例
└── README.md
```

**Structure Decision**: 采用单一应用结构(Option 1),因为这是一个独立的 MCP 服务器应用。遵循项目现有的 `apps/` 目录结构,与 `apps/node-demo` 和 `apps/docs` 并列。核心逻辑按职责分层:
- `tools/`: MCP Tool 定义(schema 和描述)
- `handlers/`: Tool 执行逻辑(调用 SDK)
- `config/`, `utils/`, `types/`: 支撑模块

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

N/A - 无复杂性违反项。该功能遵循项目现有架构和技术选型,不引入额外复杂性。
