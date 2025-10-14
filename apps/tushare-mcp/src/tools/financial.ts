import type { MCPToolDefinition } from '../types/mcp-tools.types';

/**
 * 财务数据查询工具定义
 *
 * 该工具允许 AI 客户端查询公司财务报表数据,支持利润表、资产负债表、现金流量表
 *
 * @example
 * ```json
 * {
 *   "ts_code": "600519.SH",
 *   "period": "20231231",
 *   "report_type": "income"
 * }
 * ```
 */
export const financialTool: MCPToolDefinition = {
  name: 'query_financial',
  description:
    '查询公司财务报表数据,支持利润表(income)、资产负债表(balance)、现金流量表(cashflow)。可分析公司盈利能力、偿债能力和现金流状况',
  inputSchema: {
    type: 'object',
    properties: {
      ts_code: {
        type: 'string',
        description:
          '股票代码,格式: 代码.市场后缀(如 600519.SH 表示上交所, 000001.SZ 表示深交所)',
        pattern: '^\\d{6}\\.(SH|SZ)$',
      },
      period: {
        type: 'string',
        description:
          '报告期,格式: YYYYMMDD,通常为季度末日期(0331/0630/0930/1231),例如: 20231231',
        pattern: '^\\d{4}(0331|0630|0930|1231)$',
      },
      report_type: {
        type: 'string',
        description:
          '报表类型: income(利润表), balance(资产负债表), cashflow(现金流量表)',
        enum: ['income', 'balance', 'cashflow'],
      },
    },
    required: ['ts_code', 'period', 'report_type'],
  },
};
