import { describe, it, expect } from 'vitest';
import { TushareClient } from '../../src/client/TushareClient.js';
import { ApiError, ApiErrorType } from '../../src/types/error.js';

describe('TushareClient', () => {
  describe('初始化', () => {
    it('应该成功创建客户端实例', () => {
      const client = new TushareClient({
        token: 'test_token',
      });

      expect(client).toBeInstanceOf(TushareClient);
    });

    it('应该使用默认配置', () => {
      const client = new TushareClient({
        token: 'test_token',
      });

      expect(client).toBeDefined();
      // 默认配置已应用
    });

    it('应该接受自定义配置', () => {
      const client = new TushareClient({
        token: 'test_token',
        timeout: 60000,
        retry: {
          maxRetries: 5,
          initialDelay: 2000,
        },
        cache: {
          enabled: true,
          ttl: 7200000,
        },
        concurrency: {
          maxConcurrent: 10,
          minInterval: 100,
        },
      });

      expect(client).toBeDefined();
    });
  });

  describe('配置验证', () => {
    it('应该拒绝空 token', () => {
      expect(() => {
        new TushareClient({
          token: '',
        });
      }).toThrow(ApiError);
    });

    it('应该拒绝无效的 timeout', () => {
      expect(() => {
        new TushareClient({
          token: 'test_token',
          timeout: 500, // < 1000
        });
      }).toThrow(ApiError);
    });

    it('应该拒绝无效的 maxRetries', () => {
      expect(() => {
        new TushareClient({
          token: 'test_token',
          retry: {
            maxRetries: 15, // > 10
            initialDelay: 1000,
            maxDelay: 30000,
            backoffFactor: 2,
          },
        });
      }).toThrow(ApiError);
    });

    it('应该拒绝无效的 maxConcurrent', () => {
      expect(() => {
        new TushareClient({
          token: 'test_token',
          concurrency: {
            maxConcurrent: 100, // > 50
            minInterval: 200,
          },
        });
      }).toThrow(ApiError);
    });
  });

  describe('API 方法', () => {
    it('应该有 query 方法', () => {
      const client = new TushareClient({
        token: 'test_token',
      });

      expect(typeof client.query).toBe('function');
    });

    it('应该有 getStockBasic 方法', () => {
      const client = new TushareClient({
        token: 'test_token',
      });

      expect(typeof client.getStockBasic).toBe('function');
    });

    it('应该有 getDailyQuote 方法', () => {
      const client = new TushareClient({
        token: 'test_token',
      });

      expect(typeof client.getDailyQuote).toBe('function');
    });
  });
});
