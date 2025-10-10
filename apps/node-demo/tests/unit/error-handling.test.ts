/**
 * 错误处理单元测试
 */

import { describe, it, expect } from 'vitest';
import { formatError, getErrorSuggestion } from '../../src/utils/error-handler.js';
import { ApiError, ApiErrorType } from '@hestudy/tushare-sdk';

describe('错误处理', () => {
  describe('formatError', () => {
    it('应该格式化 ApiError', () => {
      const error = new ApiError(
        ApiErrorType.AUTH_ERROR,
        '认证失败',
        40001
      );

      const formatted = formatError(error);

      expect(formatted.type).toBe(ApiErrorType.AUTH_ERROR);
      expect(formatted.message).toBe('认证失败');
      expect(formatted.code).toBe('40001');
      expect(formatted.suggestion).toBeDefined();
    });

    it('应该格式化普通 Error', () => {
      const error = new Error('普通错误');

      const formatted = formatError(error);

      expect(formatted.type).toBe('UNKNOWN_ERROR');
      expect(formatted.message).toBe('普通错误');
      expect(formatted.suggestion).toBeDefined();
    });

    it('应该格式化未知错误', () => {
      const error = '字符串错误';

      const formatted = formatError(error);

      expect(formatted.type).toBe('UNKNOWN_ERROR');
      expect(formatted.message).toBe('字符串错误');
    });
  });

  describe('getErrorSuggestion', () => {
    it('应该为认证错误提供建议', () => {
      const suggestion = getErrorSuggestion(ApiErrorType.AUTH_ERROR);
      expect(suggestion).toContain('TUSHARE_TOKEN');
    });

    it('应该为网络错误提供建议', () => {
      const suggestion = getErrorSuggestion(ApiErrorType.NETWORK_ERROR);
      expect(suggestion).toContain('网络');
    });

    it('应该为参数错误提供建议', () => {
      const suggestion = getErrorSuggestion(ApiErrorType.VALIDATION_ERROR);
      expect(suggestion).toContain('参数');
    });

    it('应该为未知错误提供默认建议', () => {
      const suggestion = getErrorSuggestion('UNKNOWN');
      expect(suggestion).toBeDefined();
    });
  });
});
