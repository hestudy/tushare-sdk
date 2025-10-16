/**
 * 任务列表查询 API Step
 *
 * 功能: 返回所有 Cron Steps 配置和执行历史
 *
 * HTTP GET /api/tasks
 *
 * 响应格式:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "taskName": "ScheduleDailyCollection",
 *       "type": "cron",
 *       "schedule": "0 17 * * 1-5",
 *       "nextExecution": "2025-10-16T17:00:00Z",
 *       "recentExecutions": [...]
 *     }
 *   ]
 * }
 */

export const config = {
  name: 'ListTasksAPI',
  type: 'api',
  path: '/api/tasks',
  method: 'GET',
  flows: ['basic-tutorial'],
  emits: [],
};

interface TaskInfo {
  taskName: string;
  type: string;
  schedule?: string;
  nextExecution?: string;
  recentExecutions: any[];
}

export const handler = async (req: any, { logger }: any) => {
  try {
    const { db } = await import('../lib/database');

    // 目前硬编码已知的任务配置
    // TODO: 如果 Motia 提供 Step 元数据 API,可以动态获取
    const tasks: TaskInfo[] = [
      {
        taskName: 'ScheduleDailyCollection',
        type: 'cron',
        schedule: '0 17 * * 1-5', // 周一到周五 17:00
        nextExecution: calculateNextExecution('0 17 * * 1-5'),
        recentExecutions: [],
      },
    ];

    // 获取每个任务的最近执行历史
    for (const task of tasks) {
      const { logs } = db.queryTaskLogs({ taskName: task.taskName, limit: 10 });
      task.recentExecutions = logs;
    }

    logger.info('Tasks list retrieved', { count: tasks.length });

    return {
      status: 200,
      body: {
        success: true,
        data: tasks,
        count: tasks.length,
      },
    };
  } catch (error: any) {
    logger.error('Failed to retrieve tasks list', { error: error.message });
    return {
      status: 500,
      body: {
        success: false,
        error: error.message,
      },
    };
  }
};

/**
 * 计算 Cron 表达式的下次执行时间
 * @param schedule Cron 表达式
 * @returns 下次执行时间 ISO 8601 格式
 */
function calculateNextExecution(schedule: string): string {
  // 简化实现: 如果是 "0 17 * * 1-5" (周一到周五 17:00)
  const now = new Date();
  const next = new Date(now);

  // 设置为今天 17:00
  next.setHours(17, 0, 0, 0);

  // 如果当前时间已过 17:00,则移到明天
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  // 跳过周末 (周六 = 6, 周日 = 0)
  while (next.getDay() === 0 || next.getDay() === 6) {
    next.setDate(next.getDate() + 1);
  }

  return next.toISOString();
}
