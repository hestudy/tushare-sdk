import { HttpClient } from './http.js';
import { RetryService } from '../services/retry.js';
import { MemoryCacheProvider } from '../services/cache.js';
import { ConcurrencyLimiter } from '../services/concurrency.js';
import { ConsoleLogger, LogLevel } from '../utils/logger.js';
import { validateConfig, validateParams } from '../services/validator.js';
import { transformResponseData } from '../types/response.js';
import type { TushareConfig, CacheProvider } from '../types/config.js';
import type { Logger } from '../utils/logger.js';
import type { TushareRequest } from '../types/response.js';
import type { StockBasicItem, StockBasicParams } from '../models/stock.js';
import type { DailyQuoteItem, DailyQuoteParams } from '../models/quote.js';

/**
 * Tushare 客户端
 * 
 * SDK 的主入口类,提供类型安全的 Tushare API 访问能力
 * 
 * @example
 * ```typescript
 * const client = new TushareClient({
 *   token: 'YOUR_TOKEN',
 *   cache: { enabled: true },
 * });
 * 
 * const stocks = await client.getStockBasic({ list_status: 'L' });
 * ```
 */
export class TushareClient {
  private httpClient: HttpClient;
  private retryService: RetryService;
  private cache?: CacheProvider;
  private logger: Logger;
  private concurrencyLimiter: ConcurrencyLimiter;
  private config: TushareConfig;

  /**
   * 创建 Tushare 客户端实例
   * 
   * @param config - 客户端配置
   * @throws {ApiError} 配置无效时抛出
   */
  constructor(config: TushareConfig) {
    // 验证配置
    validateConfig(config);

    this.config = config;

    // 初始化日志
    this.logger = config.logger || new ConsoleLogger(LogLevel.INFO);

    // 初始化 HTTP 客户端
    this.httpClient = new HttpClient({
      endpoint: config.endpoint || 'https://api.tushare.pro',
      timeout: config.timeout || 30000,
    });

    // 初始化重试服务
    this.retryService = new RetryService(
      {
        maxRetries: config.retry?.maxRetries ?? 3,
        initialDelay: config.retry?.initialDelay ?? 1000,
        maxDelay: config.retry?.maxDelay ?? 30000,
        backoffFactor: config.retry?.backoffFactor ?? 2,
      },
      this.logger
    );

    // 初始化缓存
    if (config.cache?.enabled) {
      this.cache = config.cache.provider || new MemoryCacheProvider();
    }

    // 初始化并发控制
    this.concurrencyLimiter = new ConcurrencyLimiter({
      maxConcurrent: config.concurrency?.maxConcurrent ?? 5,
      minInterval: config.concurrency?.minInterval ?? 200,
    });

    this.logger.info('Tushare client initialized');
  }

  /**
   * 通用查询方法
   * 
   * 调用任意 Tushare API 接口
   * 
   * @param apiName - API 名称 (如 'stock_basic', 'daily')
   * @param params - 查询参数
   * @param fields - 返回字段 (逗号分隔)
   * @returns 查询结果数组
   * 
   * @example
   * ```typescript
   * const data = await client.query('stock_basic', {
   *   list_status: 'L',
   *   exchange: 'SSE'
   * });
   * ```
   */
  async query<T = Record<string, unknown>>(
    apiName: string,
    params?: Record<string, unknown>,
    fields?: string
  ): Promise<T[]> {
    // 验证参数
    validateParams(apiName, params);

    // 生成缓存键
    const cacheKey = this.cache
      ? MemoryCacheProvider.generateCacheKey(apiName, params)
      : null;

    // 检查缓存
    if (cacheKey && this.cache) {
      const cached = await this.cache.get<T[]>(cacheKey);
      if (cached) {
        this.logger.debug(`Cache hit for ${apiName}`, params);
        return cached;
      }
      this.logger.debug(`Cache miss for ${apiName}`, params);
    }

    // 构造请求
    const request: TushareRequest = {
      api_name: apiName,
      token: this.config.token,
      params,
      fields,
    };

    // 执行请求 (带并发控制和重试)
    const result = await this.concurrencyLimiter.execute(async () => {
      return this.retryService.execute(async () => {
        this.logger.debug(`Requesting ${apiName}`, params);
        const response = await this.httpClient.post(request);

        // 转换响应数据
        if (!response.data) {
          this.logger.warn(`Empty response data for ${apiName}`);
          return [];
        }

        const transformed = transformResponseData<T>(response.data);
        this.logger.info(
          `Successfully fetched ${transformed.length} items from ${apiName}`
        );

        return transformed;
      }, apiName);
    });

    // 写入缓存
    if (cacheKey && this.cache) {
      const ttl = this.config.cache?.ttl ?? 3600000;
      await this.cache.set(cacheKey, result, ttl);
      this.logger.debug(`Cached ${result.length} items for ${apiName}`);
    }

    return result;
  }

  /**
   * 获取股票基础信息
   * 
   * @param params - 查询参数
   * @returns 股票基础信息列表
   * 
   * @example
   * ```typescript
   * const stocks = await client.getStockBasic({
   *   list_status: 'L',
   *   exchange: 'SSE'
   * });
   * ```
   */
  async getStockBasic(params?: StockBasicParams): Promise<StockBasicItem[]> {
    return this.query<StockBasicItem>('stock_basic', params as Record<string, unknown>);
  }

  /**
   * 获取日线行情数据
   * 
   * @param params - 查询参数
   * @returns 日线行情数据列表
   * 
   * @example
   * ```typescript
   * const quotes = await client.getDailyQuote({
   *   ts_code: '000001.SZ',
   *   start_date: '20230101',
   *   end_date: '20231231'
   * });
   * ```
   */
  async getDailyQuote(params: DailyQuoteParams): Promise<DailyQuoteItem[]> {
    return this.query<DailyQuoteItem>('daily', params as Record<string, unknown>);
  }
}
