import { z } from 'zod';

/**
 * 股票代码格式验证
 * 格式: 6位数字 + "." + 市场后缀(SH/SZ)
 * 示例: 600519.SH, 000001.SZ
 */
export const stockCodeSchema = z
  .string()
  .regex(
    /^\d{6}\.(SH|SZ)$/,
    '股票代码格式错误,应为:6位数字.市场后缀(如 600519.SH 或 000001.SZ)'
  );

/**
 * 交易日期格式验证
 * 格式: YYYYMMDD (8位数字)
 * 示例: 20251014
 */
export const tradeDateSchema = z
  .string()
  .regex(
    /^\d{8}$/,
    '交易日期格式错误,应为:YYYYMMDD(8位数字,如 20251014)'
  )
  .refine(
    (date) => {
      // 验证日期是否有效
      const year = parseInt(date.substring(0, 4), 10);
      const month = parseInt(date.substring(4, 6), 10);
      const day = parseInt(date.substring(6, 8), 10);

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
    },
    { message: '日期无效,请检查年月日是否正确' }
  );

/**
 * 报告期格式验证
 * 格式: YYYYMMDD,且月份必须是季度末(03/06/09/12),日期必须是31
 * 示例: 20231231, 20230331
 */
export const periodSchema = z
  .string()
  .regex(
    /^\d{4}(03|06|09|12)31$/,
    '报告期格式错误,应为:YYYY(03|06|09|12)31(如 20231231 表示2023年报)'
  );

/**
 * 指数代码格式验证
 * 格式: 6位数字 + "." + 市场后缀(SH/SZ)
 * 示例: 000001.SH(上证指数), 399001.SZ(深证成指)
 */
export const indexCodeSchema = z
  .string()
  .regex(
    /^\d{6}\.(SH|SZ)$/,
    '指数代码格式错误,应为:6位数字.市场后缀(如 000001.SH 或 399001.SZ)'
  );

/**
 * K线频率验证
 * 可选值: daily(日线), weekly(周线), monthly(月线)
 */
export const klineFreqSchema = z.enum(['daily', 'weekly', 'monthly'], {
  errorMap: () => ({
    message:
      'K线频率参数错误,可选值: daily(日线), weekly(周线), monthly(月线)',
  }),
});

/**
 * 财务报表类型验证
 * 可选值: income(利润表), balance(资产负债表), cashflow(现金流量表)
 */
export const reportTypeSchema = z.enum(
  ['income', 'balance', 'cashflow'],
  {
    errorMap: () => ({
      message:
        '报表类型参数错误,可选值: income(利润表), balance(资产负债表), cashflow(现金流量表)',
    }),
  }
);

/**
 * 验证日期范围
 * 确保 end_date >= start_date
 *
 * @param startDate 开始日期(YYYYMMDD)
 * @param endDate 结束日期(YYYYMMDD)
 * @returns boolean 日期范围是否有效
 * @throws Error 如果日期范围无效
 */
export function validateDateRange(
  startDate: string,
  endDate: string
): boolean {
  const start = parseInt(startDate, 10);
  const end = parseInt(endDate, 10);

  if (end < start) {
    throw new Error(
      `日期范围错误:结束日期 ${endDate} 早于开始日期 ${startDate}`
    );
  }

  // 验证时间跨度不超过 10 年
  const startYear = parseInt(startDate.substring(0, 4), 10);
  const endYear = parseInt(endDate.substring(0, 4), 10);

  if (endYear - startYear > 10) {
    throw new Error(
      '日期范围超过 10 年限制,请缩小查询范围以获得更好的性能'
    );
  }

  return true;
}

/**
 * 股票行情查询参数 Schema
 */
export const stockQuoteParamsSchema = z.object({
  ts_code: stockCodeSchema,
  trade_date: tradeDateSchema.optional(),
});

/**
 * 财务数据查询参数 Schema
 */
export const financialParamsSchema = z.object({
  ts_code: stockCodeSchema,
  period: periodSchema,
  report_type: reportTypeSchema,
});

/**
 * K线数据查询参数 Schema
 */
export const klineParamsSchema = z
  .object({
    ts_code: stockCodeSchema,
    start_date: tradeDateSchema,
    end_date: tradeDateSchema,
    freq: klineFreqSchema.default('daily'),
  })
  .refine(
    (data) => {
      try {
        validateDateRange(data.start_date, data.end_date);
        return true;
      } catch {
        return false;
      }
    },
    {
      message: '日期范围无效:结束日期必须晚于或等于开始日期,且跨度不超过10年',
    }
  );

/**
 * 市场指数查询参数 Schema
 */
export const indexParamsSchema = z.object({
  ts_code: indexCodeSchema,
  trade_date: tradeDateSchema.optional(),
});
