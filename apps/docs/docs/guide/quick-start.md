---
title: 快速开始
description: 通过简单的示例快速上手 Tushare SDK
---

# 快速开始

本指南将通过几个简单的示例帮助你快速上手 Tushare SDK。

## 前置条件

在开始之前,请确保:

1. 已经[安装](/guide/installation)了 Tushare SDK
2. 已经注册 Tushare 账号并获取了 API Token
3. 已经[配置](/guide/configuration)了 API Token

## 第一个示例:获取股票列表

让我们从最简单的示例开始 - 获取所有上市股票的列表:

```typescript
import { getStockBasic } from '@tushare/sdk';

async function main() {
  try {
    // 获取所有上市股票
    const stocks = await getStockBasic({ list_status: 'L' });
    
    console.log(`共有 ${stocks.length} 只上市股票`);
    console.log('前 5 只股票:');
    
    stocks.slice(0, 5).forEach(stock => {
      console.log(`${stock.ts_code} - ${stock.name}`);
    });
  } catch (error) {
    console.error('获取股票列表失败:', error);
  }
}

main();
```

**输出示例:**

```
共有 5234 只上市股票
前 5 只股票:
000001.SZ - 平安银行
000002.SZ - 万科A
000004.SZ - 国华网安
000005.SZ - 世纪星源
000006.SZ - 深振业A
```

## 示例 2:获取股票日线数据

获取指定股票的历史日线数据:

```typescript
import { getStockDaily } from '@tushare/sdk';

async function main() {
  try {
    // 获取平安银行最近 10 天的日线数据
    const dailyData = await getStockDaily({
      ts_code: '000001.SZ',
      start_date: '20240101',
      end_date: '20241231'
    });
    
    console.log(`获取到 ${dailyData.length} 条数据`);
    console.log('最近 3 天的收盘价:');
    
    dailyData.slice(0, 3).forEach(day => {
      console.log(`${day.trade_date}: ${day.close} 元`);
    });
  } catch (error) {
    console.error('获取日线数据失败:', error);
  }
}

main();
```

## 示例 3:获取基金净值

获取指定基金的净值数据:

```typescript
import { getFundNav } from '@tushare/sdk';

async function main() {
  try {
    // 获取易方达消费行业股票基金的净值
    const navData = await getFundNav({
      ts_code: '110022.OF',
      start_date: '20240101',
      end_date: '20241231'
    });
    
    console.log('最新净值信息:');
    const latest = navData[0];
    console.log(`净值日期: ${latest.nav_date}`);
    console.log(`单位净值: ${latest.unit_nav}`);
    console.log(`累计净值: ${latest.accum_nav}`);
  } catch (error) {
    console.error('获取基金净值失败:', error);
  }
}

main();
```

## 示例 4:获取财务数据

获取上市公司的利润表数据:

```typescript
import { getIncome } from '@tushare/sdk';

async function main() {
  try {
    // 获取平安银行 2024 年第三季度的利润表
    const incomeData = await getIncome({
      ts_code: '000001.SZ',
      period: '20240930'
    });
    
    const data = incomeData[0];
    console.log('2024Q3 财务数据:');
    console.log(`营业收入: ${(data.revenue / 100000000).toFixed(2)} 亿元`);
    console.log(`净利润: ${(data.n_income_attr_p / 100000000).toFixed(2)} 亿元`);
    console.log(`营业利润率: ${((data.operate_profit / data.revenue) * 100).toFixed(2)}%`);
  } catch (error) {
    console.error('获取财务数据失败:', error);
  }
}

main();
```

## 错误处理

SDK 会抛出不同类型的错误,建议使用 try-catch 进行错误处理:

```typescript
import { getStockBasic, ApiError, ValidationError } from '@tushare/sdk';

async function main() {
  try {
    const stocks = await getStockBasic({ list_status: 'L' });
    console.log(stocks);
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('API 调用失败:', error.message);
      console.error('状态码:', error.statusCode);
    } else if (error instanceof ValidationError) {
      console.error('参数验证失败:', error.message);
    } else {
      console.error('未知错误:', error);
    }
  }
}

main();
```

## 使用 async/await

所有 SDK 方法都返回 Promise,推荐使用 async/await 语法:

```typescript
// ✅ 推荐
async function fetchData() {
  const stocks = await getStockBasic();
  return stocks;
}

// ❌ 不推荐
function fetchData() {
  return getStockBasic().then(stocks => {
    return stocks;
  });
}
```

## 批量请求

如果需要批量获取多个股票的数据,可以使用 `Promise.all`:

```typescript
import { getStockDaily } from '@tushare/sdk';

async function main() {
  const stockCodes = ['000001.SZ', '000002.SZ', '600000.SH'];
  
  try {
    // 并行请求多个股票的数据
    const allData = await Promise.all(
      stockCodes.map(code => 
        getStockDaily({
          ts_code: code,
          start_date: '20240101',
          end_date: '20241231'
        })
      )
    );
    
    allData.forEach((data, index) => {
      console.log(`${stockCodes[index]}: ${data.length} 条数据`);
    });
  } catch (error) {
    console.error('批量请求失败:', error);
  }
}

main();
```

## 性能优化建议

1. **使用日期范围过滤**: 避免一次性获取过多数据

```typescript
// ✅ 推荐 - 指定日期范围
const data = await getStockDaily({
  ts_code: '000001.SZ',
  start_date: '20240101',
  end_date: '20240131'
});

// ❌ 不推荐 - 获取所有历史数据
const data = await getStockDaily({
  ts_code: '000001.SZ'
});
```

2. **使用参数过滤**: 只获取需要的数据

```typescript
// ✅ 推荐 - 只获取上市股票
const stocks = await getStockBasic({ list_status: 'L' });

// ❌ 不推荐 - 获取所有状态的股票
const stocks = await getStockBasic();
```

3. **合理使用缓存**: 对于不常变化的数据,可以缓存结果

```typescript
let cachedStocks: StockBasic[] | null = null;

async function getStocks() {
  if (cachedStocks) {
    return cachedStocks;
  }
  
  cachedStocks = await getStockBasic({ list_status: 'L' });
  return cachedStocks;
}
```

## 下一步

现在你已经掌握了 Tushare SDK 的基本用法,接下来可以:

- 📚 [查看完整的 API 文档](/api/stock/basic) - 了解所有可用的 API
- ⚙️ [配置选项](/guide/configuration) - 了解更多配置选项
- 📝 [查看更新日志](/changelog) - 了解最新版本的变化

如果遇到问题,欢迎在 [GitHub Issues](https://github.com/your-org/tushare-sdk/issues) 提问。
