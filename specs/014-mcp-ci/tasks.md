# Tasks: MCP 服务 CI 发包工作流

**Input**: Design documents from `/specs/014-mcp-ci/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md
**Generated**: 2025-10-14

**Tests**: 本功能为 CI/CD 工作流配置,不需要编写传统的单元测试。CI 工作流本身会执行项目的测试套件来验证发布质量。

**Organization**: 任务按用户故事组织,确保每个故事可以独立实现和验证。

## Format: `[ID] [P?] [Story] Description`
- **[P]**: 可并行执行(不同文件,无依赖)
- **[Story]**: 任务所属的用户故事(US1, US2, US3)
- 包含准确的文件路径

## Path Conventions
本功能主要修改 CI/CD 工作流配置:
- **.github/workflows/**: GitHub Actions 工作流文件
- **packages/tushare-sdk/**: SDK 包目录
- **apps/tushare-mcp/**: MCP 包目录

---

## Phase 1: Setup (共享基础设施)

**Purpose**: 检查现有工作流配置和包结构

- [X] T001 检查现有的 `.github/workflows/publish.yml` 文件,了解当前 SDK 发布流程
- [X] T002 验证 `packages/tushare-sdk/package.json` 和 `apps/tushare-mcp/package.json` 配置
- [X] T003 [P] 验证 GitHub Secrets 配置(NPM_AUTOMATION_TOKEN, TUSHARE_TOKEN)

---

## Phase 2: Foundational (阻塞性前置条件)

**Purpose**: 工作流的核心结构必须在任何用户故事之前完成

**⚠️ CRITICAL**: 在此阶段完成前,无法开始任何用户故事的工作

- [X] T004 在 `.github/workflows/publish.yml` 中添加包识别逻辑,支持标签前缀解析(sdk-v* vs mcp-v*)
- [X] T005 修改 workflow 触发器,支持 `(sdk|mcp)-v*` 标签格式
- [X] T006 创建 detect-package job,输出 package_id, package_name, package_path, version 变量
- [X] T007 实现标签格式验证逻辑,确保标签符合 `^(sdk|mcp)-v\d+\.\d+\.\d+(-.+)?$` 正则
- [X] T008 配置工作流权限声明(contents: write, id-token: write)

**Checkpoint**: 工作流基础结构就绪 - 可以开始实现各个用户故事

---

## Phase 3: User Story 1 - 自动化 MCP 包发布 (Priority: P1) 🎯 MVP

**Goal**: 实现 MCP 包的自动化发布流程,通过标签推送触发 CI 系统验证、构建和发布到 npm

**Independent Test**: 创建测试标签 `mcp-v1.0.0-test.1`,观察 CI 是否自动触发并成功执行所有步骤(lint, type-check, build, test, publish)

### Implementation for User Story 1

- [X] T009 [US1] 修改 test-and-build job,使其支持多包构建验证(保持 workspace 级别命令)
- [X] T010 [US1] 在 test-and-build job 中添加构建产物验证步骤,检查 `${{ package_path }}/dist` 目录存在
- [X] T011 [US1] 创建 publish job,接收 detect-package 的输出变量
- [X] T012 [US1] 在 publish job 中实现版本同步逻辑,将标签版本写入 `package.json`
- [X] T013 [US1] 实现 dist-tag 推断逻辑(稳定版→latest,预发布版→提取标识符)
- [X] T014 [US1] 添加 npm 发布步骤,使用 `pnpm publish --tag $DIST_TAG --no-git-checks --access public`
- [X] T015 [US1] 配置 npm 发布的环境变量(NODE_AUTH_TOKEN, NPM_CONFIG_PROVENANCE=true)
- [X] T016 [US1] 添加发布验证步骤,确认包已成功发布到 npm
- [X] T017 [US1] 添加发布通知输出,包含 npm 包链接和版本信息

**Checkpoint**: 此时应该可以通过推送 `mcp-v*` 标签自动触发完整的发布流程并成功发布到 npm

---

## Phase 4: User Story 2 - 版本一致性验证 (Priority: P2)

**Goal**: 自动验证 Git 标签版本与 package.json 版本的一致性,防止版本不匹配

**Independent Test**: 推送版本号与 package.json 不一致的标签,验证 CI 是否检测到不一致并停止发布

### Implementation for User Story 2

- [X] T018 [US2] 在 publish job 的版本同步步骤后添加版本一致性验证逻辑
- [X] T019 [US2] 实现版本一致性检查,对比标签版本和 package.json 中的版本
- [X] T020 [US2] 添加版本冲突检测步骤,使用 `npm view` 检查 npm 上是否已存在相同版本
- [X] T021 [US2] 配置错误处理,版本不一致或冲突时终止流程并输出清晰错误信息
- [X] T022 [US2] 添加错误通知,提示维护者使用正确的版本号

**Checkpoint**: 版本验证逻辑完整,可以防止版本冲突和不一致的发布

---

## Phase 5: User Story 3 - 发布通知与追踪 (Priority: P3)

**Goal**: 发布成功后自动创建 GitHub Release,包含变更日志和 npm 包链接

**Independent Test**: 发布成功后访问 GitHub Release 页面,验证变更日志是否正确生成,链接是否有效

### Implementation for User Story 3

- [X] T023 [US3] 创建 create-release job,依赖 publish job 成功完成
- [X] T024 [US3] 实现获取同包上一个标签的逻辑(使用 `git tag -l "${PACKAGE_ID}-v*" --sort=-version:refname`)
- [X] T025 [US3] 实现变更日志生成逻辑,使用 `git log` 获取从上一版本到当前版本的所有 commits
- [X] T026 [US3] 处理首次发布场景,检测无历史标签时显示 "First Release 🎉"
- [X] T027 [US3] 实现 prerelease 标记判断逻辑(版本号包含 `-` 则标记为预发布)
- [X] T028 [US3] 使用 `actions/create-release@v1` 创建 GitHub Release
- [X] T029 [US3] 配置 Release 内容,包含标签名、变更日志、prerelease 标记
- [X] T030 [US3] 在 Release 描述中添加 npm 包链接和文档链接
- [X] T031 [US3] 配置 create-release job 的错误处理(失败不影响整体成功)

**Checkpoint**: 发布流程完整,包含自动化的 GitHub Release 创建和变更日志生成

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 改进和完善发布流程

- [X] T032 [P] 配置并发控制策略(`concurrency: group: publish-${{ github.ref }}, cancel-in-progress: false`)
- [X] T033 [P] 添加工作流日志输出,每个关键步骤输出清晰的状态通知
- [X] T034 [P] 优化错误消息,确保各种失败场景都有清晰的错误提示
- [X] T035 [P] 在工作流文件中添加注释,说明每个 job 和 step 的目的
- [X] T036 [P] 更新项目文档,说明如何使用新的标签格式发布 SDK 和 MCP 包
- [X] T037 验证 quickstart.md 中的所有场景(稳定版、预发布版、首次发布、并发发布)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 可立即开始
- **Foundational (Phase 2)**: 依赖 Setup 完成 - 阻塞所有用户故事
- **User Stories (Phase 3-5)**: 所有依赖 Foundational phase 完成
  - 用户故事可以并行实现(如果有多个开发者)
  - 或按优先级顺序实现(P1 → P2 → P3)
- **Polish (Phase 6)**: 依赖所有用户故事完成

### User Story Dependencies

- **User Story 1 (P1)**: 可在 Foundational (Phase 2) 后开始 - 无其他故事依赖
- **User Story 2 (P2)**: 可在 Foundational (Phase 2) 后开始 - 扩展 US1 的 publish job,但可独立测试
- **User Story 3 (P3)**: 可在 Foundational (Phase 2) 后开始 - 依赖 US1 的 publish job 成功,但逻辑独立

### Within Each User Story

- User Story 1: T009→T010 可并行, T011 依赖 T009-T010, T012-T017 顺序执行
- User Story 2: T018-T022 顺序执行(都在同一个 job 内)
- User Story 3: T023-T031 顺序执行(都在同一个 job 内)

### Parallel Opportunities

- Phase 1: T001, T002, T003 可并行执行(不同检查项)
- Phase 2: T004-T006 顺序执行, T007-T008 可与 T006 并行
- Phase 3: T009 和 T010 可并行(不同 job 的不同步骤)
- Phase 6: T032-T036 可并行执行(不同文件和配置)

---

## Parallel Example: User Story 1

```bash
# Phase 2 完成后,可以开始 User Story 1:

