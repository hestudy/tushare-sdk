import type { ErrorCode } from '../types/mcp-tools.types.js';

/**
 * 错误分类结果
 */
export interface ClassifiedError {
  /** 错误分类代码 */
  code: ErrorCode;
  /** 用户友好的错误消息 */
  message: string;
}

/**
 * 将 Tushare SDK 错误分类并转换为用户友好消息
 *
 * @param error 原始错误对象
 * @returns ClassifiedError 分类后的错误信息
 */
export function classifyTushareError(error: unknown): ClassifiedError {
  if (!(error instanceof Error)) {
    return {
      code: 'NETWORK_ERROR',
      message: `未知错误: ${String(error)}`,
    };
  }

  const message = error.message.toLowerCase();

  // Token 无效或过期
  if (message.includes('token') || message.includes('auth')) {
    return {
      code: 'AUTH_ERROR',
      message:
        'Tushare Token 无效或已过期,请检查环境变量 TUSHARE_TOKEN 配置。' +
        '获取 Token: https://tushare.pro/register',
    };
  }

  // 积分不足或权限不够
  if (
    message.includes('point') ||
    message.includes('permission') ||
    message.includes('积分') ||
    message.includes('权限')
  ) {
    return {
      code: 'AUTH_ERROR',
      message:
        'Tushare 积分不足或权限不够,请升级账户或选择其他接口。' +
        '查看权限说明: https://tushare.pro/document/2',
    };
  }

  // 请求频率限制
  if (
    message.includes('frequency') ||
    message.includes('rate limit') ||
    message.includes('频率') ||
    message.includes('限流')
  ) {
    return {
      code: 'RATE_LIMIT',
      message:
        '请求过于频繁,已触发 Tushare 频率限制,请稍后重试(建议等待 1 分钟)。',
    };
  }

  // 数据不存在
  if (
    message.includes('no data') ||
    message.includes('not found') ||
    message.includes('empty') ||
    message.includes('无数据') ||
    message.includes('未找到')
  ) {
    return {
      code: 'DATA_NOT_FOUND',
      message:
        '未找到相关数据,请检查股票代码、日期或报告期是否正确。' +
        '常见问题:1) 股票代码格式错误(应为:600519.SH) 2) 查询日期为非交易日 3) 新股上市日期晚于查询日期',
    };
  }

  // 网络超时
  if (
    message.includes('timeout') ||
    message.includes('network') ||
    message.includes('超时') ||
    message.includes('网络')
  ) {
    return {
      code: 'NETWORK_ERROR',
      message:
        '网络请求超时,Tushare 服务可能暂时不可用,请稍后重试。' +
        '如果问题持续,请检查网络连接或查看 Tushare 服务状态。',
    };
  }

  // 连接错误
  if (
    message.includes('connection') ||
    message.includes('econnrefused') ||
    message.includes('enotfound')
  ) {
    return {
      code: 'NETWORK_ERROR',
      message:
        '无法连接到 Tushare 服务器,请检查网络连接。' +
        '如果使用代理,请确保代理配置正确。',
    };
  }

  // 参数验证错误
  if (
    message.includes('invalid') ||
    message.includes('validation') ||
    message.includes('格式') ||
    message.includes('非法')
  ) {
    return {
      code: 'VALIDATION_ERROR',
      message: `参数格式错误: ${error.message}`,
    };
  }

  // 默认分类为网络错误
  return {
    code: 'NETWORK_ERROR',
    message: `数据查询失败: ${error.message}`,
  };
}

/**
 * 创建用户友好的错误响应
 *
 * @param error 原始错误对象
 * @returns 包含错误代码和消息的对象
 */
export function createErrorResponse(error: unknown): {
  errorCode: ErrorCode;
  userMessage: string;
} {
  const classified = classifyTushareError(error);
  return {
    errorCode: classified.code,
    userMessage: classified.message,
  };
}
