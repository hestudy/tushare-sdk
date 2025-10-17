import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DatabaseService } from '../../lib/database';
import type { DailyQuote, TradeCalendar, TaskLog } from '../../types/index.js';

describe('DatabaseService', () => {
  let db: DatabaseService;

  beforeEach(() => {
    // 使用内存数据库进行测试
    db = new DatabaseService(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  describe('Schema 初始化', () => {
    it('应该成功创建所有表', () => {
      // Schema 在构造函数中自动初始化
      // 如果没有抛出错误，说明初始化成功
      expect(db).toBeDefined();
    });
  });

  describe('交易日历操作', () => {
    it('应该保存交易日历数据', () => {
      const calendars: Omit<TradeCalendar, 'createdAt'>[] = [
        {
          calDate: '2024-01-02',
          exchange: 'SSE',
          isOpen: 1,
          pretradeDate: '2023-12-29',
        },
        {
          calDate: '2024-01-03',
          exchange: 'SSE',
          isOpen: 1,
          pretradeDate: '2024-01-02',
        },
      ];

      const count = db.saveTradeCalendar(calendars);
      expect(count).toBe(2);
    });

    it('应该正确判断交易日', () => {
      const calendars: Omit<TradeCalendar, 'createdAt'>[] = [
        {
          calDate: '2024-01-02',
          exchange: 'SSE',
          isOpen: 1,
          pretradeDate: null,
        },
        {
          calDate: '2024-01-06',
          exchange: 'SSE',
          isOpen: 0,
          pretradeDate: '2024-01-05',
        },
      ];

      db.saveTradeCalendar(calendars);

      expect(db.isTradeDay('2024-01-02')).toBe(true);
      expect(db.isTradeDay('2024-01-06')).toBe(false);
      expect(db.isTradeDay('2024-01-99')).toBe(false); // 不存在的日期
    });

    it('应该获取日期范围内的所有交易日', () => {
      const calendars: Omit<TradeCalendar, 'createdAt'>[] = [
        {
          calDate: '2024-01-02',
          exchange: 'SSE',
          isOpen: 1,
          pretradeDate: null,
        },
        {
          calDate: '2024-01-03',
          exchange: 'SSE',
          isOpen: 1,
          pretradeDate: '2024-01-02',
        },
        {
          calDate: '2024-01-04',
          exchange: 'SSE',
          isOpen: 1,
          pretradeDate: '2024-01-03',
        },
        {
          calDate: '2024-01-05',
          exchange: 'SSE',
          isOpen: 1,
          pretradeDate: '2024-01-04',
        },
        {
          calDate: '2024-01-06',
          exchange: 'SSE',
          isOpen: 0,
          pretradeDate: '2024-01-05',
        },
        {
          calDate: '2024-01-07',
          exchange: 'SSE',
          isOpen: 0,
          pretradeDate: '2024-01-05',
        },
      ];

      db.saveTradeCalendar(calendars);

      const tradeDays = db.getTradeDays('2024-01-02', '2024-01-07');
      expect(tradeDays).toEqual([
        '2024-01-02',
        '2024-01-03',
        '2024-01-04',
        '2024-01-05',
      ]);
    });
  });

  describe('行情数据操作', () => {
    it('应该保存行情数据', () => {
      const quotes: Omit<DailyQuote, 'id' | 'createdAt'>[] = [
        {
          tsCode: '600519.SH',
          tradeDate: '2024-01-02',
          open: 1650.0,
          high: 1680.0,
          low: 1645.0,
          close: 1670.0,
          preClose: 1655.0,
          change: 15.0,
          pctChg: 0.91,
          vol: 150000,
          amount: 250000,
        },
      ];

      const count = db.saveQuotes(quotes);
      expect(count).toBe(1);
    });

    it('应该实现数据去重（INSERT OR REPLACE）', () => {
      const quote: Omit<DailyQuote, 'id' | 'createdAt'> = {
        tsCode: '600519.SH',
        tradeDate: '2024-01-02',
        open: 1650.0,
        high: 1680.0,
        low: 1645.0,
        close: 1670.0,
        preClose: 1655.0,
        change: 15.0,
        pctChg: 0.91,
        vol: 150000,
        amount: 250000,
      };

      // 第一次插入
      db.saveQuotes([quote]);

      // 第二次插入相同数据（更新收盘价）
      const updatedQuote = { ...quote, close: 1680.0 };
      db.saveQuotes([updatedQuote]);

      // 查询应该只返回一条记录
      const results = db.queryQuotes({
        tsCode: '600519.SH',
        startDate: '2024-01-02',
        endDate: '2024-01-02',
      });

      expect(results).toHaveLength(1);
      expect(results[0].close).toBe(1680.0); // 验证数据已更新
    });

    it('应该按股票代码查询行情', () => {
      const quotes: Omit<DailyQuote, 'id' | 'createdAt'>[] = [
        {
          tsCode: '600519.SH',
          tradeDate: '2024-01-02',
          open: 1650.0,
          high: 1680.0,
          low: 1645.0,
          close: 1670.0,
          preClose: null,
          change: null,
          pctChg: null,
          vol: 150000,
          amount: 250000,
        },
        {
          tsCode: '000001.SZ',
          tradeDate: '2024-01-02',
          open: 10.0,
          high: 10.5,
          low: 9.8,
          close: 10.2,
          preClose: null,
          change: null,
          pctChg: null,
          vol: 200000,
          amount: 2000,
        },
      ];

      db.saveQuotes(quotes);

      const results = db.queryQuotes({ tsCode: '600519.SH' });
      expect(results).toHaveLength(1);
      expect(results[0].tsCode).toBe('600519.SH');
    });

    it('应该按日期范围查询行情', () => {
      const quotes: Omit<DailyQuote, 'id' | 'createdAt'>[] = [
        {
          tsCode: '600519.SH',
          tradeDate: '2024-01-02',
          open: 1650.0,
          high: 1680.0,
          low: 1645.0,
          close: 1670.0,
          preClose: null,
          change: null,
          pctChg: null,
          vol: 150000,
          amount: 250000,
        },
        {
          tsCode: '600519.SH',
          tradeDate: '2024-01-03',
          open: 1670.0,
          high: 1690.0,
          low: 1665.0,
          close: 1685.0,
          preClose: null,
          change: null,
          pctChg: null,
          vol: 160000,
          amount: 270000,
        },
        {
          tsCode: '600519.SH',
          tradeDate: '2024-01-05',
          open: 1685.0,
          high: 1700.0,
          low: 1680.0,
          close: 1695.0,
          preClose: null,
          change: null,
          pctChg: null,
          vol: 170000,
          amount: 290000,
        },
      ];

      db.saveQuotes(quotes);

      const results = db.queryQuotes({
        tsCode: '600519.SH',
        startDate: '2024-01-02',
        endDate: '2024-01-03',
      });

      expect(results).toHaveLength(2);
    });

    it('应该支持 limit 限制返回数量', () => {
      const quotes: Omit<DailyQuote, 'id' | 'createdAt'>[] = Array.from(
        { length: 10 },
        (_, i) => ({
          tsCode: '600519.SH',
          tradeDate: `2024-01-${String(i + 1).padStart(2, '0')}`,
          open: 1650.0 + i,
          high: 1680.0 + i,
          low: 1645.0 + i,
          close: 1670.0 + i,
          preClose: null,
          change: null,
          pctChg: null,
          vol: 150000,
          amount: 250000,
        })
      );

      db.saveQuotes(quotes);

      const results = db.queryQuotes({ tsCode: '600519.SH', limit: 5 });
      expect(results).toHaveLength(5);
    });
  });

  describe('任务日志操作', () => {
    it('应该记录任务日志', () => {
      const log: Omit<TaskLog, 'id' | 'createdAt'> = {
        taskName: 'CollectDailyQuotes',
        startTime: '2024-01-02T09:00:00Z',
        endTime: '2024-01-02T09:30:00Z',
        status: 'SUCCESS',
        recordsCount: 4000,
        errorMessage: null,
      };

      const logId = db.logTask(log);
      expect(logId).toBeGreaterThan(0);
    });

    it('应该查询任务日志', () => {
      const logs: Omit<TaskLog, 'id' | 'createdAt'>[] = [
        {
          taskName: 'CollectDailyQuotes',
          startTime: '2024-01-02T09:00:00Z',
          endTime: '2024-01-02T09:30:00Z',
          status: 'SUCCESS',
          recordsCount: 4000,
          errorMessage: null,
        },
        {
          taskName: 'CollectDailyQuotes',
          startTime: '2024-01-03T09:00:00Z',
          endTime: '2024-01-03T09:30:00Z',
          status: 'FAILED',
          recordsCount: 0,
          errorMessage: 'API timeout',
        },
      ];

      logs.forEach((log) => db.logTask(log));

      const results = db.queryTaskLogsByName('CollectDailyQuotes');
      expect(results).toHaveLength(2);
    });

    it('应该按任务名称筛选日志', () => {
      const logs: Omit<TaskLog, 'id' | 'createdAt'>[] = [
        {
          taskName: 'CollectDailyQuotes',
          startTime: '2024-01-02T09:00:00Z',
          endTime: '2024-01-02T09:30:00Z',
          status: 'SUCCESS',
          recordsCount: 4000,
          errorMessage: null,
        },
        {
          taskName: 'CollectTradeCalendar',
          startTime: '2024-01-02T08:00:00Z',
          endTime: '2024-01-02T08:10:00Z',
          status: 'SUCCESS',
          recordsCount: 365,
          errorMessage: null,
        },
      ];

      logs.forEach((log) => db.logTask(log));

      const results = db.queryTaskLogsByName('CollectDailyQuotes');
      expect(results).toHaveLength(1);
      expect(results[0].taskName).toBe('CollectDailyQuotes');
    });
  });
});
