# Workflow 测试

本目录包含 GitHub Actions workflow 的测试脚本和验证工具。

## 测试策略

由于 GitHub Actions workflow 是声明式配置，我们采用以下测试策略:

1. **实际执行测试**: 在真实的 GitHub Actions 环境中推送测试标签验证
2. **本地验证**: 使用 `act` 工具在本地模拟 GitHub Actions 执行
3. **手动验证清单**: 提供详细的测试场景和验证步骤

## 测试工具

### 选项 1: 使用 act (本地测试)

```bash
# 安装 act
brew install act

# 测试 publish workflow
act push -W .github/workflows/publish.yml \
  --secret NPM_AUTOMATION_TOKEN=your_test_token \
  --var GITHUB_REF=refs/tags/v0.0.1-test
```

### 选项 2: 测试仓库 (推荐)

在真实的 GitHub 环境中测试:

```bash
# 创建测试标签
git tag v0.0.1-test
git push origin v0.0.1-test

# 观察 workflow 执行
# 访问: https://github.com/hestudy/tushare-sdk/actions

# 清理测试标签
git tag -d v0.0.1-test
git push origin :v0.0.1-test
```

## 测试场景

详见 [test-scenarios.md](./test-scenarios.md)

## 测试清单

详见 [test-checklist.md](./test-checklist.md)
