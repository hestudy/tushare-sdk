# Quick Start: MCP 服务 CI 发包工作流

**Feature**: 014-mcp-ci
**Date**: 2025-10-14
**Audience**: 维护者

## 概述

本快速指南帮助维护者快速上手多包发布流程,包括如何创建发布标签、触发 CI 流程以及验证发布结果。

---

## 前置条件

在使用本功能之前,请确保:

1. ✅ 你有仓库的推送权限(能够推送标签)
2. ✅ GitHub Secrets 已配置:
   - `NPM_AUTOMATION_TOKEN`: 具有发布 `@hestudy/*` 包的权限
   - `TUSHARE_TOKEN`: 用于运行集成测试
3. ✅ 代码已合并到主分支(或你想要发布的分支)
4. ✅ 所有测试在本地通过(`pnpm test:coverage`)
5. ✅ 代码已通过 lint 和 type-check

---

## 发布流程概览

```
[更新代码] → [创建并推送标签] → [CI 自动执行] → [验证发布] → [完成]
    ↓              ↓                   ↓              ↓
  准备工作      触发 CI            质量检查        检查结果
                                  构建测试
                                  发布 npm
                                  创建 Release
```

---

## 步骤 1: 准备发布

### 1.1 确定版本号

根据语义化版本规范(SemVer)确定新版本号:

- **MAJOR**(主版本): 不兼容的 API 变更 → `1.0.0` → `2.0.0`
- **MINOR**(次版本): 向后兼容的功能新增 → `1.0.0` → `1.1.0`
- **PATCH**(修订版): 向后兼容的 bug 修复 → `1.0.0` → `1.0.1`

**预发布版本**:
- Alpha(内部测试): `1.0.0-alpha.1`
- Beta(公开测试): `1.0.0-beta.1`
- RC(发布候选): `1.0.0-rc.1`
- Next(下一个版本): `1.0.0-next.1`

### 1.2 检查当前版本

```bash
# 查看 SDK 包的当前版本
cat packages/tushare-sdk/package.json | grep version

# 查看 MCP 包的当前版本
cat apps/tushare-mcp/package.json | grep version

# 查看已有的发布标签
git tag -l "sdk-v*"
git tag -l "mcp-v*"
```

### 1.3 本地验证

```bash
# 确保代码是最新的
git pull origin main

# 安装依赖
pnpm install

# 运行完整的质量检查(CI 会执行这些)
pnpm lint
pnpm type-check
pnpm build
pnpm test:coverage
```

如果所有检查都通过,可以继续发布。

---

## 步骤 2: 创建并推送标签

### 2.1 标签格式规范

**重要**: 标签必须遵循以下格式:

```
<package>-v<version>
```

- `<package>`: `sdk` 或 `mcp`
- `<version>`: 语义化版本号(不带 `v` 前缀)

**示例**:
```bash
sdk-v1.2.0         # SDK 包的稳定版本
mcp-v1.0.0         # MCP 包的稳定版本
sdk-v2.0.0-rc.1    # SDK 包的 RC 版本
mcp-v0.5.0-beta.1  # MCP 包的 Beta 版本
```

**错误格式**:
```bash
v1.0.0             # ❌ 缺少包前缀
sdk-1.0.0          # ❌ 缺少 v 前缀
unknown-v1.0.0     # ❌ 未知的包标识符
```

### 2.2 创建标签

**发布 SDK 包**:
```bash
# 稳定版本
git tag sdk-v1.2.0

# 预发布版本
git tag sdk-v1.2.0-beta.1
```

**发布 MCP 包**:
```bash
# 稳定版本
git tag mcp-v1.0.0

# 预发布版本
git tag mcp-v1.0.0-beta.1
```

### 2.3 推送标签

```bash
# 推送单个标签
git push origin sdk-v1.2.0

# 或推送所有标签(谨慎使用)
git push --tags
```

**推送后,CI 工作流会自动触发!**

---

## 步骤 3: 监控 CI 执行

### 3.1 查看工作流状态

1. 访问 GitHub 仓库的 Actions 页面:
   ```
   https://github.com/<owner>/<repo>/actions
   ```

2. 找到刚刚触发的 "Publish to npm" 工作流

