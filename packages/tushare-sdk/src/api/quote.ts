import type { TushareClient } from '../client/TushareClient.js';
import type { DailyQuoteItem, DailyQuoteParams } from '../models/quote.js';

/**
 * 获取日线行情数据
 * 
 * @param client - Tushare 客户端实例
 * @param params - 查询参数
 * @returns 日线行情数据列表
 * 
 * @example
 * ```typescript
 * const quotes = await getDailyQuote(client, {
 *   ts_code: '000001.SZ',
 *   start_date: '20230101',
 *   end_date: '20231231'
 * });
 * ```
 */
export async function getDailyQuote(
  client: TushareClient,
  params: DailyQuoteParams
): Promise<DailyQuoteItem[]> {
  return client.query<DailyQuoteItem>('daily', params as Record<string, unknown>);
}
