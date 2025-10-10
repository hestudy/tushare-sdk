import { ApiError, ApiErrorType } from '../types/error.js';
import type { TushareRequest, TushareResponse } from '../types/response.js';

/**
 * HTTP 客户端配置
 */
export interface HttpClientConfig {
  /** API 端点 */
  endpoint: string;

  /** 请求超时时间 (毫秒) */
  timeout: number;
}

/**
 * HTTP 客户端
 * 
 * 封装基于 fetch API 的 HTTP 请求逻辑
 */
export class HttpClient {
  constructor(private config: HttpClientConfig) {}

  /**
   * 发送 POST 请求到 Tushare API
   * 
   * @param request - 请求数据
   * @returns 响应数据
   * @throws {ApiError} 请求失败时抛出
   */
  async post(request: TushareRequest): Promise<TushareResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, this.config.timeout);

    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 处理 HTTP 错误
      if (!response.ok) {
        const errorMessage = await this.extractErrorMessage(response);
        
        // 解析 Retry-After 响应头 (用于 429 错误)
        const retryAfter = this.parseRetryAfter(response);
        const error = ApiError.fromStatusCode(response.status, errorMessage);
        
        if (retryAfter) {
          error.retryAfter = retryAfter;
        }
        
        throw error;
      }

      // 解析响应
      const data = await response.json() as TushareResponse;

      // 检查业务错误
      if (data.code !== 0) {
        throw new ApiError(
          ApiErrorType.VALIDATION_ERROR,
          data.msg || 'API request failed',
          data.code
        );
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      // 处理 AbortError (超时)
      if (error instanceof Error && error.name === 'AbortError') {
        throw ApiError.fromTimeout(this.config.timeout);
      }

      // 如果已经是 ApiError, 直接抛出
      if (error instanceof ApiError) {
        throw error;
      }

      // 其他错误视为网络错误
      throw ApiError.fromNetworkError(error as Error);
    }
  }

  /**
   * 提取错误消息
   * 
   * @param response - HTTP 响应
   * @returns 错误消息
   */
  private async extractErrorMessage(response: Response): Promise<string> {
    try {
      const text = await response.text();
      const json = JSON.parse(text);
      return json.msg || json.message || response.statusText;
    } catch {
      return response.statusText || 'Unknown error';
    }
  }

  /**
   * 解析 Retry-After 响应头
   * 
   * @param response - HTTP 响应
   * @returns 重试延迟时间 (毫秒), 如果没有则返回 undefined
   */
  private parseRetryAfter(response: Response): number | undefined {
    const retryAfter = response.headers.get('Retry-After');
    
    if (!retryAfter) {
      return undefined;
    }

    // Retry-After 可能是秒数或 HTTP 日期
    const seconds = parseInt(retryAfter, 10);
    
    if (!isNaN(seconds)) {
      return seconds * 1000; // 转换为毫秒
    }

    // 尝试解析为日期
    const date = new Date(retryAfter);
    if (!isNaN(date.getTime())) {
      return Math.max(0, date.getTime() - Date.now());
    }

    return undefined;
  }
}
