/**
 * 示例执行器
 * 
 * 提供计时和结果收集功能
 */

import type { ExampleResult } from '../types.js';
import { formatError } from './error-handler.js';

/**
 * 示例函数类型
 */
export type ExampleFunction = () => Promise<unknown>;

/**
 * 执行示例并收集结果
 * 
 * @param name - 示例名称
 * @param fn - 示例函数
 * @returns 示例执行结果
 */
export async function runExample(
  name: string,
  fn: ExampleFunction
): Promise<ExampleResult> {
  const startTime = Date.now();
  
  try {
    const data = await fn();
    const duration = Date.now() - startTime;
    
    return {
      name,
      success: true,
      duration,
      data,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const formattedError = formatError(error);
    
    return {
      name,
      success: false,
      duration,
      error: {
        type: formattedError.type,
        message: formattedError.message,
        code: formattedError.code,
      },
    };
  }
}

/**
 * 批量执行示例
 * 
 * @param examples - 示例列表
 * @returns 所有示例的执行结果
 */
export async function runExamples(
  examples: Array<{ name: string; fn: ExampleFunction }>
): Promise<ExampleResult[]> {
  const results: ExampleResult[] = [];
  
  for (const example of examples) {
    const result = await runExample(example.name, example.fn);
    results.push(result);
  }
  
  return results;
}

/**
 * 计算摘要统计
 * 
 * @param results - 示例结果数组
 * @returns 摘要统计
 */
export function calculateSummary(results: ExampleResult[]): {
  total: number;
  success: number;
  failed: number;
  totalDuration: number;
} {
  return {
    total: results.length,
    success: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    totalDuration: results.reduce((sum, r) => sum + r.duration, 0),
  };
}
