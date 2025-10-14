import { z } from 'zod';
import { TushareClient } from '@hestudy/tushare-sdk';
import type { ToolCallResponse, TextContent } from '../types/mcp-tools.types';
import { handleTushareError } from '../utils/error-handler';
import { createLogger } from '../utils/logger';

const logger = createLogger('info');

/**
 * 指数数据查询参数 schema
 */
const IndexDataArgsSchema = z.object({
  ts_code: z
    .string()
    .regex(/^\d{6}\.(SH|SZ)$/, '指数代码格式错误,示例: 000001.SH'),
  trade_date: z
    .string()
    .regex(/^\d{8}$/, '交易日期格式错误,示例: 20251014')
    .optional(),
});

/**
 * 指数数据类型
 */
interface IndexData {
  ts_code: string;
  trade_date: string;
  close: number;
  open?: number;
  high?: number;
  low?: number;
  pre_close?: number;
  change?: number;
  pct_chg?: number;
  vol?: number;
  amount?: number;
}

/**
 * 常用指数名称映射
 */
const INDEX_NAMES: Record<string, string> = {
  '000001.SH': '上证指数',
  '399001.SZ': '深证成指',
  '399006.SZ': '创业板指',
  '000300.SH': '沪深300',
  '000016.SH': '上证50',
  '000905.SH': '中证500',
  '399005.SZ': '中小板指',
  '000688.SH': '科创50',
};

/**
 * 处理指数数据查询请求
 *
 * @param args - 工具调用参数
 * @returns MCP 工具响应,包含文本内容和结构化数据
 * @throws 参数验证失败或 API 调用失败时抛出错误
 */
export async function handleIndexData(
  args: unknown
): Promise<ToolCallResponse> {
  try {
    // 1. 参数验证
    logger.debug('验证指数数据查询参数', { args });
    const validated = IndexDataArgsSchema.parse(args);

    // 2. 调用 Tushare SDK
    logger.info('调用 Tushare API 查询指数数据', {
      ts_code: validated.ts_code,
      trade_date: validated.trade_date,
    });

    const client = new TushareClient({
      token: process.env.TUSHARE_TOKEN || '',
    });

    const response = await client.index.daily({
      ts_code: validated.ts_code,
      trade_date: validated.trade_date,
    });

    // 3. 检查返回数据
    if (!response || !response.items || response.items.length === 0) {
      logger.warn('未找到指数数据', {
        ts_code: validated.ts_code,
        trade_date: validated.trade_date,
      });
      throw new Error('未找到该指数的行情数据,请检查指数代码是否正确');
    }

    const data = response.items[0] as IndexData;

    // 4. 格式化响应
    const text = formatIndexText(data);
    logger.info('指数数据查询成功', { ts_code: validated.ts_code });

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
    logger.error('指数数据查询失败', { error });
    return handleTushareError(error);
  }
}

/**
 * 格式化指数数据为文本
 *
 * @param data - 指数数据
 * @returns 格式化后的文本描述
 */
function formatIndexText(data: IndexData): string {
  const {
    ts_code,
    trade_date,
    close,
    open,
    high,
    low,
    pre_close,
    change,
    pct_chg,
    vol,
    amount,
  } = data;

  // 获取指数名称
  const indexName = INDEX_NAMES[ts_code] || ts_code;

  // 格式化日期: 20251014 -> 2025-10-14
  const formattedDate = `${trade_date.slice(0, 4)}-${trade_date.slice(4, 6)}-${trade_date.slice(6, 8)}`;

  // 格式化成交额: 千元 -> 亿元
  const formattedAmount = amount ? (amount / 100000).toFixed(2) : 'N/A';

  // 构建基础信息
  let text = `指数 ${indexName} (${ts_code}) ${formattedDate} 行情:
- 收盘点位: ${close.toFixed(2)}`;

  // 添加涨跌信息(如果有)
  if (change !== undefined && pct_chg !== undefined) {
    text += `
- 涨跌点数: ${change >= 0 ? '+' : ''}${change.toFixed(2)}
- 涨跌幅: ${pct_chg >= 0 ? '+' : ''}${pct_chg.toFixed(2)}%`;
  }

  // 添加开高低收(如果有)
  if (open !== undefined && high !== undefined && low !== undefined) {
    text += `
- 开盘点位: ${open.toFixed(2)}
- 最高点位: ${high.toFixed(2)}
- 最低点位: ${low.toFixed(2)}`;
  }

  // 添加前收盘(如果有)
  if (pre_close !== undefined) {
    text += `
- 前收盘: ${pre_close.toFixed(2)}`;
  }

  // 添加成交量和成交额(如果有)
  if (vol !== undefined) {
    text += `
- 成交量: ${vol.toLocaleString()} 手`;
  }

  if (amount !== undefined) {
    text += `
- 成交额: ${formattedAmount} 亿元`;
  }

  return text;
}
