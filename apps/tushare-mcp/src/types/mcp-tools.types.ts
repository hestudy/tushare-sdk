/**
 * JSON Schema 类型定义
 */
export type JSONSchema = {
  type: string;
  properties?: Record<string, unknown>;
  required?: string[];
  [key: string]: unknown;
};

/**
 * MCP 工具定义
 * 符合 Model Context Protocol 规范的工具接口定义
 */
export interface MCPToolDefinition {
  /** 工具唯一标识符,使用 snake_case 命名 */
  name: string;
  /** 工具功能描述,向 AI 解释用途 */
  description: string;
  /** 输入参数的 JSON Schema 定义 */
  inputSchema: JSONSchema;
}

/**
 * MCP 工具调用请求
 * AI 客户端发起的工具调用请求
 */
export interface ToolCallRequest {
  /** 固定值 "tools/call" */
  method: 'tools/call';
  /** 请求参数 */
  params: {
    /** 要调用的工具名称 */
    name: string;
    /** 工具输入参数 */
    arguments: Record<string, unknown>;
  };
}

/**
 * 文本内容结构
 * 用于返回给用户的文本信息
 */
export interface TextContent {
  /** 固定值 "text" */
  type: 'text';
  /** 文本内容 */
  text: string;
}

/**
 * 工具调用响应
 * 工具执行成功后返回的结构化响应
 */
export interface ToolCallResponse {
  /** 文本内容数组,向用户展示 */
  content: TextContent[];
  /** 结构化数据,供 AI 编程式处理 */
  structuredContent?: unknown;
  /** 是否为错误响应 */
  isError?: boolean;
}

/**
 * 错误分类代码
 * 用于标识不同类型的错误场景
 */
export type ErrorCode =
  | 'AUTH_ERROR' // Tushare Token 无效或过期
  | 'RATE_LIMIT' // 触发频率限制
  | 'DATA_NOT_FOUND' // 数据不存在
  | 'NETWORK_ERROR' // 网络超时或服务不可用
  | 'VALIDATION_ERROR'; // 参数格式错误

/**
 * 工具调用错误响应
 * 工具执行失败时返回的错误响应
 */
export interface ToolErrorResponse extends ToolCallResponse {
  /** 固定值 true,标识为错误响应 */
  isError: true;
  /** 错误分类代码 */
  errorCode?: ErrorCode;
}

/**
 * 服务器配置
 * MCP 服务器的运行时配置
 */
export interface ServerConfig {
  /** Tushare API Token (必填) */
  tushareToken: string;
  /** 日志级别 (可选,默认: info) */
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  /** 限流:时间窗口内最大请求数 (可选,默认: 100) */
  rateLimitMaxRequests: number;
  /** 限流:时间窗口大小(毫秒) (可选,默认: 60000) */
  rateLimitWindowMs: number;
  /** Tushare API 请求超时(毫秒) (可选,默认: 30000) */
  requestTimeoutMs: number;
}

/**
 * 股票行情数据
 * 从 Tushare SDK 获取的股票实时行情数据
 */
export interface StockQuoteData {
  ts_code: string;
  trade_date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  pre_close: number;
  change: number;
  pct_chg: number;
  vol: number;
  amount: number;
}

/**
 * 财务数据 - 利润表
 */
export interface FinancialIncomeData {
  ts_code: string;
  end_date: string;
  total_revenue: number;
  revenue: number;
  operate_profit: number;
  total_profit: number;
  n_income: number;
  gross_margin: number;
}

/**
 * 财务数据 - 资产负债表
 */
export interface FinancialBalanceSheetData {
  ts_code: string;
  end_date: string;
  total_assets: number;
  total_cur_assets: number;
  total_liab: number;
  total_hldr_eqy_exc_min_int: number;
}

/**
 * 财务数据 - 现金流量表
 */
export interface FinancialCashFlowData {
  ts_code: string;
  end_date: string;
  n_cashflow_act: number;
  n_cashflow_inv_act: number;
  n_cash_flows_fnc_act: number;
}

/**
 * K 线数据点
 * 历史 K 线时间序列数据点
 */
export interface KLineDataPoint {
  ts_code: string;
  trade_date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  vol: number;
  amount: number;
}

/**
 * 市场指数数据
 */
export interface IndexData {
  ts_code: string;
  trade_date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  pre_close: number;
  change: number;
  pct_chg: number;
  vol: number;
  amount: number;
}
