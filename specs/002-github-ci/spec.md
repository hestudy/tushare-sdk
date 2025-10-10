# Feature Specification: GitHub CI 自动化发布

**Feature Branch**: `002-github-ci`  
**Created**: 2025-10-10  
**Status**: Ready for Planning  
**Input**: User description: "配置github ci自动化发布，减少人工发布的操作"

## Clarification Decisions _(recorded)_

以下决策点已在澄清阶段确认:

- **CD-001 (npm 认证机制)**: 使用 NPM_AUTOMATION_TOKEN (granular access token with automation scope),需在 GitHub Secrets 中配置
- **CD-002 (失败通知策略)**: 仅使用 GitHub Actions 日志记录失败,无需额外的邮件/Slack/Issue 通知机制
- **CD-003 (预发布 dist-tag 策略)**: 自动从版本号推断 dist-tag (v1.0.0-beta.1 → @beta, v1.0.0-alpha.1 → @alpha),稳定版使用 @latest
- **CD-004 (Monorepo 发布策略)**: 支持发布所有变更的包,需实现变更检测逻辑(基于 pnpm workspace)
- **CD-005 (Changelog 来源)**: 自动生成变更日志,基于 conventional commits 规范,集成到 GitHub Release 中

## User Scenarios & Testing _(mandatory)_

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - 自动发布稳定版本 (Priority: P1)

当维护者在主分支上创建新的版本标签时,系统应该自动构建、测试并发布包到 npm 仓库,无需手动执行发布命令。

**Why this priority**: 这是核心功能,直接实现了自动化发布的主要价值,消除了手动发布的繁琐步骤和人为错误风险。

**Independent Test**: 可以通过在主分支创建一个测试版本标签(如 v0.0.1-test)来独立测试,验证整个自动发布流程是否正常工作。

**Acceptance Scenarios**:

1. **Given** 代码已合并到主分支且所有测试通过, **When** 维护者创建并推送一个版本标签(如 v1.0.0), **Then** CI 自动触发构建、测试并将包发布到 npm
2. **Given** 发布流程已触发, **When** 任何测试步骤失败, **Then** 发布流程应该中止,不会发布到 npm
3. **Given** 包已成功发布, **When** 查看 npm 仓库, **Then** 新版本应该可见且可安装

---

### User Story 2 - 自动发布预览版本 (Priority: P2)

当维护者在开发分支上创建预发布标签时,系统应该自动发布带有特定标签的预览版本(如 beta、alpha),方便提前测试新功能。

**Why this priority**: 这是重要的补充功能,支持更灵活的发布策略,但不是最基础的需求。

**Independent Test**: 可以通过在开发分支创建一个 beta 标签来独立测试,验证预览版本发布流程。

**Acceptance Scenarios**:

1. **Given** 代码在开发分支上, **When** 维护者创建并推送预发布标签(如 v1.0.0-beta.1), **Then** CI 自动发布带有 beta 标签的版本到 npm
2. **Given** 预览版本已发布, **When** 用户执行 npm install package@beta, **Then** 应该安装预览版本而非稳定版本

---

### User Story 3 - 发布通知与记录 (Priority: P3)

当自动发布完成后,系统应该创建 GitHub Release 记录并通知相关人员,便于追踪版本历史。

**Why this priority**: 这是增强功能,提升可追溯性和团队协作体验,但不影响核心发布流程。

**Independent Test**: 可以在成功发布后检查 GitHub Releases 页面和通知记录来独立验证。

**Acceptance Scenarios**:

1. **Given** 包已成功发布到 npm, **When** 发布流程完成, **Then** GitHub 上应该自动创建对应的 Release 记录
2. **Given** Release 已创建, **When** 查看 Release 内容, **Then** 应该包含版本号、变更日志和发布时间
3. **Given** 发布失败, **When** 流程中止, **Then** 应该在 GitHub Actions 中记录失败原因

### Edge Cases

