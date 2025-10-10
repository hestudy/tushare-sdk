# Workflow 测试场景

本文档定义了 GitHub Actions 发布 workflow 的完整测试场景。

## 场景 1: 稳定版本发布 (US1)

**目标**: 验证推送稳定版本标签时的完整发布流程

**前置条件**:
- 所有测试通过
- 代码在 main 分支
- NPM_AUTOMATION_TOKEN 已配置

**测试步骤**:
```bash
# 1. 确保代码最新
git checkout main
git pull origin main

# 2. 运行本地测试
pnpm test

# 3. 创建测试标签
git tag v0.0.1-test
git push origin v0.0.1-test
```

**验证点**:
- [ ] Workflow 被触发
- [ ] Test & Build job 成功执行
  - [ ] Lint 通过
  - [ ] Type check 通过
  - [ ] Build 成功
  - [ ] Tests 通过
  - [ ] 测试覆盖率 ≥ 80%
- [ ] Publish job 成功执行
  - [ ] 版本号从标签同步到 package.json
  - [ ] 版本号验证通过
  - [ ] Dist-tag 推断为 `latest`
  - [ ] 版本冲突检查通过
  - [ ] 包成功发布到 npm
- [ ] Create Release job 成功执行
  - [ ] 变更日志生成
  - [ ] GitHub Release 创建成功
  - [ ] Prerelease 标记为 false
- [ ] npm 包可访问: `https://www.npmjs.com/package/@hestudy/tushare-sdk`
- [ ] GitHub Release 可访问
- [ ] 日志输出清晰，包含版本号和 URL

**清理**:
```bash
# 删除测试标签
git tag -d v0.0.1-test
git push origin :v0.0.1-test

# Deprecate 测试版本
npm deprecate @hestudy/tushare-sdk@0.0.1-test "Test version"
```

---

## 场景 2: Beta 预发布版本 (US2)

**目标**: 验证 beta 版本发布和 dist-tag 推断

**测试步骤**:
```bash
git tag v0.0.2-beta.1
git push origin v0.0.2-beta.1
```

**验证点**:
- [ ] Workflow 被触发
- [ ] Dist-tag 推断为 `beta`
- [ ] 包发布到 `@beta` tag
- [ ] GitHub Release 的 prerelease 标记为 true
- [ ] 用户可通过 `npm install @hestudy/tushare-sdk@beta` 安装

---

## 场景 3: Alpha 预发布版本 (US2)

**测试步骤**:
```bash
git tag v0.0.2-alpha.1
git push origin v0.0.2-alpha.1
```

**验证点**:
- [ ] Dist-tag 推断为 `alpha`
- [ ] 包发布到 `@alpha` tag
- [ ] Prerelease 标记正确

---

## 场景 4: RC 预发布版本 (US2)

**测试步骤**:
```bash
git tag v0.0.2-rc.1
git push origin v0.0.2-rc.1
```

**验证点**:
- [ ] Dist-tag 推断为 `rc`
- [ ] 包发布到 `@rc` tag
- [ ] Prerelease 标记正确

---

## 场景 5: 版本冲突处理

**目标**: 验证重复版本号的错误处理

**测试步骤**:
```bash
# 推送已存在的版本号
git tag v0.0.1-test
git push origin v0.0.1-test
```

**验证点**:
- [ ] Workflow 检测到版本冲突
- [ ] 发布被中止
- [ ] 错误消息清晰: "Version X already exists on npm"
- [ ] 提供恢复建议: "Please use a new version number"

---

## 场景 6: 认证失败处理

**目标**: 验证 npm token 无效时的错误处理

**前置条件**:
- 临时移除或使用无效的 NPM_AUTOMATION_TOKEN

**验证点**:
- [ ] Workflow 检测到认证失败
- [ ] 错误消息清晰: "NPM authentication failed"
- [ ] 提供恢复建议: "Please update NPM_AUTOMATION_TOKEN in GitHub Secrets"

