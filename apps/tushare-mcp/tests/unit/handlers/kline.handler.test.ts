import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleKline } from '../../../src/handlers/kline.handler';
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

describe('K-Line Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.TUSHARE_TOKEN = 'test_token';
  });

  describe('Daily K-Line (日线)', () => {
    it('should return time series array for valid daily request', async () => {
      const mockDailyData = {
        items: [
          {
            ts_code: '600519.SH',
            trade_date: '20251001',
            open: 1800.0,
            high: 1820.0,
            low: 1795.0,
            close: 1810.0,
            vol: 980000,
            amount: 1770000,
          },
          {
            ts_code: '600519.SH',
            trade_date: '20251002',
            open: 1810.0,
            high: 1850.0,
            low: 1805.0,
            close: 1845.0,
            vol: 1120000,
            amount: 2050000,
          },
        ],
      };

      const mockGetDailyQuote = vi.fn().mockResolvedValue(mockDailyData.items);
      (TushareClient as any).mockImplementation(() => ({
        getDailyQuote: mockGetDailyQuote,
      }));

      const result = await handleKline({
        ts_code: '600519.SH',
        start_date: '20251001',
        end_date: '20251002',
        freq: 'D',
      });

      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
      expect(result.structuredContent).toBeInstanceOf(Array);
      expect(result.structuredContent.length).toBe(2);
      expect(result.structuredContent[0].trade_date).toBe('20251001');
      expect(mockGetDailyQuote).toHaveBeenCalledWith({
        ts_code: '600519.SH',
        start_date: '20251001',
        end_date: '20251002',
      });
    });
  });

  describe('Weekly K-Line (周线)', () => {
    it('should aggregate daily data to weekly', async () => {
      const mockDailyData = {
        items: [
          {
            ts_code: '600519.SH',
            trade_date: '20251001',
            open: 1800.0,
            high: 1820.0,
            low: 1795.0,
            close: 1810.0,
            vol: 980000,
            amount: 1770000,
          },
          {
            ts_code: '600519.SH',
            trade_date: '20251003',
            open: 1810.0,
            high: 1850.0,
            low: 1805.0,
            close: 1845.0,
            vol: 1120000,
            amount: 2050000,
          },
        ],
      };

      const mockGetDailyQuote = vi.fn().mockResolvedValue(mockDailyData.items);
      (TushareClient as any).mockImplementation(() => ({
        getDailyQuote: mockGetDailyQuote,
      }));

      const result = await handleKline({
        ts_code: '600519.SH',
        start_date: '20251001',
        end_date: '20251003',
        freq: 'W',
      });

      expect(result.structuredContent).toBeInstanceOf(Array);
      expect(result.structuredContent.length).toBeGreaterThan(0);
    });
  });

  describe('Monthly K-Line (月线)', () => {
    it('should aggregate daily data to monthly', async () => {
      const mockDailyData = {
        items: [
          {
            ts_code: '600519.SH',
            trade_date: '20251001',
            open: 1800.0,
            high: 1820.0,
            low: 1795.0,
            close: 1810.0,
            vol: 980000,
            amount: 1770000,
          },
        ],
      };

      const mockGetDailyQuote = vi.fn().mockResolvedValue(mockDailyData.items);
      (TushareClient as any).mockImplementation(() => ({
        getDailyQuote: mockGetDailyQuote,
      }));

      const result = await handleKline({
        ts_code: '600519.SH',
        start_date: '20251001',
        end_date: '20251031',
        freq: 'M',
      });

      expect(result.structuredContent).toBeInstanceOf(Array);
    });
  });

  describe('Validation Errors', () => {
    it('should return VALIDATION_ERROR for invalid ts_code format', async () => {
      const result = await handleKline({
        ts_code: 'INVALID',
        start_date: '20251001',
        end_date: '20251002',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('股票代码格式错误');
    });

    it('should return VALIDATION_ERROR when end_date < start_date', async () => {
      const result = await handleKline({
        ts_code: '600519.SH',
        start_date: '20251002',
        end_date: '20251001',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('结束日期必须晚于或等于开始日期');
    });

    it('should return VALIDATION_ERROR when time range > 10 years', async () => {
      const result = await handleKline({
        ts_code: '600519.SH',
        start_date: '20100101',
        end_date: '20251231',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('时间范围超出限制');
    });
  });

  describe('Data Not Found', () => {
    it('should return DATA_NOT_FOUND when API returns empty data', async () => {
      const mockGetDailyQuote = vi.fn().mockResolvedValue([]);
      (TushareClient as any).mockImplementation(() => ({
        getDailyQuote: mockGetDailyQuote,
      }));

      const result = await handleKline({
        ts_code: '600519.SH',
        start_date: '20251001',
        end_date: '20251002',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('无交易数据');
    });
  });
});
