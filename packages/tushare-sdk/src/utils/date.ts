/**
 * 日期工具函数
 * 
 * 提供 Tushare API 所需的日期格式转换功能
 */

/**
 * 将日期转换为 Tushare 格式 (YYYYMMDD)
 * 
 * @param date - 日期对象、时间戳或 YYYY-MM-DD 格式字符串
 * @returns YYYYMMDD 格式的日期字符串
 * 
 * @example
 * ```typescript
 * formatDate(new Date('2023-12-25')); // '20231225'
 * formatDate('2023-12-25'); // '20231225'
 * formatDate(1703462400000); // '20231225'
 * ```
 */
export function formatDate(date: Date | string | number): string {
  let dateObj: Date;

  if (typeof date === 'string') {
    // 如果已经是 YYYYMMDD 格式,直接返回
    if (/^\d{8}$/.test(date)) {
      return date;
    }
    // 解析 YYYY-MM-DD 格式
    dateObj = new Date(date);
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');

  return `${year}${month}${day}`;
}

/**
 * 解析 Tushare 日期格式 (YYYYMMDD) 为 Date 对象
 * 
 * @param dateStr - YYYYMMDD 格式的日期字符串
 * @returns Date 对象
 * @throws {Error} 如果日期格式无效
 * 
 * @example
 * ```typescript
 * parseDate('20231225'); // Date 对象: 2023-12-25
 * ```
 */
export function parseDate(dateStr: string): Date {
  if (!/^\d{8}$/.test(dateStr)) {
    throw new Error(`Invalid date format: ${dateStr}. Expected YYYYMMDD.`);
  }

  const year = parseInt(dateStr.substring(0, 4), 10);
  const month = parseInt(dateStr.substring(4, 6), 10) - 1; // 月份从 0 开始
  const day = parseInt(dateStr.substring(6, 8), 10);

  const date = new Date(year, month, day);

  // 验证日期有效性
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    throw new Error(`Invalid date: ${dateStr}`);
  }

  return date;
}

/**
 * 验证日期字符串格式
 * 
 * @param dateStr - 日期字符串
 * @returns 是否为有效的 YYYYMMDD 或 YYYY-MM-DD 格式
 * 
 * @example
 * ```typescript
 * isValidDateFormat('20231225'); // true
 * isValidDateFormat('2023-12-25'); // true
 * isValidDateFormat('2023/12/25'); // false
 * ```
 */
export function isValidDateFormat(dateStr: string): boolean {
  return /^\d{8}$/.test(dateStr) || /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}
