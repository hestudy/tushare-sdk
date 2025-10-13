/**
 * 数据模型类型定义
 * 
 * 定义演示应用中使用的数据结构
 */

/**
 * 示例执行结果
 */
export interface ExampleResult {
  /**
   * 示例名称
   */
  name: string;

  /**
   * 是否成功
   */
  success: boolean;

  /**
   * 执行时长(毫秒)
   */
  duration: number;

  /**
   * 返回的数据(成功时)
   */
  data?: unknown;

  /**
   * 错误信息(失败时)
   */
  error?: {
    type: string;
    message: string;
    code?: string;
  };
}

/**
 * 演示应用输出
 */
export interface DemoOutput {
  /**
   * 演示应用版本
   */
  version: string;

  /**
   * 执行时间戳
   */
  timestamp: string;

  /**
   * SDK 版本
   */
  sdkVersion: string;

  /**
   * 所有示例的执行结果
   */
  results: ExampleResult[];

  /**
   * 总体统计
   */
  summary: {
    total: number;
    success: number;
    failed: number;
    totalDuration: number;
  };
}

/**
 * 输出格式类型
 */
export type OutputFormat = 'console' | 'json';

/**
 * 示例名称类型
 */
export type ExampleName = 'stock-list' | 'daily-data' | 'trade-calendar' | 'daily-basic' | 'financial-data' | 'all';

/**
 * 运行选项
 */
export interface RunOptions {
  /**
   * 是否启用详细输出
   */
  verbose?: boolean;
  
  /**
   * 输出格式
   */
  format?: OutputFormat;
}
