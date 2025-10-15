/**
 * 数值格式化工具函数
 * 用于 MCP 服务中的数值显示和转换
 */

/**
 * 格式化价格 (保留 2 位小数)
 * @param price - 价格数值
 * @returns 格式化后的价格字符串
 * @example
 * formatPrice(1800.5) // "1800.50"
 * formatPrice(null) // "N/A"
 */
export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) {
    return 'N/A';
  }
  return price.toFixed(2);
}

/**
 * 格式化百分比 (保留 2 位小数,带符号)
 * @param percent - 百分比数值
 * @returns 格式化后的百分比字符串
 * @example
 * formatPercent(2.35) // "+2.35%"
 * formatPercent(-1.45) // "-1.45%"
 * formatPercent(null) // "N/A"
 */
export function formatPercent(percent: number | null | undefined): string {
  if (percent === null || percent === undefined) {
    return 'N/A';
  }
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
}

/**
 * 格式化百分比 (无符号版本)
 * @param percent - 百分比数值
 * @returns 格式化后的百分比字符串
 * @example
 * formatPercentNoSign(2.35) // "2.35%"
 * formatPercentNoSign(null) // "N/A"
 */
export function formatPercentNoSign(
  percent: number | null | undefined
): string {
  if (percent === null || percent === undefined) {
    return 'N/A';
  }
  return `${percent.toFixed(2)}%`;
}

/**
 * 格式化大数值 (添加千分位分隔符)
 * @param num - 数值
 * @returns 格式化后的字符串
 * @example
 * formatLargeNumber(1234567) // "1,234,567"
 * formatLargeNumber(null) // "N/A"
 */
export function formatLargeNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) {
    return 'N/A';
  }
  return num.toLocaleString('en-US');
}

/**
 * 将万元转换为亿元 (保留 2 位小数)
 * @param wan - 万元单位的数值
 * @returns 亿元单位的字符串
 * @example
 * convertWanToYi(22612420) // "2261.24"
 * convertWanToYi(null) // "N/A"
 */
export function convertWanToYi(wan: number | null | undefined): string {
  if (wan === null || wan === undefined) {
    return 'N/A';
  }
  return (wan / 10000).toFixed(2);
}

/**
 * 将千元转换为亿元 (保留 2 位小数)
 * @param qian - 千元单位的数值
 * @returns 亿元单位的字符串
 * @example
 * convertQianToYi(500000) // "5.00"
 * convertQianToYi(null) // "N/A"
 */
export function convertQianToYi(qian: number | null | undefined): string {
  if (qian === null || qian === undefined) {
    return 'N/A';
  }
  return (qian / 100000).toFixed(2);
}

/**
 * 将万股转换为亿股 (保留 2 位小数)
 * @param wan - 万股单位的数值
 * @returns 亿股单位的字符串
 * @example
 * convertShareWanToYi(125619) // "12.56"
 * convertShareWanToYi(null) // "N/A"
 */
export function convertShareWanToYi(wan: number | null | undefined): string {
  if (wan === null || wan === undefined) {
    return 'N/A';
  }
  return (wan / 10000).toFixed(2);
}

/**
 * 格式化倍数 (如市盈率、市净率)
 * @param ratio - 倍数值
 * @returns 格式化后的字符串
 * @example
 * formatRatio(35.60) // "35.60"
 * formatRatio(0) // "N/A (亏损或无效)"
 * formatRatio(null) // "N/A"
 * formatRatio(-5.20) // "N/A (亏损)"
 */
export function formatRatio(ratio: number | null | undefined): string {
  if (ratio === null || ratio === undefined) {
    return 'N/A';
  }

  // PE/PB 为 0 或负数时显示为无效
  if (ratio === 0) {
    return 'N/A (亏损或无效)';
  }

  if (ratio < 0) {
    return 'N/A (亏损)';
  }

  return ratio.toFixed(2);
}

/**
 * 格式化量比、换手率等小数值 (保留 2 位小数)
 * @param value - 数值
 * @returns 格式化后的字符串
 * @example
 * formatSmallDecimal(1.15) // "1.15"
 * formatSmallDecimal(null) // "N/A"
 */
export function formatSmallDecimal(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  return value.toFixed(2);
}
