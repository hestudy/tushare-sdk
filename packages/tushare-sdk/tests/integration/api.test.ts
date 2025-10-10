import { describe, it, expect, beforeAll } from 'vitest';
import { TushareClient } from '../../src/client/TushareClient.js';
import { ApiError } from '../../src/types/error.js';

/**
 * 集成测试
 * 
 * 注意: 这些测试需要有效的 Tushare API Token
 * 设置环境变量 TUSHARE_TOKEN 来运行这些测试
 * 
 * 如果没有 Token, 这些测试将被跳过
 */

const hasToken = !!process.env.TUSHARE_TOKEN;
const skipMessage = '跳过: 需要 TUSHARE_TOKEN 环境变量';

describe.skipIf(!hasToken)('API 集成测试', () => {
  let client: TushareClient;

  beforeAll(() => {
    client = new TushareClient({
      token: process.env.TUSHARE_TOKEN!,
      cache: {
        enabled: true,
        ttl: 60000, // 1分钟缓存
      },
      retry: {
        maxRetries: 2,
        initialDelay: 1000,
        maxDelay: 5000,
        backoffFactor: 2,
      },
    });
  });

  describe('stock_basic API', () => {
    it('应该成功获取股票列表', async () => {
      const stocks = await client.getStockBasic({
        list_status: 'L',
      });

      expect(Array.isArray(stocks)).toBe(true);
      expect(stocks.length).toBeGreaterThan(0);

      // 验证数据结构
      const firstStock = stocks[0];
      expect(firstStock).toHaveProperty('ts_code');
      expect(firstStock).toHaveProperty('symbol');
      expect(firstStock).toHaveProperty('name');
      expect(typeof firstStock.ts_code).toBe('string');
      expect(typeof firstStock.name).toBe('string');
    }, 30000);

    it('应该支持按交易所筛选', async () => {
      const stocks = await client.getStockBasic({
        list_status: 'L',
        exchange: 'SSE',
      });

      expect(Array.isArray(stocks)).toBe(true);
      
      // 验证所有股票都是上交所的
      if (stocks.length > 0) {
        const allSSE = stocks.every((stock) =>
          stock.ts_code.endsWith('.SH')
        );
        expect(allSSE).toBe(true);
      }
    }, 30000);
  });

  describe('daily API', () => {
    it('应该成功获取日线行情', async () => {
      const quotes = await client.getDailyQuote({
        ts_code: '000001.SZ',
        start_date: '20240101',
        end_date: '20240131',
      });

      expect(Array.isArray(quotes)).toBe(true);

      if (quotes.length > 0) {
        const firstQuote = quotes[0];
        expect(firstQuote).toHaveProperty('ts_code');
        expect(firstQuote).toHaveProperty('trade_date');
        expect(firstQuote).toHaveProperty('open');
        expect(firstQuote).toHaveProperty('close');
        expect(typeof firstQuote.open).toBe('number');
        expect(typeof firstQuote.close).toBe('number');
      }
    }, 30000);
  });

  describe('通用 query 方法', () => {
    it('应该支持任意 API 调用', async () => {
      const result = await client.query('trade_cal', {
        exchange: 'SSE',
        start_date: '20240101',
        end_date: '20240131',
      });

      expect(Array.isArray(result)).toBe(true);
    }, 30000);
  });

  describe('缓存功能', () => {
    it('第二次调用应该从缓存返回', async () => {
      const params = {
        list_status: 'L' as const,
        exchange: 'SSE' as const,
      };

      // 第一次调用
      const start1 = performance.now();
      const result1 = await client.getStockBasic(params);
      const time1 = performance.now() - start1;

      // 第二次调用 (应该从缓存)
      const start2 = performance.now();
      const result2 = await client.getStockBasic(params);
      const time2 = performance.now() - start2;

      expect(result1).toEqual(result2);
      // 缓存应该显著更快 (至少快 50%)
      expect(time2).toBeLessThan(time1 * 0.5);
    }, 60000);
  });
});

describe('错误处理集成测试', () => {
  it('应该拒绝无效的 token', async () => {
    const client = new TushareClient({
      token: 'invalid_token',
    });

    await expect(
      client.getStockBasic({ list_status: 'L' })
    ).rejects.toThrow(ApiError);
  }, 30000);

  it('应该处理无效的参数', async () => {
    if (!hasToken) {
      console.log(skipMessage);
      return;
    }

    const client = new TushareClient({
      token: process.env.TUSHARE_TOKEN!,
    });

    // 无效的日期格式
    await expect(
      client.query('daily', {
        ts_code: '000001.SZ',
        start_date: 'invalid',
      })
    ).rejects.toThrow();
  }, 30000);
});
