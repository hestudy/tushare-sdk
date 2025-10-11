---
title: 快速开始
description: 通过简单的示例快速上手 Tushare SDK
---

# 快速开始

本指南将通过几个简单的示例帮助你快速上手 Tushare SDK。

## 获取 Tushare Token

在使用 SDK 之前,你需要先获取 Tushare API Token:

1. 访问 [Tushare Pro 官网](https://tushare.pro/register)
2. 注册并登录账号
3. 在个人中心获取 API Token
4. 查看你的积分等级(影响请求频率限制)

## 创建客户端

使用你的 Token 创建 `TushareClient` 实例:

```typescript
import { TushareClient } from '@hestudy/tushare-sdk';

const client = new TushareClient({
  token: 'YOUR_TUSHARE_TOKEN'
});
```

推荐使用环境变量管理 Token:

```typescript
import { TushareClient } from '@hestudy/tushare-sdk';

const client = new TushareClient({
  token: process.env.TUSHARE_TOKEN!
});
```

## 第一个示例:获取股票列表

让我们从最简单的示例开始 - 获取所有上市股票的列表:

```typescript
import { TushareClient } from '@hestudy/tushare-sdk';

async function main() {
  // 创建客户端
  const client = new TushareClient({
    token: 'YOUR_TOKEN'
  });

  try {
    // 获取所有上市股票
    const stocks = await client.getStockBasic({
      list_status: 'L'
    });

    console.log(`共有 ${stocks.length} 只上市股票`);
    console.log('前 5 只股票:');

    stocks.slice(0, 5).forEach(stock => {
      console.log(`${stock.ts_code} - ${stock.name} (${stock.industry})`);
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
000001.SZ - 平安银行 (银行)
000002.SZ - 万科A (房地产)
000004.SZ - 国华网安 (计算机)
000005.SZ - 世纪星源 (环保)
000006.SZ - 深振业A (房地产)
```

## 示例 2:获取股票日线数据

获取指定股票的历史日线数据:

```typescript
import { TushareClient } from '@hestudy/tushare-sdk';

async function main() {
  const client = new TushareClient({
    token: 'YOUR_TOKEN'
  });

  try {
    // 获取平安银行 2024 年 1 月的日线数据
    const dailyData = await client.getDailyQuote({
      ts_code: '000001.SZ',
      start_date: '20240101',
      end_date: '20240131'
    });

    console.log(`获取到 ${dailyData.length} 条数据`);
    console.log('前 3 天的行情:');

    dailyData.slice(0, 3).forEach(day => {
      console.log(`${day.trade_date}: 开${day.open} 高${day.high} 低${day.low} 收${day.close} 涨跌幅${day.pct_chg}%`);
    });
  } catch (error) {
    console.error('获取日线数据失败:', error);
  }
}

main();
```

**输出示例:**

```
获取到 20 条数据
前 3 天的行情:
20240131: 开10.52 高10.66 低10.50 收10.64 涨跌幅1.14%
20240130: 开10.58 高10.65 低10.52 收10.52 涨跌幅-0.57%
20240129: 开10.48 高10.60 低10.46 收10.58 涨跌幅0.95%
```

## 示例 3:查询交易日历

查询指定日期范围内的交易日:

```typescript
import { TushareClient } from '@hestudy/tushare-sdk';

async function main() {
  const client = new TushareClient({
    token: 'YOUR_TOKEN'
  });

  try {
    // 查询 2024 年 1 月的交易日历
    const calendar = await client.getTradeCalendar({
      exchange: 'SSE',
      start_date: '20240101',
      end_date: '20240131',
      is_open: '1'  // 只查询交易日
    });

    console.log(`2024 年 1 月共有 ${calendar.length} 个交易日:`);
    calendar.forEach(day => {
      console.log(day.cal_date);
    });
  } catch (error) {
    console.error('获取交易日历失败:', error);
  }
}

main();
```

## 示例 4:获取每日指标

获取股票的估值指标(需要至少 2000 积分):

```typescript
import { TushareClient } from '@hestudy/tushare-sdk';

async function main() {
  const client = new TushareClient({
    token: 'YOUR_TOKEN'
  });

  try {
    // 获取平安银行 2024-01-31 的每日指标
    const basicData = await client.getDailyBasic({
      ts_code: '000001.SZ',
      trade_date: '20240131'
    });

    const data = basicData[0];
    console.log('每日指标:');
    console.log(`市盈率 PE: ${data.pe?.toFixed(2)}`);
    console.log(`市净率 PB: ${data.pb?.toFixed(2)}`);
    console.log(`市销率 PS: ${data.ps?.toFixed(2)}`);
    console.log(`换手率: ${data.turnover_rate?.toFixed(2)}%`);
    console.log(`总市值: ${(data.total_mv! / 10000).toFixed(2)} 亿元`);
  } catch (error) {
    console.error('获取每日指标失败:', error);
  }
}

main();
```

## 完整示例

下面是一个完整的示例,展示如何组合使用多个 API:

```typescript
import { TushareClient } from '@hestudy/tushare-sdk';

async function analyzeStock(tsCode: string, tradeDate: string) {
  const client = new TushareClient({
    token: process.env.TUSHARE_TOKEN!
  });

  try {
    // 1. 获取股票基础信息
    const stocks = await client.getStockBasic({
      ts_code: tsCode
    });
    const stock = stocks[0];
    console.log(`\n=== ${stock.name} (${stock.ts_code}) ===`);
    console.log(`行业: ${stock.industry}`);
    console.log(`上市日期: ${stock.list_date}`);

    // 2. 获取最近的日线数据
    const quotes = await client.getDailyQuote({
      ts_code: tsCode,
      trade_date: tradeDate
    });
    const quote = quotes[0];
    console.log(`\n${tradeDate} 行情:`);
    console.log(`收盘价: ${quote.close} 元`);
    console.log(`涨跌幅: ${quote.pct_chg}%`);
    console.log(`成交额: ${(quote.amount / 100000).toFixed(2)} 亿元`);

    // 3. 获取每日指标
    const basics = await client.getDailyBasic({
      ts_code: tsCode,
      trade_date: tradeDate
    });
    const basic = basics[0];
    console.log(`\n估值指标:`);
    console.log(`市盈率: ${basic.pe?.toFixed(2)}`);
    console.log(`市净率: ${basic.pb?.toFixed(2)}`);
    console.log(`总市值: ${(basic.total_mv! / 10000).toFixed(2)} 亿元`);

  } catch (error) {
    console.error('分析失败:', error);
  }
}

// 分析平安银行
analyzeStock('000001.SZ', '20240131');
```

## 错误处理

SDK 使用 `ApiError` 类来表示 API 调用错误。建议使用 try-catch 进行错误处理:

```typescript
import { TushareClient, ApiError, ApiErrorType } from '@hestudy/tushare-sdk';

async function main() {
  const client = new TushareClient({
    token: 'YOUR_TOKEN'
  });

  try {
    const stocks = await client.getStockBasic();
    console.log(stocks);
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`错误类型: ${error.type}`);
      console.error(`错误消息: ${error.message}`);
      console.error(`HTTP 状态码: ${error.code}`);

      // 处理特定错误类型
      if (error.type === ApiErrorType.AUTH_ERROR) {
        console.error('Token 无效,请检查 API Token');
      } else if (error.type === ApiErrorType.RATE_LIMIT) {
        console.error(`请求频率超限,建议等待 ${error.retryAfter}ms 后重试`);
      }
    } else {
      console.error('未知错误:', error);
    }
  }
}

main();
```

更多错误处理信息,请查看 [错误处理指南](/guide/error-handling)。

## 使用 async/await

所有 SDK 方法都返回 Promise,推荐使用 async/await 语法:

```typescript
// ✅ 推荐
async function fetchData() {
  const stocks = await client.getStockBasic();
  return stocks;
}

// ❌ 不推荐
function fetchData() {
  return client.getStockBasic().then(stocks => {
    return stocks;
  });
}
```

## 批量请求

如果需要批量获取多个股票的数据,可以使用 `Promise.all`:

```typescript
import { TushareClient } from '@hestudy/tushare-sdk';

async function main() {
  const client = new TushareClient({
    token: 'YOUR_TOKEN'
  });

  const stockCodes = ['000001.SZ', '000002.SZ', '600000.SH'];

  try {
    // 并行请求多个股票的数据
    const allData = await Promise.all(
      stockCodes.map(code =>
        client.getDailyQuote({
          ts_code: code,
          start_date: '20240101',
          end_date: '20240131'
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

**注意**: 批量请求时需要注意 Tushare 的频率限制,建议配置合适的并发控制。

## 性能优化技巧

### 1. 启用缓存减少重复请求

对于不常变化的数据(如股票基础信息),启用缓存可以显著提高性能:

```typescript
const client = new TushareClient({
  token: 'YOUR_TOKEN',
  cache: {
    enabled: true,
    ttl: 3600000  // 缓存 1 小时
  }
});
```

### 2. 合理配置并发限制

根据 Tushare 积分等级配置并发限制,避免触发限流:

```typescript
// 2000 积分等级配置
const client = new TushareClient({
  token: 'YOUR_TOKEN',
  concurrency: {
    maxConcurrent: 5,
    minInterval: 200  // 5 次/秒
  }
});
```

更多配置选项,请查看 [配置指南](/guide/configuration)。

### 3. 使用日期过滤减少数据量

避免一次性获取过多数据:

```typescript
// ✅ 推荐 - 指定日期范围
const data = await client.getDailyQuote({
  ts_code: '000001.SZ',
  start_date: '20240101',
  end_date: '20240131'
});

// ❌ 不推荐 - 获取所有历史数据
const data = await client.getDailyQuote({
  ts_code: '000001.SZ'
});
```

### 4. 批量请求的注意事项

批量请求时,注意控制并发数量:

```typescript
// 分批处理大量请求
async function batchProcess(stockCodes: string[], batchSize = 10) {
  const results = [];

  for (let i = 0; i < stockCodes.length; i += batchSize) {
    const batch = stockCodes.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(code => client.getStockBasic({ ts_code: code }))
    );
    results.push(...batchResults);
  }

  return results;
}
```

## 常见问题

### Q: Token 错误怎么办?

A: 如果遇到认证错误,请检查:
- Token 是否正确复制(无多余空格)
- 账号是否已激活
- Token 是否已过期

### Q: 限流错误怎么办?

A: Tushare Pro 根据积分等级限制请求频率:
- 200 积分: 1 次/秒
- 2000 积分: 5 次/秒
- 5000 积分: 20 次/秒

建议根据积分等级配置并发控制,参考 [配置指南](/guide/configuration)。

### Q: 某些 API 返回空数据?

A: 可能的原因:
- 部分 API 需要更高的积分等级(如 `getDailyBasic` 需要 2000 积分)
- 查询参数不正确(如日期格式应为 YYYYMMDD)
- 查询的数据不存在(如周末查询日线数据)

### Q: 如何判断是否为交易日?

A: 使用交易日历 API:

```typescript
const calendar = await client.getTradeCalendar({
  exchange: 'SSE',
  start_date: '20240101',
  end_date: '20240101'
});

const isOpen = calendar[0]?.is_open === '1';
console.log(isOpen ? '交易日' : '休市');
```

## 下一步

现在你已经掌握了 Tushare SDK 的基本用法,接下来可以:

- [配置选项](/guide/configuration) - 了解更多高级配置
- [错误处理](/guide/error-handling) - 学习错误处理机制
- [API 文档](/api/stock/basic) - 查看所有可用的 API
