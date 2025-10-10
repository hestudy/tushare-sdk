import type { Logger } from '../utils/logger.js';

/**
 * 缓存提供者接口
 * 
 * 定义缓存操作的标准接口,支持自定义缓存实现 (如 Redis, Memcached 等)
 * 
 * @example
 * ```typescript
 * // 实现自定义 Redis 缓存提供者
 * class RedisCacheProvider implements CacheProvider {
 *   private redis: Redis;
 *   
 *   constructor(redis: Redis) {
 *     this.redis = redis;
 *   }
 *   
 *   async get<T>(key: string): Promise<T | null> {
 *     const value = await this.redis.get(key);
 *     return value ? JSON.parse(value) : null;
 *   }
 *   
 *   async set<T>(key: string, value: T, ttl = 3600000): Promise<void> {
 *     await this.redis.set(key, JSON.stringify(value), 'PX', ttl);
 *   }
 *   
 *   async delete(key: string): Promise<void> {
 *     await this.redis.del(key);
 *   }
 *   
 *   async clear(): Promise<void> {
 *     await this.redis.flushdb();
 *   }
 * }
 * ```
 */
export interface CacheProvider {
  /**
   * 获取缓存值
   * 
   * @param key - 缓存键
   * @returns 缓存的值,如果不存在或已过期则返回 null
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * 设置缓存值
   * 
   * @param key - 缓存键
   * @param value - 要缓存的值
   * @param ttl - 过期时间 (毫秒),可选
   */
  set<T>(key: string, value: T, ttl?: number): Promise<void>;

  /**
   * 删除缓存值
   * 
   * @param key - 缓存键
   */
  delete(key: string): Promise<void>;

  /**
   * 清空所有缓存
   */
  clear(): Promise<void>;
}

/**
 * 重试配置
 * 
 * 定义 API 请求失败时的重试策略,使用指数退避算法
 * 
 * @example
 * ```typescript
 * const retryConfig: RetryConfig = {
 *   maxRetries: 3,        // 最多重试 3 次
 *   initialDelay: 1000,   // 首次重试延迟 1 秒
 *   maxDelay: 30000,      // 最大延迟 30 秒
 *   backoffFactor: 2      // 每次延迟翻倍
 * };
 * 
 * // 重试延迟序列: 1s, 2s, 4s
 * ```
 */
export interface RetryConfig {
  /**
   * 最大重试次数
   * 
   * 请求失败后最多重试的次数,不包括首次请求
   * 
   * @default 3
   * @minimum 0
   * @maximum 10
   */
  maxRetries: number;

  /**
   * 初始延迟时间 (毫秒)
   * 
   * 首次重试前的等待时间,后续重试将按指数增长
   * 
   * @default 1000
   * @minimum 0
   */
  initialDelay: number;

  /**
   * 最大延迟时间 (毫秒)
   * 
   * 重试延迟的上限,防止延迟时间过长
   * 
   * @default 30000
   * @minimum 1000
   */
  maxDelay: number;

  /**
   * 指数退避因子
   * 
   * 每次重试的延迟倍数,计算公式: delay = min(initialDelay * backoffFactor^n, maxDelay)
   * 
   * @default 2
   * @minimum 1
   */
  backoffFactor: number;
}

/**
 * 缓存配置
 * 
 * 定义数据缓存策略,支持内存缓存和自定义缓存提供者
 * 
 * @example
 * ```typescript
 * // 使用默认内存缓存
 * const cacheConfig: CacheConfig = {
 *   enabled: true,
 *   ttl: 3600000  // 缓存 1 小时
 * };
 * 
 * // 使用自定义 Redis 缓存
 * const cacheConfig: CacheConfig = {
 *   enabled: true,
 *   provider: new RedisCacheProvider(redis),
 *   ttl: 7200000  // 缓存 2 小时
 * };
 * ```
 */
export interface CacheConfig {
  /**
   * 是否启用缓存
   * 
   * 设置为 true 时,API 响应将被缓存以提高性能
   * 
   * @default false
   */
  enabled: boolean;

  /**
   * 缓存提供者
   * 
   * 自定义缓存实现,如果不提供则使用默认的内存缓存
   * 
   * @default MemoryCacheProvider
   */
  provider?: CacheProvider;