3. 点击查看详细日志

### 3.2 工作流阶段说明

CI 会依次执行以下 job:

| Job | 描述 | 预计耗时 | 失败处理 |
|-----|------|---------|---------|
| **Detect Package** | 识别包信息 | < 30s | 快速失败,检查标签格式 |
| **Test and Build** | 质量检查、构建、测试 | 5-10 分钟 | 检查代码错误,修复后重新推送标签 |
| **Publish** | 版本同步、发布到 npm | 2-3 分钟 | 检查版本冲突或权限问题 |
| **Create Release** | 生成变更日志、创建 Release | 1-2 分钟 | 不影响 npm 发布,可手动创建 Release |

### 3.3 常见错误和解决方法

**错误 1: 标签格式不正确**
```
Error: Invalid tag format. Expected: (sdk|mcp)-v*
```
**解决**: 删除错误标签,使用正确格式重新创建
```bash
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0
git tag sdk-v1.0.0
git push origin sdk-v1.0.0
```

**错误 2: 测试失败**
```
Error: npm test exited with code 1
```
**解决**: 修复测试错误,提交代码,重新推送标签

**错误 3: 版本冲突**
```
Error: Version 1.0.0 already exists on npm
```
**解决**: 使用新的版本号创建标签
```bash
git tag -d sdk-v1.0.0
git tag sdk-v1.0.1
git push origin sdk-v1.0.1
```

**错误 4: npm 权限不足**
```
Error: 403 Forbidden - PUT https://registry.npmjs.org/@hestudy/tushare-mcp
```
**解决**: 检查 GitHub Secret `NPM_AUTOMATION_TOKEN` 是否有效且有权限发布该包

---

## 步骤 4: 验证发布结果

### 4.1 检查 npm 包

**稳定版本**:
```bash
# 检查最新版本
npm view @hestudy/tushare-sdk version
npm view @hestudy/tushare-mcp version

# 检查 latest 标签
npm view @hestudy/tushare-sdk dist-tags
npm view @hestudy/tushare-mcp dist-tags
```

**预发布版本**:
```bash
# 检查特定版本
npm view @hestudy/tushare-sdk@1.0.0-beta.1

# 检查 beta 标签
npm view @hestudy/tushare-sdk dist-tags.beta
```

### 4.2 检查 GitHub Release

1. 访问仓库的 Releases 页面:
   ```
   https://github.com/<owner>/<repo>/releases
   ```

2. 验证新的 Release 已创建,包含:
   - ✅ 正确的标签名(如 `sdk-v1.2.0`)
   - ✅ 自动生成的变更日志
   - ✅ npm 包链接
   - ✅ 预发布标记(如果是预发布版本)

### 4.3 测试安装包

**稳定版本**:
```bash
# 创建测试目录
mkdir test-install && cd test-install
npm init -y

# 安装包
npm install @hestudy/tushare-sdk
npm install @hestudy/tushare-mcp

# 检查版本
npm list @hestudy/tushare-sdk
npm list @hestudy/tushare-mcp
```

**预发布版本**:
```bash
# 安装特定的预发布版本
npm install @hestudy/tushare-sdk@beta
npm install @hestudy/tushare-mcp@1.0.0-beta.1
```

---

## 常见场景示例

### 场景 1: 发布 SDK 的稳定版本

```bash
# 1. 确认代码已合并到 main
git checkout main
git pull origin main

# 2. 本地验证
pnpm test:coverage

# 3. 创建并推送标签
git tag sdk-v1.2.0
git push origin sdk-v1.2.0

# 4. 监控 CI
# 访问 https://github.com/<owner>/<repo>/actions

# 5. 验证发布
npm view @hestudy/tushare-sdk version
# 预期输出: 1.2.0
```

### 场景 2: 发布 MCP 的 Beta 版本

```bash
# 1. 确认代码已合并到 main
git checkout main
git pull origin main

# 2. 本地验证
pnpm test:coverage

# 3. 创建并推送标签
git tag mcp-v1.0.0-beta.1
git push origin mcp-v1.0.0-beta.1

# 4. 监控 CI
# 访问 https://github.com/<owner>/<repo>/actions

# 5. 验证发布
npm view @hestudy/tushare-mcp@beta version
# 预期输出: 1.0.0-beta.1

npm view @hestudy/tushare-mcp dist-tags
# 预期输出: { latest: 'x.x.x', beta: '1.0.0-beta.1' }
```

