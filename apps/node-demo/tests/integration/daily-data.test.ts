import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TushareClient } from '@hestudy/tushare-sdk';

/**
 * 集成测试: 日线数据 API
 * 测试 getDailyQuote() 方法的功能
 */
describe('日线数据 API 集成测试', () => {
  let client: TushareClient;

  beforeEach(() => {
    // 使用环境变量中的 Token,如果没有则使用 mock
    const token = process.env.TUSHARE_TOKEN || 'test_token';
    client = new TushareClient({ token });
  });

  it('应该成功查询指定股票的日线数据', async () => {
    // 如果没有真实 Token,跳过此测试
    if (!process.env.TUSHARE_TOKEN) {
      console.log('跳过: 需要真实 TUSHARE_TOKEN');
      return;
    }

    const result = await client.getDailyQuote({
      ts_code: '000001.SZ',
      start_date: '20240101',
      end_date: '20240131',
    });

    // 验证响应结构
    expect(result).toBeDefined();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);

    // 验证数据字段
    if (result.length > 0) {
      const firstItem = result[0];
      expect(firstItem).toHaveProperty('ts_code');
      expect(firstItem).toHaveProperty('trade_date');
      expect(firstItem).toHaveProperty('open');
      expect(firstItem).toHaveProperty('high');
      expect(firstItem).toHaveProperty('low');
      expect(firstItem).toHaveProperty('close');
      expect(firstItem).toHaveProperty('vol');
    }
  });

  it('应该支持只传入股票代码查询', async () => {
    if (!process.env.TUSHARE_TOKEN) {
      console.log('跳过: 需要真实 TUSHARE_TOKEN');
      return;
    }

    const result = await client.getDailyQuote({
      ts_code: '000001.SZ',
    });

    expect(result).toBeDefined();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it('应该支持日期范围查询', async () => {
    if (!process.env.TUSHARE_TOKEN) {
      console.log('跳过: 需要真实 TUSHARE_TOKEN');
      return;
    }

    const result = await client.getDailyQuote({
      ts_code: '600000.SH',
      start_date: '20240901',
      end_date: '20240930',
    });

    expect(result).toBeDefined();
    expect(result).toBeDefined();

    // 验证返回的数据在日期范围内
    if (result.length > 0) {
      result.forEach((item: any) => {
        const tradeDate = parseInt(item.trade_date);
        expect(tradeDate).toBeGreaterThanOrEqual(20240901);
        expect(tradeDate).toBeLessThanOrEqual(20240930);
      });
    }
  });

  it('应该正确处理不存在的股票代码', async () => {
    if (!process.env.TUSHARE_TOKEN) {
      console.log('跳过: 需要真实 TUSHARE_TOKEN');
      return;
    }

    // 使用不存在的股票代码
    const result = await client.getDailyQuote({
      ts_code: '999999.SZ',
      start_date: '20240101',
      end_date: '20240131',
    });

    // 应该返回空数组而不是抛出错误
    expect(result).toBeDefined();
    expect(result.length).toBe(0);
  });

  it('应该正确处理非交易日期', async () => {
    if (!process.env.TUSHARE_TOKEN) {
      console.log('跳过: 需要真实 TUSHARE_TOKEN');
      return;
    }

    // 查询周末或节假日
    const result = await client.getDailyQuote({
      ts_code: '000001.SZ',
      start_date: '20240106', // 假设是周末
      end_date: '20240107',
    });

    expect(result).toBeDefined();
    // 非交易日应该返回空数组
    expect(Array.isArray(result)).toBe(true);
  });
});
