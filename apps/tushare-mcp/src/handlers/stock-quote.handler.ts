import { z } from 'zod';
import { TushareClient } from '@hestudy/tushare-sdk';
import type { ToolCallResponse, TextContent } from '../types/mcp-tools.types.js';
import { handleTushareError } from '../utils/error-handler.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('info');

/**
 * 股票行情查询参数 schema
 */
const StockQuoteArgsSchema = z.object({
  ts_code: z
    .string()
    .regex(/^\d{6}\.(SH|SZ)$/, '股票代码格式错误,示例: 600519.SH'),
  trade_date: z
    .string()
    .regex(/^\d{8}$/, '交易日期格式错误,示例: 20251014')
    .optional(),
});

/**
 * 股票行情数据类型
 */
interface StockQuoteData {
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
 * 处理股票行情查询请求
 *
 * @param args - 工具调用参数
 * @returns MCP 工具响应,包含文本内容和结构化数据
 * @throws 参数验证失败或 API 调用失败时抛出错误
 */
export async function handleStockQuote(
  args: unknown
): Promise<ToolCallResponse> {
  try {
    // 1. 参数验证
    logger.debug('验证股票行情查询参数', { args });
    const validated = StockQuoteArgsSchema.parse(args);

    // 2. 调用 Tushare SDK
    logger.info('调用 Tushare API 查询股票行情', {
      ts_code: validated.ts_code,
      trade_date: validated.trade_date,
    });

    const client = new TushareClient({
      token: process.env.TUSHARE_TOKEN || '',
    });

    const response = await client.stock.daily({
      ts_code: validated.ts_code,
      trade_date: validated.trade_date,
    });

    // 3. 检查返回数据
    if (!response || !response.items || response.items.length === 0) {
      logger.warn('未找到股票行情数据', { ts_code: validated.ts_code });
      throw new Error('未找到股票行情数据,请检查股票代码或交易日期是否正确');
    }

    const data = response.items[0] as StockQuoteData;

    // 4. 格式化响应
    const text = formatStockQuoteText(data);
    logger.info('股票行情查询成功', { ts_code: validated.ts_code });

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
    logger.error('股票行情查询失败', { error });
    return handleTushareError(error);
  }
}

/**
 * 格式化股票行情数据为文本
 *
 * @param data - 股票行情数据
 * @returns 格式化后的文本描述
 */
function formatStockQuoteText(data: StockQuoteData): string {
  const {
    ts_code,
    trade_date,
    close,
    pct_chg,
    vol,
    amount,
    open,
    high,
    low,
    pre_close,
    change,
  } = data;

  // 格式化日期: 20251014 -> 2025-10-14
  const formattedDate = `${trade_date.slice(0, 4)}-${trade_date.slice(4, 6)}-${trade_date.slice(6, 8)}`;

  // 格式化成交额: 千元 -> 亿元
  const formattedAmount = (amount / 100000).toFixed(2);

  return `股票 ${ts_code} ${formattedDate} 行情:
- 收盘价: ${close.toFixed(2)} 元
- 涨跌额: ${change >= 0 ? '+' : ''}${change.toFixed(2)} 元
- 涨跌幅: ${pct_chg >= 0 ? '+' : ''}${pct_chg.toFixed(2)}%
- 开盘价: ${open.toFixed(2)} 元
- 最高价: ${high.toFixed(2)} 元
- 最低价: ${low.toFixed(2)} 元
- 前收盘: ${pre_close.toFixed(2)} 元
- 成交量: ${vol.toLocaleString()} 手
- 成交额: ${formattedAmount} 亿元`;
}
