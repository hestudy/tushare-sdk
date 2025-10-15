# Quick Start: Motia 股市数据采集应用

本指南将帮助你在 15 分钟内完成从安装到首次成功运行股市数据采集任务的完整流程。

## Prerequisites

在开始之前,请确保你的环境满足以下要求:

- **Node.js**: 18.0.0 或更高版本 (LTS 推荐)
- **pnpm**: 8.0.0 或更高版本
- **Tushare Token**: 有效的 Tushare Pro API Token ([获取方式](https://tushare.pro/register))
- **磁盘空间**: 至少 5GB 可用空间

检查你的环境:

```bash
node --version  # 应显示 v18.x.x 或更高
pnpm --version  # 应显示 8.x.x 或更高
```

## Step 1: 初始化 Motia 项目

在 `apps` 目录下创建新的 Motia 应用:

```bash
cd /Users/hestudy/Documents/project/tushare-sdk/apps
npx motia@latest create
```

安装向导会询问以下问题:

1. **Project name**: 输入 `motia-stock-collector`
2. **Select a template**: 选择 `Blank` (我们将从零开始构建)
3. **Package manager**: 选择 `pnpm`

等待依赖安装完成。

## Step 2: 安装项目依赖

进入项目目录并安装额外依赖:

```bash
cd motia-stock-collector

# 安装 Tushare SDK 和数据库库
pnpm add @hestudy/tushare-sdk better-sqlite3
pnpm add -D @types/better-sqlite3

# 安装工具库
pnpm add p-limit dotenv
```

## Step 3: 配置环境变量

创建 `.env` 文件配置 Tushare API Token:

```bash
cp .env.example .env
```

编辑 `.env` 文件,填入你的配置:

```env
# Tushare API Token (必填)
TUSHARE_TOKEN=your_32_character_token_here

# 数据库路径
DATABASE_PATH=./data/stock.db

# 日志级别
LOG_LEVEL=info

# API 限流配置
RATE_LIMIT_CONCURRENT=5
RATE_LIMIT_RETRY_DELAY=60000
```

> **安全提示**: 不要将 `.env` 文件提交到版本控制系统。

## Step 4: 创建项目结构

创建必要的目录:

```bash
mkdir -p steps lib types tests/unit tests/integration data
```

## Step 5: 创建数据库服务

创建 `lib/database.ts` 文件,实现数据库操作:

```typescript
import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = process.env.DATABASE_PATH || './data/stock.db';

export class DatabaseService {
  private db: Database.Database;

  constructor() {
    this.db = new Database(DB_PATH);
    this.initSchema();
  }

  private initSchema() {
    // 创建交易日历表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS trade_calendar (
        cal_date TEXT PRIMARY KEY,
        exchange TEXT NOT NULL CHECK(exchange IN ('SSE', 'SZSE')),
        is_open INTEGER NOT NULL CHECK(is_open IN (0, 1)),
        pretrade_date TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // 创建日线行情表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS daily_quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ts_code TEXT NOT NULL,
        trade_date TEXT NOT NULL,
        open REAL,
        high REAL,
        low REAL,
        close REAL,
        pre_close REAL,
        change REAL,
        pct_chg REAL,
        vol REAL,
        amount REAL,
        created_at TEXT DEFAULT (datetime('now')),
        UNIQUE(ts_code, trade_date)
      );
      
      CREATE INDEX IF NOT EXISTS idx_quotes_ts_code ON daily_quotes(ts_code);
      CREATE INDEX IF NOT EXISTS idx_quotes_trade_date ON daily_quotes(trade_date);
    `);

    // 创建任务日志表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS task_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_name TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT,
        status TEXT NOT NULL CHECK(status IN ('SUCCESS', 'FAILED')),
        records_count INTEGER DEFAULT 0,
        error_message TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );
    `);
  }

  // 查询行情数据
  queryQuotes(filters: {
    tsCode?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) {
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

    sql += ' ORDER BY trade_date DESC';

    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    }

    return this.db.prepare(sql).all(...params);
  }

  // 保存行情数据
  saveQuotes(quotes: any[]) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO daily_quotes 
      (ts_code, trade_date, open, high, low, close, pre_close, change, pct_chg, vol, amount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = this.db.transaction((quotes: any[]) => {
      for (const quote of quotes) {
        stmt.run(
          quote.ts_code,
          quote.trade_date,
          quote.open,
          quote.high,
          quote.low,
          quote.close,
          quote.pre_close,
          quote.change,
          quote.pct_chg,
          quote.vol,
          quote.amount
        );
      }
    });

    transaction(quotes);
    return quotes.length;
  }

  close() {
    this.db.close();
  }
}

export const db = new DatabaseService();
```

