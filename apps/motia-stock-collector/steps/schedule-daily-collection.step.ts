/**
 * Schedule Daily Collection Step
 *
 * 定时触发每日股票数据采集任务的 Cron Step
 *
 * 功能:
 * - 每周一至周五 17:00 自动触发
 * - 获取当前日期
 * - 检查是否为交易日
 * - 如果是交易日,触发数据采集事件
 * - 记录跳过/触发日志
 *
 * 契约: /specs/017-/contracts/schedule-daily-collection.step.json
 */

import { getToday, checkTradeCalendar } from '../lib/utils';
import { db } from '../lib/database';

/**
 * Step 配置
 */
export const config = {
  name: 'ScheduleDailyCollection',
  type: 'cron',
  cron: '0 17 * * 1-5', // 周一至周五 17:00 执行
  flows: ['basic-tutorial'],
  emits: ['data.collection.triggered'],
};

/**
 * Step Handler
 *
 * @param _input - Cron 触发时无输入参数
 * @param context - 上下文对象
 * @param context.emit - 事件触发函数
 * @param context.logger - 日志记录器
 */
export const handler = async (
  _input: any,
  { emit, logger }: { emit: any; logger: any }
) => {
  // 获取当前日期 YYYY-MM-DD
  const today = getToday();

  logger.info('Checking daily collection schedule', {
    date: today,
    dayOfWeek: new Date().toLocaleString('zh-CN', { weekday: 'long' }),
  });

  try {
    // 检查是否为交易日
    const isTradeDay = await checkTradeCalendar(today, emit, db);

    if (!isTradeDay) {
      // 非交易日,跳过采集
      logger.info('Skipping collection - Not a trade day', {
        tradeDate: today,
      });
      return;
    }

    // 交易日,触发数据采集事件
    logger.info('Triggering data collection', {
      tradeDate: today,
    });

    await emit({
      topic: 'data.collection.triggered',
      data: {
        tradeDate: today,
      },
    });

    logger.info('Data collection triggered successfully', {
      tradeDate: today,
    });
  } catch (error: any) {
    logger.error('Failed to schedule collection', {
      error: error.message,
      stack: error.stack,
      tradeDate: today,
    });

    // 不抛出异常,避免 Cron 任务停止
    // 记录错误后继续下次执行
  }
};
