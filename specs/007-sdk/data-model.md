# Data Model: SDK 数据模型和类型映射

**Feature**: 007-sdk | **Date**: 2025-10-11 | **Plan**: [plan.md](./plan.md)

## Overview

本文档记录 Tushare SDK 中所有数据模型的结构，为文档更新提供类型定义参考。所有信息均从源代码提取，确保100%准确性。

## Core Entities

### 1. 配置类型 (Configuration Types)

#### TushareConfig (主配置)

**源文件**: `packages/tushare-sdk/src/types/config.ts`

| 属性 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `token` | `string` | ✅ | - | Tushare API Token |
| `endpoint` | `string` | ❌ | `'https://api.tushare.pro'` | API 端点 |
| `timeout` | `number` | ❌ | `30000` | 请求超时时间(ms) |
| `retry` | `Partial<RetryConfig>` | ❌ | - | 重试配置 |
| `cache` | `Partial<CacheConfig>` | ❌ | - | 缓存配置 |
| `concurrency` | `Partial<ConcurrencyConfig>` | ❌ | - | 并发控制配置 |
| `logger` | `Logger` | ❌ | `ConsoleLogger(LogLevel.INFO)` | 日志记录器 |

#### RetryConfig (重试配置)

| 属性 | 类型 | 默认值 | 取值范围 | 说明 |
|------|------|--------|----------|------|
| `maxRetries` | `number` | `3` | 0-10 | 最大重试次数 |
| `initialDelay` | `number` | `1000` | ≥0 | 初始延迟(ms) |
| `maxDelay` | `number` | `30000` | ≥1000 | 最大延迟(ms) |
| `backoffFactor` | `number` | `2` | ≥1 | 指数退避因子 |

**延迟计算公式**:
```
delay = min(initialDelay * backoffFactor^n, maxDelay)
```

#### CacheConfig (缓存配置)

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | `boolean` | `false` | 是否启用缓存 |
| `provider` | `CacheProvider` | `MemoryCacheProvider` | 缓存提供者 |
| `ttl` | `number` | `3600000` (1小时) | 缓存过期时间(ms) |

#### ConcurrencyConfig (并发控制配置)

| 属性 | 类型 | 默认值 | 取值范围 | 说明 |
|------|------|--------|----------|------|
| `maxConcurrent` | `number` | `5` | 1-50 | 最大并发请求数 |
| `minInterval` | `number` | `200` | ≥0 | 最小请求间隔(ms) |

**积分等级推荐配置**:
- 200积分: `{ maxConcurrent: 1, minInterval: 1000 }` (1次/秒)
- 5000积分: `{ maxConcurrent: 20, minInterval: 50 }` (20次/秒)

---

### 2. API 数据模型 (API Data Models)

#### StockBasicItem (股票基础信息)

**源文件**: `packages/tushare-sdk/src/models/stock.ts`

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `ts_code` | `string` | 股票代码 (TS格式) | `'000001.SZ'` |
| `symbol` | `string` | 股票代码 (不含后缀) | `'000001'` |
| `name` | `string` | 股票名称 | `'平安银行'` |
| `area` | `string` | 地区 | `'深圳'` |
| `industry` | `string` | 行业 | `'银行'` |
| `market` | `string` | 市场类型 | `'主板'` |
| `list_date` | `string` | 上市日期 (YYYYMMDD) | `'19910403'` |
| `list_status` | `string` | 上市状态 | `'L'` (上市), `'D'` (退市), `'P'` (暂停) |
| `exchange` | `string` | 交易所 | `'SZSE'`, `'SSE'` |

#### StockBasicParams (股票基础信息查询参数)

| 参数 | 类型 | 必需 | 说明 | 取值 |
|------|------|------|------|------|
| `ts_code` | `string` | ❌ | 股票代码 | `'000001.SZ'` |
| `list_status` | `string` | ❌ | 上市状态 | `'L'`, `'D'`, `'P'` |
| `exchange` | `string` | ❌ | 交易所 | `'SSE'`, `'SZSE'` |
| `fields` | `string` | ❌ | 返回字段 (逗号分隔) | `'ts_code,name,list_date'` |

#### DailyQuoteItem (日线行情)

