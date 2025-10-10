/**
 * 股票列表查询示例
 * 
 * 演示如何使用 SDK 查询股票基本信息
 */

import { TushareClient } from '@hestudy/tushare-sdk';
import type { AppConfig } from '../config.js';
import { logApiRequest, logApiResponse } from '../utils/logger.js';

/**
 * 执行股票列表查询示例
 * 
 * @param config - 应用配置
 * @returns 查询结果
 */
export async function runStockListExample(config: AppConfig): Promise<{
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
    exchange: 'SSE' as const,
    list_status: 'L' as const,
  };

  // 记录 API 请求
  logApiRequest('getStockBasic', params);

  // 查询股票列表(上交所,上市状态)
  const startTime = Date.now();
  const response = await client.getStockBasic(params);
  const duration = Date.now() - startTime;

  // 记录 API 响应
  logApiResponse('getStockBasic', response, duration);

  // 返回结果统计
  return {
    count: response.length,
    sample: response.slice(0, 3), // 返回前 3 条作为示例
  };
}
