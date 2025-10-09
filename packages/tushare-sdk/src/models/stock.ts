/**
 * 股票基础信息
 */
export interface StockBasicItem {
  /** 股票代码 (如 000001.SZ) */
  ts_code: string;

  /** 股票简称 (如 000001) */
  symbol: string;

  /** 股票名称 (如 平安银行) */
  name: string;

  /** 地域 */
  area: string;

  /** 行业 */
  industry: string;

  /** 上市日期 (YYYYMMDD) */
  list_date: string;

  /** 上市状态: L上市 D退市 P暂停上市 */
  list_status?: 'L' | 'D' | 'P';

  /** 交易所: SSE上交所 SZSE深交所 */
  exchange?: 'SSE' | 'SZSE';
}

/**
 * 股票基础信息查询参数
 */
export interface StockBasicParams {
  /** 股票代码 */
  ts_code?: string;

  /** 上市状态 */
  list_status?: 'L' | 'D' | 'P';

  /** 交易所 */
  exchange?: 'SSE' | 'SZSE';
}