  /**
   * 默认缓存过期时间 (毫秒)
   * 
   * 缓存数据的有效期,超过此时间后缓存将失效
   * 
   * @default 3600000 (1 小时)
   * @minimum 0
   */
  ttl?: number;
}

/**
 * 并发控制配置
 * 
 * 定义 API 请求的并发限制,防止触发限流
 * 
 * @example
 * ```typescript
 * // 适用于 200 积分用户 (1 次/秒)
 * const concurrencyConfig: ConcurrencyConfig = {
 *   maxConcurrent: 1,
 *   minInterval: 1000
 * };
 * 
 * // 适用于 5000 积分用户 (20 次/秒)
 * const concurrencyConfig: ConcurrencyConfig = {
 *   maxConcurrent: 20,
 *   minInterval: 50
 * };
 * ```
 */
export interface ConcurrencyConfig {
  /**
   * 最大并发请求数
   * 
   * 同时进行的 API 请求数量上限
   * 
   * @default 5
   * @minimum 1
   * @maximum 50
   */
  maxConcurrent: number;

  /**
   * 最小请求间隔 (毫秒)
   * 
   * 两次请求之间的最小时间间隔,用于控制请求频率
   * 
   * @default 200
   * @minimum 0
   */
  minInterval: number;
}

/**
 * Tushare 客户端配置
 * 
 * 定义 TushareClient 的完整配置选项
 * 
 * @example
 * ```typescript
 * // 最小配置
 * const config: TushareConfig = {
 *   token: 'YOUR_TUSHARE_TOKEN'
 * };
 * 
 * // 完整配置
 * const config: TushareConfig = {
 *   token: 'YOUR_TUSHARE_TOKEN',
 *   endpoint: 'https://api.tushare.pro',
 *   timeout: 30000,
 *   retry: {
 *     maxRetries: 3,
 *     initialDelay: 1000,
 *     maxDelay: 30000,
 *     backoffFactor: 2
 *   },
 *   cache: {
 *     enabled: true,
 *     ttl: 3600000
 *   },
 *   concurrency: {
 *     maxConcurrent: 5,
 *     minInterval: 200
 *   },
 *   logger: new ConsoleLogger(LogLevel.INFO)
 * };
 * ```
 */
export interface TushareConfig {
  /**
   * Tushare API Token
   * 
   * 从 Tushare 官网获取的 API 访问令牌,必需参数
   * 
   * @see https://tushare.pro/register
   */
  token: string;

  /**
   * API 端点
   * 
   * Tushare API 服务器地址,通常不需要修改
   * 
   * @default 'https://api.tushare.pro'
   */
  endpoint?: string;

  /**
   * 请求超时时间 (毫秒)
   * 
   * 单次 API 请求的超时时间
   * 
   * @default 30000
   * @minimum 1000
   * @maximum 300000
   */
  timeout?: number;

  /**
   * 重试配置
   * 
   * 请求失败时的重试策略,可以部分覆盖默认配置
   */
  retry?: Partial<RetryConfig>;

  /**
   * 缓存配置
   * 
   * 数据缓存策略,可以部分覆盖默认配置
   */
  cache?: Partial<CacheConfig>;

  /**
   * 并发控制配置
   * 
   * API 请求的并发限制,可以部分覆盖默认配置
   */
  concurrency?: Partial<ConcurrencyConfig>;

  /**
   * 日志配置
   * 
   * 自定义日志记录器,如果不提供则使用默认的控制台日志
   * 
   * @default ConsoleLogger(LogLevel.INFO)
   */
  logger?: Logger;
}

/**
 * 默认重试配置
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffFactor: 2,
};

/**
 * 默认缓存配置
 */
export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  enabled: false,
  ttl: 3600000, // 1 小时
};

/**
 * 默认并发配置
 */
export const DEFAULT_CONCURRENCY_CONFIG: ConcurrencyConfig = {
  maxConcurrent: 5,
  minInterval: 200,
};

/**
 * 默认 API 端点
 */
export const DEFAULT_ENDPOINT = 'https://api.tushare.pro';

/**
 * 默认超时时间
 */
export const DEFAULT_TIMEOUT = 30000;
