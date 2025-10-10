---
description: "GitHub CI 自动化发布任务清单"
---

# Tasks: GitHub CI 自动化发布

**Input**: Design documents from `/specs/002-github-ci/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/workflow-contract.md, quickstart.md

**Tests**: 本功能为 CI/CD workflow，不包含单元测试任务。Workflow 的正确性通过实际执行验证。

**Organization**: 任务按用户故事组织，每个故事可独立实现和测试。

## Format: `[ID] [P?] [Story] Description`
- **[P]**: 可并行执行（不同文件，无依赖）
- **[Story]**: 所属用户故事（US1, US2, US3）
- 包含准确的文件路径

## Path Conventions
- Workflow 文件: `.github/workflows/`
- 包配置: `packages/tushare-sdk/package.json`
- 文档: `docs/`

---

## Phase 1: Setup (共享基础设施)

**Purpose**: 项目初始化和基础配置

- [ ] T001 验证现有 CI workflow 配置 `.github/workflows/ci.yml`
- [ ] T002 验证 monorepo 结构和 pnpm workspace 配置
- [ ] T003 验证现有测试套件（lint、type-check、build、test）可正常运行

---

## Phase 2: Foundational (阻塞性前置条件)

**Purpose**: 核心基础设施，必须在任何用户故事开始前完成

**⚠️ CRITICAL**: 所有用户故事工作必须等待此阶段完成

- [ ] T004 配置 npm 认证机制：在 GitHub Secrets 中添加 `NPM_AUTOMATION_TOKEN`
- [ ] T005 验证 npm token 权限（Granular Access Token with automation scope）
- [ ] T006 配置 package.json 发布设置（publishConfig, files, access）

**Checkpoint**: 基础设施就绪 - 用户故事实现可以开始

---

## Phase 3: User Story 1 - 自动发布稳定版本 (Priority: P1) 🎯 MVP

**Goal**: 当维护者推送版本标签时，自动构建、测试并发布稳定版本到 npm

**Independent Test**: 在主分支创建测试标签（如 v0.0.1-test），验证完整的自动发布流程

### Implementation for User Story 1

- [ ] T007 [US1] 创建发布 workflow 文件 `.github/workflows/publish.yml`
- [ ] T008 [US1] 配置 workflow 触发条件（push tags: v*）
- [ ] T009 [US1] 实现 Job 1: Test & Build
  - Checkout 代码
  - Setup Node.js 和 pnpm
  - 安装依赖
  - 执行 lint、type-check、build、test
  - 验证测试覆盖率 ≥ 80%
- [ ] T010 [US1] 实现 Job 2: Publish（依赖 Test & Build 成功）
  - 从标签提取版本号（去除 v 前缀）
  - 同步版本号到 package.json
  - 验证版本号一致性
  - 检查版本冲突（npm view）
  - 发布到 npm（使用 latest tag）
- [ ] T011 [US1] 实现错误处理逻辑
  - 测试失败：中止发布，输出错误提示
  - 认证失败：明确提示更新 NPM_AUTOMATION_TOKEN
  - 版本冲突：提示使用新版本号
- [ ] T012 [US1] 配置 workflow 权限（contents: write, id-token: write）
- [ ] T013 [US1] 配置并发控制（同一标签排队，不同标签并行）
- [ ] T014 [US1] 添加详细日志输出（版本号、发布状态、npm URL）
- [ ] T015 [US1] 配置超时设置（Test & Build: 10min, Publish: 5min）

**Checkpoint**: 此时用户故事 1 应完全可用，可独立测试稳定版本发布流程

---

## Phase 4: User Story 2 - 自动发布预览版本 (Priority: P2)

**Goal**: 支持发布带有特定标签的预览版本（beta、alpha、rc），自动推断 dist-tag

**Independent Test**: 在开发分支创建 beta 标签（如 v1.0.0-beta.1），验证预览版本发布流程

### Implementation for User Story 2

- [ ] T016 [US2] 在 Publish job 中实现 dist-tag 自动推断逻辑
  - 检测版本号是否包含 `-`
  - 提取预发布标识符（alpha, beta, rc, next）
  - 稳定版本使用 `latest` tag
- [ ] T017 [US2] 更新发布命令支持动态 dist-tag
  - `pnpm publish --tag $DIST_TAG --no-git-checks --access public`
- [ ] T018 [US2] 添加 dist-tag 验证逻辑
  - 验证 dist-tag 为有效值（latest, alpha, beta, rc, next）
  - 处理边界情况（无标识符默认为 next）
- [ ] T019 [US2] 更新日志输出显示 dist-tag 信息
- [ ] T020 [US2] 添加预发布版本测试场景到文档

**Checkpoint**: 此时用户故事 1 和 2 都应独立可用，支持稳定版和预发布版

---

## Phase 5: User Story 3 - 发布通知与记录 (Priority: P3)

**Goal**: 发布完成后自动创建 GitHub Release 记录，包含变更日志

**Independent Test**: 成功发布后检查 GitHub Releases 页面和 Release 内容

### Implementation for User Story 3

- [ ] T021 [US3] 实现 Job 3: Create Release（依赖 Publish 成功）
  - Setup 环境
  - 获取上一个版本标签
  - 生成 commit 列表（自上次发布以来）
- [ ] T022 [US3] 实现变更日志生成逻辑
  - 基于 git log 提取 commits
  - 格式化为 Markdown
  - 添加 Full Changelog 链接
- [ ] T023 [US3] 实现 GitHub Release 创建
  - 使用 `actions/create-release@v1` 或 GitHub CLI
  - 设置 release name: `Release ${{ github.ref_name }}`
  - 设置 body: 生成的变更日志
  - 根据版本号设置 prerelease 标记
- [ ] T024 [US3] 添加 Release 创建成功的日志输出（Release URL）
- [ ] T025 [US3] 配置 Release job 超时（3min）
- [ ] T026 [US3] 处理 Release 创建失败场景（不影响 npm 发布结果）

**Checkpoint**: 所有用户故事应独立可用，完整的发布流程包含测试、发布和 Release 创建

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 跨用户故事的改进和优化

- [ ] T027 [P] 优化 workflow 性能：启用 pnpm 缓存
- [ ] T028 [P] 添加 workflow 状态徽章到 README.md
- [ ] T029 [P] 更新项目文档：添加发布流程说明到 docs/api.md
- [ ] T030 验证 quickstart.md 中的所有步骤可正常执行
- [ ] T031 添加 workflow 注释说明每个步骤的目的
- [ ] T032 验证所有错误场景的提示信息清晰明确
- [ ] T033 测试完整的发布流程（稳定版 + 预发布版 + Release）
- [ ] T034 [P] 添加 npm provenance 配置（NPM_CONFIG_PROVENANCE: true）
- [ ] T035 验证 monorepo 场景下的发布流程

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 可立即开始
- **Foundational (Phase 2)**: 依赖 Setup 完成 - 阻塞所有用户故事
- **User Stories (Phase 3-5)**: 都依赖 Foundational 完成
  - 用户故事可按优先级顺序执行（P1 → P2 → P3）
  - 或并行执行（如果有多人协作）
- **Polish (Phase 6)**: 依赖所有期望的用户故事完成

### User Story Dependencies

- **User Story 1 (P1)**: 可在 Foundational 完成后开始 - 无其他故事依赖
- **User Story 2 (P2)**: 可在 Foundational 完成后开始 - 扩展 US1 的发布逻辑
- **User Story 3 (P3)**: 可在 Foundational 完成后开始 - 依赖 US1 的发布成功

### Within Each User Story

- US1: 按任务顺序执行（T007 → T015）
- US2: 在 US1 的 Publish job 基础上扩展（T016 → T020）
- US3: 独立的 Release job（T021 → T026）

### Parallel Opportunities

- Phase 1 的所有验证任务可并行
- Phase 6 中标记 [P] 的任务可并行
- 如果多人协作，US1、US2、US3 可在 Foundational 完成后并行开发

---

## Parallel Example: Phase 6 Polish Tasks

```bash
# 同时执行以下任务:
Task: "优化 workflow 性能：启用 pnpm 缓存"
Task: "添加 workflow 状态徽章到 README.md"
Task: "更新项目文档：添加发布流程说明到 docs/api.md"
Task: "添加 npm provenance 配置"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup（验证现有配置）
2. Complete Phase 2: Foundational（配置 npm 认证）
3. Complete Phase 3: User Story 1（实现稳定版本自动发布）
4. **STOP and VALIDATE**: 推送测试标签验证 US1 独立工作
5. 如果就绪，可以开始使用自动发布功能

