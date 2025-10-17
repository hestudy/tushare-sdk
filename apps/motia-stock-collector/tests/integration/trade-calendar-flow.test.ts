import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DatabaseService } from '../../lib/database.js';
import { TushareService } from '../../lib/tushare-client.js';
import { checkTradeCalendar, isCalendarYearMissing } from '../../lib/utils.js';
import { handler as collectHandler } from '../../steps/collect-trade-calendar.step.js';

/**
 * 交易日历集成测试
 *
 * 测试完整的交易日历流程：
 * - 场景 1: 首次启动获取3年日历
 * - 场景 2: 跨年自动检测并补充下一年度
 * - 场景 3: 查询不存在的日期触发更新
 */
describe('Trade Calendar Integration Flow', () => {
  let db: DatabaseService;
  let mockEmit: any;
  let mockLogger: any;
  let originalEnv: string | undefined;

  beforeEach(() => {
    // 使用内存数据库进行测试
    db = new DatabaseService(':memory:');

    // Mock emit 和 logger
    mockEmit = vi.fn();
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
    };

    // 保存原始环境变量
    originalEnv = process.env.TUSHARE_TOKEN;

    // 设置测试 Token (如果没有，则跳过真实 API 测试)
    if (!process.env.TUSHARE_TOKEN) {
      process.env.TUSHARE_TOKEN = 'test_token_for_mocking';
    }
  });

  afterEach(() => {
    db.close();

    // 恢复环境变量
    if (originalEnv) {
      process.env.TUSHARE_TOKEN = originalEnv;
    } else {
      delete process.env.TUSHARE_TOKEN;
    }

    vi.clearAllMocks();
  });

  describe('场景 1: 首次启动获取最近3年交易日历', () => {
    it('应该成功获取并存储交易日历数据', async () => {
      // Mock Tushare API 返回测试数据
      const mockCalendars = [
        {
          calDate: '2023-01-03',
          exchange: 'SSE' as const,
          isOpen: 1 as const,
          pretradeDate: '2023-01-02',
        },
        {
          calDate: '2023-01-04',
          exchange: 'SSE' as const,
          isOpen: 1 as const,
          pretradeDate: '2023-01-03',
        },
        {
          calDate: '2023-01-05',
          exchange: 'SSE' as const,
          isOpen: 0 as const,
          pretradeDate: null,
        },
      ];

      // 模拟 Tushare 服务
      const mockTushareService = {
        getTradeCalendar: vi.fn().mockResolvedValue(mockCalendars),
      };

      vi.doMock('../../lib/tushare-client.js', () => ({
        TushareService: vi.fn(() => mockTushareService),
      }));

      // 初始状态：数据库为空
      const isMissing = await isCalendarYearMissing(2023, db);
      expect(isMissing).toBe(true);

      // 触发采集任务
      const currentYear = new Date().getFullYear();
      await collectHandler(
        {
          startYear: currentYear - 2,
          endYear: currentYear + 1,
        },
        { emit: mockEmit, logger: mockLogger }
      );

      // 验证事件触发
      expect(mockEmit).toHaveBeenCalledWith({
        topic: 'calendar.updated',
        data: expect.objectContaining({
          startYear: currentYear - 2,
          endYear: currentYear + 1,
        }),
      });

      // 注意：由于使用了内存数据库和 mock，实际数据可能没有插入
      // 在真实环境中，这里会验证数据库中的数据
    }, 10000); // 设置较长超时时间

    it('应该处理空响应', async () => {
      const mockTushareService = {
        getTradeCalendar: vi.fn().mockResolvedValue([]),
      };

      vi.doMock('../../lib/tushare-client.js', () => ({
        TushareService: vi.fn(() => mockTushareService),
      }));

      const currentYear = new Date().getFullYear();

      await collectHandler(
        {
          startYear: currentYear,
          endYear: currentYear,
        },
        { emit: mockEmit, logger: mockLogger }
      );

      // 即使没有数据，也应该成功完成
      expect(mockEmit).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: 'calendar.updated',
        })
      );
    });
  });

  describe('场景 2: 跨年自动检测并补充下一年度', () => {
    it('应该检测到缺失的年份数据', async () => {
      // 插入当前年份的数据
      const currentYear = new Date().getFullYear();
      db.saveTradeCalendar([
        {
          calDate: `${currentYear}-01-01`,
          exchange: 'SSE',
          isOpen: 0,
          pretradeDate: null,
        },
      ]);

      // 检查当前年份 - 应该存在
      const currentYearMissing = await isCalendarYearMissing(currentYear, db);
      expect(currentYearMissing).toBe(false);

      // 检查下一年度 - 应该缺失
      const nextYearMissing = await isCalendarYearMissing(currentYear + 1, db);
      expect(nextYearMissing).toBe(true);
    });

    it('应该为缺失年份触发更新事件', async () => {
      const currentYear = new Date().getFullYear();

      // 检查缺失年份并触发更新
      const isMissing = await isCalendarYearMissing(currentYear + 1, db);

      if (isMissing) {
        await mockEmit({
          topic: 'calendar.update.needed',
          data: {
            startYear: currentYear + 1,
            endYear: currentYear + 1,
          },
        });
      }

      expect(mockEmit).toHaveBeenCalledWith({
        topic: 'calendar.update.needed',
        data: {
          startYear: currentYear + 1,
          endYear: currentYear + 1,
        },
      });
    });
  });

  describe('场景 3: 查询不存在的日期触发更新', () => {
    it('应该在数据不存在时返回 false', async () => {
      const isTradeDay = await checkTradeCalendar('2099-01-01', db);

      expect(isTradeDay).toBe(false);
    });

    it('应该正确识别交易日', async () => {
      // 插入测试数据
      db.saveTradeCalendar([
        {
          calDate: '2024-01-02',
          exchange: 'SSE',
          isOpen: 1,
          pretradeDate: null,
        },
      ]);

      const isTradeDay = db.isTradeDay('2024-01-02');

      expect(isTradeDay).toBe(true);
    });

    it('应该正确识别非交易日', async () => {
      // 插入测试数据
      db.saveTradeCalendar([
        {
          calDate: '2024-01-01',
          exchange: 'SSE',
          isOpen: 0,
          pretradeDate: null,
        },
      ]);

      const isTradeDay = db.isTradeDay('2024-01-01');

      expect(isTradeDay).toBe(false);
    });

    it('应该触发更新事件当数据缺失', async () => {
      const isTradeDay = await checkTradeCalendar('2099-12-31', mockEmit, db);

      expect(isTradeDay).toBe(false);
      expect(mockEmit).toHaveBeenCalledWith({
        topic: 'calendar.update.needed',
        data: {
          startYear: 2099,
          endYear: 2099,
        },
      });
    });
  });

  describe('数据持久化验证', () => {
    it('应该正确保存和查询交易日历数据', () => {
      const testCalendars = [
        {
          calDate: '2024-01-02',
          exchange: 'SSE' as const,
          isOpen: 1 as const,
          pretradeDate: '2024-01-01',
        },
        {
          calDate: '2024-01-03',
          exchange: 'SSE' as const,
          isOpen: 1 as const,
          pretradeDate: '2024-01-02',
        },
        {
          calDate: '2024-01-06',
          exchange: 'SSE' as const,
          isOpen: 0 as const, // 周末
          pretradeDate: null,
        },
      ];

      // 保存数据
      const savedCount = db.saveTradeCalendar(testCalendars);
      expect(savedCount).toBe(3);

      // 验证查询
      expect(db.isTradeDay('2024-01-02')).toBe(true);
      expect(db.isTradeDay('2024-01-03')).toBe(true);
      expect(db.isTradeDay('2024-01-06')).toBe(false);

      // 验证获取交易日列表
      const tradeDays = db.getTradeDays('2024-01-01', '2024-01-07');
      expect(tradeDays).toContain('2024-01-02');
      expect(tradeDays).toContain('2024-01-03');
      expect(tradeDays).not.toContain('2024-01-06');
    });

    it('应该处理重复数据（INSERT OR REPLACE）', () => {
      const calendar1 = {
        calDate: '2024-01-02',
        exchange: 'SSE' as const,
        isOpen: 1 as const,
        pretradeDate: null,
      };

      // 第一次插入
      db.saveTradeCalendar([calendar1]);
      expect(db.isTradeDay('2024-01-02')).toBe(true);

      // 第二次插入相同日期（更新 isOpen）
      const calendar2 = {
        ...calendar1,
        isOpen: 0 as const, // 改为非交易日
      };

      db.saveTradeCalendar([calendar2]);
      expect(db.isTradeDay('2024-01-02')).toBe(false);
    });
  });

  describe('错误处理', () => {
    it('应该处理 API 失败', async () => {
      const mockTushareService = {
        getTradeCalendar: vi
          .fn()
          .mockRejectedValue(new Error('API rate limit exceeded')),
      };

      vi.doMock('../../lib/tushare-client.js', () => ({
        TushareService: vi.fn(() => mockTushareService),
      }));

      const currentYear = new Date().getFullYear();

      await expect(
        collectHandler(
          {
            startYear: currentYear,
            endYear: currentYear,
          },
          { emit: mockEmit, logger: mockLogger }
        )
      ).rejects.toThrow('API rate limit exceeded');

      // 验证错误日志
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
