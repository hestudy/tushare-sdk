import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TushareClient } from '../../src/client/TushareClient.js';
import {
  getIncomeStatement,
  getBalanceSheet,
  getCashFlow,
} from '../../src/api/financial.js';
import type {
  IncomeStatementItem,
  BalanceSheetItem,
  CashFlowItem,
} from '../../src/models/financial.js';

// ============================================================================
// 测试辅助函数
// ============================================================================

/**
 * 创建最小完整的利润表数据
 */
function createMinimalIncomeStatement(
  overrides?: Partial<IncomeStatementItem>
): IncomeStatementItem {
  return {
    ts_code: '000001.SZ',
    ann_date: '20240430',
    f_ann_date: '20240430',
    end_date: '20231231',
    report_type: '4',
    comp_type: '1',
    end_type: '4',
    ...overrides,
  };
}

/**
 * 创建最小完整的资产负债表数据
 */
function createMinimalBalanceSheet(
  overrides?: Partial<BalanceSheetItem>
): BalanceSheetItem {
  return {
    ts_code: '000001.SZ',
    ann_date: '20240430',
    f_ann_date: '20240430',
    end_date: '20231231',
    report_type: '4',
    comp_type: '1',
    end_type: '4',
    ...overrides,
  };
}

/**
 * 创建最小完整的现金流量表数据
 */
function createMinimalCashFlow(
  overrides?: Partial<CashFlowItem>
): CashFlowItem {
  return {
    ts_code: '000001.SZ',
    ann_date: '20240430',
    f_ann_date: '20240430',
    end_date: '20231231',
    comp_type: '1',
    report_type: '4',
    end_type: '4',
    ...overrides,
  };
}

// ============================================================================
// 单元测试套件
// ============================================================================

