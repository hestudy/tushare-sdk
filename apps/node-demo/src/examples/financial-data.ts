/**
 * 财务数据查询示例
 *
 * 演示如何使用 Tushare SDK 查询利润表、资产负债表、现金流量表等财务数据
 */

import { TushareClient } from '@hestudy/tushare-sdk';
import { loadConfig } from '../config.js';

/**
 * 示例1: 查询利润表数据
 */
async function queryIncomeStatement() {
  console.log('\n========== 示例1: 查询利润表数据 ==========\n');

  const config = loadConfig();
  const client = new TushareClient({ token: config.tushareToken });

  try {
    // 查询平安银行 (000001.SZ) 的2023年年报利润表
    const data = await client.getIncomeStatement({
      ts_code: '000001.SZ',
      period: '20231231'
    });

    if (data.length > 0) {
      const income = data[0];
      console.log(`股票代码: ${income.ts_code}`);
      console.log(`报告期: ${income.end_date}`);
      console.log(`公告日期: ${income.ann_date}`);
      console.log(`营业总收入: ${income.total_revenue?.toLocaleString()} 元`);
      console.log(`营业收入: ${income.revenue?.toLocaleString()} 元`);
      console.log(`净利润(归母): ${income.n_income_attr_p?.toLocaleString()} 元`);
      console.log(`基本每股收益: ${income.basic_eps} 元/股`);
      console.log(`稀释每股收益: ${income.diluted_eps} 元/股`);

      // 计算净利率
      if (income.total_revenue && income.n_income_attr_p) {
        const netMargin = ((income.n_income_attr_p / income.total_revenue) * 100).toFixed(2);
        console.log(`净利率: ${netMargin}%`);
      }
    } else {
      console.log('未查询到数据');
    }
  } catch (error) {
    console.error('查询利润表失败:', error);
  }
}

/**
 * 示例2: 查询资产负债表数据
 */
async function queryBalanceSheet() {
  console.log('\n========== 示例2: 查询资产负债表数据 ==========\n');

  const config = loadConfig();
  const client = new TushareClient({ token: config.tushareToken });

  try {
    // 查询贵州茅台 (600519.SH) 的资产负债表
    const data = await client.getBalanceSheet({
      ts_code: '600519.SH',
      period: '20231231'
    });

    if (data.length > 0) {
      const balance = data[0];
      console.log(`股票代码: ${balance.ts_code}`);
      console.log(`报告期: ${balance.end_date}`);
      console.log(`总资产: ${balance.total_assets?.toLocaleString()} 元`);
      console.log(`流动资产: ${balance.total_cur_assets?.toLocaleString()} 元`);
      console.log(`非流动资产: ${balance.total_nca?.toLocaleString()} 元`);
      console.log(`流动负债: ${balance.total_cur_liab?.toLocaleString()} 元`);
      console.log(`非流动负债: ${balance.total_ncl?.toLocaleString()} 元`);
      console.log(`货币资金: ${balance.money_cap?.toLocaleString()} 元`);
      console.log(`存货: ${balance.inventories?.toLocaleString()} 元`);

      // 计算财务比率
      if (balance.total_cur_assets && balance.total_cur_liab) {
        const currentRatio = (balance.total_cur_assets / balance.total_cur_liab).toFixed(2);
        console.log(`流动比率: ${currentRatio}`);
      }

      if (balance.total_cur_assets && balance.inventories && balance.total_cur_liab) {
        const quickRatio = ((balance.total_cur_assets - balance.inventories) / balance.total_cur_liab).toFixed(2);
        console.log(`速动比率: ${quickRatio}`);
      }

      if (balance.total_cur_liab && balance.total_ncl && balance.total_assets) {
        const debtRatio = (((balance.total_cur_liab + balance.total_ncl) / balance.total_assets) * 100).toFixed(2);
        console.log(`资产负债率: ${debtRatio}%`);
      }
    } else {
      console.log('未查询到数据');
    }
  } catch (error) {
    console.error('查询资产负债表失败:', error);
  }
}

/**
 * 示例3: 查询现金流量表数据
 */
async function queryCashFlow() {
  console.log('\n========== 示例3: 查询现金流量表数据 ==========\n');

  const config = loadConfig();
  const client = new TushareClient({ token: config.tushareToken });

  try {
    // 查询平安银行的现金流量表(时间序列)
    const data = await client.getCashFlow({
      ts_code: '000001.SZ',
      start_date: '20230101',
      end_date: '20231231'
    });

    console.log(`共查询到 ${data.length} 个报告期的数据\n`);

    data.forEach((item, index) => {
      console.log(`--- 第 ${index + 1} 个报告期 ---`);
      console.log(`报告期: ${item.end_date}`);
      console.log(`经营活动现金流: ${item.n_cashflow_act?.toLocaleString()} 元`);
      console.log(`投资活动现金流: ${item.n_cashflow_inv_act?.toLocaleString()} 元`);
      console.log(`筹资活动现金流: ${item.n_cash_flows_fnc_act?.toLocaleString()} 元`);
      console.log(`现金净增加额: ${item.n_incr_cash_cash_equ?.toLocaleString()} 元`);
      if (item.free_cashflow !== undefined && item.free_cashflow !== null) {
        console.log(`自由现金流: ${item.free_cashflow.toLocaleString()} 元`);
      }
      console.log('');
    });
  } catch (error) {
    console.error('查询现金流量表失败:', error);
  }
}

/**
 * 示例4: 综合财务分析
 */
