/**
 * 交易日历查询示例
 * 
 * 演示如何使用 SDK 查询交易日历信息
 */

import { TushareClient } from '@hestudy/tushare-sdk';
import type { AppConfig } from '../config.js';

/**
 * 执行交易日历查询示例
 * 
 * @param config - 应用配置
 * @returns 查询结果
 */
export async function runTradeCalendarExample(config: AppConfig): Promise<{
  count: number;
  sample: unknown[];
}> {
  // 创建 SDK 客户端
  const client = new TushareClient({
    token: config.tushareToken,
    endpoint: config.apiBaseUrl,
  });

  // 查询 2024 年的交易日历
  const response = await client.query('trade_cal', {
    exchange: 'SSE',
    start_date: '20240101',
    end_date: '20241231',
  });

  // 返回结果统计
  return {
    count: response.length,
    sample: response.slice(0, 3), // 返回前 3 条作为示例
  };
}
