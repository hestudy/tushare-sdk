import { z } from 'zod';
import { TushareClient } from '@hestudy/tushare-sdk';
import type { ToolCallResponse, TextContent } from '../types/mcp-tools.types.js';
import { handleTushareError } from '../utils/error-handler.js';
import { createLogger } from '../utils/logger.js';
import { formatDate } from '../utils/date-formatter.js';
import { validateDateRangeWithLimit } from '../utils/date-validator.js';

const logger = createLogger('info');

/**
 * 交易日历查询参数 schema
 */
const TradeCalendarArgsSchema = z.object({
  start_date: z
    .string()
    .regex(/^\d{8}$/, '日期格式错误,示例: 20251014'),
  end_date: z
    .string()
    .regex(/^\d{8}$/, '日期格式错误,示例: 20251014'),
  exchange: z.enum(['SSE', 'SZSE']).optional().default('SSE'),
});

/**
 * 交易日历数据类型
 */
interface TradeCalItem {
  exchange: string;
  cal_date: string;
  is_open: number;
  pretrade_date?: string;
}

/**
 * 处理交易日历查询请求
 *
 * @param args - 工具调用参数
 * @returns MCP 工具响应,包含文本内容和结构化数据
 * @throws 参数验证失败或 API 调用失败时抛出错误
 */
export async function handleTradeCalendar(
  args: unknown
): Promise<ToolCallResponse> {
  try {
    // 1. 参数验证
    logger.debug('验证交易日历查询参数', { args });
    const validated = TradeCalendarArgsSchema.parse(args);

    // 2. 验证日期范围(最多 1 年)
    validateDateRangeWithLimit(validated.start_date, validated.end_date, 365);

    // 3. 调用 Tushare SDK
    logger.info('调用 Tushare API 查询交易日历', validated);

    const client = new TushareClient({
      token: process.env.TUSHARE_TOKEN || '',
    });

    const response = await client.getTradeCalendar(validated);

    // 4. 检查返回数据
    if (!response || response.length === 0) {
      logger.warn('未找到交易日历数据', validated);
      throw new Error('未找到交易日历数据,请检查日期范围是否正确');
    }

    // 5. 判断是单日查询还是范围查询
    const isSingleDay = validated.start_date === validated.end_date;

    if (isSingleDay) {
      // 单日查询
      const data = response[0]!;
      const text = formatSingleDayText(data);
      logger.info('交易日历单日查询成功', { cal_date: data.cal_date });

      return {
        content: [
          {
            type: 'text',
            text,
          } as TextContent,
        ],
        structuredContent: {
          query_type: 'single_day',
          date: data.cal_date,
          is_open: data.is_open,
          exchange: data.exchange,
          pretrade_date: data.pretrade_date,
        },
      };
    } else {
      // 范围查询
      const text = formatDateRangeText(
        response,
        validated.start_date,
        validated.end_date
      );
      logger.info('交易日历范围查询成功', { count: response.length });

      // 统计交易日和休市日
      const tradeDays = response.filter((item) => item.is_open === 1 || item.is_open === '1');
      const closedDays = response.filter((item) => item.is_open === 0 || item.is_open === '0');

      return {
        content: [
          {
            type: 'text',
            text,
          } as TextContent,
        ],
        structuredContent: {
          query_type: 'date_range',
          start_date: validated.start_date,
          end_date: validated.end_date,
          exchange: validated.exchange,
          total_days: response.length,
          trade_days_count: tradeDays.length,
          closed_days_count: closedDays.length,
          trade_days: tradeDays.map((item) => item.cal_date),
          closed_days: closedDays.map((item) => item.cal_date),
          data: response,
        },
      };
    }
  } catch (error) {
    // 6. 错误处理
    logger.error('交易日历查询失败', { error });
    return handleTushareError(error);
  }
}

/**
 * 格式化单日交易日历为文本
 *
 * @param data - 交易日历数据
 * @returns 格式化后的文本描述
 */
