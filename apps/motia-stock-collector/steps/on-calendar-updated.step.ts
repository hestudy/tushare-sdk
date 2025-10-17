/**
 * 交易日历更新事件监听 Step
 *
 * 功能：
 * - 监听 'calendar.updated' 事件
 * - 记录日历更新完成
 * - 触发下一步的处理（如数据采集验证）
 *
 * 使用场景：
 * - 日历更新后自动触发数据采集任务
 * - 记录更新完成日志
 * - 系统内部事件追踪
 */

export const config = {
  name: 'OnCalendarUpdated',
  type: 'event',
  subscribes: ['calendar.updated'],
  emits: [],
};

interface CalendarUpdatedInput {
  startYear: number;
  endYear: number;
  count: number;
  exchange: 'SSE' | 'SZSE';
}

export const handler = async (input: CalendarUpdatedInput, { logger }: any) => {
  const { startYear, endYear, count, exchange } = input;

  logger.info('Trade calendar update event received', {
    startYear,
    endYear,
    count,
    exchange,
    timestamp: new Date().toISOString(),
  });

  try {
    // 记录事件完成日志
    logger.info('Calendar update event processed successfully', {
      startYear,
      endYear,
      count,
      exchange,
    });
  } catch (error: any) {
    logger.error('Failed to process calendar update event', {
      error: error.message,
      stack: error.stack,
    });

    // 不抛出异常，避免影响事件链
  }
};
