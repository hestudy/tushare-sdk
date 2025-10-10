# 错误消息验证清单

本文档用于验证所有错误场景的提示信息是否清晰明确。

---

## 错误场景 1: 测试失败

### 触发条件
- 代码中存在会导致测试失败的问题

### 预期错误消息
```
Tests failed. Please fix the failing tests and push a new tag.
```

### 验证清单
- [ ] 错误消息在 Test & Build job 中输出
- [ ] 使用 `::error::` 级别
- [ ] 消息清晰指出是测试失败
- [ ] 提供恢复建议: "fix the failing tests and push a new tag"
- [ ] Workflow 状态为 failure
- [ ] Publish job 不执行

### 实际错误消息
```
(待测试时填写)
```

---

## 错误场景 2: 构建失败

### 触发条件
- 代码中存在会导致构建失败的问题

### 预期错误消息
```
Build failed. Please check the build configuration and try again.
```

### 验证清单
- [ ] 错误消息在 Build 步骤输出
- [ ] 使用 `::error::` 级别
- [ ] 消息清晰指出是构建失败
- [ ] 提供恢复建议
- [ ] Workflow 状态为 failure
- [ ] Publish job 不执行

### 实际错误消息
```
(待测试时填写)
```

---

## 错误场景 3: 认证失败

### 触发条件
- NPM_AUTOMATION_TOKEN 无效或过期

### 预期错误消息
```
NPM authentication failed. Please update NPM_AUTOMATION_TOKEN in GitHub Secrets.
```

### 验证清单
- [ ] 错误消息在 Publish 步骤输出
- [ ] 使用 `::error::` 级别
- [ ] 消息清晰指出是认证失败
- [ ] 提供恢复建议: "update NPM_AUTOMATION_TOKEN in GitHub Secrets"
- [ ] Workflow 状态为 failure
- [ ] 不暴露 token 内容

### 实际错误消息
```
(待测试时填写)
```

---

## 错误场景 4: 版本冲突

### 触发条件
- 推送的版本号已存在于 npm

### 预期错误消息
```
Version X.Y.Z already exists on npm. Please use a new version number.
```

### 验证清单
- [ ] 错误消息在 "Check version conflict" 步骤输出
- [ ] 使用 `::error::` 级别
- [ ] 消息包含具体的版本号
- [ ] 提供恢复建议: "use a new version number"
- [ ] Workflow 状态为 failure
- [ ] Publish 步骤不执行

### 实际错误消息
```
(待测试时填写)
```

---

## 错误场景 5: 版本号不一致

### 触发条件
- 标签版本号与 package.json 同步后仍不一致 (理论上不应发生)

### 预期错误消息
```
Version mismatch: tag=X.Y.Z, package=A.B.C
```

### 验证清单
- [ ] 错误消息在 "Verify version consistency" 步骤输出
- [ ] 使用 `::error::` 级别
- [ ] 消息包含两个版本号
- [ ] 清晰指出不一致的问题
- [ ] Workflow 状态为 failure

### 实际错误消息
```
(待测试时填写)
```

---

## 错误场景 6: 构建产物缺失

### 触发条件
- Build 步骤未生成 dist/ 目录

### 预期错误消息
```
Build artifacts missing: dist/ directory not found
```

### 验证清单
- [ ] 错误消息在 "Verify build artifacts" 步骤输出
- [ ] 使用 `::error::` 级别
- [ ] 消息清晰指出缺失的产物
- [ ] Workflow 状态为 failure
- [ ] Publish job 不执行

### 实际错误消息
```
(待测试时填写)
```

---

## 错误场景 7: 发布验证失败

### 触发条件
- 包发布后在 npm 上无法立即查询到 (可能是索引延迟)

### 预期错误消息
```
Publication verification failed, but this may be due to npm indexing delay
```

### 验证清单
- [ ] 错误消息在 "Verify publication" 步骤输出
- [ ] 使用 `::warning::` 级别 (不是 error)
- [ ] 消息解释可能的原因
- [ ] Workflow 状态为 success (不阻止流程)
- [ ] Create Release job 继续执行

