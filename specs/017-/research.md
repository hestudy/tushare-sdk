# Research: 股市数据定时采集与存储应用 (基于 Motia 框架)

**Feature Branch**: `017-`
**Created**: 2025-10-15
**Status**: Complete

## Research Overview

本研究文档解决了在使用 Motia 框架构建股市数据采集应用时的关键技术选型和实现方案问题。

## 1. Motia 框架核心概念研究

### 1.1 决策: 选择 Motia 作为应用框架

**理由**:

- **事件驱动架构原生支持**: Motia 的 Step 原语天然适合数据采集场景,每个采集任务可以作为独立的 Event Step
- **内置任务调度**: 支持 Cron 表达式的定时任务,无需额外引入 node-cron 等第三方库
- **容错和重试机制**: Event Steps 自动提供重试能力,满足 API 限流和网络异常处理需求
- **可观测性工具**: 自带 Workbench UI,提供日志、追踪、状态可视化,降低运维复杂度
- **多语言支持**: 虽然本项目使用 TypeScript,但为未来扩展(如 Python 数据分析)预留了可能性

**考虑的替代方案**:

- **纯 Node.js + node-cron**: 需要手动实现重试、日志、任务状态管理,开发和维护成本高
- **Bull/BullMQ + Redis**: 需要额外部署 Redis,增加系统复杂度,不适合单用户场景
- **Temporal.io**: 功能过于重量级,学习曲线陡峭,不适合本项目规模

**拒绝原因**: 纯 Node.js 方案缺少开箱即用的容错和可观测性,Bull 需要额外基础设施,Temporal 过度设计。

### 1.2 Motia Step 类型选择

**API Step**:

- 用途: 提供 HTTP 接口,用于数据查询和导出
- 示例: `query-quotes-api.step.ts`, `export-data.step.ts`

**Event Step**:

- 用途: 处理异步任务,如数据采集、存储
- 自动重试机制,适合处理不稳定的外部 API 调用
- 示例: `collect-daily-quotes.step.ts`, `save-quotes-to-db.step.ts`

**Cron Step**:

- 用途: 定时触发任务,替代 node-cron
- 支持标准 Cron 表达式
- 示例: `schedule-daily-collection.step.ts` (每日收盘后触发)

**决策**: 采集任务使用 Event Step + Cron Step 组合,查询接口使用 API Step。

## 2. 数据存储方案研究

### 2.1 决策: 使用 SQLite 作为本地数据库

**理由**:

- **零配置部署**: 无需额外数据库服务,适合单用户/小团队场景
- **轻量高效**: 单文件数据库,便于备份和迁移
- **SQL 支持**: 支持复杂查询,满足时间范围和股票代码筛选需求
- **分析工具兼容**: 支持 pandas、DBeaver 等常见分析工具直接读取
- **Motia 推荐**: Motia 官方示例中使用 better-sqlite3,生态适配好

**考虑的替代方案**:

- **PostgreSQL**: 功能强大但需要独立部署,对单用户场景过度
- **MongoDB**: NoSQL 对时序数据查询不如 SQL 方便
- **CSV 文件**: 查询性能差,无法处理大数据量和并发

**拒绝原因**: PostgreSQL 和 MongoDB 增加部署复杂度,CSV 性能不足。

### 2.2 数据库 Schema 设计

**表结构**:

```sql
-- 交易日历表
CREATE TABLE trade_calendar (
  cal_date TEXT PRIMARY KEY,        -- 日期 YYYY-MM-DD
  exchange TEXT NOT NULL,            -- 交易所 SSE/SZSE
  is_open INTEGER NOT NULL,          -- 是否开盘 1/0
  pretrade_date TEXT,                -- 上一交易日
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 日线行情表
CREATE TABLE daily_quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts_code TEXT NOT NULL,             -- 股票代码 600519.SH
  trade_date TEXT NOT NULL,          -- 交易日期 YYYY-MM-DD
  open REAL,                         -- 开盘价
  high REAL,                         -- 最高价
  low REAL,                          -- 最低价
  close REAL,                        -- 收盘价
  pre_close REAL,                    -- 昨收价
  change REAL,                       -- 涨跌额
  pct_chg REAL,                      -- 涨跌幅 %
  vol REAL,                          -- 成交量 手
  amount REAL,                       -- 成交额 千元
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(ts_code, trade_date)        -- 防止重复数据
);

-- 任务执行日志表
CREATE TABLE task_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_name TEXT NOT NULL,           -- 任务名称
  start_time TEXT NOT NULL,          -- 开始时间
  end_time TEXT,                     -- 结束时间
  status TEXT NOT NULL,              -- SUCCESS/FAILED
  records_count INTEGER DEFAULT 0,   -- 处理记录数
  error_message TEXT,                -- 错误信息
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 索引优化查询性能
CREATE INDEX idx_quotes_ts_code ON daily_quotes(ts_code);
CREATE INDEX idx_quotes_trade_date ON daily_quotes(trade_date);
CREATE INDEX idx_calendar_date ON trade_calendar(cal_date);
```

**决策理由**:

- 使用 `UNIQUE(ts_code, trade_date)` 约束实现自动去重
- 索引优化常见查询场景(按股票代码、按日期)
- 日期统一使用 TEXT 类型存储 ISO 8601 格式,便于排序和查询

## 3. Tushare API 集成方案

### 3.1 决策: 封装 @hestudy/tushare-sdk 为服务层

**理由**:

- 复用现有 SDK,避免重复实现 API 调用逻辑
- 在 SDK 基础上添加限流控制和错误处理
- 统一管理 API Token 配置

**实现方案**:

