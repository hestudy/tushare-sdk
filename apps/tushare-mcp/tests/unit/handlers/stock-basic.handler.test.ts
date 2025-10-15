import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleStockBasic } from '../../../src/handlers/stock-basic.handler';
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

describe('Stock Basic Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.TUSHARE_TOKEN = 'test_token';
  });

  describe('Single Stock Query', () => {
    it('应该返回单个股票的基本信息', async () => {
      const mockStockData = [
        {
          ts_code: '600519.SH',
          symbol: '600519',
          name: '贵州茅台',
          area: '贵州',
          industry: '白酒',
          market: '主板',
          exchange: 'SSE',
          list_status: 'L',
          list_date: '20010827',
        },
      ];

      const mockGetStockBasic = vi.fn().mockResolvedValue(mockStockData);
      (TushareClient as any).mockImplementation(() => ({
        getStockBasic: mockGetStockBasic,
      }));

      const result = await handleStockBasic({
        ts_code: '600519.SH',
      });

      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('贵州茅台');
      expect(result.content[0].text).toContain('600519.SH');
      expect(result.structuredContent).toBeDefined();
      expect(result.structuredContent.ts_code).toBe('600519.SH');
      expect(mockGetStockBasic).toHaveBeenCalledWith({
        ts_code: '600519.SH',
      });
    });

    it('应该正确格式化上市状态为"正常上市"', async () => {
      const mockStockData = [
        {
          ts_code: '600519.SH',
          symbol: '600519',
          name: '贵州茅台',
          area: '贵州',
          industry: '白酒',
          market: '主板',
          exchange: 'SSE',
          list_status: 'L',
          list_date: '20010827',
        },
      ];

      const mockGetStockBasic = vi.fn().mockResolvedValue(mockStockData);
      (TushareClient as any).mockImplementation(() => ({
        getStockBasic: mockGetStockBasic,
      }));

      const result = await handleStockBasic({
        ts_code: '600519.SH',
      });

      expect(result.content[0].text).toContain('正常上市');
    });

    it('应该显示退市股票的退市日期', async () => {
      const mockStockData = [
        {
          ts_code: '600000.SH',
          symbol: '600000',
          name: '某退市股',
          area: '上海',
          industry: '综合',
          market: '主板',
          exchange: 'SSE',
          list_status: 'D',
          list_date: '19900101',
          delist_date: '20200101',
        },
      ];

      const mockGetStockBasic = vi.fn().mockResolvedValue(mockStockData);
      (TushareClient as any).mockImplementation(() => ({
        getStockBasic: mockGetStockBasic,
      }));

      const result = await handleStockBasic({
        ts_code: '600000.SH',
      });

      expect(result.content[0].text).toContain('已退市');
      expect(result.content[0].text).toContain('退市日期');
      expect(result.content[0].text).toContain('2020-01-01');
    });
  });

  describe('Batch Stock Query', () => {
    it('应该按交易所筛选返回股票列表', async () => {
      const mockStockData = Array.from({ length: 10 }, (_, i) => ({
        ts_code: `60000${i}.SH`,
        symbol: `60000${i}`,
        name: `股票${i}`,
        area: '上海',
        industry: '综合',
        market: '主板',
        exchange: 'SSE',
        list_status: 'L',
        list_date: '20000101',
      }));

      const mockGetStockBasic = vi.fn().mockResolvedValue(mockStockData);
      (TushareClient as any).mockImplementation(() => ({
        getStockBasic: mockGetStockBasic,
      }));

      const result = await handleStockBasic({
        exchange: 'SSE',
      });

      expect(result.content[0].text).toContain('上交所');
      expect(result.content[0].text).toContain('股票列表');
      expect(result.structuredContent.query_type).toBe('list');
      expect(result.structuredContent.total_count).toBe(10);
      expect(result.structuredContent.stocks).toHaveLength(10);
      expect(mockGetStockBasic).toHaveBeenCalledWith({
        exchange: 'SSE',
      });
    });

    it('应该限制批量查询结果为前50条', async () => {
      const mockStockData = Array.from({ length: 100 }, (_, i) => ({
        ts_code: `${String(600000 + i).padStart(6, '0')}.SH`,
        symbol: `${String(600000 + i).padStart(6, '0')}`,
        name: `股票${i}`,
        area: '上海',
        industry: '综合',
        market: '主板',
        exchange: 'SSE',
        list_status: 'L',
        list_date: '20000101',
      }));

      const mockGetStockBasic = vi.fn().mockResolvedValue(mockStockData);
      (TushareClient as any).mockImplementation(() => ({
        getStockBasic: mockGetStockBasic,
      }));

      const result = await handleStockBasic({
        exchange: 'SSE',
      });

      expect(result.structuredContent.query_type).toBe('list');
      expect(result.structuredContent.total_count).toBe(100);
      expect(result.structuredContent.returned_count).toBe(50);
      expect(result.structuredContent.stocks).toHaveLength(50);
      expect(result.content[0].text).toContain('前50条');
      expect(result.content[0].text).toContain('共找到 100 只股票');
    });
  });

  describe('Validation Errors', () => {
    it('应该拒绝无筛选条件的请求', async () => {
      const result = await handleStockBasic({});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('至少一个筛选条件');
    });

    it('应该返回 VALIDATION_ERROR 对于无效的股票代码格式', async () => {
      const result = await handleStockBasic({
        ts_code: 'INVALID',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('股票代码格式错误');
    });

    it('应该返回 VALIDATION_ERROR 对于无效的交易所代码', async () => {
      const result = await handleStockBasic({
        exchange: 'INVALID',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('交易所代码');
    });

    it('应该返回 VALIDATION_ERROR 对于无效的上市状态', async () => {
      const result = await handleStockBasic({
        list_status: 'X',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('上市状态');
    });
  });

  describe('Data Not Found', () => {
    it('应该在股票代码不存在时返回 DATA_NOT_FOUND', async () => {
      const mockGetStockBasic = vi.fn().mockResolvedValue([]);
      (TushareClient as any).mockImplementation(() => ({
        getStockBasic: mockGetStockBasic,
      }));

      const result = await handleStockBasic({
        ts_code: '999999.SH',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('未找到');
    });

    it('应该在无符合条件的股票时返回通用错误消息', async () => {
      const mockGetStockBasic = vi.fn().mockResolvedValue([]);
      (TushareClient as any).mockImplementation(() => ({
        getStockBasic: mockGetStockBasic,
      }));

      const result = await handleStockBasic({
        exchange: 'SSE',
        list_status: 'D',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('未找到');
    });
  });

  describe('Auth Error', () => {
    it('应该处理认证错误', async () => {
      const mockGetStockBasic = vi
        .fn()
        .mockRejectedValue(new Error('Token无效或已过期'));
      (TushareClient as any).mockImplementation(() => ({
        getStockBasic: mockGetStockBasic,
      }));

      const result = await handleStockBasic({
        ts_code: '600519.SH',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Token');
    });
  });

  describe('Data Formatting', () => {
    it('应该正确格式化日期', async () => {
      const mockStockData = [
        {
          ts_code: '600519.SH',
          symbol: '600519',
          name: '贵州茅台',
          area: '贵州',
          industry: '白酒',
          market: '主板',
          exchange: 'SSE',
          list_status: 'L',
          list_date: '20010827',
        },
      ];

      const mockGetStockBasic = vi.fn().mockResolvedValue(mockStockData);
      (TushareClient as any).mockImplementation(() => ({
        getStockBasic: mockGetStockBasic,
      }));

      const result = await handleStockBasic({
        ts_code: '600519.SH',
      });

      expect(result.content[0].text).toContain('2001-08-27');
    });
  });
});
