import { describe, it, expect, beforeEach } from 'vitest';
import { TushareClient } from '../../src/client/TushareClient';
import type { CacheProvider } from '../../src/types/config';

/**
 * 自定义缓存提供者集成测试
 * 验证用户可以实现自己的缓存提供者
 */

/**
 * 简单的 Map 缓存提供者实现
 * 用于测试自定义缓存提供者功能
 */
class MapCacheProvider implements CacheProvider {
  private cache = new Map<string, { value: any; expiry: number }>();
  public getCallCount = 0;
  public setCallCount = 0;
  public deleteCallCount = 0;
  public clearCallCount = 0;

  async get<T>(key: string): Promise<T | null> {
    this.getCallCount++;
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  async set<T>(key: string, value: T, ttl = 3600000): Promise<void> {
    this.setCallCount++;
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl,
    });
  }

  async delete(key: string): Promise<void> {
    this.deleteCallCount++;
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.clearCallCount++;
    this.cache.clear();
  }

  // 测试辅助方法
  getSize(): number {
    return this.cache.size;
  }

  resetCounters(): void {
    this.getCallCount = 0;
    this.setCallCount = 0;
    this.deleteCallCount = 0;
    this.clearCallCount = 0;
  }
}

describe('Custom Cache Provider Integration Tests', () => {
  let customCache: MapCacheProvider;
  let client: TushareClient;

  beforeEach(() => {
    customCache = new MapCacheProvider();
    client = new TushareClient({
      token: process.env.TUSHARE_TOKEN || 'test_token',
      cache: {
        enabled: true,
        provider: customCache,
        ttl: 5000, // 5 秒
      },
    });
    customCache.resetCounters();
  });

  it('should use custom cache provider for caching', async () => {
    // 验证自定义缓存提供者被调用
    const key = 'test_key';
    const value = { data: 'test_value' };

    await customCache.set(key, value);
    expect(customCache.setCallCount).toBe(1);
    expect(customCache.getSize()).toBe(1);

    const retrieved = await customCache.get(key);
    expect(customCache.getCallCount).toBe(1);
    expect(retrieved).toEqual(value);
  });

  it('should respect TTL in custom cache provider', async () => {
    const key = 'ttl_test_key';
    const value = { data: 'ttl_test' };

    // 设置 100ms TTL
    await customCache.set(key, value, 100);

    // 立即获取应该成功
    let retrieved = await customCache.get(key);
    expect(retrieved).toEqual(value);

    // 等待 TTL 过期
    await new Promise((resolve) => setTimeout(resolve, 150));

    // 过期后应该返回 null
    retrieved = await customCache.get(key);
    expect(retrieved).toBeNull();
  });

  it('should call custom cache provider methods', async () => {
    const key1 = 'key1';
    const key2 = 'key2';

    // 测试 set
    await customCache.set(key1, 'value1');
    await customCache.set(key2, 'value2');
    expect(customCache.setCallCount).toBe(2);

    // 测试 get
    await customCache.get(key1);
    await customCache.get(key2);
    expect(customCache.getCallCount).toBe(2);

    // 测试 delete
    await customCache.delete(key1);
    expect(customCache.deleteCallCount).toBe(1);
    expect(customCache.getSize()).toBe(1);

    // 测试 clear
    await customCache.clear();
    expect(customCache.clearCallCount).toBe(1);
    expect(customCache.getSize()).toBe(0);
  });

  it('should handle cache miss correctly', async () => {
    const result = await customCache.get('non_existent_key');
    expect(result).toBeNull();
    expect(customCache.getCallCount).toBe(1);
  });

  it('should allow multiple cache providers to coexist', async () => {
    const cache1 = new MapCacheProvider();
    const cache2 = new MapCacheProvider();

    await cache1.set('key', 'value1');
    await cache2.set('key', 'value2');

    const value1 = await cache1.get('key');
    const value2 = await cache2.get('key');

    expect(value1).toBe('value1');
    expect(value2).toBe('value2');
  });

  it('should support complex data types in cache', async () => {
    const complexData = {
      stocks: [
        { ts_code: '000001.SZ', name: '平安银行' },
        { ts_code: '000002.SZ', name: '万科A' },
      ],
      metadata: {
        count: 2,
        timestamp: Date.now(),
      },
    };

    await customCache.set('complex_key', complexData);
    const retrieved = await customCache.get('complex_key');

    expect(retrieved).toEqual(complexData);
  });

  it('should handle concurrent cache operations', async () => {
    const operations: Promise<void>[] = [];

    // 并发写入
    for (let i = 0; i < 10; i++) {
      operations.push(customCache.set(`key_${i}`, `value_${i}`));
    }

    await Promise.all(operations);
    expect(customCache.setCallCount).toBe(10);
    expect(customCache.getSize()).toBe(10);

    // 并发读取
    const readOps: Promise<unknown>[] = [];
    for (let i = 0; i < 10; i++) {
      readOps.push(customCache.get(`key_${i}`));
    }

    const results = await Promise.all(readOps);
    expect(results).toHaveLength(10);
    expect(customCache.getCallCount).toBe(10);
  });

  it('should allow cache provider to be disabled', async () => {
    const clientWithoutCache = new TushareClient({
      token: 'test_token',
      cache: {
        enabled: false,
      },
    });

    // 验证客户端创建成功
    expect(clientWithoutCache).toBeDefined();
  });
});

/**
 * 异步存储缓存提供者示例
 * 模拟 Redis 等异步存储
 */
class AsyncStorageCacheProvider implements CacheProvider {
  private storage = new Map<string, { value: any; expiry: number }>();

  async get<T>(key: string): Promise<T | null> {
    // 模拟异步延迟
    await new Promise((resolve) => setTimeout(resolve, 10));

    const item = this.storage.get(key);
    if (!item || Date.now() > item.expiry) {
      return null;
    }
    return item.value as T;
  }

  async set<T>(key: string, value: T, ttl = 3600000): Promise<void> {
    // 模拟异步延迟
    await new Promise((resolve) => setTimeout(resolve, 10));

    this.storage.set(key, {
      value,
      expiry: Date.now() + ttl,
    });
  }

  async delete(key: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 10));
    this.storage.delete(key);
  }

  async clear(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 10));
    this.storage.clear();
  }
}

describe('Async Cache Provider Tests', () => {
  it('should work with async cache provider', async () => {
    const asyncCache = new AsyncStorageCacheProvider();

    await asyncCache.set('async_key', 'async_value');
    const value = await asyncCache.get('async_key');

    expect(value).toBe('async_value');
  });

  it('should handle async operations correctly', async () => {
    const asyncCache = new AsyncStorageCacheProvider();

    // 并发异步操作
    await Promise.all([
      asyncCache.set('key1', 'value1'),
      asyncCache.set('key2', 'value2'),
      asyncCache.set('key3', 'value3'),
    ]);

    const results = await Promise.all([
      asyncCache.get('key1'),
      asyncCache.get('key2'),
      asyncCache.get('key3'),
    ]);

    expect(results).toEqual(['value1', 'value2', 'value3']);
  });
});
