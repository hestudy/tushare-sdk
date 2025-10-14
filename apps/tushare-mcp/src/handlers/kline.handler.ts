import { z } from 'zod';
import { TushareClient } from '@hestudy/tushare-sdk';
import type { ToolCallResponse, TextContent } from '../types/mcp-tools.types.js';
import { handleTushareError } from '../utils/error-handler.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('info');

/**
 * K线数据查询参数 schema
 */
const KlineArgsSchema = z.object({
  ts_code: z
    .string()
    .regex(/^\d{6}\.(SH|SZ)$/, '股票代码格式错误,示例: 600519.SH'),
  start_date: z
    .string()
    .regex(/^\d{8}$/, '开始日期格式错误,示例: 20251001'),
  end_date: z
    .string()
    .regex(/^\d{8}$/, '结束日期格式错误,示例: 20251014'),
  freq: z.enum(['D', 'W', 'M']).default('D'),
});

/**
 * K线数据类型
 */
interface KLineData {
  ts_code: string;
  trade_date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  vol?: number;
  amount?: number;
}

/**
 * 处理K线数据查询请求
 *
 * @param args - 工具调用参数
 * @returns MCP 工具响应,包含文本内容和结构化数据
 * @throws 参数验证失败或 API 调用失败时抛出错误
 */
export async function handleKline(args: unknown): Promise<ToolCallResponse> {
  try {
    // 1. 参数验证
    logger.debug('验证K线数据查询参数', { args });
    const validated = KlineArgsSchema.parse(args);

    // 2. 验证日期范围
    const startDate = parseInt(validated.start_date);
    const endDate = parseInt(validated.end_date);

    if (endDate < startDate) {
      throw new Error('结束日期必须晚于或等于开始日期');
    }

    // 验证时间范围不超过10年
    const startYear = Math.floor(startDate / 10000);
    const endYear = Math.floor(endDate / 10000);
    if (endYear - startYear > 10) {
      throw new Error('时间范围超出限制,最多支持查询 10 年历史数据');
    }

    // 3. 调用 Tushare SDK
    logger.info('调用 Tushare API 查询K线数据', {
      ts_code: validated.ts_code,
      start_date: validated.start_date,
      end_date: validated.end_date,
      freq: validated.freq,
    });

    const client = new TushareClient({
      token: process.env.TUSHARE_TOKEN || '',
    });

    const response = await client.stock.daily({
      ts_code: validated.ts_code,
      start_date: validated.start_date,
      end_date: validated.end_date,
    });

    // 4. 检查返回数据
    if (!response || !response.items || response.items.length === 0) {
      logger.warn('未找到K线数据', {
        ts_code: validated.ts_code,
        start_date: validated.start_date,
        end_date: validated.end_date,
      });
      throw new Error('该时间段无交易数据,可能是节假日或停牌期间');
    }

    // 5. 数据处理和聚合
    let klineData = response.items as KLineData[];

    // 按交易日期升序排序
    klineData.sort((a, b) =>
      a.trade_date.localeCompare(b.trade_date)
    );

    // 根据频率聚合数据
    if (validated.freq === 'W') {
      klineData = aggregateToWeekly(klineData);
    } else if (validated.freq === 'M') {
      klineData = aggregateToMonthly(klineData);
    }

    // 6. 格式化响应
    const text = formatKlineText(
      validated.ts_code,
      validated.freq,
      klineData
    );
    logger.info('K线数据查询成功', {
      ts_code: validated.ts_code,
      count: klineData.length,
    });

    return {
      content: [
        {
          type: 'text',
          text,
        } as TextContent,
      ],
      structuredContent: klineData,
    };
  } catch (error) {
    // 7. 错误处理
    logger.error('K线数据查询失败', { error });
    return handleTushareError(error);
  }
}

/**
 * 聚合日线数据为周线
 *
 * @param dailyData - 日线数据数组
 * @returns 周线数据数组
 */
