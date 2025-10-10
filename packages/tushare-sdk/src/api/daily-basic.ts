import type { TushareClient } from '../client/TushareClient.js';
import type { DailyBasicParams, DailyBasicItem } from '../models/daily-basic.js';

/**
 * 获取每日指标
 * 
 * 获取全部股票每日重要的基本面指标,可用于选股分析、报表展示等。
 * 包括换手率、市盈率、市净率、市销率、股息率、总股本、流通股本、总市值、流通市值等。
 * 
 * **权限要求**: 至少 2000 积分
 * 
 * **数据限制**: 单次请求最多返回 6000 条数据。如果需要更多数据,请使用日期范围分页查询。
 * 
 * **更新时间**: 交易日每日 15:00-17:00 之间
 * 
 * @param client - Tushare 客户端实例
 * @param params - 查询参数
 * @returns 每日指标数据列表
 * 
 * @example
 * ```typescript
 * // 获取指定日期所有股票的每日指标
 * const data = await getDailyBasic(client, {
 *   trade_date: '20180726'
 * });
 * 
 * // 获取指定股票的历史每日指标
 * const stockData = await getDailyBasic(client, {
 *   ts_code: '600230.SH',
 *   start_date: '20180101',
 *   end_date: '20181231'
 * });
 * 
 * // 自定义返回字段,减少数据传输量
 * const customData = await getDailyBasic(client, {
 *   trade_date: '20180726',
 *   fields: 'ts_code,trade_date,pe,pb'
 * });
 * 
 * // 查询特定股票特定日期
 * const singleData = await getDailyBasic(client, {
 *   ts_code: '600230.SH',
 *   trade_date: '20180726'
 * });
 * ```
 * 
 * @see https://tushare.pro/document/2?doc_id=32
 */
export async function getDailyBasic(
  client: TushareClient,
  params?: DailyBasicParams
): Promise<DailyBasicItem[]> {
  return client.query<DailyBasicItem>('daily_basic', params as Record<string, unknown>);
}
