import { describe, it, expect } from 'vitest';
import * as TushareSDK from '../../src/index.js';

describe('导出测试', () => {
  describe('核心客户端导出', () => {
    it('应该导出 TushareClient', () => {
      expect(TushareSDK.TushareClient).toBeDefined();
      expect(typeof TushareSDK.TushareClient).toBe('function');
    });
  });

  describe('错误类型导出', () => {
    it('应该导出 ApiError', () => {
      expect(TushareSDK.ApiError).toBeDefined();
      expect(typeof TushareSDK.ApiError).toBe('function');
    });

    it('应该导出 ApiErrorType', () => {
      expect(TushareSDK.ApiErrorType).toBeDefined();
      expect(typeof TushareSDK.ApiErrorType).toBe('object');
      expect(TushareSDK.ApiErrorType.NETWORK_ERROR).toBe('NETWORK_ERROR');
      expect(TushareSDK.ApiErrorType.AUTH_ERROR).toBe('AUTH_ERROR');
      expect(TushareSDK.ApiErrorType.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(TushareSDK.ApiErrorType.TIMEOUT_ERROR).toBe('TIMEOUT_ERROR');
      expect(TushareSDK.ApiErrorType.RATE_LIMIT).toBe('RATE_LIMIT');
      expect(TushareSDK.ApiErrorType.SERVER_ERROR).toBe('SERVER_ERROR');
      expect(TushareSDK.ApiErrorType.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
    });
  });

  describe('工具类导出', () => {
    it('应该导出 LogLevel', () => {
      expect(TushareSDK.LogLevel).toBeDefined();
      expect(typeof TushareSDK.LogLevel).toBe('object');
      expect(TushareSDK.LogLevel.DEBUG).toBe(0);
      expect(TushareSDK.LogLevel.INFO).toBe(1);
      expect(TushareSDK.LogLevel.WARN).toBe(2);
      expect(TushareSDK.LogLevel.ERROR).toBe(3);
      expect(TushareSDK.LogLevel.SILENT).toBe(4);
    });

    it('应该导出 ConsoleLogger', () => {
      expect(TushareSDK.ConsoleLogger).toBeDefined();
      expect(typeof TushareSDK.ConsoleLogger).toBe('function');
    });

    it('应该导出日期工具函数', () => {
      expect(typeof TushareSDK.formatDate).toBe('function');
      expect(typeof TushareSDK.parseDate).toBe('function');
      expect(typeof TushareSDK.isValidDateFormat).toBe('function');
    });
  });

  describe('服务类导出', () => {
    it('应该导出 MemoryCacheProvider', () => {
      expect(TushareSDK.MemoryCacheProvider).toBeDefined();
      expect(typeof TushareSDK.MemoryCacheProvider).toBe('function');
    });
  });

  describe('API 方法导出', () => {
    it('应该导出 getStockBasic', () => {
      expect(typeof TushareSDK.getStockBasic).toBe('function');
    });

    it('应该导出 getDailyQuote', () => {
      expect(typeof TushareSDK.getDailyQuote).toBe('function');
    });

    it('应该导出 getFinancialData', () => {
      expect(typeof TushareSDK.getFinancialData).toBe('function');
    });

    it('应该导出 getTradeCalendar', () => {
      expect(typeof TushareSDK.getTradeCalendar).toBe('function');
    });
  });

  describe('导出的功能验证', () => {
    it('TushareClient 应该可以实例化', () => {
      const client = new TushareSDK.TushareClient({ token: 'test_token' });
      expect(client).toBeInstanceOf(TushareSDK.TushareClient);
    });

    it('ConsoleLogger 应该可以实例化', () => {
      const logger = new TushareSDK.ConsoleLogger(TushareSDK.LogLevel.INFO);
      expect(logger).toBeInstanceOf(TushareSDK.ConsoleLogger);
    });

    it('MemoryCacheProvider 应该可以实例化', () => {
      const cache = new TushareSDK.MemoryCacheProvider();
      expect(cache).toBeInstanceOf(TushareSDK.MemoryCacheProvider);
    });

    it('ApiError 应该可以实例化', () => {
      const error = new TushareSDK.ApiError(
        TushareSDK.ApiErrorType.VALIDATION_ERROR,
        'Test error'
      );
      expect(error).toBeInstanceOf(TushareSDK.ApiError);
      expect(error).toBeInstanceOf(Error);
      expect(error.type).toBe(TushareSDK.ApiErrorType.VALIDATION_ERROR);
      expect(error.message).toBe('Test error');
    });

    it('日期工具函数应该正常工作', () => {
      const date = new Date('2023-01-01');
      const formatted = TushareSDK.formatDate(date);
      expect(formatted).toBe('20230101');

      const parsed = TushareSDK.parseDate('20230101');
      expect(parsed).toBeInstanceOf(Date);
      expect(parsed.getFullYear()).toBe(2023);
      expect(parsed.getMonth()).toBe(0);
      expect(parsed.getDate()).toBe(1);

      expect(TushareSDK.isValidDateFormat('20230101')).toBe(true);
      expect(TushareSDK.isValidDateFormat('2023-01-01')).toBe(true);
      expect(TushareSDK.isValidDateFormat('invalid')).toBe(false);
      expect(TushareSDK.isValidDateFormat('2023/01/01')).toBe(false);
    });
  });
});
