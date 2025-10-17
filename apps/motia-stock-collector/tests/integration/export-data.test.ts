/**
 * T018 [P] [US3] 数据导出契约测试
 *
 * 验证数据导出 Step 符合 contracts/export-data.step.json 契约
 * - 验证 CSV 格式输出正确性
 * - 验证 JSON 格式输出正确性
 * - 测试空结果处理
 * - 测试参数验证
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { db } from '../../lib/database.js';
import type { DailyQuote } from '../../types/index.js';
import { getTestDate } from '../helpers/date-helpers.js';

// 生成测试日期
const DATE_01_02 = getTestDate(0);
const DATE_01_03 = getTestDate(1);
const DATE_01_05 = getTestDate(3);
const endDate = getTestDate(5);

// 模拟测试数据
const mockQuotes: Omit<DailyQuote, 'id' | 'createdAt'>[] = [
  {
    tsCode: '600519.SH',
    tradeDate: DATE_01_02,
    open: 1650.0,
    high: 1680.0,
    low: 1645.0,
    close: 1670.0,
    preClose: 1640.0,
    change: 30.0,
    pctChg: 1.83,
    vol: 150000,
    amount: 250000000,
  },
  {
    tsCode: '600519.SH',
    tradeDate: DATE_01_03,
    open: 1670.0,
    high: 1690.0,
    low: 1665.0,
    close: 1685.0,
    preClose: 1670.0,
    change: 15.0,
    pctChg: 0.9,
    vol: 120000,
    amount: 200000000,
  },
  {
    tsCode: '000001.SZ',
    tradeDate: DATE_01_02,
    open: 12.5,
    high: 12.8,
    low: 12.4,
    close: 12.7,
    preClose: 12.5,
    change: 0.2,
    pctChg: 1.6,
    vol: 500000,
    amount: 6300000,
  },
];

describe('T018 [US3] ExportDataAPI Step - Contract Tests', () => {
  // 动态导入 handler (避免在文件加载时执行)
  let handler: any;

  beforeAll(async () => {
    // 导入 Step handler
    const module = await import('../../steps/export-data.step.js');
    handler = module.handler;

    // 准备测试数据
    db.saveQuotes(mockQuotes);
  });

  beforeEach(() => {
    // 在每个测试前清除额外的数据，但保留初始的 mockQuotes
    // 通过清除所有并重新插入来重置
    db.clearAllData();
    db.saveQuotes(mockQuotes);
  });

  afterAll(() => {
    // 清理测试数据
    db.clearAllData();
  });

  describe('契约验证 - Step 配置', () => {
    it('应该符合契约定义的 config 结构', async () => {
      const { config } = await import('../../steps/export-data.step.js');

      expect(config).toBeDefined();
      expect(config.name).toBe('ExportDataAPI');
      expect(config.type).toBe('api');
      expect(config.path).toBe('/api/export');
      expect(config.method).toBe('GET');
    });
  });

  describe('CSV 格式导出测试', () => {
    it('应该正确导出 CSV 格式数据', async () => {
      const req = {
        query: {
          tsCode: '600519.SH',
          format: 'csv',
          limit: '10',
        },
      };

      const mockLogger = {
        info: () => {},
        warn: () => {},
        error: () => {},
      };

      const response = await handler(req, { logger: mockLogger });

      // 验证响应状态
      expect(response.status).toBe(200);

      // 验证响应头
      expect(response.headers).toBeDefined();
      expect(response.headers['Content-Type']).toContain('text/csv');
      expect(response.headers['Content-Disposition']).toContain('attachment');
      expect(response.headers['Content-Disposition']).toContain('.csv');

      // 验证 CSV 内容
      const csvBody = response.body;
      expect(csvBody).toBeTypeOf('string');

      // 验证 CSV 格式
      const lines = csvBody.split('\n');
      expect(lines[0]).toBe(
        'ts_code,trade_date,open,high,low,close,pre_close,change,pct_chg,vol,amount'
      );

      // 验证数据行数 (header + 2 条数据)
      expect(lines.length).toBeGreaterThanOrEqual(3);

      // 验证数据内容
      expect(csvBody).toContain('600519.SH');
      expect(csvBody).toContain(DATE_01_02);
      expect(csvBody).toContain('1650');
    });

    it('应该正确处理空结果的 CSV 导出', async () => {
      const req = {
        query: {
          tsCode: '999999.SH', // 不存在的股票代码
          format: 'csv',
        },
      };

      const mockLogger = {
        info: () => {},
        warn: () => {},
        error: () => {},
      };

      const response = await handler(req, { logger: mockLogger });

      expect(response.status).toBe(200);

      const csvBody = response.body;
      expect(csvBody).toBeTypeOf('string');

      // 空结果应该只包含表头
      const lines = csvBody.split('\n').filter((line) => line.trim());
      expect(lines[0]).toBe(
        'ts_code,trade_date,open,high,low,close,pre_close,change,pct_chg,vol,amount'
      );
      expect(lines.length).toBe(1); // 只有表头
    });

    it('应该正确导出包含空值的数据', async () => {
      // 插入包含空值的测试数据
      const quoteWithNulls: Omit<DailyQuote, 'id' | 'createdAt'> = {
        tsCode: '600000.SH',
        tradeDate: DATE_01_05,
        open: null,
        high: null,
        low: null,
        close: 100.0,
        preClose: 99.0,
        change: 1.0,
        pctChg: 1.01,
        vol: null,
        amount: null,
      };

      db.saveQuotes([quoteWithNulls]);

      const req = {
        query: {
          tsCode: '600000.SH',
          format: 'csv',
        },
      };

      const mockLogger = {
        info: () => {},
        warn: () => {},
        error: () => {},
      };

      const response = await handler(req, { logger: mockLogger });

      expect(response.status).toBe(200);

      const csvBody = response.body;
      // 验证空值被正确处理 (转换为空字符串)
      expect(csvBody).toContain(`600000.SH,${DATE_01_05},,,,100,99,1,1.01,,`);
    });
  });

  describe('JSON 格式导出测试', () => {
    it('应该正确导出 JSON 格式数据', async () => {
      const req = {
        query: {
          tsCode: '600519.SH',
          format: 'json',
          limit: '10',
        },
      };

      const mockLogger = {
        info: () => {},
        warn: () => {},
        error: () => {},
      };

      const response = await handler(req, { logger: mockLogger });

      // 验证响应状态
      expect(response.status).toBe(200);

      // 验证响应头
      expect(response.headers).toBeDefined();
      expect(response.headers['Content-Type']).toContain('application/json');
      expect(response.headers['Content-Disposition']).toContain('attachment');
      expect(response.headers['Content-Disposition']).toContain('.json');

      // 验证 JSON 内容
      const jsonBody = response.body;
      expect(jsonBody).toBeDefined();
      expect(jsonBody.success).toBe(true);
      expect(jsonBody.data).toBeInstanceOf(Array);
      expect(jsonBody.count).toBeGreaterThan(0);
      expect(jsonBody.exportedAt).toBeDefined();

      // 验证数据结构
      expect(jsonBody.data[0]).toHaveProperty('tsCode');
      expect(jsonBody.data[0]).toHaveProperty('tradeDate');
      expect(jsonBody.data[0]).toHaveProperty('close');
    });

    it('应该正确处理空结果的 JSON 导出', async () => {
      const req = {
        query: {
          tsCode: '999999.SH',
          format: 'json',
        },
      };

      const mockLogger = {
        info: () => {},
        warn: () => {},
        error: () => {},
      };

      const response = await handler(req, { logger: mockLogger });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(response.body.count).toBe(0);
    });
  });

  describe('参数验证测试', () => {
    const mockLogger = {
      info: () => {},
      warn: () => {},
      error: () => {},
    };

    it('应该拒绝无效的股票代码格式', async () => {
      const req = {
        query: {
          tsCode: 'invalid',
          format: 'json',
        },
      };

      const response = await handler(req, { logger: mockLogger });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid stock code format');
    });

    it('应该拒绝无效的开始日期格式', async () => {
      const req = {
        query: {
          startDate: '2024/01/01',
          format: 'json',
        },
      };

      const response = await handler(req, { logger: mockLogger });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid start date format');
    });

    it('应该拒绝无效的结束日期格式', async () => {
      const req = {
        query: {
          endDate: '01-01-2024',
          format: 'json',
        },
      };

      const response = await handler(req, { logger: mockLogger });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid end date format');
    });

    it('应该拒绝无效的导出格式', async () => {
      const req = {
        query: {
          format: 'xml',
        },
      };

      const response = await handler(req, { logger: mockLogger });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid format');
    });

    it('应该拒绝无效的 limit 值', async () => {
      const testCases = [
        { limit: '0', reason: 'too small' },
        { limit: '10001', reason: 'too large' },
        { limit: 'abc', reason: 'not a number' },
      ];

      for (const testCase of testCases) {
        const req = {
          query: {
            limit: testCase.limit,
            format: 'json',
          },
        };

        const response = await handler(req, { logger: mockLogger });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toContain('Invalid limit value');
      }
    });

    it('应该接受有效的查询参数组合', async () => {
      const req = {
        query: {
          tsCode: '600519.SH',
          startDate: '2024-01-01',
          endDate: endDate,
          limit: '100',
          format: 'json',
        },
      };

      const response = await handler(req, { logger: mockLogger });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('默认参数测试', () => {
    it('应该使用默认格式 (json)', async () => {
      const req = {
        query: {
          tsCode: '600519.SH',
        },
      };

      const mockLogger = {
        info: () => {},
        warn: () => {},
        error: () => {},
      };

      const response = await handler(req, { logger: mockLogger });

      expect(response.status).toBe(200);
      expect(response.headers['Content-Type']).toContain('application/json');
    });

    it('应该使用默认 limit (1000)', async () => {
      const req = {
        query: {
          format: 'json',
        },
      };

      const mockLogger = {
        info: () => {},
        warn: () => {},
        error: () => {},
      };

      const response = await handler(req, { logger: mockLogger });

      expect(response.status).toBe(200);
      // 验证返回的数据量 <= 1000
      expect(response.body.data.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('错误处理测试', () => {
    it('应该正确处理数据库错误', async () => {
      // 模拟数据库错误
      const originalQueryQuotes = db.queryQuotes;
      db.queryQuotes = () => {
        throw new Error('Database connection failed');
      };

      const req = {
        query: {
          format: 'json',
        },
      };

      const mockLogger = {
        info: () => {},
        warn: () => {},
        error: () => {},
      };

      const response = await handler(req, { logger: mockLogger });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Internal server error');

      // 恢复原始方法
      db.queryQuotes = originalQueryQuotes;
    });
  });

  describe('文件名生成测试', () => {
    it('CSV 文件名应该包含股票代码和日期', async () => {
      const req = {
        query: {
          tsCode: '600519.SH',
          format: 'csv',
        },
      };

      const mockLogger = {
        info: () => {},
        warn: () => {},
        error: () => {},
      };

      const response = await handler(req, { logger: mockLogger });

      expect(response.headers['Content-Disposition']).toContain('600519.SH');
      expect(response.headers['Content-Disposition']).toMatch(
        /\d{4}-\d{2}-\d{2}/
      );
      expect(response.headers['Content-Disposition']).toContain('.csv');
    });

    it('JSON 文件名应该包含股票代码和日期', async () => {
      const req = {
        query: {
          tsCode: '000001.SZ',
          format: 'json',
        },
      };

      const mockLogger = {
        info: () => {},
        warn: () => {},
        error: () => {},
      };

      const response = await handler(req, { logger: mockLogger });

      expect(response.headers['Content-Disposition']).toContain('000001.SZ');
      expect(response.headers['Content-Disposition']).toMatch(
        /\d{4}-\d{2}-\d{2}/
      );
      expect(response.headers['Content-Disposition']).toContain('.json');
    });

    it('无股票代码时文件名应该使用 "all"', async () => {
      const req = {
        query: {
          format: 'json',
        },
      };

      const mockLogger = {
        info: () => {},
        warn: () => {},
        error: () => {},
      };

      const response = await handler(req, { logger: mockLogger });

      expect(response.headers['Content-Disposition']).toContain('all');
    });
  });
});
