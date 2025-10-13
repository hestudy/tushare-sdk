/**
 * Tushare TypeScript SDK
 * 
 * 为 Node.js 和浏览器提供类型安全的 Tushare API 访问能力
 * 
 * @packageDocumentation
 */

// 核心客户端
export { TushareClient } from './client/TushareClient.js';

// 类型定义
export type {
  TushareConfig,
  RetryConfig,
  CacheConfig,
  ConcurrencyConfig,
  CacheProvider,
} from './types/config.js';

export type {
  TushareRequest,
  TushareResponse,
  TushareResponseData,
} from './types/response.js';

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
  FinancialQueryParams,
  IncomeStatementItem,
  BalanceSheetItem,
  CashFlowItem,
} from './models/financial.js';

export type {
  TradeCalItem,
  TradeCalParams,
} from './models/calendar.js';

export type {
  DailyBasicItem,
  DailyBasicParams,
} from './models/daily-basic.js';

// 工具类
export type { Logger } from './utils/logger.js';
export { LogLevel, ConsoleLogger } from './utils/logger.js';
export { formatDate, parseDate, isValidDateFormat } from './utils/date.js';

// 服务类
export { MemoryCacheProvider } from './services/cache.js';

// API 方法
export { getStockBasic } from './api/stock.js';
export { getDailyQuote } from './api/quote.js';
export { getFinancialData, getIncomeStatement, getBalanceSheet, getCashFlow } from './api/financial.js';
export { getTradeCalendar } from './api/calendar.js';
export { getDailyBasic } from './api/daily-basic.js';
