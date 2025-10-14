import type { ServerConfig } from '../types/mcp-tools.types.js';

/**
 * 日志级别枚举
 */
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
} as const;

/**
 * 结构化日志记录器
 * 输出到 stderr,避免污染 MCP stdio 通信通道
 */
export class Logger {
  private levelValue: number;

  constructor(level: ServerConfig['logLevel'] = 'info') {
    this.levelValue = LOG_LEVELS[level];
  }

  /**
   * 记录调试级别日志
   *
   * @param message 日志消息
   * @param data 附加数据对象
   */
  debug(message: string, data?: Record<string, unknown>): void {
    if (this.levelValue <= LOG_LEVELS.debug) {
      this.log('DEBUG', message, data);
    }
  }

  /**
   * 记录信息级别日志
   *
   * @param message 日志消息
   * @param data 附加数据对象
   */
  info(message: string, data?: Record<string, unknown>): void {
    if (this.levelValue <= LOG_LEVELS.info) {
      this.log('INFO', message, data);
    }
  }

  /**
   * 记录警告级别日志
   *
   * @param message 日志消息
   * @param data 附加数据对象
   */
  warn(message: string, data?: Record<string, unknown>): void {
    if (this.levelValue <= LOG_LEVELS.warn) {
      this.log('WARN', message, data);
    }
  }

  /**
   * 记录错误级别日志
   *
   * @param message 日志消息
   * @param data 附加数据对象或 Error 对象
   */
  error(message: string, data?: Record<string, unknown> | Error): void {
    if (this.levelValue <= LOG_LEVELS.error) {
      let logData: Record<string, unknown> | undefined = undefined;
      if (data instanceof Error) {
        logData = {
          error: data.message,
          stack: data.stack,
        };
      } else {
        logData = data;
      }
      this.log('ERROR', message, logData);
    }
  }

  /**
   * 内部日志输出方法
   * 输出结构化 JSON 格式日志到 stderr
   *
   * @param level 日志级别
   * @param message 日志消息
   * @param data 附加数据
   */
  private log(
    level: string,
    message: string,
    data?: Record<string, unknown>
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(data && { data }),
    };

    // 输出到 stderr,避免污染 stdout (MCP 通信通道)
    console.error(JSON.stringify(logEntry));
  }
}

/**
 * 创建日志记录器实例
 *
 * @param level 日志级别
 * @returns Logger 实例
 */
export function createLogger(
  level: ServerConfig['logLevel'] = 'info'
): Logger {
  return new Logger(level);
}
