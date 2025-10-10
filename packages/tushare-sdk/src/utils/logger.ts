/**
 * 日志级别枚举
 */
export enum LogLevel {
  /** 调试级别 - 详细的调试信息 */
  DEBUG = 0,
  /** 信息级别 - 一般信息 */
  INFO = 1,
  /** 警告级别 - 警告信息 */
  WARN = 2,
  /** 错误级别 - 错误信息 */
  ERROR = 3,
  /** 静默级别 - 不输出任何日志 */
  SILENT = 4,
}

/**
 * 日志接口
 * 
 * 定义了日志记录的标准接口,支持自定义日志实现
 */
export interface Logger {
  /**
   * 记录调试信息
   * @param message - 日志消息
   * @param args - 额外参数
   */
  debug(message: string, ...args: unknown[]): void;

  /**
   * 记录一般信息
   * @param message - 日志消息
   * @param args - 额外参数
   */
  info(message: string, ...args: unknown[]): void;

  /**
   * 记录警告信息
   * @param message - 日志消息
   * @param args - 额外参数
   */
  warn(message: string, ...args: unknown[]): void;

  /**
   * 记录错误信息
   * @param message - 日志消息
   * @param args - 额外参数
   */
  error(message: string, ...args: unknown[]): void;
}

/**
 * 控制台日志实现
 * 
 * 使用 console API 输出日志,支持日志级别过滤
 * 
 * @example
 * ```typescript
 * const logger = new ConsoleLogger(LogLevel.INFO);
 * logger.debug('这条不会输出'); // 级别低于 INFO
 * logger.info('这条会输出');
 * ```
 */
export class ConsoleLogger implements Logger {
  /**
   * 创建控制台日志实例
   * @param level - 日志级别,默认为 INFO
   */
  constructor(private level: LogLevel = LogLevel.INFO) {}

  /**
   * 记录调试信息
   */
  debug(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(`[Tushare DEBUG] ${message}`, ...args);
    }
  }

  /**
   * 记录一般信息
   */
  info(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.INFO) {
      console.info(`[Tushare INFO] ${message}`, ...args);
    }
  }

  /**
   * 记录警告信息
   */
  warn(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(`[Tushare WARN] ${message}`, ...args);
    }
  }

  /**
   * 记录错误信息
   */
  error(message: string, ...args: unknown[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(`[Tushare ERROR] ${message}`, ...args);
    }
  }
}
