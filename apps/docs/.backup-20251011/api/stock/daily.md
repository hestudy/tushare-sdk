---
title: getStockDaily - 获取股票日线数据
description: 获取股票的日线行情数据,包括开盘价、收盘价、最高价、最低价、成交量等
keywords: [股票, 日线, K线, getStockDaily, 行情数据]
type: api
---

# getStockDaily

获取股票的日线行情数据,包括开盘价、收盘价、最高价、最低价、成交量、成交额等完整的 K 线数据。

## 函数签名

```typescript
async function getStockDaily(
  params: StockDailyParams
): Promise<StockDaily[]>
```

## 参数

| 参数名 | 类型 | 必填 | 描述 | 默认值 | 示例 |
|--------|------|------|------|--------|------|
| params.ts_code | string | 是 | 股票代码 | - | '000001.SZ' |
| params.start_date | string | 否 | 开始日期 | - | '20240101' |
| params.end_date | string | 否 | 结束日期 | - | '20241231' |
| params.trade_date | string | 否 | 交易日期 | - | '20241010' |

:::warning 参数要求
- `ts_code` 为必填参数
- `start_date` 和 `end_date` 必须同时指定或同时不指定
- `trade_date` 与日期范围参数互斥,只能选择其一
:::

## 返回值

**类型**: `Promise<StockDaily[]>`

返回股票日线数据数组,每个对象包含以下字段:

| 字段名 | 类型 | 描述 |
|--------|------|------|
| ts_code | string | 股票代码 |
| trade_date | string | 交易日期 (YYYYMMDD) |
| open | number | 开盘价 |
| high | number | 最高价 |
| low | number | 最低价 |
| close | number | 收盘价 |
| pre_close | number | 前收盘价 |
| change | number | 涨跌额 |
| pct_chg | number | 涨跌幅 (%) |
| vol | number | 成交量 (手) |
| amount | number | 成交额 (千元) |

## 代码示例

### 获取指定日期的行情

```typescript
import { getStockDaily } from '@tushare/sdk';

// 获取平安银行 2024年10月10日的行情
const data = await getStockDaily({
  ts_code: '000001.SZ',
  trade_date: '20241010'
});

console.log(data[0]);
// {
//   ts_code: '000001.SZ',
//   trade_date: '20241010',
//   open: 12.50,
//   high: 12.80,
//   low: 12.40,
//   close: 12.75,
//   ...
// }
```

### 获取日期范围的行情

```typescript
import { getStockDaily } from '@tushare/sdk';

// 获取平安银行 2024年1月的行情数据
const data = await getStockDaily({
  ts_code: '000001.SZ',
  start_date: '20240101',
  end_date: '20240131'
});

console.log(`获取到 ${data.length} 个交易日的数据`);
data.forEach(day => {
  console.log(`${day.trade_date}: 收盘价 ${day.close}, 涨跌幅 ${day.pct_chg}%`);
});
```

### 计算移动平均线

```typescript
import { getStockDaily } from '@tushare/sdk';

// 获取最近30个交易日的数据
const data = await getStockDaily({
  ts_code: '000001.SZ',
  start_date: '20240901',
  end_date: '20241010'
});

// 计算5日均线
const ma5 = data.slice(-5).reduce((sum, day) => sum + day.close, 0) / 5;
console.log(`5日均线: ${ma5.toFixed(2)}`);

// 计算10日均线
const ma10 = data.slice(-10).reduce((sum, day) => sum + day.close, 0) / 10;
console.log(`10日均线: ${ma10.toFixed(2)}`);
```

### 筛选涨停股票

```typescript
import { getStockDaily } from '@tushare/sdk';

// 获取多只股票的数据
const codes = ['000001.SZ', '000002.SZ', '600000.SH'];
const date = '20241010';

for (const code of codes) {
  const data = await getStockDaily({
    ts_code: code,
    trade_date: date
  });
  
  if (data[0] && data[0].pct_chg >= 9.9) {
    console.log(`${code} 涨停! 涨幅: ${data[0].pct_chg}%`);
  }
}
```

## 异常处理

```typescript
import { getStockDaily } from '@tushare/sdk';

try {
  const data = await getStockDaily({
    ts_code: '000001.SZ',
    trade_date: '20241010'
  });
  console.log(data);
} catch (error) {
  if (error.name === 'ValidationError') {
    console.error('参数错误:', error.message);
  } else if (error.name === 'ApiError') {
    console.error('API 调用失败:', error.message);
  }
}
```

## 注意事项

:::tip 性能建议
- 单次查询建议不超过 1000 个交易日
- 需要大量历史数据时,建议分批查询
- 使用日期范围查询时,结果按日期倒序排列
:::

:::warning 数据说明
- 停牌日期不会返回数据
- 新股上市首日可能缺少部分字段
- 成交量单位为手(1手=100股)
- 成交额单位为千元
:::

## 相关 API

- [getStockBasic](/api/stock/basic) - 获取股票基础信息
- [getStockRealtime](/api/stock/realtime) - 获取股票实时数据
- [getStockWeekly](/api/stock/weekly) - 获取股票周线数据
- [getStockMonthly](/api/stock/monthly) - 获取股票月线数据

## 更新日志

- **v1.1.0** (2025-09-01): 优化查询性能,支持更大日期范围
- **v1.0.0** (2025-01-01): 初始版本发布
