---
title: 获取交易日历
description: 获取各大交易所的交易日历,查询指定日期是否为交易日
---

# 获取交易日历

获取各大交易所的交易日历数据,可用于判断某日是否为交易日、获取上一交易日等。

**接口名称**: `trade_cal`

## 基本用法

```typescript
import { TushareClient } from '@hestudy/tushare-sdk';

const client = new TushareClient({ token: 'YOUR_TOKEN' });

// 获取上交所的交易日历
const calendar = await client.getTradeCalendar({
  exchange: 'SSE',
  start_date: '20230101',
  end_date: '20231231',
  is_open: '1' // 仅交易日
});

console.log(`2023年共有 ${calendar.length} 个交易日`);
```

## 参数说明

### 输入参数

```typescript
interface TradeCalParams {
  exchange?: 'SSE' | 'SZSE' | 'CFFEX' | 'SHFE' | 'CZCE' | 'DCE' | 'INE';
  start_date?: string;
  end_date?: string;
  is_open?: '0' | '1';
}
```

| 参数名 | 类型 | 必需 | 说明 | 取值示例 |
|--------|------|------|------|----------|
| `exchange` | `string` | ❌ | 交易所代码 | `'SSE'` (上交所), `'SZSE'` (深交所), `'CFFEX'` (中金所), `'SHFE'` (上期所), `'CZCE'` (郑商所), `'DCE'` (大商所), `'INE'` (上能源) |
| `start_date` | `string` | ❌ | 开始日期 (YYYYMMDD) | `'20240101'` |
| `end_date` | `string` | ❌ | 结束日期 (YYYYMMDD) | `'20241231'` |
| `is_open` | `string` | ❌ | 是否交易日 | `'0'` (休市), `'1'` (交易) |

## 返回值说明

### 返回类型

```typescript
interface TradeCalItem {
  exchange: string;
  cal_date: string;
  is_open: number;
  pretrade_date?: string;
}

// 方法返回 Promise<TradeCalItem[]>
```

| 字段名 | 类型 | 说明 | 格式/取值 |
|--------|------|------|-----------|
| `exchange` | `string` | 交易所代码 | `'SSE'`, `'SZSE'` 等 |
| `cal_date` | `string` | 日历日期 | `YYYYMMDD` (如 `'20240101'`) |
| `is_open` | `number` | 是否交易日 | `0` (休市), `1` (交易) |
| `pretrade_date` | `string` | 上一交易日 | `YYYYMMDD` (可能为空) |

## 使用示例

### 示例1：查询特定交易所的交易日

```typescript
import { TushareClient } from '@hestudy/tushare-sdk';

const client = new TushareClient({ token: 'YOUR_TOKEN' });

// 查询上交所2024年10月的所有交易日
const tradeDays = await client.getTradeCalendar({
  exchange: 'SSE',
  start_date: '20241001',
  end_date: '20241031',
  is_open: '1'
});

console.log(`2024年10月共有 ${tradeDays.length} 个交易日`);
tradeDays.forEach(day => {
  console.log(`交易日: ${day.cal_date}`);
});
```

### 示例2：判断某日是否为交易日

```typescript
import { TushareClient } from '@hestudy/tushare-sdk';

const client = new TushareClient({ token: 'YOUR_TOKEN' });

// 判断2024年10月1日是否为交易日
const calendar = await client.getTradeCalendar({
  exchange: 'SSE',
  start_date: '20241001',
  end_date: '20241001'
});

if (calendar.length > 0) {
  const day = calendar[0];
  if (day.is_open === 1) {
    console.log(`${day.cal_date} 是交易日`);
  } else {
    console.log(`${day.cal_date} 不是交易日`);
    if (day.pretrade_date) {
      console.log(`上一交易日: ${day.pretrade_date}`);
    }
  }
}
```

### 示例3：获取下一个交易日

```typescript
import { TushareClient } from '@hestudy/tushare-sdk';

const client = new TushareClient({ token: 'YOUR_TOKEN' });

// 从当前日期开始,查询未来10天内的交易日
const today = '20241010';
const endDate = '20241020';

const tradeDays = await client.getTradeCalendar({
  exchange: 'SSE',
  start_date: today,
  end_date: endDate,
  is_open: '1'
});

if (tradeDays.length > 0) {
  // 获取下一个交易日 (跳过今天如果今天是交易日)
  const nextTradeDay = tradeDays.find(day => day.cal_date > today);
  if (nextTradeDay) {
    console.log(`下一个交易日: ${nextTradeDay.cal_date}`);
  }
}
```

## 注意事项

- 不传入任何参数时,将返回所有交易所的全部日历数据
- 建议指定 `exchange` 参数以提高查询效率
- `is_open` 参数可用于筛选交易日或休市日
- 数据包含节假日、周末等非交易日
- 数据每日更新

## 相关 API

- [股票基础信息](/api/stock/basic) - 获取股票列表
- [日线行情](/api/stock/daily) - 获取股票日线数据
