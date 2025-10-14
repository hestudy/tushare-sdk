import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Logger, createLogger } from '../../../src/utils/logger.js';

describe('logger.ts - Logger', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('日志级别过滤', () => {
    it('debug 级别应输出所有日志', () => {
      const logger = new Logger('debug');

      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(4);
    });

    it('info 级别应输出 info、warn 和 error 日志', () => {
      const logger = new Logger('info');

      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(3);
    });

    it('warn 级别应输出 warn 和 error 日志', () => {
      const logger = new Logger('warn');

      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
    });

    it('error 级别应只输出 error 日志', () => {
      const logger = new Logger('error');

      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('日志格式', () => {
    it('应输出结构化 JSON 格式日志', () => {
      const logger = new Logger('info');
      logger.info('test message');

      const logCall = consoleErrorSpy.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry).toMatchObject({
        level: 'INFO',
        message: 'test message',
      });
      expect(logEntry.timestamp).toBeDefined();
      expect(new Date(logEntry.timestamp).getTime()).toBeGreaterThan(0);
    });

    it('应包含附加数据', () => {
      const logger = new Logger('info');
      const data = { userId: 123, action: 'login' };

      logger.info('user action', data);

      const logCall = consoleErrorSpy.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.data).toEqual(data);
    });

    it('应正确处理 Error 对象', () => {
      const logger = new Logger('error');
      const error = new Error('test error');

      logger.error('error occurred', error);

      const logCall = consoleErrorSpy.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.data).toMatchObject({
        error: 'test error',
      });
      expect(logEntry.data.stack).toBeDefined();
    });
  });

  describe('日志方法', () => {
    it('debug 方法应输出 DEBUG 级别日志', () => {
      const logger = new Logger('debug');
      logger.debug('debug message', { foo: 'bar' });

      const logCall = consoleErrorSpy.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.level).toBe('DEBUG');
      expect(logEntry.message).toBe('debug message');
      expect(logEntry.data).toEqual({ foo: 'bar' });
    });

    it('info 方法应输出 INFO 级别日志', () => {
      const logger = new Logger('info');
      logger.info('info message', { foo: 'bar' });

      const logCall = consoleErrorSpy.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.level).toBe('INFO');
      expect(logEntry.message).toBe('info message');
      expect(logEntry.data).toEqual({ foo: 'bar' });
    });

    it('warn 方法应输出 WARN 级别日志', () => {
      const logger = new Logger('warn');
      logger.warn('warn message', { foo: 'bar' });

      const logCall = consoleErrorSpy.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.level).toBe('WARN');
      expect(logEntry.message).toBe('warn message');
      expect(logEntry.data).toEqual({ foo: 'bar' });
    });

    it('error 方法应输出 ERROR 级别日志', () => {
      const logger = new Logger('error');
      logger.error('error message', { foo: 'bar' });

      const logCall = consoleErrorSpy.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.level).toBe('ERROR');
      expect(logEntry.message).toBe('error message');
      expect(logEntry.data).toEqual({ foo: 'bar' });
    });
  });

  describe('默认值', () => {
    it('应使用默认日志级别 info', () => {
      const logger = new Logger();

      logger.debug('debug message');
      logger.info('info message');

      // debug 不应输出,info 应输出
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
  });
});

describe('logger.ts - createLogger', () => {
  it('应创建 Logger 实例', () => {
    const logger = createLogger('debug');
    expect(logger).toBeInstanceOf(Logger);
  });

  it('应使用指定的日志级别', () => {
    const logger = createLogger('error');
    expect(logger).toBeInstanceOf(Logger);
  });

  it('应使用默认日志级别', () => {
    const logger = createLogger();
    expect(logger).toBeInstanceOf(Logger);
  });
});
