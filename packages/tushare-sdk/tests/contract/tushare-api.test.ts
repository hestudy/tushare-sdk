import { describe, it, expect } from 'vitest';
import { transformResponseData } from '../../src/types/response.js';
import type { TushareResponseData } from '../../src/types/response.js';

/**
 * 契约测试
 * 
 * 验证 Tushare API 响应格式是否符合预期
 * 注意: 这些测试使用模拟数据,不会实际调用 API
 */

describe('Tushare API 契约测试', () => {
  describe('stock_basic API 响应格式', () => {
    it('应该正确解析 stock_basic 响应', () => {
      const mockResponse: TushareResponseData = {
        fields: ['ts_code', 'symbol', 'name', 'area', 'industry', 'list_date'],
        items: [
          ['000001.SZ', '000001', '平安银行', '深圳', '银行', '19910403'],
          ['000002.SZ', '000002', '万科A', '深圳', '房地产', '19910129'],
        ],
      };

      const result = transformResponseData(mockResponse);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        ts_code: '000001.SZ',
        symbol: '000001',
        name: '平安银行',
        area: '深圳',
        industry: '银行',
        list_date: '19910403',
      });
    });

    it('应该处理空响应', () => {
      const mockResponse: TushareResponseData = {
        fields: ['ts_code', 'symbol', 'name'],
        items: [],
      };

      const result = transformResponseData(mockResponse);

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it('应该处理包含 null 值的响应', () => {
      const mockResponse: TushareResponseData = {
        fields: ['ts_code', 'name', 'list_status'],
        items: [
          ['000001.SZ', '平安银行', 'L'],
          ['000002.SZ', null, 'D'],
        ],
      };

      const result = transformResponseData(mockResponse);

      expect(result).toHaveLength(2);
      expect(result[1]).toEqual({
        ts_code: '000002.SZ',
        name: null,
        list_status: 'D',
      });
    });
  });

  describe('daily API 响应格式', () => {
    it('应该正确解析 daily 响应', () => {
      const mockResponse: TushareResponseData = {
        fields: [
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
        ],
        items: [
          [
            '000001.SZ',
            '20231229',
            12.5,
            12.8,
            12.4,
            12.75,
            12.45,
            0.3,
            2.41,
            1500000,
            190000,
          ],
          [
            '000001.SZ',
            '20231228',
            12.3,
            12.6,
            12.2,
            12.45,
            12.2,
            0.25,
            2.05,
            1400000,
            175000,
          ],
        ],
      };

      const result = transformResponseData(mockResponse);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        ts_code: '000001.SZ',
        trade_date: '20231229',
        open: 12.5,
        high: 12.8,
        low: 12.4,
        close: 12.75,
        pre_close: 12.45,
        change: 0.3,
        pct_chg: 2.41,
        vol: 1500000,
        amount: 190000,
      });
    });

    it('应该处理数值类型', () => {
      const mockResponse: TushareResponseData = {
        fields: ['ts_code', 'close', 'vol'],
        items: [
          ['000001.SZ', 12.75, 1500000],
          ['000002.SZ', 0, 0], // 停牌
        ],
      };

      const result = transformResponseData(mockResponse);

      expect(result[0].close).toBe(12.75);
      expect(result[0].vol).toBe(1500000);
      expect(result[1].close).toBe(0);
      expect(result[1].vol).toBe(0);
    });
  });

  describe('通用响应格式验证', () => {
    it('应该处理字段数量与数据不匹配的情况', () => {
      const mockResponse: TushareResponseData = {
        fields: ['ts_code', 'name', 'area'],
        items: [
          ['000001.SZ', '平安银行'], // 缺少 area
        ],
      };

      const result = transformResponseData(mockResponse);

      expect(result[0]).toEqual({
        ts_code: '000001.SZ',
        name: '平安银行',
        area: undefined,
      });
    });

    it('应该保持字段顺序', () => {
      const mockResponse: TushareResponseData = {
        fields: ['c', 'b', 'a'],
        items: [['3', '2', '1']],
      };

      const result = transformResponseData(mockResponse);

      expect(result[0]).toEqual({
        c: '3',
        b: '2',
        a: '1',
      });
    });

    it('应该处理大量数据', () => {
      const fields = ['ts_code', 'name'];
      const items = Array.from({ length: 5000 }, (_, i) => [
        `00000${i}.SZ`,
        `股票${i}`,
      ]);

      const mockResponse: TushareResponseData = { fields, items };
      const result = transformResponseData(mockResponse);

      expect(result).toHaveLength(5000);
      expect(result[0].ts_code).toBe('000000.SZ');
      expect(result[4999].ts_code).toBe('000004999.SZ');
    });
  });
});
