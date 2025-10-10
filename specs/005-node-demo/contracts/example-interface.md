# Example Interface Contract: 每日指标演示

**Feature**: 005-node-demo  
**Date**: 2025-10-10  
**Type**: Example Function Contract

## Overview

本文档定义每日指标演示示例的接口契约,包括函数签名、输入输出、错误处理和测试要求。

---

## Function Signature

### runDailyBasicExample

每日指标演示示例的主函数。

```typescript
/**
 * 执行每日指标查询示例
 * 
 * 演示如何使用 SDK 查询股票每日基本面指标数据,包括:
 * - 按交易日期查询全市场数据
 * - 按股票代码查询历史数据
 * - 自定义返回字段
 * 
 * @param config - 应用配置
 * @returns 查询结果统计
 * @throws {ApiError} 当 API 调用失败时抛出
 */
export async function runDailyBasicExample(
  config: AppConfig
): Promise<{
  count: number;
  sample: unknown[];
}>
```

---

## Input Contract

### 参数: config

**类型**: `AppConfig`

**字段**:
- `tushareToken`: string (必需) - Tushare API Token
- `apiBaseUrl?`: string (可选) - API 基础 URL
- `debug?`: boolean (可选) - 是否启用调试日志

**验证规则**:
- `tushareToken` 不能为空字符串
- 如果提供 `apiBaseUrl`,必须是有效的 HTTP/HTTPS URL

**示例**:
```typescript
const config: AppConfig = {
  tushareToken: 'your_token_here',
  apiBaseUrl: 'https://api.tushare.pro',
  debug: false,
};
```

---

## Output Contract

### 返回值

**类型**: `Promise<{ count: number; sample: unknown[] }>`

**字段**:
- `count`: 返回的数据总条数
- `sample`: 示例数据数组(前 3 条)

**验证规则**:
- `count` 必须为非负整数
- `sample` 数组长度必须 ≤ 3
- `sample` 数组长度必须 ≤ `count`
- 当 `count` > 0 时,`sample` 不应为空数组

**示例**:
```typescript
{
  count: 4523,
  sample: [
    {
      ts_code: '000001.SZ',
      trade_date: '20241008',
      pe: 5.23,
      pb: 0.68,
      turnover_rate: 0.45,
      total_mv: 23456789,
      // ... 其他字段
    },
    // ... 最多 3 条
  ]
}
```

---

## Behavior Contract

### 执行流程

1. **创建 SDK 客户端**
   ```typescript
   const client = new TushareClient({
     token: config.tushareToken,
     endpoint: config.apiBaseUrl,
   });
   ```

2. **场景 1: 按交易日期查询全市场数据**
   - 参数: `{ trade_date: '20241008' }`
   - 预期结果: 约 4000-5000 条数据
   - 日志: 记录请求参数和响应统计

3. **场景 2: 按股票代码查询历史数据**
   - 参数: `{ ts_code: '000001.SZ', start_date: '20240901', end_date: '20241001' }`
   - 预期结果: 约 20 条数据(一个月交易日)
   - 日志: 记录请求参数和响应统计

4. **场景 3: 自定义返回字段**
   - 参数: `{ trade_date: '20241008', fields: 'ts_code,trade_date,pe,pb,turnover_rate,total_mv' }`
   - 预期结果: 约 4000-5000 条数据,但每条数据更小
   - 日志: 记录请求参数和响应统计

5. **返回结果统计**
   - 计算总数据条数
   - 提取前 3 条作为示例
   - 返回 `{ count, sample }`

### 日志输出

**Verbose 模式下的日志**:
```
[API 请求] getDailyBasic
参数: { trade_date: '20241008' }

[API 响应] getDailyBasic
状态: 成功
数据条数: 4523
耗时: 1234ms
```

