import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryCacheProvider } from '../../src/services/cache.js';
import { ApiError, ApiErrorType } from '../../src/types/error.js';

describe('缓存服务', () => {
  describe('MemoryCacheProvider', () => {
    let cache: MemoryCacheProvider;

    beforeEach(() => {
      cache = new MemoryCacheProvider(100);
    });

    it('应该设置和获取缓存值', async () => {
      await cache.set('key1', 'value1', 10000);
      const value = await cache.get('key1');
      expect(value).toBe('value1');
    });

    it('应该返回 null 对于不存在的键', async () => {
      const value = await cache.get('nonexistent');
      expect(value).toBeNull();
    });

    it('应该在过期后返回 null', async () => {
      await cache.set('key1', 'value1', 10); // 10ms TTL
      await new Promise((resolve) => setTimeout(resolve, 20));
      const value = await cache.get('key1');
      expect(value).toBeNull();
    });

    it('应该删除缓存值', async () => {
      await cache.set('key1', 'value1', 10000);
      await cache.delete('key1');
      const value = await cache.get('key1');
      expect(value).toBeNull();
    });

    it('应该清空所有缓存', async () => {
      await cache.set('key1', 'value1', 10000);
      await cache.set('key2', 'value2', 10000);
      await cache.clear();
      
      const value1 = await cache.get('key1');
      const value2 = await cache.get('key2');
      
      expect(value1).toBeNull();
      expect(value2).toBeNull();
    });

    it('应该支持不同类型的值', async () => {
      await cache.set('string', 'text', 10000);
      await cache.set('number', 42, 10000);
      await cache.set('object', { a: 1 }, 10000);
      await cache.set('array', [1, 2, 3], 10000);

      expect(await cache.get('string')).toBe('text');
      expect(await cache.get('number')).toBe(42);
      expect(await cache.get('object')).toEqual({ a: 1 });
      expect(await cache.get('array')).toEqual([1, 2, 3]);
    });
  });

  describe('generateCacheKey', () => {
    it('应该生成不带参数的缓存键', () => {
      const key = MemoryCacheProvider.generateCacheKey('stock_basic');
      expect(key).toBe('tushare:stock_basic');
    });

    it('应该生成带参数的缓存键', () => {
      const key = MemoryCacheProvider.generateCacheKey('stock_basic', {
        list_status: 'L',
        exchange: 'SSE',
      });
      expect(key).toBe('tushare:stock_basic:exchange=SSE&list_status=L');
    });

    it('应该对参数键排序', () => {
      const key1 = MemoryCacheProvider.generateCacheKey('api', {
        b: '2',
        a: '1',
      });
      const key2 = MemoryCacheProvider.generateCacheKey('api', {
        a: '1',
        b: '2',
      });
      expect(key1).toBe(key2);
    });
  });
});

describe('错误处理', () => {
  describe('ApiError', () => {
    it('应该创建 API 错误', () => {
      const error = new ApiError(
        ApiErrorType.AUTH_ERROR,
        'Invalid token',
        401
      );

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error.type).toBe(ApiErrorType.AUTH_ERROR);
      expect(error.message).toBe('Invalid token');
      expect(error.code).toBe(401);
    });

    it('应该正确判断可重试错误', () => {
      const retryableError = new ApiError(
        ApiErrorType.RATE_LIMIT,
        'Too many requests',
        429
      );
      expect(retryableError.retryable).toBe(true);

      const nonRetryableError = new ApiError(
        ApiErrorType.AUTH_ERROR,
        'Invalid token',
        401
      );
      expect(nonRetryableError.retryable).toBe(false);
    });

    it('应该从状态码创建错误', () => {
      const error401 = ApiError.fromStatusCode(401, 'Unauthorized');
      expect(error401.type).toBe(ApiErrorType.AUTH_ERROR);

      const error429 = ApiError.fromStatusCode(429, 'Rate limit');
      expect(error429.type).toBe(ApiErrorType.RATE_LIMIT);

      const error500 = ApiError.fromStatusCode(500, 'Server error');
      expect(error500.type).toBe(ApiErrorType.SERVER_ERROR);
    });

    it('应该从网络错误创建错误', () => {
      const networkError = new Error('Network failed');
      const apiError = ApiError.fromNetworkError(networkError);
      
      expect(apiError.type).toBe(ApiErrorType.NETWORK_ERROR);
      expect(apiError.originalError).toBe(networkError);
    });

    it('应该从超时创建错误', () => {
      const error = ApiError.fromTimeout(30000);
      
      expect(error.type).toBe(ApiErrorType.TIMEOUT_ERROR);
      expect(error.message).toContain('30000');
    });
  });
});
