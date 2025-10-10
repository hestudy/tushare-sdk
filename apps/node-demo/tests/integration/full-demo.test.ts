import { describe, it, expect, beforeEach } from 'vitest';
import { TushareClient } from '@hestudy/tushare-sdk';

/**
 * E2E 测试: 完整演示流程
 * 测试所有示例按顺序执行的完整流程
 */
describe('完整演示流程 E2E 测试', () => {
  let client: TushareClient;

  beforeEach(() => {
    // 使用环境变量中的 Token
    const token = process.env.TUSHARE_TOKEN || 'test_token';
    client = new TushareClient({ token });
  });

  it('应该成功执行完整的演示流程', async () => {
    // 如果没有真实 Token,跳过此测试
    if (!process.env.TUSHARE_TOKEN) {
      console.log('跳过: 需要真实 TUSHARE_TOKEN');
      return;
    }

    const results: Array<{
      name: string;
      success: boolean;
      duration: number;
      error?: Error;
    }> = [];

    // 示例 1: 股票列表查询
    try {
      const start1 = Date.now();
      const stockList = await client.getStockBasic({
        list_status: 'L',
      });
      const duration1 = Date.now() - start1;

      results.push({
        name: '股票列表查询',
        success: true,
        duration: duration1,
      });

      expect(stockList.data).toBeDefined();
      expect(Array.isArray(stockList.data)).toBe(true);
      expect(stockList.data.length).toBeGreaterThan(0);
    } catch (error) {
      results.push({
        name: '股票列表查询',
        success: false,
        duration: 0,
        error: error as Error,
      });
    }

    // 示例 2: 日线数据查询
    try {
      const start2 = Date.now();
      const dailyData = await client.getDailyQuote({
        ts_code: '000001.SZ',
        start_date: '20240901',
        end_date: '20240930',
      });
      const duration2 = Date.now() - start2;

      results.push({
        name: '日线数据查询',
        success: true,
        duration: duration2,
      });

      expect(dailyData.data).toBeDefined();
      expect(Array.isArray(dailyData.data)).toBe(true);
    } catch (error) {
      results.push({
        name: '日线数据查询',
        success: false,
        duration: 0,
        error: error as Error,
      });
    }

    // 示例 3: 交易日历查询
    try {
      const start3 = Date.now();
      const calendar = await client.getTradeCalendar({
        exchange: 'SSE',
        start_date: '20240901',
        end_date: '20240930',
      });
      const duration3 = Date.now() - start3;

      results.push({
        name: '交易日历查询',
        success: true,
        duration: duration3,
      });

      expect(calendar.data).toBeDefined();
      expect(Array.isArray(calendar.data)).toBe(true);
    } catch (error) {
      results.push({
        name: '交易日历查询',
        success: false,
        duration: 0,
        error: error as Error,
      });
    }

    // 验证所有示例都成功执行
    const successCount = results.filter((r) => r.success).length;
    const totalCount = results.length;

    console.log('\n=== 演示流程执行结果 ===');
    results.forEach((result, index) => {
      const status = result.success ? '✓' : '✗';
      console.log(
        `[${index + 1}/${totalCount}] ${status} ${result.name} (${result.duration}ms)`
      );
      if (result.error) {
        console.log(`    错误: ${result.error.message}`);
      }
    });
    console.log(`\n成功: ${successCount}/${totalCount}`);

    // 所有示例都应该成功
    expect(successCount).toBe(totalCount);
    expect(results.every((r) => r.success)).toBe(true);
  });

  it('应该在合理的时间内完成所有示例', async () => {
    if (!process.env.TUSHARE_TOKEN) {
      console.log('跳过: 需要真实 TUSHARE_TOKEN');
      return;
    }

    const startTime = Date.now();

    // 执行所有示例
    await client.getStockBasic({ list_status: 'L' });
    await client.getDailyQuote({
      ts_code: '000001.SZ',
      start_date: '20240901',
      end_date: '20240930',
    });
    await client.getTradeCalendar({
      exchange: 'SSE',
      start_date: '20240901',
      end_date: '20240930',
    });

    const totalDuration = Date.now() - startTime;

    // 总耗时应该小于 15 秒(根据性能契约)
    expect(totalDuration).toBeLessThan(15000);

    console.log(`\n完整演示流程耗时: ${totalDuration}ms`);
  });

  it('应该正确处理示例执行过程中的错误', async () => {
    // 使用无效 Token 创建客户端
    const invalidClient = new TushareClient({
      token: 'invalid_token',
    });

    const results: Array<{
      name: string;
      success: boolean;
      error?: Error;
    }> = [];

    // 尝试执行示例,应该捕获错误
    try {
      await invalidClient.getStockBasic();
      results.push({ name: '股票列表查询', success: true });
    } catch (error) {
      results.push({
        name: '股票列表查询',
        success: false,
        error: error as Error,
      });
    }

    // 应该捕获到错误
    expect(results[0].success).toBe(false);
    expect(results[0].error).toBeDefined();
  });

  it('应该支持并发执行多个示例', async () => {
    if (!process.env.TUSHARE_TOKEN) {
      console.log('跳过: 需要真实 TUSHARE_TOKEN');
      return;
    }

    const startTime = Date.now();

    // 并发执行所有示例
    const [stockList, dailyData, calendar] = await Promise.all([
      client.getStockBasic({ list_status: 'L' }),
      client.getDailyQuote({
        ts_code: '000001.SZ',
        start_date: '20240901',
        end_date: '20240930',
      }),
      client.getTradeCalendar({
        exchange: 'SSE',
        start_date: '20240901',
        end_date: '20240930',
      }),
    ]);

    const totalDuration = Date.now() - startTime;

    // 验证所有结果
    expect(stockList.data).toBeDefined();
    expect(dailyData.data).toBeDefined();
    expect(calendar.data).toBeDefined();

    // 并发执行应该比顺序执行更快
    console.log(`\n并发执行耗时: ${totalDuration}ms`);
    expect(totalDuration).toBeLessThan(15000);
  });
});
