import { z } from 'zod';
import { TushareClient } from '@hestudy/tushare-sdk';
import type { ToolCallResponse, TextContent } from '../types/mcp-tools.types.js';
import { handleTushareError } from '../utils/error-handler.js';
import { createLogger } from '../utils/logger.js';
import { formatDate } from '../utils/date-formatter.js';
import { formatSmallDecimal, convertWanToYi } from '../utils/number-formatter.js';
import { validateDateRangeWithLimit } from '../utils/date-validator.js';

const logger = createLogger('info');

/**
 * 每日技术指标查询参数 schema
 */
const DailyBasicArgsSchema = z
  .object({
    ts_code: z
      .string()
      .regex(/^\d{6}\.(SH|SZ)$/, '股票代码格式错误,示例: 600519.SH'),
    trade_date: z
      .string()
      .regex(/^\d{8}$/, '日期格式错误,示例: 20251014')
      .optional(),
    start_date: z
      .string()
      .regex(/^\d{8}$/, '日期格式错误,示例: 20251001')
      .optional(),
    end_date: z
      .string()
      .regex(/^\d{8}$/, '日期格式错误,示例: 20251031')
      .optional(),
  })
  .refine(
    (data) => {
      // trade_date 与 (start_date + end_date) 二选一
      const hasTrade = !!data.trade_date;
      const hasRange = !!data.start_date || !!data.end_date;

      if (hasTrade && hasRange) {
        return false; // 不能同时提供
      }

      if (!hasTrade && !hasRange) {
        return false; // 必须提供其中一个
      }

      // 如果是范围查询,start_date 和 end_date 必须同时提供
      if (hasRange && (!data.start_date || !data.end_date)) {
        return false;
      }

      return true;
    },
    {
      message:
        'trade_date 与 (start_date + end_date) 不能同时提供,请选择单日查询或范围查询',
    }
  );

/**
 * 每日技术指标数据类型
 */
interface DailyBasicData {
  ts_code: string;
  trade_date: string;
  close: number;
  turnover_rate?: number;
  turnover_rate_f?: number;
  volume_ratio?: number;
  pe?: number | null;
  pe_ttm?: number | null;
  pb?: number | null;
  ps?: number | null;
  ps_ttm?: number | null;
  dv_ratio?: number;
  dv_ttm?: number;
  total_share: number;
  float_share?: number;
  free_share?: number;
  total_mv: number;
  circ_mv?: number;
}

/**
 * 处理每日技术指标查询请求
 *
 * @param args - 工具调用参数
 * @returns MCP 工具响应,包含文本内容和结构化数据
 * @throws 参数验证失败或 API 调用失败时抛出错误
 */
export async function handleDailyBasic(
  args: unknown
): Promise<ToolCallResponse> {
  try {
    // 1. 参数验证
    logger.debug('验证每日技术指标查询参数', { args });
    const validated = DailyBasicArgsSchema.parse(args);

    // 2. 如果是范围查询,验证日期范围(最多 3 个月)
    if (validated.start_date && validated.end_date) {
      validateDateRangeWithLimit(validated.start_date, validated.end_date, 90);
    }

    // 3. 调用 Tushare SDK
    logger.info('调用 Tushare API 查询每日技术指标', validated);

    const client = new TushareClient({
      token: process.env.TUSHARE_TOKEN || '',
    });

    const response = await client.getDailyBasic(validated);

    // 4. 检查返回数据
    if (!response || response.length === 0) {
      logger.warn('未找到每日技术指标数据', validated);

      // 特殊提示:可能是非交易日
      if (validated.trade_date) {
        throw new Error(
          `${formatDate(validated.trade_date)} 为非交易日,无技术指标数据。\n\n提示: 可使用 query_trade_calendar 工具查询交易日历。`
        );
      } else {
        throw new Error('未找到技术指标数据,请检查日期范围是否包含交易日');
      }
    }

    // 5. 判断是单日查询还是范围查询
    const isSingleDay = validated.trade_date || response.length === 1;

    if (isSingleDay) {
      // 单日查询
      const data = response[0] as DailyBasicData;
      const text = formatSingleDayText(data);
      logger.info('每日技术指标单日查询成功', { ts_code: data.ts_code });

      return {
        content: [
          {
            type: 'text',
            text,
          } as TextContent,
        ],
        structuredContent: data,
      };
    } else {
      // 范围查询
      const text = formatDateRangeText(response as DailyBasicData[]);
      logger.info('每日技术指标范围查询成功', { count: response.length });

      return {
        content: [
          {
            type: 'text',
            text,
          } as TextContent,
        ],
        structuredContent: response,
      };
    }
  } catch (error) {
    // 6. 错误处理
    logger.error('每日技术指标查询失败', { error });
    return handleTushareError(error);
  }
}

/**
 * 格式化单日技术指标为文本
 *
 * @param data - 技术指标数据
 * @returns 格式化后的文本描述
 */
