/**
 * 交易日历采集 Step
 *
 * 功能：
 * - 监听 'calendar.update.needed' 事件
 * - 调用 Tushare API 获取交易日历数据
 * - 保存到 trade_calendar 表
 * - 触发 'calendar.updated' 事件
 *
 * 使用场景：
 * - 首次启动时获取最近3年交易日历
 * - 定期检测到缺失年度数据时自动更新
 */

export const config = {
  name: 'CollectTradeCalendar',
  type: 'event',
  subscribes: ['calendar.update.needed'],
  retries: 3,
  retryDelay: 5000,
};

interface CalendarUpdateInput {
  startYear?: number; // 开始年份，默认当前年份-2
  endYear?: number; // 结束年份，默认当前年份+1
  exchange?: 'SSE' | 'SZSE'; // 交易所，默认 SSE
}

export const handler = async (
  input: CalendarUpdateInput,
  { emit, logger }: any
) => {
  const startTime = new Date().toISOString();
  const currentYear = new Date().getFullYear();

  // 默认获取当前年份前后2年的数据
  const startYear = input.startYear || currentYear - 2;
  const endYear = input.endYear || currentYear + 1;
  const exchange = input.exchange || 'SSE';

  logger.info('Starting trade calendar collection', {
    startYear,
    endYear,
    exchange,
  });

  try {
    const { TushareService } = await import('../lib/tushare-client.js');
    const { db } = await import('../lib/database.js');
    const { formatToTushareDate } = await import('../lib/utils.js');

    // 初始化 Tushare 服务
    const tushareService = new TushareService();

    // 构造日期范围
    const startDate = formatToTushareDate(`${startYear}-01-01`);
    const endDate = formatToTushareDate(`${endYear}-12-31`);

    // 获取交易日历数据
    logger.info('Fetching trade calendar from Tushare', {
      startDate,
      endDate,
      exchange,
    });

    const calendars = await tushareService.getTradeCalendar(
      startDate,
      endDate,
      exchange
    );

    // 保存到数据库
    const savedCount = db.saveTradeCalendar(calendars);

    logger.info('Trade calendar saved', {
      count: savedCount,
      startYear,
      endYear,
    });

    // 记录任务日志
    const endTime = new Date().toISOString();
    db.logTask({
      taskName: 'CollectTradeCalendar',
      startTime,
      endTime,
      status: 'SUCCESS',
      recordsCount: savedCount,
      errorMessage: null,
    });

    // 触发更新完成事件
    await emit({
      topic: 'calendar.updated',
      data: {
        startYear,
        endYear,
        count: savedCount,
        exchange,
      },
    });

    logger.info('Trade calendar update completed', { count: savedCount });
  } catch (error: any) {
    const endTime = new Date().toISOString();

    logger.error('Trade calendar collection failed', {
      error: error.message,
      stack: error.stack,
    });

    // 记录失败日志
    const { db } = await import('../lib/database.js');
    db.logTask({
      taskName: 'CollectTradeCalendar',
      startTime,
      endTime,
      status: 'FAILED',
      recordsCount: 0,
      errorMessage: error.message,
    });

    // 重新抛出错误触发重试机制
    throw error;
  }
};
