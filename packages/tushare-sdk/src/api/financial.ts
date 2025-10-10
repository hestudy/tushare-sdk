/**
 * 财务数据 API
 * 
 * 提供公司财务报表数据的查询接口
 */

import type { TushareClient } from '../client/TushareClient.js';
import type { FinancialItem, FinancialParams } from '../models/financial.js';

/**
 * 获取财务数据
 * 
 * 查询上市公司的财务报表数据,包括利润表、资产负债表等关键指标
 * 
 * @param client - Tushare 客户端实例
 * @param params - 查询参数
 * @returns 财务数据列表
 * @throws {ApiError} 当参数无效或请求失败时抛出
 * 
 * @example
 * ```typescript
 * // 查询指定公司的年报数据
 * const financial = await getFinancialData(client, {
 *   ts_code: '000001.SZ',
 *   report_type: 4,
 *   start_date: '20200101',
 *   end_date: '20231231'
 * });
 * 
 * console.log(`营业收入: ${financial[0].revenue}`);
 * console.log(`净利润: ${financial[0].net_profit}`);
 * console.log(`每股收益: ${financial[0].eps}`);
 * ```
 * 
 * @example
 * ```typescript
 * // 查询指定报告期的财务数据
 * const financial = await getFinancialData(client, {
 *   ts_code: '000001.SZ',
 *   period: '20231231'
 * });
 * ```
 */
export async function getFinancialData(
  client: TushareClient,
  params?: FinancialParams
): Promise<FinancialItem[]> {
  return client.query<FinancialItem>('income', params as Record<string, unknown>);
}