async function comprehensiveFinancialAnalysis() {
  console.log('\n========== 示例4: 综合财务分析 ==========\n');

  const config = loadConfig();
  const client = new TushareClient({ token: config.tushareToken });
  const tsCode = '600519.SH'; // 贵州茅台
  const period = '20231231';

  try {
    console.log(`分析股票: ${tsCode} - 报告期: ${period}\n`);

    // 并行查询三大报表
    const [incomeData, balanceData, cashflowData] = await Promise.all([
      client.getIncomeStatement({ ts_code: tsCode, period }),
      client.getBalanceSheet({ ts_code: tsCode, period }),
      client.getCashFlow({ ts_code: tsCode, period })
    ]);

    if (incomeData.length === 0 || balanceData.length === 0) {
      console.log('未找到完整的财务数据');
      return;
    }

    const income = incomeData[0];
    const balance = balanceData[0];
    const cashflow = cashflowData[0] || {};

    console.log('一、盈利能力指标');
    console.log('─'.repeat(50));
    if (income.total_revenue && income.n_income_attr_p) {
      const netProfitMargin = ((income.n_income_attr_p / income.total_revenue) * 100).toFixed(2);
      console.log(`净利率: ${netProfitMargin}%`);
    }
    if (income.n_income_attr_p && balance.undistr_porfit) {
      const roe = ((income.n_income_attr_p / balance.undistr_porfit) * 100).toFixed(2);
      console.log(`ROE (简化): ${roe}%`);
    }
    console.log(`营业收入: ${income.total_revenue?.toLocaleString()} 元`);
    console.log(`净利润: ${income.n_income_attr_p?.toLocaleString()} 元`);
    console.log(`每股收益: ${income.basic_eps} 元/股`);

    console.log('\n二、偿债能力指标');
    console.log('─'.repeat(50));
    if (balance.total_cur_assets && balance.total_cur_liab) {
      const currentRatio = (balance.total_cur_assets / balance.total_cur_liab).toFixed(2);
      console.log(`流动比率: ${currentRatio}`);
    }
    if (balance.total_cur_assets && balance.inventories && balance.total_cur_liab) {
      const quickRatio = ((balance.total_cur_assets - balance.inventories) / balance.total_cur_liab).toFixed(2);
      console.log(`速动比率: ${quickRatio}`);
    }
    if (balance.total_cur_liab && balance.total_ncl && balance.total_assets) {
      const debtRatio = (((balance.total_cur_liab + balance.total_ncl) / balance.total_assets) * 100).toFixed(2);
      console.log(`资产负债率: ${debtRatio}%`);
    }

    console.log('\n三、现金流指标');
    console.log('─'.repeat(50));
    console.log(`经营活动现金流: ${cashflow.n_cashflow_act?.toLocaleString() || 'N/A'} 元`);
    console.log(`投资活动现金流: ${cashflow.n_cashflow_inv_act?.toLocaleString() || 'N/A'} 元`);
    console.log(`筹资活动现金流: ${cashflow.n_cash_flows_fnc_act?.toLocaleString() || 'N/A'} 元`);
    if (cashflow.free_cashflow !== undefined) {
      console.log(`自由现金流: ${cashflow.free_cashflow.toLocaleString()} 元`);
    }

    console.log('\n四、资产结构');
    console.log('─'.repeat(50));
    console.log(`总资产: ${balance.total_assets?.toLocaleString()} 元`);
    console.log(`流动资产: ${balance.total_cur_assets?.toLocaleString()} 元`);
    console.log(`货币资金: ${balance.money_cap?.toLocaleString()} 元`);
    console.log(`存货: ${balance.inventories?.toLocaleString()} 元`);
    console.log(`固定资产: ${balance.fix_assets?.toLocaleString()} 元`);

  } catch (error) {
    console.error('综合财务分析失败:', error);
  }
}

/**
 * 示例5: 多期财务数据对比
 */
async function multiPeriodComparison() {
  console.log('\n========== 示例5: 多期财务数据对比 ==========\n');

  const config = loadConfig();
  const client = new TushareClient({ token: config.tushareToken });
  const tsCode = '600519.SH'; // 贵州茅台
  const periods = ['20211231', '20221231', '20231231'];

  try {
    console.log(`股票代码: ${tsCode}\n`);
    console.log('年度\t\t营业收入(亿元)\t净利润(亿元)\t净利率\t\tEPS');
    console.log('='.repeat(80));

    for (const period of periods) {
      const data = await client.getIncomeStatement({
        ts_code: tsCode,
        period
      });

      if (data.length > 0) {
        const income = data[0];
        const year = period.substring(0, 4);
        const revenue = income.total_revenue ? (income.total_revenue / 100000000).toFixed(2) : 'N/A';
        const profit = income.n_income_attr_p ? (income.n_income_attr_p / 100000000).toFixed(2) : 'N/A';
        const margin = (income.total_revenue && income.n_income_attr_p)
          ? ((income.n_income_attr_p / income.total_revenue) * 100).toFixed(2) + '%'
          : 'N/A';
        const eps = income.basic_eps?.toFixed(2) || 'N/A';

        console.log(`${year}\t\t${revenue}\t\t${profit}\t\t${margin}\t\t${eps}`);
      }
    }
  } catch (error) {
    console.error('多期对比失败:', error);
  }
}

/**
 * 运行所有示例
 */
export async function runFinancialExamples() {
  console.log('\n' + '='.repeat(60));
  console.log('财务数据查询示例');
  console.log('='.repeat(60));

  await queryIncomeStatement();
  await queryBalanceSheet();
  await queryCashFlow();
  await comprehensiveFinancialAnalysis();
  await multiPeriodComparison();

  console.log('\n' + '='.repeat(60));
  console.log('所有示例运行完成!');
  console.log('='.repeat(60) + '\n');
}

// 如果直接运行此文件,执行所有示例
if (import.meta.url === `file://${process.argv[1]}`) {
  runFinancialExamples().catch(console.error);
}
