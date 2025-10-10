# Workflow Contract: GitHub Actions 发布流程

**Date**: 2025-10-10  
**Feature**: 002-github-ci  
**Purpose**: 定义 GitHub Actions workflow 的输入、输出和行为契约

## Workflow 触发契约

### 输入 (Trigger)

**触发事件**: Push tag

```yaml
on:
  push:
    tags:
      - 'v*'  # 匹配所有以 v 开头的标签
```

**前置条件**:
- 标签名称必须符合 `v{semver}` 格式
- 标签必须指向有效的 commit
- 推送者必须有仓库写权限

**环境变量**:
```yaml
env:
  GITHUB_REF: refs/tags/v1.0.0      # 完整的 ref
  GITHUB_REF_NAME: v1.0.0            # 标签名称
  GITHUB_SHA: abc123def456           # Commit SHA
  GITHUB_ACTOR: maintainer           # 推送者
```

---

## Job: Test & Build

### 输入

**来源**: Checkout 的代码

**环境要求**:
- Node.js: 18.x 或 20.x
- pnpm: 8.x
- OS: ubuntu-latest

### 输出

**成功条件**:
- Lint 通过 (exit code 0)
- Type check 通过 (exit code 0)
- Build 成功 (exit code 0)
- Tests 通过 (exit code 0)
- 测试覆盖率 ≥ 80%

**产物**:
- `packages/tushare-sdk/dist/`: 构建产物
- `packages/tushare-sdk/coverage/`: 测试覆盖率报告

**失败处理**:
- 任何步骤失败 → 中止 workflow
- 记录详细错误日志
- 不执行后续的 publish 步骤

---

## Job: Publish

### 输入

**依赖**: Test & Build job 成功

**环境变量**:
```yaml
env:
  NODE_AUTH_TOKEN: ${{ secrets.NPM_AUTOMATION_TOKEN }}
  NPM_CONFIG_PROVENANCE: true  # 启用 npm provenance
```

**前置条件**:
- `NPM_AUTOMATION_TOKEN` 必须在 GitHub Secrets 中配置
- Token 必须有效且未过期
- Token 必须有目标包的 publish 权限

### 处理步骤

#### 1. 版本同步

**输入**: 
- Tag name: `${{ github.ref_name }}`
- Package.json path: `packages/tushare-sdk/package.json`

**处理逻辑**:
```bash
TAG_VERSION=${GITHUB_REF_NAME#v}  # 去除 v 前缀
cd packages/tushare-sdk
npm version $TAG_VERSION --no-git-tag-version --allow-same-version
```

**输出**:
- 更新后的 `package.json`

**验证**:
```bash
PKG_VERSION=$(node -p "require('./package.json').version")
[ "$TAG_VERSION" = "$PKG_VERSION" ] || exit 1
```

#### 2. Dist-tag 推断

**输入**: Version string (如 `1.0.0-beta.1`)

**处理逻辑**:
```bash
if [[ $TAG_VERSION =~ - ]]; then
  DIST_TAG=$(echo $TAG_VERSION | sed -E 's/.*-([a-z]+).*/\1/')
else
  DIST_TAG="latest"
fi
```

**输出**: Dist-tag string (如 `beta`, `latest`)

**验证**:
- Dist-tag 必须是有效的 npm tag
- 允许的值: `latest`, `alpha`, `beta`, `rc`, `next`

#### 3. 版本冲突检查

**输入**: 
- Package name: `@hestudy/tushare-sdk`
- Version: `$TAG_VERSION`

**处理逻辑**:
```bash
if npm view @hestudy/tushare-sdk@$TAG_VERSION version 2>/dev/null; then
  echo "Error: Version $TAG_VERSION already exists on npm"
  exit 1
fi
```

**输出**: 
- 成功: 继续执行
- 失败: 退出并报错

#### 4. 发布到 npm

**输入**:
- Package directory: `packages/tushare-sdk`
- Dist-tag: `$DIST_TAG`
- Auth token: `$NODE_AUTH_TOKEN`

**处理逻辑**:
```bash
cd packages/tushare-sdk
pnpm publish --tag $DIST_TAG --no-git-checks --access public
```

**输出**:
- 成功: 包发布到 npm
- 失败: 退出并报错

**验证**:
```bash
# 验证包已发布
npm view @hestudy/tushare-sdk@$TAG_VERSION version
```

### 输出

**成功条件**:
- 包成功发布到 npm
- 版本号与标签一致
- Dist-tag 正确设置

**产物**:
- npm 包: `https://www.npmjs.com/package/@hestudy/tushare-sdk/v/{version}`
- Package metadata

**失败处理**:
- 记录详细错误信息
- 区分错误类型（认证失败、版本冲突、网络问题等）
- 提供恢复建议

---

## Job: Create Release

### 输入

**依赖**: Publish job 成功

**环境变量**:
```yaml
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}  # 自动提供
```

### 处理步骤

#### 1. 生成变更日志

**输入**: 
- Tag name: `${{ github.ref_name }}`
- Previous tag: 上一个版本标签

**处理逻辑**:
```bash
# 获取上一个标签
PREVIOUS_TAG=$(git describe --tags --abbrev=0 HEAD^ 2>/dev/null || echo "")

# 生成 commit 列表
if [ -n "$PREVIOUS_TAG" ]; then
  COMMITS=$(git log $PREVIOUS_TAG..HEAD --pretty=format:"- %s (%h)" --no-merges)
else
  COMMITS=$(git log --pretty=format:"- %s (%h)" --no-merges)
fi
```

**输出**: Changelog markdown

