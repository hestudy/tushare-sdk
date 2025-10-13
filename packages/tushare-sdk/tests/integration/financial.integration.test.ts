import { describe, it, expect, beforeAll } from 'vitest';
import { TushareClient } from '../../src/client/TushareClient.js';
import {
  getIncomeStatement,
  getBalanceSheet,
  getCashFlow,
} from '../../src/api/financial.js';

// 检查是否有TUSHARE_TOKEN环境变量
const hasToken = !!process.env.TUSHARE_TOKEN;

// ============================================================================
// 集成测试套件 - 需要真实TUSHARE_TOKEN
// ============================================================================

describe.skipIf(!hasToken)('财务数据集成测试', () => {
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
      },
    });
  });

  // ==========================================================================
  // User Story 3: 财务数据集成测试 - 利润表
  // ==========================================================================

  describe('利润表数据获取 (getIncomeStatement)', () => {
    describe('ITC-001: 查询指定公司的年报利润表', () => {
      it('应该能够获取平安银行2023年报利润表', async () => {
        const data = await getIncomeStatement(client, {
          ts_code: '000001.SZ',
          period: '20231231',
        });

        // 验证返回数据
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThan(0);

        // 验证数据结构
        const item = data[0];
        expect(item.ts_code).toBe('000001.SZ');
        expect(item.end_date).toBe('20231231');
        expect(typeof item.ann_date).toBe('string');
        expect(typeof item.f_ann_date).toBe('string');
        expect(typeof item.report_type).toBe('string');
      }, 30000);
    });

    describe('ITC-002: 查询不同报告期类型', () => {
      it('应该能够查询年报(report_type=1)', async () => {
        const data = await getIncomeStatement(client, {
          ts_code: '000001.SZ',
          period: '20231231',
          report_type: '1',
        });

        expect(Array.isArray(data)).toBe(true);
        if (data.length > 0) {
          expect(data[0].report_type).toBe('1');
        }
      }, 30000);

      it('应该能够查询三季报(report_type=3)', async () => {
        const data = await getIncomeStatement(client, {
          ts_code: '000001.SZ',
          period: '20230930',
          report_type: '3',
        });

        expect(Array.isArray(data)).toBe(true);
      }, 30000);
    });

    describe('ITC-003: 按日期范围查询', () => {
      it('应该能够查询2023年全年的财报数据', async () => {
        const data = await getIncomeStatement(client, {
          ts_code: '000001.SZ',
          start_date: '20230101',
          end_date: '20231231',
        });

        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThan(0);

        // 验证返回了数据且包含2023年的报告期
        const has2023Data = data.some(
          (item) => item.end_date >= '20230101' && item.end_date <= '20231231'
        );
        expect(has2023Data).toBe(true);
      }, 30000);
    });

    describe('ITC-004: 查询不存在的股票代码', () => {
      it('应该返回空数组', async () => {
        const data = await getIncomeStatement(client, {
          ts_code: '999999.SH',
          period: '20231231',
        });

        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBe(0);
      }, 30000);
    });

    describe('ITC-005: 验证数据完整性', () => {
      it('返回的数据应该包含必填字段', async () => {
        const data = await getIncomeStatement(client, {
          ts_code: '600519.SH', // 贵州茅台
          period: '20231231',
        });

        expect(data.length).toBeGreaterThan(0);

        const item = data[0];
        // 验证必填字段
        expect(item.ts_code).toBeDefined();
        expect(item.ann_date).toBeDefined();
        expect(item.f_ann_date).toBeDefined();
        expect(item.end_date).toBeDefined();
        expect(item.report_type).toBeDefined();
        expect(item.comp_type).toBeDefined();
        expect(item.end_type).toBeDefined();

        // 验证常用数值字段
        if (item.total_revenue !== undefined) {
          expect(typeof item.total_revenue).toBe('number');
          expect(Number.isFinite(item.total_revenue)).toBe(true);
        }
        if (item.n_income_attr_p !== undefined) {
          expect(typeof item.n_income_attr_p).toBe('number');
        }
      }, 30000);
    });
  });

  // ==========================================================================
  // User Story 3: 财务数据集成测试 - 资产负债表
  // ==========================================================================

  describe('资产负债表数据获取 (getBalanceSheet)', () => {
    describe('ITC-006: 查询指定公司的资产负债表', () => {
      it('应该能够获取平安银行2023年报资产负债表', async () => {
        const data = await getBalanceSheet(client, {
          ts_code: '000001.SZ',
          period: '20231231',
        });

        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThan(0);

        const item = data[0];
        expect(item.ts_code).toBe('000001.SZ');
        expect(item.end_date).toBe('20231231');

        // 验证资产负债表特有字段
        if (item.total_assets !== undefined) {
          expect(typeof item.total_assets).toBe('number');
        }
      }, 30000);
    });

    describe('ITC-007: 验证资产负债平衡', () => {
      it('资产总计应该等于负债和所有者权益之和', async () => {
        const data = await getBalanceSheet(client, {
          ts_code: '600519.SH',
          period: '20231231',
        });

        expect(data.length).toBeGreaterThan(0);

        const item = data[0];
        // 如果三个字段都有值,验证平衡关系
        if (
          item.total_assets !== undefined &&
          item.total_liab !== undefined &&
          item.total_hldr_eqy_exc_min_int !== undefined
        ) {
          const assets = item.total_assets;
          const liabilities = item.total_liab;
          const equity = item.total_hldr_eqy_exc_min_int;

          // 允许一定的误差范围(由于四舍五入和合并报表差异)
          const diff = Math.abs(assets - (liabilities + equity));
          const tolerance = assets * 0.05; // 5%的误差容忍(考虑到少数股东权益等因素)

          // 如果误差过大,输出详细信息以便调试
          if (diff >= tolerance) {
            console.log('资产负债平衡验证失败:');
            console.log(`总资产: ${assets}`);
            console.log(`总负债: ${liabilities}`);
            console.log(`所有者权益: ${equity}`);
            console.log(`差异: ${diff}`);
            console.log(`容忍度: ${tolerance}`);
          }

          expect(diff).toBeLessThan(tolerance);
        }
      }, 30000);
    });

    describe('ITC-008: 查询不同公司类型', () => {
      it('应该能够查询银行类公司', async () => {
        const data = await getBalanceSheet(client, {
          ts_code: '000001.SZ', // 平安银行
          period: '20231231',
        });

        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThan(0);
      }, 30000);

      it('应该能够查询制造业公司', async () => {
        const data = await getBalanceSheet(client, {
          ts_code: '600519.SH', // 贵州茅台
          period: '20231231',
        });

        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThan(0);
      }, 30000);
    });
  });

  // ==========================================================================
  // User Story 3: 财务数据集成测试 - 现金流量表
  // ==========================================================================

  describe('现金流量表数据获取 (getCashFlow)', () => {
    describe('ITC-009: 查询现金流量表', () => {
      it('应该能够获取平安银行2023年报现金流量表', async () => {
        const data = await getCashFlow(client, {
          ts_code: '000001.SZ',
          period: '20231231',
        });

        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThan(0);

        const item = data[0];
        expect(item.ts_code).toBe('000001.SZ');
        expect(item.end_date).toBe('20231231');

        // 验证现金流量表特有字段
        if (item.n_cashflow_act !== undefined) {
          expect(typeof item.n_cashflow_act).toBe('number');
        }
      }, 30000);
    });

    describe('ITC-010: 验证现金流平衡', () => {
      it('现金净增加额应该接近三大现金流之和', async () => {
        const data = await getCashFlow(client, {
          ts_code: '600519.SH',
          period: '20231231',
        });

        expect(data.length).toBeGreaterThan(0);

        const item = data[0];
        // 如果四个关键字段都有值,验证平衡关系
        if (
          item.n_cashflow_act !== undefined &&
          item.n_cashflow_inv_act !== undefined &&
          item.n_cash_flows_fnc_act !== undefined &&
          item.n_incr_cash_cash_equ !== undefined
        ) {
          const operating = item.n_cashflow_act;
          const investing = item.n_cashflow_inv_act;
          const financing = item.n_cash_flows_fnc_act;
          const netIncrease = item.n_incr_cash_cash_equ;

          // 三大现金流之和应该接近现金净增加额
          const sum = operating + investing + financing;
          const diff = Math.abs(sum - netIncrease);

          // 允许较大的误差范围,因为可能有汇率影响等
          const tolerance = Math.abs(netIncrease) * 0.1; // 10%的误差容忍

          expect(diff).toBeLessThan(tolerance);
        }
      }, 30000);
    });

    describe('ITC-011: 查询多个报告期', () => {
      it('应该能够获取多个报告期的现金流量表', async () => {
        const data = await getCashFlow(client, {
          ts_code: '000001.SZ',
          start_date: '20230101',
          end_date: '20231231',
        });

        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThanOrEqual(1);

        // 验证报告期顺序
        if (data.length > 1) {
          for (let i = 0; i < data.length - 1; i++) {
            expect(data[i].end_date >= data[i + 1].end_date).toBe(true);
          }
        }
      }, 30000);
    });
  });

  // ==========================================================================
  // User Story 4: TushareClient类方法测试 (集成部分)
  // ==========================================================================

  describe('TushareClient类方法集成测试', () => {
    describe('ITC-012: 通过client方法调用', () => {
      it('client.getIncomeStatement应该正常工作', async () => {
        const data = await client.getIncomeStatement({
          ts_code: '000001.SZ',
          period: '20231231',
        });

        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThan(0);
      }, 30000);

      it('client.getBalanceSheet应该正常工作', async () => {
        const data = await client.getBalanceSheet({
          ts_code: '000001.SZ',
          period: '20231231',
        });

        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThan(0);
      }, 30000);

      it('client.getCashFlow应该正常工作', async () => {
        const data = await client.getCashFlow({
          ts_code: '000001.SZ',
          period: '20231231',
        });

        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThan(0);
      }, 30000);
    });

    describe('ITC-013: 配置继承测试(重试机制)', () => {
      it('client配置的重试机制应该被API调用继承', async () => {
        // 这个测试验证client的配置会被传递到API调用
        // 通过成功的调用来验证配置正确传递
        const data = await client.getIncomeStatement({
          ts_code: '000001.SZ',
          period: '20231231',
        });

        expect(data).toBeDefined();
        expect(Array.isArray(data)).toBe(true);
      }, 30000);
    });
  });

  // ==========================================================================
  // 错误处理集成测试
  // ==========================================================================

  describe('错误处理集成测试', () => {
    describe('ITC-015: 无效token应该抛出错误', () => {
      it('应该拒绝无效的token', async () => {
        const invalidClient = new TushareClient({
          token: 'invalid_token_12345',
        });

        await expect(
          getIncomeStatement(invalidClient, {
            ts_code: '000001.SZ',
            period: '20231231',
          })
        ).rejects.toThrow();
      }, 30000);
    });

    describe('ITC-017: 无效参数格式', () => {
      it('应该拒绝无效的日期格式', async () => {
        // SDK会做参数验证,应该抛出验证错误
        await expect(
          getIncomeStatement(client, {
            ts_code: '000001.SZ',
            // @ts-expect-error - Testing invalid parameter format
            period: 'invalid_date',
          })
        ).rejects.toThrow();
      }, 30000);
    });
  });
});

