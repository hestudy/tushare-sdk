/**
 * 日期格式化工具函数
 * 用于 MCP 服务中的日期显示和转换
 */

/**
 * 将 YYYYMMDD 格式转换为 YYYY-MM-DD
 * @param date - 8位数字字符串 (如 "20251014")
 * @returns 格式化后的日期字符串 (如 "2025-10-14")
 * @example
 * formatDate("20251014") // "2025-10-14"
 */
export function formatDate(date: string): string {
  if (!date || date.length !== 8) {
    return date;
  }
  return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
}

/**
 * 将 YYYY-MM-DD 格式转换为 YYYYMMDD
 * @param date - 带横杠的日期字符串 (如 "2025-10-14")
 * @returns 8位数字字符串 (如 "20251014")
 * @example
 * unformatDate("2025-10-14") // "20251014"
 */
export function unformatDate(date: string): string {
  return date.replace(/-/g, '');
}

/**
 * 获取日期对应的星期几
 * @param date - YYYYMMDD 格式日期字符串
 * @returns 星期几的中文表示 (如 "周一")
 * @example
 * getWeekday("20251014") // "周二"
 */
export function getWeekday(date: string): string {
  const year = parseInt(date.slice(0, 4), 10);
  const month = parseInt(date.slice(4, 6), 10) - 1; // JS Date 月份从 0 开始
  const day = parseInt(date.slice(6, 8), 10);

  const dateObj = new Date(year, month, day);
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  return weekdays[dateObj.getDay()];
}

/**
 * 计算两个日期之间的天数差
 * @param startDate - 开始日期 (YYYYMMDD)
 * @param endDate - 结束日期 (YYYYMMDD)
 * @returns 天数差 (正数表示 endDate 在 startDate 之后)
 * @example
 * getDaysBetween("20251001", "20251014") // 13
 */
export function getDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(
    parseInt(startDate.slice(0, 4), 10),
    parseInt(startDate.slice(4, 6), 10) - 1,
    parseInt(startDate.slice(6, 8), 10)
  );

  const end = new Date(
    parseInt(endDate.slice(0, 4), 10),
    parseInt(endDate.slice(4, 6), 10) - 1,
    parseInt(endDate.slice(6, 8), 10)
  );

  const diffTime = end.getTime() - start.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * 获取今天的日期 (YYYYMMDD 格式)
 * @returns 今天的日期字符串
 * @example
 * getToday() // "20251014"
 */
export function getToday(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}
