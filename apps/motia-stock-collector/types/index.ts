/**
 * 交易日历数据类型
 */
export interface TradeCalendar {
  /** 日期，格式 YYYY-MM-DD */
  calDate: string;
  /** 交易所代码 */
  exchange: 'SSE' | 'SZSE';
  /** 是否开盘 1=开盘 0=休市 */
  isOpen: 0 | 1;
  /** 上一交易日，格式 YYYY-MM-DD */
  pretradeDate: string | null;
  /** 记录创建时间 ISO 8601 */
  createdAt: string;
}

/**
 * 日线行情数据类型
 */
export interface DailyQuote {
  /** 自增主键 */
  id: number;
  /** 股票代码，如 600519.SH */
  tsCode: string;
  /** 交易日期，格式 YYYY-MM-DD */
  tradeDate: string;
  /** 开盘价 */
  open: number | null;
  /** 最高价 */
  high: number | null;
  /** 最低价 */
  low: number | null;
  /** 收盘价 */
  close: number | null;
  /** 昨收价 */
  preClose: number | null;
  /** 涨跌额 */
  change: number | null;
  /** 涨跌幅 (百分比) */
  pctChg: number | null;
  /** 成交量 (手) */
  vol: number | null;
  /** 成交额 (千元) */
  amount: number | null;
  /** 记录创建时间 ISO 8601 */
  createdAt: string;
}

/**
 * 任务执行日志类型
 */
export interface TaskLog {
  /** 自增主键 */
  id: number;
  /** 任务名称 */
  taskName: string;
  /** 任务开始时间 ISO 8601 */
  startTime: string;
  /** 任务结束时间 ISO 8601 */
  endTime: string | null;
  /** 任务状态 */
  status: 'SUCCESS' | 'FAILED';
  /** 处理的记录数 */
  recordsCount: number;
  /** 错误信息 (失败时) */
  errorMessage: string | null;
  /** 记录创建时间 ISO 8601 */
  createdAt: string;
}

/**
 * 查询行情数据的筛选条件
 */
export interface QueryQuotesFilters {
  /** 股票代码 (可选) */
  tsCode?: string;
  /** 开始日期 YYYY-MM-DD (可选) */
  startDate?: string;
  /** 结束日期 YYYY-MM-DD (可选) */
  endDate?: string;
  /** 返回记录数限制 (可选) */
  limit?: number;
}

/**
 * 查询任务日志的筛选条件
 */
export interface QueryTaskLogsFilters {
  /** 任务名称 (可选) */
  taskName?: string;
  /** 任务状态 (可选) */
  status?: 'SUCCESS' | 'FAILED';
  /** 开始时间 ISO 8601 (可选) */
  startTime?: string;
  /** 结束时间 ISO 8601 (可选) */
  endTime?: string;
  /** 返回记录数限制 (默认 100) */
  limit?: number;
  /** 页码 (用于分页, 默认 1) */
  page?: number;
}

/**
 * 数据导出格式
 */
export type ExportFormat = 'csv' | 'json';

/**
 * Tushare API 响应数据类型
 */
export interface TushareResponse<T> {
  code: number;
  msg: string | null;
  data: {
    fields: string[];
    items: any[][];
    has_more: boolean;
  };
}

/**
 * 数据采集事件数据
 */
export interface CollectionEvent {
  /** 交易日期 YYYY-MM-DD */
  tradeDate: string;
}

/**
 * 数据采集完成事件数据
 */
export interface CollectionCompleteEvent {
  /** 交易日期 YYYY-MM-DD */
  tradeDate: string;
  /** 采集的记录数 */
  count: number;
}
