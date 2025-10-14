import type { MCPToolDefinition } from '../types/mcp-tools.types';

/**
 * 股票行情查询工具定义
 *
 * 该工具允许 AI 客户端查询实时股票行情数据,支持 A 股股票代码
 *
 * @example
 * ```json
 * {
 *   "ts_code": "600519.SH",
 *   "trade_date": "20251014"
 * }
 * ```
 */
export const stockQuoteTool: MCPToolDefinition = {
  name: 'query_stock_quote',
  description:
    '查询实时股票行情数据,支持A股股票代码(如 600519.SH 贵州茅台)。返回包括最新价、涨跌幅、成交量等行情数据',
  inputSchema: {
    type: 'object',
    properties: {
      ts_code: {
        type: 'string',
        description:
          '股票代码,格式: 代码.市场后缀(如 600519.SH 表示上交所, 000001.SZ 表示深交所)',
        pattern: '^\\d{6}\\.(SH|SZ)$',
      },
      trade_date: {
        type: 'string',
        description:
          '交易日期,格式: YYYYMMDD。可选,默认查询最新交易日数据',
        pattern: '^\\d{8}$',
      },
    },
    required: ['ts_code'],
  },
};