### Incremental Delivery

1. Complete Setup + Foundational → 基础就绪
2. Add User Story 1 → 独立测试 → 部署/演示（MVP！）
3. Add User Story 2 → 独立测试 → 部署/演示（支持预发布版）
4. Add User Story 3 → 独立测试 → 部署/演示（完整功能）
5. 每个故事都增加价值，不破坏已有功能

### Parallel Team Strategy

如果有多人协作:

1. 团队共同完成 Setup + Foundational
2. Foundational 完成后:
   - Developer A: User Story 1（核心发布流程）
   - Developer B: User Story 2（dist-tag 推断）
   - Developer C: User Story 3（GitHub Release）
3. 各故事独立完成并集成

---

## Notes

- [P] 任务 = 不同文件，无依赖，可并行
- [Story] 标签将任务映射到特定用户故事，便于追溯
- 每个用户故事应可独立完成和测试
- 在每个 checkpoint 停下来独立验证故事
- Workflow 的正确性通过实际执行验证，而非单元测试
- 提交策略：每完成一个任务或逻辑组提交一次
- 避免：模糊的任务、同文件冲突、破坏故事独立性的跨故事依赖

---

## Success Metrics

完成所有任务后，应达到以下目标:

- ✅ 维护者可在 5 分钟内完成从创建标签到包发布的全流程
- ✅ 自动发布流程成功率 ≥ 95%
- ✅ 发布失败时可在 1 分钟内从日志定位原因
- ✅ 减少手动发布操作时间 80% 以上
- ✅ 100% 的发布都有完整的测试覆盖和审计日志
- ✅ 发布后 2 分钟内在 GitHub Releases 可见新版本记录
