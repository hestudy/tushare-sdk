import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleStockQuote } from '../../../src/handlers/stock-quote.handler';
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

describe('Stock Quote Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.TUSHARE_TOKEN = 'test_token';
  });

  describe('Stock Quote Query', () => {
    it('should return structured stock quote data for valid request', async () => {
      const mockStockData = [
        {
          ts_code: '600519.SH',
          trade_date: '20251014',
          open: 1800.0,
          high: 1820.0,
          low: 1795.0,
          close: 1810.0,
          pre_close: 1800.0,
          change: 10.0,
          pct_chg: 0.56,
          vol: 980000,
          amount: 1770000,
        },
      ];

      const mockGetDailyQuote = vi.fn().mockResolvedValue(mockStockData);
      (TushareClient as any).mockImplementation(() => ({
        getDailyQuote: mockGetDailyQuote,
      }));

      const result = await handleStockQuote({
        ts_code: '600519.SH',
      });

      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
      expect(result.structuredContent).toBeDefined();
      expect(result.structuredContent.ts_code).toBe('600519.SH');
      expect(mockGetDailyQuote).toHaveBeenCalledWith({
        ts_code: '600519.SH',
        trade_date: undefined,
      });
    });

    it('should query stock with specific trade_date', async () => {
      const mockStockData = [
        {
          ts_code: '600519.SH',
          trade_date: '20251014',
          open: 1800.0,
          high: 1820.0,
          low: 1795.0,
          close: 1810.0,
          pre_close: 1800.0,
          change: 10.0,
          pct_chg: 0.56,
          vol: 980000,
          amount: 1770000,
        },
      ];

      const mockGetDailyQuote = vi.fn().mockResolvedValue(mockStockData);
      (TushareClient as any).mockImplementation(() => ({
        getDailyQuote: mockGetDailyQuote,
      }));

      const result = await handleStockQuote({
        ts_code: '600519.SH',
        trade_date: '20251014',
      });

      expect(result.structuredContent.trade_date).toBe('20251014');
      expect(mockGetDailyQuote).toHaveBeenCalledWith({
        ts_code: '600519.SH',
        trade_date: '20251014',
      });
    });
  });

  describe('Validation Errors', () => {
    it('should return VALIDATION_ERROR for invalid ts_code format', async () => {
      const result = await handleStockQuote({
        ts_code: 'INVALID',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('股票代码格式错误');
    });

    it('should return VALIDATION_ERROR for invalid trade_date format', async () => {
      const result = await handleStockQuote({
        ts_code: '600519.SH',
        trade_date: 'INVALID',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('交易日期格式错误');
    });
  });

  describe('Data Not Found', () => {
    it('should return DATA_NOT_FOUND when API returns empty data', async () => {
      const mockGetDailyQuote = vi.fn().mockResolvedValue([]);
      (TushareClient as any).mockImplementation(() => ({
        getDailyQuote: mockGetDailyQuote,
      }));

      const result = await handleStockQuote({
        ts_code: '600519.SH',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('未找到');
    });
  });

  describe('Auth Error', () => {
    it('should handle authentication errors', async () => {
      const mockGetDailyQuote = vi
        .fn()
        .mockRejectedValue(new Error('Token无效或已过期'));
      (TushareClient as any).mockImplementation(() => ({
        getDailyQuote: mockGetDailyQuote,
      }));

      const result = await handleStockQuote({
        ts_code: '600519.SH',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Token');
    });
  });
});
