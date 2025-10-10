# US2 测试: 预发布版本支持

**用户故事**: 支持发布带有特定标签的预览版本 (beta、alpha、rc),自动推断 dist-tag

**测试状态**: ✅ GREEN (Workflow 已实现)

---

## 测试场景 1: Beta 版本发布

**目标**: 验证 beta 版本的 dist-tag 自动推断

**执行步骤**:
```bash
git checkout develop  # 或其他开发分支
git tag v1.0.0-beta.1
git push origin v1.0.0-beta.1
```

**验证点**:

### Workflow 触发
- [ ] Workflow 被触发
- [ ] 标签格式验证通过

### Dist-tag 推断
- [ ] 从版本号 `1.0.0-beta.1` 提取预发布标识符
- [ ] Dist-tag 推断为 `beta`
- [ ] 日志输出: "Publishing with dist-tag: beta"

### 发布验证
- [ ] 包发布到 npm
- [ ] Dist-tag 为 `beta`
- [ ] 可通过 `npm install @hestudy/tushare-sdk@beta` 安装
- [ ] `npm view @hestudy/tushare-sdk dist-tags` 显示 `beta: 1.0.0-beta.1`

### GitHub Release
- [ ] Release 创建成功
- [ ] Prerelease 标记为 true
- [ ] Release 标题: `Release v1.0.0-beta.1`

---

## 测试场景 2: Alpha 版本发布

**执行步骤**:
```bash
git tag v1.0.0-alpha.1
git push origin v1.0.0-alpha.1
```

**验证点**:
- [ ] Dist-tag 推断为 `alpha`
- [ ] 包发布到 `@alpha` tag
- [ ] 可通过 `npm install @hestudy/tushare-sdk@alpha` 安装
- [ ] GitHub Release 标记为 prerelease

---

## 测试场景 3: RC 版本发布

**执行步骤**:
```bash
git tag v1.0.0-rc.1
git push origin v1.0.0-rc.1
```

**验证点**:
- [ ] Dist-tag 推断为 `rc`
- [ ] 包发布到 `@rc` tag
- [ ] 可通过 `npm install @hestudy/tushare-sdk@rc` 安装
- [ ] GitHub Release 标记为 prerelease

---

## 测试场景 4: Next 版本发布

**执行步骤**:
```bash
git tag v1.0.0-next.1
git push origin v1.0.0-next.1
```

**验证点**:
- [ ] Dist-tag 推断为 `next`
- [ ] 包发布到 `@next` tag
- [ ] 可通过 `npm install @hestudy/tushare-sdk@next` 安装

---

## 边界情况测试

### 无标识符的预发布版本

**测试**: `v1.0.0-1` (无 alpha/beta/rc 标识符)

```bash
git tag v1.0.0-1
git push origin v1.0.0-1
```

**验证点**:
- [ ] Dist-tag 默认为 `next`
- [ ] 发布成功

### 大写标识符

**测试**: `v1.0.0-BETA.1`

```bash
git tag v1.0.0-BETA.1
git push origin v1.0.0-BETA.1
```

**验证点**:
- [ ] Dist-tag 转为小写 `beta`
- [ ] 发布成功

### 复杂的预发布标识符

**测试**: `v1.0.0-beta.1.2`

```bash
git tag v1.0.0-beta.1.2
git push origin v1.0.0-beta.1.2
```

**验证点**:
- [ ] Dist-tag 提取为 `beta`
- [ ] 发布成功

---

## Dist-tag 推断逻辑验证

### 测试矩阵

| 版本号 | 预期 Dist-tag | 实际 Dist-tag | 状态 |
|--------|--------------|--------------|------|
| `1.0.0` | `latest` | | |
| `1.0.0-alpha.1` | `alpha` | | |
| `1.0.0-beta.1` | `beta` | | |
| `1.0.0-rc.1` | `rc` | | |
| `1.0.0-next.1` | `next` | | |
| `1.0.0-1` | `next` | | |
| `1.0.0-BETA.1` | `beta` | | |

---

## 与稳定版本的隔离测试

**目标**: 验证预发布版本不影响 `latest` tag

**前置条件**: 已发布稳定版本 `v1.0.0`

**测试步骤**:
```bash
# 发布 beta 版本
git tag v1.1.0-beta.1
git push origin v1.1.0-beta.1
```

**验证点**:
- [ ] `npm install @hestudy/tushare-sdk` 仍安装 `1.0.0` (latest)
- [ ] `npm install @hestudy/tushare-sdk@beta` 安装 `1.1.0-beta.1`
- [ ] `latest` tag 未被修改
- [ ] `beta` tag 指向 `1.1.0-beta.1`

---

## 多个预发布版本测试

**目标**: 验证同一类型的多个预发布版本

**测试步骤**:
```bash
# 发布 beta.1
git tag v1.1.0-beta.1
git push origin v1.1.0-beta.1

# 发布 beta.2
git tag v1.1.0-beta.2
git push origin v1.1.0-beta.2
```

**验证点**:
- [ ] 两个版本都成功发布
- [ ] `beta` tag 指向最新的 `1.1.0-beta.2`
- [ ] 可通过 `npm install @hestudy/tushare-sdk@1.1.0-beta.1` 安装旧版本

---

## 日志输出测试

### 必需的日志信息

- [ ] 版本号明确显示: `1.0.0-beta.1`
- [ ] Dist-tag 明确显示: `beta`
- [ ] 日志输出: "Publishing with dist-tag: beta"
- [ ] npm 包 URL 包含版本号
- [ ] GitHub Release 标记为 prerelease

---

## 用户安装验证

### Beta 版本安装

```bash
# 安装 beta 版本
npm install @hestudy/tushare-sdk@beta

# 验证版本
npm list @hestudy/tushare-sdk
```

**验证点**:
- [ ] 安装成功
- [ ] 版本号正确
- [ ] 包功能正常

### Alpha 版本安装

```bash
npm install @hestudy/tushare-sdk@alpha
```

**验证点**:
- [ ] 安装成功
- [ ] 版本号正确

### RC 版本安装

```bash
npm install @hestudy/tushare-sdk@rc
```

**验证点**:
- [ ] 安装成功
- [ ] 版本号正确

---

## 清理

```bash
# 删除测试标签
git tag -d v1.0.0-beta.1
git tag -d v1.0.0-alpha.1
git tag -d v1.0.0-rc.1
git push origin :v1.0.0-beta.1
git push origin :v1.0.0-alpha.1
git push origin :v1.0.0-rc.1

# Deprecate 测试版本
npm deprecate @hestudy/tushare-sdk@1.0.0-beta.1 "Test version"
npm deprecate @hestudy/tushare-sdk@1.0.0-alpha.1 "Test version"
npm deprecate @hestudy/tushare-sdk@1.0.0-rc.1 "Test version"

# 删除 dist-tags (可选)
npm dist-tag rm @hestudy/tushare-sdk beta
npm dist-tag rm @hestudy/tushare-sdk alpha
npm dist-tag rm @hestudy/tushare-sdk rc
```

---

## 测试结果

**日期**: _______________  
**测试人**: _______________  
**状态**: ✅ PASS / ❌ FAIL  
**备注**: _______________
