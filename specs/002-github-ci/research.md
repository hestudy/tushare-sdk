# Research: GitHub CI 自动化发布

**Date**: 2025-10-10  
**Feature**: 002-github-ci  
**Purpose**: 解决实现计划中的技术选型和最佳实践问题

## 研究任务

### 1. Changelog 生成工具选型

**问题**: 需要选择合适的工具基于 conventional commits 自动生成变更日志

**研究结果**:

#### 候选方案

1. **conventional-changelog-cli**
   - 成熟的 conventional commits 工具
   - 支持多种 preset (angular, atom, ember 等)
   - 可生成 CHANGELOG.md 文件
   - 需要额外安装依赖

2. **GitHub Release Notes (原生)**
   - GitHub Actions 原生支持 `actions/create-release`
   - 可自动从 commits 生成 release notes
   - 无需额外依赖
   - 格式相对简单

3. **semantic-release**
   - 全自动版本管理和发布
   - 自动确定版本号、生成 changelog、创建 release
   - 功能强大但复杂度高
   - 可能与现有手动版本管理冲突

4. **changesets**
   - 专为 monorepo 设计
   - 需要手动编写 changeset 文件
   - 不符合"自动生成"需求

#### 决策

**选择**: GitHub Release Notes (原生) + 可选的 conventional-changelog-cli

**理由**:
- **简单性**: GitHub 原生支持，无需额外依赖，符合"减少复杂度"原则
- **灵活性**: 可以先使用原生方案，后续如需更丰富的格式再引入 conventional-changelog-cli
- **兼容性**: 不干扰现有的版本管理流程（版本号由标签决定）
- **monorepo 友好**: 可以为每个包单独生成 release notes

**实现方式**:
```yaml
- name: Create GitHub Release
  uses: actions/create-release@v1
  with:
    tag_name: ${{ github.ref }}
    release_name: Release ${{ github.ref }}
    body: |
      Auto-generated release notes from commits.
    draft: false
    prerelease: ${{ contains(github.ref, '-') }}
```

**备选方案**: 如果需要更详细的 changelog 格式，可以在后续迭代中引入 `conventional-changelog-cli`

---

### 2. NPM 认证最佳实践

**问题**: 确认 NPM_AUTOMATION_TOKEN 的配置和使用方式

**研究结果**:

#### NPM Token 类型

1. **Classic Token** (已过时)
   - 全局权限
   - 不推荐使用

2. **Granular Access Token** (推荐)
   - 细粒度权限控制
   - 可限制包范围和操作类型
   - 支持 automation 类型（无 2FA 要求）

#### 最佳实践

**Token 配置**:
- 类型: Granular Access Token
- 权限: Automation (适用于 CI/CD)
- 范围: 限制到特定包或组织
- 过期时间: 建议 90 天或更短，定期轮换

**GitHub Secrets 配置**:
```bash
# 在 GitHub repo settings -> Secrets and variables -> Actions
# 添加 secret: NPM_AUTOMATION_TOKEN
# 值: npm_xxx (从 npmjs.com 生成)
```

**Workflow 使用**:
```yaml
- name: Setup .npmrc
  run: |
    echo "//registry.npmjs.org/:_authToken=${{ secrets.NPM_AUTOMATION_TOKEN }}" > ~/.npmrc
    
- name: Publish to npm
  run: pnpm publish --no-git-checks
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_AUTOMATION_TOKEN }}
```

**安全建议**:
- 使用 environment protection rules 限制发布权限
- 启用 required reviewers for deployments
- 定期审计 token 使用情况
- 设置 token 过期提醒

---

### 3. 版本号与标签一致性验证

**问题**: 如何确保推送的标签与 package.json 中的版本号一致

**研究结果**:

#### 验证策略

**方案 1: 严格验证** (推荐)
```yaml
- name: Verify version match
  run: |
    TAG_VERSION=${GITHUB_REF#refs/tags/v}
    PKG_VERSION=$(node -p "require('./packages/tushare-sdk/package.json').version")
    if [ "$TAG_VERSION" != "$PKG_VERSION" ]; then
      echo "Error: Tag version ($TAG_VERSION) does not match package.json version ($PKG_VERSION)"
      exit 1
    fi
```

