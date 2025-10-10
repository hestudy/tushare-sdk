import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryCacheProvider } from '../../src/services/cache.js';
import { RetryService } from '../../src/services/retry.js';
import { ApiError, ApiErrorType } from '../../src/types/error.js';
import { ConsoleLogger, LogLevel } from '../../src/utils/logger.js';

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

describe('重试服务', () => {
  describe('T042: RetryService 指数退避逻辑', () => {
    it('应该在成功时立即返回结果', async () => {
      const retryService = new RetryService({
        maxRetries: 3,
        initialDelay: 100,
        maxDelay: 1000,
        backoffFactor: 2,
      });

      const mockFn = vi.fn().mockResolvedValue('success');
      const result = await retryService.execute(mockFn, 'test');

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('应该在失败后重试', async () => {
      const retryService = new RetryService({
        maxRetries: 2,
        initialDelay: 10,
        maxDelay: 100,
        backoffFactor: 2,
      });

      let callCount = 0;
      const mockFn = vi.fn().mockImplementation(async () => {
        callCount++;
        if (callCount < 3) {
          throw new ApiError(
            ApiErrorType.NETWORK_ERROR,
            'Network failed'
          );
        }
        return 'success';
      });

      const result = await retryService.execute(mockFn, 'test');

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3); // 1 初始 + 2 重试
    });

    it('应该使用指数退避算法', async () => {
      const retryService = new RetryService({
        maxRetries: 3,
        initialDelay: 100,
        maxDelay: 10000,
        backoffFactor: 2,
      });

      const retryTimes: number[] = [];
      let callCount = 0;

      const mockFn = vi.fn().mockImplementation(async () => {
        retryTimes.push(Date.now());
        callCount++;
        if (callCount < 4) {
          throw new ApiError(
            ApiErrorType.SERVER_ERROR,
            'Server error'
          );
        }
        return 'success';
      });

      await retryService.execute(mockFn, 'test');

      expect(callCount).toBe(4);
      expect(retryTimes).toHaveLength(4);

      // 验证延迟大致符合指数增长（允许 ±20% 抖动）
      if (retryTimes.length >= 3) {
        const delay1 = retryTimes[1] - retryTimes[0];
        const delay2 = retryTimes[2] - retryTimes[1];
        const delay3 = retryTimes[3] - retryTimes[2];

        // 第一次重试: ~100ms (±20%)
        expect(delay1).toBeGreaterThanOrEqual(80);
        expect(delay1).toBeLessThan(150);

        // 第二次重试: ~200ms (±20%)
        expect(delay2).toBeGreaterThanOrEqual(160);
        expect(delay2).toBeLessThan(300);

        // 第三次重试: ~400ms (±20%)
        expect(delay3).toBeGreaterThanOrEqual(320);
        expect(delay3).toBeLessThan(600);
      }
    });

    it('应该遵循 maxDelay 限制', async () => {
      const retryService = new RetryService({
        maxRetries: 5,
        initialDelay: 100,
        maxDelay: 200, // 最大延迟 200ms
        backoffFactor: 2,
      });

      const retryTimes: number[] = [];
      let callCount = 0;

      const mockFn = vi.fn().mockImplementation(async () => {
        retryTimes.push(Date.now());
        callCount++;
        if (callCount < 6) {
          throw new ApiError(
            ApiErrorType.SERVER_ERROR,
            'Server error'
          );
        }
        return 'success';
      });

      await retryService.execute(mockFn, 'test');

      // 验证后续延迟不超过 maxDelay (考虑抖动)
      for (let i = 2; i < retryTimes.length; i++) {
        const delay = retryTimes[i] - retryTimes[i - 1];
        expect(delay).toBeLessThan(250); // maxDelay + 抖动余量
      }
    });

    it('应该在达到最大重试次数后抛出错误', async () => {
      const retryService = new RetryService({
        maxRetries: 2,
        initialDelay: 10,
        maxDelay: 100,
        backoffFactor: 2,
      });

      const mockFn = vi.fn().mockRejectedValue(
        new ApiError(
          ApiErrorType.SERVER_ERROR,
          'Server error'
        )
      );

      await expect(
        retryService.execute(mockFn, 'test')
      ).rejects.toThrow('Server error');

      expect(mockFn).toHaveBeenCalledTimes(3); // 1 初始 + 2 重试
    });
  });

  describe('T043: ApiError 错误分类和 retryable 判断', () => {
    it('应该正确判断可重试的错误类型', () => {
      const retryableTypes = [
        ApiErrorType.RATE_LIMIT,
        ApiErrorType.NETWORK_ERROR,
        ApiErrorType.TIMEOUT_ERROR,
        ApiErrorType.SERVER_ERROR,
      ];

      retryableTypes.forEach((type) => {
        const error = new ApiError(type, 'Test error');
        expect(error.retryable).toBe(true);
      });
    });

    it('应该正确判断不可重试的错误类型', () => {
      const nonRetryableTypes = [
        ApiErrorType.AUTH_ERROR,
        ApiErrorType.VALIDATION_ERROR,
        ApiErrorType.UNKNOWN_ERROR,
      ];

      nonRetryableTypes.forEach((type) => {
        const error = new ApiError(type, 'Test error');
        expect(error.retryable).toBe(false);
      });
    });

    it('应该在遇到不可重试错误时立即抛出', async () => {
      const retryService = new RetryService({
        maxRetries: 3,
        initialDelay: 10,
        maxDelay: 100,
        backoffFactor: 2,
      });

      const mockFn = vi.fn().mockRejectedValue(
        new ApiError(
          ApiErrorType.AUTH_ERROR,
          'Invalid token'
        )
      );

      await expect(
        retryService.execute(mockFn, 'test')
      ).rejects.toThrow('Invalid token');

      // 验证只调用了一次，没有重试
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('应该支持 retryAfter 属性', async () => {
      const retryService = new RetryService({
        maxRetries: 2,
        initialDelay: 1000, // 默认延迟应该被 retryAfter 覆盖
        maxDelay: 5000,
        backoffFactor: 2,
      });

      const retryTimes: number[] = [];
      let callCount = 0;

      const mockFn = vi.fn().mockImplementation(async () => {
        retryTimes.push(Date.now());
        callCount++;
        
        if (callCount < 2) {
          const error = new ApiError(
            ApiErrorType.RATE_LIMIT,
            'Rate limit exceeded'
          );
          error.retryAfter = 50; // 指定 50ms 后重试
          throw error;
        }
        
        return 'success';
      });

      await retryService.execute(mockFn, 'test');

      expect(callCount).toBe(2);
      
      // 验证使用了 retryAfter 指定的延迟
      if (retryTimes.length >= 2) {
        const actualDelay = retryTimes[1] - retryTimes[0];
        expect(actualDelay).toBeGreaterThanOrEqual(45);
        expect(actualDelay).toBeLessThan(100);
      }
    });
  });

  describe('日志记录', () => {
    it('应该记录重试过程', async () => {
      const logger = new ConsoleLogger(LogLevel.DEBUG);
      const debugSpy = vi.spyOn(logger, 'debug');
      const infoSpy = vi.spyOn(logger, 'info');

      const retryService = new RetryService(
        {
          maxRetries: 2,
          initialDelay: 10,
          maxDelay: 100,
          backoffFactor: 2,
        },
        logger
      );

      let callCount = 0;
      const mockFn = vi.fn().mockImplementation(async () => {
        callCount++;
        if (callCount < 2) {
          throw new ApiError(
            ApiErrorType.NETWORK_ERROR,
            'Network failed'
          );
        }
        return 'success';
      });

      await retryService.execute(mockFn, 'test_api');

      // 验证记录了重试日志
      expect(infoSpy).toHaveBeenCalled();
      expect(debugSpy).toHaveBeenCalled();

      debugSpy.mockRestore();
      infoSpy.mockRestore();
    });
  });
});
