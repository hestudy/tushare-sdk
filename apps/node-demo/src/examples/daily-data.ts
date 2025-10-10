/**
 * 日线数据查询示例
 * 
 * 演示如何使用 SDK 查询股票日线行情数据
 */

import { TushareClient } from '@hestudy/tushare-sdk';
import type { AppConfig } from '../config.js';
import { logApiRequest, logApiResponse } from '../utils/logger.js';

/**
 * 执行日线数据查询示例
 * 
 * @param config - 应用配置
 * @returns 查询结果
 */
export async function runDailyDataExample(config: AppConfig): Promise<{
  count: number;
  sample: unknown[];
}> {
  // 创建 SDK 客户端
  const client = new TushareClient({
    token: config.tushareToken,
    endpoint: config.apiBaseUrl,
  });

  // 查询参数
  const params = {
    ts_code: '000001.SZ',
    start_date: '20240901',
    end_date: '20241001',
  };

  // 记录 API 请求
  logApiRequest('getDailyQuote', params);

  // 查询平安银行最近 30 天的日线数据
  const startTime = Date.now();
  const response = await client.getDailyQuote(params);
  const duration = Date.now() - startTime;

  // 记录 API 响应
  logApiResponse('getDailyQuote', response, duration);

  // 返回结果统计
  return {
    count: response.length,
    sample: response.slice(0, 3), // 返回前 3 条作为示例
  };
}
