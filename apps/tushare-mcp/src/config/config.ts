import type { ServerConfig } from '../types/mcp-tools.types.js';

/**
 * 从环境变量加载服务器配置
 *
 * @returns ServerConfig 服务器配置对象
 * @throws Error 如果 TUSHARE_TOKEN 环境变量未设置
 */
export function loadConfig(): ServerConfig {
  const tushareToken = process.env.TUSHARE_TOKEN;

  if (!tushareToken || tushareToken.length < 32) {
    throw new Error(
      'Missing or invalid TUSHARE_TOKEN environment variable. ' +
        'Please set a valid Tushare API token (minimum 32 characters). ' +
        'Get your token at: https://tushare.pro/register'
    );
  }

  // 日志级别验证
  const logLevel = process.env.LOG_LEVEL || 'info';
  const validLogLevels = ['debug', 'info', 'warn', 'error'];
  const finalLogLevel = validLogLevels.includes(logLevel)
    ? (logLevel as ServerConfig['logLevel'])
    : 'info';

  if (logLevel !== finalLogLevel) {
    console.warn(
      `Invalid LOG_LEVEL "${logLevel}", using default "info". Valid values: ${validLogLevels.join(', ')}`
    );
  }

  // 限流配置验证
  const rateLimitMaxRequests = parseInt(
    process.env.RATE_LIMIT_MAX_REQUESTS || '100',
    10
  );
  const rateLimitWindowMs = parseInt(
    process.env.RATE_LIMIT_WINDOW_MS || '60000',
    10
  );
  const requestTimeoutMs = parseInt(
    process.env.REQUEST_TIMEOUT_MS || '30000',
    10
  );

  // 验证数值范围
  const finalRateLimitMaxRequests =
    rateLimitMaxRequests >= 1 && rateLimitMaxRequests <= 1000
      ? rateLimitMaxRequests
      : 100;
  const finalRateLimitWindowMs =
    rateLimitWindowMs >= 1000 && rateLimitWindowMs <= 600000
      ? rateLimitWindowMs
      : 60000;
  const finalRequestTimeoutMs =
    requestTimeoutMs >= 5000 && requestTimeoutMs <= 120000
      ? requestTimeoutMs
      : 30000;

  if (rateLimitMaxRequests !== finalRateLimitMaxRequests) {
    console.warn(
      `Invalid RATE_LIMIT_MAX_REQUESTS "${rateLimitMaxRequests}", using default ${finalRateLimitMaxRequests}. Valid range: 1-1000`
    );
  }

  if (rateLimitWindowMs !== finalRateLimitWindowMs) {
    console.warn(
      `Invalid RATE_LIMIT_WINDOW_MS "${rateLimitWindowMs}", using default ${finalRateLimitWindowMs}. Valid range: 1000-600000`
    );
  }

  if (requestTimeoutMs !== finalRequestTimeoutMs) {
    console.warn(
      `Invalid REQUEST_TIMEOUT_MS "${requestTimeoutMs}", using default ${finalRequestTimeoutMs}. Valid range: 5000-120000`
    );
  }

  return {
    tushareToken,
    logLevel: finalLogLevel,
    rateLimitMaxRequests: finalRateLimitMaxRequests,
    rateLimitWindowMs: finalRateLimitWindowMs,
    requestTimeoutMs: finalRequestTimeoutMs,
  };
}

/**
 * 验证配置对象的完整性
 *
 * @param config 要验证的配置对象
 * @returns boolean 配置是否有效
 */
export function validateConfig(config: ServerConfig): boolean {
  return (
    !!config.tushareToken &&
    config.tushareToken.length >= 32 &&
    ['debug', 'info', 'warn', 'error'].includes(config.logLevel) &&
    config.rateLimitMaxRequests >= 1 &&
    config.rateLimitMaxRequests <= 1000 &&
    config.rateLimitWindowMs >= 1000 &&
    config.rateLimitWindowMs <= 600000 &&
    config.requestTimeoutMs >= 5000 &&
    config.requestTimeoutMs <= 120000
  );
}
