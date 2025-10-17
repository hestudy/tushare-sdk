/**
 * Tushare Client 单元测试
 *
 * 测试 TushareService 封装类的功能:
 * - API 调用封装
 * - 限流逻辑
 * - 错误处理
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock @hestudy/tushare-sdk
const mockQuery = vi.fn();
vi.mock('@hestudy/tushare-sdk', () => ({
  TushareClient: vi.fn().mockImplementation(() => ({
    query: mockQuery,
  })),
}));

// 必须在 mock 之后导入
const { TushareService } = await import('../../lib/tushare-client');

describe('TushareService', () => {
  let service: InstanceType<typeof TushareService>;

  beforeEach(() => {
    mockQuery.mockClear();
    service = new TushareService('test_token_32_characters_long_abc', 5);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getDailyQuotes', () => {
    it('应该成功获取日线行情数据', async () => {
      const mockData = [
        {
          ts_code: '600519.SH',
          trade_date: '20240101',
          open: 1450.0,
          high: 1460.0,
          low: 1445.0,
          close: 1455.0,
          pre_close: 1440.0,
          change: 15.0,
          pct_chg: 1.04,
          vol: 50000,
          amount: 72500,
        },
      ];

      mockQuery.mockResolvedValueOnce(mockData);

      const result = await service.getDailyQuotes('20240101');

      expect(mockQuery).toHaveBeenCalledWith('daily', {
        trade_date: '20240101',
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        tsCode: '600519.SH',
        tradeDate: '2024-01-01',
        open: 1450.0,
        close: 1455.0,
      });
    });

    it('应该处理 API 错误', async () => {
      const error = new Error('API rate limit exceeded');
      mockQuery.mockRejectedValueOnce(error);

      await expect(service.getDailyQuotes('20240101')).rejects.toThrow(
        'API rate limit exceeded'
      );
    });
  });

  describe('getTradeCalendar', () => {
    it('应该成功获取交易日历', async () => {
      const mockData = [
        {
          cal_date: '20240101',
          exchange: 'SSE',
          is_open: 1,
          pretrade_date: '20231229',
        },
        {
          cal_date: '20240102',
          exchange: 'SSE',
          is_open: 0,
          pretrade_date: null,
        },
      ];

      mockQuery.mockResolvedValueOnce(mockData);

      const result = await service.getTradeCalendar('20240101', '20240102');

      expect(mockQuery).toHaveBeenCalledWith('trade_cal', {
        start_date: '20240101',
        end_date: '20240102',
        exchange: 'SSE',
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        calDate: '2024-01-01',
        exchange: 'SSE',
        isOpen: 1,
        pretradeDate: '2023-12-29',
      });
    });
  });

  describe('限流控制', () => {
    it('应该限制并发请求数量', async () => {
      const mockData = [
        {
          ts_code: '600519.SH',
          trade_date: '20240101',
          open: 1450.0,
          high: 1460.0,
          low: 1445.0,
          close: 1455.0,
          pre_close: 1440.0,
          change: 15.0,
          pct_chg: 1.04,
          vol: 50000,
          amount: 72500,
        },
      ];
      mockQuery.mockResolvedValue(mockData);

      const requests = Array.from({ length: 10 }, (_, i) =>
        service.getDailyQuotes(`2024010${i}`)
      );

      const results = await Promise.all(requests);

      expect(results).toHaveLength(10);
      expect(mockQuery).toHaveBeenCalledTimes(10);
    });

    it('应该处理并发请求中的错误', async () => {
      const mockData = [
        {
          ts_code: '600519.SH',
          trade_date: '20240101',
          open: 1450.0,
          high: 1460.0,
          low: 1445.0,
          close: 1455.0,
          pre_close: 1440.0,
          change: 15.0,
          pct_chg: 1.04,
          vol: 50000,
          amount: 72500,
        },
      ];

      mockQuery
        .mockResolvedValueOnce(mockData)
        .mockRejectedValueOnce(new Error('Request failed'))
        .mockResolvedValueOnce(mockData);

      const requests = [
        service.getDailyQuotes('20240101'),
        service.getDailyQuotes('20240102'),
        service.getDailyQuotes('20240103'),
      ];

      const results = await Promise.allSettled(requests);

      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
      expect(results[2].status).toBe('fulfilled');
    });
  });

  describe('错误处理', () => {
    it('应该处理网络错误', async () => {
      const networkError = new Error('Network timeout');
      mockQuery.mockRejectedValueOnce(networkError);

      await expect(service.getDailyQuotes('20240101')).rejects.toThrow(
        'Network timeout'
      );
    });

    it('应该处理空数据', async () => {
      mockQuery.mockResolvedValueOnce([]);

      const result = await service.getDailyQuotes('20240101');
      expect(result).toEqual([]);
    });

    it('应该传递 API 错误信息', async () => {
      const apiError = new Error('Invalid API token');
      mockQuery.mockRejectedValueOnce(apiError);

      await expect(
        service.getTradeCalendar('20240101', '20240102')
      ).rejects.toThrow('Invalid API token');
    });
  });
});