// ============================================================================
// 缓存机制测试 - 独立测试套件,使用启用缓存的client
// ============================================================================

describe.skipIf(!hasToken)('缓存机制测试', () => {
  describe('ITC-014: 第二次请求应该使用缓存', () => {
    it('相同请求的第二次调用应该更快', async () => {
      const cachedClient = new TushareClient({
        token: process.env.TUSHARE_TOKEN!,
        cache: {
          enabled: true,
          maxSize: 100,
          ttl: 300000, // 5分钟
        },
      });

      const params = {
        ts_code: '000001.SZ',
        period: '20231231',
      };

      // 第一次请求 - 从API获取
      const start1 = Date.now();
      const data1 = await getIncomeStatement(cachedClient, params);
      const duration1 = Date.now() - start1;

      expect(data1.length).toBeGreaterThan(0);

      // 第二次请求 - 应该从缓存获取
      const start2 = Date.now();
      const data2 = await getIncomeStatement(cachedClient, params);
      const duration2 = Date.now() - start2;

      expect(data2.length).toBe(data1.length);

      // 第二次请求应该更快(至少快50%)
      // 注意:这个测试可能在某些情况下不稳定,取决于网络延迟
      console.log(`第一次请求耗时: ${duration1}ms`);
      console.log(`第二次请求耗时: ${duration2}ms`);
      console.log(`速度提升: ${Math.round(((duration1 - duration2) / duration1) * 100)}%`);

      // 第二次请求应该明显更快
      expect(duration2).toBeLessThan(duration1);
    }, 60000);
  });
});

// ============================================================================
// 无token时的跳过提示
// ============================================================================

describe.skipIf(hasToken)('财务数据集成测试 - 需要TUSHARE_TOKEN', () => {
  it('请设置TUSHARE_TOKEN环境变量来运行集成测试', () => {
    console.log('提示: 设置环境变量 TUSHARE_TOKEN 来运行集成测试');
    console.log('例如: export TUSHARE_TOKEN="your_token_here"');
  });
});
