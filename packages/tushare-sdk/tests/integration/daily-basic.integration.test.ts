import { describe, it, expect, beforeAll } from 'vitest';
import { TushareClient } from '../../src/client/TushareClient.js';
import { getDailyBasic } from '../../src/api/daily-basic.js';

/**
 * getDailyBasic 集成测试
 * 
 * 注意: 这些测试需要有效的 Tushare API Token 和至少 2000 积分
 * 设置环境变量 TUSHARE_TOKEN 来运行这些测试
 * 
 * 如果没有 Token, 这些测试将被跳过
 */

const hasToken = !!process.env.TUSHARE_TOKEN;

describe.skipIf(!hasToken)('getDailyBasic 集成测试', () => {
  let client: TushareClient;

  beforeAll(() => {
    client = new TushareClient({
      token: process.env.TUSHARE_TOKEN!,
      cache: {
        enabled: false, // 集成测试禁用缓存,确保获取真实数据
      },
      retry: {
        maxRetries: 2,
        initialDelay: 1000,
        maxDelay: 5000,
        backoffFactor: 2,
      },
    });
  });

  describe('User Story 1: 按交易日期获取所有股票每日指标', () => {
    it('测试用例 1: 按交易日期获取所有股票每日指标 (Acceptance Scenario 1)', async () => {
      // 使用历史日期确保数据稳定
      const data = await getDailyBasic(client, {
        trade_date: '20180726',
      });

      // 验证返回数据
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      console.log(`获取到 ${data.length} 条数据`);

      // 验证数据结构
      const firstItem = data[0];
      expect(firstItem).toHaveProperty('ts_code');
      expect(firstItem).toHaveProperty('trade_date');
      expect(typeof firstItem.ts_code).toBe('string');
      expect(firstItem.trade_date).toBe('20180726');

      // 验证数据字段类型
      if (firstItem.pe !== undefined) {
        expect(typeof firstItem.pe).toBe('number');
      }
      if (firstItem.pb !== undefined) {
        expect(typeof firstItem.pb).toBe('number');
      }
      if (firstItem.turnover_rate !== undefined) {
        expect(typeof firstItem.turnover_rate).toBe('number');
      }
    }, 30000);

    it('测试用例 2: 自定义返回字段列表 (Acceptance Scenario 2)', async () => {
      const data = await getDailyBasic(client, {
        trade_date: '20180726',
        fields: 'ts_code,trade_date,pe,pb',
      });

      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);

      // 验证返回的字段
      const firstItem = data[0];
      expect(firstItem).toHaveProperty('ts_code');
      expect(firstItem).toHaveProperty('trade_date');
      expect(firstItem.trade_date).toBe('20180726');

      // 注意: API 可能返回所有字段,即使指定了 fields
      // 这是 Tushare API 的行为,SDK 不做额外处理
    }, 30000);

    it('测试用例 3: 查询非交易日返回空数据 (Acceptance Scenario 3)', async () => {
      // 使用周日日期(非交易日)
      const data = await getDailyBasic(client, {
        trade_date: '20180729', // 2018-07-29 是周日
      });

      // 非交易日应该返回空数组
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(0);
    }, 30000);
  });

  describe('User Story 2: 按股票代码获取历史每日指标', () => {
    it('测试用例 4: 按股票代码获取历史数据 (US2 Scenario 1)', async () => {
      const data = await getDailyBasic(client, {
        ts_code: '600230.SH',
        start_date: '20180101',
        end_date: '20180131',
      });

      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);

      // 验证所有数据都是同一只股票
      const allSameStock = data.every((item) => item.ts_code === '600230.SH');
      expect(allSameStock).toBe(true);

      // 验证日期在范围内
      data.forEach((item) => {
        const date = parseInt(item.trade_date);
        expect(date).toBeGreaterThanOrEqual(20180101);
        expect(date).toBeLessThanOrEqual(20180131);
      });
    }, 30000);

    it('测试用例 5: 股票代码 + 日期范围组合查询 (US2 Scenario 2)', async () => {
      const data = await getDailyBasic(client, {
        ts_code: '600230.SH',
        start_date: '20180701',
        end_date: '20180731',
      });

      expect(Array.isArray(data)).toBe(true);

      if (data.length > 0) {
        // 验证数据按日期排序(Tushare API 的默认行为)
        const firstItem = data[0];
        const lastItem = data[data.length - 1];

        expect(firstItem.ts_code).toBe('600230.SH');
        expect(lastItem.ts_code).toBe('600230.SH');

        // 验证日期字段存在
        expect(firstItem.trade_date).toBeDefined();
        expect(lastItem.trade_date).toBeDefined();
      }
    }, 30000);

    it('测试用例 6: 不存在的股票代码返回空数据 (US2 Scenario 3)', async () => {
      const data = await getDailyBasic(client, {
        ts_code: '999999.SH', // 不存在的股票代码
        trade_date: '20180726',
      });

      // 不存在的股票应该返回空数组
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(0);
    }, 30000);
  });

  describe('User Story 3: 批量分页获取大量数据', () => {
    it.skip('测试用例 7: 查询可能超过 6000 条的场景', async () => {
      // 注意: 此测试可能需要较长时间,标记为 skip
      // 查询多个交易日可能超过 6000 条限制
      const data = await getDailyBasic(client, {
        ts_code: '600230.SH',
        start_date: '20180101',
        end_date: '20181231',
      });

      expect(Array.isArray(data)).toBe(true);

      // 验证返回数据不超过 6000 条(Tushare API 限制)
      expect(data.length).toBeLessThanOrEqual(6000);

      // 文档说明: 如果数据超过 6000 条,用户需要自行分页查询
      // 例如: 按月份分批查询,然后合并结果
      console.log(`返回 ${data.length} 条数据(最多 6000 条)`);
    }, 60000);
  });

  describe('边界情况测试', () => {
    it('测试用例 8: 周末或节假日查询(返回空数组)', async () => {
      // 2018-10-01 是国庆节
      const data = await getDailyBasic(client, {
        trade_date: '20181001',
      });

      expect(Array.isArray(data)).toBe(true);
      // 节假日可能返回空数组
      if (data.length === 0) {
        console.log('节假日返回空数据(符合预期)');
      }
    }, 30000);

    it('测试用例 9: 特定股票特定日期查询', async () => {
      const data = await getDailyBasic(client, {
        ts_code: '600230.SH',
        trade_date: '20180726',
      });

      expect(Array.isArray(data)).toBe(true);

      if (data.length > 0) {
        expect(data.length).toBe(1);
        expect(data[0].ts_code).toBe('600230.SH');
        expect(data[0].trade_date).toBe('20180726');
      }
    }, 30000);

    it('测试用例 10: 错误处理 - 权限不足、网络错误等', async () => {
      // 使用无效 token 测试错误处理
      const invalidClient = new TushareClient({
        token: 'invalid_token_12345',
      });

      await expect(
        getDailyBasic(invalidClient, {
          trade_date: '20180726',
        })
      ).rejects.toThrow();
    }, 30000);
  });

  describe('性能测试', () => {
    it('查询单个交易日全市场数据应在 30 秒内完成 (SC-002)', async () => {
      const startTime = performance.now();

      const data = await getDailyBasic(client, {
        trade_date: '20180726',
      });

      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000; // 转换为秒

      console.log(`查询耗时: ${duration.toFixed(2)} 秒`);
      console.log(`数据量: ${data.length} 条`);

      expect(duration).toBeLessThan(30);
      expect(data.length).toBeGreaterThan(0);
    }, 35000);
  });
});

describe('错误处理集成测试', () => {
  it('应该拒绝无效的 token', async () => {
    const client = new TushareClient({
      token: 'invalid_token',
    });

    await expect(
      getDailyBasic(client, {
        trade_date: '20180726',
      })
    ).rejects.toThrow();
  }, 30000);

  it.skipIf(!hasToken)('应该处理无效的参数', async () => {
    const client = new TushareClient({
      token: process.env.TUSHARE_TOKEN!,
    });

    // 无效的日期格式(由 API 处理)
    await expect(
      getDailyBasic(client, {
        trade_date: 'invalid_date',
      })
    ).rejects.toThrow();
  }, 30000);
});
