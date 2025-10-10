/**
 * 财务数据模型
 * 
 * 定义公司财务报表相关的数据结构
 */

/**
 * 财务数据项
 * 
 * 表示公司的财务报表数据,包括利润表、资产负债表等关键指标
 * 
 * @example
 * ```typescript
 * const financial: FinancialItem = {
 *   ts_code: '000001.SZ',
 *   end_date: '20231231',
 *   ann_date: '20240430',
 *   report_type: 4,
 *   total_revenue: 189234567890,
 *   revenue: 189234567890,
 *   net_profit: 45678901234,
 *   total_assets: 5678901234567,
 *   total_liabilities: 4567890123456,
 *   total_equity: 1111011111111,
 *   eps: 2.34,
 *   roe: 15.67
 * };
 * ```
 */
export interface FinancialItem {
  /** 股票代码 (如 000001.SZ) */
  ts_code: string;

  /** 报告期 (YYYYMMDD 格式, 如 20231231) */
  end_date: string;

  /** 公告日期 (YYYYMMDD 格式) */
  ann_date: string;

  /**
   * 报告类型
   * - 1: 一季报
   * - 2: 半年报 (中报)
   * - 3: 三季报
   * - 4: 年报
   */
  report_type: 1 | 2 | 3 | 4;

  /** 营业总收入 (元) */
  total_revenue?: number;

  /** 营业收入 (元) */
  revenue?: number;

  /** 净利润 (元) */
  net_profit?: number;

  /** 总资产 (元) */
  total_assets?: number;

  /** 总负债 (元) */
  total_liabilities?: number;

  /** 股东权益 (元) */
  total_equity?: number;

  /** 每股收益 (元/股) */
  eps?: number;

  /** 净资产收益率 (%) */
  roe?: number;
}

/**
 * 财务数据查询参数
 * 
 * 用于查询公司财务报表数据的参数
 * 
 * @example
 * ```typescript
 * // 查询指定公司的年报
 * const params: FinancialParams = {
 *   ts_code: '000001.SZ',
 *   report_type: 4
 * };
 * 
 * // 查询指定时间范围的财务数据
 * const params2: FinancialParams = {
 *   ts_code: '000001.SZ',
 *   start_date: '20200101',
 *   end_date: '20231231'
 * };
 * ```
 */
export interface FinancialParams {
  /** 股票代码 (如 000001.SZ) */
  ts_code?: string;

  /** 报告期 (YYYYMMDD 格式) */
  period?: string;

  /** 开始报告期 (YYYYMMDD 格式) */
  start_date?: string;

  /** 结束报告期 (YYYYMMDD 格式) */
  end_date?: string;

  /**
   * 报告类型
   * - 1: 一季报
   * - 2: 半年报
   * - 3: 三季报
   * - 4: 年报
   */
  report_type?: 1 | 2 | 3 | 4;
}
