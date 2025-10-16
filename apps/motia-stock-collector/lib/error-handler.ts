import { db } from './database.js';
import type { TaskLog } from '../types/index.js';

/**
 * 错误处理工具库
 * 提供统一的错误处理和日志记录功能
 */

/**
 * 任务执行上下文
 */
export interface TaskContext {
  taskName: string;
  startTime: string;
  logger: any;
}

/**
 * 任务执行结果
 */
export interface TaskResult {
  success: boolean;
  recordsCount: number;
  error?: Error;
}

/**
 * API 响应格式
 */
export interface ApiResponse {
  status: number;
  body: {
    success: boolean;
    error?: string;
    data?: any;
    count?: number;
  };
}

/**
 * 包装事件任务执行,自动处理错误和日志记录
 *
 * @param context 任务上下文
 * @param task 要执行的任务函数
 * @param emit 事件触发器
 * @param successEvent 成功时触发的事件名称(可选)
 * @returns 执行结果
 */
export async function wrapEventTask<T>(
  context: TaskContext,
  task: () => Promise<T>,
  emit?: any,
  successEvent?: { topic: string; data: any }
): Promise<void> {
  const { taskName, startTime, logger } = context;

  try {
    logger.info(`Starting task: ${taskName}`, { startTime });

    // 执行任务
    const result = await task();

    // 计算记录数(如果结果是数组或对象)
    const recordsCount = Array.isArray(result)
      ? result.length
      : typeof result === 'object' && result !== null && 'length' in result
      ? (result as any).length
      : 0;

    const endTime = new Date().toISOString();

    // 记录成功日志
    db.logTask({
      taskName,
      startTime,
      endTime,
      status: 'SUCCESS',
      recordsCount,
      errorMessage: null,
    });

    // 触发成功事件(如果提供)
    if (emit && successEvent) {
      await emit({
        topic: successEvent.topic,
        data: {
          ...successEvent.data,
          startTime,
          endTime,
          count: recordsCount,
        },
      });
    }

    logger.info(`Task completed successfully: ${taskName}`, {
      recordsCount,
      duration: new Date(endTime).getTime() - new Date(startTime).getTime(),
    });
  } catch (error: any) {
    const endTime = new Date().toISOString();

    // 记录失败日志
    db.logTask({
      taskName,
      startTime,
      endTime,
      status: 'FAILED',
      recordsCount: 0,
      errorMessage: error.message,
    });

    logger.error(`Task failed: ${taskName}`, {
      error: error.message,
      stack: error.stack,
    });

    // 重新抛出错误以触发重试机制
    throw new Error(`Task ${taskName} failed: ${error.message}`);
  }
}

/**
 * 包装 API Handler,自动处理错误和统一响应格式
 *
 * @param logger 日志记录器
 * @param handler API 处理函数
 * @returns API 响应
 */
export async function wrapApiHandler(
  logger: any,
  handler: () => Promise<ApiResponse['body']>
): Promise<ApiResponse> {
  try {
    const body = await handler();

    return {
      status: 200,
      body: {
        success: true,
        ...body,
      },
    };
  } catch (error: any) {
    logger.error('API handler failed', {
      error: error.message,
      stack: error.stack,
    });

    return {
      status: 500,
      body: {
        success: false,
        error: `Internal server error: ${error.message}`,
      },
    };
  }
}

/**
 * 创建标准错误响应
 *
 * @param status HTTP 状态码
 * @param errorMessage 错误消息
 * @param logger 日志记录器
 * @param context 额外的上下文信息
 * @returns API 响应
 */
export function createErrorResponse(
  status: number,
  errorMessage: string,
  logger?: any,
  context?: Record<string, any>
): ApiResponse {
  if (logger) {
    logger.warn('Returning error response', {
      status,
      error: errorMessage,
      ...context,
    });
  }

  return {
    status,
    body: {
      success: false,
      error: errorMessage,
    },
  };
}

/**
 * 创建标准成功响应
 *
 * @param data 响应数据
 * @param logger 日志记录器
 * @param context 额外的上下文信息
 * @returns API 响应
 */
export function createSuccessResponse(
  data: any,
  logger?: any,
  context?: Record<string, any>
): ApiResponse {
  const count = Array.isArray(data) ? data.length : undefined;

  if (logger) {
    logger.info('Returning success response', {
      count,
      ...context,
    });
  }

  return {
    status: 200,
    body: {
      success: true,
      data,
      ...(count !== undefined && { count }),
    },
  };
}

/**
 * 验证必需参数
 *
 * @param params 参数对象
 * @param requiredFields 必需字段列表
 * @returns 缺失的字段列表,如果为空表示验证通过
 */
export function validateRequiredFields(
  params: Record<string, any>,
  requiredFields: string[]
): string[] {
  const missing: string[] = [];

  for (const field of requiredFields) {
    if (params[field] === undefined || params[field] === null || params[field] === '') {
      missing.push(field);
    }
  }

  return missing;
}
