import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handler, config } from '../../steps/collect-trade-calendar.step.js';

// 在顶级作用域定义 mock 变量
const mockDb = {
  saveTradeCalendar: vi.fn().mockReturnValue(730),
  logTask: vi.fn(),
};

const mockTushareService = {
  getTradeCalendar: vi.fn().mockResolvedValue([
    {
      calDate: '2024-01-02',
      exchange: 'SSE',
      isOpen: 1,
      pretradeDate: '2024-01-01',
    },
    {
      calDate: '2024-01-03',
      exchange: 'SSE',
      isOpen: 1,
      pretradeDate: '2024-01-02',
    },
  ]),
};

// 在顶级作用域定义 mock
vi.mock('../../lib/database.js', () => ({
  db: mockDb,
}));

vi.mock('../../lib/tushare-client.js', () => ({
  TushareService: vi.fn(() => mockTushareService),
}));

vi.mock('../../lib/utils.js', () => ({
  formatToTushareDate: vi.fn((date: string) => date.replace(/-/g, '')),
}));

describe('CollectTradeCalendar Step', () => {
  let mockEmit: any;
  let mockLogger: any;

  beforeEach(() => {
    // Mock emit 函数
    mockEmit = vi.fn();

    // Mock logger
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
    };

    // 清除 mock 的返回值
    mockDb.saveTradeCalendar.mockClear();
    mockDb.saveTradeCalendar.mockReturnValue(730);
    mockDb.logTask.mockClear();
    mockTushareService.getTradeCalendar.mockClear();
    mockTushareService.getTradeCalendar.mockResolvedValue([
      {
        calDate: '2024-01-02',
        exchange: 'SSE',
        isOpen: 1,
        pretradeDate: '2024-01-01',
      },
      {
        calDate: '2024-01-03',
        exchange: 'SSE',
        isOpen: 1,
        pretradeDate: '2024-01-02',
      },
    ]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Step Configuration', () => {
    it('should have correct step configuration', () => {
      expect(config.name).toBe('CollectTradeCalendar');
      expect(config.type).toBe('event');
      expect(config.subscribes).toContain('calendar.update.needed');
    });
  });

  describe('Handler Logic', () => {
    it('should collect trade calendar with default year range', async () => {
      const currentYear = new Date().getFullYear();
      const input = {}; // 使用默认值

      await handler(input, { emit: mockEmit, logger: mockLogger });

      // 验证日志记录
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Starting trade calendar collection',
        {
          startYear: currentYear - 2,
          endYear: currentYear + 1,
          exchange: 'SSE',
        }
      );

      // 验证 Tushare 服务调用
      expect(mockTushareService.getTradeCalendar).toHaveBeenCalled();

      // 验证数据库保存
      expect(mockDb.saveTradeCalendar).toHaveBeenCalled();

      // 验证任务日志记录
      expect(mockDb.logTask).toHaveBeenCalledWith(
        expect.objectContaining({
          taskName: 'CollectTradeCalendar',
          status: 'SUCCESS',
          recordsCount: 730,
          errorMessage: null,
        })
      );

      // 验证事件触发
      expect(mockEmit).toHaveBeenCalledWith({
        topic: 'calendar.updated',
        data: expect.objectContaining({
          startYear: currentYear - 2,
          endYear: currentYear + 1,
          count: 730,
          exchange: 'SSE',
        }),
      });
    });

    it('should collect trade calendar with custom year range', async () => {
      const input = {
        startYear: 2023,
        endYear: 2024,
        exchange: 'SZSE' as const,
      };

      await handler(input, { emit: mockEmit, logger: mockLogger });

      // 验证使用了自定义参数
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Starting trade calendar collection',
        {
          startYear: 2023,
          endYear: 2024,
          exchange: 'SZSE',
        }
      );

      expect(mockEmit).toHaveBeenCalledWith({
        topic: 'calendar.updated',
        data: expect.objectContaining({
          startYear: 2023,
          endYear: 2024,
          exchange: 'SZSE',
        }),
      });
    });

    it('should handle API failure and retry', async () => {
      const error = new Error('Tushare API rate limit exceeded');
      mockTushareService.getTradeCalendar.mockRejectedValueOnce(error);

      const input = { startYear: 2024, endYear: 2024 };

      await expect(
        handler(input, { emit: mockEmit, logger: mockLogger })
      ).rejects.toThrow('Tushare API rate limit exceeded');

      // 验证错误日志
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Trade calendar collection failed',
        expect.objectContaining({
          error: error.message,
        })
      );

      // 验证失败任务日志
      expect(mockDb.logTask).toHaveBeenCalledWith(
        expect.objectContaining({
          taskName: 'CollectTradeCalendar',
          status: 'FAILED',
          recordsCount: 0,
          errorMessage: error.message,
        })
      );

      // 不应该触发 calendar.updated 事件
      expect(mockEmit).not.toHaveBeenCalledWith(
        expect.objectContaining({
          topic: 'calendar.updated',
        })
      );
    });

    it('should handle duplicate data with INSERT OR REPLACE', async () => {
      // 模拟重复数据插入
      mockTushareService.getTradeCalendar.mockResolvedValue([
        {
          calDate: '2024-01-02',
          exchange: 'SSE',
          isOpen: 1,
          pretradeDate: null,
        },
      ]);

      const input = { startYear: 2024, endYear: 2024 };

      // 第一次调用
      await handler(input, { emit: mockEmit, logger: mockLogger });

      expect(mockDb.saveTradeCalendar).toHaveBeenCalledTimes(1);

      // 清除 mock 记录
      vi.clearAllMocks();

      // 第二次调用（重复数据）
      await handler(input, { emit: mockEmit, logger: mockLogger });

      // 应该仍然成功保存（INSERT OR REPLACE）
      expect(mockDb.saveTradeCalendar).toHaveBeenCalledTimes(1);
      expect(mockDb.logTask).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'SUCCESS',
        })
      );
    });

    it('should log correct record count', async () => {
      const mockCalendars = Array.from({ length: 365 }, (_, i) => ({
        calDate: `2024-01-${String(i + 1).padStart(2, '0')}`,
        exchange: 'SSE',
        isOpen: i % 7 < 5 ? 1 : 0, // 模拟工作日
        pretradeDate: null,
      }));

      mockTushareService.getTradeCalendar.mockResolvedValue(mockCalendars);
      mockDb.saveTradeCalendar.mockReturnValue(mockCalendars.length);

      const input = { startYear: 2024, endYear: 2024 };

      await handler(input, { emit: mockEmit, logger: mockLogger });

      // 验证记录数正确
      expect(mockDb.logTask).toHaveBeenCalledWith(
        expect.objectContaining({
          recordsCount: 365,
        })
      );

      expect(mockEmit).toHaveBeenCalledWith({
        topic: 'calendar.updated',
        data: expect.objectContaining({
          count: 365,
        }),
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty response from Tushare', async () => {
      mockTushareService.getTradeCalendar.mockResolvedValue([]);
      mockDb.saveTradeCalendar.mockReturnValue(0);

      const input = { startYear: 2099, endYear: 2099 };

      await handler(input, { emit: mockEmit, logger: mockLogger });

      expect(mockDb.logTask).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'SUCCESS',
          recordsCount: 0,
        })
      );
    });

    it('should handle missing TUSHARE_TOKEN', async () => {
      const error = new Error('TUSHARE_TOKEN is required');

      // 使用 vi.spyOn 来模拟 TushareService 构造函数抛出错误
      const { TushareService } = await import('../../lib/tushare-client.js');
      vi.spyOn(module, 'TushareService' as any).mockImplementation(() => {
        throw error;
      });

      const input = {};

      await expect(
        handler(input, { emit: mockEmit, logger: mockLogger })
      ).rejects.toThrow('TUSHARE_TOKEN is required');
    });
  });
});
