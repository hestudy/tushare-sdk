/**
 * 基础使用示例
 * 
 * 演示如何使用 Tushare TypeScript SDK
 */

import { TushareClient } from '@tushare/sdk';

// 创建客户端实例
const client = new TushareClient({
  token: process.env.TUSHARE_TOKEN || 'YOUR_TOKEN_HERE',
  cache: {
    enabled: true,
    ttl: 3600000, // 缓存 1 小时
  },
  retry: {
    maxRetries: 3,
    initialDelay: 1000,
  },
  concurrency: {
    maxConcurrent: 5,
    minInterval: 200,
  },
});

/**
 * 示例 1: 获取股票列表
 */
async function example1() {
  console.log('\n=== 示例 1: 获取上交所上市股票 ===');
  
  try {
    const stocks = await client.getStockBasic({
      list_status: 'L',
      exchange: 'SSE',
    });
    
    console.log(`共获取 ${stocks.length} 只股票`);
    console.log('前 3 只股票:', stocks.slice(0, 3));
  } catch (error) {
    console.error('获取股票列表失败:', error);
  }
}

/**
 * 示例 2: 获取日线行情
 */
async function example2() {
  console.log('\n=== 示例 2: 获取平安银行历史行情 ===');
  
  try {
    const quotes = await client.getDailyQuote({
      ts_code: '000001.SZ',
      start_date: '20240101',
      end_date: '20241231',
    });
    
    console.log(`共获取 ${quotes.length} 条行情数据`);
    if (quotes.length > 0) {
      console.log('最新行情:', quotes[0]);
    }
  } catch (error) {
    console.error('获取行情数据失败:', error);
  }
}

/**
 * 示例 3: 使用通用查询方法
 */
async function example3() {
  console.log('\n=== 示例 3: 查询交易日历 ===');
  
  try {
    const calendar = await client.query('trade_cal', {
      exchange: 'SSE',
      start_date: '20240101',
      end_date: '20240131',
      is_open: '1',
    });
    
    console.log(`2024年1月共 ${calendar.length} 个交易日`);
  } catch (error) {
    console.error('查询交易日历失败:', error);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('Tushare TypeScript SDK - 基础使用示例');
  console.log('========================================');
  
  // 检查 Token
  if (!process.env.TUSHARE_TOKEN) {
    console.warn('\n⚠️  警告: 未设置 TUSHARE_TOKEN 环境变量');
    console.warn('请设置环境变量或在代码中替换 YOUR_TOKEN_HERE\n');
  }
  
  await example1();
  await example2();
  await example3();
  
  console.log('\n✅ 所有示例执行完成!');
}

// 运行示例
main().catch(console.error);
