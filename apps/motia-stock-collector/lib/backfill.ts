/**
 * Historical Data Backfill Module
 *
 * 历史数据补齐功能
 *
 * 功能:
 * - 获取指定日期范围内的所有交易日
 * - 批次触发数据采集事件
 * - 显示进度信息
 * - 错误恢复和重试
 * - 统计补齐结果
 *
 * 使用场景:
 * - 首次初始化系统时补齐历史数据
 * - 补齐系统停机期间缺失的数据
 * - 修复采集失败的日期数据
 */

import { db } from './database.js';
import { formatDateToTushare, formatDateFromTushare } from './utils.js';

/**
 * 补齐结果接口
 */
export interface BackfillResult {
  success: boolean;
  startDate: string;
  endDate: string;
  totalDays: number;
  processedDays: number;
  failedDays: string[];
  duration: number;
}

/**
 * 补齐配置接口
 */
export interface BackfillOptions {
  /** 开始日期 YYYY-MM-DD */
  startDate: string;
  /** 结束日期 YYYY-MM-DD */
  endDate: string;
  /** 事件触发器 */
  emit: any;
  /** 日志记录器 */
  logger: any;
  /** 批次延迟时间 (毫秒),默认 2000ms */
  batchDelay?: number;
}

/**
 * 补齐历史数据
 *
 * @param options - 补齐配置选项
 * @returns Promise<BackfillResult> 补齐结果
 *
 * @example
 * ```typescript
 * const result = await backfillHistoricalData({
 *   startDate: '2024-01-01',
 *   endDate: '2024-01-31',
 *   emit: context.emit,
 *   logger: context.logger,
 *   batchDelay: 2000,
 * });
 * ```
 */
export async function backfillHistoricalData(
  options: BackfillOptions
): Promise<BackfillResult> {
  const { startDate, endDate, emit, logger, batchDelay = 2000 } = options;

  const startTime = Date.now();

  logger.info('Starting historical data backfill', {
    startDate,
    endDate,
    batchDelay,
  });

  try {
    // 1. 获取日期范围内的所有交易日
    const tradeDays = db.getTradeDays(startDate, endDate);

    if (tradeDays.length === 0) {
      logger.warn('No trade days found in the date range', {
        startDate,
        endDate,
        message: 'Please ensure trade calendar is populated',
      });

      return {
        success: false,
        startDate,
        endDate,
        totalDays: 0,
        processedDays: 0,
        failedDays: [],
        duration: Date.now() - startTime,
      };
    }

    logger.info('Found trade days to backfill', {
      count: tradeDays.length,
      firstDay: tradeDays[0],
      lastDay: tradeDays[tradeDays.length - 1],
    });

    // 2. 批次触发数据采集事件
    const failedDays: string[] = [];
    let processedCount = 0;

    for (const tradeDate of tradeDays) {
      try {
        // 触发数据采集事件
        await emit({
          topic: 'data.collection.triggered',
          data: {
            tradeDate,
          },
        });

        processedCount++;

        logger.info('Triggered collection for trade day', {
          tradeDate,
          progress: `${processedCount}/${tradeDays.length}`,
          percentage: Math.round((processedCount / tradeDays.length) * 100),
        });

        // 批次延迟,避免 API 限流
        if (processedCount < tradeDays.length) {
          await sleep(batchDelay);
        }
      } catch (error: any) {
        failedDays.push(tradeDate);

        logger.error('Failed to trigger collection', {
          tradeDate,
          error: error.message,
        });

        // 继续处理下一个日期
      }
    }

    // 3. 返回补齐结果
    const duration = Date.now() - startTime;
    const success = failedDays.length === 0;

    logger.info('Historical data backfill completed', {
      success,
      totalDays: tradeDays.length,
      processedDays: processedCount,
      failedDays: failedDays.length,
      duration,
    });

    return {
      success,
      startDate,
      endDate,
      totalDays: tradeDays.length,
      processedDays: processedCount,
      failedDays,
      duration,
    };
  } catch (error: any) {
    logger.error('Backfill process failed', {
      error: error.message,
      stack: error.stack,
      startDate,
      endDate,
    });

    throw new Error(`Backfill failed: ${error.message}`);
  }
}

/**
 * 重试失败的补齐任务
 *
 * @param failedDays - 失败的交易日列表
 * @param emit - 事件触发器
 * @param logger - 日志记录器
 * @param batchDelay - 批次延迟时间 (毫秒)
 * @returns Promise<BackfillResult> 重试结果
 */
export async function retryFailedBackfill(
  failedDays: string[],
  emit: any,
  logger: any,
  batchDelay: number = 2000
): Promise<BackfillResult> {
  if (failedDays.length === 0) {
    logger.info('No failed days to retry');
    return {
      success: true,
      startDate: '',
      endDate: '',
      totalDays: 0,
      processedDays: 0,
      failedDays: [],
      duration: 0,
    };
  }

  const startDate = failedDays[0];
  const endDate = failedDays[failedDays.length - 1];

  logger.info('Retrying failed backfill', {
    failedCount: failedDays.length,
    startDate,
    endDate,
  });

  return backfillHistoricalData({
    startDate,
    endDate,
    emit,
    logger,
    batchDelay,
  });
}

/**
 * 获取缺失数据的日期列表
 *
 * @param startDate - 开始日期 YYYY-MM-DD
 * @param endDate - 结束日期 YYYY-MM-DD
 * @returns Promise<string[]> 缺失数据的交易日列表
 */
export async function getMissingDataDates(
  startDate: string,
  endDate: string
): Promise<string[]> {
  // 获取所有交易日
  const tradeDays = db.getTradeDays(startDate, endDate);

  // 检查每个交易日是否有数据
  const missingDays: string[] = [];

  for (const tradeDate of tradeDays) {
    const quotes = db.queryQuotes({
      startDate: tradeDate,
      endDate: tradeDate,
      limit: 1,
    });

    // 如果没有查询到数据,说明该日期缺失
    if (quotes.length === 0) {
      missingDays.push(tradeDate);
    }
  }

  return missingDays;
}

/**
 * 睡眠函数
 *
 * @param ms - 睡眠时间 (毫秒)
 * @returns Promise<void>
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
