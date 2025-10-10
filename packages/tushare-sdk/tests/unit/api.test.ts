import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TushareClient } from '../../src/client/TushareClient.js';
import { getStockBasic } from '../../src/api/stock.js';
import { getDailyQuote } from '../../src/api/quote.js';
import { getTradeCalendar } from '../../src/api/calendar.js';
import { getFinancialData } from '../../src/api/financial.js';

describe('API 模块测试', () => {
  let client: TushareClient;
  let mockQuery: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    client = new TushareClient({ token: 'test_token' });
    mockQuery = vi.fn();
    // @ts-expect-error - Mocking query method for testing
    client.query = mockQuery;
  });

  describe('stock API', () => {
    it('getStockBasic 应该调用 client.query 并传递正确的参数', async () => {
      const mockData = [
        {
          ts_code: '000001.SZ',
          symbol: '000001',
          name: '平安银行',
          area: '深圳',
          industry: '银行',
          market: '主板',
          list_date: '19910403',
        },
      ];
      mockQuery.mockResolvedValue(mockData);

      const params = {
        list_status: 'L' as const,
        exchange: 'SSE' as const,
      };

      const result = await getStockBasic(client, params);

      expect(mockQuery).toHaveBeenCalledWith('stock_basic', params);
      expect(result).toEqual(mockData);
    });

    it('getStockBasic 应该支持不传参数', async () => {
      const mockData = [
        {
          ts_code: '000001.SZ',
          symbol: '000001',
          name: '平安银行',
          area: '深圳',
          industry: '银行',
          market: '主板',
          list_date: '19910403',
        },
      ];
      mockQuery.mockResolvedValue(mockData);

      const result = await getStockBasic(client);

      expect(mockQuery).toHaveBeenCalledWith('stock_basic', undefined);
      expect(result).toEqual(mockData);
    });
  });

  describe('quote API', () => {
    it('getDailyQuote 应该调用 client.query 并传递正确的参数', async () => {
      const mockData = [
        {
          ts_code: '000001.SZ',
          trade_date: '20230101',
          open: 10.5,
          high: 11.0,
          low: 10.2,
          close: 10.8,
          pre_close: 10.5,
          change: 0.3,
          pct_chg: 2.86,
          vol: 1000000,
          amount: 10800000,
        },
      ];
      mockQuery.mockResolvedValue(mockData);

      const params = {
        ts_code: '000001.SZ',
        start_date: '20230101',
        end_date: '20231231',
      };

      const result = await getDailyQuote(client, params);

      expect(mockQuery).toHaveBeenCalledWith('daily', params);
      expect(result).toEqual(mockData);
    });

    it('getDailyQuote 应该支持仅传 ts_code', async () => {
      const mockData = [
        {
          ts_code: '000001.SZ',
          trade_date: '20230101',
          open: 10.5,
          high: 11.0,
          low: 10.2,
          close: 10.8,
          pre_close: 10.5,
          change: 0.3,
          pct_chg: 2.86,
          vol: 1000000,
          amount: 10800000,
        },
      ];
      mockQuery.mockResolvedValue(mockData);

      const params = {
        ts_code: '000001.SZ',
      };

      const result = await getDailyQuote(client, params);

      expect(mockQuery).toHaveBeenCalledWith('daily', params);
      expect(result).toEqual(mockData);
    });
  });

  describe('calendar API', () => {
    it('getTradeCalendar 应该调用 client.query 并传递正确的参数', async () => {
      const mockData = [
        {
          exchange: 'SSE',
          cal_date: '20230101',
          is_open: '0',
          pretrade_date: '20221230',
        },
        {
          exchange: 'SSE',
          cal_date: '20230102',
          is_open: '1',
          pretrade_date: '20221230',
        },
      ];
      mockQuery.mockResolvedValue(mockData);

      const params = {
        exchange: 'SSE' as const,
        start_date: '20230101',
        end_date: '20231231',
        is_open: '1' as const,
      };

      const result = await getTradeCalendar(client, params);

      expect(mockQuery).toHaveBeenCalledWith('trade_cal', params);
      expect(result).toEqual(mockData);
    });

    it('getTradeCalendar 应该支持不传参数', async () => {
      const mockData = [
        {
          exchange: 'SSE',
          cal_date: '20230101',
          is_open: '0',
          pretrade_date: '20221230',
        },
      ];
      mockQuery.mockResolvedValue(mockData);

      const result = await getTradeCalendar(client);

      expect(mockQuery).toHaveBeenCalledWith('trade_cal', undefined);
      expect(result).toEqual(mockData);
    });

    it('getTradeCalendar 应该支持仅查询交易日', async () => {
      const mockData = [
        {
          exchange: 'SSE',
          cal_date: '20230102',
          is_open: '1',
          pretrade_date: '20221230',
        },
      ];
      mockQuery.mockResolvedValue(mockData);

      const params = {
        exchange: 'SSE' as const,
        is_open: '1' as const,
      };

      const result = await getTradeCalendar(client, params);

      expect(mockQuery).toHaveBeenCalledWith('trade_cal', params);
      expect(result).toEqual(mockData);
    });
  });

  describe('financial API', () => {
    it('getFinancialData 应该调用 client.query 并传递正确的参数', async () => {
      const mockData = [
        {
          ts_code: '000001.SZ',
          ann_date: '20230430',
          f_ann_date: '20230430',
          end_date: '20230331',
          report_type: '1',
          comp_type: '1',
          basic_eps: 0.5,
          diluted_eps: 0.5,
          total_revenue: 1000000000,
          revenue: 1000000000,
          int_income: 800000000,
          prem_earned: 0,
          comm_income: 150000000,
          n_commis_income: 100000000,
          n_oth_income: 50000000,
          n_oth_b_income: 0,
          prem_income: 0,
          out_prem: 0,
          une_prem_reser: 0,
          reins_income: 0,
          n_sec_tb_income: 0,
          n_sec_uw_income: 0,
          n_asset_mg_income: 0,
          oth_b_income: 0,
          fv_value_chg_gain: 0,
          invest_income: 0,
          ass_invest_income: 0,
          forex_gain: 0,
          total_cogs: 600000000,
          oper_cost: 500000000,
          int_exp: 400000000,
          comm_exp: 50000000,
          biz_tax_surchg: 10000000,
          sell_exp: 20000000,
          admin_exp: 30000000,
          fin_exp: 5000000,
          assets_impair_loss: 2000000,
          prem_refund: 0,
          compens_payout: 0,
          reser_insur_liab: 0,
          div_payt: 0,
          reins_exp: 0,
          oper_exp: 0,
          compens_payout_refu: 0,
          insur_reser_refu: 0,
          reins_cost_refund: 0,
          other_bus_cost: 0,
          operate_profit: 400000000,
          non_oper_income: 5000000,
          non_oper_exp: 3000000,
          nca_disploss: 1000000,
          total_profit: 402000000,
          income_tax: 100000000,
          n_income: 302000000,
          n_income_attr_p: 300000000,
          minority_gain: 2000000,
          oth_compr_income: 1000000,
          t_compr_income: 303000000,
          compr_inc_attr_p: 301000000,
          compr_inc_attr_m_s: 2000000,
          ebit: 405000000,
          ebitda: 410000000,
          insurance_exp: 0,
          undist_profit: 200000000,
          distable_profit: 250000000,
          update_flag: '0',
        },
      ];
      mockQuery.mockResolvedValue(mockData);

      const params = {
        ts_code: '000001.SZ',
        report_type: 4 as const,
        start_date: '20200101',
        end_date: '20231231',
      };

      const result = await getFinancialData(client, params);

      expect(mockQuery).toHaveBeenCalledWith('income', params);
      expect(result).toEqual(mockData);
    });

    it('getFinancialData 应该支持按报告期查询', async () => {
      const mockData = [
        {
          ts_code: '000001.SZ',
          ann_date: '20230430',
          f_ann_date: '20230430',
          end_date: '20230331',
          report_type: '1',
          comp_type: '1',
          basic_eps: 0.5,
          diluted_eps: 0.5,
          total_revenue: 1000000000,
          revenue: 1000000000,
          int_income: 800000000,
          prem_earned: 0,
          comm_income: 150000000,
          n_commis_income: 100000000,
          n_oth_income: 50000000,
          n_oth_b_income: 0,
          prem_income: 0,
          out_prem: 0,
          une_prem_reser: 0,
          reins_income: 0,
          n_sec_tb_income: 0,
          n_sec_uw_income: 0,
          n_asset_mg_income: 0,
          oth_b_income: 0,
          fv_value_chg_gain: 0,
          invest_income: 0,
          ass_invest_income: 0,
          forex_gain: 0,
          total_cogs: 600000000,
          oper_cost: 500000000,
          int_exp: 400000000,
          comm_exp: 50000000,
          biz_tax_surchg: 10000000,
          sell_exp: 20000000,
          admin_exp: 30000000,
          fin_exp: 5000000,
          assets_impair_loss: 2000000,
          prem_refund: 0,
          compens_payout: 0,
          reser_insur_liab: 0,
          div_payt: 0,
          reins_exp: 0,
          oper_exp: 0,
          compens_payout_refu: 0,
          insur_reser_refu: 0,
          reins_cost_refund: 0,
          other_bus_cost: 0,
          operate_profit: 400000000,
          non_oper_income: 5000000,
          non_oper_exp: 3000000,
          nca_disploss: 1000000,
          total_profit: 402000000,
          income_tax: 100000000,
          n_income: 302000000,
          n_income_attr_p: 300000000,
          minority_gain: 2000000,
          oth_compr_income: 1000000,
          t_compr_income: 303000000,
          compr_inc_attr_p: 301000000,
          compr_inc_attr_m_s: 2000000,
          ebit: 405000000,
          ebitda: 410000000,
          insurance_exp: 0,
          undist_profit: 200000000,
          distable_profit: 250000000,
          update_flag: '0',
        },
      ];
      mockQuery.mockResolvedValue(mockData);

      const params = {
        ts_code: '000001.SZ',
        period: '20231231',
      };

      const result = await getFinancialData(client, params);

      expect(mockQuery).toHaveBeenCalledWith('income', params);
      expect(result).toEqual(mockData);
    });

    it('getFinancialData 应该支持不传参数', async () => {
      const mockData = [
        {
          ts_code: '000001.SZ',
          ann_date: '20230430',
          f_ann_date: '20230430',
          end_date: '20230331',
          report_type: '1',
          comp_type: '1',
          basic_eps: 0.5,
          diluted_eps: 0.5,
          total_revenue: 1000000000,
          revenue: 1000000000,
          int_income: 800000000,
          prem_earned: 0,
          comm_income: 150000000,
          n_commis_income: 100000000,
          n_oth_income: 50000000,
          n_oth_b_income: 0,
          prem_income: 0,
          out_prem: 0,
          une_prem_reser: 0,
          reins_income: 0,
          n_sec_tb_income: 0,
          n_sec_uw_income: 0,
          n_asset_mg_income: 0,
          oth_b_income: 0,
          fv_value_chg_gain: 0,
          invest_income: 0,
          ass_invest_income: 0,
          forex_gain: 0,
          total_cogs: 600000000,
          oper_cost: 500000000,
          int_exp: 400000000,
          comm_exp: 50000000,
          biz_tax_surchg: 10000000,
          sell_exp: 20000000,
          admin_exp: 30000000,
          fin_exp: 5000000,
          assets_impair_loss: 2000000,
          prem_refund: 0,
          compens_payout: 0,
          reser_insur_liab: 0,
          div_payt: 0,
          reins_exp: 0,
          oper_exp: 0,
          compens_payout_refu: 0,
          insur_reser_refu: 0,
          reins_cost_refund: 0,
          other_bus_cost: 0,
          operate_profit: 400000000,
          non_oper_income: 5000000,
          non_oper_exp: 3000000,
          nca_disploss: 1000000,
          total_profit: 402000000,
          income_tax: 100000000,
          n_income: 302000000,
          n_income_attr_p: 300000000,
          minority_gain: 2000000,
          oth_compr_income: 1000000,
          t_compr_income: 303000000,
          compr_inc_attr_p: 301000000,
          compr_inc_attr_m_s: 2000000,
          ebit: 405000000,
          ebitda: 410000000,
          insurance_exp: 0,
          undist_profit: 200000000,
          distable_profit: 250000000,
          update_flag: '0',
        },
      ];
      mockQuery.mockResolvedValue(mockData);

      const result = await getFinancialData(client);

      expect(mockQuery).toHaveBeenCalledWith('income', undefined);
      expect(result).toEqual(mockData);
    });
  });
});