### 实际错误消息
```
(待测试时填写)
```

---

## 成功消息验证

### 版本提取成功

**预期消息**:
```
Extracted version: X.Y.Z
```

**验证清单**:
- [ ] 使用 `::notice::` 级别
- [ ] 包含提取的版本号
- [ ] 消息清晰

---

### 版本一致性验证成功

**预期消息**:
```
Version consistency verified: X.Y.Z
```

**验证清单**:
- [ ] 使用 `::notice::` 级别
- [ ] 包含验证的版本号
- [ ] 消息清晰

---

### Dist-tag 推断成功

**预期消息**:
```
Inferred dist-tag: latest (或 beta, alpha, rc, next)
```

**验证清单**:
- [ ] 使用 `::notice::` 级别
- [ ] 包含推断的 dist-tag
- [ ] 消息清晰

---

### 版本可用性检查成功

**预期消息**:
```
Version X.Y.Z is available
```

**验证清单**:
- [ ] 使用 `::notice::` 级别
- [ ] 包含检查的版本号
- [ ] 消息清晰

---

### 发布成功

**预期消息**:
```
✅ Published @hestudy/tushare-sdk@X.Y.Z with tag 'latest'
📦 npm: https://www.npmjs.com/package/@hestudy/tushare-sdk/v/X.Y.Z
```

**验证清单**:
- [ ] 使用 `::notice::` 级别
- [ ] 包含包名、版本号、dist-tag
- [ ] 包含 npm 包 URL
- [ ] 使用 emoji 增强可读性
- [ ] 消息清晰

---

### Release 创建成功

**预期消息**:
```
🎉 Release vX.Y.Z created successfully
📋 Release: https://github.com/owner/repo/releases/tag/vX.Y.Z
```

**验证清单**:
- [ ] 使用 `::notice::` 级别
- [ ] 包含版本号
- [ ] 包含 GitHub Release URL
- [ ] 使用 emoji 增强可读性
- [ ] 消息清晰

---

## 日志分组验证

### 构建产物验证

**预期格式**:
```
::group::Verify build artifacts
(文件列表)
::endgroup::
```

**验证清单**:
- [ ] 使用 `::group::` 和 `::endgroup::`
- [ ] 分组名称清晰
- [ ] 内容有组织

---

### 版本同步

**预期格式**:
```
::group::Sync version from tag
(同步日志)
::endgroup::
```

**验证清单**:
- [ ] 使用 `::group::` 和 `::endgroup::`
- [ ] 分组名称清晰

---

### 发布到 npm

**预期格式**:
```
::group::Publishing to npm with tag: latest
(发布日志)
::endgroup::
```

**验证清单**:
- [ ] 使用 `::group::` 和 `::endgroup::`
- [ ] 分组名称包含 dist-tag
- [ ] 内容有组织

---

### 变更日志生成

**预期格式**:
```
::group::Generated Changelog
(变更日志内容)
::endgroup::
```

**验证清单**:
- [ ] 使用 `::group::` 和 `::endgroup::`
- [ ] 分组名称清晰
- [ ] 内容格式正确

---

## 总体评估

### 错误消息质量标准

- [ ] 所有错误消息使用 `::error::` 级别
- [ ] 所有错误消息清晰指出问题类型
- [ ] 所有错误消息提供恢复建议
- [ ] 所有错误消息易于理解
- [ ] 没有技术术语过多的消息
- [ ] 没有暴露敏感信息

### 成功消息质量标准

- [ ] 所有成功消息使用 `::notice::` 级别
- [ ] 关键信息清晰显示 (版本号、URL)
- [ ] 使用 emoji 增强可读性
- [ ] 消息简洁明了

### 日志组织标准

- [ ] 使用 `::group::` 组织长日志
- [ ] 分组名称清晰描述内容
- [ ] 关键信息在分组外也可见

---

## 测试结果

**日期**: _______________  
**测试人**: _______________  
**状态**: ✅ PASS / ❌ FAIL  
**备注**: _______________

### 需要改进的消息

1. _______________
2. _______________
3. _______________
