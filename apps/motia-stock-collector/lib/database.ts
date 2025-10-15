import Database from 'better-sqlite3';
import path from 'path';
import type {
  TradeCalendar,
  DailyQuote,
  TaskLog,
  QueryQuotesFilters,
  QueryTaskLogsFilters,
} from '../types/index.js';

/**
 * 数据库服务类
 * 负责所有数据库操作，包括 Schema 初始化、CRUD 操作
 */
export class DatabaseService {
  private db: Database.Database;

  constructor(dbPath?: string) {
    const DB_PATH = dbPath || process.env.DATABASE_PATH || './data/stock.db';
    this.db = new Database(DB_PATH);
    this.initSchema();
  }

  /**
   * 初始化数据库 Schema
   * 创建表和索引
   */
  private initSchema(): void {
    // 创建交易日历表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS trade_calendar (
        cal_date TEXT PRIMARY KEY,
        exchange TEXT NOT NULL CHECK(exchange IN ('SSE', 'SZSE')),
        is_open INTEGER NOT NULL CHECK(is_open IN (0, 1)),
        pretrade_date TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_calendar_date ON trade_calendar(cal_date);
      CREATE INDEX IF NOT EXISTS idx_calendar_is_open ON trade_calendar(is_open);
    `);

    // 创建日线行情表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS daily_quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ts_code TEXT NOT NULL,
        trade_date TEXT NOT NULL,
        open REAL CHECK(open IS NULL OR open > 0),
        high REAL CHECK(high IS NULL OR high > 0),
        low REAL CHECK(low IS NULL OR low > 0),
        close REAL CHECK(close IS NULL OR close > 0),
        pre_close REAL,
        change REAL,
        pct_chg REAL,
        vol REAL CHECK(vol IS NULL OR vol >= 0),
        amount REAL CHECK(amount IS NULL OR amount >= 0),
        created_at TEXT DEFAULT (datetime('now')),
        UNIQUE(ts_code, trade_date)
      );

      CREATE INDEX IF NOT EXISTS idx_quotes_ts_code ON daily_quotes(ts_code);
      CREATE INDEX IF NOT EXISTS idx_quotes_trade_date ON daily_quotes(trade_date);
      CREATE INDEX IF NOT EXISTS idx_quotes_composite ON daily_quotes(ts_code, trade_date);
    `);

