# Quick Start: GitHub CI 自动化发布

**Date**: 2025-10-10  
**Feature**: 002-github-ci  
**Audience**: 项目维护者

## 概述

本指南帮助你快速配置和使用 GitHub Actions 自动化发布流程。

---

## 前置准备

### 1. 获取 npm Token

1. 登录 [npmjs.com](https://www.npmjs.com)
2. 进入 **Account Settings** → **Access Tokens**
3. 点击 **Generate New Token** → **Granular Access Token**
4. 配置 token:
   - **Token name**: `github-actions-tushare-sdk`
   - **Expiration**: 90 days (推荐)
   - **Packages and scopes**: 
     - Permissions: `Read and write`
     - Packages: `@hestudy/tushare-sdk`
   - **Organizations**: 选择你的组织（如果有）
5. 点击 **Generate Token**
6. **重要**: 复制并保存 token（格式: `npm_xxx...`）

### 2. 配置 GitHub Secrets

1. 进入 GitHub 仓库
2. 点击 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**
4. 添加 secret:
   - **Name**: `NPM_AUTOMATION_TOKEN`
   - **Secret**: 粘贴上一步复制的 npm token
5. 点击 **Add secret**

### 3. 验证配置

```bash
# 确保本地代码已推送到 GitHub
git push origin main

# 确保所有测试通过
pnpm test

# 确保构建成功
pnpm build
```

---

## 发布流程

### 稳定版本发布

**场景**: 发布正式版本（如 v1.0.0）

**步骤**:

1. **确保代码在 main 分支且所有测试通过**
   ```bash
   git checkout main
   git pull origin main
   pnpm test
   ```

2. **创建并推送版本标签**
   ```bash
   # 创建标签（版本号必须以 v 开头）
   git tag v1.0.0
   
   # 推送标签到 GitHub
   git push origin v1.0.0
   ```

3. **等待自动发布完成**
   - 进入 GitHub 仓库的 **Actions** 页面
   - 查看 "Publish" workflow 的执行状态
   - 预计耗时: 3-5 分钟

4. **验证发布结果**
   - 检查 [npm 包页面](https://www.npmjs.com/package/@hestudy/tushare-sdk)
   - 检查 [GitHub Releases](https://github.com/your-org/tushare-sdk/releases)
   - 验证安装: `npm install @hestudy/tushare-sdk@1.0.0`

---

### 预发布版本发布

**场景**: 发布测试版本（如 beta、alpha）

**步骤**:

1. **在开发分支创建预发布标签**
   ```bash
   git checkout develop  # 或其他开发分支
   
   # Beta 版本
   git tag v1.1.0-beta.1
   git push origin v1.1.0-beta.1
   
   # Alpha 版本
   git tag v1.1.0-alpha.1
   git push origin v1.1.0-alpha.1
   
   # RC 版本
   git tag v1.1.0-rc.1
   git push origin v1.1.0-rc.1
   ```

2. **验证 dist-tag**
   - Beta 版本会发布到 `@beta` tag
   - Alpha 版本会发布到 `@alpha` tag
   - RC 版本会发布到 `@rc` tag

3. **用户安装预发布版本**
   ```bash
   npm install @hestudy/tushare-sdk@beta
   npm install @hestudy/tushare-sdk@alpha
   npm install @hestudy/tushare-sdk@rc
   ```

---

## 版本号规范

### 语义化版本 (Semver)

遵循 `MAJOR.MINOR.PATCH[-PRERELEASE]` 格式:

- **MAJOR**: 不兼容的 API 变更
- **MINOR**: 向后兼容的功能新增
- **PATCH**: 向后兼容的 bug 修复
- **PRERELEASE**: 预发布标识符（可选）

### 示例

| 版本号 | 类型 | Dist-tag | 说明 |
|--------|------|----------|------|
| `v1.0.0` | 稳定版 | `latest` | 正式发布 |
| `v1.1.0` | 稳定版 | `latest` | 新增功能 |
| `v1.1.1` | 稳定版 | `latest` | Bug 修复 |
| `v2.0.0` | 稳定版 | `latest` | 破坏性变更 |
| `v1.1.0-alpha.1` | 预发布 | `alpha` | 内部测试 |
| `v1.1.0-beta.1` | 预发布 | `beta` | 公开测试 |
| `v1.1.0-rc.1` | 预发布 | `rc` | 发布候选 |

---

## 常见问题

### Q1: 如何查看发布进度？

**A**: 进入 GitHub 仓库 → **Actions** → 点击对应的 workflow run

### Q2: 发布失败了怎么办？

**A**: 根据错误类型处理:

**测试失败**:
```bash
# 查看失败的测试
pnpm test

# 修复后重新推送标签
git tag -d v1.0.0           # 删除本地标签
git push origin :v1.0.0     # 删除远程标签
git tag v1.0.0              # 重新创建标签
git push origin v1.0.0      # 重新推送
```

**认证失败**:
1. 检查 `NPM_AUTOMATION_TOKEN` 是否过期
2. 重新生成 token 并更新 GitHub Secrets
3. 重新推送标签

**版本冲突**:
```bash
# 使用新版本号
git tag v1.0.1
git push origin v1.0.1
```

### Q3: 如何删除错误的发布？

**A**: 
```bash
# 1. 删除 GitHub 标签
git tag -d v1.0.0
git push origin :v1.0.0

# 2. 删除 GitHub Release（手动在网页上删除）

# 3. Deprecate npm 包（不要删除）
npm deprecate @hestudy/tushare-sdk@1.0.0 "This version was published by mistake"
```

### Q4: 如何跳过 CI 直接发布？

**A**: 不推荐跳过 CI。如果必须手动发布:
```bash
cd packages/tushare-sdk
npm publish --tag latest
```

### Q5: 如何发布到其他 registry？

**A**: 修改 `package.json`:
```json
{
  "publishConfig": {
    "registry": "https://your-registry.com/"
  }
}
```

### Q6: 如何同时发布多个包？

**A**: 当前配置支持 monorepo。未来如有多个包:
```bash
# 为每个包创建标签
git tag tushare-sdk-v1.0.0
git tag another-package-v1.0.0
git push origin --tags
```

---

## 最佳实践

### 1. 发布前检查清单

- [ ] 所有测试通过 (`pnpm test`)
- [ ] 代码已合并到目标分支
- [ ] CHANGELOG 已更新（可选，会自动生成）
- [ ] 版本号符合 semver 规范
- [ ] 没有未提交的更改

### 2. 版本号选择

- **Bug 修复**: 增加 PATCH 版本 (1.0.0 → 1.0.1)
- **新功能**: 增加 MINOR 版本 (1.0.0 → 1.1.0)
- **破坏性变更**: 增加 MAJOR 版本 (1.0.0 → 2.0.0)
- **测试版本**: 使用预发布标识符 (1.1.0-beta.1)

### 3. 分支策略

- **main**: 稳定版本发布
- **develop**: 预发布版本发布
- **feature/***: 不发布，仅测试

### 4. Commit 规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: Add new API endpoint
fix: Fix memory leak in client
docs: Update README
chore: Bump dependencies
```

这样可以自动生成更清晰的变更日志。

### 5. 发布频率

- **稳定版**: 每 2-4 周发布一次
- **预发布版**: 根据需要随时发布
- **紧急修复**: 立即发布 patch 版本

---

## 监控与维护

### 1. 定期检查

- **每周**: 检查 npm token 是否即将过期
- **每月**: 审查发布日志和失败记录
- **每季度**: 更新 GitHub Actions 依赖版本

### 2. Token 轮换

```bash
# 1. 生成新 token
# 2. 更新 GitHub Secrets
# 3. 测试发布流程
# 4. 撤销旧 token
```

### 3. 监控指标

- 发布成功率
- 平均发布时间
- 失败原因分布

---

## 故障排查

### 查看详细日志

1. 进入 GitHub Actions 页面
2. 点击失败的 workflow run
3. 展开失败的步骤
4. 查看详细错误信息

### 常见错误码

| 错误码 | 含义 | 解决方法 |
|--------|------|---------|
| `ENEEDAUTH` | 认证失败 | 检查 NPM_AUTOMATION_TOKEN |
| `E403` | 权限不足 | 检查 token 权限范围 |
| `E409` | 版本冲突 | 使用新版本号 |
| `ETIMEOUT` | 网络超时 | 重试或检查 npm 状态 |

### 获取帮助

- 查看 [GitHub Actions 文档](https://docs.github.com/en/actions)
- 查看 [npm 发布文档](https://docs.npmjs.com/cli/v9/commands/npm-publish)
- 提交 Issue 到项目仓库

---

## 下一步

- 阅读 [data-model.md](./data-model.md) 了解内部实现
- 阅读 [workflow-contract.md](./contracts/workflow-contract.md) 了解技术细节
- 查看 [spec.md](./spec.md) 了解完整需求
