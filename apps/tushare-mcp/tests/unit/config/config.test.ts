import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadConfig, validateConfig } from '../../../src/config/config.js';
import type { ServerConfig } from '../../../src/types/mcp-tools.types.js';

describe('config.ts - loadConfig', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('应该成功加载有效的配置', () => {
    process.env.TUSHARE_TOKEN = 'a'.repeat(32);
    const config = loadConfig();

    expect(config).toBeDefined();
    expect(config.tushareToken).toBe('a'.repeat(32));
    expect(config.logLevel).toBe('info');
    expect(config.rateLimitMaxRequests).toBe(100);
    expect(config.rateLimitWindowMs).toBe(60000);
    expect(config.requestTimeoutMs).toBe(30000);
  });

  it('应该在 TUSHARE_TOKEN 缺失时抛出错误', () => {
    delete process.env.TUSHARE_TOKEN;

    expect(() => loadConfig()).toThrow(/Missing or invalid TUSHARE_TOKEN/);
  });

  it('应该在 TUSHARE_TOKEN 过短时抛出错误', () => {
    process.env.TUSHARE_TOKEN = 'short';

    expect(() => loadConfig()).toThrow(/Missing or invalid TUSHARE_TOKEN/);
  });

  it('应该使用自定义日志级别', () => {
    process.env.TUSHARE_TOKEN = 'a'.repeat(32);
    process.env.LOG_LEVEL = 'debug';

    const config = loadConfig();
    expect(config.logLevel).toBe('debug');
  });

  it('应该对无效的日志级别使用默认值并发出警告', () => {
    process.env.TUSHARE_TOKEN = 'a'.repeat(32);
    process.env.LOG_LEVEL = 'invalid';

    const config = loadConfig();
    expect(config.logLevel).toBe('info');
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('Invalid LOG_LEVEL')
    );
  });

  it('应该使用自定义限流配置', () => {
    process.env.TUSHARE_TOKEN = 'a'.repeat(32);
    process.env.RATE_LIMIT_MAX_REQUESTS = '50';
    process.env.RATE_LIMIT_WINDOW_MS = '30000';
    process.env.REQUEST_TIMEOUT_MS = '15000';

    const config = loadConfig();
    expect(config.rateLimitMaxRequests).toBe(50);
    expect(config.rateLimitWindowMs).toBe(30000);
    expect(config.requestTimeoutMs).toBe(15000);
  });

  it('应该对超出范围的 RATE_LIMIT_MAX_REQUESTS 使用默认值', () => {
    process.env.TUSHARE_TOKEN = 'a'.repeat(32);
    process.env.RATE_LIMIT_MAX_REQUESTS = '2000';

    const config = loadConfig();
    expect(config.rateLimitMaxRequests).toBe(100);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('Invalid RATE_LIMIT_MAX_REQUESTS')
    );
  });

  it('应该对超出范围的 RATE_LIMIT_WINDOW_MS 使用默认值', () => {
    process.env.TUSHARE_TOKEN = 'a'.repeat(32);
    process.env.RATE_LIMIT_WINDOW_MS = '700000';

    const config = loadConfig();
    expect(config.rateLimitWindowMs).toBe(60000);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('Invalid RATE_LIMIT_WINDOW_MS')
    );
  });

  it('应该对超出范围的 REQUEST_TIMEOUT_MS 使用默认值', () => {
    process.env.TUSHARE_TOKEN = 'a'.repeat(32);
    process.env.REQUEST_TIMEOUT_MS = '150000';

    const config = loadConfig();
    expect(config.requestTimeoutMs).toBe(30000);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('Invalid REQUEST_TIMEOUT_MS')
    );
  });

  it('应该处理所有有效的日志级别', () => {
    const validLevels: ServerConfig['logLevel'][] = [
      'debug',
      'info',
      'warn',
      'error',
    ];

    validLevels.forEach((level) => {
      process.env.TUSHARE_TOKEN = 'a'.repeat(32);
      process.env.LOG_LEVEL = level;

      const config = loadConfig();
      expect(config.logLevel).toBe(level);
    });
  });
});

describe('config.ts - validateConfig', () => {
  it('应该验证有效的配置', () => {
    const validConfig: ServerConfig = {
      tushareToken: 'a'.repeat(32),
      logLevel: 'info',
      rateLimitMaxRequests: 100,
      rateLimitWindowMs: 60000,
      requestTimeoutMs: 30000,
    };

    expect(validateConfig(validConfig)).toBe(true);
  });

  it('应该拒绝过短的 token', () => {
    const invalidConfig: ServerConfig = {
      tushareToken: 'short',
      logLevel: 'info',
      rateLimitMaxRequests: 100,
      rateLimitWindowMs: 60000,
      requestTimeoutMs: 30000,
    };

    expect(validateConfig(invalidConfig)).toBe(false);
  });

  it('应该拒绝无效的日志级别', () => {
    const invalidConfig: ServerConfig = {
      tushareToken: 'a'.repeat(32),
      logLevel: 'invalid' as any,
      rateLimitMaxRequests: 100,
      rateLimitWindowMs: 60000,
      requestTimeoutMs: 30000,
    };

    expect(validateConfig(invalidConfig)).toBe(false);
  });

  it('应该拒绝超出范围的 rateLimitMaxRequests', () => {
    const invalidConfig: ServerConfig = {
      tushareToken: 'a'.repeat(32),
      logLevel: 'info',
      rateLimitMaxRequests: 2000,
      rateLimitWindowMs: 60000,
      requestTimeoutMs: 30000,
    };

    expect(validateConfig(invalidConfig)).toBe(false);
  });

  it('应该拒绝超出范围的 rateLimitWindowMs', () => {
    const invalidConfig: ServerConfig = {
      tushareToken: 'a'.repeat(32),
      logLevel: 'info',
      rateLimitMaxRequests: 100,
      rateLimitWindowMs: 700000,
      requestTimeoutMs: 30000,
    };

    expect(validateConfig(invalidConfig)).toBe(false);
  });

  it('应该拒绝超出范围的 requestTimeoutMs', () => {
    const invalidConfig: ServerConfig = {
      tushareToken: 'a'.repeat(32),
      logLevel: 'info',
      rateLimitMaxRequests: 100,
      rateLimitWindowMs: 60000,
      requestTimeoutMs: 150000,
    };

    expect(validateConfig(invalidConfig)).toBe(false);
  });

  it('应该接受边界值', () => {
    const minConfig: ServerConfig = {
      tushareToken: 'a'.repeat(32),
      logLevel: 'debug',
      rateLimitMaxRequests: 1,
      rateLimitWindowMs: 1000,
      requestTimeoutMs: 5000,
    };

    const maxConfig: ServerConfig = {
      tushareToken: 'a'.repeat(32),
      logLevel: 'error',
      rateLimitMaxRequests: 1000,
      rateLimitWindowMs: 600000,
      requestTimeoutMs: 120000,
    };

    expect(validateConfig(minConfig)).toBe(true);
    expect(validateConfig(maxConfig)).toBe(true);
  });
});
