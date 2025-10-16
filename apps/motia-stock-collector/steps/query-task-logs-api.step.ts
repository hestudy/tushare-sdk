/**
 * 任务日志查询 API Step
 *
 * 功能: 查询任务执行历史日志,支持多条件筛选和分页
 *
 * HTTP GET /api/task-logs
 *
 * 查询参数:
 * - taskName: 任务名称 (可选)
 * - status: 任务状态 SUCCESS/FAILED (可选)
 * - startTime: 开始时间 ISO 8601 (可选)
 * - endTime: 结束时间 ISO 8601 (可选)
 * - limit: 每页记录数 (默认 100)
 * - page: 页码 (默认 1)
 *
 * 响应格式:
 * {
 *   "success": true,
 *   "data": [...],
 *   "pagination": {
 *     "page": 1,
 *     "limit": 100,
 *     "total": 250,
 *     "totalPages": 3
 *   }
 * }
 */

export const config = {
  name: 'QueryTaskLogsAPI',
  type: 'api',
  path: '/api/task-logs',
  method: 'GET',
  flows: ['basic-tutorial'],
  emits: [],
};

export const handler = async (req: any, { logger }: any) => {
  try {
    const { db } = await import('../lib/database');

    // 解析查询参数
    const {
      taskName,
      status,
      startTime,
      endTime,
      limit = '100',
      page = '1',
    } = req.query;

    // 验证状态参数
    if (status && status !== 'SUCCESS' && status !== 'FAILED') {
      return {
        status: 400,
        body: {
          success: false,
          error: 'Invalid status parameter. Must be SUCCESS or FAILED.',
        },
      };
    }

    // 验证分页参数
    const limitNum = parseInt(limit, 10);
    const pageNum = parseInt(page, 10);

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
      return {
        status: 400,
        body: {
          success: false,
          error: 'Invalid limit parameter. Must be between 1 and 1000.',
        },
      };
    }

    if (isNaN(pageNum) || pageNum < 1) {
      return {
        status: 400,
        body: {
          success: false,
          error: 'Invalid page parameter. Must be >= 1.',
        },
      };
    }

    // 查询任务日志
    const { logs, total } = db.queryTaskLogs({
      taskName,
      status,
      startTime,
      endTime,
      limit: limitNum,
      page: pageNum,
    });

    const totalPages = Math.ceil(total / limitNum);

    logger.info('Task logs retrieved', {
      taskName,
      status,
      count: logs.length,
      total,
      page: pageNum,
    });

    return {
      status: 200,
      body: {
        success: true,
        data: logs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
        },
      },
    };
  } catch (error: any) {
    logger.error('Failed to retrieve task logs', { error: error.message });
    return {
      status: 500,
      body: {
        success: false,
        error: error.message,
      },
    };
  }
};
