# Workflow 测试清单

本清单用于手动验证 GitHub Actions 发布 workflow 的正确性。

## 测试前准备

- [ ] NPM_AUTOMATION_TOKEN 已在 GitHub Secrets 中配置
- [ ] Token 权限正确 (Granular Access Token with automation scope)
- [ ] 本地所有测试通过 (`pnpm test`)
- [ ] 代码已推送到 GitHub

---

## 核心功能测试

### ✅ US1: 稳定版本自动发布

**测试标签**: `v0.0.1-test`

- [ ] 推送标签触发 workflow
- [ ] Lint 通过
- [ ] Type check 通过
- [ ] Build 成功
- [ ] Tests 通过
- [ ] 测试覆盖率 ≥ 80%
- [ ] 版本号从标签同步到 package.json
- [ ] Dist-tag 为 `latest`
- [ ] 包成功发布到 npm
- [ ] npm 包可访问
- [ ] GitHub Release 创建成功
- [ ] 总时间 < 10 分钟

**清理**:
```bash
git tag -d v0.0.1-test
git push origin :v0.0.1-test
npm deprecate @hestudy/tushare-sdk@0.0.1-test "Test version"
```

---

### ✅ US2: 预发布版本支持

#### Beta 版本

**测试标签**: `v0.0.2-beta.1`

- [ ] Dist-tag 推断为 `beta`
- [ ] 包发布到 `@beta` tag
- [ ] GitHub Release 标记为 prerelease
- [ ] 可通过 `npm install @hestudy/tushare-sdk@beta` 安装

#### Alpha 版本

**测试标签**: `v0.0.2-alpha.1`

- [ ] Dist-tag 推断为 `alpha`
- [ ] 包发布到 `@alpha` tag
- [ ] Prerelease 标记正确

#### RC 版本

**测试标签**: `v0.0.2-rc.1`

- [ ] Dist-tag 推断为 `rc`
- [ ] 包发布到 `@rc` tag
- [ ] Prerelease 标记正确

---

### ✅ US3: 发布通知与记录

**测试标签**: `v0.0.3-test`

**前置条件**: 创建符合 conventional commits 的提交
```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"
git commit -m "docs: update documentation"
```

- [ ] GitHub Release 自动创建
- [ ] 变更日志包含所有 commits
- [ ] Commits 按类型分组 (feat, fix, docs)
- [ ] 包含 Full Changelog 链接
- [ ] Release URL 在日志中输出
- [ ] Prerelease 标记正确

---

## 错误处理测试

### ❌ 版本冲突

**测试**: 推送已存在的版本号

- [ ] Workflow 检测到版本冲突
- [ ] 发布被中止
- [ ] 错误消息: "Version X already exists on npm"
- [ ] 提供恢复建议

### ❌ 认证失败

**测试**: 使用无效的 NPM_AUTOMATION_TOKEN

- [ ] Workflow 检测到认证失败
- [ ] 错误消息: "NPM authentication failed"
- [ ] 提供恢复建议: "Please update NPM_AUTOMATION_TOKEN"

### ❌ 测试失败

**测试**: 引入会导致测试失败的代码

- [ ] Test & Build job 失败
- [ ] Publish job 不执行
- [ ] 错误消息: "Tests failed"
- [ ] 提供恢复建议

### ❌ 构建失败

**测试**: 引入会导致构建失败的代码

- [ ] Build 步骤失败
- [ ] Publish job 不执行
- [ ] 错误消息清晰

---

## 边界情况测试

### 标签格式

- [ ] `v1.0.0` - 标准格式 ✅
- [ ] `v1.0.0-beta.1` - 预发布格式 ✅
- [ ] `invalid-tag` - 不触发 workflow ✅
- [ ] `1.0.0` (无 v 前缀) - 不触发 workflow ✅

### 并发控制

**测试**: 同时推送多个标签
```bash
git tag v0.0.4-test
git tag v0.0.5-test
git push origin --tags
```

- [ ] 两个 workflow 并行执行
- [ ] 每个 workflow 独立完成
- [ ] 没有资源冲突

### 网络问题

**测试**: 模拟网络超时 (如果可能)

- [ ] Workflow 有合理的超时设置
- [ ] 超时后提供清晰的错误信息

---

## 性能测试

### 执行时间

**目标**: 总时间 < 10 分钟，理想 < 5 分钟

- [ ] Test & Build job < 5 分钟
- [ ] Publish job < 3 分钟
- [ ] Create Release job < 2 分钟
- [ ] 总时间记录: _______ 分钟

### 缓存效果

- [ ] pnpm 依赖缓存生效
- [ ] 第二次运行明显更快

---

## 可观测性测试

### 日志输出

- [ ] 每个步骤有清晰的名称
- [ ] 版本号明确显示
- [ ] Dist-tag 明确显示
- [ ] npm 包 URL 输出
- [ ] GitHub Release URL 输出
- [ ] 使用 `::group::` 组织日志
- [ ] 使用 `::notice::` 输出重要信息

### 错误消息

- [ ] 错误类型明确
- [ ] 包含恢复建议
- [ ] 包含相关日志链接

---

## 安全测试

### Secrets 管理

- [ ] NPM_AUTOMATION_TOKEN 不在日志中暴露
- [ ] 使用 `::add-mask::` 隐藏敏感信息
- [ ] Token 仅在需要的步骤中使用

### 权限控制

- [ ] Workflow 权限最小化
- [ ] `contents: write` 仅用于创建 Release
- [ ] `id-token: write` 用于 npm provenance

---

## 文档验证

### Quickstart 指南

- [ ] 所有步骤可正常执行
- [ ] 示例命令正确
- [ ] 链接有效

### 错误处理文档

- [ ] 所有错误场景有文档
- [ ] 恢复步骤清晰
- [ ] 示例准确

---

## 成功指标验证

根据 spec.md 的成功标准:

- [ ] SC-001: 维护者可在 5 分钟内完成从创建标签到包发布的全流程
- [ ] SC-002: 自动发布流程成功率 ≥ 95% (记录: ___%)
- [ ] SC-003: 发布失败时可在 1 分钟内从日志定位原因
- [ ] SC-004: 减少手动发布操作时间 80% 以上
- [ ] SC-005: 100% 的发布都有完整的测试覆盖和审计日志
- [ ] SC-006: 发布后 2 分钟内在 GitHub Releases 可见新版本记录

---

## 回归测试记录

| 日期 | 测试人 | 通过场景 | 失败场景 | 备注 |
|------|--------|---------|---------|------|
| YYYY-MM-DD | | | | |

---

## 测试完成签名

- [ ] 所有核心功能测试通过
- [ ] 所有错误处理测试通过
- [ ] 性能指标达标
- [ ] 文档验证通过
- [ ] 成功指标达标

**测试人**: _______________  
**日期**: _______________  
**版本**: _______________
