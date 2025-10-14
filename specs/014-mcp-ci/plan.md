# Implementation Plan: MCP 服务 CI 发包工作流

**Branch**: `014-mcp-ci` | **Date**: 2025-10-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/014-mcp-ci/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

本功能旨在为 MCP 服务(@hestudy/tushare-mcp)建立独立的自动化 CI 发包流程。通过 Git 标签推送自动触发,执行质量检查、构建、测试、npm 发布和 GitHub Release 创建的完整流程。关键技术点包括:基于标签关键字识别目标包(sdk vs mcp)、并发控制避免重复发布、版本一致性验证、dist-tag 自动推断以及 npm provenance 来源证明。

## Technical Context

**Language/Version**: YAML (GitHub Actions workflow 语法), Bash (脚本), Node.js 20.x
**Primary Dependencies**: GitHub Actions (actions/checkout@v4, actions/setup-node@v4, pnpm/action-setup@v2, actions/create-release@v1), pnpm 8.x (包管理), npm CLI (版本检查和发布)
**Storage**: N/A (无状态 CI 流程)
**Testing**: 依赖现有 MCP 项目的测试框架(vitest)、现有 lint/type-check/build 命令
**Target Platform**: GitHub Actions (ubuntu-latest runner)
**Project Type**: CI/CD 工作流(无源代码结构)
**Performance Goals**: 完整发布流程耗时 < 15 分钟,质量检查步骤 < 10 分钟
**Constraints**: 必须支持并发控制(同标签排队,不同标签并行)、必须验证版本一致性和冲突检测、必须支持 npm provenance
**Scale/Scope**: 单个工作流文件,约 3 个 job(test-and-build, publish, create-release),支持 sdk 和 mcp 两个包的独立发布

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Test-First Development ✅
**Status**: COMPLIANT - 本功能是 CI/CD 工作流配置,不涉及业务逻辑代码实现。CI 工作流本身会执行测试(test-and-build job),确保只有通过测试的代码才能发布。

### II. TypeScript 技术栈 ✅
**Status**: COMPLIANT - 虽然 CI 工作流本身使用 YAML 和 Bash,但它依赖和验证的 MCP 项目使用 TypeScript 5.6+ 和 Node.js 18+,符合技术栈要求。工作流会执行 type-check 确保类型安全。

### III. 清晰的代码注释 ✅
**Status**: COMPLIANT - CI 工作流文件将包含清晰的注释,说明每个 job 和 step 的目的。每个关键步骤都有描述性的 name 字段,并在必要时添加 echo 输出解释操作意图。

### IV. 清晰的代码结构 ⚠️
**Status**: COMPLIANT WITH NOTES - CI 工作流遵循单一职责原则,分为 3 个独立 job(test-and-build, publish, create-release)。但需要注意:
- 现有的 `.github/workflows/publish.yml` 是为 SDK 包设计的
- 本功能需要修改该文件以支持多包发布(通过标签关键字区分 sdk vs mcp)
- 需要确保逻辑清晰,避免两个包的流程相互干扰

### V. 完整的测试覆盖 ✅
**Status**: COMPLIANT - CI 工作流强制执行现有的测试套件(vitest)和覆盖率检查。test-and-build job 必须通过才能进入发布阶段,确保发布的代码有完整测试覆盖。

### 综合评估
**总体状态**: ✅ PASS - 本功能符合所有宪法原则。唯一需要注意的是第 IV 条(清晰的代码结构),需要在实现时确保 SDK 和 MCP 两个包的发布逻辑分离清晰,通过标签关键字或路径检测来决定发布哪个包。

## Project Structure

### Documentation (this feature)

```
specs/014-mcp-ci/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── publish-workflow-schema.yml  # GitHub Actions workflow schema
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

本功能为 CI/CD 工作流配置,不涉及 src/ 或 tests/ 目录的代码变更。主要修改:

```
.github/
└── workflows/
    └── publish.yml      # 修改:从单包发布改为多包发布,支持 sdk 和 mcp

apps/
├── tushare-mcp/         # MCP 服务包(新增发布目标)
│   ├── package.json     # 包含包名、版本、构建脚本
│   ├── dist/            # 构建输出目录(发布到 npm)
│   └── src/             # 源代码(已存在)
└── [其他应用]

packages/
└── tushare-sdk/         # SDK 包(现有发布目标)
    ├── package.json
    ├── dist/
    └── src/
```

**Structure Decision**: 本功能修改现有的 `.github/workflows/publish.yml` 工作流文件,添加标签关键字识别逻辑。通过标签格式(如 `mcp-v1.0.0` 或 `sdk-v1.0.0`)来区分应该发布哪个包。工作流的 3 个 job(test-and-build, publish, create-release)结构保持不变,但每个 job 内部添加包识别和路径选择逻辑。

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**无违规项** - 本功能完全符合宪法要求,无需记录复杂度违规。
