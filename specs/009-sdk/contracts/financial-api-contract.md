# Financial API Contract

**Feature**: 009-sdk
**Date**: 2025-10-13
**Version**: 1.0.0

## Overview

本文档定义了财务数据功能的API契约,包括TushareClient类的方法签名、独立API函数签名、输入输出规范、错误处理规则等。这些契约是实现与测试的依据。

---

## 1. TushareClient类方法契约

### 1.1 getIncomeStatement

**描述**: 获取上市公司利润表数据

**方法签名**:
```typescript
class TushareClient {
  /**
   * 获取利润表数据
   *
   * 查询上市公司的利润表数据,包括营业收入、净利润、每股收益等核心财务指标。
   *
   * **权限要求**: 至少 2000 积分
   * **数据更新**: 通常在财报公告日后1-2个工作日内更新
   * **调用限制**: 仅支持单股票历史数据查询
   *
   * @param params - 查询参数
   * @returns 利润表数据列表,按报告期降序排列
   * @throws {ApiError} 当参数无效、权限不足或网络错误时抛出
   *
   * @example
   * ```typescript
   * // 查询指定公司的年报利润表
   * const data = await client.getIncomeStatement({
   *   ts_code: '000001.SZ',
   *   period: '20231231'
   * });
   * console.log(`营业收入: ${data[0].total_revenue} 元`);
   *
   * // 查询指定时间范围的利润表
   * const data2 = await client.getIncomeStatement({
   *   ts_code: '600519.SH',
   *   start_date: '20200101',
   *   end_date: '20231231'
   * });
   * ```
   */
  async getIncomeStatement(
    params?: FinancialQueryParams
  ): Promise<IncomeStatementItem[]>;
}
```

**输入契约**:
- **params**: `FinancialQueryParams | undefined`
  - 所有字段均可选
  - 如果未提供参数,抛出参数验证错误
  - 推荐至少提供 `ts_code` 或 `period`

**输出契约**:
- **返回类型**: `Promise<IncomeStatementItem[]>`
- **数组元素**: 每个元素包含94个字段(详见data-model.md)
- **排序**: 按 `end_date` 降序排列(最新报告期在前)
- **空结果**: 如果没有数据,返回空数组 `[]`,不抛出异常

**错误契约**:
| 错误类型 | 触发条件 | 错误码 | 错误信息示例 |
|---------|---------|--------|-------------|
| `ApiError` | 参数无效 | 40001 | "参数验证失败: ts_code格式不正确" |
| `ApiError` | 权限不足 | 40003 | "该接口需要至少2000积分" |
| `ApiError` | 网络错误 | 50001 | "网络请求失败: ECONNREFUSED" |
| `ApiError` | API限流 | 40002 | "请求过于频繁,请稍后再试" |

---

### 1.2 getBalanceSheet

**描述**: 获取上市公司资产负债表数据

**方法签名**:
```typescript
class TushareClient {
  /**
   * 获取资产负债表数据
   *
   * 查询上市公司的资产负债表数据,包括总资产、总负债、股东权益等关键指标。
   *
   * **权限要求**: 至少 2000 积分
   * **数据更新**: 通常在财报公告日后1-2个工作日内更新
   * **调用限制**: 仅支持单股票历史数据查询
   *
   * @param params - 查询参数
   * @returns 资产负债表数据列表,按报告期降序排列
   * @throws {ApiError} 当参数无效、权限不足或网络错误时抛出
   *
   * @example
   * ```typescript
   * // 查询指定公司的资产负债表
   * const data = await client.getBalanceSheet({
   *   ts_code: '000001.SZ',
   *   period: '20231231'
   * });
   * console.log(`总资产: ${data[0].total_assets} 元`);
   * console.log(`资产负债率: ${(data[0].total_cur_liab! + data[0].total_ncl!) / data[0].total_assets! * 100}%`);
   * ```
   */
  async getBalanceSheet(
    params?: FinancialQueryParams
  ): Promise<BalanceSheetItem[]>;
}
```

**输入契约**: 与 `getIncomeStatement` 相同

**输出契约**:
- **返回类型**: `Promise<BalanceSheetItem[]>`
- **数组元素**: 每个元素包含81个字段
- **排序**: 按 `end_date` 降序排列
- **空结果**: 返回空数组 `[]`

**错误契约**: 与 `getIncomeStatement` 相同

---

### 1.3 getCashFlow

**描述**: 获取上市公司现金流量表数据

