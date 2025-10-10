/**
 * 错误处理工具
 * 
 * 提供统一的错误格式化和处理功能
 */

import { ApiError, ApiErrorType } from '@hestudy/tushare-sdk';

/**
 * 格式化的错误信息
 */
export interface FormattedError {
  type: string;
  message: string;
  code?: string;
  suggestion?: string;
}

/**
 * 获取错误建议
 * 
 * @param errorType - 错误类型
 * @returns 错误处理建议
 */
export function getErrorSuggestion(errorType: string): string {
  switch (errorType) {
    case ApiErrorType.AUTH_ERROR:
      return '请检查 TUSHARE_TOKEN 环境变量是否正确设置,或访问 https://tushare.pro 获取新 Token';
    
    case ApiErrorType.NETWORK_ERROR:
      return '请检查网络连接是否正常,或稍后重试';
    
    case ApiErrorType.VALIDATION_ERROR:
      return '请检查 API 参数是否正确,参考文档: https://tushare.pro/document/2';
    
    case ApiErrorType.RATE_LIMIT:
      return '请求频率超限,请稍后重试或升级账户权限';
    
    case ApiErrorType.SERVER_ERROR:
      return 'Tushare 服务器错误,请稍后重试';
    
    default:
      return '请查看错误消息了解详情';
  }
}

/**
 * 格式化错误信息
 * 
 * @param error - 错误对象
 * @returns 格式化的错误信息
 */
export function formatError(error: unknown): FormattedError {
  if (error instanceof ApiError) {
    const apiError = error as ApiError;
    return {
      type: apiError.type,
      message: apiError.message,
      code: apiError.code?.toString(),
      suggestion: getErrorSuggestion(apiError.type),
    };
  }

  if (error instanceof Error) {
    return {
      type: 'UNKNOWN_ERROR',
      message: error.message,
      suggestion: '请查看错误消息了解详情',
    };
  }

  return {
    type: 'UNKNOWN_ERROR',
    message: String(error),
    suggestion: '请查看错误消息了解详情',
  };
}

/**
 * 打印错误信息到控制台
 * 
 * @param error - 错误对象
 */
export function printError(error: unknown): void {
  const formatted = formatError(error);
  
  console.error('\n❌ 错误发生:');
  console.error(`   类型: ${formatted.type}`);
  console.error(`   消息: ${formatted.message}`);
  
  if (formatted.code) {
    console.error(`   代码: ${formatted.code}`);
  }
  
  if (formatted.suggestion) {
    console.error(`\n💡 建议: ${formatted.suggestion}`);
  }
  
  console.error('');
}

/**
 * 根据错误类型获取退出码
 * 
 * @param error - 错误对象
 * @returns 退出码
 */
export function getExitCode(error: unknown): number {
  if (error instanceof ApiError) {
    const apiError = error as ApiError;
    switch (apiError.type) {
      case ApiErrorType.AUTH_ERROR:
        return 2;
      case ApiErrorType.NETWORK_ERROR:
        return 2;
      case ApiErrorType.VALIDATION_ERROR:
        return 2;
      default:
        return 2;
    }
  }
  
  return 1; // 配置错误或其他错误
}