**源文件**: `packages/tushare-sdk/src/models/quote.ts`

| 字段 | 类型 | 说明 | 单位 |
|------|------|------|------|
| `ts_code` | `string` | 股票代码 | - |
| `trade_date` | `string` | 交易日期 (YYYYMMDD) | - |
| `open` | `number` | 开盘价 | 元 |
| `high` | `number` | 最高价 | 元 |
| `low` | `number` | 最低价 | 元 |
| `close` | `number` | 收盘价 | 元 |
| `pre_close` | `number` | 前收盘价 | 元 |
| `change` | `number` | 涨跌额 | 元 |
| `pct_chg` | `number` | 涨跌幅 | % |
| `vol` | `number` | 成交量 | 手 (100股) |
| `amount` | `number` | 成交额 | 千元 |

#### DailyQuoteParams (日线行情查询参数)

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `ts_code` | `string` | ❌ | 股票代码 (与 trade_date 至少传一个) |
| `trade_date` | `string` | ❌ | 交易日期 (YYYYMMDD) |
| `start_date` | `string` | ❌ | 开始日期 (YYYYMMDD) |
| `end_date` | `string` | ❌ | 结束日期 (YYYYMMDD) |
| `fields` | `string` | ❌ | 返回字段 (逗号分隔) |

#### TradeCalItem (交易日历)

**源文件**: `packages/tushare-sdk/src/models/calendar.ts`

| 字段 | 类型 | 说明 | 取值 |
|------|------|------|------|
| `exchange` | `string` | 交易所 | `'SSE'`, `'SZSE'` |
| `cal_date` | `string` | 日历日期 (YYYYMMDD) | `'20241001'` |
| `is_open` | `string` | 是否交易日 | `'0'` (休市), `'1'` (交易) |
| `pretrade_date` | `string` | 上一交易日 | `'20240930'` |

#### TradeCalParams (交易日历查询参数)

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `exchange` | `string` | ❌ | 交易所 |
| `start_date` | `string` | ❌ | 开始日期 (YYYYMMDD) |
| `end_date` | `string` | ❌ | 结束日期 (YYYYMMDD) |
| `is_open` | `string` | ❌ | 是否交易日 |
| `fields` | `string` | ❌ | 返回字段 (逗号分隔) |

#### DailyBasicItem (每日指标)

**源文件**: `packages/tushare-sdk/src/models/daily-basic.ts`
**权限要求**: 至少 2000 积分

| 字段 | 类型 | 可空 | 说明 | 单位/公式 |
|------|------|------|------|-----------|
| `ts_code` | `string` | ❌ | 股票代码 | - |
| `trade_date` | `string` | ❌ | 交易日期 (YYYYMMDD) | - |
| `turnover_rate` | `number` | ✅ | 换手率 | % (成交量/流通股本 × 100%) |
| `turnover_rate_f` | `number` | ✅ | 换手率(自由流通股) | % |
| `volume_ratio` | `number` | ✅ | 量比 | 当日成交量/过去5日平均成交量 |
| `pe` | `number` | ✅ | 市盈率 | 总市值/净利润 (亏损时为空) |
| `pe_ttm` | `number` | ✅ | 市盈率(TTM) | TTM = 最近12个月 |
| `pb` | `number` | ✅ | 市净率 | 总市值/净资产 |
| `ps` | `number` | ✅ | 市销率 | 总市值/营业收入 |
| `ps_ttm` | `number` | ✅ | 市销率(TTM) | - |
| `dv_ratio` | `number` | ✅ | 股息率 | % (每股分红/股价 × 100%) |
| `dv_ttm` | `number` | ✅ | 股息率(TTM) | % |
| `total_share` | `number` | ✅ | 总股本 | 万股 |
| `float_share` | `number` | ✅ | 流通股本 | 万股 |
| `free_share` | `number` | ✅ | 自由流通股本 | 万股 (剔除限售股) |
| `total_mv` | `number` | ✅ | 总市值 | 万元 (总股本 × 收盘价) |
| `circ_mv` | `number` | ✅ | 流通市值 | 万元 (流通股本 × 收盘价) |