function aggregateToWeekly(dailyData: KLineData[]): KLineData[] {
  const weeklyData: KLineData[] = [];
  let currentWeek: KLineData[] = [];
  let lastWeekKey = '';

  for (const day of dailyData) {
    const date = new Date(
      day.trade_date.slice(0, 4) +
        '-' +
        day.trade_date.slice(4, 6) +
        '-' +
        day.trade_date.slice(6, 8)
    );
    const weekKey = getWeekKey(date);

    if (weekKey !== lastWeekKey && currentWeek.length > 0) {
      weeklyData.push(aggregateKline(currentWeek));
      currentWeek = [];
    }

    currentWeek.push(day);
    lastWeekKey = weekKey;
  }

  if (currentWeek.length > 0) {
    weeklyData.push(aggregateKline(currentWeek));
  }

  return weeklyData;
}

/**
 * 聚合日线数据为月线
 *
 * @param dailyData - 日线数据数组
 * @returns 月线数据数组
 */
function aggregateToMonthly(dailyData: KLineData[]): KLineData[] {
  const monthlyData: KLineData[] = [];
  let currentMonth: KLineData[] = [];
  let lastMonthKey = '';

  for (const day of dailyData) {
    const monthKey = day.trade_date.slice(0, 6); // YYYYMM

    if (monthKey !== lastMonthKey && currentMonth.length > 0) {
      monthlyData.push(aggregateKline(currentMonth));
      currentMonth = [];
    }

    currentMonth.push(day);
    lastMonthKey = monthKey;
  }

  if (currentMonth.length > 0) {
    monthlyData.push(aggregateKline(currentMonth));
  }

  return monthlyData;
}

/**
 * 聚合K线数据
 * 开盘价取第一天,收盘价取最后一天,最高最低取区间极值
 *
 * @param klines - K线数据数组
 * @returns 聚合后的K线数据
 */
function aggregateKline(klines: KLineData[]): KLineData {
  if (klines.length === 0) {
    throw new Error('无法聚合空数据');
  }

  const first = klines[0]!;
  const last = klines[klines.length - 1]!;

  return {
    ts_code: first.ts_code,
    trade_date: last.trade_date, // 使用最后一天的日期
    open: first.open,
    close: last.close,
    high: Math.max(...klines.map((k) => k.high)),
    low: Math.min(...klines.map((k) => k.low)),
    vol: klines.reduce((sum, k) => sum + (k.vol || 0), 0),
    amount: klines.reduce((sum, k) => sum + (k.amount || 0), 0),
  };
}

/**
 * 获取日期所属的周标识
 *
 * @param date - 日期对象
 * @returns 周标识字符串 (YYYY-WW)
 */
function getWeekKey(date: Date): string {
  const year = date.getFullYear();
  const firstDay = new Date(year, 0, 1);
  const dayOfYear =
    Math.floor((date.getTime() - firstDay.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  const weekNumber = Math.ceil(dayOfYear / 7);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

/**
 * 格式化K线数据为文本
 *
 * @param tsCode - 股票代码
 * @param freq - K线频率
 * @param data - K线数据数组
 * @returns 格式化后的文本描述
 */
function formatKlineText(
  tsCode: string,
  freq: string,
  data: KLineData[]
): string {
  if (data.length === 0) {
    return '没有可用的K线数据';
  }

  const freqText = freq === 'D' ? '日线' : freq === 'W' ? '周线' : '月线';
  const first = data[0]!;
  const last = data[data.length - 1]!;

  // 格式化日期
  const formatDate = (dateStr: string) =>
    `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;

  // 计算涨跌幅
  const priceChange = last.close - first.open;
  const priceChangePct = ((priceChange / first.open) * 100).toFixed(2);

  const summary = `股票 ${tsCode} K线数据 (${freqText}):
- 查询区间: ${formatDate(first.trade_date)} 至 ${formatDate(last.trade_date)}
- 数据条数: ${data.length} 条
- 期初价格: ${first.open.toFixed(2)} 元
- 期末价格: ${last.close.toFixed(2)} 元
- 区间涨跌: ${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)} 元 (${priceChangePct >= '0' ? '+' : ''}${priceChangePct}%)
- 区间最高: ${Math.max(...data.map((k) => k.high)).toFixed(2)} 元
- 区间最低: ${Math.min(...data.map((k) => k.low)).toFixed(2)} 元`;

  return summary;
}