### 场景 3: 首次发布 MCP 包

```bash
# 1. 确认代码已合并到 main
git checkout main
git pull origin main

# 2. 本地验证
pnpm test:coverage

# 3. 创建并推送标签(建议从 v1.0.0 开始)
git tag mcp-v1.0.0
git push origin mcp-v1.0.0

# 4. 监控 CI
# 变更日志会显示 "First Release 🎉"

# 5. 验证发布
npm view @hestudy/tushare-mcp
```

### 场景 4: 同时发布 SDK 和 MCP(独立版本)

```bash
# 1. 确认代码已合并到 main
git checkout main
git pull origin main

# 2. 本地验证
pnpm test:coverage

# 3. 创建并推送两个标签
git tag sdk-v1.2.0
git tag mcp-v1.0.0
git push origin sdk-v1.2.0 mcp-v1.0.0

# 4. 监控 CI
# 两个工作流会并行执行(不同的 concurrency group)

# 5. 验证发布
npm view @hestudy/tushare-sdk version
npm view @hestudy/tushare-mcp version
```

---

## 回滚发布(紧急情况)

如果发布后发现严重问题,按以下步骤回滚:

### npm 包回滚

```bash
# 弃用有问题的版本(不删除,保持历史记录)
npm deprecate @hestudy/tushare-sdk@1.2.0 "Critical bug, please use 1.2.1"

# 发布修复版本
git tag sdk-v1.2.1
git push origin sdk-v1.2.1
```

**注意**: npm 不支持删除已发布的包(除非发布后 72 小时内且没有人下载)

### GitHub Release 回滚

```bash
# 删除 Release(通过 GitHub Web UI 或 gh CLI)
gh release delete sdk-v1.2.0

# 删除标签
git tag -d sdk-v1.2.0
git push origin :refs/tags/sdk-v1.2.0
```

---

## 最佳实践

### ✅ 推荐做法

1. **渐进式发布**: 先发布预发布版本(beta/rc),测试后再发布稳定版
2. **语义化版本**: 严格遵循 SemVer,避免破坏性变更出现在 MINOR/PATCH 版本
3. **变更日志**: 在推送标签前,确保 commit message 清晰描述变更
4. **测试覆盖**: 保持测试覆盖率 ≥ 80%,避免发布未测试的代码
5. **监控 CI**: 推送标签后立即查看 CI 执行情况,及时发现问题

### ❌ 避免做法

1. **跳过测试**: 不要在本地测试未通过的情况下推送标签
2. **重复版本号**: 不要删除标签后使用相同版本号重新发布(会导致混淆)
3. **并发相同包**: 不要在一个版本发布完成前推送同一个包的另一个版本标签
4. **忽略错误**: 不要忽略 CI 失败通知,必须修复后才能重试

---

## 故障排查清单

如果发布失败,按以下清单逐项检查:

- [ ] 标签格式是否正确(`(sdk|mcp)-v*`)
- [ ] 标签版本号是否遵循 SemVer
- [ ] 本地测试是否全部通过
- [ ] GitHub Secrets 是否配置正确
- [ ] NPM_AUTOMATION_TOKEN 是否有权限发布该包
- [ ] npm 上是否已存在相同版本号
- [ ] 网络是否稳定(npm 发布可能受网络影响)
- [ ] GitHub Actions runner 是否正常(检查 GitHub Status)

---

## 获取帮助

如果遇到问题:

1. 查看 CI 日志中的错误信息
2. 参考本文档的"常见错误和解决方法"部分
3. 查看 GitHub Actions 的详细日志
4. 检查 npm 包状态: `npm view <package-name>`
5. 联系仓库维护者或提交 Issue

---

## 相关文档

- [功能规格说明](./spec.md)
- [实现计划](./plan.md)
- [研究文档](./research.md)
- [数据模型](./data-model.md)
- [工作流契约](./contracts/publish-workflow-schema.yml)
- [语义化版本规范](https://semver.org/lang/zh-CN/)
- [npm 发布最佳实践](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
