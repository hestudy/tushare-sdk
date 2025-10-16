/**
 * 数据导出 API Step
 *
 * 提供 HTTP API 导出查询数据为 CSV 或 JSON 格式
 */

import type { DailyQuote } from '../types/index';

/**
 * Step 配置
 */
export const config = {
  name: 'ExportDataAPI',
  type: 'api',
  path: '/api/export',
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
 * 转换数据为 CSV 格式
 */
function convertToCSV(data: DailyQuote[]): string {
  if (data.length === 0) {
    return 'ts_code,trade_date,open,high,low,close,pre_close,change,pct_chg,vol,amount\n';
  }

  const headers =
    'ts_code,trade_date,open,high,low,close,pre_close,change,pct_chg,vol,amount\n';
  const rows = data
    .map((row) => {
      return [
        row.tsCode,
        row.tradeDate,
        row.open ?? '',
        row.high ?? '',
        row.low ?? '',
        row.close ?? '',
        row.preClose ?? '',
        row.change ?? '',
        row.pctChg ?? '',
        row.vol ?? '',
        row.amount ?? '',
      ].join(',');
    })
    .join('\n');

  return headers + rows;
}

/**
 * Handler 函数
 */
export const handler = async (req: any, { logger }: any) => {
  try {
    const {
      tsCode,
      startDate,
      endDate,
      limit = '1000',
      format = 'json',
    } = req.query || {};

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

    if (!['json', 'csv'].includes(format.toLowerCase())) {
      logger.warn('Invalid format', { format });
      return {
        status: 400,
        body: {
          success: false,
          error: 'Invalid format. Expected: json or csv',
        },
      };
    }

    const limitNum = parseInt(limit, 10);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 10000) {
      logger.warn('Invalid limit value', { limit });
      return {
        status: 400,
        body: {
          success: false,
          error: 'Invalid limit value. Expected: 1-10000',
        },
      };
    }

    // 动态导入数据库服务
    const { db } = await import('../lib/database');

    // 查询数据
    const results = db.queryQuotes({
      tsCode,
      startDate,
      endDate,
      limit: limitNum,
    }) as DailyQuote[];

    logger.info('Export completed', {
      tsCode,
      startDate,
      endDate,
      limit: limitNum,
      format,
      count: results.length,
    });

    // 根据格式返回数据
    if (format.toLowerCase() === 'csv') {
      const csvData = convertToCSV(results);
      const filename = `quotes_${tsCode || 'all'}_${new Date().toISOString().split('T')[0]}.csv`;

      return {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
        body: csvData,
      };
    } else {
      // JSON 格式
      const filename = `quotes_${tsCode || 'all'}_${new Date().toISOString().split('T')[0]}.json`;

      return {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
        body: {
          success: true,
          data: results,
          count: results.length,
          exportedAt: new Date().toISOString(),
        },
      };
    }
  } catch (error: any) {
    logger.error('Export failed', {
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