---

## 场景 7: 测试失败处理

**目标**: 验证测试失败时不发布

**前置条件**:
- 引入一个会导致测试失败的代码

**测试步骤**:
```bash
# 修改代码使测试失败
# 推送标签
git tag v0.0.3-test
git push origin v0.0.3-test
```

**验证点**:
- [ ] Test & Build job 失败
- [ ] Publish job 不执行
- [ ] 错误消息清晰: "Tests failed"
- [ ] 提供恢复建议: "Please fix the failing tests and push a new tag"

---

## 场景 8: 标签格式错误

**目标**: 验证不符合 semver 的标签被拒绝

**测试步骤**:
```bash
# 推送不符合格式的标签
git tag invalid-tag
git push origin invalid-tag
```

**验证点**:
- [ ] Workflow 不被触发 (因为不匹配 `v*` 模式)
- [ ] 或者被触发但在验证步骤失败

---

## 场景 9: 构建产物验证

**目标**: 验证构建产物完整性

**验证点**:
- [ ] `dist/` 目录存在
- [ ] 包含 `.js` 和 `.d.ts` 文件
- [ ] package.json 的 `files` 字段正确配置
- [ ] 发布的包大小合理

---

## 场景 10: 变更日志生成 (US3)

**目标**: 验证 conventional commits 格式的变更日志

**前置条件**:
- 提交符合 conventional commits 格式的 commits

**测试步骤**:
```bash
# 创建符合规范的 commits
git commit -m "feat: add new API endpoint"
git commit -m "fix: resolve memory leak"
git commit -m "docs: update README"

# 推送标签
git tag v0.0.4-test
git push origin v0.0.4-test
```

**验证点**:
- [ ] GitHub Release 包含变更日志
- [ ] Commits 按类型分组 (feat, fix, docs)
- [ ] 包含 Full Changelog 链接
- [ ] 格式清晰易读

---

## 场景 11: 不符合规范的 commits

**目标**: 验证不符合 conventional commits 的处理

**前置条件**:
- 提交不符合规范的 commits

**测试步骤**:
```bash
git commit -m "random commit message"
git commit -m "WIP: work in progress"

git tag v0.0.5-test
git push origin v0.0.5-test
```

**验证点**:
- [ ] 变更日志仍然生成
- [ ] 不符合规范的 commits 被标注
- [ ] 或者放在 "Other Changes" 分组

---

## 场景 12: 同时推送多个标签

**目标**: 验证并发控制

**测试步骤**:
```bash
git tag v0.0.6-test
git tag v0.0.7-test
git push origin --tags
```

**验证点**:
- [ ] 两个 workflow 并行执行
- [ ] 每个 workflow 独立完成
- [ ] 没有资源冲突

---

## 场景 13: 性能验证

**目标**: 验证发布流程在 SLA 时间内完成

**验证点**:
- [ ] Test & Build job < 5 分钟
- [ ] Publish job < 3 分钟
- [ ] Create Release job < 2 分钟
- [ ] 总时间 < 10 分钟
- [ ] 理想情况 < 5 分钟

---

## 场景 14: 日志可读性

**目标**: 验证日志输出清晰明确

**验证点**:
- [ ] 每个步骤有清晰的名称
- [ ] 版本号和 dist-tag 明确显示
- [ ] npm 包 URL 输出
- [ ] GitHub Release URL 输出
- [ ] 错误消息清晰且包含恢复建议

---

## 回归测试清单

在以下情况下运行完整的回归测试:

- [ ] Workflow 文件修改
- [ ] 依赖版本更新 (actions/*, pnpm, node)
- [ ] GitHub Actions runner 更新
- [ ] 每月定期回归测试

**回归测试包含**:
- 场景 1: 稳定版本发布
- 场景 2: Beta 预发布版本
- 场景 5: 版本冲突处理
- 场景 7: 测试失败处理
- 场景 10: 变更日志生成
- 场景 13: 性能验证
