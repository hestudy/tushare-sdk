/**
 * 任务日志查询 API 集成测试
 *
 * 测试目标: apps/motia-stock-collector/steps/query-task-logs-api.step.ts
 *
 * 测试场景:
 * 1. 测试各种筛选条件 (taskName, status, startTime, endTime)
 * 2. 测试分页功能
 * 3. 测试参数验证
 * 4. 测试空结果处理
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DatabaseService } from '../../lib/database.js';
import { handler, config } from '../../steps/query-task-logs-api.step.js';

describe('Query Task Logs API Step', () => {
  let testDb: DatabaseService;

  beforeEach(() => {
    // 使用内存数据库进行测试
    testDb = new DatabaseService(':memory:');

    // 插入测试数据
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    testDb.logTask({
      taskName: 'CollectDailyQuotes',
      startTime: now.toISOString(),
      endTime: now.toISOString(),
      status: 'SUCCESS',
      recordsCount: 4000,
      errorMessage: null,
    });

    testDb.logTask({
      taskName: 'CollectDailyQuotes',
      startTime: oneHourAgo.toISOString(),
      endTime: oneHourAgo.toISOString(),
      status: 'FAILED',
      recordsCount: 0,
      errorMessage: 'API rate limit exceeded',
    });

    testDb.logTask({
      taskName: 'CollectTradeCalendar',
      startTime: twoDaysAgo.toISOString(),
      endTime: twoDaysAgo.toISOString(),
      status: 'SUCCESS',
      recordsCount: 250,
      errorMessage: null,
    });
  });

  afterEach(() => {
    testDb.close();
  });

  it('should have correct configuration', () => {
    expect(config.name).toBe('QueryTaskLogsAPI');
    expect(config.type).toBe('api');
    expect(config.path).toBe('/api/task-logs');
    expect(config.method).toBe('GET');
  });

  it('should query all logs without filters', async () => {
    const req = {
      query: {},
    };

    const logger = {
      info: vi.fn(),
      error: vi.fn(),
    };

    const response = await handler(req, { logger, db: testDb });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBeGreaterThan(0);

    // 验证分页信息
    expect(response.body.pagination).toHaveProperty('page');
    expect(response.body.pagination).toHaveProperty('limit');
    expect(response.body.pagination).toHaveProperty('total');
    expect(response.body.pagination).toHaveProperty('totalPages');
  });

  it('should filter logs by task name', async () => {
    const req = {
      query: {
        taskName: 'CollectDailyQuotes',
      },
    };

    const logger = {
      info: vi.fn(),
      error: vi.fn(),
    };

    const response = await handler(req, { logger, db: testDb });

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThanOrEqual(2);

    // 验证所有结果都匹配任务名称
    response.body.data.forEach((log: any) => {
      expect(log.taskName).toBe('CollectDailyQuotes');
    });
  });

  it('should filter logs by status', async () => {
    const req = {
      query: {
        status: 'SUCCESS',
      },
    };

    const logger = {
      info: vi.fn(),
      error: vi.fn(),
    };

    const response = await handler(req, { logger, db: testDb });

    expect(response.status).toBe(200);

    // 验证所有结果都匹配状态
    response.body.data.forEach((log: any) => {
      expect(log.status).toBe('SUCCESS');
    });
  });

  it('should validate status parameter', async () => {
    const req = {
      query: {
        status: 'INVALID_STATUS',
      },
    };

    const logger = {
      info: vi.fn(),
      error: vi.fn(),
    };

    const response = await handler(req, { logger, db: testDb });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('Invalid status parameter');
  });

  it('should handle pagination correctly', async () => {
    const req = {
      query: {
        limit: '2',
        page: '1',
      },
    };

    const logger = {
      info: vi.fn(),
      error: vi.fn(),
    };

    const response = await handler(req, { logger, db: testDb });

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeLessThanOrEqual(2);
    expect(response.body.pagination.limit).toBe(2);
    expect(response.body.pagination.page).toBe(1);
  });

  it('should validate limit parameter', async () => {
    const req = {
      query: {
        limit: '2000', // 超过最大值 1000
      },
    };

    const logger = {
      info: vi.fn(),
      error: vi.fn(),
    };

    const response = await handler(req, { logger, db: testDb });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('Invalid limit parameter');
  });

  it('should validate page parameter', async () => {
    const req = {
      query: {
        page: '0', // 页码必须 >= 1
      },
    };

    const logger = {
      info: vi.fn(),
      error: vi.fn(),
    };

    const response = await handler(req, { logger, db: testDb });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('Invalid page parameter');
  });

  it('should handle empty results', async () => {
    const req = {
      query: {
        taskName: 'NonExistentTask',
      },
    };

    const logger = {
      info: vi.fn(),
      error: vi.fn(),
    };

    const response = await handler(req, { logger, db: testDb });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.length).toBe(0);
    expect(response.body.pagination.total).toBe(0);
  });

  it('should log info message with query details', async () => {
    const req = {
      query: {
        taskName: 'CollectDailyQuotes',
        status: 'SUCCESS',
      },
    };

    const logger = {
      info: vi.fn(),
      error: vi.fn(),
    };

    await handler(req, { logger, db: testDb });

    expect(logger.info).toHaveBeenCalledWith(
      'Task logs retrieved',
      expect.objectContaining({
        taskName: 'CollectDailyQuotes',
        status: 'SUCCESS',
        count: expect.any(Number),
        total: expect.any(Number),
        page: expect.any(Number),
      })
    );
  });

  it('should calculate total pages correctly', async () => {
    const req = {
      query: {
        limit: '2',
      },
    };

    const logger = {
      info: vi.fn(),
      error: vi.fn(),
    };

    const response = await handler(req, { logger, db: testDb });

    const { total, limit, totalPages } = response.body.pagination;
    expect(totalPages).toBe(Math.ceil(total / limit));
  });
});
