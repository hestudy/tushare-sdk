/**
 * Collect Daily Quotes Step 契约测试
 *
 * 测试目标:
 * - 验证 Step 配置正确
 * - Mock Tushare API 调用,测试数据采集逻辑
 * - 验证数据正确保存到数据库
 * - 验证 TaskLog 记录正确
 * - 测试重试机制 (模拟 API 失败)
 * - 验证 Emit 事件格式
 *
 * 依赖:
 * - Mock TushareService
 * - 内存数据库测试
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { config, handler } from '../../steps/collect-daily-quotes.step.js';
import { DatabaseService } from '../../lib/database.js';
import { TushareService } from '../../lib/tushare-client.js';

// 创建测试专用数据库
let testDb: DatabaseService;

describe('CollectDailyQuotes Step - Contract Tests', () => {
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
    // 使用内存数据库进行测试
    testDb = new DatabaseService(':memory:');

    // Mock 全局 db 实例,使其指向测试数据库
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
      expect(config.name).toBe('CollectDailyQuotes');
    });

    it('should be an event step type', () => {
      expect(config.type).toBe('event');
    });

    it('should subscribe to correct event topics', () => {
      expect(config.subscribes).toEqual(['data.collection.triggered']);
    });

    it('should emit correct event topics', () => {
      expect(config.emits).toEqual(['quotes.collected']);
    });
  });

  describe('Handler - Successful Collection', () => {
    it('should fetch and save quotes successfully', async () => {
      // Mock TushareService
      const mockQuotes = [
        {
          tsCode: '600519.SH',
          tradeDate: '2024-01-15',
          open: 1450.0,
          high: 1460.0,
          low: 1445.0,
          close: 1455.0,
          preClose: 1448.0,
          change: 7.0,
          pctChg: 0.48,
          vol: 50000.0,
          amount: 7250000.0,
        },
        {
          tsCode: '000001.SZ',
          tradeDate: '2024-01-15',
          open: 10.5,
          high: 10.8,
          low: 10.3,
          close: 10.7,
          preClose: 10.4,
          change: 0.3,
          pctChg: 2.88,
          vol: 100000.0,
          amount: 1070000.0,
        },
      ];

      // Mock TushareService.getDailyQuotes
      vi.spyOn(TushareService.prototype, 'getDailyQuotes').mockResolvedValue(
        mockQuotes
      );

      // 执行
      const input = { tradeDate: '2024-01-15' };
      await handler(input, { emit: mockEmit, logger: mockLogger });

      // 验证: 数据保存到数据库
      const savedQuotes = testDb.queryQuotes({
        startDate: '2024-01-15',
        endDate: '2024-01-15',
      });

      expect(savedQuotes).toHaveLength(2);
      // 查询结果按 trade_date DESC, ts_code ASC 排序
      const codes = savedQuotes.map((q) => q.tsCode).sort();
      expect(codes).toEqual(['000001.SZ', '600519.SH']);

      // 验证: 错误日志
      const taskLogs = testDb.queryTaskLogsByName('CollectDailyQuotes');
      expect(taskLogs).toHaveLength(1);
      expect(taskLogs[0].status).toBe('SUCCESS');
      expect(taskLogs[0].recordsCount).toBe(2);

      // 验证: Emit 事件
      expect(mockEmit).toHaveBeenCalledTimes(1);
      expect(emittedEvents).toHaveLength(1);

      const event = emittedEvents[0];
      expect(event.topic).toBe('quotes.collected');
      expect(event.data.tradeDate).toBe('2024-01-15');
      expect(event.data.count).toBe(2);

      // 验证日志
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Collection completed successfully',
        expect.any(Object)
      );
    });

    it('should handle empty quotes gracefully', async () => {
      // Mock TushareService 返回空数组
      vi.spyOn(TushareService.prototype, 'getDailyQuotes').mockResolvedValue(
        []
      );

      // 执行
      const input = { tradeDate: '2024-01-15' };
      await handler(input, { emit: mockEmit, logger: mockLogger });

      // 验证: 警告日志
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'No quotes data fetched',
        expect.objectContaining({
          tradeDate: '2024-01-15',
        })
      );

      // 验证: TaskLog 记录为成功但记录数为 0
      const taskLogs = testDb.queryTaskLogsByName('CollectDailyQuotes');
      expect(taskLogs).toHaveLength(1);
      expect(taskLogs[0].status).toBe('SUCCESS');
      expect(taskLogs[0].recordsCount).toBe(0);
    });
  });

  describe('Handler - Error Handling', () => {
    it('should record failure on API error', async () => {
      // Mock TushareService 抛出错误
      vi.spyOn(TushareService.prototype, 'getDailyQuotes').mockRejectedValue(
        new Error('API rate limit exceeded')
      );

      // 执行: 应该抛出错误触发重试
      const input = { tradeDate: '2024-01-15' };
      await expect(
        handler(input, { emit: mockEmit, logger: mockLogger })
      ).rejects.toThrow('Failed to collect daily quotes');

      // 验证: 错误日志
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Collection failed',
        expect.objectContaining({
          error: 'API rate limit exceeded',
          tradeDate: '2024-01-15',
        })
      );

      // 验证: TaskLog 记录失败
      const { logs: taskLogs } = testDb.queryTaskLogs({
        taskName: 'CollectDailyQuotes',
      });
      expect(taskLogs).toHaveLength(1);
      expect(taskLogs[0].status).toBe('FAILED');
      expect(taskLogs[0].errorMessage).toContain('API rate limit exceeded');
    });

    it('should handle database save error', async () => {
      // Mock TushareService 返回数据
      const mockQuotes = [
        {
          tsCode: '600519.SH',
          tradeDate: '2024-01-15',
          open: 1450.0,
          high: 1460.0,
          low: 1445.0,
          close: 1455.0,
          preClose: 1448.0,
          change: 7.0,
          pctChg: 0.48,
          vol: 50000.0,
          amount: 7250000.0,
        },
      ];

      vi.spyOn(TushareService.prototype, 'getDailyQuotes').mockResolvedValue(
        mockQuotes
      );

      // Mock 数据库保存失败
      vi.spyOn(testDb, 'saveQuotes').mockImplementation(() => {
        throw new Error('Database write failed');
      });

      // 执行: 应该抛出错误
      const input = { tradeDate: '2024-01-15' };
      await expect(
        handler(input, { emit: mockEmit, logger: mockLogger })
      ).rejects.toThrow();

      // 验证: 错误日志
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('Event Emit Format', () => {
    it('should emit event with correct schema', async () => {
      // Mock TushareService
      vi.spyOn(TushareService.prototype, 'getDailyQuotes').mockResolvedValue([
        {
          tsCode: '600519.SH',
          tradeDate: '2024-01-15',
          open: 1450.0,
          high: 1460.0,
          low: 1445.0,
          close: 1455.0,
          preClose: 1448.0,
          change: 7.0,
          pctChg: 0.48,
          vol: 50000.0,
          amount: 7250000.0,
        },
      ]);

      // 执行
      const input = { tradeDate: '2024-01-15' };
      await handler(input, { emit: mockEmit, logger: mockLogger });

      // 验证事件格式
      const event = emittedEvents[0];

      // 必需字段
      expect(event).toHaveProperty('topic');
      expect(event).toHaveProperty('data');
      expect(event.data).toHaveProperty('tradeDate');
      expect(event.data).toHaveProperty('count');
      expect(event.data).toHaveProperty('startTime');
      expect(event.data).toHaveProperty('endTime');

      // 字段类型验证
      expect(typeof event.data.tradeDate).toBe('string');
      expect(typeof event.data.count).toBe('number');
      expect(event.data.tradeDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('Data Deduplication', () => {
    it('should replace existing data on duplicate insert', async () => {
      // Mock TushareService
      const mockQuotes = [
        {
          tsCode: '600519.SH',
          tradeDate: '2024-01-15',
          open: 1450.0,
          high: 1460.0,
          low: 1445.0,
          close: 1455.0,
          preClose: 1448.0,
          change: 7.0,
          pctChg: 0.48,
          vol: 50000.0,
          amount: 7250000.0,
        },
      ];

      vi.spyOn(TushareService.prototype, 'getDailyQuotes').mockResolvedValue(
        mockQuotes
      );

      // 第一次采集
      const input = { tradeDate: '2024-01-15' };
      await handler(input, { emit: mockEmit, logger: mockLogger });

      // 验证: 数据库有 1 条记录
      let savedQuotes = testDb.queryQuotes({
        tsCode: '600519.SH',
        startDate: '2024-01-15',
        endDate: '2024-01-15',
      });
      expect(savedQuotes).toHaveLength(1);
      expect(savedQuotes[0].close).toBe(1455.0);

      // 修改数据并第二次采集
      mockQuotes[0].close = 1465.0;
      await handler(input, { emit: mockEmit, logger: mockLogger });

      // 验证: 数据库仍然只有 1 条记录,但价格已更新
      savedQuotes = testDb.queryQuotes({
        tsCode: '600519.SH',
        startDate: '2024-01-15',
        endDate: '2024-01-15',
      });
      expect(savedQuotes).toHaveLength(1);
      expect(savedQuotes[0].close).toBe(1465.0);
    });
  });
});
