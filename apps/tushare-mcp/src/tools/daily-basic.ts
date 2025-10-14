import type { MCPToolDefinition } from '../types/mcp-tools.types.js';

/**
 * 每日技术指标查询工具定义
 *
 * 该工具允许 AI 客户端查询股票每日技术指标,包括市盈率、市净率、换手率等
 *
 * @example
 * ```json
 * {
 *   "ts_code": "600519.SH",
 *   "trade_date": "20251014"
 * }
 * ```
 */
export const dailyBasicTool: MCPToolDefinition = {
  name: 'query_daily_basic',
  description:
    '查询股票每日技术指标,包括市盈率、市净率、换手率、流通市值等。支持单日查询或日期范围查询。',
  inputSchema: {
    type: 'object',
    properties: {
      ts_code: {
        type: 'string',
        description:
          '股票代码,格式: 代码.市场后缀(如 600519.SH 表示上交所, 000001.SZ 表示深交所)。必填参数。',
        pattern: '^\\d{6}\\.(SH|SZ)$',
      },
      trade_date: {
        type: 'string',
        description:
          '单日查询:指定交易日期,格式 YYYYMMDD。与 start_date/end_date 二选一。',
        pattern: '^\\d{8}$',
      },
      start_date: {
        type: 'string',
        description:
          '范围查询:开始日期,格式 YYYYMMDD。必须与 end_date 配合使用。',
        pattern: '^\\d{8}$',
      },
      end_date: {
        type: 'string',
        description:
          '范围查询:结束日期,格式 YYYYMMDD。必须与 start_date 配合使用。',
        pattern: '^\\d{8}$',
      },
    },
    required: ['ts_code'],
  },
};
