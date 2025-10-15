import type { DailyQuote, ExportFormat } from '../types/index.js';

/**
 * 日期格式转换：YYYY-MM-DD → YYYYMMDD
 * @param date YYYY-MM-DD 格式的日期
 * @returns YYYYMMDD 格式的日期
 */
export function formatDateToTushare(date: string): string {
  return date.replace(/-/g, '');
}

/**
 * 日期格式转换：YYYYMMDD → YYYY-MM-DD
 * @param date YYYYMMDD 格式的日期
 * @returns YYYY-MM-DD 格式的日期
 */
export function formatDateFromTushare(date: string): string {
  if (!date || date.length !== 8) {
    return date;
  }
  return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
}

/**
 * 验证股票代码格式
 * @param tsCode 股票代码
 * @returns 是否有效
 */
export function validateStockCode(tsCode: string): boolean {
  const pattern = /^\d{6}\.(SH|SZ)$/;
  return pattern.test(tsCode);
}

/**
 * 验证日期格式 YYYY-MM-DD
 * @param date 日期字符串
 * @returns 是否有效
 */
export function validateDate(date: string): boolean {
  const pattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!pattern.test(date)) {
    return false;
  }

  const [year, month, day] = date.split('-').map(Number);
  const d = new Date(year, month - 1, day);

  return (
    d.getFullYear() === year &&
    d.getMonth() === month - 1 &&
    d.getDate() === day
  );
}

/**
 * 格式化行情数据为 CSV
 * @param quotes 行情数据数组
 * @returns CSV 字符串
 */
export function formatQuotesToCSV(quotes: DailyQuote[]): string {
  if (quotes.length === 0) {
    return '';
  }

  // CSV 表头
  const headers = [
    'ts_code',
    'trade_date',
    'open',
    'high',
    'low',
    'close',
    'pre_close',
    'change',
    'pct_chg',
    'vol',
    'amount',
  ];

  // CSV 数据行
  const rows = quotes.map((quote) => [
    quote.tsCode,
    quote.tradeDate,
    quote.open ?? '',
    quote.high ?? '',
    quote.low ?? '',
    quote.close ?? '',
    quote.preClose ?? '',
    quote.change ?? '',
    quote.pctChg ?? '',
    quote.vol ?? '',
    quote.amount ?? '',
  ]);

  // 组合表头和数据
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * 格式化行情数据为 JSON
 * @param quotes 行情数据数组
 * @returns JSON 字符串
 */
export function formatQuotesToJSON(quotes: DailyQuote[]): string {
  return JSON.stringify(quotes, null, 2);
}

/**
 * 导出数据为指定格式
 * @param quotes 行情数据数组
 * @param format 导出格式
 * @returns 格式化后的字符串
 */
export function exportQuotes(
  quotes: DailyQuote[],
  format: ExportFormat
): string {
  switch (format) {
    case 'csv':
      return formatQuotesToCSV(quotes);
    case 'json':
      return formatQuotesToJSON(quotes);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

/**
 * 获取今天的日期 YYYY-MM-DD
 * @returns 今天的日期
 */
export function getToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 获取指定天数前的日期 YYYY-MM-DD
 * @param days 天数
 * @returns 日期
 */
export function getDaysAgo(days: number): string {
  const now = new Date();
  now.setDate(now.getDate() - days);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 获取指定年份的起止日期
 * @param year 年份
 * @returns { start: YYYYMMDD, end: YYYYMMDD }
 */
export function getYearRange(year: number): { start: string; end: string } {
  return {
    start: `${year}0101`,
    end: `${year}1231`,
  };
}

/**
 * 别名：formatDateToTushare 的简写版本
 */
export const formatToTushareDate = formatDateToTushare;

/**
 * 检查指定日期是否为交易日
 * @param date 日期 YYYY-MM-DD
 * @param emit 事件触发器 (可选，用于自动触发日历更新)
 * @returns Promise<boolean> 是否为交易日
 */
export async function checkTradeCalendar(
  date: string,
  emit?: any
): Promise<boolean> {
  const { db } = await import('./database.js');

  // 先查询数据库
  const isTradeDay = db.isTradeDay(date);

  // 如果数据库中有记录，直接返回
  if (isTradeDay !== undefined && isTradeDay !== null) {
    // 注意：SQLite 返回 0 表示 false，1 表示 true
    // isTradeDay 方法已经处理了这个转换
    return isTradeDay;
  }

  // 如果数据库中没有记录，需要触发日历更新
  const year = new Date(date).getFullYear();

  // 触发日历更新事件 (如果提供了 emit 函数)
  if (emit) {
    await emit({
      topic: 'calendar.update.needed',
      data: {
        startYear: year,
        endYear: year,
      },
    });
  }

  // 返回 false，因为当前没有数据
  // 下次检查时，如果日历已更新，就能得到正确的结果
  return false;
}

/**
 * 检测日历数据是否缺失指定年份
 * @param year 年份
 * @returns Promise<boolean> 是否缺失
 */
export async function isCalendarYearMissing(year: number): Promise<boolean> {
  const { db } = await import('./database.js');

  // 检查该年份的1月1日数据是否存在
  const janFirst = `${year}-01-01`;
  const hasData = db.isTradeDay(janFirst);

  // 如果返回 undefined 或 null，说明没有数据
  return hasData === undefined || hasData === null;
}

/**
 * 自动检测并触发缺失年份的日历更新
 * @param emit 事件触发器
 * @returns Promise<void>
 */
export async function autoUpdateMissingCalendarYears(emit: any): Promise<void> {
  const currentYear = new Date().getFullYear();

  // 检查当前年份及前后各1年的数据
  const yearsToCheck = [currentYear - 1, currentYear, currentYear + 1];

  for (const year of yearsToCheck) {
    const isMissing = await isCalendarYearMissing(year);

    if (isMissing) {
      // 触发更新事件
      await emit({
        topic: 'calendar.update.needed',
        data: {
          startYear: year,
          endYear: year,
        },
      });
    }
  }
}
