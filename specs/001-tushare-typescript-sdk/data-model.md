# Data Model: Tushare TypeScript SDK

**Branch**: `001-tushare-typescript-sdk` | **Date**: 2025-10-09  
**Status**: Phase 1 Design

## 核心实体

### 1. TushareClient (核心客户端)

**职责**: SDK 的主入口，管理 API 连接、认证、请求调度

**属性**:
```typescript
class TushareClient {
  private config: TushareConfig;
  private httpClient: HttpClient;
  private cache?: CacheProvider;
  private logger: Logger;
  private retryService: RetryService;
  private concurrencyLimiter: ConcurrencyLimiter;
}
```

**方法**:
- `constructor(config: TushareConfig)`
- `query<T>(apiName: string, params?: Record<string, any>, fields?: string): Promise<T[]>`
- `getStockBasic(params?: StockBasicParams): Promise<StockBasicItem[]>`
- `getDailyQuote(params: DailyQuoteParams): Promise<DailyQuoteItem[]>`
- `getFinancialData(params: FinancialParams): Promise<FinancialItem[]>`

**状态转换**: 无状态 (每次请求独立)

---

### 2. TushareConfig (配置对象)

**职责**: 存储客户端配置

**属性**:
```typescript
interface TushareConfig {
  /** Tushare API Token (必需) */
  token: string;
  
  /** API 端点 (默认: https://api.tushare.pro) */
  endpoint?: string;
  
  /** 请求超时时间 (毫秒，默认: 30000) */
  timeout?: number;
  
  /** 重试配置 */
  retry?: RetryConfig;
  
  /** 缓存配置 */
  cache?: {
    enabled: boolean;
    provider?: CacheProvider;
    ttl?: number; // 默认 TTL (毫秒)
  };
  
  /** 并发控制 */
  concurrency?: {
    maxConcurrent: number; // 最大并发数
    minInterval: number;   // 最小请求间隔 (毫秒)
  };
  
  /** 日志配置 */
  logger?: Logger | {
    level: LogLevel;
  };
}
```

**验证规则**:
- `token`: 必需，非空字符串
- `timeout`: >= 1000
- `retry.maxRetries`: >= 0, <= 10
- `concurrency.maxConcurrent`: >= 1, <= 50
- `concurrency.minInterval`: >= 0

---

### 3. StockData (股票基础数据)

**职责**: 表示股票基本信息

**属性**:
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

interface StockBasicParams {
  /** 股票代码 */
  ts_code?: string;
  
  /** 上市状态 */
  list_status?: 'L' | 'D' | 'P';
  
  /** 交易所 */
  exchange?: 'SSE' | 'SZSE';
}
```

**关系**:
- 一对多: 一个股票有多个日线行情记录
- 一对多: 一个股票有多个财务数据记录

---

### 4. DailyQuote (日线行情数据)

**职责**: 表示股票日线行情

**属性**:
```typescript
interface DailyQuoteItem {
  /** 股票代码 */
  ts_code: string;
  
  /** 交易日期 (YYYYMMDD) */
  trade_date: string;
  
  /** 开盘价 */
  open: number;
  
  /** 最高价 */
  high: number;
  
  /** 最低价 */
  low: number;
  
  /** 收盘价 */
  close: number;
  
  /** 昨收价 */
  pre_close: number;
  
  /** 涨跌额 */
  change: number;
  
  /** 涨跌幅 (%) */
  pct_chg: number;
  
  /** 成交量 (手) */
  vol: number;
  
  /** 成交额 (千元) */
  amount: number;
}

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

**验证规则**:
- `ts_code` 或 `trade_date` 必须提供至少一个
- 日期格式: YYYYMMDD 或 YYYY-MM-DD
- `start_date` <= `end_date`

---

### 5. FinancialData (财务数据)

**职责**: 表示公司财务数据

**属性**:
```typescript
interface FinancialItem {
  /** 股票代码 */
  ts_code: string;
  
  /** 报告期 (YYYYMMDD) */
  end_date: string;
  
  /** 公告日期 (YYYYMMDD) */
  ann_date: string;
  
  /** 报告类型: 1一季报 2半年报 3三季报 4年报 */
  report_type: 1 | 2 | 3 | 4;
  
  /** 营业总收入 (元) */
  total_revenue?: number;
  
  /** 营业收入 (元) */
  revenue?: number;
  
  /** 净利润 (元) */
  net_profit?: number;
  
  /** 总资产 (元) */
  total_assets?: number;
  
  /** 总负债 (元) */
  total_liabilities?: number;
  
  /** 股东权益 (元) */
  total_equity?: number;
  
  /** 每股收益 (元/股) */
  eps?: number;
  
  /** 净资产收益率 (%) */
  roe?: number;
}

interface FinancialParams {
  /** 股票代码 */
  ts_code?: string;
  
  /** 报告期 */
  period?: string;
  
  /** 开始报告期 */
  start_date?: string;
  
  /** 结束报告期 */
  end_date?: string;
  
  /** 报告类型 */
  report_type?: 1 | 2 | 3 | 4;
}
```

---

### 6. ApiError (错误对象)

**职责**: 表示 API 调用错误

**属性**:
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
  
  constructor(
    type: ApiErrorType,
    message: string,
    code?: number,
    originalError?: Error
  ) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.code = code;
    this.originalError = originalError;
    this.retryable = this.isRetryable();
  }
  
  private isRetryable(): boolean {
    return [
      ApiErrorType.RATE_LIMIT,
      ApiErrorType.NETWORK_ERROR,
      ApiErrorType.TIMEOUT_ERROR,
      ApiErrorType.SERVER_ERROR,
    ].includes(this.type);
  }
}
```

---

### 7. CacheProvider (缓存接口)

**职责**: 定义缓存操作接口

**方法**:
```typescript
interface CacheProvider {
  /** 获取缓存 */
  get<T>(key: string): Promise<T | null>;
  
