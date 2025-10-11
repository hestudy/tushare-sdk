---
title: 获取股票基础信息
description: 查询股票列表,获取股票代码、名称、上市日期等基础信息
---

# 获取股票基础信息

查询沪深两市股票的基础信息,包括股票代码、名称、行业、上市日期等核心数据。

**接口名称**: `stock_basic`

## 基本用法

```typescript
import { TushareClient } from '@hestudy/tushare-sdk';

const client = new TushareClient({ token: 'YOUR_TOKEN' });

// 获取所有上市股票
const stocks = await client.getStockBasic({ list_status: 'L' });
console.log(`共查询到 ${stocks.length} 只上市股票`);
```

## 参数说明

### 输入参数

```typescript
interface StockBasicParams {
  /** 股票代码 */
  ts_code?: string;

  /** 上市状态 */
  list_status?: 'L' | 'D' | 'P';

  /** 交易所 */
  exchange?: 'SSE' | 'SZSE';
}
```

| 参数名 | 类型 | 必需 | 说明 | 示例 |
|--------|------|------|------|------|
| `ts_code` | `string` | ❌ | 股票代码 (TS格式) | `'000001.SZ'` |
| `list_status` | `'L' \| 'D' \| 'P'` | ❌ | 上市状态 | `'L'` (上市), `'D'` (退市), `'P'` (暂停) |
| `exchange` | `'SSE' \| 'SZSE'` | ❌ | 交易所 | `'SSE'` (上交所), `'SZSE'` (深交所) |

## 返回值说明

### 返回类型

```typescript
interface StockBasicItem {
  /** 股票代码 (如 000001.SZ) */
  ts_code: string;

  /** 股票简称 (如 000001) */
  symbol: string;

  /** 股票名称 (如 平安银行) */
  name: string;

  /** 地域 */
  area: string;

  /** 行业 */
  industry: string;

  /** 上市日期 (YYYYMMDD) */
  list_date: string;

  /** 上市状态: L上市 D退市 P暂停上市 */
  list_status?: 'L' | 'D' | 'P';

  /** 交易所: SSE上交所 SZSE深交所 */
  exchange?: 'SSE' | 'SZSE';
}

// 方法返回 Promise<StockBasicItem[]>
```

| 字段名 | 类型 | 说明 | 格式/示例 |
|--------|------|------|-----------|
| `ts_code` | `string` | 股票代码 (TS格式) | `'000001.SZ'` |
| `symbol` | `string` | 股票简称 (不含后缀) | `'000001'` |
| `name` | `string` | 股票名称 | `'平安银行'` |
| `area` | `string` | 地域 | `'深圳'` |
| `industry` | `string` | 所属行业 | `'银行'` |
| `list_date` | `string` | 上市日期 | `'19910403'` (YYYYMMDD) |
| `list_status` | `'L' \| 'D' \| 'P'` | 上市状态 | `'L'` (上市), `'D'` (退市), `'P'` (暂停) |
| `exchange` | `'SSE' \| 'SZSE'` | 交易所 | `'SSE'` (上交所), `'SZSE'` (深交所) |

## 使用示例

### 示例1:获取所有上市股票

```typescript
import { TushareClient } from '@hestudy/tushare-sdk';

const client = new TushareClient({ token: 'YOUR_TOKEN' });

const stocks = await client.getStockBasic({ list_status: 'L' });
console.log(`共有 ${stocks.length} 只上市股票`);
console.log(stocks[0]);
```

### 示例2:查询指定股票信息

```typescript
const client = new TushareClient({ token: 'YOUR_TOKEN' });

// 查询平安银行的基础信息
const stocks = await client.getStockBasic({ ts_code: '000001.SZ' });
if (stocks.length > 0) {
  const stock = stocks[0];
  console.log(`名称: ${stock.name}`);
  console.log(`行业: ${stock.industry}`);
  console.log(`上市日期: ${stock.list_date}`);
}
```

### 示例3:按交易所筛选

```typescript
const client = new TushareClient({ token: 'YOUR_TOKEN' });

// 获取上海交易所的所有上市股票
const sseStocks = await client.getStockBasic({
  exchange: 'SSE',
  list_status: 'L'
});
console.log(`上交所共有 ${sseStocks.length} 只上市股票`);

// 获取深圳交易所的所有上市股票
const szseStocks = await client.getStockBasic({
  exchange: 'SZSE',
  list_status: 'L'
});
console.log(`深交所共有 ${szseStocks.length} 只上市股票`);
```

### 示例4:错误处理

```typescript
import { TushareClient, ApiError } from '@hestudy/tushare-sdk';

const client = new TushareClient({ token: 'YOUR_TOKEN' });

try {
  const stocks = await client.getStockBasic({ list_status: 'L' });
  console.log(stocks);
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API错误: ${error.type} - ${error.message}`);
  } else {
    console.error('未知错误:', error);
  }
}
```

## 注意事项

- 不传参数时会返回所有股票(包括已退市),数据量较大(约5000+条),建议使用 `list_status` 参数过滤
- 股票代码必须包含交易所后缀,如 `.SZ` 或 `.SH`
- 上市日期格式为 `YYYYMMDD`,如 `19910403`
- 部分字段(`list_status`, `exchange`)可能为空,使用前请做空值检查

## 相关 API

- [日线行情](/api/stock/daily) - 获取股票日线数据
- [每日指标](/api/daily-basic) - 获取股票每日指标
- [交易日历](/api/calendar) - 获取交易日历