**控制台展示**:
```
=== 场景 1: 按交易日期查询全市场数据 ===
查询参数: { trade_date: '20241008' }
返回数据: 4523 条
示例数据(前 3 条):
  - 000001.SZ | 2024-10-08 | PE: 5.23 | PB: 0.68 | 换手率: 0.45% | 总市值: 23456789 万元
  - 000002.SZ | 2024-10-08 | PE: 12.45 | PB: 1.23 | 换手率: 0.78% | 总市值: 12345678 万元
  - 000004.SZ | 2024-10-08 | PE: 8.90 | PB: 0.95 | 换手率: 0.32% | 总市值: 9876543 万元
```

---

## Error Handling Contract

### 错误类型

示例函数应处理以下错误:

1. **认证错误** (`ApiError.AUTH_ERROR`)
   - 场景: Token 无效或权限不足
   - 处理: 抛出错误,由 example-runner 统一处理
   - 错误消息: "认证失败,请检查 API Token"

2. **权限不足** (`ApiError.PERMISSION_DENIED`)
   - 场景: 用户积分 < 2000
   - 处理: 抛出错误,附带权限说明
   - 错误消息: "权限不足,daily_basic 接口需要 2000+ 积分"

3. **参数错误** (`ApiError.PARAM_ERROR`)
   - 场景: 日期格式错误、股票代码不存在
   - 处理: 抛出错误,显示参数验证失败信息
   - 错误消息: "参数错误: [具体错误信息]"

4. **网络错误** (`ApiError.NETWORK_ERROR`)
   - 场景: 网络连接失败、请求超时
   - 处理: 抛出错误,建议检查网络
   - 错误消息: "网络错误,请检查网络连接"

### 特殊情况处理

**无数据返回**:
```typescript
const response = await client.getDailyBasic({ trade_date: '20241005' }); // 周六
if (response.length === 0) {
  console.log('提示: 该日期无交易数据(可能是周末或节假日)');
}
return { count: 0, sample: [] };
```

**错误处理示例**:
```typescript
try {
  const response = await client.getDailyBasic(params);
  return { count: response.length, sample: response.slice(0, 3) };
} catch (error) {
  // 错误由 example-runner 统一处理
  throw error;
}
```

---

## Performance Contract

### 响应时间

| 场景 | 目标时间 | 说明 |
|------|----------|------|
| 场景 1 (全市场) | < 10s | 约 4000-5000 条数据 |
| 场景 2 (历史数据) | < 3s | 约 20 条数据 |
| 场景 3 (自定义字段) | < 8s | 约 4000-5000 条,但数据量更小 |
| 总执行时间 | < 25s | 3 个场景总计 |

### 资源使用

| 资源 | 限制 | 说明 |
|------|------|------|
| 内存 | < 50MB | 单个示例的峰值内存使用 |
| 网络 | < 500KB | 总数据传输量(取决于查询参数) |

---

## Testing Contract

### 单元测试

**测试文件**: `tests/unit/daily-basic.test.ts`

**必须覆盖的场景**:

1. ✅ **正常流程**: 成功查询并返回数据
   ```typescript
   it('应该成功查询每日指标数据', async () => {
     const result = await runDailyBasicExample(mockConfig);
     expect(result.count).toBeGreaterThan(0);
     expect(result.sample.length).toBeLessThanOrEqual(3);
   });
   ```

2. ✅ **空数据**: 查询无交易日期
   ```typescript
   it('应该处理无数据情况', async () => {
     // Mock 返回空数组
     const result = await runDailyBasicExample(mockConfig);
     expect(result.count).toBe(0);
     expect(result.sample).toEqual([]);
   });
   ```

3. ✅ **返回值结构**: 验证返回值格式
   ```typescript
   it('应该返回正确的结构', async () => {
     const result = await runDailyBasicExample(mockConfig);
     expect(result).toHaveProperty('count');
     expect(result).toHaveProperty('sample');
     expect(Array.isArray(result.sample)).toBe(true);
   });
   ```

### 集成测试

**测试文件**: `tests/integration/daily-basic.integration.test.ts`

**必须覆盖的场景**:

1. ✅ **真实 API 调用**: 使用真实 Token 调用 API
   ```typescript
   it('应该成功调用真实 API', async () => {
     const config = loadConfig();
     const result = await runDailyBasicExample(config);
     expect(result.count).toBeGreaterThan(0);
   });
   ```

