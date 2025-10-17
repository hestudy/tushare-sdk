/**
 * 查询行情数据 API Step
 *
 * 提供 HTTP API 查询历史行情数据
 *
 * Contract: /specs/017-/contracts/query-quotes-api.step.json
 */

import type { DailyQuote } from '../types/index';

/**
 * Step 配置
 */
export const config = {
  name: 'QueryQuotesAPI',
  type: 'api',
  path: '/api/quotes',
  method: 'GET',
  flows: ['basic-tutorial'],
  emits: [],
};

/**
 * 验证股票代码格式
 */
function validateStockCode(tsCode: string): boolean {
  return /^\d{6}\.(SH|SZ)$/.test(tsCode);
}

/**
 * 验证日期格式
 */
function validateDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

/**
 * Handler 函数
 */
export const handler = async (req: any, { logger }: any) => {
  try {
    const { tsCode, startDate, endDate, limit = '100' } = req.query || {};

    // 参数验证
    if (tsCode && !validateStockCode(tsCode)) {
      logger.warn('Invalid stock code format', { tsCode });
      return {
        status: 400,
        body: {
          success: false,
          error: 'Invalid stock code format. Expected: XXXXXX.SH or XXXXXX.SZ',
        },
      };
    }

    if (startDate && !validateDate(startDate)) {
      logger.warn('Invalid start date format', { startDate });
      return {
        status: 400,
        body: {
          success: false,
          error: 'Invalid start date format. Expected: YYYY-MM-DD',
        },
      };
    }

    if (endDate && !validateDate(endDate)) {
      logger.warn('Invalid end date format', { endDate });
      return {
        status: 400,
        body: {
          success: false,
          error: 'Invalid end date format. Expected: YYYY-MM-DD',
        },
      };
    }

    const limitNum = parseInt(limit, 10);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
      logger.warn('Invalid limit value', { limit });
      return {
        status: 400,
        body: {
          success: false,
          error: 'Invalid limit value. Expected: 1-1000',
        },
      };
    }

    // 动态导入数据库服务 (避免循环依赖)
    const { db } = await import('../lib/database');

    // 查询数据
    const results = db.queryQuotes({
      tsCode,
      startDate,
      endDate,
      limit: limitNum,
    }) as DailyQuote[];

    logger.info('Query completed', {
      tsCode,
      startDate,
      endDate,
      limit: limitNum,
      count: results.length,
    });

    return {
      status: 200,
      body: {
        success: true,
        data: results,
        count: results.length,
      },
    };
  } catch (error: any) {
    logger.error('Query failed', {
      error: error.message,
      stack: error.stack,
    });

    return {
      status: 500,
      body: {
        success: false,
        error: `Internal server error: ${error.message}`,
      },
    };
  }
};
