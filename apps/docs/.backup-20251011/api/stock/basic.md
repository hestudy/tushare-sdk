---
title: getStockBasic - 获取股票基础信息
description: 获取沪深两市股票的基础信息,包括股票代码、名称、上市日期等
keywords: [股票, 基础信息, getStockBasic, 股票列表]
type: api
---

# getStockBasic

获取沪深两市股票的基础信息,包括股票代码、名称、行业、上市日期等核心数据。

## 函数签名

```typescript
async function getStockBasic(
  params?: StockBasicParams
): Promise<StockBasic[]>
```

## 参数

| 参数名 | 类型 | 必填 | 描述 | 默认值 | 示例 |
|--------|------|------|------|--------|------|
| params.ts_code | string | 否 | 股票代码 | - | '000001.SZ' |
| params.name | string | 否 | 股票名称 | - | '平安银行' |
| params.list_status | string | 否 | 上市状态 | 'L' | 'L', 'D', 'P' |
| params.exchange | string | 否 | 交易所 | - | 'SSE', 'SZSE' |

### list_status 说明

- `L`: 上市
- `D`: 退市
- `P`: 暂停上市

### exchange 说明

- `SSE`: 上海证券交易所
- `SZSE`: 深圳证券交易所

## 返回值

**类型**: `Promise<StockBasic[]>`

返回股票基础信息数组,每个对象包含以下字段:

| 字段名 | 类型 | 描述 |
|--------|------|------|
| ts_code | string | 股票代码 |
| symbol | string | 股票简称 |
| name | string | 股票名称 |
| area | string | 地域 |
| industry | string | 所属行业 |
| list_date | string | 上市日期 (YYYYMMDD) |
| market | string | 市场类型 |
| exchange | string | 交易所代码 |
| curr_type | string | 交易货币 |
| list_status | string | 上市状态 |

## 代码示例

### 获取所有上市股票

```typescript
import { getStockBasic } from '@tushare/sdk';

// 获取所有上市股票
const stocks = await getStockBasic({ list_status: 'L' });
console.log(`共有 ${stocks.length} 只上市股票`);
console.log(stocks[0]);
```

### 获取指定股票信息

```typescript
import { getStockBasic } from '@tushare/sdk';

// 获取平安银行的基础信息
const stock = await getStockBasic({ ts_code: '000001.SZ' });
console.log(stock[0].name); // 平安银行
console.log(stock[0].industry); // 银行
console.log(stock[0].list_date); // 19910403
```

### 按名称搜索股票

```typescript
import { getStockBasic } from '@tushare/sdk';

// 搜索名称包含"银行"的股票
const banks = await getStockBasic({ name: '银行' });
banks.forEach(stock => {
  console.log(`${stock.name} (${stock.ts_code})`);
});
```

### 获取上海交易所股票

```typescript
import { getStockBasic } from '@tushare/sdk';

// 获取上海交易所的所有上市股票
const sseStocks = await getStockBasic({ 
  exchange: 'SSE',
  list_status: 'L'
});
console.log(`上交所共有 ${sseStocks.length} 只上市股票`);
```

## 异常处理

| 异常类型 | 描述 | 触发条件 |
|----------|------|----------|
| ApiError | API 调用失败 | 网络错误或服务端错误 |
| ValidationError | 参数验证失败 | 参数格式不正确 |
| AuthError | 认证失败 | Token 无效或过期 |

### 异常处理示例

```typescript
import { getStockBasic } from '@tushare/sdk';

try {
  const stocks = await getStockBasic({ list_status: 'L' });
  console.log(stocks);
} catch (error) {
  if (error.name === 'AuthError') {
    console.error('认证失败,请检查 API Token');
  } else if (error.name === 'ApiError') {
    console.error('API 调用失败:', error.message);
  } else {
    console.error('未知错误:', error);
  }
}
```

## 注意事项

:::tip 性能提示
不传参数时会返回所有股票(包括已退市),数据量较大(约 5000+ 条),建议使用 `list_status` 参数过滤。
:::

:::warning 重要提示
- 股票代码必须包含交易所后缀,如 `.SZ` 或 `.SH`
- 上市日期格式为 `YYYYMMDD`,如 `20210101`
- 部分字段可能为空,使用前请做空值检查
:::

## 相关 API

- [getStockDaily](/api/stock/daily) - 获取股票日线数据
- [getStockRealtime](/api/stock/realtime) - 获取股票实时数据
- [getStockCompany](/api/stock/company) - 获取上市公司基本信息

## 更新日志

- **v1.2.0** (2025-10-01): 新增 `exchange` 参数支持按交易所筛选
- **v1.0.0** (2025-01-01): 初始版本发布
