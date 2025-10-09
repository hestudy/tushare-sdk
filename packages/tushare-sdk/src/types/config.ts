import type { Logger } from '../utils/logger.js';

/**
 * 缓存提供者接口 (前向声明)
 */
export interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * 重试配置
 */
export interface RetryConfig {
  /** 最大重试次数 (默认: 3) */
  maxRetries: number;

  /** 初始延迟时间 (毫秒, 默认: 1000) */
  initialDelay: number;

  /** 最大延迟时间 (毫秒, 默认: 30000) */
  maxDelay: number;

  /** 指数退避因子 (默认: 2) */
  backoffFactor: number;
}

/**
 * 缓存配置
 */
export interface CacheConfig {
  /** 是否启用缓存 */
  enabled: boolean;

  /** 缓存提供者 (可选, 默认使用内存缓存) */
  provider?: CacheProvider;

  /** 默认缓存过期时间 (毫秒, 默认: 3600000 即 1 小时) */
  ttl?: number;
}

/**
 * 并发控制配置
 */
export interface ConcurrencyConfig {
  /** 最大并发请求数 (默认: 5) */
  maxConcurrent: number;

  /** 最小请求间隔 (毫秒, 默认: 200) */
  minInterval: number;
}

/**
 * Tushare 客户端配置
 */
export interface TushareConfig {
  /** Tushare API Token (必需) */
  token: string;

  /** API 端点 (默认: https://api.tushare.pro) */
  endpoint?: string;

  /** 请求超时时间 (毫秒, 默认: 30000) */
  timeout?: number;

  /** 重试配置 */
  retry?: Partial<RetryConfig>;

  /** 缓存配置 */
  cache?: Partial<CacheConfig>;

  /** 并发控制配置 */
  concurrency?: Partial<ConcurrencyConfig>;

  /** 日志配置 */
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
