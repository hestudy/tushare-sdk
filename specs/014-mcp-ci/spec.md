# Feature Specification: MCP 服务 CI 发包工作流

**Feature Branch**: `014-mcp-ci`
**Created**: 2025-10-14
**Status**: Draft
**Input**: User description: "为mcp服务增加ci发包的工作流"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 自动化 MCP 包发布 (Priority: P1)

作为 MCP 包的维护者,当我在 Git 仓库中创建一个新的版本标签时,CI 系统应该自动验证代码质量、构建包并发布到 npm,无需手动干预。

**Why this priority**: 这是核心功能,实现 MCP 包的自动化发布流程,是整个功能的基础。没有这个功能,其他场景无法实现。

**Independent Test**: 可以通过创建一个测试标签(如 v1.0.0-test.1)并观察 CI 流程是否自动触发、执行所有步骤并成功发布到 npm 来独立验证此功能。

**Acceptance Scenarios**:

1. **Given** 代码已提交到主分支且所有测试通过, **When** 维护者推送一个稳定版本标签(如 v1.2.0), **Then** CI 工作流自动触发并依次执行:代码检查、类型检查、构建、测试、发布到 npm(latest 标签)、创建 GitHub Release
2. **Given** 代码已提交到主分支, **When** 维护者推送一个预发布版本标签(如 v1.2.0-beta.1), **Then** CI 工作流自动触发并发布到 npm 的预发布标签(beta),不影响 latest 标签
3. **Given** CI 工作流正在执行, **When** 任何质量检查步骤(lint/type-check/test)失败, **Then** 工作流立即停止,不执行后续的发布步骤,并通知维护者失败原因

---

### User Story 2 - 版本一致性验证 (Priority: P2)

作为 MCP 包的维护者,当 CI 发布流程执行时,系统应该自动验证 Git 标签版本与 package.json 版本的一致性,避免版本不匹配导致的发布问题。

**Why this priority**: 版本一致性是发布流程的重要保障,但可以在基础发布流程之后独立实现和测试。

**Independent Test**: 可以通过推送一个版本号与 package.json 不一致的标签来测试,验证 CI 是否能检测到不一致并停止发布流程。

**Acceptance Scenarios**:

1. **Given** Git 标签版本为 v1.2.0, **When** CI 执行版本同步步骤, **Then** 系统自动将 apps/tushare-mcp/package.json 中的版本更新为 1.2.0
2. **Given** 版本已同步到 package.json, **When** CI 执行验证步骤, **Then** 系统比对标签版本和 package.json 版本,如果一致则继续,如果不一致则终止流程并报错
3. **Given** npm 上已存在相同版本号的包, **When** CI 尝试发布, **Then** 系统检测到版本冲突并终止发布,提示维护者使用新的版本号

---

### User Story 3 - 发布通知与追踪 (Priority: P3)

作为 MCP 包的维护者和用户,当新版本发布成功后,应该能够通过 GitHub Release 页面查看版本变更日志,并通过 npm 链接快速访问已发布的包。

**Why this priority**: 这是发布流程的辅助功能,提升用户体验和可追踪性,但不影响核心发布功能。

**Independent Test**: 可以在发布成功后访问 GitHub Release 页面和 npm 包页面,验证变更日志是否正确生成、链接是否有效。

**Acceptance Scenarios**:

1. **Given** MCP 包已成功发布到 npm, **When** CI 创建 GitHub Release, **Then** 系统自动生成从上一版本到当前版本的变更日志,包含所有 commit 信息和对比链接
2. **Given** GitHub Release 已创建, **When** 维护者或用户访问 Release 页面, **Then** 可以看到清晰的版本信息、变更日志、npm 包链接和文档链接
3. **Given** 发布流程的任何步骤执行, **When** 步骤完成或失败, **Then** CI 系统在日志中输出清晰的状态通知,包括成功/失败标记、相关链接和错误详情

---

### Edge Cases

- **并发发布冲突**: 当多个版本标签在短时间内推送时,CI 系统应该排队执行发布流程,避免并发冲突(每个标签的发布流程按顺序执行,不同标签并行但不取消进行中的任务)
- **网络故障恢复**: 当 npm 发布步骤因网络问题失败时,维护者应该能够重新触发发布流程(通过重新推送相同标签或手动触发 workflow)
- **首次发布场景**: 当项目首次发布(没有历史标签)时,变更日志应该包含所有历史 commit,并标记为"First Release"
- **预发布标签推断**: 系统应该能够正确识别预发布版本标签中的标识符(alpha/beta/rc/next)并使用对应的 dist-tag 发布
- **构建产物验证**: 发布前必须验证 dist/ 目录存在且包含必要的构建文件,避免发布空包或不完整的包
- **权限不足场景**: 当 NPM_TOKEN 过期或权限不足时,发布应该失败并提供清晰的错误信息,不应该创建 GitHub Release

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: CI 工作流必须能够通过 Git 标签推送自动触发(监听 `v*` 格式的标签)
- **FR-002**: 工作流必须包含独立的质量检查任务,执行代码规范检查(lint)、类型检查(type-check)、构建(build)和测试(test with coverage)
- **FR-003**: 工作流必须验证 Git 标签版本与 package.json 版本的一致性,不一致时终止流程
- **FR-004**: 工作流必须在发布前检查 npm 上是否已存在相同版本,如存在则终止发布
- **FR-005**: 工作流必须能够根据版本号格式自动推断 npm dist-tag(稳定版使用 latest,预发布版提取标识符如 alpha/beta/rc/next)
- **FR-006**: 工作流必须将 MCP 包发布到 npm,并启用 provenance(来源证明)功能
- **FR-007**: 工作流必须在发布成功后创建 GitHub Release,包含自动生成的变更日志(从上一版本到当前版本的所有 commit)
- **FR-008**: 工作流必须实现并发控制,同一标签的发布任务排队执行,避免重复发布
- **FR-009**: 工作流必须在每个关键步骤输出清晰的日志通知,包括版本信息、dist-tag、npm 链接等
- **FR-010**: 工作流必须配置适当的权限声明(contents: write 用于创建 Release,id-token: write 用于 npm provenance)
- **FR-011**: 工作流必须验证构建产物的完整性,确保 dist/ 目录存在且包含必要文件
- **FR-012**: 质量检查任务必须在发布任务之前完成,只有所有检查通过后才能执行发布
- **FR-013**: 工作流必须支持预发布版本和稳定版本的不同发布策略(预发布版本标记为 prerelease)

