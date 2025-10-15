import type { MCPToolDefinition } from '../types/mcp-tools.types.js';

/**
 * 交易日历查询工具定义
 *
 * 该工具允许 AI 客户端查询交易所交易日历,判断指定日期是否为交易日
 *
 * @example
 * ```json
 * {
 *   "start_date": "20251014",
 *   "end_date": "20251014"
 * }
 * ```
 */
export const tradeCalendarTool: MCPToolDefinition = {
  name: 'query_trade_calendar',
  description:
    '查询交易所交易日历,判断指定日期是否为交易日,或查询指定时间段内的所有交易日列表。沪深两市交易日历相同。',
  inputSchema: {
    type: 'object',
    properties: {
      start_date: {
        type: 'string',
        description:
          '开始日期,格式: YYYYMMDD。与 end_date 配合使用,查询日期范围内的交易日历。',
        pattern: '^\\d{8}$',
      },
      end_date: {
        type: 'string',
        description:
          '结束日期,格式: YYYYMMDD。与 start_date 配合使用,查询日期范围内的交易日历。',
        pattern: '^\\d{8}$',
      },
      exchange: {
        type: 'string',
        description:
          '交易所代码,默认 SSE(上交所)。沪深两市交易日历相同,通常不需要修改。',
        enum: ['SSE', 'SZSE'],
      },
    },
    required: ['start_date', 'end_date'],
  },
};
