import type { CacheProvider } from '../types/config.js';

/**
 * 缓存项
 */
interface CacheItem<T> {
  /** 缓存值 */
  value: T;

  /** 过期时间戳 (毫秒) */
  expiry: number;
}

/**
 * 内存缓存提供者
 * 
 * 使用 Map 实现的内存缓存,支持 LRU 淘汰策略
 * 
 * @example
 * ```typescript
 * const cache = new MemoryCacheProvider(1000);
 * await cache.set('key', 'value', 3600000);
 * const value = await cache.get('key');
 * ```
 */
export class MemoryCacheProvider implements CacheProvider {
  private cache: Map<string, CacheItem<unknown>>;
  private accessOrder: Map<string, number>; // 记录访问顺序

  /**
   * 创建内存缓存实例
   * 
   * @param maxSize - 最大缓存条目数 (默认: 1000)
   */
  constructor(private maxSize = 1000) {
    this.cache = new Map();
    this.accessOrder = new Map();
  }

  /**
   * 获取缓存值
   */
  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key) as CacheItem<T> | undefined;

    if (!item) {
      return null;
    }

    // 检查是否过期
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      this.accessOrder.delete(key);
      return null;
    }

    // 更新访问顺序
    this.accessOrder.set(key, Date.now());

    return item.value;
  }

  /**
   * 设置缓存值
   */
  async set<T>(key: string, value: T, ttl = 3600000): Promise<void> {
    // 如果缓存已满,执行 LRU 淘汰
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
    this.accessOrder.set(key, Date.now());
  }

  /**
   * 删除缓存值
   */
  async delete(key: string): Promise<void> {
    this.cache.delete(key);
    this.accessOrder.delete(key);
  }

  /**
   * 清空所有缓存
   */
  async clear(): Promise<void> {
    this.cache.clear();
    this.accessOrder.clear();
  }

  /**
   * LRU 淘汰策略
   * 
   * 删除最久未访问的缓存项
   */
  private evictLRU(): void {
    let oldestKey: string | undefined;
    let oldestTime = Infinity;

    // 找到最久未访问的键
    for (const [key, time] of this.accessOrder.entries()) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.accessOrder.delete(oldestKey);
    }
  }

  /**
   * 生成缓存键
   * 
   * @param apiName - API 名称
   * @param params - 请求参数
   * @returns 缓存键
   * 
   * @example
   * ```typescript
   * const key = MemoryCacheProvider.generateCacheKey('stock_basic', {
   *   list_status: 'L',
   *   exchange: 'SSE'
   * });
   * // 'tushare:stock_basic:exchange=SSE&list_status=L'
   * ```
   */
  static generateCacheKey(
    apiName: string,
    params?: Record<string, unknown>
  ): string {
    if (!params || Object.keys(params).length === 0) {
      return `tushare:${apiName}`;
    }

    // 对参数键排序,确保相同参数生成相同的键
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&');

    return `tushare:${apiName}:${sortedParams}`;
  }
}
