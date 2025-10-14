import type { MCPToolDefinition } from '../types/mcp-tools.types.js';

/**
 * 股票基本信息查询工具定义
 *
 * 该工具允许 AI 客户端查询股票基本信息,支持通过股票代码、交易所、上市状态等条件筛选
 *
 * @example
 * ```json
 * {
 *   "ts_code": "600519.SH"
 * }
 * ```
 */
export const stockBasicTool: MCPToolDefinition = {
  name: 'query_stock_basic',
  description:
    '查询股票基本信息,支持通过股票代码、交易所或上市状态筛选。返回股票名称、行业、上市日期等基础属性。',
  inputSchema: {
    type: 'object',
    properties: {
      ts_code: {
        type: 'string',
        description:
          '股票代码,格式: 代码.市场后缀(如 600519.SH 表示上交所, 000001.SZ 表示深交所)',
        pattern: '^\\d{6}\\.(SH|SZ)$',
      },
      exchange: {
        type: 'string',
        description: '交易所代码,用于筛选特定交易所的股票',
        enum: ['SSE', 'SZSE'],
      },
      list_status: {
        type: 'string',
        description: '上市状态,用于筛选上市/退市/暂停上市的股票',
        enum: ['L', 'D', 'P'],
      },
    },
  },
};
