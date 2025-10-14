import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleFinancial } from '../../../src/handlers/financial.handler';
import { TushareClient } from '@hestudy/tushare-sdk';

// Mock TushareClient
vi.mock('@hestudy/tushare-sdk', () => ({
  TushareClient: vi.fn(),
}));

// Mock logger
vi.mock('../../../src/utils/logger', () => ({
  createLogger: () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

describe('Financial Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.TUSHARE_TOKEN = 'test_token';
  });

  describe('Income Statement (利润表)', () => {
    it('should return structured income data for valid request', async () => {
      const mockIncomeData = {
        items: [
          {
            ts_code: '600519.SH',
            end_date: '20231231',
            total_revenue: 149371000000,
            revenue: 149371000000,
            operate_profit: 89371000000,
            total_profit: 89500000000,
            n_income: 74982000000,
          },
        ],
      };

      const mockGetIncomeStatement = vi.fn().mockResolvedValue(mockIncomeData.items);
      (TushareClient as any).mockImplementation(() => ({
        getIncomeStatement: mockGetIncomeStatement,
      }));

      const result = await handleFinancial({
        ts_code: '600519.SH',
        period: '20231231',
        report_type: 'income',
      });

      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
      expect(result.structuredContent).toBeDefined();
      expect(result.structuredContent.ts_code).toBe('600519.SH');
      expect(result.structuredContent.end_date).toBe('20231231');
      expect(mockGetIncomeStatement).toHaveBeenCalledWith({
        ts_code: '600519.SH',
        period: '20231231',
      });
    });
  });

  describe('Balance Sheet (资产负债表)', () => {
    it('should return structured balance sheet data for valid request', async () => {
      const mockBalanceData = {
        items: [
          {
            ts_code: '600519.SH',
            end_date: '20231231',
            total_assets: 280000000000,
            total_cur_assets: 180000000000,
            total_liab: 80000000000,
            total_hldr_eqy_exc_min_int: 200000000000,
          },
        ],
      };

      const mockGetBalanceSheet = vi.fn().mockResolvedValue(mockBalanceData.items);
      (TushareClient as any).mockImplementation(() => ({
        getBalanceSheet: mockGetBalanceSheet,
      }));

      const result = await handleFinancial({
        ts_code: '600519.SH',
        period: '20231231',
        report_type: 'balance',
      });

      expect(result.content).toBeDefined();
      expect(result.structuredContent).toBeDefined();
      expect(result.structuredContent.ts_code).toBe('600519.SH');
      expect(mockGetBalanceSheet).toHaveBeenCalled();
    });
  });

  describe('Cash Flow Statement (现金流量表)', () => {
    it('should return structured cashflow data for valid request', async () => {
      const mockCashflowData = {
        items: [
          {
            ts_code: '600519.SH',
            end_date: '20231231',
            n_cashflow_act: 95000000000,
            n_cashflow_inv_act: -15000000000,
            n_cash_flows_fnc_act: -50000000000,
          },
        ],
      };

      const mockGetCashFlow = vi.fn().mockResolvedValue(mockCashflowData.items);
      (TushareClient as any).mockImplementation(() => ({
        getCashFlow: mockGetCashFlow,
      }));

      const result = await handleFinancial({
        ts_code: '600519.SH',
        period: '20231231',
        report_type: 'cashflow',
      });

      expect(result.content).toBeDefined();
      expect(result.structuredContent).toBeDefined();
      expect(result.structuredContent.ts_code).toBe('600519.SH');
      expect(mockGetCashFlow).toHaveBeenCalled();
    });
  });

  describe('Validation Errors', () => {
    it('should return VALIDATION_ERROR for invalid ts_code format', async () => {
      const result = await handleFinancial({
        ts_code: 'INVALID',
        period: '20231231',
        report_type: 'income',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('股票代码格式错误');
    });

    it('should return VALIDATION_ERROR for invalid period format', async () => {
      const result = await handleFinancial({
        ts_code: '600519.SH',
        period: '20231212', // 不是季度末
        report_type: 'income',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('报告期格式错误');
    });

    it('should return VALIDATION_ERROR for invalid report_type', async () => {
      const result = await handleFinancial({
        ts_code: '600519.SH',
        period: '20231231',
        report_type: 'invalid_type',
      });

      expect(result.isError).toBe(true);
    });
  });

  describe('Data Not Found', () => {
    it('should return DATA_NOT_FOUND when API returns empty data', async () => {
      const mockGetIncomeStatement = vi.fn().mockResolvedValue([]);
      (TushareClient as any).mockImplementation(() => ({
        getIncomeStatement: mockGetIncomeStatement,
      }));

      const result = await handleFinancial({
        ts_code: '600519.SH',
        period: '20231231',
        report_type: 'income',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('未披露');
    });
  });

  describe('Auth Error', () => {
    it('should return AUTH_ERROR for permission errors', async () => {
      const mockGetIncomeStatement = vi
        .fn()
        .mockRejectedValue(new Error('积分不足或权限不够'));
      (TushareClient as any).mockImplementation(() => ({
        getIncomeStatement: mockGetIncomeStatement,
      }));

      const result = await handleFinancial({
        ts_code: '600519.SH',
        period: '20231231',
        report_type: 'income',
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('权限');
    });
  });
});
