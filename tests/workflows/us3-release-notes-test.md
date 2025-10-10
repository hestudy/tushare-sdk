# US3 测试: 发布通知与记录

**用户故事**: 发布完成后自动创建 GitHub Release 记录,包含变更日志

**测试状态**: ✅ GREEN (Workflow 已实现)

---

## 测试场景 1: 基于 Conventional Commits 的变更日志

**目标**: 验证符合规范的 commits 生成正确的变更日志

**前置条件**: 创建符合 conventional commits 格式的提交

```bash
# 创建符合规范的 commits
git commit -m "feat: add new API endpoint for stock data"
git commit -m "fix: resolve memory leak in client connection"
git commit -m "docs: update README with new examples"
git commit -m "chore: bump dependencies to latest versions"
git commit -m "test: add unit tests for data parser"
```

**执行步骤**:
```bash
git tag v1.1.0
git push origin v1.1.0
```

**验证点**:

### GitHub Release 创建
- [ ] Release 自动创建
- [ ] Release name: `Release v1.1.0`
- [ ] Release tag: `v1.1.0`
- [ ] Prerelease 标记为 false

### 变更日志格式
- [ ] 变更日志包含在 Release body 中
- [ ] Commits 按类型分组:
  - [ ] `## Features` 包含 feat commits
  - [ ] `## Bug Fixes` 包含 fix commits
  - [ ] `## Documentation` 包含 docs commits
  - [ ] `## Tests` 包含 test commits
  - [ ] `## Chores` 包含 chore commits
- [ ] 每个 commit 格式: `- commit message (commit_sha)`
- [ ] 包含 Full Changelog 链接

### 示例格式
```markdown
## What's Changed

### Features
- add new API endpoint for stock data (abc123)

### Bug Fixes
- resolve memory leak in client connection (def456)

### Documentation
- update README with new examples (ghi789)

### Tests
- add unit tests for data parser (jkl012)

### Chores
- bump dependencies to latest versions (mno345)

**Full Changelog**: https://github.com/owner/repo/compare/v1.0.0...v1.1.0
```

---

## 测试场景 2: 不符合规范的 Commits

**目标**: 验证不符合 conventional commits 的处理

**前置条件**: 创建不符合规范的提交

```bash
git commit -m "random commit message"
git commit -m "WIP: work in progress"
git commit -m "update stuff"
```

**执行步骤**:
```bash
git tag v1.2.0
git push origin v1.2.0
```

**验证点**:
- [ ] 变更日志仍然生成
- [ ] 不符合规范的 commits 包含在 `## Other Changes` 分组
- [ ] 或者在 Release 中添加格式警告
- [ ] 所有 commits 都被记录 (不遗漏)

---

## 测试场景 3: 混合格式的 Commits

**目标**: 验证混合符合和不符合规范的 commits

**前置条件**:
```bash
git commit -m "feat: add new feature"
git commit -m "random update"
git commit -m "fix: resolve bug"
```

**执行步骤**:
```bash
git tag v1.3.0
git push origin v1.3.0
```

**验证点**:
- [ ] 符合规范的 commits 按类型分组
- [ ] 不符合规范的 commits 在单独分组
- [ ] 变更日志完整

---

## 测试场景 4: 首次发布 (无上一个标签)

**目标**: 验证首次发布时的变更日志生成

**前置条件**: 删除所有标签,模拟首次发布

**执行步骤**:
```bash
git tag v0.1.0
git push origin v0.1.0
```

**验证点**:
- [ ] 变更日志包含所有历史 commits
- [ ] 或者包含最近 N 个 commits
- [ ] 不包含 "Full Changelog" 链接 (因为没有上一个版本)

---

## 测试场景 5: 预发布版本的 Release

**目标**: 验证预发布版本的 prerelease 标记

**执行步骤**:
```bash
git tag v1.4.0-beta.1
git push origin v1.4.0-beta.1
```

**验证点**:
- [ ] GitHub Release 创建成功
- [ ] Prerelease 标记为 true
- [ ] Release 在 GitHub Releases 页面标记为 "Pre-release"
- [ ] 变更日志正常生成

---

## 测试场景 6: 多个版本的 Full Changelog 链接