# 并行任务(不同步骤,无依赖):
Task T009: "修改 test-and-build job,使其支持多包构建验证"
Task T010: "在 test-and-build job 中添加构建产物验证步骤"

# 然后顺序执行 publish job 的各个步骤:
Task T011: "创建 publish job,接收 detect-package 的输出变量"
Task T012: "在 publish job 中实现版本同步逻辑"
Task T013: "实现 dist-tag 推断逻辑"
Task T014: "添加 npm 发布步骤"
Task T015: "配置 npm 发布的环境变量"
Task T016: "添加发布验证步骤"
Task T017: "添加发布通知输出"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. 完成 Phase 1: Setup (验证现有配置)
2. 完成 Phase 2: Foundational (创建多包工作流基础结构) - **CRITICAL**
3. 完成 Phase 3: User Story 1 (实现基本发布流程)
4. **STOP and VALIDATE**: 推送测试标签验证发布流程
5. 如果成功,可以投入使用

### Incremental Delivery

1. 完成 Setup + Foundational → 工作流基础就绪
2. 添加 User Story 1 → 测试发布流程 → 投入使用(MVP!)
3. 添加 User Story 2 → 测试版本验证 → 部署
4. 添加 User Story 3 → 测试 Release 创建 → 部署
5. 每个故事都增加价值,不破坏之前的功能