- 当同时推送多个标签时会发生什么?系统应该为每个标签独立触发发布流程
- 当 npm 仓库暂时不可用时如何处理?系统应该记录错误并允许手动重试
- 当标签名称不符合语义化版本规范时如何处理?系统应该拒绝发布并提示正确格式
- 当包版本号已存在于 npm 时如何处理?系统应该检测冲突并阻止重复发布
- 当 npm 认证令牌过期时如何处理?系统应该明确提示认证失败原因,提醒更新 GitHub Secrets 中的 NPM_AUTOMATION_TOKEN
- 当 monorepo 中多个包同时变更时如何处理?系统应该按依赖顺序发布,确保依赖包先于依赖它的包发布
- 当 commits 不符合 conventional commits 规范时如何处理?系统应该生成基础变更日志并在 Release 中标注格式警告
- 当构建产物缺失或损坏时如何处理?系统应该在发布前验证构建完整性

## Requirements _(mandatory)_

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: 系统必须在检测到版本标签推送时自动触发发布工作流
- **FR-002**: 系统必须在发布前执行完整的测试套件(lint、type-check、build、test)
- **FR-003**: 系统必须验证标签名称符合语义化版本规范(如 v1.0.0、v1.0.0-beta.1)
- **FR-004**: 系统必须在所有测试通过后才能执行发布操作
- **FR-005**: 系统必须使用 NPM_AUTOMATION_TOKEN (granular access token) 进行 npm 认证,令牌存储在 GitHub Secrets 中
- **FR-006**: 系统必须在发布失败时中止流程并记录详细错误信息
- **FR-007**: 系统必须支持发布稳定版本(如 v1.0.0 使用 @latest)和预发布版本(如 v1.0.0-beta.1 使用 @beta),自动推断 dist-tag
- **FR-008**: 系统必须在成功发布后创建 GitHub Release 记录,包含基于 conventional commits 自动生成的变更日志
- **FR-009**: 系统必须防止重复发布已存在的版本号
- **FR-010**: 系统必须记录每次发布的完整日志供审计和调试,失败信息仅记录在 GitHub Actions 日志中
- **FR-011**: 系统必须支持 monorepo 场景,检测变更的包并批量发布(基于 pnpm workspace)
- **FR-012**: 系统必须验证 conventional commits 格式以确保变更日志生成质量

### Key Entities

- **版本标签(Version Tag)**: 代表一个特定的发布版本,包含版本号、类型(稳定版/预发布版)、创建时间、关联的代码提交
- **发布工作流(Release Workflow)**: 代表一次完整的发布流程,包含触发条件、执行步骤、状态(进行中/成功/失败)、执行日志
- **发布记录(Release Record)**: 代表已完成的发布,包含版本号、发布时间、变更日志、发布状态、npm 链接
- **认证凭证(Authentication Credentials)**: 用于访问 npm 仓库的安全凭证,包含令牌、权限范围、过期时间
- **变更日志(Changelog)**: 基于 conventional commits 自动生成的版本变更记录,包含功能、修复、破坏性变更等分类
- **Dist Tag**: npm 包的发布标签,用于区分稳定版(@latest)和预发布版(@beta, @alpha 等)

## Success Criteria _(mandatory)_

<!--
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: 维护者可以在 **5 分钟内**完成从创建标签到包发布到 npm 的全流程（包括排队时间），无需手动干预
  - Workflow 执行时间目标：3.5 分钟（正常情况）
  - Workflow 最大超时：10 分钟
- **SC-002**: 自动发布流程的成功率达到 **95% 以上**
  - 测量方法：计算过去 30 天内所有 workflow 运行的成功率
  - 排除标准：排除因代码测试失败、构建失败导致的失败（这些是预期行为）
  - 包括范围：认证失败、网络问题、workflow 配置错误等
- **SC-003**: 发布失败时，维护者能在 1 分钟内从日志中定位失败原因
- **SC-004**: 减少手动发布操作时间 80% 以上（从平均 15 分钟降至 3 分钟）
- **SC-005**: 100% 的发布都有完整的测试覆盖和审计日志
- **SC-006**: 发布后 2 分钟内在 GitHub Releases 页面可见新版本记录
