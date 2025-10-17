/**
 * 测试日期辅助函数
 * 用于生成动态的测试日期,避免硬编码日期导致测试失败
 */

/**
 * 获取今年的第一个交易日期(作为基准日期)
 * @returns YYYY-MM-DD 格式的日期字符串
 */
export function getTestBaseDate(): string {
  const now = new Date();
  // 使用当年的第一个交易日(简化:1月2日作为基准)
  const year = now.getFullYear();
  return `${year}-01-02`;
}

/**
 * 基于基准日期生成测试日期
 * @param offset 天数偏移
 * @returns YYYY-MM-DD 格式的日期字符串
 */
export function getTestDate(offset: number = 0): string {
  const baseDate = new Date(getTestBaseDate());
  baseDate.setDate(baseDate.getDate() + offset);

  const year = baseDate.getFullYear();
  const month = String(baseDate.getMonth() + 1).padStart(2, '0');
  const day = String(baseDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 获取指定数量的连续日期
 * @param count 日期数量
 * @param offset 起始偏移(天)
 * @returns YYYY-MM-DD 格式的日期数组
 */
export function getConsecutiveDates(
  count: number,
  offset: number = 0
): string[] {
  const dates: string[] = [];
  for (let i = 0; i < count; i++) {
    dates.push(getTestDate(offset + i));
  }
  return dates;
}
