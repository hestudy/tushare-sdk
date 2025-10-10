/**
 * 每日指标示例集成测试
 * 
 * 测试真实 API 调用和数据格式验证
 * 
 * 注意: 这些测试需要有效的 Tushare Token 和足够的积分(2000+)
 */

import { describe, it, expect } from 'vitest';
import { runDailyBasicExample } from '../../src/examples/daily-basic.js';
import { loadConfig } from '../../src/config.js';
import type { DailyBasicItem } from '@hestudy/tushare-sdk';

describe('runDailyBasicExample - 集成测试', () => {
  // 跳过集成测试,除非明确设置环境变量
  const shouldRunIntegrationTests = process.env.RUN_INTEGRATION_TESTS === 'true';
  const testFn = shouldRunIntegrationTests ? it : it.skip;

  testFn('应该成功调用真实 API', async () => {
    const config = loadConfig();
    const result = await runDailyBasicExample(config);

    // 验证返回值结构
    expect(result).toHaveProperty('count');
    expect(result).toHaveProperty('sample');
    expect(result.count).toBeGreaterThanOrEqual(0);
  }, 30000); // 30秒超时

  testFn('应该返回正确的数据格式', async () => {
    const config = loadConfig();
    const result = await runDailyBasicExample(config);

    if (result.count > 0) {
      const firstItem = result.sample[0] as DailyBasicItem;
      
      // 验证必需字段
      expect(firstItem).toHaveProperty('ts_code');
      expect(firstItem).toHaveProperty('trade_date');
      expect(typeof firstItem.ts_code).toBe('string');
      expect(typeof firstItem.trade_date).toBe('string');
      
      // 验证股票代码格式 (XXXXXX.XX)
      expect(firstItem.ts_code).toMatch(/^\d{6}\.(SH|SZ)$/);
      
      // 验证日期格式 (YYYYMMDD)
      expect(firstItem.trade_date).toMatch(/^\d{8}$/);
    }
  }, 30000);

  testFn('sample 数组长度应该不超过 3', async () => {
    const config = loadConfig();
    const result = await runDailyBasicExample(config);

    expect(result.sample.length).toBeLessThanOrEqual(3);
    expect(result.sample.length).toBeLessThanOrEqual(result.count);
  }, 30000);
});
