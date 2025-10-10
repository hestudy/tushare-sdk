/**
 * API 错误类型枚举
 */
export enum ApiErrorType {
  /** 认证错误 (401) - Token 无效或过期 */
  AUTH_ERROR = 'AUTH_ERROR',

  /** 限流错误 (429) - 请求频率超限 */
  RATE_LIMIT = 'RATE_LIMIT',

  /** 网络错误 - 网络连接失败 */
  NETWORK_ERROR = 'NETWORK_ERROR',

  /** 服务器错误 (500) - 服务器内部错误 */
  SERVER_ERROR = 'SERVER_ERROR',

  /** 参数验证错误 - 请求参数不合法 */
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  /** 超时错误 - 请求超时 */
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',

  /** 未知错误 */
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * API 错误类
 * 
 * 封装 Tushare API 调用过程中的各种错误
 * 
 * @example
 * ```typescript
 * throw new ApiError(
 *   ApiErrorType.AUTH_ERROR,
 *   'Invalid token',
 *   401
 * );
 * ```
 */
export class ApiError extends Error {
  /** 错误类型 */
  public readonly type: ApiErrorType;

  /** HTTP 状态码 (如果适用) */
  public readonly code?: number;

  /** 原始错误对象 */
  public readonly originalError?: Error;

  /** 是否可重试 */
  public readonly retryable: boolean;

  /** 建议的重试延迟时间 (毫秒) */
  public retryAfter?: number;

  /**
   * 创建 API 错误实例
   * 
   * @param type - 错误类型
   * @param message - 错误消息
   * @param code - HTTP 状态码
   * @param originalError - 原始错误对象
   */
  constructor(
    type: ApiErrorType,
    message: string,
    code?: number,
    originalError?: Error
  ) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.code = code;
    this.originalError = originalError;
    this.retryable = this.isRetryable();

    // 保持正确的堆栈跟踪
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * 判断错误是否可重试
   * 
   * @returns 是否可重试
   */
  private isRetryable(): boolean {
    return [
      ApiErrorType.RATE_LIMIT,
      ApiErrorType.NETWORK_ERROR,
      ApiErrorType.TIMEOUT_ERROR,
      ApiErrorType.SERVER_ERROR,
    ].includes(this.type);
  }

  /**
   * 从 HTTP 状态码创建 ApiError
   * 
   * @param statusCode - HTTP 状态码
   * @param message - 错误消息
   * @returns ApiError 实例
   */
  static fromStatusCode(statusCode: number, message: string): ApiError {
    let type: ApiErrorType;

    switch (statusCode) {
      case 401:
      case 403:
        type = ApiErrorType.AUTH_ERROR;
        break;
      case 429:
        type = ApiErrorType.RATE_LIMIT;
        break;
      case 400:
        type = ApiErrorType.VALIDATION_ERROR;
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        type = ApiErrorType.SERVER_ERROR;
        break;
      default:
        type = ApiErrorType.UNKNOWN_ERROR;
    }

    return new ApiError(type, message, statusCode);
  }

  /**
   * 从网络错误创建 ApiError
   * 
   * @param error - 原始错误对象
   * @returns ApiError 实例
   */
  static fromNetworkError(error: Error): ApiError {
    const message = error.message || 'Network request failed';
    return new ApiError(
      ApiErrorType.NETWORK_ERROR,
      message,
      undefined,
      error
    );
  }

  /**
   * 从超时错误创建 ApiError
   * 
   * @param timeout - 超时时间 (毫秒)
   * @returns ApiError 实例
   */
  static fromTimeout(timeout: number): ApiError {
    return new ApiError(
      ApiErrorType.TIMEOUT_ERROR,
      `Request timeout after ${timeout}ms`
    );
  }
}
