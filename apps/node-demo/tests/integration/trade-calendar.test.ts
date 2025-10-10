import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TushareClient } from '@hestudy/tushare-sdk';

/**
 * 集成测试: 交易日历 API
 * 测试 getTradeCalendar() 方法的功能
 */
describe('交易日历 API 集成测试', () => {
  let client: TushareClient;

  beforeEach(() => {
    // 使用环境变量中的 Token,如果没有则使用 mock
    const token = process.env.TUSHARE_TOKEN || 'test_token';
    client = new TushareClient({ token });
  });

  it('应该成功查询交易日历', async () => {
    // 如果没有真实 Token,跳过此测试
    if (!process.env.TUSHARE_TOKEN) {
      console.log('跳过: 需要真实 TUSHARE_TOKEN');
      return;
    }

    const result = await client.getTradeCalendar({
      exchange: 'SSE',
      start_date: '20240101',
      end_date: '20240131',
    });

    // 验证响应结构
    expect(result).toBeDefined();
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);

    // 验证数据字段
    if (result.data.length > 0) {
      const firstItem = result.data[0];
      expect(firstItem).toHaveProperty('exchange');
      expect(firstItem).toHaveProperty('cal_date');
      expect(firstItem).toHaveProperty('is_open');
    }
  });

  it('应该支持查询上交所交易日历', async () => {
    if (!process.env.TUSHARE_TOKEN) {
      console.log('跳过: 需要真实 TUSHARE_TOKEN');
      return;
    }

    const result = await client.getTradeCalendar({
      exchange: 'SSE',
      start_date: '20240901',
      end_date: '20240930',
    });

    expect(result).toBeDefined();
    expect(result.data).toBeDefined();

    // 验证所有记录都是上交所
    if (result.data.length > 0) {
      result.data.forEach((item: any) => {
        expect(item.exchange).toBe('SSE');
      });
    }
  });

  it('应该支持查询深交所交易日历', async () => {
    if (!process.env.TUSHARE_TOKEN) {
      console.log('跳过: 需要真实 TUSHARE_TOKEN');
      return;
    }

    const result = await client.getTradeCalendar({
      exchange: 'SZSE',
      start_date: '20240901',
      end_date: '20240930',
    });

    expect(result).toBeDefined();
    expect(result.data).toBeDefined();

    // 验证所有记录都是深交所
    if (result.data.length > 0) {
      result.data.forEach((item: any) => {
        expect(item.exchange).toBe('SZSE');
      });
    }
  });

  it('应该正确标识交易日和非交易日', async () => {
    if (!process.env.TUSHARE_TOKEN) {
      console.log('跳过: 需要真实 TUSHARE_TOKEN');
      return;
    }

    const result = await client.getTradeCalendar({
      exchange: 'SSE',
      start_date: '20240101',
      end_date: '20240131',
    });

    expect(result.data).toBeDefined();

    // 验证 is_open 字段是 0 或 1
    if (result.data.length > 0) {
      result.data.forEach((item: any) => {
        expect([0, 1]).toContain(item.is_open);
      });
    }
  });

  it('应该支持查询特定日期', async () => {
    if (!process.env.TUSHARE_TOKEN) {
      console.log('跳过: 需要真实 TUSHARE_TOKEN');
      return;
    }

    const result = await client.getTradeCalendar({
      exchange: 'SSE',
      start_date: '20240101',
      end_date: '20240101',
    });

    expect(result).toBeDefined();
    expect(result.data).toBeDefined();

    // 应该只返回一条记录
    if (result.data.length > 0) {
      expect(result.data.length).toBe(1);
      expect(result.data[0].cal_date).toBe('20240101');
    }
  });

  it('应该正确处理日期范围查询', async () => {
    if (!process.env.TUSHARE_TOKEN) {
      console.log('跳过: 需要真实 TUSHARE_TOKEN');
      return;
    }

    const result = await client.getTradeCalendar({
      exchange: 'SSE',
      start_date: '20240901',
      end_date: '20240930',
    });

    expect(result.data).toBeDefined();

    // 验证返回的数据在日期范围内
    if (result.data.length > 0) {
      result.data.forEach((item: any) => {
        const calDate = parseInt(item.cal_date);
        expect(calDate).toBeGreaterThanOrEqual(20240901);
        expect(calDate).toBeLessThanOrEqual(20240930);
      });
    }
  });

  it('应该返回包含交易日和非交易日的完整日历', async () => {
    if (!process.env.TUSHARE_TOKEN) {
      console.log('跳过: 需要真实 TUSHARE_TOKEN');
      return;
    }

    const result = await client.getTradeCalendar({
      exchange: 'SSE',
      start_date: '20240901',
      end_date: '20240930',
    });

    expect(result.data).toBeDefined();

    // 一个月应该有约 30 天的记录
    if (result.data.length > 0) {
      expect(result.data.length).toBeGreaterThan(20);
      expect(result.data.length).toBeLessThanOrEqual(31);

      // 应该同时包含交易日和非交易日
      const openDays = result.data.filter((item: any) => item.is_open === 1);
      const closedDays = result.data.filter((item: any) => item.is_open === 0);

      expect(openDays.length).toBeGreaterThan(0);
      expect(closedDays.length).toBeGreaterThan(0);
    }
  });
});
