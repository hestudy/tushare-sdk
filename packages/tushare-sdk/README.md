# @hestudy/tushare-sdk

[![npm version](https://img.shields.io/npm/v/@hestudy/tushare-sdk.svg)](https://www.npmjs.com/package/@hestudy/tushare-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

TypeScript SDK for [Tushare Pro](https://tushare.pro) - 为 Node.js 和浏览器提供类型安全的金融数据访问能力。

## ✨ 特性

- 🎯 **完整的 TypeScript 类型定义** - 严格模式,零 any 类型泄漏
- 🚀 **现代化工具链** - 基于 rslib + Vitest
- 🔄 **自动重试机制** - 指数退避 + 抖动算法,智能处理限流
- 💾 **可插拔缓存** - 内置内存缓存,支持 Redis 等外部缓存
- 🌐 **多环境支持** - Node.js 18+ 和现代浏览器
- 📝 **完整的 JSDoc 注释** - 提供最佳 IDE 智能提示
- ⚡ **高性能** - 并发控制 + 请求优化,打包体积 < 50KB
- 🧪 **测试覆盖率 ≥ 80%** - 单元测试 + 集成测试 + 契约测试

## 📦 安装

```bash
# 使用 pnpm (推荐)
pnpm add @hestudy/tushare-sdk

# 使用 npm
npm install @hestudy/tushare-sdk

# 使用 yarn
yarn add @hestudy/tushare-sdk
```

## 🚀 快速开始

### 基础用法

```typescript
import { TushareClient } from '@hestudy/tushare-sdk';

// 创建客户端实例
const client = new TushareClient({
  token: 'YOUR_TUSHARE_API_TOKEN',
});

// 获取股票列表
const stocks = await client.getStockBasic({
  list_status: 'L', // L=上市 D=退市 P=暂停
  exchange: 'SSE',  // SSE=上交所 SZSE=深交所
});

console.log(`共获取 ${stocks.length} 只股票`);
```

### 获取日线行情

```typescript
// 获取指定股票的历史行情
const quotes = await client.getDailyQuote({
  ts_code: '000001.SZ',    // 平安银行
  start_date: '20230101',   // 开始日期
  end_date: '20231231',     // 结束日期
});

console.log(`获取到 ${quotes.length} 条行情数据`);
```

### 财务数据分析

```typescript
// 获取公司三大财务报表
const [incomeData, balanceData, cashflowData] = await Promise.all([
  client.getIncomeStatement({ ts_code: '600519.SH', period: '20231231' }),
  client.getBalanceSheet({ ts_code: '600519.SH', period: '20231231' }),
  client.getCashFlow({ ts_code: '600519.SH', period: '20231231' }),
]);

if (incomeData.length > 0 && balanceData.length > 0 && cashflowData.length > 0) {
  const income = incomeData[0];
  const balance = balanceData[0];
  const cashflow = cashflowData[0];

  // 盈利能力分析
  const netProfitMargin = ((income.n_income_attr_p! / income.total_revenue!) * 100).toFixed(2);
  console.log(`净利率: ${netProfitMargin}%`);

  // 偿债能力分析
  const currentRatio = (balance.total_cur_assets! / balance.total_cur_liab!).toFixed(2);
  console.log(`流动比率: ${currentRatio}`);

  // 现金流分析
  const operCashFlow = cashflow.n_cashflow_act || 0;
  console.log(`经营现金流: ${operCashFlow.toLocaleString()}元`);
}
```

### 高级配置

```typescript
const client = new TushareClient({
  token: 'YOUR_TOKEN',
  timeout: 30000,
  
  // 启用缓存
  cache: {
    enabled: true,
    ttl: 3600000, // 缓存 1 小时
  },
  
  // 配置重试
  retry: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffFactor: 2,
  },
  
  // 并发控制
  concurrency: {
    maxConcurrent: 5,
    minInterval: 200,
  },
  
  // 日志配置
  logger: {
    level: LogLevel.INFO,
  },
});
```

## 📚 API 文档

### 核心方法

#### `getStockBasic(params?)`
获取股票基本信息

```typescript
const stocks = await client.getStockBasic({
  list_status: 'L',
  exchange: 'SSE',
});
```

#### `getDailyQuote(params)`
获取日线行情数据

```typescript
const quotes = await client.getDailyQuote({
  ts_code: '000001.SZ',
  start_date: '20230101',
  end_date: '20231231',
});
```

#### `getFinancialData(params)`
获取财务数据(通用接口)

```typescript
const financial = await client.getFinancialData({
  ts_code: '000001.SZ',
  period: '20231231',
});
```

#### `getIncomeStatement(params?)`
获取利润表数据(94个字段完整类型定义)

**权限要求**: 至少 2000 积分

```typescript
const incomeData = await client.getIncomeStatement({
  ts_code: '000001.SZ',
  period: '20231231',
});

console.log(`营业总收入: ${incomeData[0].total_revenue}`);
console.log(`净利润: ${incomeData[0].n_income_attr_p}`);
console.log(`基本每股收益: ${incomeData[0].basic_eps}`);
```

#### `getBalanceSheet(params?)`
获取资产负债表数据(81个字段完整类型定义)

**权限要求**: 至少 2000 积分

```typescript
const balanceData = await client.getBalanceSheet({
  ts_code: '600519.SH',
  period: '20231231',
});

console.log(`总资产: ${balanceData[0].total_assets}`);
console.log(`流动资产: ${balanceData[0].total_cur_assets}`);
console.log(`流动负债: ${balanceData[0].total_cur_liab}`);

// 计算流动比率
const currentRatio = balanceData[0].total_cur_assets! / balanceData[0].total_cur_liab!;
console.log(`流动比率: ${currentRatio.toFixed(2)}`);
```

#### `getCashFlow(params?)`
获取现金流量表数据(87个字段完整类型定义)

**权限要求**: 至少 2000 积分

```typescript
const cashflowData = await client.getCashFlow({
  ts_code: '000001.SZ',
  start_date: '20230101',
  end_date: '20231231',
});

console.log(`经营活动现金流: ${cashflowData[0].n_cashflow_act}`);
console.log(`投资活动现金流: ${cashflowData[0].n_cashflow_inv_act}`);
console.log(`筹资活动现金流: ${cashflowData[0].n_cash_flows_fnc_act}`);
console.log(`自由现金流: ${cashflowData[0].free_cashflow}`);
```

#### `getTradeCalendar(params?)`
获取交易日历

```typescript
const calendar = await client.getTradeCalendar({
  exchange: 'SSE',
  start_date: '20230101',
  end_date: '20231231',
  is_open: '1', // 仅交易日
});
```

#### `query<T>(apiName, params?, fields?)`
通用查询方法,支持所有 Tushare API

```typescript
const data = await client.query('stock_basic', {
  list_status: 'L',
});
```

## 🔧 高级功能

### 自定义缓存提供者

```typescript
import { CacheProvider } from '@hestudy/tushare-sdk';
import Redis from 'ioredis';

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
    await this.redis.set(key, JSON.stringify(value), 'PX', ttl);
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

### 错误处理

```typescript
import { ApiError, ApiErrorType } from '@hestudy/tushare-sdk';

try {
  await client.getStockBasic();
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.type) {
      case ApiErrorType.AUTH_ERROR:
        console.error('认证失败,请检查 Token');
        break;
      case ApiErrorType.RATE_LIMIT:
        console.error('请求频率超限');
        break;
      case ApiErrorType.NETWORK_ERROR:
        console.error('网络错误');
        break;
      default:
        console.error('未知错误:', error.message);
    }
  }
}
```

## 🌐 浏览器环境

⚠️ **安全警告**: 在浏览器环境中直接使用 SDK 会暴露你的 API Token。**强烈建议**通过后端代理服务器调用 Tushare API。

### 通过代理使用

```typescript
// 前端代码
async function getStocks() {
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

// 后端代理 (Express.js)
import express from 'express';
import { TushareClient } from '@hestudy/tushare-sdk';

const app = express();
const client = new TushareClient({
  token: process.env.TUSHARE_TOKEN,
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
```

## 📖 完整文档

### SDK核心功能
- [快速开始指南](../../specs/001-tushare-typescript-sdk/quickstart.md)
- [API 契约](../../specs/001-tushare-typescript-sdk/contracts/)
- [数据模型](../../specs/001-tushare-typescript-sdk/data-model.md)
- [技术研究](../../specs/001-tushare-typescript-sdk/research.md)

### 财务数据功能
- [财务数据快速开始](../../specs/009-sdk/quickstart.md) - 5-10分钟快速入门
- [财务数据模型](../../specs/009-sdk/data-model.md) - 三大报表完整字段说明(262个字段)
- [财务API契约](../../specs/009-sdk/contracts/) - API规范和测试要求
- [财务数据研究](../../specs/009-sdk/research.md) - 技术决策和设计思路

## 🧪 测试

```bash
# 运行所有测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm test:coverage

# 运行特定测试文件
pnpm test tests/unit/client.test.ts
```

## 🛠️ 开发

```bash
# 安装依赖
pnpm install

# 构建
pnpm build

# 监听模式构建
pnpm build:watch

# 代码检查
pnpm lint

# 格式化代码
pnpm format
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request!

## 📧 支持

- 官网: [https://tushare.pro](https://tushare.pro)
- 文档: [https://tushare.pro/document/2](https://tushare.pro/document/2)
- GitHub Issues: [提交问题](https://github.com/hestudy/tushare-sdk/issues)

## 🙏 致谢

感谢 [Tushare](https://tushare.pro) 提供优质的金融数据服务。
