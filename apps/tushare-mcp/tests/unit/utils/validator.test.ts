import { describe, it, expect } from 'vitest';
import {
  stockCodeSchema,
  tradeDateSchema,
  periodSchema,
  indexCodeSchema,
  klineFreqSchema,
  reportTypeSchema,
  validateDateRange,
  stockQuoteParamsSchema,
  financialParamsSchema,
  klineParamsSchema,
  indexParamsSchema,
} from '../../../src/utils/validator.js';

describe('validator.ts - 基础 Schema', () => {
  describe('stockCodeSchema', () => {
    it('应接受有效的股票代码', () => {
      expect(stockCodeSchema.parse('600519.SH')).toBe('600519.SH');
      expect(stockCodeSchema.parse('000001.SZ')).toBe('000001.SZ');
      expect(stockCodeSchema.parse('123456.SH')).toBe('123456.SH');
    });

    it('应拒绝无效的股票代码', () => {
      expect(() => stockCodeSchema.parse('60051.SH')).toThrow(); // 少于6位
      expect(() => stockCodeSchema.parse('6005191.SH')).toThrow(); // 多于6位
      expect(() => stockCodeSchema.parse('600519')).toThrow(); // 缺少市场后缀
      expect(() => stockCodeSchema.parse('600519.BJ')).toThrow(); // 无效市场后缀
      expect(() => stockCodeSchema.parse('abcdef.SH')).toThrow(); // 非数字
    });
  });

  describe('tradeDateSchema', () => {
    it('应接受有效的交易日期', () => {
      expect(tradeDateSchema.parse('20251014')).toBe('20251014');
      expect(tradeDateSchema.parse('20200229')).toBe('20200229'); // 闰年
      expect(tradeDateSchema.parse('19900101')).toBe('19900101');
    });

    it('应拒绝无效的交易日期格式', () => {
      expect(() => tradeDateSchema.parse('2025-10-14')).toThrow(); // 错误格式
      expect(() => tradeDateSchema.parse('202510')).toThrow(); // 太短
      expect(() => tradeDateSchema.parse('202510141')).toThrow(); // 太长
    });

    it('应拒绝无效的日期值', () => {
      expect(() => tradeDateSchema.parse('20251301')).toThrow(); // 无效月份
      expect(() => tradeDateSchema.parse('20250132')).toThrow(); // 无效日期
      expect(() => tradeDateSchema.parse('20210229')).toThrow(); // 非闰年2月29日
      expect(() => tradeDateSchema.parse('18891231')).toThrow(); // 年份太早
      expect(() => tradeDateSchema.parse('21010101')).toThrow(); // 年份太晚
    });
  });

  describe('periodSchema', () => {
    it('应接受有效的报告期', () => {
      expect(periodSchema.parse('20231231')).toBe('20231231'); // 年报
      expect(periodSchema.parse('20230331')).toBe('20230331'); // 一季报
      expect(periodSchema.parse('20230631')).toBe('20230631'); // 半年报
      expect(periodSchema.parse('20230931')).toBe('20230931'); // 三季报
    });

    it('应拒绝无效的报告期', () => {
      expect(() => periodSchema.parse('20230131')).toThrow(); // 非季度末
      expect(() => periodSchema.parse('20230630')).toThrow(); // 应该是 31 号
      expect(() => periodSchema.parse('20230431')).toThrow(); // 4月不是季度末
      expect(() => periodSchema.parse('20231230')).toThrow(); // 应该是 31 号
    });
  });

  describe('indexCodeSchema', () => {
    it('应接受有效的指数代码', () => {
      expect(indexCodeSchema.parse('000001.SH')).toBe('000001.SH');
      expect(indexCodeSchema.parse('399001.SZ')).toBe('399001.SZ');
    });

    it('应拒绝无效的指数代码', () => {
      expect(() => indexCodeSchema.parse('00001.SH')).toThrow();
      expect(() => indexCodeSchema.parse('000001')).toThrow();
      expect(() => indexCodeSchema.parse('000001.BJ')).toThrow();
    });
  });

  describe('klineFreqSchema', () => {
    it('应接受有效的K线频率', () => {
      expect(klineFreqSchema.parse('daily')).toBe('daily');
      expect(klineFreqSchema.parse('weekly')).toBe('weekly');
      expect(klineFreqSchema.parse('monthly')).toBe('monthly');
    });

    it('应拒绝无效的K线频率', () => {
      expect(() => klineFreqSchema.parse('hourly')).toThrow();
      expect(() => klineFreqSchema.parse('yearly')).toThrow();
      expect(() => klineFreqSchema.parse('invalid')).toThrow();
    });
  });

  describe('reportTypeSchema', () => {
    it('应接受有效的报表类型', () => {
      expect(reportTypeSchema.parse('income')).toBe('income');
      expect(reportTypeSchema.parse('balance')).toBe('balance');
      expect(reportTypeSchema.parse('cashflow')).toBe('cashflow');
    });

    it('应拒绝无效的报表类型', () => {
      expect(() => reportTypeSchema.parse('profit')).toThrow();
      expect(() => reportTypeSchema.parse('statement')).toThrow();
      expect(() => reportTypeSchema.parse('invalid')).toThrow();
    });
  });
});