**方法签名**:
```typescript
class TushareClient {
  /**
   * 获取现金流量表数据
   *
   * 查询上市公司的现金流量表数据,包括经营活动现金流、投资活动现金流、筹资活动现金流等。
   *
   * **权限要求**: 至少 2000 积分
   * **数据更新**: 通常在财报公告日后1-2个工作日内更新
   * **调用限制**: 仅支持单股票历史数据查询
   *
   * @param params - 查询参数
   * @returns 现金流量表数据列表,按报告期降序排列
   * @throws {ApiError} 当参数无效、权限不足或网络错误时抛出
   *
   * @example
   * ```typescript
   * // 查询指定公司的现金流量表
   * const data = await client.getCashFlow({
   *   ts_code: '000001.SZ',
   *   start_date: '20230101',
   *   end_date: '20231231'
   * });
   * console.log(`经营活动现金流: ${data[0].n_cashflow_act} 元`);
   * console.log(`自由现金流: ${data[0].free_cashflow} 元`);
   * ```
   */
  async getCashFlow(
    params?: FinancialQueryParams
  ): Promise<CashFlowItem[]>;
}
```

**输入契约**: 与 `getIncomeStatement` 相同

**输出契约**:
- **返回类型**: `Promise<CashFlowItem[]>`
- **数组元素**: 每个元素包含87个字段
- **排序**: 按 `end_date` 降序排列
- **空结果**: 返回空数组 `[]`

**错误契约**: 与 `getIncomeStatement` 相同

---

## 2. 独立API函数契约

### 2.1 getIncomeStatement (API函数)

**描述**: 独立的API函数,供TushareClient内部调用或高级用户直接使用

**函数签名**:
```typescript
/**
 * 获取利润表数据
 *
 * @param client - Tushare 客户端实例
 * @param params - 查询参数
 * @returns 利润表数据列表
 * @throws {ApiError} 当参数无效或请求失败时抛出
 *
 * @example
 * ```typescript
 * import { TushareClient } from '@hestudy/tushare-sdk';
 * import { getIncomeStatement } from '@hestudy/tushare-sdk/api/financial';
 *
 * const client = new TushareClient({ token: 'YOUR_TOKEN' });
 * const data = await getIncomeStatement(client, {
 *   ts_code: '000001.SZ',
 *   period: '20231231'
 * });
 * ```
 */
export async function getIncomeStatement(
  client: TushareClient,
  params?: FinancialQueryParams
): Promise<IncomeStatementItem[]>;
```

**实现要求**:
```typescript
export async function getIncomeStatement(
  client: TushareClient,
  params?: FinancialQueryParams
): Promise<IncomeStatementItem[]> {
  return client.query<IncomeStatementItem>(
    'income',
    params as Record<string, unknown>
  );
}
```

**契约说明**:
- 必须调用 `client.query()` 方法,以继承缓存、重试、并发控制等特性
- API名称为 `'income'`,与Tushare官方接口名称一致
- 不进行额外的数据转换,保持原始API响应结构

---

### 2.2 getBalanceSheet (API函数)

**函数签名**:
```typescript
export async function getBalanceSheet(
  client: TushareClient,
  params?: FinancialQueryParams
): Promise<BalanceSheetItem[]>;
```

**实现要求**:
```typescript
export async function getBalanceSheet(
  client: TushareClient,
  params?: FinancialQueryParams
): Promise<BalanceSheetItem[]> {
  return client.query<BalanceSheetItem>(
    'balancesheet',
    params as Record<string, unknown>
  );
}
```

**契约说明**:
- API名称为 `'balancesheet'`
- 其他要求与 `getIncomeStatement` 相同

---

### 2.3 getCashFlow (API函数)

**函数签名**:
```typescript
export async function getCashFlow(
  client: TushareClient,
  params?: FinancialQueryParams
): Promise<CashFlowItem[]>;
```

**实现要求**:
```typescript
export async function getCashFlow(
  client: TushareClient,
  params?: FinancialQueryParams
): Promise<CashFlowItem[]> {
  return client.query<CashFlowItem>(
    'cashflow',
    params as Record<string, unknown>
  );
}
```

**契约说明**:
- API名称为 `'cashflow'`
- 其他要求与 `getIncomeStatement` 相同

---

## 3. 数据类型契约

### 3.1 FinancialQueryParams

**类型定义**:
```typescript
export interface FinancialQueryParams {
  /** 股票代码 (如 000001.SZ) */
  ts_code?: string;

  /** 公告日期 (YYYYMMDD 格式) */
  ann_date?: string;

  /** 报告期开始日期 (YYYYMMDD 格式) */
  start_date?: string;

  /** 报告期结束日期 (YYYYMMDD 格式) */
  end_date?: string;

  /** 报告期 (YYYYMMDD 格式, 优先于start_date/end_date) */
  period?: string;

  /**
   * 报表类型
   * - "1": 合并报表
   * - "2": 单季合并
   * - "3": 调整单季合并
   * - "4": 调整合并
   */
  report_type?: '1' | '2' | '3' | '4';

  /**
   * 公司类型
   * - "1": 合并报表
   * - "2": 单季度
   */
  comp_type?: '1' | '2';
}
```

