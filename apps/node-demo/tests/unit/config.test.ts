/**
 * 配置加载单元测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { validateConfig } from '../../src/config.js';
import type { AppConfig } from '../../src/config.js';

describe('配置管理', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // 保存原始环境变量
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // 恢复环境变量
    process.env = originalEnv;
  });

  describe('validateConfig', () => {
    it('应该接受有效的配置', () => {
      const config: AppConfig = {
        tushareToken: 'valid_token_123',
      };

      expect(() => validateConfig(config)).not.toThrow();
    });

    it('应该拒绝空 Token', () => {
      const config: AppConfig = {
        tushareToken: '',
      };

      expect(() => validateConfig(config)).toThrow('缺少 Tushare API Token');
    });

    it('应该拒绝只有空格的 Token', () => {
      const config: AppConfig = {
        tushareToken: '   ',
      };

      expect(() => validateConfig(config)).toThrow('缺少 Tushare API Token');
    });

    it('应该接受有效的 API URL', () => {
      const config: AppConfig = {
        tushareToken: 'valid_token_123',
        apiBaseUrl: 'https://api.tushare.pro',
      };

      expect(() => validateConfig(config)).not.toThrow();
    });

    it('应该拒绝无效的 API URL', () => {
      const config: AppConfig = {
        tushareToken: 'valid_token_123',
        apiBaseUrl: 'invalid-url',
      };

      expect(() => validateConfig(config)).toThrow('无效的 API URL');
    });

    it('应该接受可选的 debug 标志', () => {
      const config: AppConfig = {
        tushareToken: 'valid_token_123',
        debug: true,
      };

      expect(() => validateConfig(config)).not.toThrow();
    });
  });
});
