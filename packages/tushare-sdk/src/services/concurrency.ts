import type { ConcurrencyConfig } from '../types/config.js';

/**
 * 队列任务
 */
interface QueueTask<T> {
  /** 任务函数 */
  fn: () => Promise<T>;

  /** 成功回调 */
  resolve: (value: T) => void;

  /** 失败回调 */
  reject: (error: unknown) => void;
}

/**
 * 并发控制器
 * 
 * 基于队列的并发控制,限制同时进行的请求数量和请求间隔
 * 
 * @example
 * ```typescript
 * const limiter = new ConcurrencyLimiter({
 *   maxConcurrent: 5,
 *   minInterval: 200
 * });
 * 
 * const result = await limiter.execute(() => apiCall());
 * ```
 */
export class ConcurrencyLimiter {
  private queue: QueueTask<unknown>[] = [];
  private running = 0;
  private lastExecutionTime = 0;

  /**
   * 创建并发控制器实例
   * 
   * @param config - 并发配置
   */
  constructor(private config: ConcurrencyConfig) {}

  /**
   * 执行带并发控制的异步函数
   * 
   * @param fn - 要执行的异步函数
   * @returns 函数执行结果
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ fn, resolve, reject } as QueueTask<unknown>);
      this.processQueue();
    });
  }

  /**
   * 处理队列
   */
  private async processQueue(): Promise<void> {
    // 如果已达到最大并发数,等待
    if (this.running >= this.config.maxConcurrent) {
      return;
    }

    // 如果队列为空,返回
    const task = this.queue.shift();
    if (!task) {
      return;
    }

    // 检查最小间隔
    const now = Date.now();
    const timeSinceLastExecution = now - this.lastExecutionTime;
    
    if (timeSinceLastExecution < this.config.minInterval) {
      const delay = this.config.minInterval - timeSinceLastExecution;
      await this.wait(delay);
    }

    // 更新状态
    this.running++;
    this.lastExecutionTime = Date.now();

    // 执行任务
    try {
      const result = await task.fn();
      task.resolve(result);
    } catch (error) {
      task.reject(error);
    } finally {
      this.running--;
      // 继续处理队列
      this.processQueue();
    }
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

  /**
   * 获取当前队列长度
   * 
   * @returns 队列长度
   */
  getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * 获取当前运行中的任务数
   * 
   * @returns 运行中的任务数
   */
  getRunningCount(): number {
    return this.running;
  }
}
