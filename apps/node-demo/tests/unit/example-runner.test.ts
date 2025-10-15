/**
 * 示例执行器单元测试
 */

import { describe, it, expect } from 'vitest';
import { runExample, calculateSummary } from '../../src/utils/example-runner.js';
import type { ExampleResult } from '../../src/types.js';

describe('示例执行器', () => {
  describe('runExample', () => {
    it('应该成功执行示例并返回结果', async () => {
      const result = await runExample('测试示例', async () => {
        return { data: 'test' };
      });

      expect(result.name).toBe('测试示例');
      expect(result.success).toBe(true);
      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(result.data).toEqual({ data: 'test' });
      expect(result.error).toBeUndefined();
    });

    it('应该捕获错误并返回失败结果', async () => {
      const result = await runExample('失败示例', async () => {
        throw new Error('测试错误');
      });

      expect(result.name).toBe('失败示例');
      expect(result.success).toBe(false);
      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(result.data).toBeUndefined();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('测试错误');
    });

    it('应该记录执行时长', async () => {
      const result = await runExample('延迟示例', async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return { data: 'delayed' };
      });

      // 由于定时器精度问题,允许小于预期值的误差
      expect(result.duration).toBeGreaterThanOrEqual(95);
    });
  });

  describe('calculateSummary', () => {
    it('应该正确计算摘要统计', () => {
      const results: ExampleResult[] = [
        {
          name: '示例1',
          success: true,
          duration: 100,
          data: {},
        },
        {
          name: '示例2',
          success: false,
          duration: 50,
          error: { type: 'ERROR', message: 'Failed' },
        },
        {
          name: '示例3',
          success: true,
          duration: 150,
          data: {},
        },
      ];

      const summary = calculateSummary(results);

      expect(summary.total).toBe(3);
      expect(summary.success).toBe(2);
      expect(summary.failed).toBe(1);
      expect(summary.totalDuration).toBe(300);
    });

    it('应该处理空结果数组', () => {
      const summary = calculateSummary([]);

      expect(summary.total).toBe(0);
      expect(summary.success).toBe(0);
      expect(summary.failed).toBe(0);
      expect(summary.totalDuration).toBe(0);
    });

    it('应该处理全部成功的情况', () => {
      const results: ExampleResult[] = [
        { name: '示例1', success: true, duration: 100, data: {} },
        { name: '示例2', success: true, duration: 200, data: {} },
      ];

      const summary = calculateSummary(results);

      expect(summary.total).toBe(2);
      expect(summary.success).toBe(2);
      expect(summary.failed).toBe(0);
    });

    it('应该处理全部失败的情况', () => {
      const results: ExampleResult[] = [
        { name: '示例1', success: false, duration: 100, error: { type: 'ERROR', message: 'Failed' } },
        { name: '示例2', success: false, duration: 200, error: { type: 'ERROR', message: 'Failed' } },
      ];

      const summary = calculateSummary(results);

      expect(summary.total).toBe(2);
      expect(summary.success).toBe(0);
      expect(summary.failed).toBe(2);
    });
  });
});