function formatSingleDayText(data: TradeCalItem | any): string {
  const { cal_date, is_open, pretrade_date } = data;
  const formattedDate = formatDate(cal_date);
  const isTradeDay = is_open === 1 || is_open === '1';

  if (isTradeDay) {
    let text = `${formattedDate} 是交易日 ✓\n\n交易状态: 正常交易`;
    if (pretrade_date) {
      text += `\n上一交易日: ${formatDate(pretrade_date)}`;
    }
    return text;
  } else {
    // 休市日
    const dayOfWeek = getDayOfWeek(cal_date);
    let reason = '';

    // 判断休市原因
    if (dayOfWeek === '周六' || dayOfWeek === '周日') {
      reason = '周末';
    } else {
      reason = '节假日';
    }

    let text = `${formattedDate} 休市 ✗\n\n休市原因: ${reason}`;
    if (pretrade_date) {
      text += `\n上一交易日: ${formatDate(pretrade_date)}`;
    }

    return text;
  }
}

/**
 * 格式化日期范围交易日历为文本
 *
 * @param data - 交易日历列表
 * @param startDate - 开始日期
 * @param endDate - 结束日期
 * @returns 格式化后的文本描述
 */
function formatDateRangeText(
  data: any[],
  startDate: string,
  _endDate: string
): string {
  const tradeDays = data.filter((item) => item.is_open === 1 || item.is_open === '1');
  const closedDays = data.filter((item) => item.is_open === 0 || item.is_open === '0');

  // 构建标题
  const startFormatted = formatDate(startDate);
  const yearMonth = startFormatted.slice(0, 7); // 提取年月 "2025-10"

  let text = `${yearMonth.replace('-', '年')}月交易日历:\n\n`;

  // 交易日列表
  text += `交易日 (共 ${tradeDays.length} 天):\n`;
  tradeDays.slice(0, 20).forEach((item, index) => {
    const dayOfWeek = getDayOfWeek(item.cal_date);
    text += `${index + 1}. ${formatDate(item.cal_date)} (${dayOfWeek})\n`;
  });

  if (tradeDays.length > 20) {
    text += `...\n${tradeDays.length}. ${formatDate(tradeDays[tradeDays.length - 1]!.cal_date)}`;
  }

  // 休市日列表
  if (closedDays.length > 0) {
    text += `\n\n休市日 (共 ${closedDays.length} 天):\n`;

    // 将连续的休市日合并显示
    const closedRanges = groupConsecutiveDates(closedDays);
    closedRanges.forEach((range) => {
      if (range.length === 1) {
        const dayOfWeek = getDayOfWeek(range[0]!.cal_date);
        text += `- ${formatDate(range[0]!.cal_date)} (${dayOfWeek})\n`;
      } else {
        text += `- ${formatDate(range[0]!.cal_date)} ~ ${formatDate(range[range.length - 1]!.cal_date)}\n`;
      }
    });
  }

  return text;
}

/**
 * 获取日期对应的星期几
 *
 * @param dateStr - 日期字符串 (YYYYMMDD)
 * @returns 星期几的中文描述
 */
function getDayOfWeek(dateStr: string): string {
  const year = parseInt(dateStr.slice(0, 4));
  const month = parseInt(dateStr.slice(4, 6)) - 1;
  const day = parseInt(dateStr.slice(6, 8));
  const date = new Date(year, month, day);
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return days[date.getDay()]!;
}

/**
 * 将连续的日期分组
 *
 * @param items - 交易日历项列表
 * @returns 分组后的日期范围数组
 */
function groupConsecutiveDates(items: any[]): any[][] {
  if (items.length === 0) return [];

  const sorted = [...items].sort((a, b) => a.cal_date.localeCompare(b.cal_date));
  const groups: any[][] = [];
  let currentGroup: any[] = [sorted[0]!];

  for (let i = 1; i < sorted.length; i++) {
    const prevDate = parseInt(sorted[i - 1]!.cal_date);
    const currDate = parseInt(sorted[i]!.cal_date);

    // 检查是否连续(相差 1 天)
    if (currDate - prevDate === 1) {
      currentGroup.push(sorted[i]!);
    } else {
      groups.push(currentGroup);
      currentGroup = [sorted[i]!];
    }
  }

  groups.push(currentGroup);
  return groups;
}