describe('财务数据API单元测试', () => {
  let client: TushareClient;
  let mockQuery: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // 每个测试前创建新的mock client
    client = new TushareClient({ token: 'test_token' });
    mockQuery = vi.fn();
    // @ts-expect-error - Mocking query method for testing
    client.query = mockQuery;
  });

  // ==========================================================================
  // User Story 1: 财务数据API单元测试 - getIncomeStatement
  // ==========================================================================

  describe('getIncomeStatement 单元测试', () => {
    describe('TC-001: 带完整参数调用', () => {
      it('应该正确调用client.query并传递所有参数', async () => {
        // Arrange
        const mockData: IncomeStatementItem[] = [
          createMinimalIncomeStatement({
            basic_eps: 2.34,
            total_revenue: 189234567890,
            n_income_attr_p: 45000000000,
          }),
        ];
        mockQuery.mockResolvedValue(mockData);

        const params = {
          ts_code: '000001.SZ',
          period: '20231231',
          report_type: '1' as const,
          comp_type: '1' as const,
          start_date: '20230101',
          end_date: '20231231',
        };

        // Act
        const result = await getIncomeStatement(client, params);

        // Assert
        expect(mockQuery).toHaveBeenCalledWith('income', params);
        expect(result).toEqual(mockData);
        expect(result.length).toBe(1);
      });
    });

    describe('TC-002: 不带参数调用', () => {
      it('应该能够不传参数调用', async () => {
        // Arrange
        mockQuery.mockResolvedValue([]);

        // Act
        const result = await getIncomeStatement(client);

        // Assert
        expect(mockQuery).toHaveBeenCalledWith('income', undefined);
        expect(result).toEqual([]);
      });
    });

    describe('TC-003: 多种参数组合', () => {
      it('应该正确处理仅传入ts_code', async () => {
        const mockData = [createMinimalIncomeStatement()];
        mockQuery.mockResolvedValue(mockData);

        const result = await getIncomeStatement(client, { ts_code: '000001.SZ' });

        expect(mockQuery).toHaveBeenCalledWith('income', { ts_code: '000001.SZ' });
        expect(result).toEqual(mockData);
      });

      it('应该正确处理period参数', async () => {
        const mockData = [createMinimalIncomeStatement()];
        mockQuery.mockResolvedValue(mockData);

        const result = await getIncomeStatement(client, { period: '20231231' });

        expect(mockQuery).toHaveBeenCalledWith('income', { period: '20231231' });
        expect(result).toEqual(mockData);
      });

      it('应该正确处理日期范围参数', async () => {
        const mockData = [
          createMinimalIncomeStatement({ end_date: '20230331' }),
          createMinimalIncomeStatement({ end_date: '20230630' }),
        ];
        mockQuery.mockResolvedValue(mockData);

        const params = { start_date: '20230101', end_date: '20230630' };
        const result = await getIncomeStatement(client, params);

        expect(mockQuery).toHaveBeenCalledWith('income', params);
        expect(result).toEqual(mockData);
        expect(result.length).toBe(2);
      });

      it('应该正确处理report_type参数', async () => {
        const mockData = [createMinimalIncomeStatement({ report_type: '1' })];
        mockQuery.mockResolvedValue(mockData);

        const params = { ts_code: '000001.SZ', report_type: '1' as const };
        const result = await getIncomeStatement(client, params);

        expect(mockQuery).toHaveBeenCalledWith('income', params);
        expect(result[0].report_type).toBe('1');
      });
    });

    describe('TC-004: 返回空数组', () => {
      it('应该正确处理空数组返回', async () => {
        mockQuery.mockResolvedValue([]);

        const result = await getIncomeStatement(client, {
          ts_code: '999999.SH',
        });

        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(0);
      });
    });

    describe('TC-005: 返回多条数据', () => {
      it('应该正确处理多条数据返回', async () => {
        const mockData = [
          createMinimalIncomeStatement({ end_date: '20231231' }),
          createMinimalIncomeStatement({ end_date: '20230930' }),
          createMinimalIncomeStatement({ end_date: '20230630' }),
          createMinimalIncomeStatement({ end_date: '20230331' }),
        ];
        mockQuery.mockResolvedValue(mockData);

        const result = await getIncomeStatement(client, {
          ts_code: '000001.SZ',
          start_date: '20230101',
          end_date: '20231231',
        });

        expect(result.length).toBe(4);
        expect(result[0].end_date).toBe('20231231');
        expect(result[3].end_date).toBe('20230331');
      });
    });

    describe('TC-006: 异常抛出', () => {
      it('应该正确传播API错误', async () => {
        mockQuery.mockRejectedValue(new Error('API Error: Invalid token'));

        await expect(
          getIncomeStatement(client, { ts_code: '000001.SZ' })
        ).rejects.toThrow('API Error: Invalid token');
      });

      it('应该正确传播网络错误', async () => {
        mockQuery.mockRejectedValue(new Error('Network timeout'));

        await expect(
          getIncomeStatement(client, { ts_code: '000001.SZ' })
        ).rejects.toThrow('Network timeout');
      });
    });
  });

  // ==========================================================================
  // User Story 1: 财务数据API单元测试 - getBalanceSheet
  // ==========================================================================

  describe('getBalanceSheet 单元测试', () => {
    describe('TC-007: 带完整参数调用', () => {
      it('应该正确调用client.query并传递所有参数', async () => {
        const mockData: BalanceSheetItem[] = [
          createMinimalBalanceSheet({
            total_assets: 5678901234567,
            total_cur_assets: 2000000000000,
            total_share: 50000000000,
          }),
        ];
        mockQuery.mockResolvedValue(mockData);

        const params = {
          ts_code: '000001.SZ',
          period: '20231231',
          report_type: '1' as const,
          comp_type: '1' as const,
          start_date: '20230101',
          end_date: '20231231',
        };

        const result = await getBalanceSheet(client, params);

        expect(mockQuery).toHaveBeenCalledWith('balancesheet', params);
        expect(result).toEqual(mockData);
        expect(result.length).toBe(1);
      });
    });

    describe('TC-008: 不带参数调用', () => {
      it('应该能够不传参数调用', async () => {
        mockQuery.mockResolvedValue([]);

        const result = await getBalanceSheet(client);

        expect(mockQuery).toHaveBeenCalledWith('balancesheet', undefined);
        expect(result).toEqual([]);
      });
    });

    describe('TC-009: 多种参数组合', () => {
      it('应该正确处理仅传入ts_code', async () => {
        const mockData = [createMinimalBalanceSheet()];
        mockQuery.mockResolvedValue(mockData);

        const result = await getBalanceSheet(client, { ts_code: '000001.SZ' });

        expect(mockQuery).toHaveBeenCalledWith('balancesheet', {
          ts_code: '000001.SZ',
        });
        expect(result).toEqual(mockData);
      });

      it('应该正确处理period参数', async () => {
        const mockData = [createMinimalBalanceSheet()];
        mockQuery.mockResolvedValue(mockData);

        const result = await getBalanceSheet(client, { period: '20231231' });

        expect(mockQuery).toHaveBeenCalledWith('balancesheet', {
          period: '20231231',
        });
        expect(result).toEqual(mockData);
      });

      it('应该正确处理日期范围参数', async () => {
        const mockData = [
          createMinimalBalanceSheet({ end_date: '20230331' }),
          createMinimalBalanceSheet({ end_date: '20230630' }),
        ];
        mockQuery.mockResolvedValue(mockData);

        const params = { start_date: '20230101', end_date: '20230630' };
        const result = await getBalanceSheet(client, params);

        expect(mockQuery).toHaveBeenCalledWith('balancesheet', params);
        expect(result).toEqual(mockData);
        expect(result.length).toBe(2);
      });
    });

    describe('TC-010: 返回空数组', () => {
      it('应该正确处理空数组返回', async () => {
        mockQuery.mockResolvedValue([]);

        const result = await getBalanceSheet(client, { ts_code: '999999.SH' });

        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(0);
      });
    });

    describe('TC-011: 返回多条数据', () => {
      it('应该正确处理多条数据返回', async () => {
        const mockData = [
          createMinimalBalanceSheet({ end_date: '20231231' }),
          createMinimalBalanceSheet({ end_date: '20230930' }),
          createMinimalBalanceSheet({ end_date: '20230630' }),
        ];
        mockQuery.mockResolvedValue(mockData);

        const result = await getBalanceSheet(client, {
          ts_code: '000001.SZ',
          start_date: '20230101',
          end_date: '20231231',
        });

        expect(result.length).toBe(3);
        expect(result[0].end_date).toBe('20231231');
      });
    });

    describe('TC-012: 异常抛出', () => {
      it('应该正确传播API错误', async () => {
        mockQuery.mockRejectedValue(new Error('API Error: Permission denied'));

        await expect(
          getBalanceSheet(client, { ts_code: '000001.SZ' })
        ).rejects.toThrow('API Error: Permission denied');
      });
    });
  });

  // ==========================================================================
  // User Story 1: 财务数据API单元测试 - getCashFlow
  // ==========================================================================

  describe('getCashFlow 单元测试', () => {
    describe('TC-013: 带完整参数调用', () => {
      it('应该正确调用client.query并传递所有参数', async () => {
        const mockData: CashFlowItem[] = [
          createMinimalCashFlow({
            n_cashflow_act: 60000000000,
            n_cashflow_inv_act: -30000000000,
            n_cash_flows_fnc_act: 15000000000,
          }),
        ];
        mockQuery.mockResolvedValue(mockData);

        const params = {
          ts_code: '000001.SZ',
          period: '20231231',
          report_type: '1' as const,
          comp_type: '1' as const,
          start_date: '20230101',
          end_date: '20231231',
        };

        const result = await getCashFlow(client, params);

        expect(mockQuery).toHaveBeenCalledWith('cashflow', params);
        expect(result).toEqual(mockData);
        expect(result.length).toBe(1);
      });
    });

    describe('TC-014: 不带参数调用', () => {
      it('应该能够不传参数调用', async () => {
        mockQuery.mockResolvedValue([]);

        const result = await getCashFlow(client);

        expect(mockQuery).toHaveBeenCalledWith('cashflow', undefined);
        expect(result).toEqual([]);
      });
    });

    describe('TC-015: 多种参数组合', () => {
      it('应该正确处理仅传入ts_code', async () => {
        const mockData = [createMinimalCashFlow()];
        mockQuery.mockResolvedValue(mockData);

        const result = await getCashFlow(client, { ts_code: '000001.SZ' });

        expect(mockQuery).toHaveBeenCalledWith('cashflow', {
          ts_code: '000001.SZ',
        });
        expect(result).toEqual(mockData);
      });

      it('应该正确处理period参数', async () => {
        const mockData = [createMinimalCashFlow()];
        mockQuery.mockResolvedValue(mockData);

        const result = await getCashFlow(client, { period: '20231231' });

        expect(mockQuery).toHaveBeenCalledWith('cashflow', { period: '20231231' });
        expect(result).toEqual(mockData);
      });

      it('应该正确处理日期范围参数', async () => {
        const mockData = [
          createMinimalCashFlow({ end_date: '20230331' }),
          createMinimalCashFlow({ end_date: '20230630' }),
        ];
        mockQuery.mockResolvedValue(mockData);

        const params = { start_date: '20230101', end_date: '20230630' };
        const result = await getCashFlow(client, params);

        expect(mockQuery).toHaveBeenCalledWith('cashflow', params);
        expect(result).toEqual(mockData);
        expect(result.length).toBe(2);
      });
    });

    describe('TC-016: 返回空数组', () => {
      it('应该正确处理空数组返回', async () => {
        mockQuery.mockResolvedValue([]);

        const result = await getCashFlow(client, { ts_code: '999999.SH' });

        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(0);
      });
    });

    describe('TC-017: 返回多条数据', () => {
      it('应该正确处理多条数据返回', async () => {
        const mockData = [
          createMinimalCashFlow({ end_date: '20231231' }),
          createMinimalCashFlow({ end_date: '20230930' }),
        ];
        mockQuery.mockResolvedValue(mockData);

        const result = await getCashFlow(client, {
          ts_code: '000001.SZ',
          start_date: '20230101',
          end_date: '20231231',
        });

        expect(result.length).toBe(2);
        expect(result[0].end_date).toBe('20231231');
      });
    });

    describe('TC-018: 异常抛出', () => {
      it('应该正确传播API错误', async () => {
        mockQuery.mockRejectedValue(new Error('API Error: Rate limit exceeded'));

        await expect(
          getCashFlow(client, { ts_code: '000001.SZ' })
        ).rejects.toThrow('API Error: Rate limit exceeded');
      });
    });
  });

  // ==========================================================================
  // User Story 2: 财务数据类型定义测试
  // ==========================================================================

  describe('类型定义测试', () => {
    describe('TC-019: IncomeStatementItem类型测试', () => {
      it('TTC-001: 必填字段完整性', () => {
        // TypeScript编译器会检查必填字段是否完整
        const item: IncomeStatementItem = createMinimalIncomeStatement();

        // 验证必填字段存在
        expect(item.ts_code).toBeDefined();
        expect(item.ann_date).toBeDefined();
        expect(item.f_ann_date).toBeDefined();
        expect(item.end_date).toBeDefined();
        expect(item.report_type).toBeDefined();
        expect(item.comp_type).toBeDefined();
        expect(item.end_type).toBeDefined();
      });

      it('TTC-002: 可选字段类型正确性', () => {
        const item: IncomeStatementItem = createMinimalIncomeStatement({
          basic_eps: 2.34,
          diluted_eps: 2.30,
        });

        // 验证可选字段类型
        if (item.basic_eps !== undefined) {
          expect(typeof item.basic_eps).toBe('number');
        }
        if (item.diluted_eps !== undefined) {
          expect(typeof item.diluted_eps).toBe('number');
        }
        // 未设置的可选字段应该是undefined
        expect(item.total_revenue).toBeUndefined();
      });

      it('TTC-004: 每股指标字段类型', () => {
        const item: IncomeStatementItem = createMinimalIncomeStatement({
          basic_eps: 2.34,
          diluted_eps: 2.30,
        });

        expect(typeof item.basic_eps).toBe('number');
        expect(typeof item.diluted_eps).toBe('number');
      });

      it('TTC-005: 收入类指标字段类型', () => {
        const item: IncomeStatementItem = createMinimalIncomeStatement({
          total_revenue: 189234567890,
          revenue: 189234567890,
        });

        expect(typeof item.total_revenue).toBe('number');
        expect(typeof item.revenue).toBe('number');
      });

      it('TTC-006: 利润类指标字段类型', () => {
        const item: IncomeStatementItem = createMinimalIncomeStatement({
          operate_profit: 56789012345,
          total_profit: 58901234567,
          n_income: 45678901234,
          n_income_attr_p: 45000000000,
        });

        expect(typeof item.operate_profit).toBe('number');
        expect(typeof item.total_profit).toBe('number');
        expect(typeof item.n_income).toBe('number');
        expect(typeof item.n_income_attr_p).toBe('number');
      });

      it('TTC-007: 类型导入导出', () => {
        // 验证类型可以正确导入和使用
        const items: IncomeStatementItem[] = [
          createMinimalIncomeStatement(),
          createMinimalIncomeStatement({ ts_code: '600519.SH' }),
        ];

        expect(items.length).toBe(2);
        expect(items[0].ts_code).toBe('000001.SZ');
        expect(items[1].ts_code).toBe('600519.SH');
      });
    });

    describe('TC-020: BalanceSheetItem类型测试', () => {
      it('TTC-008: 必填字段完整性', () => {
        const item: BalanceSheetItem = createMinimalBalanceSheet();

        expect(item.ts_code).toBeDefined();
        expect(item.ann_date).toBeDefined();
        expect(item.f_ann_date).toBeDefined();
        expect(item.end_date).toBeDefined();
        expect(item.report_type).toBeDefined();
        expect(item.comp_type).toBeDefined();
        expect(item.end_type).toBeDefined();
      });

      it('TTC-009: 资产类字段类型', () => {
        const item: BalanceSheetItem = createMinimalBalanceSheet({
          total_assets: 5678901234567,
          total_cur_assets: 2000000000000,
          money_cap: 500000000000,
        });

        expect(typeof item.total_assets).toBe('number');
        expect(typeof item.total_cur_assets).toBe('number');
        expect(typeof item.money_cap).toBe('number');
      });

      it('TTC-010: 负债类字段类型', () => {
        const item: BalanceSheetItem = createMinimalBalanceSheet({
          total_cur_liab: 1500000000000,
          total_ncl: 2000000000000,
          st_borr: 400000000000,
        });

        expect(typeof item.total_cur_liab).toBe('number');
        expect(typeof item.total_ncl).toBe('number');
        expect(typeof item.st_borr).toBe('number');
      });

      it('TTC-011: 所有者权益字段类型', () => {
        const item: BalanceSheetItem = createMinimalBalanceSheet({
          total_share: 50000000000,
          cap_rese: 800000000000,
          undistr_porfit: 1328901234567,
        });

        expect(typeof item.total_share).toBe('number');
        expect(typeof item.cap_rese).toBe('number');
        expect(typeof item.undistr_porfit).toBe('number');
      });
    });

    describe('TC-021: CashFlowItem类型测试', () => {
      it('TTC-013: 必填字段完整性', () => {
        const item: CashFlowItem = createMinimalCashFlow();

        expect(item.ts_code).toBeDefined();
        expect(item.ann_date).toBeDefined();
        expect(item.f_ann_date).toBeDefined();
        expect(item.end_date).toBeDefined();
        expect(item.comp_type).toBeDefined();
        expect(item.report_type).toBeDefined();
        expect(item.end_type).toBeDefined();
      });

      it('TTC-014: 经营活动现金流字段类型', () => {
        const item: CashFlowItem = createMinimalCashFlow({
          n_cashflow_act: 60000000000,
          c_fr_sale_sg: 200000000000,
          c_paid_goods_s: 100000000000,
        });

        expect(typeof item.n_cashflow_act).toBe('number');
        expect(typeof item.c_fr_sale_sg).toBe('number');
        expect(typeof item.c_paid_goods_s).toBe('number');
      });

      it('TTC-015: 投资活动现金流字段类型', () => {
        const item: CashFlowItem = createMinimalCashFlow({
          n_cashflow_inv_act: -30000000000,
          c_pay_acq_const_fiolta: 35000000000,
        });

        expect(typeof item.n_cashflow_inv_act).toBe('number');
        expect(typeof item.c_pay_acq_const_fiolta).toBe('number');
      });

      it('TTC-016: 筹资活动现金流字段类型', () => {
        const item: CashFlowItem = createMinimalCashFlow({
          n_cash_flows_fnc_act: 15000000000,
          c_recp_borrow: 50000000000,
          c_prepay_amt_borr: 35000000000,
        });

        expect(typeof item.n_cash_flows_fnc_act).toBe('number');
        expect(typeof item.c_recp_borrow).toBe('number');
        expect(typeof item.c_prepay_amt_borr).toBe('number');
      });

      it('TTC-017: 现金汇总字段类型', () => {
        const item: CashFlowItem = createMinimalCashFlow({
          n_incr_cash_cash_equ: 45000000000,
          c_cash_equ_beg_period: 100000000000,
          c_cash_equ_end_period: 145000000000,
        });

        expect(typeof item.n_incr_cash_cash_equ).toBe('number');
        expect(typeof item.c_cash_equ_beg_period).toBe('number');
        expect(typeof item.c_cash_equ_end_period).toBe('number');
      });
    });

    describe('TC-022: FinancialQueryParams类型测试', () => {
      it('TTC-019: 参数类型定义', () => {
        // 验证参数对象可以正确创建
        const params1 = { ts_code: '000001.SZ' };
        const params2 = { period: '20231231' };
        const params3 = {
          ts_code: '000001.SZ',
          start_date: '20230101',
          end_date: '20231231',
        };

        expect(params1.ts_code).toBe('000001.SZ');
        expect(params2.period).toBe('20231231');
        expect(params3.start_date).toBe('20230101');
      });

      it('TTC-020: report_type字面量类型', () => {
        // TypeScript应该只接受 '1' | '2' | '3' | '4'
        const validReportTypes = ['1', '2', '3', '4'] as const;

        validReportTypes.forEach((reportType) => {
          const params = {
            ts_code: '000001.SZ',
            report_type: reportType,
          };
          expect(params.report_type).toBe(reportType);
        });
      });

      it('TTC-021: 参数可选性验证', () => {
        // 所有参数都应该是可选的
        const params1 = {};
        const params2 = { ts_code: '000001.SZ' };
        const params3 = {
          ts_code: '000001.SZ',
          period: '20231231',
          report_type: '1' as const,
        };

        expect(Object.keys(params1).length).toBe(0);
        expect(Object.keys(params2).length).toBe(1);
        expect(Object.keys(params3).length).toBe(3);
      });
    });
  });

  // ==========================================================================
  // User Story 4: TushareClient类方法测试
  // ==========================================================================

  describe('TushareClient类方法测试', () => {
    describe('TC-023: client.getIncomeStatement方法测试', () => {
      it('应该正确调用getIncomeStatement函数', async () => {
        const mockData = [createMinimalIncomeStatement()];
        mockQuery.mockResolvedValue(mockData);

        const params = { ts_code: '000001.SZ', period: '20231231' };
        const result = await client.getIncomeStatement(params);

        expect(mockQuery).toHaveBeenCalledWith('income', params);
        expect(result).toEqual(mockData);
      });

      it('应该支持不传参数', async () => {
        mockQuery.mockResolvedValue([]);

        const result = await client.getIncomeStatement();

        expect(mockQuery).toHaveBeenCalledWith('income', undefined);
        expect(result).toEqual([]);
      });
    });

    describe('TC-024: client.getBalanceSheet方法测试', () => {
      it('应该正确调用getBalanceSheet函数', async () => {
        const mockData = [createMinimalBalanceSheet()];
        mockQuery.mockResolvedValue(mockData);

        const params = { ts_code: '000001.SZ', period: '20231231' };
        const result = await client.getBalanceSheet(params);

        expect(mockQuery).toHaveBeenCalledWith('balancesheet', params);
        expect(result).toEqual(mockData);
      });
    });

    describe('TC-025: client.getCashFlow方法测试', () => {
      it('应该正确调用getCashFlow函数', async () => {
        const mockData = [createMinimalCashFlow()];
        mockQuery.mockResolvedValue(mockData);

        const params = { ts_code: '000001.SZ', period: '20231231' };
        const result = await client.getCashFlow(params);

        expect(mockQuery).toHaveBeenCalledWith('cashflow', params);
        expect(result).toEqual(mockData);
      });
    });
  });

  // ==========================================================================
  // User Story 5: 边界条件和错误处理测试
  // ==========================================================================

  describe('边界条件和错误处理测试', () => {
    describe('空参数边界条件', () => {
      it('应该正确处理空对象参数', async () => {
        mockQuery.mockResolvedValue([]);

        const result = await getIncomeStatement(client, {});

        expect(mockQuery).toHaveBeenCalledWith('income', {});
        expect(result).toEqual([]);
      });

      it('应该正确处理空字符串ts_code', async () => {
        mockQuery.mockResolvedValue([]);

        const result = await getIncomeStatement(client, { ts_code: '' });

        expect(mockQuery).toHaveBeenCalledWith('income', { ts_code: '' });
      });
    });

    describe('null值处理测试', () => {
      it('应该正确处理包含undefined可选字段的数据', async () => {
        const mockData: IncomeStatementItem[] = [
          createMinimalIncomeStatement({
            basic_eps: undefined,
            total_revenue: undefined,
          }),
        ];
        mockQuery.mockResolvedValue(mockData);

        const result = await getIncomeStatement(client, { ts_code: '000001.SZ' });

        expect(result[0].basic_eps).toBeUndefined();
        expect(result[0].total_revenue).toBeUndefined();
      });
    });

    describe('特殊数值测试', () => {
      it('应该正确处理负数值(如亏损)', async () => {
        const mockData: IncomeStatementItem[] = [
          createMinimalIncomeStatement({
            n_income: -1000000000, // 净利润为负
            n_income_attr_p: -800000000,
          }),
        ];
        mockQuery.mockResolvedValue(mockData);

        const result = await getIncomeStatement(client, { ts_code: '000001.SZ' });

        expect(result[0].n_income).toBe(-1000000000);
        expect(result[0].n_income_attr_p).toBe(-800000000);
      });

      it('应该正确处理零值', async () => {
        const mockData: CashFlowItem[] = [
          createMinimalCashFlow({
            n_incr_cash_cash_equ: 0, // 现金净增加额为0
          }),
        ];
        mockQuery.mockResolvedValue(mockData);

        const result = await getCashFlow(client, { ts_code: '000001.SZ' });

        expect(result[0].n_incr_cash_cash_equ).toBe(0);
      });

      it('应该正确处理极大数值', async () => {
        const mockData: BalanceSheetItem[] = [
          createMinimalBalanceSheet({
            total_assets: 999999999999999, // 极大的资产值
          }),
        ];
        mockQuery.mockResolvedValue(mockData);

        const result = await getBalanceSheet(client, { ts_code: '600519.SH' });

        expect(result[0].total_assets).toBe(999999999999999);
      });
    });
  });
});
