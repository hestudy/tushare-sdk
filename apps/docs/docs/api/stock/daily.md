---
title: 获取日线行情
description: 获取股票的日线行情数据,包括开盘价、收盘价、最高价、最低价、成交量等
---

# 获取日线行情

获取股票的日线行情数据,包括开盘价、收盘价、最高价、最低价、成交量、成交额等完整的 K 线数据。

**接口名称**: `daily`

## 基本用法

```typescript
import { TushareClient } from '@hestudy/tushare-sdk';

const client = new TushareClient({ token: 'YOUR_TOKEN' });

// 获取指定股票的日线行情
const quotes = await client.getDailyQuote({
  ts_code: '000001.SZ',
  start_date: '20230101',
  end_date: '20231231'
});

console.log(`查询到 ${quotes.length} 个交易日的数据`);
```

## 参数说明

### 输入参数

```typescript
interface DailyQuoteParams {
  ts_code?: string;
  trade_date?: string;
  start_date?: string;
  end_date?: string;
}
```

| 参数名 | 类型 | 必需 | 说明 | 示例 |
|--------|------|------|------|------|
| `ts_code` | `string` | ❌ | 股票代码 (与 trade_date 至少传一个) | `'000001.SZ'` |
| `trade_date` | `string` | ❌ | 交易日期 (YYYYMMDD) | `'20241010'` |
| `start_date` | `string` | ❌ | 开始日期 (YYYYMMDD) | `'20240101'` |
| `end_date` | `string` | ❌ | 结束日期 (YYYYMMDD) | `'20241231'` |

## 返回值说明

### 返回类型

```typescript
interface DailyQuoteItem {
  ts_code: string;
  trade_date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  pre_close: number;
  change: number;
  pct_chg: number;
  vol: number;
  amount: number;
}

// 方法返回 Promise<DailyQuoteItem[]>
```

| 字段名 | 类型 | 说明 | 单位/格式 |
|--------|------|------|-----------|
| `ts_code` | `string` | 股票代码 | - |
| `trade_date` | `string` | 交易日期 | `YYYYMMDD` |
| `open` | `number` | 开盘价 | 元 |
| `high` | `number` | 最高价 | 元 |
| `low` | `number` | 最低价 | 元 |
| `close` | `number` | 收盘价 | 元 |
| `pre_close` | `number` | 昨收价 | 元 |
| `change` | `number` | 涨跌额 | 元 |
| `pct_chg` | `number` | 涨跌幅 | % |
| `vol` | `number` | 成交量 | 手 (1手=100股) |
| `amount` | `number` | 成交额 | 千元 |

## 使用示例

### 示例1：获取指定日期的行情

```typescript
import { TushareClient } from '@hestudy/tushare-sdk';

const client = new TushareClient({ token: 'YOUR_TOKEN' });

// 获取平安银行 2024年10月10日的行情
const data = await client.getDailyQuote({
  ts_code: '000001.SZ',
  trade_date: '20241010'
});

if (data.length > 0) {
  const quote = data[0];
  console.log(`${quote.ts_code} ${quote.trade_date}`);
  console.log(`开盘: ${quote.open}, 收盘: ${quote.close}`);
  console.log(`涨跌幅: ${quote.pct_chg}%`);
}
```

### 示例2：查询时间范围内的日线数据

```typescript
import { TushareClient } from '@hestudy/tushare-sdk';

const client = new TushareClient({ token: 'YOUR_TOKEN' });

// 获取平安银行 2024年1月的行情数据
const data = await client.getDailyQuote({
  ts_code: '000001.SZ',
  start_date: '20240101',
  end_date: '20240131'
});

console.log(`获取到 ${data.length} 个交易日的数据`);
data.forEach(day => {
  console.log(`${day.trade_date}: 收盘价 ${day.close}, 涨跌幅 ${day.pct_chg}%`);
});
```

### 示例3：计算移动平均线

```typescript
import { TushareClient } from '@hestudy/tushare-sdk';

const client = new TushareClient({ token: 'YOUR_TOKEN' });

// 获取最近30个交易日的数据
const data = await client.getDailyQuote({
  ts_code: '000001.SZ',
  start_date: '20240901',
  end_date: '20241010'
});

// 计算5日均线
if (data.length >= 5) {
  const ma5 = data.slice(-5).reduce((sum, day) => sum + day.close, 0) / 5;
  console.log(`5日均线: ${ma5.toFixed(2)}`);
}

// 计算10日均线
if (data.length >= 10) {
  const ma10 = data.slice(-10).reduce((sum, day) => sum + day.close, 0) / 10;
  console.log(`10日均线: ${ma10.toFixed(2)}`);
}
```

## 注意事项

- `ts_code` 和 `trade_date` 至少传入一个参数
- 使用日期范围查询时,建议单次不超过 1000 个交易日
- 停牌日期不会返回数据
- 成交量单位为手 (1手=100股)
- 成交额单位为千元
- 数据每日更新

## 相关 API

- [股票基础信息](/api/stock/basic) - 获取股票列表
- [每日指标](/api/daily-basic) - 获取股票估值指标
