# 测试指南

## 测试策略

本项目采用分层测试策略,包括单元测试、集成测试和性能测试。

### 测试类型

#### 1. 单元测试
- **位置**: `tests/unit/`
- **特点**: 不依赖外部 API,使用 mock 数据
- **运行**: 始终运行,不需要 Tushare Token

#### 2. 集成测试
- **位置**: `tests/integration/`
- **特点**: 调用真实的 Tushare API
- **运行**: 需要有效的 `TUSHARE_TOKEN` 环境变量
- **跳过策略**: 如果没有 token,测试会被自动跳过

#### 3. 性能测试
- **位置**: `tests/performance.test.ts`
- **特点**: 验证 API 调用性能指标
- **运行**: 需要有效的 `TUSHARE_TOKEN` 环境变量

## 本地开发

### 配置环境变量

1. 复制环境变量模板:
```bash
cp apps/node-demo/.env.example apps/node-demo/.env
```

2. 编辑 `.env` 文件,填入你的 Tushare Token:
```bash
TUSHARE_TOKEN=your_actual_token_here
```

### 运行测试

```bash
# 运行所有测试(包括集成测试,需要 token)
pnpm test

# 运行测试并生成覆盖率报告
pnpm test:coverage

# 只运行单元测试(不需要 token)
pnpm test tests/unit
```

### 测试行为

- **有 Token**: 所有测试(单元测试 + 集成测试 + 性能测试)都会运行
- **无 Token**: 只运行单元测试,集成测试和性能测试会被跳过

## CI/CD 环境

### GitHub Actions 配置

CI 环境使用相同的测试策略。集成测试是否运行取决于是否配置了 `TUSHARE_TOKEN` secret。

#### 配置 GitHub Secret (可选)

如果你想在 CI 中运行集成测试:

1. 进入 GitHub 仓库的 **Settings** → **Secrets and variables** → **Actions**
2. 点击 **New repository secret**
3. 添加 secret:
   - **Name**: `TUSHARE_TOKEN`
   - **Value**: 你的 Tushare API Token

#### 不配置 Secret

如果不配置 `TUSHARE_TOKEN` secret:
- CI 会成功运行
- 单元测试会执行
- 集成测试会被跳过
- 这是推荐的做法,避免在公开仓库中暴露 API Token

### CI 工作流程

```yaml
- name: Test
  run: pnpm test:coverage
  env:
    # 可选: 如果配置了 TUSHARE_TOKEN secret,集成测试将会运行
    # 如果未配置,集成测试将被跳过,只运行单元测试
    TUSHARE_TOKEN: ${{ secrets.TUSHARE_TOKEN }}
```

## 测试最佳实践

### 编写新测试

1. **单元测试**: 用于测试纯逻辑,不依赖外部服务
   ```typescript
   describe('配置验证', () => {
     it('应该验证必需的配置项', () => {
       // 不需要 API 调用的测试
     });
   });
   ```

2. **集成测试**: 用于测试与 Tushare API 的交互
   ```typescript
   describe('API 集成测试', () => {
     const hasToken = !!process.env.TUSHARE_TOKEN;
     
     it.skipIf(!hasToken)('应该成功调用 API', async () => {
       // 需要真实 API 调用的测试
     });
   });
   ```

### 跳过策略

使用 Vitest 的 `skipIf` 条件跳过:

```typescript
const hasToken = !!process.env.TUSHARE_TOKEN;

it.skipIf(!hasToken)('需要 token 的测试', async () => {
  // 测试代码
});
```

**不要使用**运行时检查:
```typescript
// ❌ 错误做法
it('测试', async () => {
  if (!process.env.TUSHARE_TOKEN) {
    return; // 这会导致测试通过,但实际没有验证任何东西
  }
});
```

## 覆盖率报告

### 本地查看

```bash
pnpm test:coverage
```

覆盖率报告会显示在终端,并生成详细的 HTML 报告在 `coverage/` 目录。

### CI 集成

CI 会自动上传覆盖率报告到 Codecov(如果配置了)。

## 故障排查

### 集成测试失败

**错误**: `ApiError: 您的token不对，请确认。`

**原因**: 
- 环境变量 `TUSHARE_TOKEN` 未设置
- Token 无效或已过期

**解决方案**:
1. 检查 `.env` 文件是否存在且包含有效的 token
2. 验证 token 是否正确(从 https://tushare.pro 获取)
3. 如果不想运行集成测试,可以不设置 token,测试会自动跳过

### CI 测试失败

**错误**: CI 中集成测试失败

**原因**: GitHub Secret 未配置或配置错误

**解决方案**:
1. 如果想运行集成测试: 配置 `TUSHARE_TOKEN` secret
2. 如果不想运行集成测试: 不配置 secret,测试会自动跳过

## 性能基准

根据性能契约:
- 单个 API 调用应在 **5 秒**内完成
- 完整演示流程应在 **15 秒**内完成
- 峰值内存使用应小于 **100MB**

性能测试会验证这些指标。
