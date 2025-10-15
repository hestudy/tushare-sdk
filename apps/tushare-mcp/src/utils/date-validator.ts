/**
 * 日期范围验证工具函数
 * 扩展现有 validator.ts 的功能,支持自定义天数限制
 */

import { getDaysBetween } from './date-formatter.js';

/**
 * 验证日期范围并检查天数限制
 * @param startDate - 开始日期 (YYYYMMDD)
 * @param endDate - 结束日期 (YYYYMMDD)
 * @param maxDays - 最大天数限制
 * @returns boolean - 日期范围是否有效
 * @throws Error - 如果日期范围无效
 * @example
 * validateDateRangeWithLimit("20251001", "20251014", 365) // true
 * validateDateRangeWithLimit("20241001", "20251014", 90) // throws Error
 */
export function validateDateRangeWithLimit(
  startDate: string,
  endDate: string,
  maxDays: number
): boolean {
  // 计算天数差
  const days = getDaysBetween(startDate, endDate);

  // 验证结束日期不早于开始日期
  if (days < 0) {
    throw new Error(
      `日期范围错误:起始日期 ${startDate} 晚于结束日期 ${endDate}`
    );
  }

  // 验证天数不超过限制
  if (days > maxDays) {
    throw new Error(
      `查询范围不能超过 ${maxDays} 天,当前范围: ${days} 天。请缩小查询范围。`
    );
  }

  return true;
}

/**
 * 验证交易日历查询的日期范围 (最多 365 天)
 * @param startDate - 开始日期 (YYYYMMDD)
 * @param endDate - 结束日期 (YYYYMMDD)
 * @returns boolean - 日期范围是否有效
 * @throws Error - 如果日期范围无效
 */
export function validateTradeCalendarDateRange(
  startDate: string,
  endDate: string
): boolean {
  return validateDateRangeWithLimit(startDate, endDate, 365);
}

/**
 * 验证技术指标查询的日期范围 (最多 90 天)
 * @param startDate - 开始日期 (YYYYMMDD)
 * @param endDate - 结束日期 (YYYYMMDD)
 * @returns boolean - 日期范围是否有效
 * @throws Error - 如果日期范围无效
 */
export function validateDailyBasicDateRange(
  startDate: string,
  endDate: string
): boolean {
  return validateDateRangeWithLimit(startDate, endDate, 90);
}

/**
 * 检查日期是否为有效的 YYYYMMDD 格式
 * @param date - 日期字符串
 * @returns boolean - 日期格式是否有效
 */
export function isValidDateFormat(date: string): boolean {
  // 检查长度和格式
  if (!/^\d{8}$/.test(date)) {
    return false;
  }

  // 解析年月日
  const year = parseInt(date.slice(0, 4), 10);
  const month = parseInt(date.slice(4, 6), 10);
  const day = parseInt(date.slice(6, 8), 10);

  // 基本范围验证
  if (year < 1990 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  // 使用 Date 对象验证日期有效性
  const dateObj = new Date(year, month - 1, day);
  return (
    dateObj.getFullYear() === year &&
    dateObj.getMonth() === month - 1 &&
    dateObj.getDate() === day
  );
}
