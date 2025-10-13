/**
 * 财务数据 API
 * 
 * 提供公司财务报表数据的查询接口
 */

import type { TushareClient } from '../client/TushareClient.js';
import type { FinancialItem, FinancialParams, FinancialQueryParams, IncomeStatementItem, BalanceSheetItem, CashFlowItem } from '../models/financial.js';

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

/**
 * 获取利润表数据
 *
 * @param client - Tushare 客户端实例
 * @param params - 查询参数
 * @returns 利润表数据列表
 * @throws {ApiError} 当参数无效或请求失败时抛出
 *
 * @example
 * ```typescript
 * import { TushareClient } from '@hestudy/tushare-sdk';
 * import { getIncomeStatement } from '@hestudy/tushare-sdk/api/financial';
 *
 * const client = new TushareClient({ token: 'YOUR_TOKEN' });
 * const data = await getIncomeStatement(client, {
 *   ts_code: '000001.SZ',
 *   period: '20231231'
 * });
 * ```
 */
export async function getIncomeStatement(
  client: TushareClient,
  params?: FinancialQueryParams
): Promise<IncomeStatementItem[]> {
  return client.query<IncomeStatementItem>('income', params as Record<string, unknown>);
}

/**
 * 获取资产负债表数据
 *
 * @param client - Tushare 客户端实例
 * @param params - 查询参数
 * @returns 资产负债表数据列表
 * @throws {ApiError} 当参数无效或请求失败时抛出
 *
 * @example
 * ```typescript
 * import { TushareClient } from '@hestudy/tushare-sdk';
 * import { getBalanceSheet } from '@hestudy/tushare-sdk/api/financial';
 *
 * const client = new TushareClient({ token: 'YOUR_TOKEN' });
 * const data = await getBalanceSheet(client, {
 *   ts_code: '000001.SZ',
 *   period: '20231231'
 * });
 * ```
 */
export async function getBalanceSheet(
  client: TushareClient,
  params?: FinancialQueryParams
): Promise<BalanceSheetItem[]> {
  return client.query<BalanceSheetItem>('balancesheet', params as Record<string, unknown>);
}

/**
 * 获取现金流量表数据
 *
 * @param client - Tushare 客户端实例
 * @param params - 查询参数
 * @returns 现金流量表数据列表
 * @throws {ApiError} 当参数无效或请求失败时抛出
 *
 * @example
 * ```typescript
 * import { TushareClient } from '@hestudy/tushare-sdk';
 * import { getCashFlow } from '@hestudy/tushare-sdk/api/financial';
 *
 * const client = new TushareClient({ token: 'YOUR_TOKEN' });
 * const data = await getCashFlow(client, {
 *   ts_code: '000001.SZ',
 *   start_date: '20230101',
 *   end_date: '20231231'
 * });
 * ```
 */
export async function getCashFlow(
  client: TushareClient,
  params?: FinancialQueryParams
): Promise<CashFlowItem[]> {
  return client.query<CashFlowItem>('cashflow', params as Record<string, unknown>);
}
