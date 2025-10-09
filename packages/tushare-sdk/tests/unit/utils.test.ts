import { describe, it, expect } from 'vitest';
import { formatDate, parseDate, isValidDateFormat } from '../../src/utils/date.js';
import { ConsoleLogger, LogLevel } from '../../src/utils/logger.js';

describe('日期工具函数', () => {
  describe('formatDate', () => {
    it('应该格式化 Date 对象为 YYYYMMDD', () => {
      const date = new Date('2023-12-25');
      expect(formatDate(date)).toBe('20231225');
    });

    it('应该格式化 YYYY-MM-DD 字符串为 YYYYMMDD', () => {
      expect(formatDate('2023-12-25')).toBe('20231225');
    });

    it('应该保持 YYYYMMDD 格式不变', () => {
      expect(formatDate('20231225')).toBe('20231225');
    });

    it('应该格式化时间戳为 YYYYMMDD', () => {
      const timestamp = new Date('2023-12-25').getTime();
      expect(formatDate(timestamp)).toBe('20231225');
    });

    it('应该正确处理月份和日期的零填充', () => {
      const date = new Date('2023-01-05');
      expect(formatDate(date)).toBe('20230105');
    });
  });

  describe('parseDate', () => {
    it('应该解析 YYYYMMDD 为 Date 对象', () => {
      const date = parseDate('20231225');
      expect(date.getFullYear()).toBe(2023);
      expect(date.getMonth()).toBe(11); // 12月 = 11
      expect(date.getDate()).toBe(25);
    });

    it('应该拒绝无效的日期格式', () => {
      expect(() => parseDate('2023-12-25')).toThrow();
      expect(() => parseDate('invalid')).toThrow();
    });

    it('应该拒绝无效的日期值', () => {
      expect(() => parseDate('20231332')).toThrow(); // 13月32日
    });
  });

  describe('isValidDateFormat', () => {
    it('应该接受 YYYYMMDD 格式', () => {
      expect(isValidDateFormat('20231225')).toBe(true);
    });

    it('应该接受 YYYY-MM-DD 格式', () => {
      expect(isValidDateFormat('2023-12-25')).toBe(true);
    });

    it('应该拒绝其他格式', () => {
      expect(isValidDateFormat('2023/12/25')).toBe(false);
      expect(isValidDateFormat('25-12-2023')).toBe(false);
      expect(isValidDateFormat('invalid')).toBe(false);
    });
  });
});

describe('Logger', () => {
  describe('ConsoleLogger', () => {
    it('应该创建默认日志实例', () => {
      const logger = new ConsoleLogger();
      expect(logger).toBeDefined();
    });

    it('应该创建指定级别的日志实例', () => {
      const logger = new ConsoleLogger(LogLevel.DEBUG);
      expect(logger).toBeDefined();
    });

    it('应该有所有日志方法', () => {
      const logger = new ConsoleLogger();
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
    });
  });

  describe('LogLevel', () => {
    it('应该定义所有日志级别', () => {
      expect(LogLevel.DEBUG).toBe(0);
      expect(LogLevel.INFO).toBe(1);
      expect(LogLevel.WARN).toBe(2);
      expect(LogLevel.ERROR).toBe(3);
      expect(LogLevel.SILENT).toBe(4);
    });
  });
});
