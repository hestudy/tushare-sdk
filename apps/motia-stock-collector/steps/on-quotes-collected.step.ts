/**
 * 行情数据采集完成事件监听 Step
 *
 * 功能：
 * - 监听 'quotes.collected' 事件
 * - 记录采集完成状态
 * - 执行数据处理或分析
 * - 触发其他依赖任务
 *
 * 使用场景：
 * - 采集完成后自动触发数据处理流程
 * - 实时监控数据采集状态
 * - 系统内部事件追踪
 */

export const config = {
  name: 'OnQuotesCollected',
  type: 'event',
  subscribes: ['quotes.collected'],
  emits: [],
};

interface QuotesCollectedInput {
  tradeDate: string;
  count: number;
  startTime: string;
  endTime: string;
}

export const handler = async (input: QuotesCollectedInput, { logger }: any) => {
  const { tradeDate, count, startTime, endTime } = input;

  // 计算采集耗时（毫秒）
  const duration = new Date(endTime).getTime() - new Date(startTime).getTime();

  logger.info('Daily quotes collection event received', {
    tradeDate,
    count,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
  });

  try {
    // 记录事件完成日志
    logger.info('Quotes collection event processed successfully', {
      tradeDate,
      count,
      duration: `${duration}ms`,
    });

    // 可选：触发后续处理
    // 例如: 数据验证、异常检测等
    if (count === 0) {
      logger.warn('No quotes collected for trade date', {
        tradeDate,
        message: 'This might indicate a non-trade day or data issue',
      });
    }
  } catch (error: any) {
    logger.error('Failed to process quotes collection event', {
      error: error.message,
      stack: error.stack,
      tradeDate,
    });

    // 不抛出异常，避免影响事件链
  }
};
