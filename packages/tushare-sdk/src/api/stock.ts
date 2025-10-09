import type { TushareClient } from '../client/TushareClient.js';
import type { StockBasicItem, StockBasicParams } from '../models/stock.js';

/**
 * 获取股票基础信息
 * 
 * @param client - Tushare 客户端实例
 * @param params - 查询参数
 * @returns 股票基础信息列表
 * 
 * @example
 * ```typescript
 * const stocks = await getStockBasic(client, {
 *   list_status: 'L',
 *   exchange: 'SSE'
 * });
 * ```
 */
export async function getStockBasic(
  client: TushareClient,
  params?: StockBasicParams
): Promise<StockBasicItem[]> {
  return client.query<StockBasicItem>('stock_basic', params as Record<string, unknown>);
}
