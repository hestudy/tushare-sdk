import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleDailyBasic } from '../../../src/handlers/daily-basic.handler';
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

describe('Daily Basic Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.TUSHARE_TOKEN = 'test_token';
  });

  describe('Single Day Query', () => {
    it('应该返回单日技术指标', async () => {
      const mockBasicData = [
        {
          ts_code: '600519.SH',
          trade_date: '20251014',
          close: 1810.0,
          pe: 35.6,
          pb: 12.3,
          ps: 10.5,
          turnover_rate: 0.85,
          turnover_rate_f: 1.2,
          volume_ratio: 1.15,
          total_share: 125619,
          float_share: 125619,
          free_share: 100000,
          total_mv: 22612420,
          circ_mv: 22612420,
        },
      ];

      const mockGetDailyBasic = vi.fn().mockResolvedValue(mockBasicData);
      (TushareClient as any).mockImplementation(() => ({
        getDailyBasic: mockGetDailyBasic,
      }));

      const result = await handleDailyBasic({
        ts_code: '600519.SH',
        trade_date: '20251014',
      });

      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('600519.SH');
      expect(result.content[0].text).toContain('2025-10-14');
      expect(result.content[0].text).toContain('市盈率');
      expect(result.content[0].text).toContain('市净率');
      expect(result.structuredContent).toBeDefined();
      expect(result.structuredContent.ts_code).toBe('600519.SH');
      expect(mockGetDailyBasic).toHaveBeenCalledWith({
        ts_code: '600519.SH',
        trade_date: '20251014',
      });
    });

    it('应该正确处理 PE/PB 为 null 的情况(新股)', async () => {
      const mockBasicData = [
        {
          ts_code: '301234.SZ',
          trade_date: '20251014',
          close: 50.0,
          pe: null,
          pb: null,
          turnover_rate: 15.5,
          total_share: 50000,
          total_mv: 500000,
        },
      ];

      const mockGetDailyBasic = vi.fn().mockResolvedValue(mockBasicData);
      (TushareClient as any).mockImplementation(() => ({
        getDailyBasic: mockGetDailyBasic,
      }));

      const result = await handleDailyBasic({
        ts_code: '301234.SZ',
        trade_date: '20251014',
      });

      expect(result.content[0].text).toContain('N/A');
      expect(result.content[0].text).toContain('暂无数据');
    });

    it('应该正确格式化市值(万元转亿元)', async () => {
      const mockBasicData = [
        {
          ts_code: '600519.SH',
          trade_date: '20251014',
          close: 1810.0,
          pe: 35.6,
          pb: 12.3,
          turnover_rate: 0.85,
          total_share: 125619,
          total_mv: 22612420, // 万元
          circ_mv: 22612420,
        },
      ];

      const mockGetDailyBasic = vi.fn().mockResolvedValue(mockBasicData);
      (TushareClient as any).mockImplementation(() => ({
        getDailyBasic: mockGetDailyBasic,
      }));

      const result = await handleDailyBasic({
        ts_code: '600519.SH',
        trade_date: '20251014',
      });

      expect(result.content[0].text).toContain('亿元');
    });
  });

  describe('Date Range Query', () => {
    it('应该返回日期范围内的技术指标趋势', async () => {
      const mockBasicData = Array.from({ length: 5 }, (_, i) => ({
        ts_code: '600519.SH',
        trade_date: `2025100${i + 1}`,
        close: 1800.0 + i * 10,
        pe: 35.0 + i * 0.2,
        pb: 12.0 + i * 0.1,
        turnover_rate: 0.8 + i * 0.05,
        total_share: 125619,
        total_mv: 22000000 + i * 100000,
      }));

      const mockGetDailyBasic = vi.fn().mockResolvedValue(mockBasicData);
      (TushareClient as any).mockImplementation(() => ({
        getDailyBasic: mockGetDailyBasic,
      }));

      const result = await handleDailyBasic({
        ts_code: '600519.SH',
        start_date: '20251001',
        end_date: '20251005',
      });

      expect(result.content[0].text).toContain('技术指标趋势');
      expect(result.content[0].text).toContain('共 5 个交易日数据');
      expect(result.content[0].text).toContain('统计摘要');
      expect(result.content[0].text).toContain('PE 均值');
      expect(result.structuredContent.query_type).toBe('date_range');
      expect(result.structuredContent.count).toBe(5);
      expect(result.structuredContent.data).toHaveLength(5);
      expect(mockGetDailyBasic).toHaveBeenCalledWith({
        ts_code: '600519.SH',
        start_date: '20251001',
        end_date: '20251005',
      });
    });

    it('应该限制范围查询结果显示为前10条', async () => {
      const mockBasicData = Array.from({ length: 20 }, (_, i) => ({
        ts_code: '600519.SH',
        trade_date: `202510${String(i + 1).padStart(2, '0')}`,
        close: 1800.0,
        pe: 35.0,
        pb: 12.0,
        turnover_rate: 0.8,
        total_share: 125619,
        total_mv: 22000000,
      }));

      const mockGetDailyBasic = vi.fn().mockResolvedValue(mockBasicData);
      (TushareClient as any).mockImplementation(() => ({
        getDailyBasic: mockGetDailyBasic,
      }));

      const result = await handleDailyBasic({
        ts_code: '600519.SH',
        start_date: '20251001',
        end_date: '20251020',
      });

      expect(result.content[0].text).toContain('...');
      expect(result.structuredContent.query_type).toBe('date_range');
      expect(result.structuredContent.count).toBe(20);
      expect(result.structuredContent.data).toHaveLength(20);
    });
  });

  describe('Validation Errors', () => {
    it('应该拒绝缺少 ts_code 的请求', async () => {
      const result = await handleDailyBasic({
        trade_date: '20251014',
      });

      expect(result.isError).toBe(true);
    });

    it('应该返回 VALIDATION_ERROR 对于无效的股票代码格式', async () => {
      const result = await handleDailyBasic({
        ts_code: 'INVALID',
        trade_date: '20251014',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('股票代码格式错误');
    });

    it('应该返回 VALIDATION_ERROR 对于无效的日期格式', async () => {
      const result = await handleDailyBasic({
        ts_code: '600519.SH',
        trade_date: '2025-10-14',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('日期格式错误');
    });

    it('应该拒绝同时提供 trade_date 和 start_date/end_date', async () => {
      const result = await handleDailyBasic({
        ts_code: '600519.SH',
        trade_date: '20251014',
        start_date: '20251001',
        end_date: '20251014',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('不能同时提供');
    });

    it('应该拒绝仅提供 start_date 而不提供 end_date', async () => {
      const result = await handleDailyBasic({
        ts_code: '600519.SH',
        start_date: '20251001',
      });

      expect(result.isError).toBe(true);
    });

    it('应该拒绝超过 90 天的日期范围', async () => {
      const result = await handleDailyBasic({
        ts_code: '600519.SH',
        start_date: '20250101',
        end_date: '20250501',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('查询范围');
    });

    it('应该拒绝起始日期晚于结束日期', async () => {
      const result = await handleDailyBasic({
        ts_code: '600519.SH',
        start_date: '20251014',
        end_date: '20251001',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('起始日期');
    });

    it('应该拒绝既不提供 trade_date 也不提供 start_date/end_date', async () => {
      const result = await handleDailyBasic({
        ts_code: '600519.SH',
      });

      expect(result.isError).toBe(true);
    });
  });

  describe('Data Not Found', () => {
    it('应该在非交易日查询时返回特殊错误消息', async () => {
      const mockGetDailyBasic = vi.fn().mockResolvedValue([]);
      (TushareClient as any).mockImplementation(() => ({
        getDailyBasic: mockGetDailyBasic,
      }));

      const result = await handleDailyBasic({
        ts_code: '600519.SH',
        trade_date: '20251012', // 周日
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('非交易日');
      expect(result.content[0].text).toContain('query_trade_calendar');
    });

    it('应该在范围查询无数据时返回通用错误消息', async () => {
      const mockGetDailyBasic = vi.fn().mockResolvedValue([]);
      (TushareClient as any).mockImplementation(() => ({
        getDailyBasic: mockGetDailyBasic,
      }));

      const result = await handleDailyBasic({
        ts_code: '600519.SH',
        start_date: '20251001',
        end_date: '20251005',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('未找到');
    });
  });

  describe('Auth Error', () => {
    it('应该处理认证错误', async () => {
      const mockGetDailyBasic = vi
        .fn()
        .mockRejectedValue(new Error('Token无效或已过期'));
      (TushareClient as any).mockImplementation(() => ({
        getDailyBasic: mockGetDailyBasic,
      }));

      const result = await handleDailyBasic({
        ts_code: '600519.SH',
        trade_date: '20251014',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Token');
    });
  });

  describe('Data Formatting', () => {
    it('应该正确格式化日期', async () => {
      const mockBasicData = [
        {
          ts_code: '600519.SH',
          trade_date: '20251014',
          close: 1810.0,
          pe: 35.6,
          pb: 12.3,
          turnover_rate: 0.85,
          total_share: 125619,
          total_mv: 22612420,
        },
      ];

      const mockGetDailyBasic = vi.fn().mockResolvedValue(mockBasicData);
      (TushareClient as any).mockImplementation(() => ({
        getDailyBasic: mockGetDailyBasic,
      }));

      const result = await handleDailyBasic({
        ts_code: '600519.SH',
        trade_date: '20251014',
      });

      expect(result.content[0].text).toContain('2025-10-14');
    });
  });
});
