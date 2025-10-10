# API 文档

本文档详细介绍 @tushare/sdk 的所有公共 API。

## 目录

- [TushareClient](#tushareclient)
- [配置选项](#配置选项)
- [API 方法](#api-方法)
- [数据模型](#数据模型)
- [错误处理](#错误处理)
- [工具类](#工具类)

---

## TushareClient

核心客户端类,用于访问 Tushare API。

### 构造函数

```typescript
new TushareClient(config: TushareConfig)
```

**参数:**
- `config` - 客户端配置对象

**示例:**
```typescript
const client = new TushareClient({
  token: 'YOUR_TUSHARE_API_TOKEN',
  timeout: 30000,
  cache: { enabled: true },
});
```

### 方法

#### `query<T>(apiName, params?, fields?)`

通用查询方法,支持所有 Tushare API。

**类型签名:**
```typescript
query<T>(
  apiName: string,
  params?: Record<string, unknown>,
  fields?: string
): Promise<T[]>
```

**参数:**
- `apiName` - API 名称 (如 'stock_basic', 'daily')
- `params` - 查询参数对象 (可选)
- `fields` - 返回字段,逗号分隔 (可选)

**返回:**
- `Promise<T[]>` - 数据项数组

**示例:**
```typescript
const stocks = await client.query('stock_basic', {
  list_status: 'L',
  exchange: 'SSE',
});

const quotes = await client.query('daily', {
  ts_code: '000001.SZ',
  start_date: '20230101',
}, 'ts_code,trade_date,close');
```

---

## 配置选项

### TushareConfig

客户端配置接口。

```typescript
interface TushareConfig {
  /** Tushare API Token (必需) */
  token: string;
  
  /** API 端点 (默认: https://api.tushare.pro) */
  endpoint?: string;
  
  /** 请求超时时间 (毫秒,默认: 30000) */
  timeout?: number;
  
  /** 重试配置 */
  retry?: RetryConfig;
  
  /** 缓存配置 */
  cache?: CacheConfig;
  
  /** 并发控制 */
  concurrency?: ConcurrencyConfig;
  
  /** 日志配置 */
  logger?: Logger | { level: LogLevel };
}
```

### RetryConfig

重试机制配置。

```typescript
interface RetryConfig {
  /** 最大重试次数 (默认: 3) */
  maxRetries: number;
  
  /** 初始延迟 (毫秒,默认: 1000) */
  initialDelay: number;
  
  /** 最大延迟 (毫秒,默认: 30000) */
  maxDelay: number;
  
  /** 指数退避因子 (默认: 2) */
  backoffFactor: number;
}
```

**示例:**
```typescript
const client = new TushareClient({
  token: 'YOUR_TOKEN',
  retry: {
    maxRetries: 5,
    initialDelay: 500,
    maxDelay: 60000,
    backoffFactor: 2,
  },
});
```

### CacheConfig

缓存配置。

```typescript
interface CacheConfig {
  /** 是否启用缓存 */
  enabled: boolean;
  
  /** 缓存提供者 (可选,默认使用内存缓存) */
  provider?: CacheProvider;
  
  /** 默认 TTL (毫秒,默认: 3600000 即 1 小时) */
  ttl?: number;
}
```

**示例:**
```typescript
const client = new TushareClient({
  token: 'YOUR_TOKEN',
  cache: {
    enabled: true,
    ttl: 7200000, // 2 小时
  },
});
```

### ConcurrencyConfig

并发控制配置。

```typescript
interface ConcurrencyConfig {
  /** 最大并发数 (默认: 5) */
  maxConcurrent: number;
  
  /** 最小请求间隔 (毫秒,默认: 200) */
  minInterval: number;
}
```

**示例:**
```typescript
const client = new TushareClient({
  token: 'YOUR_TOKEN',
  concurrency: {
    maxConcurrent: 10,
    minInterval: 100,
  },
});
```

---

## API 方法

### getStockBasic

获取股票基本信息。

```typescript
getStockBasic(params?: StockBasicParams): Promise<StockBasicItem[]>
```

**参数:**
```typescript
interface StockBasicParams {
  /** 股票代码 */
  ts_code?: string;
  
  /** 上市状态: L=上市 D=退市 P=暂停 */
  list_status?: 'L' | 'D' | 'P';
  
  /** 交易所: SSE=上交所 SZSE=深交所 */
  exchange?: 'SSE' | 'SZSE';
}
```

**返回:**
```typescript
interface StockBasicItem {
  ts_code: string;      // 股票代码
  symbol: string;       // 股票简称
  name: string;         // 股票名称
  area: string;         // 地域
  industry: string;     // 行业
  list_date: string;    // 上市日期
  list_status?: 'L' | 'D' | 'P';
  exchange?: 'SSE' | 'SZSE';
}
```

**示例:**
```typescript
// 获取所有上市股票
const stocks = await client.getStockBasic({ list_status: 'L' });

// 获取上交所股票
const sseStocks = await client.getStockBasic({
  list_status: 'L',
  exchange: 'SSE',
});

// 获取特定股票
const stock = await client.getStockBasic({ ts_code: '000001.SZ' });
```

### getDailyQuote

获取日线行情数据。

```typescript
getDailyQuote(params: DailyQuoteParams): Promise<DailyQuoteItem[]>
```

**参数:**
```typescript
interface DailyQuoteParams {
  /** 股票代码 */
  ts_code?: string;
  
  /** 交易日期 (YYYYMMDD 或 YYYY-MM-DD) */
  trade_date?: string;
  
  /** 开始日期 */
  start_date?: string;
  
  /** 结束日期 */
  end_date?: string;
}
```

**返回:**
```typescript
interface DailyQuoteItem {
  ts_code: string;      // 股票代码
  trade_date: string;   // 交易日期
  open: number;         // 开盘价
  high: number;         // 最高价
  low: number;          // 最低价
  close: number;        // 收盘价
  pre_close: number;    // 昨收价
  change: number;       // 涨跌额
  pct_chg: number;      // 涨跌幅 (%)
  vol: number;          // 成交量 (手)
  amount: number;       // 成交额 (千元)
}
```

**示例:**
```typescript
// 获取指定股票的历史行情
const quotes = await client.getDailyQuote({
  ts_code: '000001.SZ',
  start_date: '20230101',
  end_date: '20231231',
});

// 获取某一天所有股票的行情
const dailyQuotes = await client.getDailyQuote({
  trade_date: '20231229',
});
```

### getFinancialData

获取财务数据。

```typescript
getFinancialData(params?: FinancialParams): Promise<FinancialItem[]>
```

**参数:**
```typescript
interface FinancialParams {
  /** 股票代码 */
  ts_code?: string;
  
  /** 报告期 (YYYYMMDD) */
  period?: string;
  
  /** 开始报告期 */
  start_date?: string;
  
  /** 结束报告期 */
  end_date?: string;
  
  /** 报告类型: 1=一季报 2=半年报 3=三季报 4=年报 */
  report_type?: 1 | 2 | 3 | 4;
}
```

**返回:**
```typescript
interface FinancialItem {
  ts_code: string;          // 股票代码
  end_date: string;         // 报告期
  ann_date: string;         // 公告日期
  report_type: 1 | 2 | 3 | 4;
  total_revenue?: number;   // 营业总收入
  revenue?: number;         // 营业收入
  net_profit?: number;      // 净利润
  total_assets?: number;    // 总资产
  total_liabilities?: number; // 总负债
  total_equity?: number;    // 股东权益
  eps?: number;             // 每股收益
  roe?: number;             // 净资产收益率
}
```

**示例:**
```typescript
// 获取指定股票的年报数据
const financial = await client.getFinancialData({
  ts_code: '000001.SZ',
  period: '20231231',
  report_type: 4,
});
```

### getTradeCalendar

获取交易日历。

```typescript
getTradeCalendar(params?: TradeCalParams): Promise<TradeCalItem[]>
```

**参数:**
```typescript
interface TradeCalParams {
  /** 交易所: SSE=上交所 SZSE=深交所 */
  exchange?: 'SSE' | 'SZSE' | 'CFFEX' | 'SHFE' | 'CZCE' | 'DCE' | 'INE';
  
  /** 开始日期 */
  start_date?: string;
  
  /** 结束日期 */
  end_date?: string;
  
  /** 是否交易: 0=休市 1=交易 */
  is_open?: '0' | '1';
}
```

**返回:**
```typescript
interface TradeCalItem {
  exchange: string;         // 交易所代码
  cal_date: string;         // 日历日期
  is_open: number;          // 是否交易
  pretrade_date?: string;   // 上一交易日
}
```

**示例:**
```typescript
// 获取2023年的交易日
const tradeDays = await client.getTradeCalendar({
  exchange: 'SSE',
  start_date: '20230101',
  end_date: '20231231',
  is_open: '1',
});
```

---

## 数据模型

所有数据模型都导出为 TypeScript 类型,可以直接导入使用:

```typescript
import type {
  StockBasicItem,
  StockBasicParams,
  DailyQuoteItem,
  DailyQuoteParams,
  FinancialItem,
  FinancialParams,
  TradeCalItem,
  TradeCalParams,
} from '@tushare/sdk';
```

---

## 错误处理

### ApiError

所有 API 错误都会抛出 `ApiError` 实例。

```typescript
class ApiError extends Error {
  /** 错误类型 */
  type: ApiErrorType;
  
  /** 错误消息 */
  message: string;
  
  /** HTTP 状态码 */
  code?: number;
  
  /** 原始错误 */
  originalError?: Error;
  
  /** 是否可重试 */
  retryable: boolean;
  
  /** 建议的重试延迟 (毫秒) */
  retryAfter?: number;
}
```

### ApiErrorType

错误类型枚举:

```typescript
enum ApiErrorType {
  /** 认证错误 (401) */
  AUTH_ERROR = 'AUTH_ERROR',
  
  /** 限流错误 (429) */
  RATE_LIMIT = 'RATE_LIMIT',
  
  /** 网络错误 */
  NETWORK_ERROR = 'NETWORK_ERROR',
  
  /** 服务器错误 (500) */
  SERVER_ERROR = 'SERVER_ERROR',
  
  /** 参数验证错误 */
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  /** 超时错误 */
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
}
```

**使用示例:**

```typescript
import { ApiError, ApiErrorType } from '@tushare/sdk';

try {
  const stocks = await client.getStockBasic();
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.type) {
      case ApiErrorType.AUTH_ERROR:
        console.error('认证失败,请检查 Token');
        break;
      case ApiErrorType.RATE_LIMIT:
        console.error(`请求频率超限,建议等待 ${error.retryAfter}ms`);
        break;
      case ApiErrorType.NETWORK_ERROR:
        console.error('网络错误,请检查网络连接');
        break;
      default:
        console.error('未知错误:', error.message);
    }
  }
}
```

---

## 工具类

### Logger

日志接口,可以自定义实现。

```typescript
interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}
```

### ConsoleLogger

内置的控制台日志实现。

```typescript
class ConsoleLogger implements Logger {
  constructor(level: LogLevel = LogLevel.INFO);
}
```

### LogLevel

日志级别枚举:

```typescript
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}
```

**使用示例:**

```typescript
import { ConsoleLogger, LogLevel } from '@tushare/sdk';

const client = new TushareClient({
  token: 'YOUR_TOKEN',
  logger: new ConsoleLogger(LogLevel.DEBUG),
});
```

### CacheProvider

缓存提供者接口,可以自定义实现。

```typescript
interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}
```

### MemoryCacheProvider

内置的内存缓存实现。

```typescript
class MemoryCacheProvider implements CacheProvider {
  constructor(maxSize?: number);
}
```

**使用示例:**

```typescript
import { MemoryCacheProvider } from '@tushare/sdk';

const cache = new MemoryCacheProvider(2000); // 最多缓存 2000 条

const client = new TushareClient({
  token: 'YOUR_TOKEN',
  cache: {
    enabled: true,
    provider: cache,
  },
});
```

### 日期工具函数

```typescript
/**
 * 格式化日期为 YYYYMMDD 格式
 */
function formatDate(date: Date | string | number): string;

/**
 * 解析 YYYYMMDD 格式的日期字符串
 */
function parseDate(dateStr: string): Date;

/**
 * 验证日期格式是否有效
 */
function isValidDateFormat(dateStr: string): boolean;
```

**使用示例:**

```typescript
import { formatDate, parseDate, isValidDateFormat } from '@tushare/sdk';

// 格式化日期
const formatted = formatDate(new Date()); // '20231229'
const formatted2 = formatDate('2023-12-29'); // '20231229'

// 解析日期
const date = parseDate('20231229'); // Date object

// 验证格式
const isValid = isValidDateFormat('20231229'); // true
const isValid2 = isValidDateFormat('2023-12-29'); // true
const isValid3 = isValidDateFormat('invalid'); // false
```

---

## 类型导出

所有公共类型都可以通过命名导入获取:

```typescript
import type {
  // 配置类型
  TushareConfig,
  RetryConfig,
  CacheConfig,
  ConcurrencyConfig,
  CacheProvider,
  Logger,
  
  // 请求/响应类型
  TushareRequest,
  TushareResponse,
  TushareResponseData,
  
  // 数据模型
  StockBasicItem,
  StockBasicParams,
  DailyQuoteItem,
  DailyQuoteParams,
  FinancialItem,
  FinancialParams,
  TradeCalItem,
  TradeCalParams,
} from '@tushare/sdk';

// 错误类型和枚举
import { ApiError, ApiErrorType, LogLevel } from '@tushare/sdk';
```

---

## 最佳实践

### 1. 使用环境变量存储 Token

```typescript
const client = new TushareClient({
  token: process.env.TUSHARE_TOKEN!,
});
```

### 2. 启用缓存提高性能

```typescript
const client = new TushareClient({
  token: process.env.TUSHARE_TOKEN!,
  cache: {
    enabled: true,
    ttl: 3600000, // 1 小时
  },
});
```

### 3. 合理配置并发控制

```typescript
const client = new TushareClient({
  token: process.env.TUSHARE_TOKEN!,
  concurrency: {
    maxConcurrent: 5,  // 根据你的积分等级调整
    minInterval: 200,   // 200ms 间隔
  },
});
```

### 4. 处理所有错误

```typescript
try {
  const stocks = await client.getStockBasic();
} catch (error) {
  if (error instanceof ApiError) {
    // 处理 API 错误
  } else {
    // 处理其他错误
  }
}
```

### 5. 使用 TypeScript 类型

```typescript
import type { StockBasicItem } from '@tushare/sdk';

function processStocks(stocks: StockBasicItem[]) {
  // TypeScript 会提供完整的类型检查和智能提示
  stocks.forEach(stock => {
    console.log(stock.name, stock.industry);
  });
}
```

---

## 更多资源

- [快速开始指南](../specs/001-tushare-typescript-sdk/quickstart.md)
- [数据模型文档](../specs/001-tushare-typescript-sdk/data-model.md)
- [API 契约](../specs/001-tushare-typescript-sdk/contracts/)
- [技术研究](../specs/001-tushare-typescript-sdk/research.md)
- [Tushare 官方文档](https://tushare.pro/document/2)