### Sequential Strategy (单人开发)

对于本功能,建议按顺序实现:

1. Phase 1 → Phase 2(基础结构)
2. Phase 3(核心发布流程)→ 测试验证
3. Phase 4(版本验证)→ 测试验证
4. Phase 5(Release 创建)→ 测试验证
5. Phase 6(完善和文档)

---

## Edge Cases Covered

本任务清单覆盖了以下边缘情况(来自 spec.md):

- **并发发布冲突**: T032 配置并发控制,同标签排队,不同标签并行
- **网络故障恢复**: T021-T022 错误处理,允许重新推送标签重试
- **首次发布场景**: T026 处理无历史标签的情况,显示 "First Release"
- **预发布标签推断**: T013 实现 dist-tag 自动推断逻辑
- **构建产物验证**: T010 验证 dist/ 目录存在
- **权限不足场景**: T021-T022 清晰的错误信息,NPM_TOKEN 权限不足时提示

---

## Validation Checklist

完成所有任务后,验证以下场景:

- [ ] 推送 `sdk-v1.0.0` 标签,验证 SDK 包成功发布
- [ ] 推送 `mcp-v1.0.0` 标签,验证 MCP 包成功发布
- [ ] 推送 `mcp-v1.0.0-beta.1` 标签,验证预发布版本正确标记
- [ ] 推送错误格式标签(如 `v1.0.0`),验证快速失败并提示
- [ ] 推送已存在版本的标签,验证冲突检测生效
- [ ] 同时推送 `sdk-v1.1.0` 和 `mcp-v1.1.0`,验证并行执行
- [ ] 验证 GitHub Release 自动创建,包含正确的变更日志
- [ ] 验证首次发布显示 "First Release" 标记
- [ ] 验证 npm 包包含 provenance 信息

---

## Notes

- [P] 任务 = 不同文件或独立配置,无依赖,可并行
- [Story] 标签映射任务到特定用户故事,便于追踪
- 本功能为 CI/CD 工作流,主要修改 `.github/workflows/publish.yml` 文件
- 每个用户故事应该可以独立完成和测试
- 在每个 Checkpoint 停下来验证功能独立性
- 提交建议:每完成一个任务或一组相关任务就提交
- 避免:模糊任务、同文件冲突、破坏故事独立性的跨故事依赖

---

## Summary

- **总任务数**: 37 个任务
- **User Story 1 任务数**: 9 个任务(T009-T017) - 核心发布流程
- **User Story 2 任务数**: 5 个任务(T018-T022) - 版本验证
- **User Story 3 任务数**: 9 个任务(T023-T031) - Release 创建
- **并行机会**: Phase 1(3 个), Phase 6(5 个),以及各 User Story 内部的部分任务
- **MVP 范围**: Phase 1 + Phase 2 + User Story 1(共 19 个任务)

**预计工作量**:
- MVP(US1): 约 4-6 小时
- 完整实现(US1+US2+US3): 约 8-12 小时
- 包含测试验证和文档: 约 12-16 小时
