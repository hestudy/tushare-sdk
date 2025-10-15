import { describe, it, expect } from 'vitest';
import {
  formatDateToTushare,
  formatDateFromTushare,
  validateStockCode,
  validateDate,
  formatQuotesToCSV,
  formatQuotesToJSON,
  exportQuotes,
  getToday,
  getDaysAgo,
  getYearRange,
} from '../../lib/utils';
import type { DailyQuote } from '../../types/index.js';

describe('Utils', () => {
  describe('日期格式转换', () => {
    it('应该将 YYYY-MM-DD 转换为 YYYYMMDD', () => {
      expect(formatDateToTushare('2024-01-02')).toBe('20240102');
      expect(formatDateToTushare('2024-12-31')).toBe('20241231');
    });

    it('应该将 YYYYMMDD 转换为 YYYY-MM-DD', () => {
      expect(formatDateFromTushare('20240102')).toBe('2024-01-02');
      expect(formatDateFromTushare('20241231')).toBe('2024-12-31');
    });

    it('应该处理无效格式', () => {
      expect(formatDateFromTushare('invalid')).toBe('invalid');
      expect(formatDateFromTushare('')).toBe('');
    });
  });

  describe('数据验证', () => {
    it('应该验证有效的股票代码', () => {
      expect(validateStockCode('600519.SH')).toBe(true);
      expect(validateStockCode('000001.SZ')).toBe(true);
    });

    it('应该拒绝无效的股票代码', () => {
      expect(validateStockCode('invalid')).toBe(false);
      expect(validateStockCode('60051.SH')).toBe(false); // 长度不对
      expect(validateStockCode('600519.XX')).toBe(false); // 市场后缀错误
      expect(validateStockCode('600519')).toBe(false); // 缺少市场后缀
    });

    it('应该验证有效的日期', () => {
      expect(validateDate('2024-01-02')).toBe(true);
      expect(validateDate('2024-12-31')).toBe(true);
    });

    it('应该拒绝无效的日期', () => {
      expect(validateDate('invalid')).toBe(false);
      expect(validateDate('2024-13-01')).toBe(false); // 月份错误
      expect(validateDate('2024-02-30')).toBe(false); // 日期不存在
      expect(validateDate('2024/01/02')).toBe(false); // 格式错误
    });
  });

  describe('数据导出', () => {
    const testQuotes: DailyQuote[] = [
      {
        id: 1,
        tsCode: '600519.SH',
        tradeDate: '2024-01-02',
        open: 1650.0,
        high: 1680.0,
        low: 1645.0,
        close: 1670.0,
        preClose: 1655.0,
        change: 15.0,
        pctChg: 0.91,
        vol: 150000,
        amount: 250000,
        createdAt: '2024-01-02T10:00:00Z',
      },
      {
        id: 2,
        tsCode: '000001.SZ',
        tradeDate: '2024-01-02',
        open: 10.0,
        high: 10.5,
        low: 9.8,
        close: 10.2,
        preClose: 10.1,
        change: 0.1,
        pctChg: 0.99,
        vol: 200000,
        amount: 2000,
        createdAt: '2024-01-02T10:00:00Z',
      },
    ];

    it('应该导出为 CSV 格式', () => {
      const csv = formatQuotesToCSV(testQuotes);

      expect(csv).toContain('ts_code,trade_date,open,high,low,close');
      expect(csv).toContain('600519.SH,2024-01-02,1650');
      expect(csv).toContain('000001.SZ,2024-01-02,10');
    });

    it('应该处理空数组', () => {
      const csv = formatQuotesToCSV([]);
      expect(csv).toBe('');
    });

    it('应该导出为 JSON 格式', () => {
      const json = formatQuotesToJSON(testQuotes);
      const parsed = JSON.parse(json);

      expect(parsed).toHaveLength(2);
      expect(parsed[0].tsCode).toBe('600519.SH');
    });

    it('应该通过 exportQuotes 导出', () => {
      const csv = exportQuotes(testQuotes, 'csv');
      expect(csv).toContain('ts_code,trade_date');

      const json = exportQuotes(testQuotes, 'json');
      const parsed = JSON.parse(json);
      expect(parsed).toHaveLength(2);
    });

    it('应该拒绝不支持的格式', () => {
      expect(() => exportQuotes(testQuotes, 'xml' as any)).toThrow(
        'Unsupported export format'
      );
    });
  });

  describe('日期工具函数', () => {
    it('应该获取今天的日期', () => {
      const today = getToday();
      expect(validateDate(today)).toBe(true);
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('应该获取指定天数前的日期', () => {
      const date = getDaysAgo(7);
      expect(validateDate(date)).toBe(true);
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('应该获取年份范围', () => {
      const range = getYearRange(2024);
      expect(range.start).toBe('20240101');
      expect(range.end).toBe('20241231');
    });
  });
});
