import { z } from 'zod';
import { TushareClient } from '@hestudy/tushare-sdk';
import type { ToolCallResponse, TextContent } from '../types/mcp-tools.types.js';
import { handleTushareError } from '../utils/error-handler.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('info');

/**
 * 财务数据查询参数 schema
 */
const FinancialArgsSchema = z.object({
  ts_code: z
    .string()
    .regex(/^\d{6}\.(SH|SZ)$/, '股票代码格式错误,示例: 600519.SH'),
  period: z
    .string()
    .regex(
      /^\d{4}(0331|0630|0930|1231)$/,
      '报告期格式错误,必须为季度末日期,示例: 20231231'
    ),
  report_type: z.enum(['income', 'balance', 'cashflow'], {
    errorMap: () => ({ message: '报表类型错误,可选: income, balance, cashflow' }),
  }),
});

/**
 * 利润表数据类型
 */
interface IncomeData {
  ts_code: string;
  end_date: string;
  total_revenue?: number;
  revenue?: number;
  operate_profit?: number;
  total_profit?: number;
  n_income?: number;
  gross_margin?: number;
}

/**
 * 资产负债表数据类型
 */
interface BalanceData {
  ts_code: string;
  end_date: string;
  total_assets?: number;
  total_cur_assets?: number;
  total_liab?: number;
  total_hldr_eqy_exc_min_int?: number;
}

/**
 * 现金流量表数据类型
 */
interface CashflowData {
  ts_code: string;
  end_date: string;
  n_cashflow_act?: number;
  n_cashflow_inv_act?: number;
  n_cash_flows_fnc_act?: number;
}

/**
 * 处理财务数据查询请求
 *
 * @param args - 工具调用参数
 * @returns MCP 工具响应,包含文本内容和结构化数据
 * @throws 参数验证失败或 API 调用失败时抛出错误
 */
export async function handleFinancial(
  args: unknown
): Promise<ToolCallResponse> {
  try {
    // 1. 参数验证
    logger.debug('验证财务数据查询参数', { args });
    const validated = FinancialArgsSchema.parse(args);

    // 2. 调用 Tushare SDK
    logger.info('调用 Tushare API 查询财务数据', {
      ts_code: validated.ts_code,
      period: validated.period,
      report_type: validated.report_type,
    });

    const client = new TushareClient({
      token: process.env.TUSHARE_TOKEN || '',
    });

    // 3. 根据报表类型路由到不同的 API
    let response: any;
    let data: IncomeData | BalanceData | CashflowData;
    let text: string;

    switch (validated.report_type) {
      case 'income':
        response = await client.stock.income({
          ts_code: validated.ts_code,
          period: validated.period,
        });
        if (!response || !response.items || response.items.length === 0) {
          logger.warn('未找到利润表数据', {
            ts_code: validated.ts_code,
            period: validated.period,
          });
          throw new Error('该报告期数据暂未披露,请选择已披露的报告期');
        }
        data = response.items[0] as IncomeData;
        text = formatIncomeText(data);
        break;

      case 'balance':
        response = await client.stock.balancesheet({
          ts_code: validated.ts_code,
          period: validated.period,
        });
        if (!response || !response.items || response.items.length === 0) {
          logger.warn('未找到资产负债表数据', {
            ts_code: validated.ts_code,
            period: validated.period,
          });
          throw new Error('该报告期数据暂未披露,请选择已披露的报告期');
        }
        data = response.items[0] as BalanceData;
        text = formatBalanceText(data);
        break;

      case 'cashflow':
        response = await client.stock.cashflow({
          ts_code: validated.ts_code,
          period: validated.period,
        });
        if (!response || !response.items || response.items.length === 0) {
          logger.warn('未找到现金流量表数据', {
            ts_code: validated.ts_code,
            period: validated.period,
          });
          throw new Error('该报告期数据暂未披露,请选择已披露的报告期');
        }
        data = response.items[0] as CashflowData;
        text = formatCashflowText(data);
        break;
    }

    // 4. 格式化响应
    logger.info('财务数据查询成功', {
      ts_code: validated.ts_code,
      report_type: validated.report_type,
    });

    return {
      content: [
        {
          type: 'text',
          text,
        } as TextContent,
      ],
      structuredContent: data,
    };
  } catch (error) {
    // 5. 错误处理
    logger.error('财务数据查询失败', { error });
    return handleTushareError(error);
  }
}

