/**
 * 每日指标查询示例
 * 
 * 演示如何使用 SDK 查询股票每日基本面指标数据
 */

import { TushareClient } from '@hestudy/tushare-sdk';
import type { AppConfig } from '../config.js';
import { logApiRequest, logApiResponse, logVerbose } from '../utils/logger.js';

/**
 * 执行每日指标查询示例
 * 
 * 演示如何使用 SDK 查询股票每日基本面指标数据,包括:
 * - 场景 1: 按交易日期查询全市场数据
 * - 场景 2: 按股票代码查询历史数据
 * - 场景 3: 自定义返回字段
 * 
 * @param config - 应用配置
 * @returns 查询结果统计
 * @throws {Error} 当 API 调用失败时抛出
 */
export async function runDailyBasicExample(config: AppConfig): Promise<{
  count: number;
  sample: unknown[];
}> {
  try {
    // 创建 SDK 客户端
    const client = new TushareClient({
      token: config.tushareToken,
      endpoint: config.apiBaseUrl,
    });

    let totalCount = 0;
    const allSamples: unknown[] = [];

    // ========== 场景 1: 按交易日期查询全市场数据 ==========
    logVerbose('\n=== 场景 1: 按交易日期查询全市场数据 ===');
    
    const params1 = {
      trade_date: '20241008',
    };

    logApiRequest('getDailyBasic', params1);
    const startTime1 = Date.now();
    const response1 = await client.getDailyBasic(params1);
    const duration1 = Date.now() - startTime1;
    logApiResponse('getDailyBasic', response1, duration1);

    logVerbose(`查询参数: ${JSON.stringify(params1)}`);
    logVerbose(`返回数据: ${response1.length} 条`);
    
    totalCount += response1.length;
    allSamples.push(...response1.slice(0, 1));

    // ========== 场景 2: 按股票代码查询历史数据 ==========
    logVerbose('\n=== 场景 2: 按股票代码查询历史数据 ===');
    
    const params2 = {
      ts_code: '000001.SZ',
      start_date: '20240901',
      end_date: '20241001',
    };

    logApiRequest('getDailyBasic', params2);
    const startTime2 = Date.now();
    const response2 = await client.getDailyBasic(params2);
    const duration2 = Date.now() - startTime2;
    logApiResponse('getDailyBasic', response2, duration2);

    logVerbose(`查询参数: ${JSON.stringify(params2)}`);
    logVerbose(`返回数据: ${response2.length} 条`);
    
    totalCount += response2.length;
    allSamples.push(...response2.slice(0, 1));

    // ========== 场景 3: 自定义返回字段 ==========
    logVerbose('\n=== 场景 3: 自定义返回字段 ===');
    
    const params3 = {
      trade_date: '20241008',
      fields: 'ts_code,trade_date,pe,pb,turnover_rate,total_mv',
    };

    logApiRequest('getDailyBasic', params3);
    const startTime3 = Date.now();
    const response3 = await client.getDailyBasic(params3);
    const duration3 = Date.now() - startTime3;
    logApiResponse('getDailyBasic', response3, duration3);

    logVerbose(`查询参数: ${JSON.stringify(params3)}`);
    logVerbose(`返回字段: ${params3.fields}`);
    logVerbose(`返回数据: ${response3.length} 条`);
    
    totalCount += response3.length;
    allSamples.push(...response3.slice(0, 1));

    // 处理无数据情况
    if (totalCount === 0) {
      logVerbose('\n提示: 未返回任何数据,可能是周末/节假日或参数错误');
    }

    // 返回结果统计
    return {
      count: totalCount,
      sample: allSamples.slice(0, 3), // 返回前 3 条作为示例
    };
  } catch (error) {
    // 错误处理 - 抛出错误由 example-runner 统一处理
    logVerbose(`\n错误: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}
