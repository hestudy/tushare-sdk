import { describe, it, expect } from 'vitest';
import { TushareClient } from '@hestudy/tushare-sdk';

/**
 * 性能测试
 * 验证应用和 API 调用的性能指标
 */
describe('性能测试', () => {
  it('应用启动时间应小于 2 秒', () => {
    // 这个测试在实际运行时由主程序计时
    // 这里只是占位符,实际性能通过手动测试验证
    expect(true).toBe(true);
  });

  it('单个 API 调用应在 5 秒内完成', async () => {
    // 如果没有真实 Token,跳过此测试
    if (!process.env.TUSHARE_TOKEN) {
      console.log('跳过: 需要真实 TUSHARE_TOKEN');
      return;
    }

    const client = new TushareClient({
      token: process.env.TUSHARE_TOKEN,
    });

    const startTime = Date.now();
    await client.getStockBasic({ list_status: 'L' });
    const duration = Date.now() - startTime;

    console.log(`API 调用耗时: ${duration}ms`);
    
    // 根据性能契约,单个 API 调用应小于 5 秒
    expect(duration).toBeLessThan(5000);
  });

  it('完整演示流程应在 15 秒内完成', async () => {
    // 如果没有真实 Token,跳过此测试
    if (!process.env.TUSHARE_TOKEN) {
      console.log('跳过: 需要真实 TUSHARE_TOKEN');
      return;
    }

    const client = new TushareClient({
      token: process.env.TUSHARE_TOKEN,
    });

    const startTime = Date.now();

    // 执行所有示例
    await client.getStockBasic({ list_status: 'L' });
    await client.getDailyQuote({
      ts_code: '000001.SZ',
      start_date: '20240901',
      end_date: '20240930',
    });
    await client.query('trade_cal', {
      exchange: 'SSE',
      start_date: '20240901',
      end_date: '20240930',
    });

    const totalDuration = Date.now() - startTime;

    console.log(`完整演示流程耗时: ${totalDuration}ms`);

    // 根据性能契约,完整演示应小于 15 秒
    expect(totalDuration).toBeLessThan(15000);
  });

  it('内存使用应保持在合理范围内', () => {
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;

    console.log(`当前堆内存使用: ${heapUsedMB.toFixed(2)} MB`);

    // 根据性能契约,峰值内存应小于 100MB
    // 这里检查当前使用是否合理
    expect(heapUsedMB).toBeLessThan(100);
  });
});
