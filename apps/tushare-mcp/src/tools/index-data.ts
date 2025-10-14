import type { MCPToolDefinition } from '../types/mcp-tools.types.js';

/**
 * 市场指数数据查询工具定义
 *
 * 该工具允许 AI 客户端查询市场指数行情数据,如上证指数、深证成指、创业板指等
 *
 * @example
 * ```json
 * {
 *   "ts_code": "000001.SH"
 * }
 * ```
 */
export const indexDataTool: MCPToolDefinition = {
  name: 'query_index',
  description:
    '查询市场指数行情数据(如上证指数、深证成指、创业板指等)。返回指数点位、涨跌幅、成交额等数据',
  inputSchema: {
    type: 'object',
    properties: {
      ts_code: {
        type: 'string',
        description:
          '指数代码,格式: 代码.市场后缀。常用指数: 000001.SH(上证指数), 399001.SZ(深证成指), 399006.SZ(创业板指), 000300.SH(沪深300), 000016.SH(上证50)',
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
