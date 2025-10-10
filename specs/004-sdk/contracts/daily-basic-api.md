# API Contract: getDailyBasic

**Feature**: 004-sdk  
**Date**: 2025-10-10  
**API Name**: `getDailyBasic`

## 概述

本文档定义 `getDailyBasic` 函数的 API 契约,包括函数签名、参数、返回值、错误处理等。

## 函数签名

```typescript
export async function getDailyBasic(
  client: TushareClient,
  params?: DailyBasicParams
): Promise<DailyBasicItem[]>
```

## 参数

### client: TushareClient

- **类型**: `TushareClient`
- **必选**: 是
- **说明**: Tushare 客户端实例,用于发起 API 请求
- **来源**: 由用户创建并传入

**示例**:
```typescript
import { TushareClient } from 'tushare-sdk';
const client = new TushareClient({ token: 'your_token' });
```

### params: DailyBasicParams

- **类型**: `DailyBasicParams`
- **必选**: 否
- **说明**: 查询参数对象

**结构**:
```typescript
interface DailyBasicParams {
  ts_code?: string;      // 股票代码
  trade_date?: string;   // 交易日期 (YYYYMMDD)
  start_date?: string;   // 开始日期 (YYYYMMDD)
  end_date?: string;     // 结束日期 (YYYYMMDD)
  fields?: string;       // 返回字段列表
}
```

**约束**:
- `ts_code` 和 `trade_date` 至少需要一个
- 日期格式必须是 YYYYMMDD (8位数字字符串)
- `fields` 为逗号分隔的字段名

## 返回值

### 成功响应

- **类型**: `Promise<DailyBasicItem[]>`
- **说明**: 返回每日指标数据数组

**数据结构**:
```typescript
interface DailyBasicItem {
  ts_code: string;           // 股票代码
  trade_date: string;        // 交易日期
  turnover_rate?: number;    // 换手率
  volume_ratio?: number;     // 量比
  pe?: number;               // 市盈率
  pe_ttm?: number;           // 市盈率(TTM)
  pb?: number;               // 市净率
  ps?: number;               // 市销率
  ps_ttm?: number;           // 市销率(TTM)
  dv_ratio?: number;         // 股息率
  dv_ttm?: number;           // 股息率(TTM)
  total_share?: number;      // 总股本(万股)
  float_share?: number;      // 流通股本(万股)
  free_share?: number;       // 自由流通股本(万股)
  total_mv?: number;         // 总市值(万元)
  circ_mv?: number;          // 流通市值(万元)
  turnover_rate_f?: number;  // 换手率(自由流通股)
}
```

**特征**:
- 数组长度取决于查询条件
- 按日期查询全市场:约 4000 条记录
- 按股票查询:取决于日期范围
- 空结果返回空数组 `[]`

### 错误响应

函数通过抛出异常来处理错误,由 `TushareClient` 统一处理。

**常见错误**:

1. **权限不足**
   - **场景**: 积分少于 2000
   - **错误信息**: API 返回权限错误
   - **处理**: 抛出异常

2. **参数错误**
   - **场景**: 日期格式错误、缺少必要参数
   - **错误信息**: API 返回参数错误
   - **处理**: 抛出异常

3. **网络错误**
   - **场景**: 网络超时、连接失败
   - **错误信息**: 网络相关错误
   - **处理**: 抛出异常

4. **API 限流**
   - **场景**: 请求频率过高
   - **错误信息**: API 返回限流错误
   - **处理**: 抛出异常

## 使用示例

### 示例 1: 按交易日期查询

```typescript
import { TushareClient, getDailyBasic } from 'tushare-sdk';

const client = new TushareClient({ token: 'your_token' });

// 获取 2018-07-26 所有股票的每日指标
const data = await getDailyBasic(client, {
  trade_date: '20180726'
});

console.log(`获取到 ${data.length} 条数据`);
console.log(data[0]); // 第一条记录
```

**预期输出**:
```typescript
{
  ts_code: '600230.SH',
  trade_date: '20180726',
  turnover_rate: 2.4584,
  volume_ratio: 0.72,
  pe: 8.6928,
  pb: 3.7203,
  // ... 其他字段
}
```

### 示例 2: 按股票代码查询

```typescript
// 获取指定股票的历史每日指标
const stockData = await getDailyBasic(client, {
  ts_code: '600230.SH',
  start_date: '20180101',
  end_date: '20181231'
});

console.log(`获取到 ${stockData.length} 条历史数据`);
```

### 示例 3: 自定义返回字段

