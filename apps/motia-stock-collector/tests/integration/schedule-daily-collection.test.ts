/**
 * Schedule Daily Collection Step 契约测试
 *
 * 测试目标:
 * - 验证 Step 配置符合 contracts/schedule-daily-collection.step.json
 * - 测试 Handler 在交易日触发事件
 * - 测试 Handler 在非交易日跳过
 * - 测试 Emit 事件格式正确
 *
 * 依赖:
 * - Mock 交易日历数据
 * - Mock 时间 (可选)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { config, handler } from '../../steps/schedule-daily-collection.step.js';
import { DatabaseService } from '../../lib/database.js';
import * as utils from '../../lib/utils.js';

describe('ScheduleDailyCollection Step - Contract Tests', () => {
  // 使用内存数据库进行隔离
  let testDb: DatabaseService;

  // Mock emit 函数
  let emittedEvents: any[] = [];
  const mockEmit = vi.fn(async (event: any) => {
    emittedEvents.push(event);
  });

  // Mock logger
  const mockLogger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };

  beforeEach(async () => {
    // 创建内存数据库
    testDb = new DatabaseService(':memory:');

    // 模拟全局 db 实例
    const dbModule = await import('../../lib/database.js');
    vi.spyOn(dbModule, 'db', 'get').mockReturnValue(testDb);

    // 清空 mock 调用记录
    emittedEvents = [];
    mockEmit.mockClear();
    mockLogger.info.mockClear();
    mockLogger.warn.mockClear();
    mockLogger.error.mockClear();
  });

  afterEach(() => {
    testDb.close();
    vi.restoreAllMocks();
  });

  describe('Step Configuration', () => {
    it('should have correct step name', () => {
      expect(config.name).toBe('ScheduleDailyCollection');
    });

    it('should be a cron step type', () => {
      expect(config.type).toBe('cron');
    });

    it('should have correct cron schedule', () => {
      // 周一至周五 17:00
      expect(config.cron).toBe('0 17 * * 1-5');
    });

    it('should emit correct event topics', () => {
      expect(config.emits).toEqual(['data.collection.triggered']);
    });
  });

  describe('Handler - Trade Day Behavior', () => {
    it('should trigger collection on trade day', async () => {
      // 准备: 使用固定的交易日（周一）
      const tradeDate = '2025-10-20'; // 固定为周一

      // Mock getToday 以返回交易日
      vi.spyOn(utils, 'getToday').mockReturnValue(tradeDate);

      // 插入交易日历数据
      testDb.saveTradeCalendar([
        {
          calDate: tradeDate,
          exchange: 'SSE',
          isOpen: 1, // 开盘日
          pretradeDate: null,
        },
      ]);

      // 执行: 调用 handler
      await handler({}, { emit: mockEmit, logger: mockLogger });

      // 验证: 应该触发事件
      expect(mockEmit).toHaveBeenCalledTimes(1);
      expect(emittedEvents).toHaveLength(1);

      // 验证事件格式
      const event = emittedEvents[0];
      expect(event.topic).toBe('data.collection.triggered');
      expect(event.data).toHaveProperty('tradeDate');
      expect(event.data.tradeDate).toBe(tradeDate);

      // 验证日志
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should skip collection on non-trade day', async () => {
      // 准备: 使用固定的非交易日（周六）
      const nonTradeDate = '2025-10-25'; // 固定为周六

      // Mock getToday 以返回非交易日
      vi.spyOn(utils, 'getToday').mockReturnValue(nonTradeDate);

      // 插入交易日历数据
      testDb.saveTradeCalendar([
        {
          calDate: nonTradeDate,
          exchange: 'SSE',
          isOpen: 0, // 休市日
          pretradeDate: null,
        },
      ]);

      // 执行: 调用 handler
      await handler({}, { emit: mockEmit, logger: mockLogger });

      // 验证: 不应该触发事件
      expect(mockEmit).not.toHaveBeenCalled();
      expect(emittedEvents).toHaveLength(0);

      // 验证日志记录了跳过信息
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Skipping collection - Not a trade day',
        expect.objectContaining({
          tradeDate: nonTradeDate,
        })
      );
    });

    it('should handle missing trade calendar gracefully', async () => {
      // 准备: 使用固定日期,但不插入任何交易日历数据
      const testDate = '2025-10-20';
      vi.spyOn(utils, 'getToday').mockReturnValue(testDate);

      // 执行: 调用 handler
      await handler({}, { emit: mockEmit, logger: mockLogger });

      // 验证: 不应该触发数据采集事件
      // 但可能会触发日历更新事件
      const collectionEvents = emittedEvents.filter(
        (e) => e.topic === 'data.collection.triggered'
      );
      expect(collectionEvents).toHaveLength(0);

      // 验证日志记录了跳过信息
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });

  describe('Event Emit Format', () => {
    it('should emit event with correct schema', async () => {
      // 准备: 使用固定的交易日
      const tradeDate = '2025-10-20';

      vi.spyOn(utils, 'getToday').mockReturnValue(tradeDate);

      testDb.saveTradeCalendar([
        {
          calDate: tradeDate,
          exchange: 'SSE',
          isOpen: 1,
          pretradeDate: null,
        },
      ]);

      // 执行
      await handler({}, { emit: mockEmit, logger: mockLogger });

      // 验证事件格式符合契约
      const event = emittedEvents[0];

      // 验证必需字段
      expect(event).toHaveProperty('topic');
      expect(event).toHaveProperty('data');
      expect(event.data).toHaveProperty('tradeDate');

      // 验证日期格式 YYYY-MM-DD
      expect(event.data.tradeDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('Error Handling', () => {
    it('should not throw error on database failure', async () => {
      // 准备: 使用固定日期
      const testDate = '2025-10-20';
      vi.spyOn(utils, 'getToday').mockReturnValue(testDate);

      // Mock 数据库的 hasTradeCalendarData 抛出错误
      const originalHasTradeCalendarData = testDb.hasTradeCalendarData;
      testDb.hasTradeCalendarData = vi.fn(() => {
        throw new Error('Database connection failed');
      });

      // 执行: 应该捕获错误,不抛出异常
      await expect(
        handler({}, { emit: mockEmit, logger: mockLogger })
      ).resolves.not.toThrow();

      // 验证记录了错误日志
      expect(mockLogger.error).toHaveBeenCalled();

      // 恢复原始方法
      testDb.hasTradeCalendarData = originalHasTradeCalendarData;
    });

    it('should not throw error on emit failure', async () => {
      // 准备: 使用固定的交易日
      const tradeDate = '2025-10-20';

      vi.spyOn(utils, 'getToday').mockReturnValue(tradeDate);

      testDb.saveTradeCalendar([
        {
          calDate: tradeDate,
          exchange: 'SSE',
          isOpen: 1,
          pretradeDate: null,
        },
      ]);

      // Mock emit 抛出错误
      const failingEmit = vi.fn(async () => {
        throw new Error('Emit failed');
      });

      // 执行: 应该捕获错误,不抛出异常
      await expect(
        handler({}, { emit: failingEmit, logger: mockLogger })
      ).resolves.not.toThrow();

      // 验证记录了错误日志
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