**格式**:
```markdown
## What's Changed

- feat: Add new feature (abc123)
- fix: Fix bug in component (def456)
- docs: Update README (ghi789)

**Full Changelog**: https://github.com/owner/repo/compare/v1.0.0...v1.1.0
```

#### 2. 创建 GitHub Release

**输入**:
- Tag name: `${{ github.ref_name }}`
- Release name: `Release ${{ github.ref_name }}`
- Body: Generated changelog
- Prerelease: 根据版本号判断

**处理逻辑**:
```yaml
- name: Create GitHub Release
  uses: actions/create-release@v1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  with:
    tag_name: ${{ github.ref_name }}
    release_name: Release ${{ github.ref_name }}
    body: ${{ steps.changelog.outputs.content }}
    draft: false
    prerelease: ${{ contains(github.ref_name, '-') }}
```

**输出**:
- GitHub Release URL
- Release ID

### 输出

**成功条件**:
- GitHub Release 成功创建
- Release 包含正确的变更日志
- Prerelease 标记正确

**产物**:
- GitHub Release: `https://github.com/owner/repo/releases/tag/{tag}`

---

## 错误处理契约

### 错误类型定义

```typescript
type WorkflowError = 
  | { type: 'test_failure'; step: string; exitCode: number }
  | { type: 'build_failure'; step: string; error: string }
  | { type: 'auth_failure'; message: string }
  | { type: 'version_conflict'; version: string }
  | { type: 'publish_failure'; error: string }
  | { type: 'network_failure'; retryable: boolean };
```

### 错误响应

**Test Failure**:
```yaml
- name: Test
  run: pnpm test:coverage
  continue-on-error: false  # 失败立即中止
  
- name: Report test failure
  if: failure()
  run: |
    echo "::error::Tests failed. Please fix the failing tests and push a new tag."
    exit 1
```

**Auth Failure**:
```yaml
- name: Publish
  run: pnpm publish
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_AUTOMATION_TOKEN }}
  
- name: Report auth failure
  if: failure() && contains(steps.publish.outputs.stderr, 'ENEEDAUTH')
  run: |
    echo "::error::NPM authentication failed. Please update NPM_AUTOMATION_TOKEN in GitHub Secrets."
    exit 1
```

**Version Conflict**:
```yaml
- name: Check version conflict
  run: |
    if npm view @hestudy/tushare-sdk@$VERSION version 2>/dev/null; then
      echo "::error::Version $VERSION already exists on npm. Please use a new version number."
      exit 1
    fi
```

---

## 性能契约

### 执行时间 SLA

| Job | 目标时间 | 最大时间 |
|-----|---------|---------|
| Test & Build | 2 分钟 | 5 分钟 |
| Publish | 1 分钟 | 3 分钟 |
| Create Release | 30 秒 | 2 分钟 |
| **总计** | **3.5 分钟** | **10 分钟** |

### 超时设置

```yaml
jobs:
  test:
    timeout-minutes: 10
    
  publish:
    timeout-minutes: 5
    
  release:
    timeout-minutes: 3
```

---

## 安全契约

### Secrets 使用

**必需的 Secrets**:
- `NPM_AUTOMATION_TOKEN`: npm 发布令牌

**自动提供的 Secrets**:
- `GITHUB_TOKEN`: GitHub API 访问令牌

**Secrets 访问规则**:
- 仅在需要的步骤中暴露
- 不在日志中输出
- 使用 `::add-mask::` 隐藏敏感信息

### 权限声明

```yaml
permissions:
  contents: write    # 创建 GitHub Release
  id-token: write    # npm provenance
```

---

## 并发控制契约

### 并发策略

```yaml
concurrency:
  group: publish-${{ github.ref }}
  cancel-in-progress: false  # 不取消正在进行的发布
```

**规则**:
- 同一标签的多次推送：排队执行，不取消
- 不同标签的推送：并行执行
- 手动取消：允许，但需要手动清理

---

## 可观测性契约

### 日志输出

**必需的日志**:
- 每个步骤的开始和结束时间
- 版本号和 dist-tag
- npm 发布结果
- GitHub Release URL

**日志格式**:
```bash
echo "::group::Step Name"
echo "Detailed logs..."
echo "::endgroup::"

echo "::notice::Package published: https://www.npmjs.com/package/@hestudy/tushare-sdk/v/1.0.0"
```

### 状态报告

**成功**:
```
✅ Published @hestudy/tushare-sdk@1.0.0 with tag 'latest'
📦 npm: https://www.npmjs.com/package/@hestudy/tushare-sdk/v/1.0.0
🎉 Release: https://github.com/owner/repo/releases/tag/v1.0.0
```

**失败**:
```
❌ Publish failed: [error type]
💡 Suggestion: [recovery steps]
📋 Logs: [workflow run URL]
```

---

## 测试契约

### Workflow 测试

**测试场景**:
1. 稳定版本发布 (`v1.0.0`)
2. 预发布版本发布 (`v1.0.0-beta.1`)
3. 版本冲突处理
4. 认证失败处理
5. 测试失败处理

**验证方法**:
- 使用测试仓库和测试 npm 账号
- 推送测试标签并验证结果
- 检查 GitHub Release 和 npm 包

### 回归测试

**触发条件**:
- Workflow 文件修改
- 依赖版本更新
- GitHub Actions runner 更新

**测试清单**:
- [ ] 稳定版本发布成功
- [ ] 预发布版本发布成功
- [ ] Dist-tag 正确推断
- [ ] 版本冲突被正确检测
- [ ] 认证失败有明确提示
- [ ] GitHub Release 正确创建
- [ ] 变更日志格式正确
