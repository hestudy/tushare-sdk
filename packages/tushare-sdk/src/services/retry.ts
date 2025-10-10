import { ApiError } from '../types/error.js';
import type { RetryConfig } from '../types/config.js';
import type { Logger } from '../utils/logger.js';

/**
 * 重试服务
 * 
 * 实现指数退避 + 抖动的重试策略
 */
export class RetryService {
  /**
   * 创建重试服务实例
   * 
   * @param config - 重试配置
   * @param logger - 日志记录器
   */
  constructor(
    private config: RetryConfig,
    private logger?: Logger
  ) {}

  /**
   * 执行带重试的异步函数
   * 
   * @param fn - 要执行的异步函数
   * @param context - 上下文信息 (用于日志)
   * @returns 函数执行结果
   * @throws {Error} 重试次数用尽后抛出最后一次错误
   * 
   * @example
   * ```typescript
   * const result = await retryService.execute(
   *   () => httpClient.post(request),
   *   'stock_basic API'
   * );
   * ```
   */
  async execute<T>(fn: () => Promise<T>, context?: string): Promise<T> {
    let lastError: Error | undefined;
    const maxAttempts = this.config.maxRetries + 1; // 包括首次尝试

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        if (attempt > 0) {
          this.logger?.debug(
            `Retry attempt ${attempt}/${this.config.maxRetries}`,
            context
          );
        }

        return await fn();
      } catch (error) {
        lastError = error as Error;

        // 判断是否应该重试
        if (!this.shouldRetry(error, attempt)) {
          this.logger?.debug('Error is not retryable, throwing immediately');
          throw error;
        }

        // 如果还有重试机会
        if (attempt < this.config.maxRetries) {
          const delay = this.calculateDelay(attempt, error);
          
          this.logger?.info(
            `Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${this.config.maxRetries})`,
            context
          );

          await this.wait(delay);
        }
      }
    }

    // 重试次数用尽,抛出最后一次错误
    this.logger?.error(
      `Max retries (${this.config.maxRetries}) exceeded`,
      context
    );
    throw lastError!;
  }

  /**
   * 判断错误是否应该重试
   * 
   * @param error - 错误对象
   * @param attempt - 当前尝试次数
   * @returns 是否应该重试
   */
  private shouldRetry(error: unknown, attempt: number): boolean {
    // 已达到最大重试次数
    if (attempt >= this.config.maxRetries) {
      return false;
    }

    // 只重试 ApiError
    if (!(error instanceof ApiError)) {
      return false;
    }

    // 检查错误是否可重试
    return error.retryable;
  }

  /**
   * 计算重试延迟时间
   * 
   * 使用指数退避 + 抖动算法
   * 
   * @param attempt - 当前尝试次数 (从 0 开始)
   * @param error - 错误对象
   * @returns 延迟时间 (毫秒)
   */
  private calculateDelay(attempt: number, error: unknown): number {
    // 优先使用服务端指定的 Retry-After
    if (error instanceof ApiError && error.retryAfter) {
      this.logger?.debug(`Using server-specified retry delay: ${error.retryAfter}ms`);
      return error.retryAfter;
    }

    // 计算指数退避延迟
    const exponentialDelay = Math.min(
      this.config.initialDelay *
        Math.pow(this.config.backoffFactor, attempt),
      this.config.maxDelay
    );

    // 添加 ±20% 抖动,避免惊群效应
    const jitterRange = exponentialDelay * 0.2;
    const jitter = jitterRange * (Math.random() * 2 - 1);
    const delay = Math.max(0, exponentialDelay + jitter);

    this.logger?.debug(
      `Calculated retry delay: ${Math.round(delay)}ms (exponential: ${exponentialDelay}ms, jitter: ${Math.round(jitter)}ms)`
    );

    return Math.round(delay);
  }

  /**
   * 等待指定时间
   * 
   * @param ms - 等待时间 (毫秒)
   * @returns Promise
   */
  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
