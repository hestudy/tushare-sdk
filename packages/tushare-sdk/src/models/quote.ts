/**
 * 日线行情数据
 */
export interface DailyQuoteItem {
  /** 股票代码 */
  ts_code: string;

  /** 交易日期 (YYYYMMDD) */
  trade_date: string;

  /** 开盘价 */
  open: number;

  /** 最高价 */
  high: number;

  /** 最低价 */
  low: number;

  /** 收盘价 */
  close: number;

  /** 昨收价 */
  pre_close: number;

  /** 涨跌额 */
  change: number;

  /** 涨跌幅 (%) */
  pct_chg: number;

  /** 成交量 (手) */
  vol: number;

  /** 成交额 (千元) */
  amount: number;
}

/**
 * 日线行情查询参数
 */
export interface DailyQuoteParams {
  /** 股票代码 */
  ts_code?: string;

  /** 交易日期 (YYYYMMDD 或 YYYY-MM-DD) */
  trade_date?: string;

  /** 开始日期 */
  start_date?: string;

  /** 结束日期 */
  end_date?: string;
}