**目标**: 验证 Full Changelog 链接正确

**前置条件**: 已发布 `v1.0.0`

**执行步骤**:
```bash
git tag v1.1.0
git push origin v1.1.0
```

**验证点**:
- [ ] Full Changelog 链接格式: `https://github.com/owner/repo/compare/v1.0.0...v1.1.0`
- [ ] 链接可访问
- [ ] 显示正确的 commit 差异

---

## 测试场景 7: Release 创建失败不影响 npm 发布

**目标**: 验证 Release 创建失败时的错误处理

**前置条件**: 模拟 Release 创建失败 (如 GITHUB_TOKEN 权限不足)

**验证点**:
- [ ] npm 包仍然成功发布
- [ ] Release job 失败但不影响 Publish job
- [ ] 错误日志清晰
- [ ] 提示手动创建 Release

---

## Conventional Commits 验证逻辑测试

### 支持的 Commit 类型

| Commit 类型 | 示例 | 分组名称 | 验证 |
|------------|------|---------|------|
| `feat:` | `feat: add feature` | Features | [ ] |
| `fix:` | `fix: resolve bug` | Bug Fixes | [ ] |
| `docs:` | `docs: update README` | Documentation | [ ] |
| `style:` | `style: format code` | Styles | [ ] |
| `refactor:` | `refactor: improve code` | Refactoring | [ ] |
| `test:` | `test: add tests` | Tests | [ ] |
| `chore:` | `chore: update deps` | Chores | [ ] |
| `perf:` | `perf: optimize query` | Performance | [ ] |
| `ci:` | `ci: update workflow` | CI/CD | [ ] |
| `build:` | `build: update config` | Build | [ ] |

### 不支持的格式

| Commit 消息 | 处理方式 | 验证 |
|------------|---------|------|
| `random message` | Other Changes | [ ] |
| `WIP: work in progress` | Other Changes | [ ] |
| `FEAT: add feature` (大写) | 转为小写处理 | [ ] |

---

## 日志输出测试

### 必需的日志信息

- [ ] Release URL 输出
- [ ] 变更日志内容预览
- [ ] Prerelease 标记状态
- [ ] 上一个版本标签
- [ ] Commit 数量

---

## 性能测试

### Create Release Job 执行时间

**目标**: < 2 分钟

**测量**:
- 获取上一个标签: _______ 秒
- 生成 commit 列表: _______ 秒
- 格式化变更日志: _______ 秒
- 创建 Release: _______ 秒
- **总时间**: _______ 秒 (目标 < 120s)

---

## GitHub Release 页面验证

### Release 列表
- [ ] Release 在列表中可见
- [ ] 版本号正确显示
- [ ] Prerelease 标记正确
- [ ] 发布时间正确

### Release 详情
- [ ] Release 标题正确
- [ ] 变更日志格式正确
- [ ] 标签链接正确
- [ ] 可以下载源代码 (自动生成)

---

## 与 npm 发布的集成测试

**目标**: 验证 Release 创建依赖 Publish 成功

**测试步骤**:
1. 模拟 Publish job 失败
2. 验证 Create Release job 不执行

**验证点**:
- [ ] Release job 被跳过
- [ ] 日志显示依赖未满足

---

## 清理

```bash
# 删除测试标签
git tag -d v1.1.0
git push origin :v1.1.0

# 删除 GitHub Release (手动在网页上删除)
# 访问: https://github.com/owner/repo/releases
# 点击 Release 右侧的 "Delete" 按钮

# Deprecate npm 包
npm deprecate @hestudy/tushare-sdk@1.1.0 "Test version"
```

---

## 用户体验验证

### 维护者视角
- [ ] Release 创建通知邮件收到
- [ ] Release 页面易于访问
- [ ] 变更日志易于阅读
- [ ] 可以编辑 Release 添加额外信息

### 用户视角
- [ ] 在 GitHub Releases 页面可以看到新版本
- [ ] 变更日志帮助理解新版本的变化
- [ ] 可以下载源代码
- [ ] Prerelease 标记清晰

---

## 测试结果

**日期**: _______________  
**测试人**: _______________  
**状态**: ✅ PASS / ❌ FAIL  
**备注**: _______________
