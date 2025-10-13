/**
 * 财务数据查询示例
 *
 * 演示如何使用 Tushare SDK 查询利润表、资产负债表、现金流量表等财务数据
 */

import { TushareClient } from '@hestudy/tushare-sdk';
import type { AppConfig } from '../config.js';
import { logApiRequest, logApiResponse, logVerbose } from '../utils/logger.js';
import { printError } from '../utils/error-handler.js';

/**
 * 财务数据示例返回结果
 */
export interface FinancialDataResult {
  /**
   * 三大报表查询结果
   */
  reports: {
    /**
     * 利润表数据数组
     */
    incomeStatement: unknown[];

    /**
     * 资产负债表数据数组
     */
    balanceSheet: unknown[];

    /**
     * 现金流量表数据数组
     */
    cashFlow: unknown[];
  };

  /**
   * 基于原始数据计算的财务指标
   */
  calculatedMetrics: {
    /**
     * 净利率 (净利润 / 营业收入)
     */
    netProfitMargin?: number;

    /**
     * 流动比率 (流动资产 / 流动负债)
     */
    currentRatio?: number;

    /**
     * 速动比率 ((流动资产 - 存货) / 流动负债)
     */
    quickRatio?: number;

    /**
     * 资产负债率 (负债合计 / 总资产)
     */
    debtRatio?: number;

    /**
     * ROE (简化) (净利润 / 未分配利润)
     */
    roe?: number;
  };

  /**
   * 执行摘要
   */
  summary: {
    /**
     * 查询到的总记录数(跨所有报表)
     */
    totalRecords: number;

    /**
     * 成功查询的报表类型数量
     */
    reportTypes: number;

    /**
     * 是否完成综合分析
     */
    analysisComplete: boolean;

    /**
     * 查询的股票代码列表
     */
    stockCodes: string[];

    /**
     * 查询的报告期列表
     */
    periods: string[];
  };
}

/**
 * 计算财务指标
 *
 * @param reports - 三大报表数据
 * @returns 计算的财务指标
 */
function calculateMetrics(reports: FinancialDataResult['reports']): FinancialDataResult['calculatedMetrics'] {
  const metrics: FinancialDataResult['calculatedMetrics'] = {};

  // 净利率
  if (reports.incomeStatement.length > 0) {
    const income = reports.incomeStatement[0] as any;
    if (income.total_revenue && income.n_income_attr_p) {
      metrics.netProfitMargin = (income.n_income_attr_p / income.total_revenue) * 100;
    }
  }

  // 流动比率、速动比率、资产负债率
  if (reports.balanceSheet.length > 0) {
    const balance = reports.balanceSheet[0] as any;

    if (balance.total_cur_assets && balance.total_cur_liab) {
      metrics.currentRatio = balance.total_cur_assets / balance.total_cur_liab;
    }

    if (balance.total_cur_assets && balance.inventories && balance.total_cur_liab) {
      metrics.quickRatio = (balance.total_cur_assets - balance.inventories) / balance.total_cur_liab;
    }

    if (balance.total_cur_liab && balance.total_ncl && balance.total_assets) {
      metrics.debtRatio = ((balance.total_cur_liab + balance.total_ncl) / balance.total_assets) * 100;
    }
  }

  // ROE (简化计算)
  if (reports.incomeStatement.length > 0 && reports.balanceSheet.length > 0) {
    const income = reports.incomeStatement[0] as any;
    const balance = reports.balanceSheet[0] as any;
    if (income.n_income_attr_p && balance.undistr_porfit) {
      metrics.roe = (income.n_income_attr_p / balance.undistr_porfit) * 100;
    }
  }

  logVerbose('财务指标计算完成', metrics);

  return metrics;
}

/**
 * 构建摘要信息
 *
 * @param reports - 三大报表数据
 * @returns 摘要信息
 */
function buildSummary(reports: FinancialDataResult['reports']): FinancialDataResult['summary'] {
  const totalRecords =
    reports.incomeStatement.length +
    reports.balanceSheet.length +
    reports.cashFlow.length;

  const reportTypes =
    (reports.incomeStatement.length > 0 ? 1 : 0) +
    (reports.balanceSheet.length > 0 ? 1 : 0) +
    (reports.cashFlow.length > 0 ? 1 : 0);

  const stockCodes = Array.from(new Set([
    ...reports.incomeStatement.map((item: any) => item.ts_code),
    ...reports.balanceSheet.map((item: any) => item.ts_code),
    ...reports.cashFlow.map((item: any) => item.ts_code),
  ]));

  const periods = Array.from(new Set([
    ...reports.incomeStatement.map((item: any) => item.end_date),
    ...reports.balanceSheet.map((item: any) => item.end_date),
    ...reports.cashFlow.map((item: any) => item.end_date),
  ]));

  return {
    totalRecords,
    reportTypes,
    analysisComplete: reportTypes > 0,
    stockCodes,
    periods,
  };
}

/**
 * 执行财务数据查询示例
 *
 * @param config - 应用配置
 * @returns 财务数据查询结果
 */
export async function runFinancialDataExample(config: AppConfig): Promise<FinancialDataResult> {
  const client = new TushareClient({
    token: config.tushareToken,
    endpoint: config.apiBaseUrl,
  });

  // 初始化结果对象
  const result: FinancialDataResult = {
    reports: {
      incomeStatement: [],
      balanceSheet: [],
      cashFlow: [],
    },
    calculatedMetrics: {},
    summary: {
      totalRecords: 0,
      reportTypes: 0,
      analysisComplete: false,
      stockCodes: [],
      periods: [],
    },
  };

  try {
    // 1. 查询利润表
    const incomeParams = {
      ts_code: '000001.SZ',
      period: '20231231'
    };
    logApiRequest('getIncomeStatement', incomeParams);
    const startTime1 = Date.now();
    result.reports.incomeStatement = await client.getIncomeStatement(incomeParams);
    logApiResponse('getIncomeStatement', result.reports.incomeStatement, Date.now() - startTime1);

    // 2. 查询资产负债表
    const balanceParams = {
      ts_code: '600519.SH',
      period: '20231231'
    };
    logApiRequest('getBalanceSheet', balanceParams);
    const startTime2 = Date.now();
    result.reports.balanceSheet = await client.getBalanceSheet(balanceParams);
    logApiResponse('getBalanceSheet', result.reports.balanceSheet, Date.now() - startTime2);

    // 3. 查询现金流量表
    const cashflowParams = {
      ts_code: '000001.SZ',
      start_date: '20230101',
      end_date: '20231231'
    };
    logApiRequest('getCashFlow', cashflowParams);
    const startTime3 = Date.now();
    result.reports.cashFlow = await client.getCashFlow(cashflowParams);
    logApiResponse('getCashFlow', result.reports.cashFlow, Date.now() - startTime3);

    // 4. 计算财务指标
    result.calculatedMetrics = calculateMetrics(result.reports);

    // 5. 构建摘要
    result.summary = buildSummary(result.reports);

    return result;

  } catch (error) {
    printError(error);
    throw error;  // 让 example-runner 统一处理
  }
}