**验证规则**:
1. 所有日期字段必须符合 `YYYYMMDD` 格式
2. `ts_code` 必须符合 `\d{6}\.(SZ|SH|BJ)` 格式
3. `report_type` 和 `comp_type` 必须是定义的枚举值之一

---

### 3.2 IncomeStatementItem

**类型定义**: 详见 data-model.md

**必填字段**:
- `ts_code: string`
- `ann_date: string`
- `f_ann_date: string`
- `end_date: string`
- `report_type: string`
- `comp_type: string`
- `end_type: string`

**可选字段**: 其余87个财务数据字段均为可选(`number?`)

**特殊字段**:
- `update_flag: string` - 数据版本标识,"1"表示最新版本

---

### 3.3 BalanceSheetItem

**类型定义**: 详见 data-model.md

**必填字段**: 与 `IncomeStatementItem` 相同(前7个标识字段)

**可选字段**: 其余74个财务数据字段均为可选

---

### 3.4 CashFlowItem

**类型定义**: 详见 data-model.md

**必填字段**: 与 `IncomeStatementItem` 相同(前7个标识字段)

**可选字段**: 其余80个财务数据字段均为可选

---

## 4. 错误处理契约

### 4.1 错误类型

所有财务数据方法使用统一的 `ApiError` 错误类型:

```typescript
class ApiError extends Error {
  code: number;
  message: string;
  details?: Record<string, unknown>;
}
```

### 4.2 错误码规范

| 错误码 | 分类 | 说明 | 处理建议 |
|--------|------|------|---------|
| 40001 | 参数错误 | 参数格式不正确或缺失必填参数 | 检查参数格式,参考文档修正 |
| 40002 | 限流错误 | 请求频率超过限制 | 等待后重试,或调整并发控制配置 |
| 40003 | 权限错误 | 积分不足或接口无权限 | 升级账户积分 |
| 50001 | 网络错误 | 网络连接失败或超时 | 检查网络连接,SDK会自动重试 |
| 50002 | API错误 | Tushare API返回错误 | 查看error.details获取详细信息 |

### 4.3 错误处理示例

```typescript
try {
  const data = await client.getIncomeStatement({
    ts_code: '000001.SZ',
    period: '20231231'
  });
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 40003:
        console.error('权限不足:', error.message);
        // 提示用户升级积分
        break;
      case 40002:
        console.error('请求过于频繁:', error.message);
        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, 1000));
        break;
      default:
        console.error('API错误:', error.message);
    }
  }
}
```

---

## 5. 缓存行为契约

### 5.1 缓存策略

**默认行为**:
- 如果 `TushareConfig.cache.enabled = true`,财务数据查询会被缓存
- 缓存TTL默认为 1小时 (3600000ms)
- 缓存键生成规则: `${apiName}:${JSON.stringify(params)}`

**示例**:
```typescript
const client = new TushareClient({
  token: 'YOUR_TOKEN',
  cache: {
    enabled: true,
    ttl: 7200000  // 2小时
  }
});

// 第一次调用,会请求API
const data1 = await client.getIncomeStatement({ ts_code: '000001.SZ' });

// 第二次调用,会从缓存读取(如果在2小时内)
const data2 = await client.getIncomeStatement({ ts_code: '000001.SZ' });
```

### 5.2 缓存失效

**触发条件**:
1. 超过TTL时间
2. 参数不同(生成新的缓存键)
3. 手动清除缓存(如果SDK提供清除方法)

**推荐TTL设置**:
- 财务数据更新频率低,推荐TTL设置为 24小时或更长
- 示例: `ttl: 86400000` (24小时)

---

## 6. 性能契约

### 6.1 并发控制

**默认配置**:
```typescript
{
  maxConcurrent: 5,    // 最多5个并发请求
  minInterval: 200     // 请求间隔至少200ms
}
```

**契约保证**:
- SDK自动管理并发请求队列
- 超过 `maxConcurrent` 的请求会自动排队等待
- 遵守 `minInterval` 最小间隔,避免触发API限流

### 6.2 响应时间

**预期性能** (基于Tushare API实际表现):
- P50: < 500ms
- P95: < 2000ms
- P99: < 5000ms

**影响因素**:
- 网络延迟
- Tushare服务器负载
- 查询数据量(时间范围越大,响应越慢)

### 6.3 重试机制

**默认配置**:
```typescript
{
  maxRetries: 3,
  initialDelay: 1000ms,
  maxDelay: 30000ms,
  backoffFactor: 2
}
```

**重试触发条件**:
- 网络错误 (ECONNREFUSED, ETIMEDOUT 等)
- 5xx服务器错误
- 限流错误 (40002)

