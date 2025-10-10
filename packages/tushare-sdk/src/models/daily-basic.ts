/**
 * 每日指标查询参数
 */
export interface DailyBasicParams {
  /**
   * 股票代码
   * 格式: TS代码,如 600230.SH, 000001.SZ
   * 可选,不传则查询所有股票
   */
  ts_code?: string;

  /**
   * 交易日期
   * 格式: YYYYMMDD,如 20181010
   * 与 ts_code 至少传一个
   */
  trade_date?: string;

  /**
   * 开始日期
   * 格式: YYYYMMDD
   * 用于日期范围查询
   */
  start_date?: string;

  /**
   * 结束日期
   * 格式: YYYYMMDD
   * 用于日期范围查询
   */
  end_date?: string;

  /**
   * 指定返回字段
   * 格式: 逗号分隔的字段名,如 'ts_code,trade_date,pe,pb'
   * 可选,不传则返回所有字段
   */
  fields?: string;
}

/**
 * 每日指标数据项
 */
export interface DailyBasicItem {
  /**
   * 股票代码
   * 格式: TS代码,如 600230.SH
   */
  ts_code: string;

  /**
   * 交易日期
   * 格式: YYYYMMDD,如 20181010
   */
  trade_date: string;

  /**
   * 换手率 (%)
   * 定义: 成交量/流通股本 * 100%
   * 可能为空
   */
  turnover_rate?: number;

  /**
   * 换手率(自由流通股) (%)
   * 可能为空
   */
  turnover_rate_f?: number;

  /**
   * 量比
   * 定义: 当日成交量/过去5日平均成交量
   * 可能为空
   */
  volume_ratio?: number;

  /**
   * 市盈率 (总市值/净利润)
   * 亏损时为空
   */
  pe?: number;

  /**
   * 市盈率 (TTM)
   * TTM = Trailing Twelve Months (最近12个月)
   * 亏损时为空
   */
  pe_ttm?: number;

  /**
   * 市净率 (总市值/净资产)
   * 可能为空
   */
  pb?: number;

  /**
   * 市销率 (总市值/营业收入)
   * 可能为空
   */
  ps?: number;

  /**
   * 市销率 (TTM)
   * 可能为空
   */
  ps_ttm?: number;

  /**
   * 股息率 (%)
   * 定义: 每股分红/股价 * 100%
   * 可能为空
   */
  dv_ratio?: number;

  /**
   * 股息率 (TTM) (%)
   * 可能为空
   */
  dv_ttm?: number;

  /**
   * 总股本 (万股)
   * 可能为空
   */
  total_share?: number;

  /**
   * 流通股本 (万股)
   * 可能为空
   */
  float_share?: number;

  /**
   * 自由流通股本 (万股)
   * 定义: 剔除限售股后的流通股本
   * 可能为空
   */
  free_share?: number;

  /**
   * 总市值 (万元)
   * 定义: 总股本 * 收盘价
   * 可能为空
   */
  total_mv?: number;

  /**
   * 流通市值 (万元)
   * 定义: 流通股本 * 收盘价
   * 可能为空
   */
  circ_mv?: number;
}
