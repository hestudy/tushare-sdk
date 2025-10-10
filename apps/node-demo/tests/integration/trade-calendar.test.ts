import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TushareClient } from '@hestudy/tushare-sdk';

/**
 * 集成测试: 交易日历 API
 * 测试 getTradeCalendar() 方法的功能
 */
describe('交易日历 API 集成测试', () => {
  let client: TushareClient;
  const hasToken = !!process.env.TUSHARE_TOKEN;

  beforeEach(() => {
    // 使用环境变量中的 Token,如果没有则使用 mock
    const token = process.env.TUSHARE_TOKEN || 'test_token';
    client = new TushareClient({ token });
  });

  it.skipIf(!hasToken)('应该成功查询交易日历', async () => {

    const result = await client.getTradeCalendar({
      exchange: 'SSE',
      start_date: '20240101',
      end_date: '20240131',
    });

    // 验证响应结构
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);

    // 验证数据字段
    if (result.length > 0) {
      const firstItem = result[0];
      expect(firstItem).toHaveProperty('exchange');
      expect(firstItem).toHaveProperty('cal_date');
      expect(firstItem).toHaveProperty('is_open');
    }
  });

  it.skipIf(!hasToken)('应该支持查询上交所交易日历', async () => {

    const result = await client.getTradeCalendar({
      exchange: 'SSE',
      start_date: '20240901',
      end_date: '20240930',
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);

    // 验证所有记录都是上交所
    if (result.length > 0) {
      result.forEach((item: any) => {
        expect(item.exchange).toBe('SSE');
      });
    }
  });

  it.skipIf(!hasToken)('应该支持查询深交所交易日历', async () => {

    const result = await client.getTradeCalendar({
      exchange: 'SZSE',
      start_date: '20240901',
      end_date: '20240930',
    });

    expect(result).toBeDefined();
    expect(result).toBeDefined();

    // 验证所有记录都是深交所
    if (result.length > 0) {
      result.forEach((item: any) => {
        expect(item.exchange).toBe('SZSE');
      });
    }
  });

  it.skipIf(!hasToken)('应该正确标识交易日和非交易日', async () => {

    const result = await client.getTradeCalendar({
      exchange: 'SSE',
      start_date: '20240101',
      end_date: '20240131',
    });

    expect(result).toBeDefined();

    // 验证 is_open 字段是 0 或 1
    if (result.length > 0) {
      result.forEach((item: any) => {
        expect([0, 1]).toContain(item.is_open);
      });
    }
  });

  it.skipIf(!hasToken)('应该支持查询特定日期', async () => {

    const result = await client.getTradeCalendar({
      exchange: 'SSE',
      start_date: '20240101',
      end_date: '20240101',
    });

    expect(result).toBeDefined();
    expect(result).toBeDefined();

    // 应该只返回一条记录
    if (result.length > 0) {
      expect(result.length).toBe(1);
      expect(result[0].cal_date).toBe('20240101');
    }
  });

  it.skipIf(!hasToken)('应该正确处理日期范围查询', async () => {

    const result = await client.getTradeCalendar({
      exchange: 'SSE',
      start_date: '20240901',
      end_date: '20240930',
    });

    expect(result).toBeDefined();

    // 验证返回的数据在日期范围内
    if (result.length > 0) {
      result.forEach((item: any) => {
        const calDate = parseInt(item.cal_date);
        expect(calDate).toBeGreaterThanOrEqual(20240901);
        expect(calDate).toBeLessThanOrEqual(20240930);
      });
    }
  });

  it.skipIf(!hasToken)('应该返回包含交易日和非交易日的完整日历', async () => {

    const result = await client.getTradeCalendar({
      exchange: 'SSE',
      start_date: '20240901',
      end_date: '20240930',
    });

    expect(result).toBeDefined();

    // 一个月应该有约 30 天的记录
    if (result.length > 0) {
      expect(result.length).toBeGreaterThan(20);
      expect(result.length).toBeLessThanOrEqual(31);

      // 应该同时包含交易日和非交易日
      const openDays = result.filter((item: any) => item.is_open === 1);
      const closedDays = result.filter((item: any) => item.is_open === 0);

      expect(openDays.length).toBeGreaterThan(0);
      expect(closedDays.length).toBeGreaterThan(0);
    }
  });
});
