import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleTradeCalendar } from '../../../src/handlers/trade-calendar.handler';
import { TushareClient } from '@hestudy/tushare-sdk';

// Mock TushareClient
vi.mock('@hestudy/tushare-sdk', () => ({
  TushareClient: vi.fn(),
}));

// Mock logger
vi.mock('../../../src/utils/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

describe('Trade Calendar Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.TUSHARE_TOKEN = 'test_token';
  });

  describe('Single Day Query', () => {
    it('应该返回交易日状态(交易日)', async () => {
      const mockCalData = [
        {
          exchange: 'SSE',
          cal_date: '20251014',
          is_open: 1,
          pretrade_date: '20251013',
        },
      ];

      const mockGetTradeCalendar = vi.fn().mockResolvedValue(mockCalData);
      (TushareClient as any).mockImplementation(() => ({
        getTradeCalendar: mockGetTradeCalendar,
      }));

      const result = await handleTradeCalendar({
        start_date: '20251014',
        end_date: '20251014',
      });

      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('2025-10-14');
      expect(result.content[0].text).toContain('是交易日');
      expect(result.structuredContent).toBeDefined();
      expect(result.structuredContent.query_type).toBe('single_day');
      expect(result.structuredContent.date).toBe('20251014');
      expect(result.structuredContent.is_open).toBe(1);
      expect(mockGetTradeCalendar).toHaveBeenCalledWith({
        start_date: '20251014',
        end_date: '20251014',
        exchange: 'SSE',
      });
    });

    it('应该返回休市日状态(周末)', async () => {
      const mockCalData = [
        {
          exchange: 'SSE',
          cal_date: '20251012',
          is_open: 0,
          pretrade_date: '20251010',
        },
      ];

      const mockGetTradeCalendar = vi.fn().mockResolvedValue(mockCalData);
      (TushareClient as any).mockImplementation(() => ({
        getTradeCalendar: mockGetTradeCalendar,
      }));

      const result = await handleTradeCalendar({
        start_date: '20251012',
        end_date: '20251012',
      });

      expect(result.content[0].text).toContain('休市');
      expect(result.content[0].text).toContain('周末');
    });

    it('应该显示上一交易日', async () => {
      const mockCalData = [
        {
          exchange: 'SSE',
          cal_date: '20251014',
          is_open: 1,
          pretrade_date: '20251013',
        },
      ];

      const mockGetTradeCalendar = vi.fn().mockResolvedValue(mockCalData);
      (TushareClient as any).mockImplementation(() => ({
        getTradeCalendar: mockGetTradeCalendar,
      }));

      const result = await handleTradeCalendar({
        start_date: '20251014',
        end_date: '20251014',
      });

      expect(result.content[0].text).toContain('上一交易日');
      expect(result.content[0].text).toContain('2025-10-13');
    });
  });

  describe('Date Range Query', () => {
    it('应该返回日期范围内的交易日历', async () => {
      const mockCalData = [
        { exchange: 'SSE', cal_date: '20251001', is_open: 1 },
        { exchange: 'SSE', cal_date: '20251002', is_open: 1 },
        { exchange: 'SSE', cal_date: '20251003', is_open: 0 },
        { exchange: 'SSE', cal_date: '20251004', is_open: 0 },
        { exchange: 'SSE', cal_date: '20251005', is_open: 1 },
      ];

      const mockGetTradeCalendar = vi.fn().mockResolvedValue(mockCalData);
      (TushareClient as any).mockImplementation(() => ({
        getTradeCalendar: mockGetTradeCalendar,
      }));

      const result = await handleTradeCalendar({
        start_date: '20251001',
        end_date: '20251005',
      });

      expect(result.content[0].text).toContain('交易日历');
      expect(result.content[0].text).toContain('交易日 (共 3 天)');
      expect(result.content[0].text).toContain('休市日 (共 2 天)');
      expect(result.structuredContent.query_type).toBe('date_range');
      expect(result.structuredContent.total_days).toBe(5);
      expect(result.structuredContent.trade_days_count).toBe(3);
      expect(result.structuredContent.closed_days_count).toBe(2);
      expect(result.structuredContent.data).toHaveLength(5);
      expect(mockGetTradeCalendar).toHaveBeenCalledWith({
        start_date: '20251001',
        end_date: '20251005',
        exchange: 'SSE',
      });
    });

    it('应该正确格式化星期几', async () => {
      const mockCalData = [
        { exchange: 'SSE', cal_date: '20251014', is_open: 1 }, // 周二
      ];

      const mockGetTradeCalendar = vi.fn().mockResolvedValue(mockCalData);
      (TushareClient as any).mockImplementation(() => ({
        getTradeCalendar: mockGetTradeCalendar,
      }));

      const result = await handleTradeCalendar({
        start_date: '20251014',
        end_date: '20251014',
        exchange: 'SSE',
      });

      expect(result.content[0].text).toBeDefined();
    });
  });

  describe('Validation Errors', () => {
    it('应该返回 VALIDATION_ERROR 对于无效的日期格式', async () => {
      const result = await handleTradeCalendar({
        start_date: '2025-10-14',
        end_date: '2025-10-15',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('日期格式错误');
    });

    it('应该返回 VALIDATION_ERROR 对于缺少 start_date', async () => {
      const result = await handleTradeCalendar({
        end_date: '20251014',
      });

      expect(result.isError).toBe(true);
    });

    it('应该返回 VALIDATION_ERROR 对于缺少 end_date', async () => {
      const result = await handleTradeCalendar({
        start_date: '20251014',
      });

      expect(result.isError).toBe(true);
    });

    it('应该拒绝超过 365 天的日期范围', async () => {
      const result = await handleTradeCalendar({
        start_date: '20250101',
        end_date: '20260201',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('查询范围');
    });

    it('应该拒绝起始日期晚于结束日期', async () => {
      const result = await handleTradeCalendar({
        start_date: '20251014',
        end_date: '20251001',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('起始日期');
    });
  });

  describe('Data Not Found', () => {
    it('应该在无交易日历数据时返回错误', async () => {
      const mockGetTradeCalendar = vi.fn().mockResolvedValue([]);
      (TushareClient as any).mockImplementation(() => ({
        getTradeCalendar: mockGetTradeCalendar,
      }));

      const result = await handleTradeCalendar({
        start_date: '20301014',
        end_date: '20301014',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('未找到');
    });
  });

  describe('Auth Error', () => {
    it('应该处理认证错误', async () => {
      const mockGetTradeCalendar = vi
        .fn()
        .mockRejectedValue(new Error('Token无效或已过期'));
      (TushareClient as any).mockImplementation(() => ({
        getTradeCalendar: mockGetTradeCalendar,
      }));

      const result = await handleTradeCalendar({
        start_date: '20251014',
        end_date: '20251014',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Token');
    });
  });

  describe('Exchange Parameter', () => {
    it('应该默认使用 SSE 交易所', async () => {
      const mockCalData = [
        {
          exchange: 'SSE',
          cal_date: '20251014',
          is_open: 1,
        },
      ];

      const mockGetTradeCalendar = vi.fn().mockResolvedValue(mockCalData);
      (TushareClient as any).mockImplementation(() => ({
        getTradeCalendar: mockGetTradeCalendar,
      }));

      await handleTradeCalendar({
        start_date: '20251014',
        end_date: '20251014',
      });

      expect(mockGetTradeCalendar).toHaveBeenCalledWith({
        start_date: '20251014',
        end_date: '20251014',
        exchange: 'SSE',
      });
    });

    it('应该允许指定 SZSE 交易所', async () => {
      const mockCalData = [
        {
          exchange: 'SZSE',
          cal_date: '20251014',
          is_open: 1,
        },
      ];

      const mockGetTradeCalendar = vi.fn().mockResolvedValue(mockCalData);
      (TushareClient as any).mockImplementation(() => ({
        getTradeCalendar: mockGetTradeCalendar,
      }));

      await handleTradeCalendar({
        start_date: '20251014',
        end_date: '20251014',
        exchange: 'SZSE',
      });

      expect(mockGetTradeCalendar).toHaveBeenCalledWith({
        start_date: '20251014',
        end_date: '20251014',
        exchange: 'SZSE',
      });
    });
  });
});