**不重试条件**:
- 参数错误 (40001)
- 权限错误 (40003)

---

## 7. 导出契约

### 7.1 index.ts导出规范

**必须导出的类型和函数**:
```typescript
// packages/tushare-sdk/src/index.ts

// 数据模型类型
export type {
  IncomeStatementItem,
  BalanceSheetItem,
  CashFlowItem,
  FinancialQueryParams,
  // 保留现有类型(向后兼容)
  FinancialItem,
  FinancialParams
} from './models/financial.js';

// API函数
export {
  getIncomeStatement,
  getBalanceSheet,
  getCashFlow,
  // 保留现有函数(向后兼容)
  getFinancialData
} from './api/financial.js';

// TushareClient类已在现有导出中
export { TushareClient } from './client/TushareClient.js';
```

### 7.2 使用方式

**推荐方式1: 通过TushareClient实例**
```typescript
import { TushareClient } from '@hestudy/tushare-sdk';

const client = new TushareClient({ token: 'YOUR_TOKEN' });
const data = await client.getIncomeStatement({ ts_code: '000001.SZ' });
```

**推荐方式2: 直接导入API函数**
```typescript
import { TushareClient, getIncomeStatement } from '@hestudy/tushare-sdk';

const client = new TushareClient({ token: 'YOUR_TOKEN' });
const data = await getIncomeStatement(client, { ts_code: '000001.SZ' });
```

**推荐方式3: 导入类型**
```typescript
import type {
  IncomeStatementItem,
  FinancialQueryParams
} from '@hestudy/tushare-sdk';

function analyzeIncome(data: IncomeStatementItem[]) {
  // ...
}
```

---

## 8. 测试契约

### 8.1 单元测试要求

**必须覆盖的测试场景**:

1. **正常流程测试**:
   - 查询单个股票的利润表/资产负债表/现金流量表
   - 查询指定时间范围的数据
   - 查询指定报告类型的数据

2. **边界情况测试**:
   - 空参数调用
   - 不存在的股票代码
   - 未来的报告期(无数据)
   - 无效的日期格式

3. **错误处理测试**:
   - 网络错误模拟
   - 权限不足模拟
   - 参数验证错误

4. **缓存测试**:
   - 验证缓存命中
   - 验证缓存过期

**测试实现示例**:
```typescript
describe('getIncomeStatement', () => {
  it('should return income statement data for valid params', async () => {
    const client = new TushareClient({ token: 'test_token' });
    // Mock client.query
    const data = await client.getIncomeStatement({
      ts_code: '000001.SZ',
      period: '20231231'
    });
    expect(data).toBeInstanceOf(Array);
    expect(data[0]).toHaveProperty('ts_code');
    expect(data[0]).toHaveProperty('total_revenue');
  });

  it('should return empty array for non-existent stock', async () => {
    const client = new TushareClient({ token: 'test_token' });
    const data = await client.getIncomeStatement({
      ts_code: '999999.SZ',
      period: '20231231'
    });
    expect(data).toEqual([]);
  });

  it('should throw ApiError for invalid params', async () => {
    const client = new TushareClient({ token: 'test_token' });
    await expect(
      client.getIncomeStatement({ ts_code: 'INVALID' })
    ).rejects.toThrow(ApiError);
  });
});
```

---

## 9. 版本兼容性契约

### 9.1 向后兼容保证

**承诺**:
- 现有的 `FinancialItem`、`FinancialParams`、`getFinancialData` 不会被移除
- 新增的类型和方法不会影响现有代码
- 遵循语义化版本控制 (Semantic Versioning)

**版本规划**:
- **v1.x.x**: 添加新功能(getIncomeStatement等),保持向后兼容
- **v2.x.x** (未来): 可能移除已废弃的API,需要提前在文档中标注

### 9.2 弃用策略

**当前版本**: 不弃用任何现有API

**未来弃用流程** (如果需要):
1. 在JSDoc中添加 `@deprecated` 标记
2. 在changelog中说明弃用理由和替代方案
3. 至少保留2个major版本
4. 在新major版本中移除

---

## Summary

本契约文档定义了财务数据功能的完整API规范,包括:
- **3个TushareClient方法**: getIncomeStatement、getBalanceSheet、getCashFlow
- **3个独立API函数**: 同名函数供直接调用
- **4个数据类型**: FinancialQueryParams + 3个财务报表Item类型
- **统一的错误处理**: ApiError + 标准错误码
- **完整的性能保证**: 缓存、并发控制、重试机制
- **明确的导出规范**: index.ts导出清单
- **严格的测试要求**: 单元测试覆盖率80%+

所有契约都经过充分设计,确保API的一致性、可靠性和可维护性。
