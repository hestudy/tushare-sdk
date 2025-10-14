import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleIndexData } from '../../../src/handlers/index-data.handler';
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

describe('Index Data Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.TUSHARE_TOKEN = 'test_token';
  });

  describe('Index Query', () => {
    it('should return structured index data for 上证指数', async () => {
      const mockIndexData = {
        items: [
          {
            ts_code: '000001.SH',
            trade_date: '20251014',
            close: 3250.5,
            open: 3200.0,
            high: 3260.0,
            low: 3195.0,
            pre_close: 3200.0,
            change: 50.5,
            pct_chg: 1.58,
            vol: 350000000,
            amount: 450000000,
          },
        ],
      };

      const mockQuery = vi.fn().mockResolvedValue(mockIndexData.items);
      (TushareClient as any).mockImplementation(() => ({
        query: mockQuery,
      }));

      const result = await handleIndexData({
        ts_code: '000001.SH',
      });

      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
      expect(result.structuredContent).toBeDefined();
      expect(result.structuredContent.ts_code).toBe('000001.SH');
      expect(result.structuredContent.close).toBe(3250.5);
      expect(mockQuery).toHaveBeenCalledWith('index_daily', {
        ts_code: '000001.SH',
        trade_date: undefined,
      });
    });

    it('should query index with specific trade_date', async () => {
      const mockIndexData = {
        items: [
          {
            ts_code: '399006.SZ',
            trade_date: '20231229',
            close: 2150.3,
            open: 2130.0,
            high: 2160.5,
            low: 2125.0,
            pre_close: 2130.0,
            change: 20.3,
            pct_chg: 0.95,
            vol: 120000000,
            amount: 150000000,
          },
        ],
      };

      const mockQuery = vi.fn().mockResolvedValue(mockIndexData.items);
      (TushareClient as any).mockImplementation(() => ({
        query: mockQuery,
      }));

      const result = await handleIndexData({
        ts_code: '399006.SZ',
        trade_date: '20231229',
      });

      expect(result.structuredContent.trade_date).toBe('20231229');
      expect(mockQuery).toHaveBeenCalledWith('index_daily', {
        ts_code: '399006.SZ',
        trade_date: '20231229',
      });
    });
  });

  describe('Validation Errors', () => {
    it('should return VALIDATION_ERROR for invalid ts_code format', async () => {
      const result = await handleIndexData({
        ts_code: 'INVALID',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('指数代码格式错误');
    });

    it('should return VALIDATION_ERROR for invalid trade_date format', async () => {
      const result = await handleIndexData({
        ts_code: '000001.SH',
        trade_date: 'INVALID',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('交易日期格式错误');
    });
  });

  describe('Data Not Found', () => {
    it('should return DATA_NOT_FOUND when API returns empty data', async () => {
      const mockQuery = vi.fn().mockResolvedValue([]);
      (TushareClient as any).mockImplementation(() => ({
        query: mockQuery,
      }));

      const result = await handleIndexData({
        ts_code: '000001.SH',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('未找到该指数');
    });
  });

  describe('Network Error', () => {
    it('should handle network errors gracefully', async () => {
      const mockQuery = vi
        .fn()
        .mockRejectedValue(new Error('网络超时'));
      (TushareClient as any).mockImplementation(() => ({
        query: mockQuery,
      }));

      const result = await handleIndexData({
        ts_code: '000001.SH',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('网络');
    });
  });
});
