# Data Model: 股市数据定时采集与存储应用

**Feature Branch**: `017-`
**Created**: 2025-10-15

## Entity Relationship Diagram

```
┌─────────────────────┐
│  TradeCalendar      │
├─────────────────────┤
│ calDate (PK)        │
│ exchange            │
│ isOpen              │
│ pretradeDate        │
│ createdAt           │
└─────────────────────┘
          │
          │ 1:N (一个交易日对应多只股票行情)
          ▼
┌─────────────────────┐       ┌─────────────────────┐
│  DailyQuote         │       │  TaskLog            │
├─────────────────────┤       ├─────────────────────┤
│ id (PK)             │       │ id (PK)             │
│ tsCode              │       │ taskName            │
│ tradeDate (FK)      │───┐   │ startTime           │
│ open                │   │   │ endTime             │
│ high                │   │   │ status              │
│ low                 │   │   │ recordsCount        │
│ close               │   │   │ errorMessage        │
│ preClose            │   │   │ createdAt           │
│ change              │   │   └─────────────────────┘
│ pctChg              │   │
│ vol                 │   │
│ amount              │   │
│ createdAt           │   │
│ UNIQUE(tsCode,      │◄──┘
│        tradeDate)   │
└─────────────────────┘
```

## Entity Definitions

### 1. TradeCalendar (交易日历)

**用途**: 记录每个日期是否为交易日,用于任务调度和数据有效性判断

**字段**:

| 字段名       | 类型    | 约束                      | 说明                                |
| ------------ | ------- | ------------------------- | ----------------------------------- |
| calDate      | TEXT    | PRIMARY KEY               | 日期,格式 YYYY-MM-DD                |
| exchange     | TEXT    | NOT NULL                  | 交易所代码,SSE(上交所)/SZSE(深交所) |
| isOpen       | INTEGER | NOT NULL                  | 是否开盘,1(开盘)/0(休市)            |
| pretradeDate | TEXT    | NULLABLE                  | 上一交易日,格式 YYYY-MM-DD          |
| createdAt    | TEXT    | DEFAULT CURRENT_TIMESTAMP | 记录创建时间                        |

**验证规则**:

- calDate 必须符合 `YYYY-MM-DD` 格式
- isOpen 只能为 0 或 1
- exchange 只能为 'SSE' 或 'SZSE'

**状态转换**:

- 初始状态: 数据库为空
- 首次启动: 批量插入最近 3 年交易日历
- 定期更新: 检测到缺少下一年度数据时自动补充

**TypeScript 类型定义**:

```typescript
export interface TradeCalendar {
  calDate: string; // YYYY-MM-DD
  exchange: 'SSE' | 'SZSE';
  isOpen: 0 | 1;
  pretradeDate: string | null;
  createdAt: string; // ISO 8601
}
```

### 2. DailyQuote (日线行情)

**用途**: 存储股票每日交易数据,是数据分析的核心实体

**字段**:

| 字段名    | 类型    | 约束                      | 说明                     |
| --------- | ------- | ------------------------- | ------------------------ |
| id        | INTEGER | PRIMARY KEY AUTOINCREMENT | 自增主键                 |
| tsCode    | TEXT    | NOT NULL                  | 股票代码,如 '600519.SH'  |
| tradeDate | TEXT    | NOT NULL                  | 交易日期,格式 YYYY-MM-DD |
| open      | REAL    | NULLABLE                  | 开盘价                   |
| high      | REAL    | NULLABLE                  | 最高价                   |
| low       | REAL    | NULLABLE                  | 最低价                   |
| close     | REAL    | NULLABLE                  | 收盘价                   |
| preClose  | REAL    | NULLABLE                  | 昨收价                   |
| change    | REAL    | NULLABLE                  | 涨跌额                   |
| pctChg    | REAL    | NULLABLE                  | 涨跌幅(百分比)           |
| vol       | REAL    | NULLABLE                  | 成交量(手)               |
| amount    | REAL    | NULLABLE                  | 成交额(千元)             |
| createdAt | TEXT    | DEFAULT CURRENT_TIMESTAMP | 记录创建时间             |
| UNIQUE    | -       | (tsCode, tradeDate)       | 联合唯一约束,防止重复    |

**验证规则**:

- tsCode 必须符合 `XXXXXX.(SH|SZ)` 格式(6位数字 + 市场后缀)
- tradeDate 必须符合 `YYYY-MM-DD` 格式
- 价格字段(open/high/low/close) 必须 > 0
- vol 和 amount 必须 >= 0

**索引**:

- `idx_quotes_ts_code` ON (tsCode): 优化按股票代码查询
- `idx_quotes_trade_date` ON (tradeDate): 优化按日期范围查询

**去重策略**:

- 使用 `UNIQUE(tsCode, tradeDate)` 约束
- 插入数据时使用 `INSERT OR REPLACE`,实现自动更新

**TypeScript 类型定义**:

```typescript
export interface DailyQuote {
  id: number;
  tsCode: string; // 600519.SH
  tradeDate: string; // YYYY-MM-DD
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  preClose: number | null;
  change: number | null;
  pctChg: number | null;
  vol: number | null;
  amount: number | null;
  createdAt: string; // ISO 8601
}
```

