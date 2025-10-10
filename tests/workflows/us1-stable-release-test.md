# US1 测试: 稳定版本自动发布

**用户故事**: 当维护者推送版本标签时,自动构建、测试并发布稳定版本到 npm

**测试状态**: ✅ GREEN (Workflow 已实现)

---

## 测试场景

### 场景 1: 推送 v1.0.0 标签触发发布

**前置条件**:
- 代码在 main 分支
- 所有测试通过
- NPM_AUTOMATION_TOKEN 已配置

**执行步骤**:
```bash
# 1. 准备代码
git checkout main
git pull origin main
pnpm test

# 2. 创建并推送标签
git tag v1.0.0
git push origin v1.0.0
```

**验证点**:

#### 1. Workflow 触发
- [ ] Workflow 被 `push tags: v*` 触发
- [ ] Workflow 运行 ID 可见
- [ ] 触发者信息正确

#### 2. Test & Build Job
- [ ] Checkout 代码成功
- [ ] Setup Node.js 和 pnpm 成功
- [ ] 安装依赖成功
- [ ] Lint 通过 (`pnpm lint`)
- [ ] Type check 通过 (`pnpm type-check`)
- [ ] Build 成功 (`pnpm build`)
- [ ] Tests 通过 (`pnpm test`)
- [ ] 测试覆盖率 ≥ 80%
- [ ] 构建产物存在 (`dist/` 目录)

#### 3. Publish Job
- [ ] 依赖 Test & Build 成功
- [ ] 从标签提取版本号: `1.0.0`
- [ ] 同步版本号到 package.json
- [ ] 验证版本号一致性通过
- [ ] 验证标签格式符合 semver
- [ ] 检查版本冲突 (npm view)
- [ ] 验证构建产物完整性
- [ ] Dist-tag 推断为 `latest`
- [ ] 发布到 npm 成功
- [ ] npm 包 URL 输出

#### 4. Create Release Job
- [ ] 依赖 Publish 成功
- [ ] 获取上一个版本标签
- [ ] 生成 commit 列表
- [ ] 生成变更日志 (Markdown)
- [ ] 创建 GitHub Release
- [ ] Release name: `Release v1.0.0`
- [ ] Prerelease 标记为 false
- [ ] Release URL 输出

#### 5. 最终验证
- [ ] npm 包可访问: `https://www.npmjs.com/package/@hestudy/tushare-sdk`
- [ ] 版本号正确: `1.0.0`
- [ ] Dist-tag 为 `latest`
- [ ] 可通过 `npm install @hestudy/tushare-sdk` 安装
- [ ] GitHub Release 可访问
- [ ] Release 包含变更日志
- [ ] 总执行时间 < 10 分钟

---

## 错误处理测试

### 测试失败场景

**前置条件**: 引入会导致测试失败的代码

**验证点**:
- [ ] Test & Build job 失败
- [ ] Publish job 不执行
- [ ] 错误消息: "Tests failed. Please fix the failing tests and push a new tag."
- [ ] Workflow 状态为 failure

### 认证失败场景

**前置条件**: NPM_AUTOMATION_TOKEN 无效或过期

**验证点**:
- [ ] Publish 步骤失败
- [ ] 错误消息: "NPM authentication failed. Please update NPM_AUTOMATION_TOKEN in GitHub Secrets."
- [ ] Workflow 状态为 failure

### 版本冲突场景

**前置条件**: 推送已存在的版本号

**验证点**:
- [ ] 版本冲突检查失败
- [ ] 错误消息: "Version 1.0.0 already exists on npm. Please use a new version number."
- [ ] Publish 步骤不执行
- [ ] Workflow 状态为 failure

### 标签格式错误场景

**测试**: 推送不符合 semver 的标签

```bash
git tag invalid-tag
git push origin invalid-tag
```

**验证点**:
- [ ] Workflow 不被触发 (不匹配 `v*` 模式)

### 构建产物缺失场景

**前置条件**: Build 步骤未生成 dist/ 目录

**验证点**:
- [ ] 构建产物验证失败
- [ ] 错误消息清晰
- [ ] Publish 步骤不执行

---

## 性能测试

### 执行时间 SLA

**目标**: 总时间 < 10 分钟,理想 < 5 分钟

**测量**:
- Test & Build job: _______ 秒 (目标 < 300s)
- Publish job: _______ 秒 (目标 < 180s)
- Create Release job: _______ 秒 (目标 < 120s)
- **总时间**: _______ 秒 (目标 < 600s)

---

## 日志输出测试

### 必需的日志信息

- [ ] 版本号明确显示
- [ ] Dist-tag 明确显示
- [ ] npm 包 URL 输出
- [ ] GitHub Release URL 输出
- [ ] 每个步骤有清晰的名称
- [ ] 使用 `::group::` 组织日志
- [ ] 使用 `::notice::` 输出重要信息
- [ ] 错误消息包含恢复建议

---

## 权限和安全测试

### Secrets 管理

- [ ] NPM_AUTOMATION_TOKEN 不在日志中暴露
- [ ] 使用 `::add-mask::` 隐藏敏感信息

### 权限声明

- [ ] `contents: write` 用于创建 Release
- [ ] `id-token: write` 用于 npm provenance

---

## 并发控制测试

### 同一标签多次推送

**测试**: 删除并重新推送同一标签

```bash
git push origin :v1.0.0
git push origin v1.0.0
```

**验证点**:
- [ ] 第二次推送排队执行
- [ ] 不取消正在进行的发布

### 不同标签并行推送

**测试**: 同时推送多个标签

```bash
git tag v1.0.1
git tag v1.0.2
git push origin --tags
```

**验证点**:
- [ ] 两个 workflow 并行执行
- [ ] 没有资源冲突

---

## 清理

```bash
# 删除测试标签
git tag -d v1.0.0
git push origin :v1.0.0

# Deprecate 测试版本 (不要删除)
npm deprecate @hestudy/tushare-sdk@1.0.0 "Test version"

# 删除 GitHub Release (手动在网页上删除)
```

---

## 测试结果

**日期**: _______________  
**测试人**: _______________  
**状态**: ✅ PASS / ❌ FAIL  
**备注**: _______________