#### DailyBasicParams (每日指标查询参数)

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `ts_code` | `string` | ❌ | 股票代码 |
| `trade_date` | `string` | ❌ | 交易日期 (YYYYMMDD) |
| `start_date` | `string` | ❌ | 开始日期 (YYYYMMDD) |
| `end_date` | `string` | ❌ | 结束日期 (YYYYMMDD) |
| `fields` | `string` | ❌ | 返回字段 (逗号分隔) |

**参数约束**: `ts_code` 和 `trade_date` 至少传一个

---

### 3. 错误类型 (Error Types)

#### ApiErrorType (枚举)

**源文件**: `packages/tushare-sdk/src/types/error.ts`

| 枚举值 | HTTP状态码 | 可重试 | 说明 |
|--------|-----------|--------|------|
| `AUTH_ERROR` | 401, 403 | ❌ | 认证错误 (Token无效或过期) |
| `RATE_LIMIT` | 429 | ✅ | 限流错误 (请求频率超限) |
| `NETWORK_ERROR` | - | ✅ | 网络错误 (网络连接失败) |
| `SERVER_ERROR` | 500, 502, 503, 504 | ✅ | 服务器错误 |
| `VALIDATION_ERROR` | 400 | ❌ | 参数验证错误 |
| `TIMEOUT_ERROR` | - | ✅ | 超时错误 |
| `UNKNOWN_ERROR` | 其他 | ❌ | 未知错误 |

#### ApiError (类)

| 属性 | 类型 | 说明 |
|------|------|------|
| `type` | `ApiErrorType` | 错误类型 |
| `message` | `string` | 错误消息 |
| `code` | `number \| undefined` | HTTP状态码 (如适用) |
| `originalError` | `Error \| undefined` | 原始错误对象 |
| `retryable` | `boolean` | 是否可重试 (自动计算) |
| `retryAfter` | `number \| undefined` | 建议重试延迟(ms) |

---

### 4. 接口类型 (Interface Types)

#### CacheProvider (缓存提供者接口)

**源文件**: `packages/tushare-sdk/src/types/config.ts`

| 方法 | 签名 | 说明 |
|------|------|------|
| `get` | `<T>(key: string) => Promise<T \| null>` | 获取缓存值 |
| `set` | `<T>(key: string, value: T, ttl?: number) => Promise<void>` | 设置缓存值 |
| `delete` | `(key: string) => Promise<void>` | 删除缓存值 |
| `clear` | `() => Promise<void>` | 清空所有缓存 |

**内置实现**: `MemoryCacheProvider` (LRU 内存缓存)

#### Logger (日志记录器接口)

**源文件**: `packages/tushare-sdk/src/utils/logger.ts`

| 方法 | 签名 | 说明 |
|------|------|------|
| `debug` | `(message: string, ...args: unknown[]) => void` | 调试日志 |
| `info` | `(message: string, ...args: unknown[]) => void` | 信息日志 |
| `warn` | `(message: string, ...args: unknown[]) => void` | 警告日志 |
| `error` | `(message: string, ...args: unknown[]) => void` | 错误日志 |

**LogLevel 枚举**:
- `DEBUG = 0`
- `INFO = 1`
- `WARN = 2`
- `ERROR = 3`

**内置实现**: `ConsoleLogger` (控制台日志)

---

## Type Mappings (类型映射)

### API 方法到数据模型的映射

| API 方法 | 参数类型 | 返回类型 | Tushare API名称 |
|----------|----------|----------|-----------------|
| `getStockBasic` | `StockBasicParams \| undefined` | `Promise<StockBasicItem[]>` | `stock_basic` |
| `getDailyQuote` | `DailyQuoteParams` | `Promise<DailyQuoteItem[]>` | `daily` |
| `getTradeCalendar` | `TradeCalParams \| undefined` | `Promise<TradeCalItem[]>` | `trade_cal` |
| `getDailyBasic` | `DailyBasicParams \| undefined` | `Promise<DailyBasicItem[]>` | `daily_basic` |
| `query` | `apiName: string, params?: Record<string, unknown>, fields?: string` | `Promise<T[]>` | 通用方法 |

### 导出类型清单

**从 `@hestudy/tushare-sdk` 导出的所有类型**:

