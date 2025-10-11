---
title: getStockRealtime - 获取股票实时数据
description: 获取股票的实时行情数据,包括最新价、涨跌幅、成交量等实时信息
keywords: [股票, 实时行情, getStockRealtime, 实时数据]
type: api
---

# getStockRealtime

获取股票的实时行情数据,包括最新价、涨跌幅、买卖盘口、成交量等实时信息。

:::warning 重要提示
实时数据有延迟,通常延迟 3-5 秒。如需更高频率的数据,请使用 Level-2 行情接口。
:::

## 函数签名

```typescript
async function getStockRealtime(
  params: StockRealtimeParams
): Promise<StockRealtime[]>
```

## 参数

| 参数名 | 类型 | 必填 | 描述 | 默认值 | 示例 |
|--------|------|------|------|--------|------|
| params.ts_codes | string[] | 是 | 股票代码列表 | - | ['000001.SZ', '600000.SH'] |

:::tip 批量查询
- 单次最多支持查询 100 只股票
- 建议每次查询不超过 50 只,以获得更好的响应速度
:::

## 返回值

**类型**: `Promise<StockRealtime[]>`

返回股票实时数据数组,每个对象包含以下字段:

| 字段名 | 类型 | 描述 |
|--------|------|------|
| ts_code | string | 股票代码 |
| name | string | 股票名称 |
| price | number | 最新价 |
| open | number | 今开 |
| high | number | 最高 |
| low | number | 最低 |
| pre_close | number | 昨收 |
| change | number | 涨跌额 |
| pct_chg | number | 涨跌幅 (%) |
| vol | number | 成交量 (手) |
| amount | number | 成交额 (万元) |
| bid1 | number | 买一价 |
| bid1_vol | number | 买一量 (手) |
| ask1 | number | 卖一价 |
| ask1_vol | number | 卖一量 (手) |
| timestamp | string | 数据时间戳 |

## 代码示例

### 获取单只股票实时行情

```typescript
import { getStockRealtime } from '@tushare/sdk';

// 获取平安银行实时行情
const data = await getStockRealtime({
  ts_codes: ['000001.SZ']
});

const stock = data[0];
console.log(`${stock.name} (${stock.ts_code})`);
console.log(`最新价: ${stock.price}`);
console.log(`涨跌幅: ${stock.pct_chg}%`);
console.log(`成交量: ${stock.vol} 手`);
```

### 批量获取多只股票行情

```typescript
import { getStockRealtime } from '@tushare/sdk';

// 获取多只股票的实时行情
const codes = ['000001.SZ', '000002.SZ', '600000.SH', '600036.SH'];
const data = await getStockRealtime({ ts_codes: codes });

data.forEach(stock => {
  console.log(`${stock.name}: ${stock.price} (${stock.pct_chg > 0 ? '+' : ''}${stock.pct_chg}%)`);
});
```

### 实时监控涨跌幅

```typescript
import { getStockRealtime } from '@tushare/sdk';

// 每5秒刷新一次行情
const codes = ['000001.SZ', '000002.SZ'];

setInterval(async () => {
  const data = await getStockRealtime({ ts_codes: codes });
  
  console.clear();
  console.log('=== 实时行情 ===');
  console.log(`更新时间: ${new Date().toLocaleTimeString()}`);
  
  data.forEach(stock => {
    const color = stock.pct_chg > 0 ? '🔴' : stock.pct_chg < 0 ? '🟢' : '⚪';
    console.log(`${color} ${stock.name}: ${stock.price} (${stock.pct_chg}%)`);
  });
}, 5000);
```

### 筛选涨幅前三的股票

```typescript
import { getStockRealtime } from '@tushare/sdk';

// 获取自选股行情
const myCodes = [
  '000001.SZ', '000002.SZ', '600000.SH', 
  '600036.SH', '601318.SH', '000858.SZ'
];

const data = await getStockRealtime({ ts_codes: myCodes });

// 按涨跌幅排序
const sorted = data.sort((a, b) => b.pct_chg - a.pct_chg);

console.log('涨幅前三:');
sorted.slice(0, 3).forEach((stock, index) => {
  console.log(`${index + 1}. ${stock.name}: +${stock.pct_chg}%`);
});
```

### 计算买卖盘口比例

```typescript
import { getStockRealtime } from '@tushare/sdk';

const data = await getStockRealtime({
  ts_codes: ['000001.SZ']
});

const stock = data[0];

// 计算买卖比
const buyRatio = (stock.bid1_vol / (stock.bid1_vol + stock.ask1_vol) * 100).toFixed(2);
const sellRatio = (stock.ask1_vol / (stock.bid1_vol + stock.ask1_vol) * 100).toFixed(2);

console.log(`${stock.name} 盘口分析:`);
console.log(`买一: ${stock.bid1} (${stock.bid1_vol}手) - ${buyRatio}%`);
console.log(`卖一: ${stock.ask1} (${stock.ask1_vol}手) - ${sellRatio}%`);
```

## 异常处理

```typescript
import { getStockRealtime } from '@tushare/sdk';

try {
  const data = await getStockRealtime({
    ts_codes: ['000001.SZ']
  });
  console.log(data);
} catch (error) {
  if (error.name === 'ValidationError') {
    console.error('参数错误:', error.message);
  } else if (error.name === 'RateLimitError') {
    console.error('请求过于频繁,请稍后再试');
  } else {
    console.error('获取行情失败:', error.message);
  }
}
```

## 注意事项

:::warning 使用限制
- 实时数据有 3-5 秒延迟
- 请求频率限制: 每秒最多 2 次
- 单次最多查询 100 只股票
- 交易时间外返回的是最后一笔成交数据
:::

:::tip 最佳实践
- 避免过于频繁的请求,建议间隔 5 秒以上
- 批量查询时,建议每次不超过 50 只股票
- 使用 WebSocket 接口可获得更实时的数据推送
- 非交易时间段建议降低刷新频率
:::

## 交易时间说明

- **集合竞价**: 09:15 - 09:25
- **连续竞价**: 09:30 - 11:30, 13:00 - 15:00
- **尾盘集合竞价**: 14:57 - 15:00

## 相关 API

- [getStockBasic](/api/stock/basic) - 获取股票基础信息
- [getStockDaily](/api/stock/daily) - 获取股票日线数据
- [getStockTick](/api/stock/tick) - 获取股票分笔数据
- [subscribeStockRealtime](/api/stock/subscribe) - 订阅实时行情推送

## 更新日志

- **v1.2.0** (2025-10-01): 新增买卖盘口数据
- **v1.1.0** (2025-06-01): 优化查询性能,支持批量查询
- **v1.0.0** (2025-01-01): 初始版本发布