  /** 设置缓存 */
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  
  /** 删除缓存 */
  delete(key: string): Promise<void>;
  
  /** 清空缓存 */
  clear(): Promise<void>;
}

class MemoryCacheProvider implements CacheProvider {
  private cache: Map<string, CacheItem>;
  private maxSize: number;
  
  constructor(maxSize = 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }
  
  // 实现接口方法...
}

interface CacheItem {
  value: any;
  expiry: number; // 过期时间戳
}
```

---

### 8. RetryStrategy (重试策略)

**职责**: 配置重试行为

**属性**:
```typescript
interface RetryConfig {
  /** 最大重试次数 (默认: 3) */
  maxRetries: number;
  
  /** 初始延迟 (毫秒，默认: 1000) */
  initialDelay: number;
  
  /** 最大延迟 (毫秒，默认: 30000) */
  maxDelay: number;
  
  /** 指数退避因子 (默认: 2) */
  backoffFactor: number;
  
  /** 可重试的错误类型 */
  retryableErrors: ApiErrorType[];
}

class RetryService {
  constructor(private config: RetryConfig) {}
  
  async execute<T>(
    fn: () => Promise<T>,
    context?: string
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (!this.shouldRetry(error, attempt)) {
          throw error;
        }
        
        const delay = this.calculateDelay(attempt, error);
        await this.wait(delay);
      }
    }
    
    throw lastError!;
  }
  
  private shouldRetry(error: any, attempt: number): boolean {
    if (attempt >= this.config.maxRetries) return false;
    if (!(error instanceof ApiError)) return false;
    return error.retryable;
  }
  
  private calculateDelay(attempt: number, error: any): number {
    // 优先使用服务端指定的 Retry-After
    if (error instanceof ApiError && error.retryAfter) {
      return error.retryAfter;
    }
    
    // 指数退避 + 抖动
    const exponentialDelay = Math.min(
      this.config.initialDelay * Math.pow(this.config.backoffFactor, attempt),
      this.config.maxDelay
    );
    
    // 添加 ±20% 抖动
    const jitter = exponentialDelay * 0.2 * (Math.random() * 2 - 1);
    return Math.max(0, exponentialDelay + jitter);
  }
  
  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

---

### 9. Logger (日志接口)

**职责**: 提供日志记录能力

**方法**:
```typescript
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}

class ConsoleLogger implements Logger {
  constructor(private level: LogLevel = LogLevel.INFO) {}
  
  debug(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(`[Tushare DEBUG] ${message}`, ...args);
    }
  }
  
  info(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.info(`[Tushare INFO] ${message}`, ...args);
    }
  }
  
  warn(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(`[Tushare WARN] ${message}`, ...args);
    }
  }
  
  error(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(`[Tushare ERROR] ${message}`, ...args);
    }
  }
}
```

---

### 10. TushareResponse (API 响应)

**职责**: 表示 Tushare API 原始响应

**属性**:
```typescript
interface TushareResponse<T = any> {
  /** 响应代码: 0 成功, 其他失败 */
  code: number;
  
  /** 响应消息 */
  msg: string;
  
  /** 响应数据 */
  data: {
    /** 字段名列表 */
    fields: string[];
    
    /** 数据项列表 (每项是数组) */
    items: any[][];
  } | null;
}

interface TushareRequest {
  /** API 名称 */
  api_name: string;
  
  /** 认证 Token */
  token: string;
  
  /** 请求参数 */
  params?: Record<string, any>;
  
  /** 返回字段 (逗号分隔) */
  fields?: string;
}
```

---

## 实体关系图

```
TushareClient
  ├── has-one: TushareConfig
  ├── has-one: HttpClient
  ├── has-one?: CacheProvider (optional)
  ├── has-one: Logger
  ├── has-one: RetryService
  └── has-one: ConcurrencyLimiter

StockBasicItem
  ├── has-many: DailyQuoteItem (通过 ts_code)
  └── has-many: FinancialItem (通过 ts_code)

ApiError
  └── has-one?: Error (originalError)

RetryService
  └── uses: RetryConfig
```

---

## 数据流

### 1. 正常请求流程
```
用户 → TushareClient.query()
  → 参数验证 (validator)
  → 检查缓存 (cache)
  → 如果缓存命中 → 返回缓存数据
  → 如果缓存未命中:
    → 并发控制 (concurrencyLimiter)
    → HTTP 请求 (httpClient)
    → 重试处理 (retryService)
    → 响应转换 (transformResponse)
    → 写入缓存 (cache)
    → 返回数据
```

### 2. 错误处理流程
```
HTTP 请求失败
  → 解析错误类型
  → 创建 ApiError
  → 判断是否可重试
  → 如果可重试:
    → 计算延迟时间
    → 等待
    → 重新请求
  → 如果不可重试或超过最大重试次数:
    → 记录日志 (logger)
    → 抛出错误给用户
```

---

## 验证规则总结

### 配置验证
- `token`: 必需，非空字符串
- `timeout`: >= 1000, <= 300000
- `retry.maxRetries`: >= 0, <= 10
- `concurrency.maxConcurrent`: >= 1, <= 50

### 参数验证
- **DailyQuoteParams**: `ts_code` 或 `trade_date` 至少提供一个
- **日期格式**: YYYYMMDD 或 YYYY-MM-DD
- **日期范围**: `start_date` <= `end_date`
- **股票代码格式**: 符合 `{6位数字}.{SSE|SZ|BJ}` 格式

### 响应验证
- `response.code === 0` 表示成功
- `response.data` 不为 null
- `response.data.fields` 和 `response.data.items` 长度一致