```typescript
// 核心类
export { TushareClient } from './client/TushareClient.js';

// 配置类型
export type {
  TushareConfig,
  RetryConfig,
  CacheConfig,
  ConcurrencyConfig,
  CacheProvider,
} from './types/config.js';

// API 响应类型
export type {
  TushareRequest,
  TushareResponse,
  TushareResponseData,
} from './types/response.js';

// 错误类型
export { ApiError, ApiErrorType } from './types/error.js';

// 数据模型
export type {
  StockBasicItem,
  StockBasicParams,
} from './models/stock.js';

export type {
  DailyQuoteItem,
  DailyQuoteParams,
} from './models/quote.js';

export type {
  FinancialItem,
  FinancialParams,
} from './models/financial.js';

export type {
  TradeCalItem,
  TradeCalParams,
} from './models/calendar.js';

export type {
  DailyBasicItem,
  DailyBasicParams,
} from './models/daily-basic.js';

// 工具类型
export type { Logger } from './utils/logger.js';
export { LogLevel, ConsoleLogger } from './utils/logger.js';
export { formatDate, parseDate, isValidDateFormat } from './utils/date.js';

// 服务类
export { MemoryCacheProvider } from './services/cache.js';

// 独立 API 函数 (高级用法)
export { getStockBasic } from './api/stock.js';
export { getDailyQuote } from './api/quote.js';
export { getFinancialData } from './api/financial.js';
export { getTradeCalendar } from './api/calendar.js';
export { getDailyBasic } from './api/daily-basic.js';
```

---

## Entity Relationships

```
TushareClient
├── 配置 (TushareConfig)
│   ├── RetryConfig (重试策略)
│   ├── CacheConfig (缓存策略)
│   │   └── CacheProvider (缓存提供者接口)
│   ├── ConcurrencyConfig (并发控制)
│   └── Logger (日志记录器接口)
│
└── API 方法
    ├── getStockBasic() → StockBasicItem[]
    ├── getDailyQuote() → DailyQuoteItem[]
    ├── getTradeCalendar() → TradeCalItem[]
    ├── getDailyBasic() → DailyBasicItem[]
    └── query<T>() → T[]

错误处理
└── ApiError (错误类)
    └── ApiErrorType (错误类型枚举)
```

---

## Documentation Mapping (文档映射)

### 需要更新的文档页面及其对应的数据模型

| 文档页面 | 主要数据模型 | 配置接口 | 示例代码来源 |
|----------|-------------|---------|-------------|
| `guide/installation.md` | - | - | package.json (`@hestudy/tushare-sdk`) |
| `guide/quick-start.md` | `StockBasicItem` | `TushareConfig` | TushareClient.ts (JSDoc) |
| `guide/configuration.md` | - | `TushareConfig`, `RetryConfig`, `CacheConfig`, `ConcurrencyConfig` | config.ts (JSDoc) |
| `api/stock/basic.md` | `StockBasicItem`, `StockBasicParams` | - | TushareClient.getStockBasic() |
| `api/stock/daily.md` | `DailyQuoteItem`, `DailyQuoteParams` | - | TushareClient.getDailyQuote() |
| 新增: `api/calendar.md` | `TradeCalItem`, `TradeCalParams` | - | TushareClient.getTradeCalendar() |
| 新增: `api/daily-basic.md` | `DailyBasicItem`, `DailyBasicParams` | - | TushareClient.getDailyBasic() |
| 新增: `guide/error-handling.md` | - | - | ApiError, ApiErrorType (error.ts) |

---

## Validation Rules (验证规则)

文档更新时必须遵守的验证规则：

1. **类型一致性**: 文档中展示的 TypeScript 类型定义必须与源代码完全一致
2. **字段完整性**: 所有接口的所有字段都必须在文档中说明
3. **默认值准确性**: 所有提到默认值的地方必须与 `DEFAULT_*_CONFIG` 常量一致
4. **枚举值完整性**: 枚举类型的所有可能值都必须列出（如 ApiErrorType 的7个值）
5. **示例可运行性**: 所有示例代码必须能通过 TypeScript 类型检查
6. **包名正确性**: 所有导入语句必须使用 `@hestudy/tushare-sdk`
7. **权限标注**: 需要特定积分的 API（如 getDailyBasic）必须明确标注