```typescript
// 只获取需要的字段,减少数据传输量
const customData = await getDailyBasic(client, {
  trade_date: '20180726',
  fields: 'ts_code,trade_date,pe,pb'
});

// 返回的数据只包含指定字段
console.log(customData[0]);
// { ts_code: '600230.SH', trade_date: '20180726', pe: 8.6928, pb: 3.7203 }
```

### 示例 4: 错误处理

```typescript
try {
  const data = await getDailyBasic(client, {
    trade_date: '20180726'
  });
  console.log('查询成功:', data.length);
} catch (error) {
  console.error('查询失败:', error.message);
  // 处理错误:权限不足、参数错误、网络错误等
}
```

### 示例 5: 查询特定股票特定日期

```typescript
// 查询单只股票在特定日期的指标
const singleData = await getDailyBasic(client, {
  ts_code: '600230.SH',
  trade_date: '20180726'
});

// 返回单条记录(数组长度为1)或空数组
console.log(singleData.length); // 0 或 1
```

## 行为规范

### 1. 参数处理

- **可选参数**: `params` 参数是可选的,但实际使用时建议总是传入
- **参数验证**: 由 Tushare API 进行验证,SDK 不做额外验证
- **参数转换**: 参数直接传递给 `client.query()`,转换为 `Record<string, unknown>`

### 2. 数据返回

- **空结果**: 查询无数据时返回空数组 `[]`,不抛出异常
- **数据顺序**: 由 Tushare API 决定,通常按股票代码排序
- **数据完整性**: 所有字段都可能为 undefined,调用方需要处理

### 3. 错误处理

- **统一处理**: 所有错误由 `TushareClient` 统一处理并抛出
- **不捕获异常**: `getDailyBasic` 不捕获异常,由调用方处理
- **错误传播**: 异常直接传播到调用方

### 4. 性能特征

- **异步操作**: 函数是异步的,返回 Promise
- **网络依赖**: 性能主要取决于网络和 Tushare API 响应时间
- **数据量**: 单次最多返回 6000 条,超过需要分页

## 底层实现

```typescript
export async function getDailyBasic(
  client: TushareClient,
  params?: DailyBasicParams
): Promise<DailyBasicItem[]> {
  return client.query<DailyBasicItem>('daily_basic', params as Record<string, unknown>);
}
```

**实现说明**:
- 直接调用 `client.query()` 方法
- 传入 API 名称 `'daily_basic'`
- 使用泛型 `<DailyBasicItem>` 指定返回类型
- 参数转换为 `Record<string, unknown>` 以满足 client 接口

## 与 Tushare API 的映射

| SDK 方法 | Tushare API | 说明 |
|---------|-------------|------|
| `getDailyBasic(client, params)` | `pro.query('daily_basic', params)` | 直接映射 |
| `params.ts_code` | `ts_code` | 股票代码 |
| `params.trade_date` | `trade_date` | 交易日期 |
| `params.start_date` | `start_date` | 开始日期 |
| `params.end_date` | `end_date` | 结束日期 |
| `params.fields` | `fields` | 返回字段 |

**API 文档**: https://tushare.pro/document/2?doc_id=32

## 测试契约

### 单元测试

```typescript
describe('getDailyBasic', () => {
  it('应该调用 client.query 并传入正确的参数', async () => {
    const mockClient = {
      query: jest.fn().mockResolvedValue([])
    };
    
    await getDailyBasic(mockClient as any, {
      trade_date: '20180726'
    });
    
    expect(mockClient.query).toHaveBeenCalledWith(
      'daily_basic',
      { trade_date: '20180726' }
    );
  });
});
```

### 集成测试

```typescript
describe('getDailyBasic integration', () => {
  it('应该返回指定日期的每日指标数据', async () => {
    const client = new TushareClient({ token: process.env.TUSHARE_TOKEN });
    
    const data = await getDailyBasic(client, {
      trade_date: '20180726'
    });
    
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('ts_code');
    expect(data[0]).toHaveProperty('trade_date', '20180726');
  });
});
```

## 版本历史

- **v1.0.0** (2025-10-10): 初始版本,实现基本查询功能

## 未来扩展

可能的扩展方向(不在本次实现范围):

1. **自动分页**: 当数据超过 6000 条时自动分页查询
2. **数据缓存**: 缓存历史数据减少重复请求
3. **批量查询**: 支持批量查询多个股票或日期
4. **数据验证**: 在 SDK 层面进行参数验证,提供更友好的错误提示

## 总结

本 API 契约定义了 `getDailyBasic` 函数的完整行为规范:
- ✅ 清晰的函数签名和参数定义
- ✅ 完整的返回值和错误处理说明
- ✅ 丰富的使用示例
- ✅ 明确的行为规范和实现细节
- ✅ 可测试的契约定义
