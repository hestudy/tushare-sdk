/**
 * Collect Daily Quotes Step
 *
 * 采集指定交易日的股票日线行情数据
 *
 * 功能:
 * - 订阅 'data.collection.triggered' 事件
 * - 调用 Tushare API 获取指定交易日的全市场日线行情
 * - 批量保存到数据库 (自动去重)
 * - 记录任务日志 (成功/失败, 记录数, 耗时)
 * - 触发 'quotes.collected' 事件
 * - 自动重试 (最多 3 次, 延迟 60 秒)
 *
 * 依赖:
 * - lib/tushare-client.ts - Tushare API 客户端
 * - lib/database.ts - 数据库服务
 * - lib/utils.ts - 日期格式转换
 */

import { TushareService } from '../lib/tushare-client';
import { db as defaultDb } from '../lib/database';
import { formatDateToTushare } from '../lib/utils';

/**
 * Step 配置
 */
export const config = {
  name: 'CollectDailyQuotes',
  type: 'event',
  subscribes: ['data.collection.triggered'],
  emits: ['quotes.collected'],
};

/**
 * Step Handler
 *
 * @param input - 输入数据
 * @param input.tradeDate - 交易日期 YYYY-MM-DD
 * @param context - 上下文对象
 * @param context.emit - 事件触发函数
 * @param context.logger - 日志记录器
 * @param context.db - 数据库实例 (可选,用于测试)
 */
export const handler = async (
  input: { tradeDate: string },
  { emit, logger, db }: { emit: any; logger: any; db?: any }
) => {
  const { tradeDate } = input;

  // 使用注入的 db 或默认 db
  const database = db || defaultDb;

  // 记录任务开始时间
  const startTime = new Date().toISOString();

  logger.info('Starting daily quotes collection', {
    tradeDate,
    startTime,
  });

  try {
    // 初始化 Tushare 服务
    const tushareService = new TushareService();

    // 转换日期格式 YYYY-MM-DD → YYYYMMDD
    const tushareDateFormat = formatDateToTushare(tradeDate);

    // 调用 Tushare API 获取日线行情
    logger.info('Fetching daily quotes from Tushare API', {
      tradeDate,
      tushareDateFormat,
    });

    const quotes = await tushareService.getDailyQuotes(tushareDateFormat);

    logger.info('Fetched quotes from Tushare', {
      count: quotes.length,
      tradeDate,
    });

    // 保存到数据库
    if (quotes.length > 0) {
      const savedCount = database.saveQuotes(quotes);

      logger.info('Saved quotes to database', {
        savedCount,
        tradeDate,
      });
    } else {
      logger.warn('No quotes data fetched', {
        tradeDate,
        message: 'This might indicate a non-trade day or API issue',
      });
    }

    // 记录任务结束时间
    const endTime = new Date().toISOString();

    // 记录任务日志
    database.logTask({
      taskName: 'CollectDailyQuotes',
      startTime,
      endTime,
      status: 'SUCCESS',
      recordsCount: quotes.length,
      errorMessage: null,
    });

    // 触发数据采集完成事件
    await emit({
      topic: 'quotes.collected',
      data: {
        tradeDate,
        count: quotes.length,
        startTime,
        endTime,
      },
    });

    logger.info('Collection completed successfully', {
      tradeDate,
      count: quotes.length,
      duration: new Date(endTime).getTime() - new Date(startTime).getTime(),
    });
  } catch (error: any) {
    // 记录任务结束时间
    const endTime = new Date().toISOString();

    // 记录任务失败日志
    database.logTask({
      taskName: 'CollectDailyQuotes',
      startTime,
      endTime,
      status: 'FAILED',
      recordsCount: 0,
      errorMessage: error.message,
    });

    logger.error('Collection failed', {
      error: error.message,
      stack: error.stack,
      tradeDate,
    });

    // 抛出异常触发重试机制
    throw new Error(
      `Failed to collect daily quotes for ${tradeDate}: ${error.message}`
    );
  }
};
