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

  /**
   * 综合财务分析结果 (可选)
   */
  comprehensiveAnalysis?: {
    /**
     * 财务健康度评分 (0-100)
     */
    healthScore?: number;

    /**
     * 健康度评级 (优秀/良好/一般/较差)
     */
    healthGrade?: string;

    /**
     * 分析维度
     */
    dimensions?: {
      profitability?: number;  // 盈利能力
      liquidity?: number;      // 流动性
      solvency?: number;       // 偿债能力
      cashFlow?: number;       // 现金流
    };
  };

  /**
   * 多期对比分析结果 (可选)
   */
  multiPeriodComparison?: {
    /**
     * 对比的报告期数量
     */
    periodCount: number;

    /**
     * 营业收入趋势 (增长率 %)
     */
    revenueGrowth?: number[];

    /**
     * 净利润趋势 (增长率 %)
     */
    profitGrowth?: number[];

    /**
     * 关键指标时间序列
     */
    timeSeries?: {
      periods: string[];
      revenue: number[];
      profit: number[];
      netProfitMargin: number[];
    };
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
 * 综合财务分析 - 基于三大报表进行健康度评估
 *
 * @param reports - 三大报表数据
 * @param metrics - 已计算的财务指标
 * @returns 综合分析结果
 */
function comprehensiveFinancialAnalysis(
  reports: FinancialDataResult['reports'],
  metrics: FinancialDataResult['calculatedMetrics']
): FinancialDataResult['comprehensiveAnalysis'] {
  logVerbose('开始综合财务分析', { reportCount: reports.incomeStatement.length + reports.balanceSheet.length + reports.cashFlow.length });

  const dimensions: any = {};
  let totalScore = 0;
  let dimensionCount = 0;

  // 1. 盈利能力评分 (基于净利率)
  if (metrics.netProfitMargin !== undefined) {
    if (metrics.netProfitMargin > 20) {
      dimensions.profitability = 90;
    } else if (metrics.netProfitMargin > 10) {
      dimensions.profitability = 75;
    } else if (metrics.netProfitMargin > 5) {
      dimensions.profitability = 60;
    } else if (metrics.netProfitMargin > 0) {
      dimensions.profitability = 40;
    } else {
      dimensions.profitability = 20;
    }
    totalScore += dimensions.profitability;
    dimensionCount++;
  }

  // 2. 流动性评分 (基于流动比率和速动比率)
  if (metrics.currentRatio !== undefined) {
    if (metrics.currentRatio > 2.0) {
      dimensions.liquidity = 90;
    } else if (metrics.currentRatio > 1.5) {
      dimensions.liquidity = 75;
    } else if (metrics.currentRatio > 1.0) {
      dimensions.liquidity = 60;
    } else {
      dimensions.liquidity = 30;
    }
    totalScore += dimensions.liquidity;
    dimensionCount++;
  }

  // 3. 偿债能力评分 (基于资产负债率)
  if (metrics.debtRatio !== undefined) {
    if (metrics.debtRatio < 30) {
      dimensions.solvency = 90;
    } else if (metrics.debtRatio < 50) {
      dimensions.solvency = 75;
    } else if (metrics.debtRatio < 70) {
      dimensions.solvency = 60;
    } else {
      dimensions.solvency = 40;
    }
    totalScore += dimensions.solvency;
    dimensionCount++;
  }

  // 4. 现金流评分 (基于经营活动现金流)
  if (reports.cashFlow.length > 0) {
    const cashFlow = reports.cashFlow[0] as any;
    if (cashFlow.n_cashflow_act !== undefined && cashFlow.n_cashflow_act !== null) {
      if (cashFlow.n_cashflow_act > 0) {
        dimensions.cashFlow = 80;
      } else {
        dimensions.cashFlow = 40;
      }
      totalScore += dimensions.cashFlow;
      dimensionCount++;
    }
  }

  // 计算综合健康度评分
  const healthScore = dimensionCount > 0 ? Math.round(totalScore / dimensionCount) : undefined;

  // 确定健康度评级
  let healthGrade: string | undefined;
  if (healthScore !== undefined) {
    if (healthScore >= 80) {
      healthGrade = '优秀';
    } else if (healthScore >= 70) {
      healthGrade = '良好';
    } else if (healthScore >= 60) {
      healthGrade = '一般';
    } else {
      healthGrade = '较差';
    }
  }

  logVerbose('综合财务分析完成', { healthScore, healthGrade, dimensions });

  return {
    healthScore,
    healthGrade,
    dimensions: Object.keys(dimensions).length > 0 ? dimensions : undefined,
  };
}

/**
 * 多期对比分析 - 查询多个报告期的数据并进行趋势分析
 *
 * @param client - Tushare 客户端
 * @param ts_code - 股票代码
 * @param periods - 报告期列表 (至少3个)
 * @returns 多期对比分析结果
 */
async function multiPeriodComparison(
  client: TushareClient,
  ts_code: string,
  periods: string[]
): Promise<FinancialDataResult['multiPeriodComparison']> {
  logVerbose('开始多期对比分析', { ts_code, periodCount: periods.length });

  const timeSeries = {
    periods: [] as string[],
    revenue: [] as number[],
    profit: [] as number[],
    netProfitMargin: [] as number[],
  };

  // 并行查询多个报告期的利润表数据
  const promises = periods.map(period => {
    const params = { ts_code, period };
    logApiRequest('getIncomeStatement', params);
    return client.getIncomeStatement(params);
  });

  const results = await Promise.all(promises);

  // 处理查询结果
  results.forEach((data, index) => {
    if (data.length > 0) {
      const income = data[0] as any;
      const period = periods[index];
      if (period !== undefined) {
        timeSeries.periods.push(period);
        timeSeries.revenue.push(income.total_revenue || 0);
        timeSeries.profit.push(income.n_income_attr_p || 0);

        // 计算净利率
        if (income.total_revenue && income.n_income_attr_p) {
          timeSeries.netProfitMargin.push((income.n_income_attr_p / income.total_revenue) * 100);
        } else {
          timeSeries.netProfitMargin.push(0);
        }
      }
    }
  });

  // 计算增长率
  const revenueGrowth: number[] = [];
  const profitGrowth: number[] = [];

  for (let i = 1; i < timeSeries.revenue.length; i++) {
    const prevRevenue = timeSeries.revenue[i - 1];
    const currentRevenue = timeSeries.revenue[i];
    const prevProfit = timeSeries.profit[i - 1];
    const currentProfit = timeSeries.profit[i];

    if (prevRevenue !== undefined && currentRevenue !== undefined && prevRevenue !== 0) {
      const growth = ((currentRevenue - prevRevenue) / prevRevenue) * 100;
      revenueGrowth.push(Math.round(growth * 100) / 100);
    }

    if (prevProfit !== undefined && currentProfit !== undefined && prevProfit !== 0) {
      const growth = ((currentProfit - prevProfit) / prevProfit) * 100;
      profitGrowth.push(Math.round(growth * 100) / 100);
    }
  }

  logVerbose('多期对比分析完成', { periodCount: timeSeries.periods.length, revenueGrowth, profitGrowth });

  return {
    periodCount: timeSeries.periods.length,
    revenueGrowth: revenueGrowth.length > 0 ? revenueGrowth : undefined,
    profitGrowth: profitGrowth.length > 0 ? profitGrowth : undefined,
    timeSeries: timeSeries.periods.length > 0 ? timeSeries : undefined,
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

    // 6. 综合财务分析 (基于三大报表和计算指标)
    result.comprehensiveAnalysis = comprehensiveFinancialAnalysis(result.reports, result.calculatedMetrics);

    // 7. 多期对比分析 (查询多个报告期的数据)
    try {
      const periods = ['20231231', '20230930', '20230630', '20230331']; // 最近4个季度
      result.multiPeriodComparison = await multiPeriodComparison(client, '600519.SH', periods);
    } catch (error) {
      logVerbose('多期对比分析失败', { error });
      // 多期对比失败不影响主流程,继续执行
    }

    return result;

  } catch (error) {
    printError(error);
    throw error;  // 让 example-runner 统一处理
  }
}
