---
title: 获取每日指标
description: 获取股票每日重要的基本面指标,包括市盈率、市净率、换手率、总市值等
---

# 获取每日指标

获取全部股票每日重要的基本面指标,可用于选股分析、报表展示等。包括换手率、市盈率、市净率、市销率、股息率、总股本、流通股本、总市值、流通市值等。

**接口名称**: `daily_basic`
**权限要求**: 至少 2000 积分

## 基本用法

```typescript
import { TushareClient } from '@hestudy/tushare-sdk';

const client = new TushareClient({ token: 'YOUR_TOKEN' });

// 获取指定日期所有股票的每日指标
const data = await client.getDailyBasic({
  trade_date: '20180726'
});

console.log(`查询到 ${data.length} 只股票的每日指标`);
```

## 参数说明

### 输入参数

```typescript
interface DailyBasicParams {
  ts_code?: string;
  trade_date?: string;
  start_date?: string;
  end_date?: string;
  fields?: string;
}
```

| 参数名 | 类型 | 必需 | 说明 | 示例 |
|--------|------|------|------|------|
| `ts_code` | `string` | ❌ | 股票代码 (与 trade_date 至少传一个) | `'000001.SZ'` |
| `trade_date` | `string` | ❌ | 交易日期 (YYYYMMDD) | `'20241010'` |
| `start_date` | `string` | ❌ | 开始日期 (YYYYMMDD) | `'20240101'` |
| `end_date` | `string` | ❌ | 结束日期 (YYYYMMDD) | `'20241231'` |
| `fields` | `string` | ❌ | 指定返回字段 (逗号分隔) | `'ts_code,trade_date,pe,pb'` |

## 返回值说明

### 返回类型

```typescript
interface DailyBasicItem {
  ts_code: string;
  trade_date: string;
  turnover_rate?: number;
  turnover_rate_f?: number;
  volume_ratio?: number;
  pe?: number;
  pe_ttm?: number;
  pb?: number;
  ps?: number;
  ps_ttm?: number;
  dv_ratio?: number;
  dv_ttm?: number;
  total_share?: number;
  float_share?: number;
  free_share?: number;
  total_mv?: number;
  circ_mv?: number;
}

// 方法返回 Promise<DailyBasicItem[]>
```

| 字段名 | 类型 | 说明 | 单位/公式 |
|--------|------|------|-----------|
| `ts_code` | `string` | 股票代码 | - |
| `trade_date` | `string` | 交易日期 | `YYYYMMDD` |
| `turnover_rate` | `number` | 换手率 | % = 成交量/流通股本 × 100% |
| `turnover_rate_f` | `number` | 换手率(自由流通股) | % |
| `volume_ratio` | `number` | 量比 | 当日成交量/过去5日平均成交量 |
| `pe` | `number` | 市盈率 | 总市值/净利润 (亏损时为空) |
| `pe_ttm` | `number` | 市盈率(TTM) | TTM = 最近12个月 (亏损时为空) |
| `pb` | `number` | 市净率 | 总市值/净资产 |
| `ps` | `number` | 市销率 | 总市值/营业收入 |
| `ps_ttm` | `number` | 市销率(TTM) | - |
| `dv_ratio` | `number` | 股息率 | % = 每股分红/股价 × 100% |
| `dv_ttm` | `number` | 股息率(TTM) | % |
| `total_share` | `number` | 总股本 | 万股 |
| `float_share` | `number` | 流通股本 | 万股 |
| `free_share` | `number` | 自由流通股本 | 万股 (剔除限售股) |
| `total_mv` | `number` | 总市值 | 万元 = 总股本 × 收盘价 |
| `circ_mv` | `number` | 流通市值 | 万元 = 流通股本 × 收盘价 |

## 使用示例

### 示例1：查询特定日期的所有股票指标

```typescript
import { TushareClient } from '@hestudy/tushare-sdk';

const client = new TushareClient({ token: 'YOUR_TOKEN' });

// 获取2024年10月10日所有股票的每日指标
const data = await client.getDailyBasic({
  trade_date: '20241010'
});

console.log(`查询到 ${data.length} 只股票的数据`);

// 筛选低市盈率股票
const lowPeStocks = data.filter(stock => stock.pe && stock.pe < 10);
console.log(`市盈率低于10的股票有 ${lowPeStocks.length} 只`);
```

### 示例2：过滤市盈率范围的股票

```typescript
import { TushareClient } from '@hestudy/tushare-sdk';

const client = new TushareClient({ token: 'YOUR_TOKEN' });

// 获取指定日期的数据
const data = await client.getDailyBasic({
  trade_date: '20241010'
});

// 筛选市盈率在10-20之间的股票
const filteredStocks = data.filter(stock => {
  if (!stock.pe) return false;
  return stock.pe >= 10 && stock.pe <= 20;
});

filteredStocks.forEach(stock => {
  console.log(`${stock.ts_code}: 市盈率 ${stock.pe}, 市净率 ${stock.pb}`);
});
```

### 示例3：批量查询并分析估值指标

```typescript
import { TushareClient } from '@hestudy/tushare-sdk';

const client = new TushareClient({ token: 'YOUR_TOKEN' });

// 获取指定股票的历史每日指标
const stockData = await client.getDailyBasic({
  ts_code: '000001.SZ',
  start_date: '20240901',
  end_date: '20241001'
});

// 计算平均市盈率
const avgPe = stockData
  .filter(d => d.pe !== undefined)
  .reduce((sum, d) => sum + (d.pe || 0), 0) / stockData.length;

console.log(`平均市盈率: ${avgPe.toFixed(2)}`);

// 查找最高和最低市盈率
const peValues = stockData.filter(d => d.pe).map(d => d.pe!);
const maxPe = Math.max(...peValues);
const minPe = Math.min(...peValues);

console.log(`最高市盈率: ${maxPe.toFixed(2)}, 最低市盈率: ${minPe.toFixed(2)}`);
```

## 注意事项

- **权限要求**: 此API需要至少 2000 积分
- `ts_code` 和 `trade_date` 参数至少传入一个
- 查询指定日期时,建议使用 `trade_date` 参数
- 查询指定股票的历史数据时,使用 `ts_code` + `start_date` + `end_date`
- 部分字段可能为空,特别是:
  - `pe` 和 `pe_ttm`: 公司亏损时为空
  - 新股上市初期部分指标可能缺失
- 数据每日更新
- 单次查询建议不超过 1000 条记录

## 相关 API

- [股票基础信息](/api/stock/basic) - 获取股票列表
- [日线行情](/api/stock/daily) - 获取股票日线数据
- [交易日历](/api/calendar) - 查询交易日
