/**
 * 配置管理模块
 * 
 * 负责加载和验证应用配置,包括环境变量读取和配置验证
 */

import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

/**
 * 应用配置接口
 */
export interface AppConfig {
  /**
   * Tushare API Token
   * 从环境变量 TUSHARE_TOKEN 读取
   */
  tushareToken: string;

  /**
   * API 基础 URL
   * 默认: https://api.tushare.pro
   * 可通过 TUSHARE_API_URL 环境变量覆盖
   */
  apiBaseUrl?: string;

  /**
   * 是否启用调试日志
   * 默认: false
   * 可通过 DEBUG 环境变量设置
   */
  debug?: boolean;
}

/**
 * 验证 URL 格式
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 验证应用配置
 * 
 * @param config - 应用配置对象
 * @throws {Error} 配置无效时抛出错误
 */
export function validateConfig(config: AppConfig): void {
  if (!config.tushareToken || config.tushareToken.trim() === '') {
    throw new Error(
      '缺少 Tushare API Token。请设置环境变量 TUSHARE_TOKEN 或在 .env 文件中配置。\n' +
      '获取 Token: https://tushare.pro'
    );
  }

  if (config.apiBaseUrl && !isValidUrl(config.apiBaseUrl)) {
    throw new Error(
      `无效的 API URL: ${config.apiBaseUrl}`
    );
  }
}

/**
 * 加载应用配置
 * 
 * @returns 应用配置对象
 * @throws {Error} 配置无效时抛出错误
 */
export function loadConfig(): AppConfig {
  const config: AppConfig = {
    tushareToken: process.env.TUSHARE_TOKEN || '',
    apiBaseUrl: process.env.TUSHARE_API_URL,
    debug: process.env.DEBUG === 'true' || process.env.DEBUG === '1',
  };

  // 验证配置
  validateConfig(config);

  return config;
}
