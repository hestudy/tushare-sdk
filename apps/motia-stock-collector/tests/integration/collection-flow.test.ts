/**
 * Data Collection End-to-End Tests
 *
 * 测试目标:
 * - 场景 1: Cron 触发 → 检查交易日 → 采集数据 → 保存数据库 → 验证可查询
 * - 场景 2: 非交易日触发 → 跳过采集 → 验证日志记录
 * - 场景 3: API 失败 → 自动重试 → 最终成功
 * - 场景 4: 历史数据补齐 → 批量采集 → 验证完整性
 *
 * 依赖:
 * - Mock Tushare API
 * - 内存数据库
 * - Motia 事件流模拟
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { DatabaseService } from '../../lib/database.js';
import { TushareService } from '../../lib/tushare-client.js';
import { backfillHistoricalData } from '../../lib/backfill.js';
import { handler as scheduleHandler } from '../../steps/schedule-daily-collection.step.js';
import { handler as collectHandler } from '../../steps/collect-daily-quotes.step.js';

// 测试专用数据库
let testDb: DatabaseService;

describe('Data Collection Flow - End-to-End Tests', () => {
  // Mock logger
  const mockLogger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };

  beforeEach(() => {
    // 使用内存数据库
    testDb = new DatabaseService(':memory:');

    // 清空 mock 记录
    mockLogger.info.mockClear();
    mockLogger.warn.mockClear();
    mockLogger.error.mockClear();
  });

  afterEach(() => {
    testDb.close();
  });

  describe('Scenario 1: Complete Collection Flow on Trade Day', () => {
    it('should complete full flow from cron trigger to data storage', async () => {
      // Step 1: 准备交易日历数据
      const today = '2024-01-15';
      testDb.saveTradeCalendar([
        {
          calDate: today,
          exchange: 'SSE',
          isOpen: 1, // 交易日
          pretradeDate: '2024-01-12',
        },
      ]);

      // Step 2: Mock Tushare API 返回测试数据
      const mockQuotes = [
        {
          tsCode: '600519.SH',
          tradeDate: today,
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
          tradeDate: today,
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

      vi.spyOn(TushareService.prototype, 'getDailyQuotes').mockResolvedValue(
        mockQuotes
      );

      // Step 3: 模拟完整事件流
      let collectionTriggered = false;
      let quotesCollected = false;

      const mockEmit = vi.fn(async (event: any) => {
        if (event.topic === 'data.collection.triggered') {
          collectionTriggered = true;

          // 触发采集 handler
          await collectHandler(event.data, {
            emit: mockEmit,
            logger: mockLogger,
          });
        } else if (event.topic === 'quotes.collected') {
          quotesCollected = true;
        }
      });

      // Step 4: 执行 Schedule Handler (模拟 Cron 触发)
      await scheduleHandler({}, { emit: mockEmit, logger: mockLogger });

      // Step 5: 验证事件流
      expect(collectionTriggered).toBe(true);
      expect(quotesCollected).toBe(true);

      // Step 6: 验证数据保存到数据库
      const savedQuotes = testDb.queryQuotes({
        startDate: today,
        endDate: today,
      });
      expect(savedQuotes).toHaveLength(2);
      expect(savedQuotes.find((q) => q.tsCode === '600519.SH')).toBeDefined();
      expect(savedQuotes.find((q) => q.tsCode === '000001.SZ')).toBeDefined();

      // Step 7: 验证 TaskLog 记录
      const taskLogs = testDb.queryTaskLogs('CollectDailyQuotes');
      expect(taskLogs).toHaveLength(1);
      expect(taskLogs[0].status).toBe('SUCCESS');
      expect(taskLogs[0].recordsCount).toBe(2);

      // Step 8: 验证日志记录
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Collection completed successfully',
        expect.any(Object)
      );
    });
  });

  describe('Scenario 2: Skip Collection on Non-Trade Day', () => {
    it('should skip collection and log on non-trade day', async () => {
      // Step 1: 准备非交易日数据
      const today = '2024-01-13'; // 假设是周六
      testDb.saveTradeCalendar([
        {
          calDate: today,
          exchange: 'SSE',
          isOpen: 0, // 非交易日
          pretradeDate: '2024-01-12',
        },
      ]);

      // Step 2: Mock emit
      const mockEmit = vi.fn();

      // Step 3: 执行 Schedule Handler
      await scheduleHandler({}, { emit: mockEmit, logger: mockLogger });

      // Step 4: 验证没有触发数据采集事件
      const collectionEvents = mockEmit.mock.calls.filter(
        (call) => call[0].topic === 'data.collection.triggered'
      );
      expect(collectionEvents).toHaveLength(0);

      // Step 5: 验证日志记录了跳过信息
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Skipping collection - Not a trade day',
        expect.objectContaining({
          tradeDate: today,
        })
      );

      // Step 6: 验证数据库无新增数据
      const savedQuotes = testDb.queryQuotes({
        startDate: today,
        endDate: today,
      });
      expect(savedQuotes).toHaveLength(0);
    });
  });

  describe('Scenario 3: API Failure and Retry', () => {
    it('should handle API failure and throw error for retry', async () => {
      // Step 1: 准备交易日数据
      const today = '2024-01-15';
      testDb.saveTradeCalendar([
        {
          calDate: today,
          exchange: 'SSE',
          isOpen: 1,
          pretradeDate: null,
        },
      ]);

      // Step 2: Mock API 失败
      vi.spyOn(TushareService.prototype, 'getDailyQuotes').mockRejectedValue(
        new Error('API rate limit exceeded')
      );

      // Step 3: Mock emit
      const mockEmit = vi.fn();

      // Step 4: 执行采集 handler,应该抛出错误
      const input = { tradeDate: today };
      await expect(
        collectHandler(input, { emit: mockEmit, logger: mockLogger })
      ).rejects.toThrow('Failed to collect daily quotes');

      // Step 5: 验证错误日志
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Collection failed',
        expect.objectContaining({
          error: 'API rate limit exceeded',
        })
      );

      // Step 6: 验证 TaskLog 记录失败
      const taskLogs = testDb.queryTaskLogs('CollectDailyQuotes');
      expect(taskLogs).toHaveLength(1);
      expect(taskLogs[0].status).toBe('FAILED');
      expect(taskLogs[0].errorMessage).toContain('API rate limit exceeded');
    });

    it('should succeed after retry with API recovery', async () => {
      // Step 1: 准备交易日数据
      const today = '2024-01-15';
      testDb.saveTradeCalendar([
        {
          calDate: today,
          exchange: 'SSE',
          isOpen: 1,
          pretradeDate: null,
        },
      ]);

      // Step 2: Mock API 第一次失败,第二次成功
      let callCount = 0;
      vi.spyOn(TushareService.prototype, 'getDailyQuotes').mockImplementation(
        async () => {
          callCount++;
          if (callCount === 1) {
            throw new Error('Temporary API error');
          }
          return [
            {
              tsCode: '600519.SH',
              tradeDate: today,
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
        }
      );

      // Step 3: Mock emit
      const mockEmit = vi.fn();

      // Step 4: 第一次执行失败
      const input = { tradeDate: today };
      await expect(
        collectHandler(input, { emit: mockEmit, logger: mockLogger })
      ).rejects.toThrow();

      // Step 5: 第二次执行成功 (模拟重试)
      await expect(
        collectHandler(input, { emit: mockEmit, logger: mockLogger })
      ).resolves.not.toThrow();

      // Step 6: 验证数据最终保存成功
      const savedQuotes = testDb.queryQuotes({
        startDate: today,
        endDate: today,
      });
      expect(savedQuotes).toHaveLength(1);

      // Step 7: 验证有 2 条 TaskLog (1 失败, 1 成功)
      const taskLogs = testDb.queryTaskLogs('CollectDailyQuotes');
      expect(taskLogs).toHaveLength(2);
      expect(taskLogs[0].status).toBe('SUCCESS'); // 最新的记录
      expect(taskLogs[1].status).toBe('FAILED');
    });
  });

  describe('Scenario 4: Historical Data Backfill', () => {
    it('should backfill multiple trade days successfully', async () => {
      // Step 1: 准备交易日历数据 (连续 3 个交易日)
      const tradeDays = ['2024-01-15', '2024-01-16', '2024-01-17'];
      testDb.saveTradeCalendar(
        tradeDays.map((date) => ({
          calDate: date,
          exchange: 'SSE',
          isOpen: 1,
          pretradeDate: null,
        }))
      );

      // Step 2: Mock Tushare API
      vi.spyOn(TushareService.prototype, 'getDailyQuotes').mockResolvedValue([
        {
          tsCode: '600519.SH',
          tradeDate: '2024-01-15', // 日期会被动态替换
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

      // Step 3: 执行历史数据补齐
      const mockEmit = vi.fn(async (event: any) => {
        if (event.topic === 'data.collection.triggered') {
          // 触发采集
          await collectHandler(event.data, {
            emit: mockEmit,
            logger: mockLogger,
          });
        }
      });

      const result = await backfillHistoricalData({
        startDate: '2024-01-15',
        endDate: '2024-01-17',
        emit: mockEmit,
        logger: mockLogger,
        batchDelay: 100, // 测试时缩短延迟
      });

      // Step 4: 验证补齐结果
      expect(result.success).toBe(true);
      expect(result.totalDays).toBe(3);
      expect(result.processedDays).toBe(3);
      expect(result.failedDays).toHaveLength(0);

      // Step 5: 验证数据库有 3 条记录 (每个交易日 1 条)
      const savedQuotes = testDb.queryQuotes({
        startDate: '2024-01-15',
        endDate: '2024-01-17',
      });
      expect(savedQuotes.length).toBeGreaterThanOrEqual(3);

      // Step 6: 验证 TaskLog 记录
      const taskLogs = testDb.queryTaskLogs('CollectDailyQuotes');
      expect(taskLogs.length).toBeGreaterThanOrEqual(3);

      // Step 7: 验证所有任务都成功
      const successfulTasks = taskLogs.filter((log) => log.status === 'SUCCESS');
      expect(successfulTasks.length).toBeGreaterThanOrEqual(3);
    });

    it('should handle partial failures during backfill', async () => {
      // Step 1: 准备交易日历数据
      const tradeDays = ['2024-01-15', '2024-01-16', '2024-01-17'];
      testDb.saveTradeCalendar(
        tradeDays.map((date) => ({
          calDate: date,
          exchange: 'SSE',
          isOpen: 1,
          pretradeDate: null,
        }))
      );

      // Step 2: Mock API 第二次调用失败
      let callCount = 0;
      vi.spyOn(TushareService.prototype, 'getDailyQuotes').mockImplementation(
        async () => {
          callCount++;
          if (callCount === 2) {
            throw new Error('API error on second day');
          }
          return [
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
        }
      );

      // Step 3: 执行补齐,部分失败
      const mockEmit = vi.fn(async (event: any) => {
        if (event.topic === 'data.collection.triggered') {
          try {
            await collectHandler(event.data, {
              emit: mockEmit,
              logger: mockLogger,
            });
          } catch (error) {
            // 捕获错误,但继续下一个日期
          }
        }
      });

      const result = await backfillHistoricalData({
        startDate: '2024-01-15',
        endDate: '2024-01-17',
        emit: mockEmit,
        logger: mockLogger,
        batchDelay: 100,
      });

      // Step 4: 验证结果
      expect(result.success).toBe(true); // backfill 本身成功触发了所有事件
      expect(result.totalDays).toBe(3);

      // Step 5: 验证日志记录了错误
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