### Key Entities

- **MCP 包(tushare-mcp)**: MCP 服务包,位于 apps/tushare-mcp 目录,包含 package.json、源代码、测试和构建配置
- **版本标签(Version Tag)**: Git 标签,格式为 `v*`(如 v1.0.0, v1.0.0-beta.1),用于触发 CI 发布流程
- **npm 包发布记录**: 发布到 npm registry 的包版本记录,包含版本号、dist-tag、provenance 信息
- **GitHub Release**: GitHub 上的版本发布记录,包含版本号、变更日志、发布时间和是否为预发布版本的标记
- **CI 工作流配置**: GitHub Actions 工作流文件,定义发布流程的各个任务(test-and-build, publish, create-release)及其依赖关系

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 维护者从推送版本标签到包成功发布到 npm 的完整流程自动化完成,无需任何手动干预,总耗时少于 15 分钟
- **SC-002**: 100% 的发布流程必须通过质量检查(lint/type-check/test),不允许跳过任何检查步骤
- **SC-003**: 每次发布后,GitHub Release 页面自动生成完整的变更日志,包含自上一版本以来的所有 commit 信息
- **SC-004**: 发布流程在遇到错误(如测试失败、版本冲突、网络故障)时能够准确识别并停止流程,错误信息清晰可追踪
- **SC-005**: 预发布版本(alpha/beta/rc)和稳定版本能够正确区分,分别发布到对应的 npm dist-tag,互不影响
- **SC-006**: 所有发布的包必须包含 npm provenance 信息,确保包的来源可验证

## Assumptions

1. **单包发布**: 当前 monorepo 中只需要为 MCP 服务(apps/tushare-mcp)创建独立的发布流程,SDK 包(packages/tushare-sdk)已有现有的发布流程
2. **包注册表**: 使用 npm 官方注册表(https://registry.npmjs.org)发布 MCP 包,包名为 @hestudy/tushare-mcp
3. **Node.js 版本**: 使用 Node.js 20.x LTS 版本执行 CI 任务,与项目开发环境保持一致
4. **pnpm 版本**: 使用 pnpm 8.x 作为包管理器,与项目现有配置保持一致
5. **测试环境变量**: 测试步骤需要 TUSHARE_TOKEN 环境变量(存储在 GitHub Secrets 中)才能执行集成测试
6. **发布权限**: 使用 GitHub Secrets 中的 NPM_AUTOMATION_TOKEN 进行 npm 发布,该 token 具有发布 @hestudy scope 下包的权限
7. **Git 标签格式**: 遵循语义化版本规范,标签格式为 `v<major>.<minor>.<patch>[-<prerelease>]`(如 v1.0.0, v1.0.0-beta.1)
8. **分支策略**: 发布标签应该在主分支(main)上创建,但工作流不限制来源分支(允许从其他分支发布预发布版本)
9. **构建输出**: MCP 包构建后输出到 apps/tushare-mcp/dist/ 目录,该目录是发布到 npm 的主要内容
10. **变更日志格式**: 使用 git log 命令自动生成变更日志,格式为简单的 commit 列表,不使用复杂的变更日志生成工具

## Dependencies

- **GitHub Actions**: 依赖 GitHub Actions 平台提供 CI/CD 能力
- **现有 CI 配置**: 可以参考现有的 SDK 发布流程(.github/workflows/publish.yml)的最佳实践
- **npm Registry**: 依赖 npm 官方注册表的可用性和 API 稳定性
- **GitHub Secrets**: 依赖已配置的 Secrets(NPM_AUTOMATION_TOKEN, TUSHARE_TOKEN)
- **Monorepo 工具**: 依赖 pnpm workspace 功能正确处理本地依赖(@hestudy/tushare-sdk)

## Out of Scope

以下内容不在本功能范围内:

- **自动化版本号管理**: 不包含自动计算下一个版本号或根据 commit 自动创建标签的功能,维护者需要手动创建版本标签
- **多包协同发布**: 不处理 SDK 和 MCP 包同时发布的场景,每个包有独立的发布流程
- **回滚机制**: 不包含发布失败后自动回滚 npm 版本或 GitHub Release 的功能,需要维护者手动处理
- **文档自动更新**: 不包含自动更新 README 或文档站点版本信息的功能
- **发布通知集成**: 不包含发送邮件、Slack 或其他渠道通知的功能,仅在 GitHub Actions 日志中输出通知
- **性能监控**: 不包含发布后的包性能监控或使用情况追踪
- **跨平台发布**: 仅发布到 npm,不包含发布到其他包注册表(如 GitHub Packages)的功能
