import type { TushareClient } from '../client/TushareClient.js';
import type { TradeCalParams, TradeCalItem } from '../models/calendar.js';

/**
 * 获取交易日历
 * 
 * 获取各大交易所的交易日历数据,包括交易日和休市日
 * 
 * @param client - Tushare 客户端实例
 * @param params - 查询参数
 * @returns 交易日历数据列表
 * 
 * @example
 * ```typescript
 * const calendar = await getTradeCalendar(client, {
 *   exchange: 'SSE',
 *   start_date: '20230101',
 *   end_date: '20231231',
 *   is_open: '1' // 仅交易日
 * });
 * ```
 */
export async function getTradeCalendar(
  client: TushareClient,
  params?: TradeCalParams
): Promise<TradeCalItem[]> {
  return client.query<TradeCalItem>('trade_cal', params as Record<string, unknown>);
}
