/**
 * 交易日历数据模型
 */

/**
 * 交易日历查询参数
 */
export interface TradeCalParams {
  /**
   * 交易所代码
   * SSE: 上交所
   * SZSE: 深交所
   * CFFEX: 中金所
   * SHFE: 上期所
   * CZCE: 郑商所
   * DCE: 大商所
   * INE: 上能源
   */
  exchange?: 'SSE' | 'SZSE' | 'CFFEX' | 'SHFE' | 'CZCE' | 'DCE' | 'INE';

  /**
   * 开始日期 (YYYYMMDD 或 YYYY-MM-DD)
   */
  start_date?: string;

  /**
   * 结束日期 (YYYYMMDD 或 YYYY-MM-DD)
   */
  end_date?: string;

  /**
   * 是否交易
   * 0: 休市
   * 1: 交易
   */
  is_open?: '0' | '1';
}

/**
 * 交易日历数据项
 */
export interface TradeCalItem {
  /**
   * 交易所代码
   */
  exchange: string;

  /**
   * 日历日期 (YYYYMMDD)
   */
  cal_date: string;

  /**
   * 是否交易
   * 0: 休市
   * 1: 交易
   */
  is_open: number;

  /**
   * 上一交易日 (YYYYMMDD)
   */
  pretrade_date?: string;
}