## Step 6: 创建第一个 Step - 查询 API

创建 `steps/query-quotes-api.step.ts`:

```typescript
export const config = {
  name: 'QueryQuotesAPI',
  type: 'api',
  path: '/api/quotes',
  method: 'GET',
};

export const handler = async (req: any, { logger }: any) => {
  const { tsCode, startDate, endDate, limit = 100 } = req.query;

  try {
    const { db } = await import('../lib/database');

    const results = db.queryQuotes({
      tsCode,
      startDate,
      endDate,
      limit: parseInt(limit),
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
    logger.error('Query failed', { error: error.message });
    return {
      status: 500,
      body: {
        success: false,
        error: error.message,
      },
    };
  }
};
```

## Step 7: 启动开发服务器

启动 Motia 开发服务器:

```bash
pnpm dev
```

你应该看到以下输出:

```
✓ Motia runtime started
✓ Workbench available at http://localhost:3000
✓ Discovered 1 steps
  - QueryQuotesAPI (api)
```

## Step 8: 测试查询接口

打开浏览器访问 Workbench: http://localhost:3000

在 Workbench 中:

1. 点击左侧的 "Steps" 标签
2. 找到 "QueryQuotesAPI" Step
3. 点击 "Test" 按钮
4. 输入测试参数 (例如: `{ "limit": 10 }`)
5. 点击 "Run" 查看结果

或者使用 curl 测试:

```bash
curl "http://localhost:3000/api/quotes?limit=10"
```

## Step 9: 创建数据采集 Step (可选)

创建 `steps/schedule-daily-collection.step.ts`:

```typescript
export const config = {
  name: 'ScheduleDailyCollection',
  type: 'cron',
  schedule: '0 17 * * 1-5', // 周一到周五 17:00
  emits: ['data.collection.triggered'],
};

export const handler = async (_input: any, { emit, logger }: any) => {
  const today = new Date().toISOString().split('T')[0];

  logger.info('Triggering daily collection', { tradeDate: today });

  await emit({
    topic: 'data.collection.triggered',
    data: { tradeDate: today },
  });
};
```

创建 `steps/collect-daily-quotes.step.ts`:

```typescript
export const config = {
  name: 'CollectDailyQuotes',
  type: 'event',
  subscribes: ['data.collection.triggered'],
  retries: 3,
  retryDelay: 60000,
};

export const handler = async (input: any, { logger, emit }: any) => {
  const { tradeDate } = input;

  try {
    // TODO: 调用 Tushare SDK 获取数据
    // TODO: 保存到数据库

    logger.info('Collection completed', { tradeDate, count: 0 });

    await emit({
      topic: 'quotes.collected',
      data: { tradeDate, count: 0 },
    });
  } catch (error: any) {
    logger.error('Collection failed', { error: error.message });
    throw error; // 触发重试
  }
};
```

## Step 10: 验证 Motia 工作流

重启开发服务器后:

1. 打开 Workbench (http://localhost:3000)
2. 查看 "Workflow" 标签,应该看到 Steps 之间的连接关系
3. 查看 "Logs" 标签,可以看到实时日志输出

## Next Steps

现在你已经成功运行了基于 Motia 的股市数据采集应用基础框架!接下来可以:

1. **完善数据采集逻辑**: 集成 Tushare SDK,实现真实的数据获取
2. **添加更多 Steps**: 如数据导出、历史数据补齐等
3. **编写测试**: 使用 Vitest 为 Steps 编写单元测试和集成测试
4. **部署到生产**: 参考 Motia 部署文档,将应用部署到服务器

## Troubleshooting

### 问题 1: "Tushare Token 无效"

**解决方案**:

- 检查 `.env` 文件中的 Token 是否正确
- 确认 Token 没有过期

### 问题 2: "数据库文件无法创建"

**解决方案**:

- 确保 `data/` 目录存在
- 检查磁盘空间是否充足
- 检查文件权限

### 问题 3: "Motia 服务无法启动"

**解决方案**:

- 检查端口 3000 是否被占用
- 查看控制台错误日志
- 确认所有依赖已正确安装

## FAQ

**Q: 如何修改定时任务的执行时间?**

A: 编辑 `schedule-daily-collection.step.ts` 中的 `schedule` 字段,使用标准 Cron 表达式。

**Q: 如何备份数据库?**

A: 直接复制 `data/stock.db` 文件即可。建议定期备份到其他位置。

**Q: 如何查看任务执行历史?**

A: 在 Workbench 的 "Traces" 标签中可以查看所有 Step 的执行历史和详细日志。

---

**Quick Start Complete!** 如有其他问题,请参考完整文档或提交 Issue。