function formatSingleDayText(data: DailyBasicData): string {
  const {
    ts_code,
    trade_date,
    pe,
    pb,
    ps,
    turnover_rate,
    turnover_rate_f,
    volume_ratio,
    total_share,
    float_share,
    total_mv,
    circ_mv,
  } = data;

  // 提取股票名称 (如果需要,可以从 stock_basic 查询)
  const stockName = ts_code; // 简化处理,直接显示代码

  let text = `${stockName} ${formatDate(trade_date)} 技术指标:\n\n`;

  // 估值指标
  text += `估值指标:\n`;
  text += `- 市盈率(PE): ${formatValueOrNA(pe)} 倍\n`;
  text += `- 市净率(PB): ${formatValueOrNA(pb)} 倍\n`;
  if (ps != null) {
    text += `- 市销率(PS): ${formatValueOrNA(ps)} 倍\n`;
  }

  // 市值指标
  text += `\n市值指标:\n`;
  text += `- 总市值: ${convertWanToYi(total_mv)} 亿元\n`;
  if (circ_mv != null) {
    text += `- 流通市值: ${convertWanToYi(circ_mv)} 亿元\n`;
  }

  // 交易指标
  text += `\n交易指标:\n`;
  if (turnover_rate != null) {
    text += `- 换手率: ${formatSmallDecimal(turnover_rate)}%\n`;
  }
  if (turnover_rate_f != null) {
    text += `- 换手率(自由流通): ${formatSmallDecimal(turnover_rate_f)}%\n`;
  }
  if (volume_ratio != null) {
    text += `- 量比: ${formatSmallDecimal(volume_ratio)}\n`;
  }

  // 股本信息
  text += `\n股本信息:\n`;
  text += `- 总股本: ${formatSmallDecimal(total_share / 10000)} 亿股\n`;
  if (float_share != null) {
    text += `- 流通股本: ${formatSmallDecimal(float_share / 10000)} 亿股\n`;
  }

  // 特殊提示:新股
  if (pe == null || pe === 0 || pb == null || pb === 0) {
    text += `\n提示:该股部分估值指标暂无数据(可能为新股或其他原因)。`;
  }

  return text;
}

/**
 * 格式化日期范围技术指标为文本
 *
 * @param data - 技术指标列表
 * @returns 格式化后的文本描述
 */
function formatDateRangeText(data: DailyBasicData[]): string {
  if (data.length === 0) return '';

  const firstItem = data[0]!;
  const stockName = firstItem.ts_code;

  // 提取日期范围
  const dates = data.map((item) => item.trade_date).sort();
  const startDate = dates[0]!;
  const endDate = dates[dates.length - 1]!;

  let text = `${stockName} ${formatDate(startDate)} ~ ${formatDate(endDate)} 技术指标趋势:\n\n`;
  text += `共 ${data.length} 个交易日数据:\n\n`;

  // 表格形式显示(最多显示前 10 条)
  text += `日期          | PE(倍) | PB(倍) | 换手率(%) | 总市值(亿元)\n`;
  text += `-------------|--------|--------|-----------|-------------\n`;

  const displayData = data.slice(0, 10);
  displayData.forEach((item) => {
    const date = formatDate(item.trade_date).padEnd(12);
    const pe = formatValueOrNA(item.pe, 2).padEnd(6);
    const pb = formatValueOrNA(item.pb, 2).padEnd(6);
    const turnover = item.turnover_rate != null ? formatSmallDecimal(item.turnover_rate).padEnd(9) : 'N/A'.padEnd(9);
    const mv = convertWanToYi(item.total_mv);

    text += `${date} | ${pe} | ${pb} | ${turnover} | ${mv}\n`;
  });

  if (data.length > 10) {
    text += `...\n`;
    const lastItem = data[data.length - 1]!;
    text += `${formatDate(lastItem.trade_date).padEnd(12)} | ${formatValueOrNA(lastItem.pe, 2).padEnd(6)} | ${formatValueOrNA(lastItem.pb, 2).padEnd(6)} | ${formatSmallDecimal(lastItem.turnover_rate ?? 0).padEnd(9)} | ${convertWanToYi(lastItem.total_mv)}\n`;
  }

  // 统计摘要
  text += `\n统计摘要:\n`;

  // 计算均值
  const validPE = data.filter((item) => item.pe != null && item.pe > 0).map((item) => item.pe!);
  const validPB = data.filter((item) => item.pb != null && item.pb > 0).map((item) => item.pb!);
  const validTurnover = data.filter((item) => item.turnover_rate != null).map((item) => item.turnover_rate!);
  const validMV = data.map((item) => item.total_mv);

  if (validPE.length > 0) {
    const avgPE = validPE.reduce((sum, val) => sum + val, 0) / validPE.length;
    text += `- PE 均值: ${formatSmallDecimal(avgPE)} 倍\n`;
  }

  if (validPB.length > 0) {
    const avgPB = validPB.reduce((sum, val) => sum + val, 0) / validPB.length;
    text += `- PB 均值: ${formatSmallDecimal(avgPB)} 倍\n`;
  }

  if (validTurnover.length > 0) {
    const avgTurnover = validTurnover.reduce((sum, val) => sum + val, 0) / validTurnover.length;
    text += `- 平均换手率: ${formatSmallDecimal(avgTurnover)}%\n`;
  }

  if (validMV.length > 0) {
    const avgMV = validMV.reduce((sum, val) => sum + val, 0) / validMV.length;
    text += `- 平均总市值: ${convertWanToYi(avgMV)} 亿元\n`;
  }

  return text;
}

/**
 * 格式化数值或显示 N/A
 *
 * @param value - 数值
 * @param decimals - 小数位数
 * @returns 格式化后的字符串
 */
function formatValueOrNA(value: number | null | undefined, _decimals = 2): string {
  if (value == null || value === 0) {
    return 'N/A';
  }
  return formatSmallDecimal(value);
}
