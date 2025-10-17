/**
 * 任务管理集成测试
 *
 * 测试场景:
 * 1. 查询任务列表 → 验证配置
 * 2. 修改调度时间 → 验证更新成功
 * 3. 查询执行历史 → 验证记录完整
 * 4. 连续失败3次 → 验证告警日志
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DatabaseService } from '../../lib/database.js';
import { taskConfigManager } from '../../lib/task-config.js';
import { handler as listTasksHandler } from '../../steps/list-tasks-api.step.js';
import { handler as queryLogsHandler } from '../../steps/query-task-logs-api.step.js';

describe('Task Management Flow', () => {
  let testDb: DatabaseService;

  beforeEach(async () => {
    // 使用内存数据库进行测试
    testDb = new DatabaseService(':memory:');

    // Mock 全局 db 实例,使其指向测试数据库
    const dbModule = await import('../../lib/database.js');
    vi.spyOn(dbModule, 'db', 'get').mockReturnValue(testDb);
  });

  afterEach(() => {
    testDb.close();
    vi.restoreAllMocks();
  });

  describe('Scenario 1: Query task list and verify configuration', () => {
    it('should return all tasks with correct configuration', async () => {
      const req = { query: {} };
      const logger = {
        info: vi.fn(),
        error: vi.fn(),
      };

      const response = await listTasksHandler(req, { logger });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);

      // 验证至少有一个任务
      expect(response.body.data.length).toBeGreaterThan(0);

      // 验证任务配置完整性
      const task = response.body.data[0];
      expect(task.taskName).toBe('ScheduleDailyCollection');
      expect(task.type).toBe('cron');
      expect(task.schedule).toBe('0 17 * * 1-5');
      expect(task.nextExecution).toBeDefined();
      expect(task.recentExecutions).toBeInstanceOf(Array);
    });

    it('should calculate next execution time correctly', async () => {
      const req = { query: {} };
      const logger = {
        info: vi.fn(),
        error: vi.fn(),
      };

      const response = await listTasksHandler(req, { logger });
      const task = response.body.data[0];

      // 验证下次执行时间在未来
      const nextExecution = new Date(task.nextExecution);
      expect(nextExecution.getTime()).toBeGreaterThan(Date.now());

      // 验证是工作日
      const dayOfWeek = nextExecution.getDay();
      expect([1, 2, 3, 4, 5]).toContain(dayOfWeek);
    });
  });

  describe('Scenario 2: Update task schedule', () => {
    it('should update task schedule successfully', async () => {
      const taskName = 'ScheduleDailyCollection';
      const newSchedule = '0 18 * * 1-5'; // 改为18:00

      const result = await taskConfigManager.updateTaskSchedule(
        taskName,
        newSchedule
      );

      expect(result).toBe(true);

      // 验证配置变更被记录到数据库
      const { logs } = testDb.queryTaskLogs({
        taskName: `ConfigChange_${taskName}`,
        limit: 1,
      });

      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].errorMessage).toContain(newSchedule);
    });

    it('should reject invalid cron expression', async () => {
      const taskName = 'ScheduleDailyCollection';
      const invalidSchedule = 'invalid cron';

      const result = await taskConfigManager.updateTaskSchedule(
        taskName,
        invalidSchedule
      );

      expect(result).toBe(false);
    });
  });

  describe('Scenario 3: Query execution history', () => {
    beforeEach(() => {
      // 插入测试执行历史,手动指定 createdAt 以便测试日期范围过滤
      testDb.logTask(
        {
          taskName: 'CollectDailyQuotes',
          startTime: new Date('2024-01-10T17:00:00Z').toISOString(),
          endTime: new Date('2024-01-10T17:30:00Z').toISOString(),
          status: 'SUCCESS',
          recordsCount: 4000,
          errorMessage: null,
        },
        new Date('2024-01-10T17:00:00Z').toISOString()
      );

      testDb.logTask(
        {
          taskName: 'CollectDailyQuotes',
          startTime: new Date('2024-01-11T17:00:00Z').toISOString(),
          endTime: new Date('2024-01-11T17:25:00Z').toISOString(),
          status: 'SUCCESS',
          recordsCount: 3950,
          errorMessage: null,
        },
        new Date('2024-01-11T17:00:00Z').toISOString()
      );

      testDb.logTask(
        {
          taskName: 'CollectDailyQuotes',
          startTime: new Date('2024-01-12T17:00:00Z').toISOString(),
          endTime: new Date('2024-01-12T17:05:00Z').toISOString(),
          status: 'FAILED',
          recordsCount: 0,
          errorMessage: 'API rate limit exceeded',
        },
        new Date('2024-01-12T17:00:00Z').toISOString()
      );
    });

    it('should query execution history with complete records', async () => {
      const req = {
        query: {
          taskName: 'CollectDailyQuotes',
        },
      };

      const logger = {
        info: vi.fn(),
        error: vi.fn(),
      };

      const response = await queryLogsHandler(req, { logger });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(3);

      // 验证记录按时间倒序排列
      const logs = response.body.data;
      expect(new Date(logs[0].createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(logs[1].createdAt).getTime()
      );
    });

    it('should filter execution history by status', async () => {
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

      const response = await queryLogsHandler(req, { logger });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data.every((log: any) => log.status === 'SUCCESS')).toBe(
        true
      );
    });

    it('should filter execution history by date range', async () => {
      const req = {
        query: {
          taskName: 'CollectDailyQuotes',
          startTime: '2024-01-11T00:00:00Z',
          endTime: '2024-01-12T23:59:59Z',
        },
      };

      const logger = {
        info: vi.fn(),
        error: vi.fn(),
      };

      const response = await queryLogsHandler(req, { logger });

      expect(response.status).toBe(200);
      // 应该只有 1月11日 和 1月12日 的记录
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Scenario 4: Continuous failures and alert', () => {
    beforeEach(() => {
      // 插入连续3次失败记录
      const now = new Date();

      for (let i = 0; i < 3; i++) {
        const failTime = new Date(now.getTime() - i * 60 * 60 * 1000); // 每次间隔1小时
        testDb.logTask({
          taskName: 'CollectDailyQuotes',
          startTime: failTime.toISOString(),
          endTime: failTime.toISOString(),
          status: 'FAILED',
          recordsCount: 0,
          errorMessage: `API error attempt ${i + 1}`,
        });
      }
    });

    it('should detect continuous failures', async () => {
      const req = {
        query: {
          taskName: 'CollectDailyQuotes',
          status: 'FAILED',
          limit: '10',
        },
      };

      const logger = {
        info: vi.fn(),
        error: vi.fn(),
      };

      const response = await queryLogsHandler(req, { logger });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(3);

      // 验证所有记录都是 FAILED 状态
      expect(response.body.data.every((log: any) => log.status === 'FAILED')).toBe(
        true
      );

      // 验证错误信息被正确记录
      expect(response.body.data[0].errorMessage).toContain('API error');
    });

    it('should generate alert log for continuous failures', () => {
      // 检查是否有告警日志记录
      // 这里应该实现一个告警机制,当连续失败3次时自动记录告警
      // 目前作为占位测试

      const { logs } = testDb.queryTaskLogs({
        status: 'FAILED',
        limit: 3,
      });

      expect(logs.length).toBe(3);
      // TODO: 实现告警机制后,验证告警日志
    });
  });

  describe('Integration: Complete task management workflow', () => {
    it('should support full workflow: list → query → update', async () => {
      const logger = {
        info: vi.fn(),
        error: vi.fn(),
      };

      // 1. 查询任务列表
      const listResponse = await listTasksHandler({ query: {} }, { logger });
      expect(listResponse.status).toBe(200);
      const task = listResponse.body.data[0];

      // 2. 更新任务配置
      const updateResult = await taskConfigManager.updateTaskSchedule(
        task.taskName,
        '0 18 * * 1-5'
      );
      expect(updateResult).toBe(true);

      // 3. 查询配置变更日志
      const logsResponse = await queryLogsHandler(
        {
          query: {
            taskName: `ConfigChange_${task.taskName}`,
          },
        },
        { logger }
      );
      expect(logsResponse.status).toBe(200);
      expect(logsResponse.body.data.length).toBeGreaterThan(0);
    });
  });
});
