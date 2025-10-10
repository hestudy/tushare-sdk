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

  // T012: 多场景数据格式验证
  testFn('应该正确处理多种查询场景', async () => {
    const config = loadConfig();
    const result = await runDailyBasicExample(config);

    // 验证返回了多个场景的数据
    expect(result.count).toBeGreaterThan(0);
    
    // 验证 sample 包含来自不同场景的数据
    if (result.sample.length > 0) {
      result.sample.forEach((item) => {
        const dailyBasicItem = item as DailyBasicItem;
        
        // 验证每个数据项都有必需字段
        expect(dailyBasicItem).toHaveProperty('ts_code');
        expect(dailyBasicItem).toHaveProperty('trade_date');
        expect(typeof dailyBasicItem.ts_code).toBe('string');
        expect(typeof dailyBasicItem.trade_date).toBe('string');
      });
    }
  }, 30000);

  testFn('应该正确处理自定义字段查询', async () => {
    const config = loadConfig();
    const result = await runDailyBasicExample(config);

    // 验证返回了数据
    if (result.count > 0 && result.sample.length > 0) {
      const item = result.sample[0] as DailyBasicItem;
      
      // 验证基本字段存在
      expect(item).toHaveProperty('ts_code');
      expect(item).toHaveProperty('trade_date');
    }
  }, 30000);

  // T018: 权限验证测试
  testFn('应该能够处理权限不足的情况', async () => {
    // 使用无效 token 测试权限验证
    const invalidConfig = {
      tushareToken: 'invalid_token_for_testing',
      apiBaseUrl: undefined,
      debug: false,
    };

    // 预期会抛出错误
    await expect(runDailyBasicExample(invalidConfig)).rejects.toThrow();
  }, 30000);

  testFn('应该能够处理空数据返回', async () => {
    const config = loadConfig();
    
    // 注意: 这个测试可能会返回数据或空数据,取决于查询的日期
    // 我们只验证函数能够正常处理,不抛出错误
    const result = await runDailyBasicExample(config);
    
    expect(result).toHaveProperty('count');
    expect(result).toHaveProperty('sample');
    expect(result.count).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(result.sample)).toBe(true);
  }, 30000);
});
