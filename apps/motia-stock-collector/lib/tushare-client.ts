import { TushareClient } from '@hestudy/tushare-sdk';
import pLimit from 'p-limit';
import type { DailyQuote, TradeCalendar } from '../types/index.js';

/**
 * Tushare 服务封装
 * 负责与 Tushare API 交互，包含限流控制和错误处理
 */
export class TushareService {
  private client: TushareClient;
  private limiter: ReturnType<typeof pLimit>;

  constructor(token?: string, concurrency?: number) {
    const apiToken = token || process.env.TUSHARE_TOKEN;
    if (!apiToken) {
      throw new Error('TUSHARE_TOKEN is required');
    }

    this.client = new TushareClient({
      token: apiToken,
      retry: {
        maxRetries: 3,
        initialDelay: 1000,
      },
      concurrency: {
        maxConcurrent:
          concurrency || parseInt(process.env.RATE_LIMIT_CONCURRENT || '5'),
        minInterval: 200,
      },
    });

    // SDK 已经内置并发控制，这里的 limiter 用于额外控制
    const concurrent =
      concurrency || parseInt(process.env.RATE_LIMIT_CONCURRENT || '5');
    this.limiter = pLimit(concurrent);
  }

  /**
   * 获取日线行情数据
   * @param tradeDate 交易日期 YYYYMMDD
   * @returns 行情数据数组
   */
  async getDailyQuotes(
    tradeDate: string
  ): Promise<Omit<DailyQuote, 'id' | 'createdAt'>[]> {
    return this.limiter(async () => {
      const response = await this.client.query<any>('daily', {
        trade_date: tradeDate,
      });

      // SDK 返回的是数组
      return response.map((row: any) => ({
        tsCode: row.ts_code,
        tradeDate: this.formatDate(row.trade_date),
        open: row.open,
        high: row.high,
        low: row.low,
        close: row.close,
        preClose: row.pre_close,
        change: row.change,
        pctChg: row.pct_chg,
        vol: row.vol,
        amount: row.amount,
      }));
    });
  }

  /**
   * 获取交易日历
   * @param startDate 开始日期 YYYYMMDD
   * @param endDate 结束日期 YYYYMMDD
   * @param exchange 交易所 SSE/SZSE，默认 SSE
   * @returns 交易日历数组
   */
  async getTradeCalendar(
    startDate: string,
    endDate: string,
    exchange: 'SSE' | 'SZSE' = 'SSE'
  ): Promise<Omit<TradeCalendar, 'createdAt'>[]> {
    return this.limiter(async () => {
      const response = await this.client.query<any>('trade_cal', {
        start_date: startDate,
        end_date: endDate,
        exchange,
      });

      return response.map((row: any) => ({
        calDate: this.formatDate(row.cal_date),
        exchange: row.exchange,
        isOpen: row.is_open,
        pretradeDate: row.pretrade_date
          ? this.formatDate(row.pretrade_date)
          : null,
      }));
    });
  }

  /**
   * 格式化日期从 YYYYMMDD 到 YYYY-MM-DD
   * @param date YYYYMMDD 格式的日期
   * @returns YYYY-MM-DD 格式的日期
   */
  private formatDate(date: string): string {
    if (!date || date.length !== 8) {
      return date;
    }
    return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
  }
}

// 导出单例实例 (仅在环境变量存在时)
export const tushareService = process.env.TUSHARE_TOKEN
  ? new TushareService()
  : null;
