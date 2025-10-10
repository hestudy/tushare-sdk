# Quickstart Guide: Tushare TypeScript SDK

**Version**: 1.0.0  
**Date**: 2025-10-09

## 目标

本指南帮助开发者在 5 分钟内完成 SDK 安装、配置和第一次成功的 API 调用。

---

## 前置要求

- Node.js 18+ LTS
- 有效的 Tushare API Token ([注册获取](https://tushare.pro/register))
- 积分 ≥ 2000 (基础功能要求)

---

## 安装

### 使用 npm
```bash
npm install @hestudy/tushare-sdk
```

### 使用 pnpm
```bash
pnpm add @hestudy/tushare-sdk
```

### 使用 yarn
```bash
yarn add @hestudy/tushare-sdk
```

---

## 快速开始

### 1. 基础用法 (Node.js)

```typescript
import { TushareClient } from '@hestudy/tushare-sdk';

// 创建客户端实例
const client = new TushareClient({
  token: 'YOUR_TUSHARE_API_TOKEN',
});

// 获取股票列表
async function getStocks() {
  try {
    const stocks = await client.getStockBasic({
      list_status: 'L', // L=上市 D=退市 P=暂停
      exchange: 'SSE',  // SSE=上交所 SZSE=深交所
    });
    
    console.log(`共获取 ${stocks.length} 只股票`);
    console.log('前3只股票:', stocks.slice(0, 3));
  } catch (error) {
    console.error('获取股票列表失败:', error);
  }
}

getStocks();
```

**预期输出**:
```
共获取 2000 只股票
前3只股票: [
  {
    ts_code: '600000.SH',
    symbol: '600000',
    name: '浦发银行',
    area: '上海',
    industry: '银行',
    list_date: '19991110'
  },
  // ...
]
```

---

### 2. 获取日线行情

```typescript
import { TushareClient } from '@hestudy/tushare-sdk';

const client = new TushareClient({
  token: 'YOUR_TUSHARE_API_TOKEN',
});

// 获取指定股票的历史行情
async function getDailyQuotes() {
  const quotes = await client.getDailyQuote({
    ts_code: '000001.SZ',    // 平安银行
    start_date: '20230101',   // 开始日期
    end_date: '20231231',     // 结束日期
  });
  
  console.log(`获取到 ${quotes.length} 条行情数据`);
  console.log('最新行情:', quotes[0]);
}

getDailyQuotes();
```

**预期输出**:
```
获取到 244 条行情数据
最新行情: {
  ts_code: '000001.SZ',
  trade_date: '20231229',
  open: 12.50,
  high: 12.80,
  low: 12.40,
  close: 12.75,
  pre_close: 12.45,
  change: 0.30,
  pct_chg: 2.41,
  vol: 1500000,
  amount: 190000
}
```

---

### 3. 使用通用查询方法

```typescript
// 对于任何 Tushare API，都可以使用通用的 query 方法
async function queryAnyApi() {
  // 查询交易日历
  const calendar = await client.query('trade_cal', {
    exchange: 'SSE',
    start_date: '20230101',
    end_date: '20230131',
    is_open: '1', // 仅交易日
  });
  
  console.log('2023年1月交易日:', calendar);
}
```

---

## 高级配置

### 1. 启用缓存

```typescript
const client = new TushareClient({
  token: 'YOUR_TOKEN',
  cache: {
    enabled: true,
    ttl: 3600000, // 缓存 1 小时 (毫秒)
  },
});

// 第一次调用: 发起网络请求
await client.getStockBasic({ list_status: 'L' });

// 第二次调用: 从缓存返回 (1小时内)
await client.getStockBasic({ list_status: 'L' }); // 极快!
```

---

### 2. 配置重试策略

```typescript
const client = new TushareClient({
  token: 'YOUR_TOKEN',
  retry: {
    maxRetries: 3,          // 最大重试 3 次
    initialDelay: 1000,     // 初始延迟 1 秒
    maxDelay: 30000,        // 最大延迟 30 秒
    backoffFactor: 2,       // 指数退避因子
  },
});

// 网络波动时会自动重试
await client.getDailyQuote({ ts_code: '000001.SZ' });
```

---

### 3. 并发控制

```typescript
const client = new TushareClient({
  token: 'YOUR_TOKEN',
  concurrency: {
    maxConcurrent: 5,   // 最大并发 5 个请求
    minInterval: 200,   // 最小间隔 200ms
  },
});

// 批量获取多只股票行情 (自动并发控制)
const codes = ['000001.SZ', '000002.SZ', '600000.SH'];
const results = await Promise.all(
  codes.map(ts_code => client.getDailyQuote({ ts_code }))
);
```

---

### 4. 自定义日志

```typescript
import { TushareClient, LogLevel, ConsoleLogger } from '@hestudy/tushare-sdk';

const client = new TushareClient({
  token: 'YOUR_TOKEN',
  logger: new ConsoleLogger(LogLevel.DEBUG), // 开启调试日志
});

// 或集成到现有日志系统
import winston from 'winston';

const client = new TushareClient({
  token: 'YOUR_TOKEN',
  logger: {
    debug: (msg, ...args) => winston.debug(msg, args),
    info: (msg, ...args) => winston.info(msg, args),
    warn: (msg, ...args) => winston.warn(msg, args),
    error: (msg, ...args) => winston.error(msg, args),
  },
});
```

---

### 5. 使用外部缓存 (Redis)

```typescript
import { CacheProvider } from '@hestudy/tushare-sdk';
import Redis from 'ioredis';

// 实现 CacheProvider 接口
class RedisCacheProvider implements CacheProvider {
  private redis: Redis;
  
  constructor(redis: Redis) {
    this.redis = redis;
  }
  
  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }
  
  async set<T>(key: string, value: T, ttl = 3600000): Promise<void> {
    await this.redis.set(
      key,
      JSON.stringify(value),
      'PX',
      ttl
    );
  }
  
  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }
  
  async clear(): Promise<void> {
    await this.redis.flushdb();
  }
}

// 使用 Redis 缓存
const redis = new Redis();
const client = new TushareClient({
  token: 'YOUR_TOKEN',
  cache: {
    enabled: true,
    provider: new RedisCacheProvider(redis),
  },
});
```

---

## 错误处理

### 捕获和处理错误

```typescript
import { TushareClient, ApiError, ApiErrorType } from '@hestudy/tushare-sdk';

const client = new TushareClient({ token: 'YOUR_TOKEN' });

async function handleErrors() {
  try {
    await client.getStockBasic();
  } catch (error) {
    if (error instanceof ApiError) {
      switch (error.type) {
        case ApiErrorType.AUTH_ERROR:
          console.error('认证失败，请检查 Token 是否有效');
          break;
          
        case ApiErrorType.RATE_LIMIT:
          console.error('请求频率超限，请稍后再试');
          console.log(`建议等待 ${error.retryAfter}ms`);
          break;
          
        case ApiErrorType.NETWORK_ERROR:
          console.error('网络错误，请检查网络连接');
          break;
          
        case ApiErrorType.VALIDATION_ERROR:
          console.error('参数验证失败:', error.message);
          break;
          
        default:
          console.error('未知错误:', error.message);
      }
    } else {
      console.error('非 API 错误:', error);
    }
  }
}
```

---

## 浏览器环境使用

### ⚠️ 安全警告

在浏览器环境中直接使用 SDK 会暴露你的 API Token。**强烈建议**通过后端代理服务器调用 Tushare API。

### 示例: 通过代理使用

```typescript
// 前端代码
async function getStocksViaProxy() {
  const response = await fetch('/api/tushare/stocks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_name: 'stock_basic',
      params: { list_status: 'L' },
    }),
  });
  
  return response.json();
}
```

```typescript
// 后端代理 (Express.js)
import express from 'express';
import { TushareClient } from '@hestudy/tushare-sdk';

const app = express();
const client = new TushareClient({
  token: process.env.TUSHARE_TOKEN, // 从环境变量读取
});

app.post('/api/tushare/stocks', async (req, res) => {
  try {
    const { api_name, params } = req.body;
    const data = await client.query(api_name, params);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000);
```

---

## 常见问题

### Q1: 如何获取 Tushare API Token?
访问 [Tushare 官网](https://tushare.pro/register) 注册账号，在个人中心获取 Token。

### Q2: 需要多少积分才能使用?
基础功能需要 2000 积分。可以通过关注公众号、加入 QQ 群等方式免费获取。

### Q3: 为什么请求返回空数组?
可能原因:
1. 参数错误 (如股票代码格式不对)
2. 查询日期范围内没有数据
3. 权限不足 (积分不够)

### Q4: 如何提高请求速度?
1. 启用缓存
2. 使用并发控制批量请求
3. 仅请求需要的字段 (`fields` 参数)

### Q5: 429 错误如何处理?
SDK 已内置自动重试机制。如果仍频繁遇到，请:
1. 降低并发数
2. 增大请求间隔
3. 升级积分等级

---

## 下一步

- 📖 阅读 [完整 API 文档](./contracts/tushare-api-contract.md)
- 🔍 查看 [数据模型定义](./data-model.md)
- 💡 参考 [最佳实践](./research.md#13-性能优化)
- 🐛 遇到问题? [提交 Issue](https://github.com/your-org/tushare-sdk/issues)

---

## 完整示例

```typescript
import { TushareClient, LogLevel } from '@hestudy/tushare-sdk';

// 创建配置完善的客户端
const client = new TushareClient({
  token: process.env.TUSHARE_TOKEN!,
  timeout: 30000,
  retry: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffFactor: 2,
  },
  cache: {
    enabled: true,
    ttl: 3600000, // 1 小时
  },
  concurrency: {
    maxConcurrent: 5,
    minInterval: 200,
  },
  logger: {
    level: LogLevel.INFO,
  },
});

// 实际应用场景: 获取股票基本面分析数据
async function analyzeStock(tsCode: string) {
  try {
    // 1. 获取股票基本信息
    const [stockInfo] = await client.getStockBasic({ ts_code: tsCode });
    console.log('股票信息:', stockInfo);
    
    // 2. 获取最近 30 天行情
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    const quotes = await client.getDailyQuote({
      ts_code: tsCode,
      start_date: formatDate(startDate),
      end_date: formatDate(endDate),
    });
    console.log(`获取到 ${quotes.length} 条行情数据`);
    
    // 3. 计算平均价格
    const avgPrice = quotes.reduce((sum, q) => sum + q.close, 0) / quotes.length;
    console.log('30天平均价格:', avgPrice.toFixed(2));
    
    // 4. 获取最新财务数据
    const financial = await client.query('income', {
      ts_code: tsCode,
      period: '20231231',
    });
    console.log('财务数据:', financial[0]);
    
    return {
      stock: stockInfo,
      quotes,
      avgPrice,
      financial: financial[0],
    };
  } catch (error) {
    console.error('分析失败:', error);
    throw error;
  }
}

// 日期格式化辅助函数
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

// 执行分析
analyzeStock('000001.SZ')
  .then(result => console.log('分析完成:', result))
  .catch(error => console.error('分析失败:', error));
```

**预期输出**:
```
股票信息: { ts_code: '000001.SZ', name: '平安银行', ... }
获取到 21 条行情数据
30天平均价格: 12.65
财务数据: { revenue: 189234567890, n_income: 45678901234, ... }
分析完成: { stock: {...}, quotes: [...], avgPrice: 12.65, financial: {...} }
```

---

**成功! 🎉** 你已经完成了第一次 Tushare SDK 调用。探索更多功能，构建强大的金融数据应用!