**方案 2: 自动同步**
```yaml
- name: Update package.json version
  run: |
    TAG_VERSION=${GITHUB_REF#refs/tags/v}
    cd packages/tushare-sdk
    npm version $TAG_VERSION --no-git-tag-version
```

**方案 3: 仅警告**
```yaml
- name: Check version match
  run: |
    # 仅输出警告，不阻止发布
    TAG_VERSION=${GITHUB_REF#refs/tags/v}
    PKG_VERSION=$(node -p "require('./packages/tushare-sdk/package.json').version")
    if [ "$TAG_VERSION" != "$PKG_VERSION" ]; then
      echo "Warning: Version mismatch detected"
    fi
```

#### 决策

**选择**: 方案 2 (自动同步) + 验证

**理由**:
- **用户友好**: 用户输入明确要求"发布的版本号与推送的标签一致"，意味着标签是真实来源
- **减少错误**: 避免因忘记更新 package.json 导致的发布失败
- **工作流简化**: 用户只需创建标签，无需手动修改 package.json
- **可追溯**: 发布后自动提交 package.json 更新（可选）

**实现方式**:
```yaml
- name: Sync version from tag
  run: |
    TAG_VERSION=${GITHUB_REF#refs/tags/v}
    echo "Syncing version to $TAG_VERSION"
    cd packages/tushare-sdk
    npm version $TAG_VERSION --no-git-tag-version --allow-same-version
    
- name: Verify version
  run: |
    TAG_VERSION=${GITHUB_REF#refs/tags/v}
    PKG_VERSION=$(node -p "require('./packages/tushare-sdk/package.json').version")
    echo "Tag: $TAG_VERSION, Package: $PKG_VERSION"
    [ "$TAG_VERSION" = "$PKG_VERSION" ] || exit 1
```

---

### 4. Dist-tag 自动推断逻辑

**问题**: 如何从版本号自动推断 npm dist-tag

**研究结果**:

#### Dist-tag 规则

**语义化版本规范**:
- `v1.0.0` → stable → `@latest`
- `v1.0.0-alpha.1` → prerelease → `@alpha`
- `v1.0.0-beta.1` → prerelease → `@beta`
- `v1.0.0-rc.1` → prerelease → `@rc`
- `v1.0.0-next.1` → prerelease → `@next`

#### 实现逻辑

```bash
# 提取 prerelease 标识
TAG_VERSION=${GITHUB_REF#refs/tags/v}

if [[ $TAG_VERSION =~ - ]]; then
  # 包含 - 说明是预发布版本
  PRERELEASE_TAG=$(echo $TAG_VERSION | sed -E 's/.*-([a-z]+).*/\1/')
  DIST_TAG=$PRERELEASE_TAG
else
  # 稳定版本
  DIST_TAG="latest"
fi

echo "Publishing with dist-tag: $DIST_TAG"
pnpm publish --tag $DIST_TAG
```

#### 边界情况

- `v1.0.0-1` (无标识符) → 默认为 `@next`
- `v1.0.0-alpha` (无版本号) → `@alpha`
- `v1.0.0-ALPHA.1` (大写) → 转为小写 `@alpha`

#### 决策

**选择**: 基于正则表达式的自动推断

**理由**:
- **符合规范**: 遵循 semver 和 npm 最佳实践
- **自动化**: 无需手动指定 dist-tag
- **灵活性**: 支持多种预发布类型

---

### 5. Monorepo 变更检测

**问题**: 如何检测 monorepo 中哪些包发生了变更

**研究结果**:

#### 检测策略

**方案 1: 基于 git diff**
```bash
# 检测自上次发布以来的变更
CHANGED_PACKAGES=$(git diff --name-only HEAD~1 HEAD | grep "^packages/" | cut -d/ -f2 | sort -u)
```

**方案 2: 使用 pnpm 内置功能**
```bash
# pnpm 支持 --filter 参数
pnpm --filter "...[HEAD~1]" publish
```

