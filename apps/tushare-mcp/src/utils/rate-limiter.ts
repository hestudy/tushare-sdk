/**
 * 时间窗口限流器配置
 */
export interface RateLimiterConfig {
  /** 时间窗口内最大请求数 */
  maxRequests: number;
  /** 时间窗口大小(毫秒) */
  windowMs: number;
}

/**
 * 请求记录
 */
interface RequestRecord {
  /** 请求时间戳 */
  timestamp: number;
}

/**
 * 基于时间窗口的限流器
 * 使用滑动窗口算法,记录时间窗口内的请求数量
 */
export class RateLimiter {
  private maxRequests: number;
  private windowMs: number;
  private requests: RequestRecord[] = [];

  /**
   * 创建限流器实例
   *
   * @param config 限流器配置
   */
  constructor(config: RateLimiterConfig) {
    this.maxRequests = config.maxRequests;
    this.windowMs = config.windowMs;
  }

  /**
   * 尝试获取请求配额
   * 如果当前时间窗口内请求数未超过限制,则允许请求并记录
   *
   * @returns boolean 是否允许请求(true:允许, false:触发限流)
   */
  tryAcquire(): boolean {
    const now = Date.now();

    // 清理过期的请求记录(超出时间窗口)
    this.requests = this.requests.filter(
      (record) => now - record.timestamp < this.windowMs
    );

    // 检查是否超过限流阈值
    if (this.requests.length >= this.maxRequests) {
      return false; // 触发限流
    }

    // 记录当前请求
    this.requests.push({ timestamp: now });
    return true; // 允许请求
  }

  /**
   * 获取当前时间窗口内的请求数
   *
   * @returns number 当前时间窗口内的请求数
   */
  getCurrentRequestCount(): number {
    const now = Date.now();
    this.requests = this.requests.filter(
      (record) => now - record.timestamp < this.windowMs
    );
    return this.requests.length;
  }

  /**
   * 获取剩余可用配额
   *
   * @returns number 剩余可用的请求次数
   */
  getRemainingQuota(): number {
    return Math.max(0, this.maxRequests - this.getCurrentRequestCount());
  }

  /**
   * 获取下次配额重置时间
   *
   * @returns number 下次配额重置的时间戳(毫秒),如果当前无限流则返回 0
   */
  getNextResetTime(): number {
    if (this.requests.length === 0) {
      return 0;
    }

    const oldestRequest = this.requests[0];
    if (!oldestRequest) return 0;

    return oldestRequest.timestamp + this.windowMs;
  }

  /**
   * 重置限流器状态
   * 清空所有请求记录
   */
  reset(): void {
    this.requests = [];
  }

  /**
   * 获取限流器配置
   *
   * @returns RateLimiterConfig 当前配置
   */
  getConfig(): RateLimiterConfig {
    return {
      maxRequests: this.maxRequests,
      windowMs: this.windowMs,
    };
  }
}

/**
 * 创建限流器实例
 *
 * @param config 限流器配置
 * @returns RateLimiter 实例
 */
export function createRateLimiter(config: RateLimiterConfig): RateLimiter {
  return new RateLimiter(config);
}