```typescript
// lib/tushare-client.ts
import { TushareClient } from '@hestudy/tushare-sdk';
import pLimit from 'p-limit';

export class TushareService {
  private client: TushareClient;
  private limiter = pLimit(5); // 限制并发请求数

  constructor(token: string) {
    this.client = new TushareClient(token);
  }

  async getDailyQuotes(tradeDate: string) {
    return this.limiter(() =>
      this.client.query('daily', { trade_date: tradeDate })
    );
  }

  async getTradeCalendar(startDate: string, endDate: string) {
    return this.limiter(() =>
      this.client.query('trade_cal', {
        start_date: startDate,
        end_date: endDate,
      })
    );
  }
}
```

**考虑的替代方案**:

- 直接在 Step handler 中调用 SDK: 导致代码重复和测试困难
- 使用 HTTP 直接调用 Tushare API: 重复实现 SDK 已有功能

**拒绝原因**: 直接调用缺少封装,不利于测试和维护。

### 3.2 API 限流策略

**决策**: 使用 p-limit 库控制并发 + Motia Event Step 重试机制

**理由**:

- Tushare 免费账户限制约 200次/分钟
- p-limit 控制并发请求数为 5,避免瞬时超限
- Event Step 的重试机制处理偶发限流错误(HTTP 429)

**配置**:

```typescript
// Step config
{
  retries: 3,
  retryDelay: 60000, // 限流后延迟 1 分钟重试
}
```

## 4. 定时任务调度设计

### 4.1 决策: 使用 Motia Cron Step

**Cron 表达式**:

```typescript
// schedule-daily-collection.step.ts
export const config = {
  name: 'ScheduleDailyCollection',
  type: 'cron',
  schedule: '0 17 * * 1-5', // 周一到周五 17:00 执行
  emits: ['data.collection.triggered'],
};
```

**理由**:

- 中国股市交易时间: 9:30-15:00
- 设置 17:00 触发,确保收盘数据已更新
- 仅工作日执行,配合交易日历检查双重保险

### 4.2 非交易日处理

**决策**: 在数据采集 Step 中检查交易日历

```typescript
// collect-daily-quotes.step.ts handler
const isTradeDay = await checkTradeCalendar(today);
if (!isTradeDay) {
  logger.info('Skip non-trade day', { date: today });
  return;
}
```

**理由**:

- 避免在非交易日发起无效 API 请求
- 节省 API 调用配额
- 清晰记录跳过日志

## 5. 测试策略

### 5.1 单元测试

**工具**: Vitest (与 monorepo 一致)

**覆盖范围**:

- 数据库操作函数 (`lib/database.ts`)
- Tushare 客户端封装 (`lib/tushare-client.ts`)
- 工具函数 (`lib/utils.ts`)

**Mock 策略**:

- Mock Tushare SDK API 调用,使用固定测试数据
- 使用内存 SQLite 数据库 (`:memory:`) 进行数据库测试

### 5.2 集成测试

**覆盖场景**:

- 完整的数据采集流程: Cron 触发 → 检查交易日 → 采集数据 → 存储数据库
- 查询和导出流程: API 请求 → 查询数据库 → 格式化输出

**测试环境**:

- 使用 Motia 测试工具启动本地 runtime
- 使用测试专用 SQLite 文件,测试后清理

### 5.3 契约测试

**目标**: 验证 Tushare API 返回格式

**方法**:

- 使用真实 Token 调用 API(CI 环境配置)
- 验证返回数据字段完整性和类型正确性
- 每周定期运行,检测上游 API 变更

## 6. 开发环境配置

### 6.1 环境变量管理

**文件**: `.env`

```env
# Tushare API Token
TUSHARE_TOKEN=your_32_character_token_here

# 数据库路径
DATABASE_PATH=./data/stock.db

# 日志级别
LOG_LEVEL=info

# API 限流配置
RATE_LIMIT_CONCURRENT=5
RATE_LIMIT_RETRY_DELAY=60000
```

### 6.2 Motia 配置

**文件**: `motia.config.ts`

```typescript
export default {
  runtime: {
    port: 3000, // Workbench 端口
  },
  storage: {
    provider: 'sqlite',
    path: process.env.DATABASE_PATH || './data/stock.db',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};
```

## 7. 部署和运维考虑

### 7.1 本地运行

**启动命令**:

```bash
pnpm dev    # 开发模式,启动 Workbench
pnpm start  # 生产模式,后台运行
```

### 7.2 数据备份建议

**策略**: 定期备份 SQLite 文件

```bash
# 每周备份脚本
cp ./data/stock.db ./data/backups/stock_$(date +%Y%m%d).db
```

### 7.3 监控和告警

**依赖 Motia Workbench**:

- 任务执行状态实时查看
- 错误日志集中展示
- 未来可扩展: 连续失败 3 次发送邮件告警(通过 Event Step 实现)

## 8. 数据导出格式

### 8.1 CSV 格式

**示例**:

```csv
ts_code,trade_date,open,high,low,close,vol,amount
600519.SH,2024-01-01,1450.00,1460.00,1445.00,1455.00,50000,7250000
```

**库**: `papaparse` 或原生 Node.js 实现

### 8.2 JSON 格式

**示例**:

```json
[
  {
    "ts_code": "600519.SH",
    "trade_date": "2024-01-01",
    "open": 1450.00,
    "close": 1455.00,
    ...
  }
]
```

## 研究结论

所有技术选型和实现方案已明确,无遗留 NEEDS CLARIFICATION 项。关键决策:

1. **框架**: Motia (事件驱动 + 内置调度)
2. **存储**: SQLite + better-sqlite3
3. **数据源**: @hestudy/tushare-sdk 封装
4. **测试**: Vitest + Mock + 集成测试
5. **部署**: 本地运行 + Workbench 监控

下一步: 进入 Phase 1,生成 data-model.md 和 contracts。
