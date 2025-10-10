# CI 测试失败修复报告

## 问题描述

CI 环境中运行 `pnpm test:coverage` 时,集成测试失败并报错:

```
ApiError: 您的token不对，请确认。
Error: command finished with error: command exited (1)
```

## 根本原因

1. **GitHub Secret 未配置**: CI 配置期望从 `secrets.TUSHARE_TOKEN` 读取 token,但该 secret 未在 GitHub 仓库中设置
2. **测试跳过策略不一致**: 
   - 部分测试使用 `it.skip()` 静态跳过
   - 部分测试使用运行时检查 `if (!process.env.TUSHARE_TOKEN) { return; }`
   - 运行时检查会导致测试在没有 token 时仍然执行并失败

## 解决方案

### 1. 统一测试跳过策略

将所有集成测试改为使用 Vitest 的 `skipIf` 条件跳过:

**修改前**:
```typescript
it('测试', async () => {
  if (!process.env.TUSHARE_TOKEN) {
    console.log('跳过: 需要真实 TUSHARE_TOKEN');
    return;
  }
  // 测试代码
});
```

**修改后**:
```typescript
const hasToken = !!process.env.TUSHARE_TOKEN;

it.skipIf(!hasToken)('测试', async () => {
  // 测试代码
});
```

### 2. 修改的文件

以下文件已更新为使用统一的跳过策略:

1. **`apps/node-demo/tests/integration/daily-data.test.ts`**
   - 5 个测试用例改为使用 `it.skipIf(!hasToken)`

2. **`apps/node-demo/tests/integration/param-error.test.ts`**
   - 3 个测试用例改为使用 `it.skipIf(!hasToken)`

3. **`apps/node-demo/tests/performance.test.ts`**
   - 2 个测试用例改为使用 `it.skipIf(!hasToken)`

### 3. 更新 CI 配置

在 `.github/workflows/ci.yml` 中添加注释,说明 `TUSHARE_TOKEN` 是可选的:

```yaml
- name: Test
  run: pnpm test:coverage
  env:
    # 可选: 如果配置了 TUSHARE_TOKEN secret,集成测试将会运行
    # 如果未配置,集成测试将被跳过,只运行单元测试
    TUSHARE_TOKEN: ${{ secrets.TUSHARE_TOKEN }}
```

### 4. 文档更新

1. **创建测试指南** (`docs/testing-guide.md`):
   - 详细说明测试策略
   - 本地开发配置指南
   - CI/CD 配置说明
   - 故障排查指南

2. **更新主 README** (`README.md`):
   - 添加测试说明章节
   - 说明环境变量配置方法
   - 链接到详细测试指南

## 测试结果

### 本地测试(有 Token)

```bash
✓ tests/integration/full-demo.test.ts (4)
✓ tests/integration/param-error.test.ts (5)
✓ tests/integration/daily-data.test.ts (5)
✓ tests/integration/trade-calendar.test.ts (7)
✓ tests/performance.test.ts (4)
✓ tests/unit/config.test.ts (6)
✓ tests/unit/example-runner.test.ts (7)
✓ tests/unit/error-handling.test.ts (7)

Test Files  10 passed | 1 skipped (11)
Tests  54 passed | 2 skipped (56)
```

### CI 测试(无 Token)

预期行为:
- 单元测试: ✅ 运行并通过
- 集成测试: ⏭️ 自动跳过
- 性能测试: ⏭️ 自动跳过
- CI 状态: ✅ 成功

## 优势

1. **灵活性**: CI 可以在有或没有 token 的情况下运行
2. **安全性**: 不需要在公开仓库中暴露 API Token
3. **一致性**: 所有集成测试使用统一的跳过策略
4. **可维护性**: 清晰的文档和注释

## 使用指南

### 本地开发

```bash
# 1. 复制环境变量模板
cp apps/node-demo/.env.example apps/node-demo/.env

# 2. 编辑 .env 文件,填入 token
# TUSHARE_TOKEN=your_token_here

# 3. 运行测试
pnpm test:coverage
```

### CI 配置(可选)

如果想在 CI 中运行集成测试:

1. 进入 GitHub 仓库的 **Settings** → **Secrets and variables** → **Actions**
2. 添加 secret:
   - Name: `TUSHARE_TOKEN`
   - Value: 你的 Tushare API Token

如果不配置,CI 仍然会成功运行,只是跳过集成测试。

## 相关文件

- 测试文件修改:
  - `apps/node-demo/tests/integration/daily-data.test.ts`
  - `apps/node-demo/tests/integration/param-error.test.ts`
  - `apps/node-demo/tests/performance.test.ts`

- CI 配置:
  - `.github/workflows/ci.yml`

- 文档:
  - `docs/testing-guide.md` (新建)
  - `README.md` (更新)

## 总结

通过统一测试跳过策略和完善文档,现在 CI 可以在没有 Tushare Token 的情况下成功运行,同时保持了在本地开发时运行完整测试的能力。这种方法既保证了安全性,又提供了灵活性。
