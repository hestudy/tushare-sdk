/**
 * 重试机制集成测试
 * 
 * 测试目标:
 * - T044: 429 限流错误自动重试
 * - T045: 网络超时错误重试
 * - T046: 不可重试错误（401, 400）立即抛出
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TushareClient } from '../../src/client/TushareClient';
import { ApiError, ApiErrorType } from '../../src/types/error';
import { HttpClient } from '../../src/client/http';

describe('重试机制集成测试', () => {
  describe('T044: 429 限流错误自动重试', () => {
    it('应该在遇到 429 错误时自动重试', async () => {
      let callCount = 0;
      const mockPost = vi.fn().mockImplementation(async () => {
        callCount++;
        if (callCount < 3) {
          // 前两次调用返回 429 错误
          const error = ApiError.fromStatusCode(429, 'Rate limit exceeded');
          error.retryAfter = 100; // 100ms 后重试
          throw error;
        }
        // 第三次调用成功
        return {
          code: 0,
          msg: 'success',
          data: {
            fields: ['ts_code', 'name'],
            items: [['000001.SZ', '平安银行']],
          },
        };
      });

      // 替换 HttpClient 的 post 方法
      vi.spyOn(HttpClient.prototype, 'post').mockImplementation(mockPost);

      const client = new TushareClient({
        token: 'test_token',
        retry: {
          maxRetries: 3,
          initialDelay: 100,
          maxDelay: 1000,
          backoffFactor: 2,
        },
      });

      const result = await client.getStockBasic({ list_status: 'L' });

      // 验证重试了 3 次
      expect(callCount).toBe(3);
      expect(result).toHaveLength(1);
      expect(result[0].ts_code).toBe('000001.SZ');

      vi.restoreAllMocks();
    }, 30000);

    it('应该遵循服务端指定的 Retry-After 延迟', async () => {
      const retryDelays: number[] = [];
      let callCount = 0;

      const mockPost = vi.fn().mockImplementation(async () => {
        callCount++;
        const startTime = Date.now();
        
        if (callCount < 2) {
          // 第一次调用返回 429，指定 200ms 后重试
          const error = ApiError.fromStatusCode(429, 'Rate limit exceeded');
          error.retryAfter = 200;
          throw error;
        }

        // 记录实际延迟时间
        if (callCount === 2 && retryDelays.length > 0) {
          const actualDelay = startTime - retryDelays[retryDelays.length - 1];
          retryDelays.push(actualDelay);
        }

        return {
          code: 0,
          msg: 'success',
          data: {
            fields: ['ts_code'],
            items: [['000001.SZ']],
          },
        };
      });

      vi.spyOn(HttpClient.prototype, 'post').mockImplementation(mockPost);

      const client = new TushareClient({
        token: 'test_token',
        retry: {
          maxRetries: 2,
          initialDelay: 1000, // 默认延迟应该被 retryAfter 覆盖
          maxDelay: 5000,
          backoffFactor: 2,
        },
      });

      retryDelays.push(Date.now());
      await client.getStockBasic({ list_status: 'L' });

      expect(callCount).toBe(2);
      // 验证使用了服务端指定的延迟（允许一些误差）
      if (retryDelays.length > 1) {
        expect(retryDelays[1]).toBeGreaterThanOrEqual(180); // 至少 180ms
        expect(retryDelays[1]).toBeLessThan(300); // 不超过 300ms
      }

      vi.restoreAllMocks();
    }, 30000);
  });

  describe('T045: 网络超时错误重试', () => {
    it('应该在超时错误时自动重试', async () => {
      let callCount = 0;
      const mockPost = vi.fn().mockImplementation(async () => {
        callCount++;
        if (callCount < 2) {
          // 第一次调用超时
          throw ApiError.fromTimeout(5000);
        }
        // 第二次调用成功
        return {
          code: 0,
          msg: 'success',
          data: {
            fields: ['ts_code'],
            items: [['000001.SZ']],
          },
        };
      });

      vi.spyOn(HttpClient.prototype, 'post').mockImplementation(mockPost);

      const client = new TushareClient({
        token: 'test_token',
        retry: {
          maxRetries: 2,
          initialDelay: 100,
          maxDelay: 1000,
          backoffFactor: 2,
        },
      });

      const result = await client.getStockBasic({ list_status: 'L' });

      expect(callCount).toBe(2);
      expect(result).toHaveLength(1);

      vi.restoreAllMocks();
    }, 30000);

    it('应该在网络错误时自动重试', async () => {
      let callCount = 0;
      const mockPost = vi.fn().mockImplementation(async () => {
        callCount++;
        if (callCount < 3) {
          // 前两次调用网络错误
          throw ApiError.fromNetworkError(new Error('Network connection failed'));
        }
        // 第三次调用成功
        return {
          code: 0,
          msg: 'success',
          data: {
            fields: ['ts_code'],
            items: [['000001.SZ']],
          },
        };
      });

      vi.spyOn(HttpClient.prototype, 'post').mockImplementation(mockPost);

      const client = new TushareClient({
        token: 'test_token',
        retry: {
          maxRetries: 3,
          initialDelay: 100,
          maxDelay: 1000,
          backoffFactor: 2,
        },
      });

      const result = await client.getStockBasic({ list_status: 'L' });

      expect(callCount).toBe(3);
      expect(result).toHaveLength(1);

      vi.restoreAllMocks();
    }, 30000);
  });

  describe('T046: 不可重试错误立即抛出', () => {
    it('应该在 401 认证错误时立即抛出，不重试', async () => {
      let callCount = 0;
      const mockPost = vi.fn().mockImplementation(async () => {
        callCount++;
        throw ApiError.fromStatusCode(401, 'Invalid token');
      });

      vi.spyOn(HttpClient.prototype, 'post').mockImplementation(mockPost);

      const client = new TushareClient({
        token: 'invalid_token',
        retry: {
          maxRetries: 3,
          initialDelay: 100,
          maxDelay: 1000,
          backoffFactor: 2,
        },
      });

      await expect(
        client.getStockBasic({ list_status: 'L' })
      ).rejects.toThrow(ApiError);

      await expect(
        client.getStockBasic({ list_status: 'L' })
      ).rejects.toThrow('Invalid token');

      // 验证只调用了一次，没有重试
      expect(callCount).toBe(2); // 两次请求，每次都只调用一次

      vi.restoreAllMocks();
    }, 30000);

    it('应该在 400 参数错误时立即抛出，不重试', async () => {
      let callCount = 0;
      const mockPost = vi.fn().mockImplementation(async () => {
        callCount++;
        throw ApiError.fromStatusCode(400, 'Invalid parameters');
      });

      vi.spyOn(HttpClient.prototype, 'post').mockImplementation(mockPost);

      const client = new TushareClient({
        token: 'test_token',
        retry: {
          maxRetries: 3,
          initialDelay: 100,
          maxDelay: 1000,
          backoffFactor: 2,
        },
      });

      await expect(
        client.getStockBasic({ list_status: 'L' })
      ).rejects.toThrow(ApiError);

      // 验证只调用了一次，没有重试
      expect(callCount).toBe(1);

      vi.restoreAllMocks();
    }, 30000);

    it('应该在业务错误（code !== 0）时立即抛出，不重试', async () => {
      let callCount = 0;
      const mockPost = vi.fn().mockImplementation(async () => {
        callCount++;
        // HTTP 客户端会检查 code !== 0 并抛出 VALIDATION_ERROR
        throw new ApiError(
          ApiErrorType.VALIDATION_ERROR,
          'Invalid API name',
          -1
        );
      });

      vi.spyOn(HttpClient.prototype, 'post').mockImplementation(mockPost);

      const client = new TushareClient({
        token: 'test_token',
        retry: {
          maxRetries: 3,
          initialDelay: 100,
          maxDelay: 1000,
          backoffFactor: 2,
        },
      });

      await expect(
        client.getStockBasic({ list_status: 'L' })
      ).rejects.toThrow(ApiError);

      await expect(
        client.getStockBasic({ list_status: 'L' })
      ).rejects.toThrow('Invalid API name');

      // 验证只调用了一次，没有重试（两次请求，每次都只调用一次）
      expect(callCount).toBe(2);

      vi.restoreAllMocks();
    }, 30000);
  });

  describe('重试次数限制', () => {
    it('应该在达到最大重试次数后抛出错误', async () => {
      let callCount = 0;
      const mockPost = vi.fn().mockImplementation(async () => {
        callCount++;
        throw ApiError.fromStatusCode(500, 'Server error');
      });

      vi.spyOn(HttpClient.prototype, 'post').mockImplementation(mockPost);

      const client = new TushareClient({
        token: 'test_token',
        retry: {
          maxRetries: 2,
          initialDelay: 50,
          maxDelay: 500,
          backoffFactor: 2,
        },
      });

      await expect(
        client.getStockBasic({ list_status: 'L' })
      ).rejects.toThrow(ApiError);

      // 验证调用了 1 次初始 + 2 次重试 = 3 次
      expect(callCount).toBe(3);

      vi.restoreAllMocks();
    }, 30000);
  });

  describe('指数退避算法', () => {
    it('应该使用指数退避算法计算延迟', async () => {
      const retryTimes: number[] = [];
      let callCount = 0;

      const mockPost = vi.fn().mockImplementation(async () => {
        retryTimes.push(Date.now());
        callCount++;
        
        if (callCount < 4) {
          throw ApiError.fromStatusCode(500, 'Server error');
        }
        
        return {
          code: 0,
          msg: 'success',
          data: {
            fields: ['ts_code'],
            items: [['000001.SZ']],
          },
        };
      });

      vi.spyOn(HttpClient.prototype, 'post').mockImplementation(mockPost);

      const client = new TushareClient({
        token: 'test_token',
        retry: {
          maxRetries: 3,
          initialDelay: 100,
          maxDelay: 10000,
          backoffFactor: 2,
        },
      });

      await client.getStockBasic({ list_status: 'L' });

      expect(callCount).toBe(4);
      expect(retryTimes).toHaveLength(4);

      // 验证延迟大致符合指数增长（允许抖动）
      if (retryTimes.length >= 3) {
        const delay1 = retryTimes[1] - retryTimes[0];
        const delay2 = retryTimes[2] - retryTimes[1];
        
        // 第一次重试延迟约 100ms (±20%)
        expect(delay1).toBeGreaterThanOrEqual(80);
        expect(delay1).toBeLessThan(150);
        
        // 第二次重试延迟约 200ms (±20%)
        expect(delay2).toBeGreaterThanOrEqual(160);
        expect(delay2).toBeLessThan(300);
      }

      vi.restoreAllMocks();
    }, 30000);
  });
});