### 3. TaskLog (任务执行日志)

**用途**: 记录每次数据采集任务的执行情况,用于监控和故障排查

**字段**:

| 字段名       | 类型    | 约束                      | 说明                             |
| ------------ | ------- | ------------------------- | -------------------------------- |
| id           | INTEGER | PRIMARY KEY AUTOINCREMENT | 自增主键                         |
| taskName     | TEXT    | NOT NULL                  | 任务名称,如 'CollectDailyQuotes' |
| startTime    | TEXT    | NOT NULL                  | 任务开始时间,ISO 8601 格式       |
| endTime      | TEXT    | NULLABLE                  | 任务结束时间,ISO 8601 格式       |
| status       | TEXT    | NOT NULL                  | 任务状态,'SUCCESS'/'FAILED'      |
| recordsCount | INTEGER | DEFAULT 0                 | 处理的记录数                     |
| errorMessage | TEXT    | NULLABLE                  | 错误信息(失败时记录)             |
| createdAt    | TEXT    | DEFAULT CURRENT_TIMESTAMP | 记录创建时间                     |

**验证规则**:

- status 只能为 'SUCCESS' 或 'FAILED'
- endTime 必须晚于 startTime(如果不为空)
- recordsCount 必须 >= 0

**状态转换**:

1. 任务开始: 插入记录,status = 'PENDING' (可选状态)
2. 任务成功: 更新 endTime, status = 'SUCCESS', recordsCount
3. 任务失败: 更新 endTime, status = 'FAILED', errorMessage

**TypeScript 类型定义**:

```typescript
export interface TaskLog {
  id: number;
  taskName: string;
  startTime: string; // ISO 8601
  endTime: string | null;
  status: 'SUCCESS' | 'FAILED';
  recordsCount: number;
  errorMessage: string | null;
  createdAt: string; // ISO 8601
}
```

## Relationships

### TradeCalendar → DailyQuote (1:N)

- 一个交易日可以对应多条股票行情记录(4000+ 只股票)
- 外键关系: `DailyQuote.tradeDate` → `TradeCalendar.calDate`
- 级联规则: 删除交易日历不影响历史行情数据(可选外键)

### TaskLog 独立实体

- TaskLog 不与其他实体建立强关联
- 通过 taskName 和 startTime 可以查询到对应的数据采集时间段
- 便于后续分析任务执行频率和成功率

## Data Flow

```
[Tushare API]
     │
     ▼
[TushareService] ──┐
                   │
                   ▼
            [Event Step: Collect]
                   │
                   ├─► [TradeCalendar Table]
                   │
                   ├─► [DailyQuote Table]
                   │
                   └─► [TaskLog Table]

[User Query]
     │
     ▼
[API Step: Query] ──► [Database] ──► [Export (CSV/JSON)]
```

## Database Schema SQL

```sql
-- 创建交易日历表
CREATE TABLE IF NOT EXISTS trade_calendar (
  cal_date TEXT PRIMARY KEY,
  exchange TEXT NOT NULL CHECK(exchange IN ('SSE', 'SZSE')),
  is_open INTEGER NOT NULL CHECK(is_open IN (0, 1)),
  pretrade_date TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 创建日线行情表
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

-- 创建任务日志表
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

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_quotes_ts_code ON daily_quotes(ts_code);
CREATE INDEX IF NOT EXISTS idx_quotes_trade_date ON daily_quotes(trade_date);
CREATE INDEX IF NOT EXISTS idx_calendar_date ON trade_calendar(cal_date);
CREATE INDEX IF NOT EXISTS idx_task_logs_name ON task_logs(task_name);
```

## Data Migration Strategy

**初始化流程** (首次启动):

1. 检查数据库文件是否存在,不存在则创建
2. 执行上述 Schema SQL 创建表和索引
3. 检查 trade_calendar 表是否为空,为空则获取最近 3 年日历数据并插入

**数据更新流程**:

- 每次采集任务执行时,使用 `INSERT OR REPLACE` 更新数据
- 交易日历每年 12 月自动检查下一年度数据,缺失则补充

**数据清理策略** (可选):

- 保留最近 5 年数据,超过 5 年的数据可定期归档或删除
- 任务日志保留 6 个月,超过则清理

## Performance Considerations

**查询优化**:

- 按股票代码查询: 使用 `idx_quotes_ts_code` 索引,查询时间 < 100ms
- 按日期范围查询: 使用 `idx_quotes_trade_date` 索引,1年数据查询 < 500ms
- 组合查询 (股票代码 + 日期范围): 复合索引优化,< 200ms

**存储估算**:

- 单条 DailyQuote 记录约 150 字节
- 全市场 4000 只股票 × 250 交易日/年 × 150 字节 ≈ 150MB/年
- 5 年数据约 750MB,符合 < 5GB 约束

**并发控制**:

- SQLite 使用 WAL 模式,支持并发读
- 写操作通过 Motia Event Step 串行化,避免锁竞争
