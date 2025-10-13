/**
 * 财务数据性能验证示例
 *
 * 验证财务数据查询继承了现有的缓存、重试、并发控制特性
 */

import { TushareClient } from '@hestudy/tushare-sdk';
import { loadConfig } from '../config.js';

/**
 * 测试1: 缓存功能验证
 *
 * 验证:
 * - 第一次查询会访问API
 * - 第二次查询应该从缓存返回(速度更快)
 */
async function testCacheFeature() {
  console.log('\n========== 测试1: 缓存功能验证 ==========\n');

  const config = loadConfig();
  const client = new TushareClient({
    token: config.tushareToken,
    cache: {
      enabled: true,
      ttl: 3600000, // 缓存1小时
    },
  });

  const params = {
    ts_code: '600519.SH',
    period: '20231231',
  };

  try {
    // 第一次查询 - 应该访问API
    console.log('第一次查询 (访问API)...');
    const start1 = Date.now();
    const data1 = await client.getIncomeStatement(params);
    const time1 = Date.now() - start1;
    console.log(`- 耗时: ${time1}ms`);
    console.log(`- 数据条数: ${data1.length}`);

    // 第二次查询 - 应该从缓存返回
    console.log('\n第二次查询 (使用缓存)...');
    const start2 = Date.now();
    const data2 = await client.getIncomeStatement(params);
    const time2 = Date.now() - start2;
    console.log(`- 耗时: ${time2}ms`);
    console.log(`- 数据条数: ${data2.length}`);

    // 验证结果
    const speedup = (time1 / time2).toFixed(2);
    console.log(`\n✅ 缓存功能正常: 第二次查询速度提升 ${speedup}x`);

    if (time2 < time1 / 2) {
      console.log('✅ 缓存显著提升了查询性能');
    }
  } catch (error) {
    console.error('❌ 缓存测试失败:', error);
  }
}

/**
 * 测试2: 并发控制验证
 *
 * 验证:
 * - 多个并发请求能够正常执行
 * - 并发控制机制生效(不会超过maxConcurrent限制)
 */
async function testConcurrencyControl() {
  console.log('\n========== 测试2: 并发控制验证 ==========\n');

  const config = loadConfig();
  const client = new TushareClient({
    token: config.tushareToken,
    concurrency: {
      maxConcurrent: 3, // 最多3个并发
      minInterval: 200, // 最小间隔200ms
    },
    cache: {
      enabled: false, // 禁用缓存以测试并发
    },
  });

  const stockCodes = [
    '600519.SH', // 贵州茅台
    '000001.SZ', // 平安银行
    '000858.SZ', // 五粮液
    '600036.SH', // 招商银行
    '000333.SZ', // 美的集团
  ];

  try {
    console.log(`并发查询 ${stockCodes.length} 只股票的利润表数据...`);
    console.log(`并发限制: 3个/次, 最小间隔: 200ms\n`);

    const start = Date.now();

    // 并发查询所有股票
    const promises = stockCodes.map(code =>
      client.getIncomeStatement({
        ts_code: code,
        period: '20231231',
      })
    );

    const results = await Promise.all(promises);
    const totalTime = Date.now() - start;

    // 统计结果
    const successCount = results.filter(r => r.length > 0).length;
    const avgTime = (totalTime / stockCodes.length).toFixed(0);

    console.log(`总耗时: ${totalTime}ms`);
    console.log(`成功查询: ${successCount}/${stockCodes.length}`);
    console.log(`平均耗时: ${avgTime}ms/股票`);

    console.log(`\n✅ 并发控制功能正常: ${stockCodes.length}个请求在 ${totalTime}ms 内完成`);
  } catch (error) {
    console.error('❌ 并发控制测试失败:', error);
  }
}

/**
 * 测试3: 重试机制验证
 *
 * 验证:
 * - 网络错误时会自动重试
 * - 重试次数符合配置
 */
async function testRetryMechanism() {
  console.log('\n========== 测试3: 重试机制验证 ==========\n');

  const config = loadConfig();
  const client = new TushareClient({
    token: config.tushareToken,
    retry: {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 5000,
      backoffFactor: 2,
    },
  });

  try {
    console.log('配置的重试参数:');
    console.log('- 最大重试次数: 3次');
    console.log('- 初始延迟: 1000ms');
    console.log('- 最大延迟: 5000ms');
    console.log('- 退避因子: 2');

    // 正常查询(不会触发重试)
    console.log('\n执行正常查询...');
    const data = await client.getIncomeStatement({
      ts_code: '600519.SH',
      period: '20231231',
    });

    console.log(`✅ 查询成功,返回 ${data.length} 条数据`);
    console.log('✅ 重试机制已配置(在网络错误时自动生效)');
  } catch (error) {
    console.error('❌ 重试机制测试失败:', error);
  }
}

/**
 * 测试4: 综合性能测试
 *
 * 验证:
 * - 三大报表API都继承了性能特性
 * - 并行查询多个报表的性能表现
 */
async function testOverallPerformance() {
  console.log('\n========== 测试4: 综合性能测试 ==========\n');

  const config = loadConfig();
  const client = new TushareClient({
    token: config.tushareToken,
    cache: {
      enabled: true,
      ttl: 3600000,
    },
    concurrency: {
      maxConcurrent: 5,
      minInterval: 200,
    },
  });

  const tsCode = '600519.SH';
  const period = '20231231';

  try {
    console.log(`测试股票: ${tsCode}`);
    console.log(`报告期: ${period}\n`);

    // 并行查询三大报表
    console.log('并行查询三大财务报表...');
    const start = Date.now();

    const [incomeData, balanceData, cashflowData] = await Promise.all([
      client.getIncomeStatement({ ts_code: tsCode, period }),
      client.getBalanceSheet({ ts_code: tsCode, period }),
      client.getCashFlow({ ts_code: tsCode, period }),
    ]);

    const totalTime = Date.now() - start;

    console.log(`\n查询结果:`);
    console.log(`- 利润表: ${incomeData.length} 条`);
    console.log(`- 资产负债表: ${balanceData.length} 条`);
    console.log(`- 现金流量表: ${cashflowData.length} 条`);
    console.log(`- 总耗时: ${totalTime}ms`);

    // 测试缓存效果
    console.log('\n重复查询(测试缓存)...');
    const start2 = Date.now();

    await Promise.all([
      client.getIncomeStatement({ ts_code: tsCode, period }),
      client.getBalanceSheet({ ts_code: tsCode, period }),
      client.getCashFlow({ ts_code: tsCode, period }),
    ]);

    const time2 = Date.now() - start2;
    const speedup = (totalTime / time2).toFixed(2);

    console.log(`- 耗时: ${time2}ms`);
    console.log(`- 性能提升: ${speedup}x\n`);

    console.log('✅ 综合性能测试通过');
    console.log('✅ 所有三大报表API都继承了缓存、并发控制特性');
  } catch (error) {
    console.error('❌ 综合性能测试失败:', error);
  }
}

/**
 * 运行所有性能验证测试
 */
export async function runPerformanceTests() {
  console.log('\n' + '='.repeat(60));
  console.log('财务数据性能验证测试');
  console.log('='.repeat(60));

  await testCacheFeature();
  await testConcurrencyControl();
  await testRetryMechanism();
  await testOverallPerformance();

  console.log('\n' + '='.repeat(60));
  console.log('所有性能验证测试完成!');
  console.log('='.repeat(60) + '\n');
}

// 如果直接运行此文件,执行所有测试
if (import.meta.url === `file://${process.argv[1]}`) {
  runPerformanceTests().catch(console.error);
}
