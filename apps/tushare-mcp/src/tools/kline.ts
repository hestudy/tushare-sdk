import type { MCPToolDefinition } from '../types/mcp-tools.types';

/**
 * K线数据查询工具定义
 *
 * 该工具允许 AI 客户端查询历史 K 线数据,支持日线、周线、月线
 *
 * @example
 * ```json
 * {
 *   "ts_code": "600519.SH",
 *   "start_date": "20251001",
 *   "end_date": "20251014",
 *   "freq": "D"
 * }
 * ```
 */
export const klineTool: MCPToolDefinition = {
  name: 'query_kline',
  description:
    '查询历史K线数据(日线、周线、月线),用于技术分析和趋势研究。返回开高低收价格和成交量的时间序列数据',
  inputSchema: {
    type: 'object',
    properties: {
      ts_code: {
        type: 'string',
        description:
          '股票代码,格式: 代码.市场后缀(如 600519.SH 表示上交所, 000001.SZ 表示深交所)',
        pattern: '^\\d{6}\\.(SH|SZ)$',
      },
      start_date: {
        type: 'string',
        description: '开始日期,格式: YYYYMMDD,例如: 20251001',
        pattern: '^\\d{8}$',
      },
      end_date: {
        type: 'string',
        description: '结束日期,格式: YYYYMMDD,必须晚于或等于开始日期,例如: 20251014',
        pattern: '^\\d{8}$',
      },
      freq: {
        type: 'string',
        description: 'K线频率/粒度: D(日线), W(周线), M(月线),默认为日线',
        enum: ['D', 'W', 'M'],
        default: 'D',
      },
    },
    required: ['ts_code', 'start_date', 'end_date'],
  },
};