/**
 * 格式化利润表数据为文本
 *
 * @param data - 利润表数据
 * @returns 格式化后的文本描述
 */
function formatIncomeText(data: IncomeData): string {
  const { ts_code, end_date, total_revenue, revenue, operate_profit, total_profit, n_income, gross_margin } = data;

  // 格式化日期: 20231231 -> 2023年年报
  const year = end_date.slice(0, 4);
  const month = end_date.slice(4, 6);
  const periodText =
    month === '12'
      ? `${year}年年报`
      : month === '03'
        ? `${year}年一季报`
        : month === '06'
          ? `${year}年半年报`
          : `${year}年三季报`;

  // 金额单位转换: 元 -> 亿元
  const formatAmount = (amount?: number) =>
    amount ? (amount / 100000000).toFixed(2) : 'N/A';

  return `股票 ${ts_code} ${periodText} 利润表:
- 营业总收入: ${formatAmount(total_revenue)} 亿元
- 营业收入: ${formatAmount(revenue)} 亿元
- 营业利润: ${formatAmount(operate_profit)} 亿元
- 利润总额: ${formatAmount(total_profit)} 亿元
- 净利润: ${formatAmount(n_income)} 亿元
- 毛利率: ${gross_margin ? gross_margin.toFixed(2) + '%' : 'N/A'}`;
}

/**
 * 格式化资产负债表数据为文本
 *
 * @param data - 资产负债表数据
 * @returns 格式化后的文本描述
 */
function formatBalanceText(data: BalanceData): string {
  const { ts_code, end_date, total_assets, total_cur_assets, total_liab, total_hldr_eqy_exc_min_int } = data;

  // 格式化日期
  const year = end_date.slice(0, 4);
  const month = end_date.slice(4, 6);
  const periodText =
    month === '12'
      ? `${year}年年报`
      : month === '03'
        ? `${year}年一季报`
        : month === '06'
          ? `${year}年半年报`
          : `${year}年三季报`;

  // 金额单位转换
  const formatAmount = (amount?: number) =>
    amount ? (amount / 100000000).toFixed(2) : 'N/A';

  // 计算资产负债率
  const debtRatio =
    total_assets && total_liab
      ? ((total_liab / total_assets) * 100).toFixed(2) + '%'
      : 'N/A';

  return `股票 ${ts_code} ${periodText} 资产负债表:
- 总资产: ${formatAmount(total_assets)} 亿元
- 流动资产: ${formatAmount(total_cur_assets)} 亿元
- 负债合计: ${formatAmount(total_liab)} 亿元
- 股东权益: ${formatAmount(total_hldr_eqy_exc_min_int)} 亿元
- 资产负债率: ${debtRatio}`;
}

/**
 * 格式化现金流量表数据为文本
 *
 * @param data - 现金流量表数据
 * @returns 格式化后的文本描述
 */
function formatCashflowText(data: CashflowData): string {
  const { ts_code, end_date, n_cashflow_act, n_cashflow_inv_act, n_cash_flows_fnc_act } = data;

  // 格式化日期
  const year = end_date.slice(0, 4);
  const month = end_date.slice(4, 6);
  const periodText =
    month === '12'
      ? `${year}年年报`
      : month === '03'
        ? `${year}年一季报`
        : month === '06'
          ? `${year}年半年报`
          : `${year}年三季报`;

  // 金额单位转换,带正负号
  const formatAmount = (amount?: number) => {
    if (!amount) return 'N/A';
    const value = (amount / 100000000).toFixed(2);
    return amount >= 0 ? `+${value}` : value;
  };

  return `股票 ${ts_code} ${periodText} 现金流量表:
- 经营活动现金流: ${formatAmount(n_cashflow_act)} 亿元
- 投资活动现金流: ${formatAmount(n_cashflow_inv_act)} 亿元
- 筹资活动现金流: ${formatAmount(n_cash_flows_fnc_act)} 亿元`;
}
