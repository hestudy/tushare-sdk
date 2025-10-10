import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TushareClient } from '../../src/client/TushareClient.js';
import { getDailyBasic } from '../../src/api/daily-basic.js';
import type { DailyBasicItem } from '../../src/models/daily-basic.js';

describe('getDailyBasic 单元测试', () => {
  let client: TushareClient;
  let mockQuery: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    client = new TushareClient({ token: 'test_token' });
    mockQuery = vi.fn();
    // @ts-expect-error - Mocking query method for testing
    client.query = mockQuery;
  });

  describe('参数传递测试', () => {
    it('测试用例 1: 按交易日期查询 - 验证调用 client.query 时传入正确参数', async () => {
      const mockData: DailyBasicItem[] = [
        {
          ts_code: '600230.SH',
          trade_date: '20180726',
          turnover_rate: 2.4584,
          volume_ratio: 0.72,
          pe: 8.6928,
          pb: 3.7203,
        },
      ];
      mockQuery.mockResolvedValue(mockData);

      const params = {
        trade_date: '20180726',
      };

      const result = await getDailyBasic(client, params);

      expect(mockQuery).toHaveBeenCalledWith('daily_basic', params);
      expect(result).toEqual(mockData);
    });

    it('测试用例 2: 自定义返回字段 - 验证 fields 参数正确传递', async () => {
      const mockData: DailyBasicItem[] = [
        {
          ts_code: '600230.SH',
          trade_date: '20180726',
          pe: 8.6928,
          pb: 3.7203,
        },
      ];
      mockQuery.mockResolvedValue(mockData);

      const params = {
        trade_date: '20180726',
        fields: 'ts_code,trade_date,pe,pb',
      };

      const result = await getDailyBasic(client, params);

      expect(mockQuery).toHaveBeenCalledWith('daily_basic', params);
      expect(result).toEqual(mockData);
    });

    it('测试用例 3: 空参数调用 - 验证可以不传 params', async () => {
      const mockData: DailyBasicItem[] = [];
      mockQuery.mockResolvedValue(mockData);

      const result = await getDailyBasic(client);

      expect(mockQuery).toHaveBeenCalledWith('daily_basic', undefined);
      expect(result).toEqual(mockData);
    });

    it('测试用例 4: 按股票代码查询 - 验证 ts_code 参数正确传递', async () => {
      const mockData: DailyBasicItem[] = [
        {
          ts_code: '600230.SH',
          trade_date: '20180726',
          pe: 8.6928,
          pb: 3.7203,
        },
      ];
      mockQuery.mockResolvedValue(mockData);

      const params = {
        ts_code: '600230.SH',
      };

      const result = await getDailyBasic(client, params);

      expect(mockQuery).toHaveBeenCalledWith('daily_basic', params);
      expect(result).toEqual(mockData);
    });

    it('测试用例 5: 股票代码 + 日期范围查询 - 验证多个参数组合', async () => {
      const mockData: DailyBasicItem[] = [
        {
          ts_code: '600230.SH',
          trade_date: '20180101',
          pe: 8.5,
          pb: 3.6,
        },
        {
          ts_code: '600230.SH',
          trade_date: '20180102',
          pe: 8.6,
          pb: 3.7,
        },
      ];
      mockQuery.mockResolvedValue(mockData);

      const params = {
        ts_code: '600230.SH',
        start_date: '20180101',
        end_date: '20181231',
      };

      const result = await getDailyBasic(client, params);

      expect(mockQuery).toHaveBeenCalledWith('daily_basic', params);
      expect(result).toEqual(mockData);
      expect(result.length).toBe(2);
    });
  });

  describe('数据处理测试', () => {
    it('测试用例 6: 大数据量场景 - Mock 返回 6000 条数据', async () => {
      // 生成 6000 条模拟数据
      const mockData: DailyBasicItem[] = Array.from({ length: 6000 }, (_, i) => ({
        ts_code: `${String(i).padStart(6, '0')}.SH`,
        trade_date: '20180726',
        pe: 10 + Math.random() * 20,
        pb: 1 + Math.random() * 5,
      }));
      mockQuery.mockResolvedValue(mockData);

      const params = {
        trade_date: '20180726',
      };

      const result = await getDailyBasic(client, params);

      expect(mockQuery).toHaveBeenCalledWith('daily_basic', params);
      expect(result).toEqual(mockData);
      expect(result.length).toBe(6000);
      // 注释: 当前版本返回最多 6000 条,超过此限制需要用户自行分页
    });

    it('测试用例 7: 同时传入 ts_code 和 trade_date - 单条记录', async () => {
      const mockData: DailyBasicItem[] = [
        {
          ts_code: '600230.SH',
          trade_date: '20180726',
          turnover_rate: 2.4584,
          volume_ratio: 0.72,
          pe: 8.6928,
          pb: 3.7203,
          total_mv: 123456.78,
          circ_mv: 98765.43,
        },
      ];
      mockQuery.mockResolvedValue(mockData);

      const params = {
        ts_code: '600230.SH',
        trade_date: '20180726',
      };

      const result = await getDailyBasic(client, params);

      expect(mockQuery).toHaveBeenCalledWith('daily_basic', params);
      expect(result).toEqual(mockData);
      expect(result.length).toBe(1);
    });

    it('测试用例 8: 日期格式验证 - 由 API 处理', async () => {
      // SDK 不做格式验证,直接传递给 API
      const params = {
        trade_date: '20180726', // 正确格式
      };

      mockQuery.mockResolvedValue([]);

      await getDailyBasic(client, params);

      expect(mockQuery).toHaveBeenCalledWith('daily_basic', params);
    });

    it('测试用例 9: 参数类型检查 - TypeScript 类型系统保证', async () => {
      const params = {
        ts_code: '600230.SH',
        trade_date: '20180726',
        start_date: '20180101',
        end_date: '20181231',
        fields: 'ts_code,trade_date,pe,pb',
      };

      mockQuery.mockResolvedValue([]);

      await getDailyBasic(client, params);

      expect(mockQuery).toHaveBeenCalledWith('daily_basic', params);
    });
  });

  describe('返回值测试', () => {
    it('应该返回空数组当无数据时', async () => {
      mockQuery.mockResolvedValue([]);

      const result = await getDailyBasic(client, {
        trade_date: '20180726',
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('应该正确处理包含可选字段的数据', async () => {
      const mockData: DailyBasicItem[] = [
        {
          ts_code: '600230.SH',
          trade_date: '20180726',
          turnover_rate: 2.4584,
          pe: 8.6928,
          pb: 3.7203,
          // 其他字段为 undefined
        },
      ];
      mockQuery.mockResolvedValue(mockData);

      const result = await getDailyBasic(client, {
        trade_date: '20180726',
      });

      expect(result[0].ts_code).toBe('600230.SH');
      expect(result[0].trade_date).toBe('20180726');
      expect(result[0].pe).toBe(8.6928);
      expect(result[0].ps).toBeUndefined();
    });

    it('应该正确处理亏损股票(PE为空)', async () => {
      const mockData: DailyBasicItem[] = [
        {
          ts_code: '600001.SH',
          trade_date: '20180726',
          turnover_rate: 1.5,
          pb: 2.5,
          // pe 和 pe_ttm 为 undefined (亏损)
        },
      ];
      mockQuery.mockResolvedValue(mockData);

      const result = await getDailyBasic(client, {
        ts_code: '600001.SH',
        trade_date: '20180726',
      });

      expect(result[0].pe).toBeUndefined();
      expect(result[0].pe_ttm).toBeUndefined();
      expect(result[0].pb).toBe(2.5);
    });
  });
});