    // 创建任务日志表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS task_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_name TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT,
        status TEXT NOT NULL CHECK(status IN ('SUCCESS', 'FAILED')),
        records_count INTEGER DEFAULT 0 CHECK(records_count >= 0),
        error_message TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_task_logs_name ON task_logs(task_name);
      CREATE INDEX IF NOT EXISTS idx_task_logs_status ON task_logs(status);
    `);
  }

  /**
   * 保存交易日历数据
   * @param calendars 交易日历数组
   * @returns 保存的记录数
   */
  saveTradeCalendar(calendars: Omit<TradeCalendar, 'createdAt'>[]): number {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO trade_calendar 
      (cal_date, exchange, is_open, pretrade_date)
      VALUES (?, ?, ?, ?)
    `);

    const transaction = this.db.transaction(
      (calendars: Omit<TradeCalendar, 'createdAt'>[]) => {
        for (const cal of calendars) {
          stmt.run(cal.calDate, cal.exchange, cal.isOpen, cal.pretradeDate);
        }
      }
    );

    transaction(calendars);
    return calendars.length;
  }

  /**
   * 查询指定日期是否为交易日
   * @param date 日期 YYYY-MM-DD
   * @returns 是否为交易日
   */
  isTradeDay(date: string): boolean {
    const stmt = this.db.prepare(`
      SELECT is_open FROM trade_calendar WHERE cal_date = ?
    `);
    const result = stmt.get(date) as { is_open: number } | undefined;
    return result?.is_open === 1;
  }

  /**
   * 获取日期范围内的所有交易日
   * @param startDate 开始日期 YYYY-MM-DD
   * @param endDate 结束日期 YYYY-MM-DD
   * @returns 交易日列表
   */
  getTradeDays(startDate: string, endDate: string): string[] {
    const stmt = this.db.prepare(`
      SELECT cal_date FROM trade_calendar 
      WHERE cal_date >= ? AND cal_date <= ? AND is_open = 1
      ORDER BY cal_date
    `);
    const results = stmt.all(startDate, endDate) as { cal_date: string }[];
    return results.map((r) => r.cal_date);
  }

  /**
   * 保存日线行情数据
   * @param quotes 行情数据数组
   * @returns 保存的记录数
   */
  saveQuotes(quotes: Omit<DailyQuote, 'id' | 'createdAt'>[]): number {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO daily_quotes 
      (ts_code, trade_date, open, high, low, close, pre_close, change, pct_chg, vol, amount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = this.db.transaction(
      (quotes: Omit<DailyQuote, 'id' | 'createdAt'>[]) => {
        for (const quote of quotes) {
          stmt.run(
            quote.tsCode,
            quote.tradeDate,
            quote.open,
            quote.high,
            quote.low,
            quote.close,
            quote.preClose,
            quote.change,
            quote.pctChg,
            quote.vol,
            quote.amount
          );
        }
      }
    );

    transaction(quotes);
    return quotes.length;
  }

  /**
   * 查询行情数据
   * @param filters 查询条件
   * @returns 行情数据数组
   */
  queryQuotes(filters: QueryQuotesFilters): DailyQuote[] {
    let sql = 'SELECT * FROM daily_quotes WHERE 1=1';
    const params: any[] = [];

    if (filters.tsCode) {
      sql += ' AND ts_code = ?';
      params.push(filters.tsCode);
    }
    if (filters.startDate) {
      sql += ' AND trade_date >= ?';
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      sql += ' AND trade_date <= ?';
      params.push(filters.endDate);
    }

    sql += ' ORDER BY trade_date DESC, ts_code ASC';

    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    }

    const results = this.db.prepare(sql).all(...params) as any[];

    // 转换字段名从 snake_case 到 camelCase
    return results.map((row) => ({
      id: row.id,
      tsCode: row.ts_code,
      tradeDate: row.trade_date,
      open: row.open,
      high: row.high,
      low: row.low,
      close: row.close,
      preClose: row.pre_close,
      change: row.change,
      pctChg: row.pct_chg,
      vol: row.vol,
      amount: row.amount,
      createdAt: row.created_at,
    }));
  }

  /**
   * 记录任务日志
   * @param log 任务日志
   * @returns 插入的日志 ID
   */
  logTask(log: Omit<TaskLog, 'id' | 'createdAt'>): number {
    const stmt = this.db.prepare(`
      INSERT INTO task_logs 
      (task_name, start_time, end_time, status, records_count, error_message)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      log.taskName,
      log.startTime,
      log.endTime,
      log.status,
      log.recordsCount,
      log.errorMessage
    );

    return result.lastInsertRowid as number;
  }

  /**
   * 查询任务日志 (支持多条件筛选和分页)
   * @param filters 查询条件
   * @returns 任务日志数组和总数
   */
  queryTaskLogs(
    filters: QueryTaskLogsFilters = {}
  ): { logs: TaskLog[]; total: number } {
    const {
      taskName,
      status,
      startTime,
      endTime,
      limit = 100,
      page = 1,
    } = filters;

    // 构建查询条件
    let sql = 'SELECT * FROM task_logs WHERE 1=1';
    const params: any[] = [];

    if (taskName) {
      sql += ' AND task_name = ?';
      params.push(taskName);
    }

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (startTime) {
      sql += ' AND created_at >= ?';
      params.push(startTime);
    }

    if (endTime) {
      sql += ' AND created_at <= ?';
      params.push(endTime);
    }

    // 计算总数
    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
    const countResult = this.db.prepare(countSql).get(...params) as {
      total: number;
    };
    const total = countResult.total;

    // 分页查询
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit);
    params.push((page - 1) * limit);

    const results = this.db.prepare(sql).all(...params) as any[];

    const logs = results.map((row) => ({
      id: row.id,
      taskName: row.task_name,
      startTime: row.start_time,
      endTime: row.end_time,
      status: row.status,
      recordsCount: row.records_count,
      errorMessage: row.error_message,
      createdAt: row.created_at,
    }));

    return { logs, total };
  }

  /**
   * 查询任务日志 (简化版本, 兼容旧API)
   * @param taskName 任务名称 (可选)
   * @param limit 返回记录数限制
   * @returns 任务日志数组
   */
  queryTaskLogsByName(taskName?: string, limit: number = 100): TaskLog[] {
    return this.queryTaskLogs({ taskName, limit }).logs;
  }

  /**
   * 清除所有数据 (仅用于测试)
   * 删除所有表中的数据
   */
  clearAllData(): void {
    this.db.exec(`
      DELETE FROM daily_quotes;
      DELETE FROM trade_calendar;
      DELETE FROM task_logs;
    `);
  }

  /**
   * 关闭数据库连接
   */
  close(): void {
    this.db.close();
  }
}

// 导出单例实例
export const db = new DatabaseService();