**方案 3: 使用 changesets**
- 需要手动维护 changeset 文件
- 不符合自动化需求

**方案 4: 发布所有包**
```bash
# 简单粗暴，适用于包数量少的场景
pnpm -r publish
```

#### 决策

**选择**: 方案 4 (发布所有包) + 版本检查

**理由**:
- **简单性**: 当前只有一个包 (`tushare-sdk`)，无需复杂的变更检测
- **可扩展**: 未来如有多个包，npm 会自动跳过版本号未变更的包
- **可靠性**: 避免变更检测逻辑错误导致的遗漏

**实现方式**:
```yaml
- name: Publish packages
  run: |
    cd packages/tushare-sdk
    pnpm publish --tag $DIST_TAG --no-git-checks
```

**未来优化**: 当包数量增加时，可以引入基于 git diff 或 pnpm filter 的变更检测

---

### 6. GitHub Actions 最佳实践

**问题**: 确保 workflow 的可靠性和安全性

**研究结果**:

#### 安全最佳实践

1. **最小权限原则**
```yaml
permissions:
  contents: write  # 创建 release
  packages: write  # 发布包
```

2. **环境保护**
```yaml
environment:
  name: production
  url: https://www.npmjs.com/package/@hestudy/tushare-sdk
```

3. **Secret 管理**
- 使用 GitHub Secrets 存储敏感信息
- 避免在日志中暴露 token
- 定期轮换 secrets

#### 可靠性最佳实践

1. **幂等性**
- 检查版本是否已存在
- 使用 `npm publish --dry-run` 预检查

2. **错误处理**
```yaml
- name: Publish
  id: publish
  continue-on-error: false
  run: pnpm publish
  
- name: Rollback on failure
  if: failure() && steps.publish.outcome == 'failure'
  run: echo "Publish failed, manual intervention required"
```

3. **并发控制**
```yaml
concurrency:
  group: publish-${{ github.ref }}
  cancel-in-progress: false  # 不取消正在进行的发布
```

#### 性能优化

1. **缓存依赖**
```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'pnpm'
```

2. **并行执行**
- 测试和构建可以并行
- 发布必须串行

3. **条件执行**
```yaml
if: startsWith(github.ref, 'refs/tags/v')
```

---

## 技术栈总结

### 核心技术

| 组件 | 技术选择 | 版本 |
|------|---------|------|
| CI/CD 平台 | GitHub Actions | N/A |
| 包管理器 | pnpm | 8.x |
| Node.js | Node.js | 18.x, 20.x |
| Changelog | GitHub Release Notes | 原生 |
| 认证 | NPM Automation Token | Granular Access |

### 关键依赖

- `actions/checkout@v4`: 代码检出
- `actions/setup-node@v4`: Node.js 环境
- `pnpm/action-setup@v2`: pnpm 安装
- `actions/create-release@v1`: 创建 GitHub Release

### 配置要求

**GitHub Secrets**:
- `NPM_AUTOMATION_TOKEN`: npm 发布令牌

**GitHub Settings**:
- Branch protection rules (可选)
- Environment protection rules (推荐)

---

## 风险与缓解

### 风险 1: Token 过期

**缓解措施**:
- 设置 token 过期提醒
- 文档化 token 更新流程
- 在 workflow 中添加认证失败的明确提示

### 风险 2: 版本冲突

**缓解措施**:
- 发布前检查版本是否已存在
- 使用 `npm publish --dry-run` 预检查
- 提供清晰的错误信息

### 风险 3: 测试失败导致无法发布

**缓解措施**:
- 在本地充分测试后再推送标签
- 提供手动重试机制
- 保留详细的失败日志

### 风险 4: 网络问题

**缓解措施**:
- 使用 GitHub Actions 的重试机制
- 设置合理的超时时间
- 提供手动发布的备用方案

---

## 下一步

Phase 1 将基于以上研究结果生成:
1. **data-model.md**: 定义发布流程的核心实体和状态
2. **contracts/**: 定义 workflow 的输入输出契约
3. **quickstart.md**: 提供快速开始指南
