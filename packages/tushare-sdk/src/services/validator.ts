import { ApiError, ApiErrorType } from '../types/error.js';
import type { TushareConfig } from '../types/config.js';

/**
 * 验证 Tushare 配置
 * 
 * @param config - Tushare 配置对象
 * @throws {ApiError} 配置无效时抛出
 */
export function validateConfig(config: TushareConfig): void {
  // 验证 token
  if (typeof config.token !== 'string') {
    throw new ApiError(
      ApiErrorType.VALIDATION_ERROR,
      'Token is required and must be a string'
    );
  }

  if (config.token.trim().length === 0) {
    throw new ApiError(
      ApiErrorType.VALIDATION_ERROR,
      'Token cannot be empty'
    );
  }

  // 验证 timeout
  if (config.timeout !== undefined) {
    if (typeof config.timeout !== 'number' || config.timeout < 1000) {
      throw new ApiError(
        ApiErrorType.VALIDATION_ERROR,
        'Timeout must be a number >= 1000ms'
      );
    }

    if (config.timeout > 300000) {
      throw new ApiError(
        ApiErrorType.VALIDATION_ERROR,
        'Timeout must be <= 300000ms (5 minutes)'
      );
    }
  }

  // 验证 retry 配置
  if (config.retry) {
    if (
      config.retry.maxRetries !== undefined &&
      (typeof config.retry.maxRetries !== 'number' ||
        config.retry.maxRetries < 0 ||
        config.retry.maxRetries > 10)
    ) {
      throw new ApiError(
        ApiErrorType.VALIDATION_ERROR,
        'retry.maxRetries must be a number between 0 and 10'
      );
    }

    if (
      config.retry.initialDelay !== undefined &&
      (typeof config.retry.initialDelay !== 'number' ||
        config.retry.initialDelay < 0)
    ) {
      throw new ApiError(
        ApiErrorType.VALIDATION_ERROR,
        'retry.initialDelay must be a number >= 0'
      );
    }

    if (
      config.retry.maxDelay !== undefined &&
      (typeof config.retry.maxDelay !== 'number' || config.retry.maxDelay < 0)
    ) {
      throw new ApiError(
        ApiErrorType.VALIDATION_ERROR,
        'retry.maxDelay must be a number >= 0'
      );
    }

    if (
      config.retry.backoffFactor !== undefined &&
      (typeof config.retry.backoffFactor !== 'number' ||
        config.retry.backoffFactor < 1)
    ) {
      throw new ApiError(
        ApiErrorType.VALIDATION_ERROR,
        'retry.backoffFactor must be a number >= 1'
      );
    }
  }

  // 验证 concurrency 配置
  if (config.concurrency) {
    if (
      config.concurrency.maxConcurrent !== undefined &&
      (typeof config.concurrency.maxConcurrent !== 'number' ||
        config.concurrency.maxConcurrent < 1 ||
        config.concurrency.maxConcurrent > 50)
    ) {
      throw new ApiError(
        ApiErrorType.VALIDATION_ERROR,
        'concurrency.maxConcurrent must be a number between 1 and 50'
      );
    }

    if (
      config.concurrency.minInterval !== undefined &&
      (typeof config.concurrency.minInterval !== 'number' ||
        config.concurrency.minInterval < 0)
    ) {
      throw new ApiError(
        ApiErrorType.VALIDATION_ERROR,
        'concurrency.minInterval must be a number >= 0'
      );
    }
  }
}

/**
 * 验证 API 请求参数
 * 
 * @param apiName - API 名称
 * @param params - 请求参数
 * @throws {ApiError} 参数无效时抛出
 */
export function validateParams(
  apiName: string,
  params?: Record<string, unknown>
): void {
  if (!apiName || typeof apiName !== 'string') {
    throw new ApiError(
      ApiErrorType.VALIDATION_ERROR,
      'API name is required and must be a string'
    );
  }

  if (params !== undefined && typeof params !== 'object') {
    throw new ApiError(
      ApiErrorType.VALIDATION_ERROR,
      'Params must be an object'
    );
  }

  // 验证日期格式 (如果参数中包含日期字段)
  if (params) {
    const dateFields = [
      'trade_date',
      'start_date',
      'end_date',
      'ann_date',
      'list_date',
      'period',
    ];

    for (const field of dateFields) {
      const value = params[field];
      if (value !== undefined && typeof value === 'string') {
        if (!/^\d{8}$/.test(value) && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          throw new ApiError(
            ApiErrorType.VALIDATION_ERROR,
            `${field} must be in YYYYMMDD or YYYY-MM-DD format, got: ${value}`
          );
        }
      }
    }

    // 验证日期范围
    if (params.start_date && params.end_date) {
      const start = String(params.start_date).replace(/-/g, '');
      const end = String(params.end_date).replace(/-/g, '');
      
      if (start > end) {
        throw new ApiError(
          ApiErrorType.VALIDATION_ERROR,
          'start_date must be <= end_date'
        );
      }
    }
  }
}