2. ✅ **权限验证**: 验证权限不足错误
   ```typescript
   it('应该处理权限不足错误', async () => {
     const config = { ...mockConfig, tushareToken: 'low_permission_token' };
     await expect(runDailyBasicExample(config)).rejects.toThrow('权限不足');
   });
   ```

3. ✅ **数据格式验证**: 验证返回数据的字段
   ```typescript
   it('应该返回正确的数据格式', async () => {
     const result = await runDailyBasicExample(config);
     const firstItem = result.sample[0] as DailyBasicItem;
     expect(firstItem).toHaveProperty('ts_code');
     expect(firstItem).toHaveProperty('trade_date');
     expect(firstItem).toHaveProperty('pe');
     expect(firstItem).toHaveProperty('pb');
   });
   ```

### E2E 测试

**测试场景**:

1. ✅ **命令行运行**: 验证 `--example=daily-basic` 参数
   ```bash
   pnpm --filter node-demo start --example=daily-basic
   # 预期: 退出码 0,输出包含 "每日指标查询"
   ```

2. ✅ **JSON 输出**: 验证 JSON 格式输出
   ```bash
   pnpm --filter node-demo start --example=daily-basic --format=json
   # 预期: 输出有效的 JSON,包含 count 和 sample 字段
   ```

3. ✅ **Verbose 模式**: 验证详细日志
   ```bash
   pnpm --filter node-demo start --example=daily-basic --verbose
   # 预期: 输出包含 "[API 请求]" 和 "[API 响应]" 日志
   ```

### 测试覆盖率

| 类型 | 目标 | 说明 |
|------|------|------|
| 行覆盖率 | ≥ 80% | 代码行覆盖 |
| 分支覆盖率 | ≥ 70% | 条件分支覆盖 |
| 函数覆盖率 | 100% | 所有导出函数 |

---

## Integration Contract

### 与现有系统集成

**1. 命令行参数集成**

需要修改 `src/index.ts`:
```typescript
// 添加到 ExampleName 类型
export type ExampleName = 
  | 'stock-list' 
  | 'daily-data' 
  | 'trade-calendar' 
  | 'daily-basic'  // 新增
  | 'all';

// 添加到示例列表
const allExamples = [
  // ... 现有示例
  {
    name: '每日指标查询',
    key: 'daily-basic' as const,
    fn: async () => runDailyBasicExample(config),
  },
];
```

**2. 类型定义集成**

需要修改 `src/types.ts`:
```typescript
export type ExampleName = 
  | 'stock-list' 
  | 'daily-data' 
  | 'trade-calendar' 
  | 'daily-basic'  // 新增
  | 'all';
```

**3. README 文档集成**

需要在 `README.md` 中添加:
```markdown
### 4. 每日指标查询 (daily-basic)

演示如何使用 `getDailyBasic` API 获取股票每日基本面指标数据。

**运行命令**:
```bash
pnpm --filter node-demo start --example=daily-basic
```

**权限要求**: 需要 2000+ 积分
```

---

## Summary

### 函数契约
- ✅ 函数签名: `runDailyBasicExample(config: AppConfig)`
- ✅ 返回值: `Promise<{ count: number; sample: unknown[] }>`
- ✅ 错误处理: 抛出 `ApiError`,由 example-runner 统一处理

### 行为契约
- ✅ 演示 3 种查询场景
- ✅ 记录详细日志(verbose 模式)
- ✅ 处理无数据情况
- ✅ 格式化输出到控制台

### 性能契约
- ✅ 总执行时间 < 25s
- ✅ 内存使用 < 50MB
- ✅ 网络传输 < 500KB

### 测试契约
- ✅ 单元测试覆盖率 ≥ 80%
- ✅ 集成测试覆盖核心场景
- ✅ E2E 测试验证命令行运行

### 集成契约
- ✅ 与现有命令行参数系统集成
- ✅ 与现有类型定义集成
- ✅ 更新 README 文档

**状态**: 示例接口契约定义完成
