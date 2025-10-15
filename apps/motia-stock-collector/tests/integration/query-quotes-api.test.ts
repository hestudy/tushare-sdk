/**
 * 查询 API 契约测试
 *
 * 验证 query-quotes-api.step 符合契约规范:
 * - 请求/响应 Schema 符合 contracts/query-quotes-api.step.json
 * - 参数验证正确处理无效输入
 * - 成功和失败场景覆盖完整
 *
 * NOTE: 按照 TDD 原则，这个测试应该先编写并失败，再实现功能
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { unlink, existsSync } from 'fs';
import { promisify } from 'util';
import type { DailyQuote } from '../../types/index';

// 导入 Step
import { config, handler } from '../../steps/query-quotes-api.step';

const unlinkAsync = promisify(unlink);

describe('QueryQuotesAPI Step - Contract Tests', () => {
  const testDbPath = './data/test-query-api.db';

  beforeAll(async () => {
    // 清理旧的测试数据库
    if (existsSync(testDbPath)) {
      await unlinkAsync(testDbPath);
    }

    // 设置环境变量使用测试数据库
    process.env.DATABASE_PATH = testDbPath;

    // 动态导入并初始化数据库
    const { db } = await import('../../lib/database.js');

    // 插入测试数据
    const testQuotes: Omit<DailyQuote, 'id' | 'createdAt'>[] = [
      {
        tsCode: '600519.SH',
        tradeDate: '2024-01-02',
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
        tradeDate: '2024-01-03',
        open: 1670.0,
        high: 1690.0,
        low: 1660.0,
        close: 1680.0,
        preClose: 1670.0,
        change: 10.0,
        pctChg: 0.6,
        vol: 120000,
        amount: 200000000,
      },
      {
        tsCode: '000001.SZ',
        tradeDate: '2024-01-02',
        open: 10.5,
        high: 10.8,
        low: 10.45,
        close: 10.75,
        preClose: 10.4,
        change: 0.35,
        pctChg: 3.37,
        vol: 500000,
        amount: 53000000,
      },
    ];

    db.saveQuotes(testQuotes);
  });

  afterAll(async () => {
    // 清理测试数据库
    const { db } = await import('../../lib/database.js');
    db.close();

    if (existsSync(testDbPath)) {
      await unlinkAsync(testDbPath);
    }
  });

  describe('Step 配置契约', () => {
    it('应该符合契约定义的配置', () => {
      expect(config.name).toBe('QueryQuotesAPI');
      expect(config.type).toBe('api');
      expect(config.path).toBe('/api/quotes');
      expect(config.method).toBe('GET');
    });
  });

  describe('成功场景', () => {
    it('应该查询指定股票代码的数据', async () => {
      const mockReq = {
        query: {
          tsCode: '600519.SH',
        },
      };

      const mockContext = {
        logger: {
          info: () => {},
          warn: () => {},
          error: () => {},
        },
      };

      const response = await handler(mockReq, mockContext);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(2);
      expect(response.body.count).toBe(2);
      expect(response.body.data[0].tsCode).toBe('600519.SH');
    });

    it('应该查询指定日期范围的数据', async () => {
      const mockReq = {
        query: {
          tsCode: '600519.SH',
          startDate: '2024-01-02',
          endDate: '2024-01-02',
        },
      };

      const mockContext = {
        logger: {
          info: () => {},
          warn: () => {},
          error: () => {},
        },
      };

      const response = await handler(mockReq, mockContext);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].tradeDate).toBe('2024-01-02');
    });

    it('应该限制返回记录数', async () => {
      const mockReq = {
        query: {
          limit: '1',
        },
      };

      const mockContext = {
        logger: {
          info: () => {},
          warn: () => {},
          error: () => {},
        },
      };

      const response = await handler(mockReq, mockContext);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
    });

    it('应该处理空结果', async () => {
      const mockReq = {
        query: {
          tsCode: '999999.SH', // 不存在的股票代码
        },
      };

      const mockContext = {
        logger: {
          info: () => {},
          warn: () => {},
          error: () => {},
        },
      };

      const response = await handler(mockReq, mockContext);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(0);
      expect(response.body.count).toBe(0);
    });
  });

  describe('参数验证场景', () => {
    it('应该拒绝无效的股票代码格式', async () => {
      const mockReq = {
        query: {
          tsCode: 'invalid',
        },
      };

      const mockContext = {
        logger: {
          info: () => {},
          warn: () => {},
          error: () => {},
        },
      };

      const response = await handler(mockReq, mockContext);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid stock code format');
    });

    it('应该拒绝无效的开始日期格式', async () => {
      const mockReq = {
        query: {
          startDate: '20240101', // 错误格式，应该是 YYYY-MM-DD
        },
      };

      const mockContext = {
        logger: {
          info: () => {},
          warn: () => {},
          error: () => {},
        },
      };

      const response = await handler(mockReq, mockContext);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid start date format');
    });

    it('应该拒绝无效的结束日期格式', async () => {
      const mockReq = {
        query: {
          endDate: '2024/01/01', // 错误格式
        },
      };

      const mockContext = {
        logger: {
          info: () => {},
          warn: () => {},
          error: () => {},
        },
      };

      const response = await handler(mockReq, mockContext);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid end date format');
    });

    it('应该拒绝超出范围的 limit 值', async () => {
      const mockReq = {
        query: {
          limit: '2000', // 超过最大值 1000
        },
      };

      const mockContext = {
        logger: {
          info: () => {},
          warn: () => {},
          error: () => {},
        },
      };

      const response = await handler(mockReq, mockContext);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid limit value');
    });

    it('应该拒绝负数 limit 值', async () => {
      const mockReq = {
        query: {
          limit: '0',
        },
      };

      const mockContext = {
        logger: {
          info: () => {},
          warn: () => {},
          error: () => {},
        },
      };

      const response = await handler(mockReq, mockContext);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid limit value');
    });
  });

  describe('响应格式契约', () => {
    it('成功响应应该包含所有必需字段', async () => {
      const mockReq = {
        query: {
          tsCode: '600519.SH',
        },
      };

      const mockContext = {
        logger: {
          info: () => {},
          warn: () => {},
          error: () => {},
        },
      };

      const response = await handler(mockReq, mockContext);

      expect(response).toHaveProperty('status');
      expect(response).toHaveProperty('body');
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('count');

      // 验证数据项的字段
      if (response.body.data.length > 0) {
        const item = response.body.data[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('tsCode');
        expect(item).toHaveProperty('tradeDate');
        expect(item).toHaveProperty('open');
        expect(item).toHaveProperty('high');
        expect(item).toHaveProperty('low');
        expect(item).toHaveProperty('close');
        expect(item).toHaveProperty('vol');
        expect(item).toHaveProperty('amount');
      }
    });

    it('失败响应应该包含错误信息', async () => {
      const mockReq = {
        query: {
          tsCode: 'invalid',
        },
      };

      const mockContext = {
        logger: {
          info: () => {},
          warn: () => {},
          error: () => {},
        },
      };

      const response = await handler(mockReq, mockContext);

      expect(response).toHaveProperty('status');
      expect(response).toHaveProperty('body');
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });
  });
});