describe('validator.ts - validateDateRange', () => {
  it('应接受有效的日期范围', () => {
    expect(validateDateRange('20230101', '20231231')).toBe(true);
    expect(validateDateRange('20230101', '20230101')).toBe(true); // 同一天
  });

  it('应拒绝结束日期早于开始日期', () => {
    expect(() => validateDateRange('20231231', '20230101')).toThrow(
      /结束日期.*早于开始日期/
    );
  });

  it('应拒绝超过10年的日期范围', () => {
    expect(() => validateDateRange('20100101', '20210101')).toThrow(
      /日期范围超过 10 年限制/
    );
  });

  it('应接受10年以内的日期范围', () => {
    expect(validateDateRange('20150101', '20241231')).toBe(true); // 9年多
  });
});

describe('validator.ts - 参数 Schema', () => {
  describe('stockQuoteParamsSchema', () => {
    it('应接受有效的股票行情参数', () => {
      const params = {
        ts_code: '600519.SH',
        trade_date: '20251014',
      };
      expect(stockQuoteParamsSchema.parse(params)).toEqual(params);
    });

    it('应接受没有 trade_date 的参数', () => {
      const params = {
        ts_code: '600519.SH',
      };
      expect(stockQuoteParamsSchema.parse(params)).toEqual(params);
    });

    it('应拒绝无效的股票代码', () => {
      expect(() =>
        stockQuoteParamsSchema.parse({
          ts_code: 'invalid',
          trade_date: '20251014',
        })
      ).toThrow();
    });

    it('应拒绝无效的交易日期', () => {
      expect(() =>
        stockQuoteParamsSchema.parse({
          ts_code: '600519.SH',
          trade_date: 'invalid',
        })
      ).toThrow();
    });
  });

  describe('financialParamsSchema', () => {
    it('应接受有效的财务数据参数', () => {
      const params = {
        ts_code: '600519.SH',
        period: '20231231',
        report_type: 'income' as const,
      };
      expect(financialParamsSchema.parse(params)).toEqual(params);
    });

    it('应拒绝无效的报告期', () => {
      expect(() =>
        financialParamsSchema.parse({
          ts_code: '600519.SH',
          period: '20230131',
          report_type: 'income',
        })
      ).toThrow();
    });

    it('应拒绝无效的报表类型', () => {
      expect(() =>
        financialParamsSchema.parse({
          ts_code: '600519.SH',
          period: '20231231',
          report_type: 'invalid',
        })
      ).toThrow();
    });
  });

  describe('klineParamsSchema', () => {
    it('应接受有效的K线参数', () => {
      const params = {
        ts_code: '600519.SH',
        start_date: '20230101',
        end_date: '20231231',
        freq: 'daily' as const,
      };
      expect(klineParamsSchema.parse(params)).toEqual(params);
    });

    it('应使用默认频率 daily', () => {
      const params = {
        ts_code: '600519.SH',
        start_date: '20230101',
        end_date: '20231231',
      };
      const result = klineParamsSchema.parse(params);
      expect(result.freq).toBe('daily');
    });

    it('应拒绝结束日期早于开始日期', () => {
      expect(() =>
        klineParamsSchema.parse({
          ts_code: '600519.SH',
          start_date: '20231231',
          end_date: '20230101',
          freq: 'daily',
        })
      ).toThrow();
    });

    it('应拒绝超过10年的日期范围', () => {
      expect(() =>
        klineParamsSchema.parse({
          ts_code: '600519.SH',
          start_date: '20100101',
          end_date: '20210101',
          freq: 'daily',
        })
      ).toThrow();
    });
  });

  describe('indexParamsSchema', () => {
    it('应接受有效的指数参数', () => {
      const params = {
        ts_code: '000001.SH',
        trade_date: '20251014',
      };
      expect(indexParamsSchema.parse(params)).toEqual(params);
    });

    it('应接受没有 trade_date 的参数', () => {
      const params = {
        ts_code: '000001.SH',
      };
      expect(indexParamsSchema.parse(params)).toEqual(params);
    });

    it('应拒绝无效的指数代码', () => {
      expect(() =>
        indexParamsSchema.parse({
          ts_code: 'invalid',
          trade_date: '20251014',
        })
      ).toThrow();
    });
  });
});
