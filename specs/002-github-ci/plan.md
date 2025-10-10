# Implementation Plan: GitHub CI 自动化发布

**Branch**: `002-github-ci` | **Date**: 2025-10-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-github-ci/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

实现基于 GitHub Actions 的自动化 npm 发布流程。当维护者推送版本标签（如 v1.0.0）时，系统自动触发完整的 CI 流程（lint、type-check、build、test），并在所有检查通过后将包发布到 npm。支持稳定版本和预发布版本的自动识别，基于 conventional commits 生成变更日志并创建 GitHub Release。

**用户输入补充**: 仅在推送标签时进行 npm 发布，发布的版本号与推送的标签一致。

## Technical Context

**Language/Version**: YAML (GitHub Actions workflow), Node.js 18+  
**Primary Dependencies**: GitHub Actions (actions/checkout@v4, actions/setup-node@v4, pnpm/action-setup@v2, actions/create-release@v1), npm CLI, GitHub Release Notes (原生)  
**Storage**: N/A (无状态 CI 流程)  
**Testing**: 现有测试框架 (Vitest, ESLint, TypeScript)  
**Target Platform**: GitHub Actions (ubuntu-latest runner)
**Project Type**: CI/CD workflow (monorepo 支持)  
**Performance Goals**: 发布流程 < 5 分钟，测试执行 < 3 分钟  
**Constraints**: 必须在所有测试通过后才能发布，版本号由标签自动同步到 package.json  
**Scale/Scope**: 支持 monorepo 中多个包的批量发布，支持稳定版和预发布版，自动推断 dist-tag

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. Test-First Development
**Status**: PASS  
**Rationale**: Workflow 的正确性通过集成测试验证，遵循 TDD 流程：
- **Red Phase**: 为每个用户故事编写测试（验证 workflow 触发、发布流程、错误处理等）
- **Green Phase**: 实现 workflow 配置使测试通过
- **Refactor Phase**: 优化 workflow 步骤和错误消息
- 测试使用测试仓库或 GitHub Actions 本地运行工具（如 act）执行
- 现有的代码测试套件（lint、type-check、test）在 workflow 中强制执行，确保只有通过测试的代码才能发布

### ✅ II. TypeScript 技术栈
**Status**: PASS  
**Rationale**: 本功能是 GitHub Actions workflow (YAML)，不涉及 TypeScript 代码。被发布的包已遵循 TypeScript 技术栈要求。

### ✅ III. 清晰的代码注释
**Status**: PASS  
**Rationale**: GitHub Actions workflow 将包含清晰的步骤名称和注释，说明每个步骤的目的。

### ✅ IV. 清晰的代码结构
**Status**: PASS  
**Rationale**: workflow 文件将按逻辑分组（trigger、test、publish、release），每个 job 和 step 职责单一。

### ✅ V. 完整的测试覆盖
**Status**: PASS  
**Rationale**: 发布前强制执行完整的测试套件（lint、type-check、build、test），确保只有通过测试的代码才能发布。

**总结**: 所有宪法原则均符合。本功能作为 CI/CD 基础设施，通过强制执行测试来保障代码质量，与宪法精神一致。

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
# CI/CD Workflow Structure
.github/
└── workflows/
    ├── ci.yml              # 现有 CI workflow (测试和构建)
    └── publish.yml         # 新增发布 workflow (本功能)

# Monorepo Structure (现有)
packages/
└── tushare-sdk/
    ├── src/
    ├── tests/
    ├── dist/               # 构建产物
    └── package.json        # 包含版本号和发布配置

# 发布相关配置
package.json                # root package.json (monorepo 脚本)
pnpm-workspace.yaml         # workspace 配置
```

**Structure Decision**: 本功能新增 `.github/workflows/publish.yml` 文件，复用现有的 monorepo 结构和构建流程。发布 workflow 将调用现有的 pnpm 脚本（build、test 等）。

## Complexity Tracking

*No violations detected. This section is intentionally left empty.*

---

## Phase 1 Post-Design Constitution Re-check

**Re-evaluation Date**: 2025-10-10

### ✅ I. Test-First Development
**Status**: PASS  
**Post-Design Rationale**: 
- Workflow 的正确性通过集成测试验证，tasks.md 中包含完整的测试任务（T007-T008, T009, T019-T020, T021, T026-T027, T028, T035, T046-T048）
- 每个用户故事遵循 Red-Green-Refactor 循环
- Workflow 在发布前强制执行完整测试套件（lint、type-check、build、test），任何测试失败都会中止发布
- 这确保了只有通过测试的代码才能发布到 npm

### ✅ II. TypeScript 技术栈
**Status**: PASS  
**Post-Design Rationale**: Workflow 配置使用 YAML，不涉及 TypeScript 代码。被发布的包已遵循 TypeScript 技术栈要求，workflow 仅负责自动化发布流程。

### ✅ III. 清晰的代码注释
**Status**: PASS  
**Post-Design Rationale**: Workflow 文件将包含清晰的步骤名称和注释（参见 contracts/workflow-contract.md），每个步骤的目的和输入输出都有明确说明。

### ✅ IV. 清晰的代码结构
**Status**: PASS  
**Post-Design Rationale**: Workflow 按逻辑分为 3 个独立的 jobs（Test & Build、Publish、Create Release），每个 job 职责单一，步骤清晰。契约文档详细定义了每个步骤的输入输出。

### ✅ V. 完整的测试覆盖
**Status**: PASS  
**Post-Design Rationale**: 发布前强制执行测试覆盖率检查（≥ 80%），确保代码质量。Workflow 本身的正确性将通过实际执行和回归测试验证（参见 contracts/workflow-contract.md 的测试契约）。

**总结**: Phase 1 设计完成后，所有宪法原则仍然符合。设计文档（data-model.md、contracts/、quickstart.md）提供了清晰的实现指导，确保实现阶段能够遵循宪法要求。

---

## Phase 2 Ready

**Status**: ✅ 设计阶段完成

**产出文档**:
- ✅ `plan.md`: 实现计划（本文件）
- ✅ `research.md`: 技术研究和选型决策
- ✅ `data-model.md`: 核心实体和状态定义
- ✅ `contracts/workflow-contract.md`: Workflow 输入输出契约
- ✅ `quickstart.md`: 快速开始指南

**下一步**: 执行 `/speckit.tasks` 生成任务清单，然后执行 `/speckit.implement` 开始实现。

**注意**: 根据用户偏好，建议先执行 `/speckit.checklist` 生成并通过规范清单，确保设计文档完整无误后再进入实现阶段。
