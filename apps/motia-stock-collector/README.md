# Motia 股市数据采集应用

基于 Motia 框架的 A 股市场数据自动采集与存储应用,提供定时数据采集、历史数据查询和导出功能。

## 功能特性

- 📊 **自动数据采集**: 定时采集 A 股日线行情数据(4000+ 股票)
- 📅 **交易日历维护**: 自动管理交易日历,智能跳过非交易日
- 💾 **本地数据存储**: 使用 SQLite 存储历史数据,支持复杂查询
- 📤 **数据导出**: 支持 CSV/JSON 格式导出,便于后续分析
- 🔄 **自动重试**: 内置容错和重试机制,应对 API 限流
- 📈 **可视化监控**: Motia Workbench 提供任务执行监控和日志追踪
- 🔍 **灵活查询**: 支持按股票代码、日期范围等条件查询
- 📋 **任务管理**: 查询任务执行历史和状态

## 架构概览

```
┌─────────────────────────────────────────────────────────────────┐
│                    Motia 股市数据采集应用                        │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Cron Scheduler  │────>│  Event System    │────>│   Database   │
│  (定时任务)       │     │  (事件驱动)       │     │   (SQLite)   │
└──────────────────┘     └──────────────────┘     └──────────────┘
        │                         │                         │
        │                         │                         │
        v                         v                         v
┌──────────────────┐     ┌──────────────────┐     ┌──────────────┐
│ScheduleDaily     │────>│CollectDaily      │────>│ DailyQuotes  │
│Collection        │     │Quotes            │     │ Table        │
└──────────────────┘     └──────────────────┘     └──────────────┘
                                 │
                                 │
                                 v
                         ┌──────────────────┐
                         │ CollectTrade     │
                         │ Calendar         │
                         └──────────────────┘
                                 │
                                 v
                         ┌──────────────────┐
                         │ TradeCalendar    │
                         │ Table            │
                         └──────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                        API Layer                                 │
├──────────────────┬──────────────────┬──────────────────┬─────────┤
│ QueryQuotesAPI   │  ExportData     │  ListTasksAPI    │TaskLogs │
│ (查询行情)        │  (导出数据)      │  (任务列表)       │(日志)   │
└──────────────────┴──────────────────┴──────────────────┴─────────┘

                            ⬇
                    ┌──────────────────┐
                    │  Tushare API     │
                    │  (数据源)         │
                    └──────────────────┘
```

## 数据流程

```
1. 定时触发 (每日 17:00)
   └─> ScheduleDailyCollection (Cron Step)
       └─> emit: data.collection.triggered

2. 数据采集
   └─> CollectDailyQuotes (Event Step)
       ├─> 检查交易日历
       ├─> 调用 Tushare API
       ├─> 保存到数据库 (daily_quotes)
       └─> 记录任务日志 (task_logs)

3. 交易日历维护
   └─> CollectTradeCalendar (Event Step)
       ├─> 获取交易日历数据
       └─> 保存到数据库 (trade_calendar)

4. 数据查询与导出
   └─> QueryQuotesAPI / ExportData (API Steps)
       ├─> 查询数据库
       └─> 返回结果 (JSON/CSV)
```

## 快速开始

### 环境要求

- **Node.js**: 18.0+ LTS (推荐 18.x 或 20.x)
- **包管理器**: npm 或 pnpm
- **Tushare Token**: 有效的 Tushare Pro API Token ([免费注册](https://tushare.pro/register))
- **磁盘空间**: 至少 5GB 可用空间(存储 3-5 年历史数据)

### 安装

```bash
# 1. 进入项目目录
cd apps/motia-stock-collector

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件,填入你的 TUSHARE_TOKEN
```

### 配置

编辑 `.env` 文件:

```env
# Tushare API Token (必填)
TUSHARE_TOKEN=your_32_character_token_here

# 数据库路径 (可选)
DATABASE_PATH=./data/stock.db

# 日志级别 (可选: debug/info/warn/error)
LOG_LEVEL=info

# API 限流配置 (可选)
RATE_LIMIT_CONCURRENT=5
RATE_LIMIT_RETRY_DELAY=60000

# Workbench 端口 (可选)
WORKBENCH_PORT=3000
```

### 运行

```bash
# 开发模式(启动 Workbench 可视化界面)
pnpm dev

# 生产模式(后台运行)
pnpm start
```

访问 Workbench: http://localhost:3000

## 项目结构

```
apps/motia-stock-collector/
├── steps/                         # Motia Steps (业务逻辑)
│   ├── schedule-daily-collection.step.ts   # 定时调度
│   ├── collect-daily-quotes.step.ts        # 行情采集
│   ├── collect-trade-calendar.step.ts      # 日历采集
│   ├── query-quotes-api.step.ts            # 查询接口
│   ├── export-data.step.ts                 # 导出接口
│   ├── list-tasks-api.step.ts              # 任务列表
│   └── query-task-logs-api.step.ts         # 日志查询
├── lib/                           # 共享服务和工具
│   ├── database.ts                # 数据库操作
│   ├── tushare-client.ts          # Tushare 客户端封装
│   ├── utils.ts                   # 工具函数
│   └── error-handler.ts           # 错误处理
├── types/                         # TypeScript 类型定义
│   └── index.ts                   # 数据模型类型
├── tests/                         # 测试文件
│   ├── unit/                      # 单元测试
│   │   ├── database.test.ts
│   │   ├── tushare-client.test.ts
│   │   └── utils.test.ts
│   └── integration/               # 集成测试
│       ├── collection-flow.test.ts
│       ├── storage-query-flow.test.ts
│       └── trade-calendar-flow.test.ts
├── data/                          # 数据目录
│   └── stock.db                   # SQLite 数据库文件
├── docs/                          # 文档目录
│   ├── deployment.md              # 部署文档
│   └── operations.md              # 运维手册
├── motia.config.ts                # Motia 配置
├── tsconfig.json                  # TypeScript 配置
├── vitest.config.ts               # 测试配置
├── package.json                   # 项目配置
└── .env.example                   # 环境变量示例
```

## 核心 Steps

### Cron Steps (定时任务)

- **ScheduleDailyCollection** (`schedule-daily-collection.step.ts`)
  - 功能: 每日定时触发数据采集任务
  - 调度: 周一至周五 17:00 执行
  - 事件: 触发 `data.collection.triggered`

### Event Steps (事件驱动任务)

- **CollectDailyQuotes** (`collect-daily-quotes.step.ts`)
  - 功能: 采集指定日期的全市场日线行情数据
  - 订阅: `data.collection.triggered`
  - 重试: 3 次,延迟 60 秒

- **CollectTradeCalendar** (`collect-trade-calendar.step.ts`)
  - 功能: 采集交易日历数据
  - 订阅: `calendar.update.needed`
  - 自动检测: 缺失年度数据时触发

### API Steps (HTTP 接口)

- **QueryQuotesAPI** (`query-quotes-api.step.ts`)
  - 路径: `GET /api/quotes`
  - 功能: 查询历史行情数据
  - 参数: `tsCode`, `startDate`, `endDate`, `limit`

- **ExportData** (`export-data.step.ts`)
  - 路径: `GET /api/export`
  - 功能: 导出数据为 CSV/JSON 格式
  - 参数: `format`, `tsCode`, `startDate`, `endDate`

- **ListTasksAPI** (`list-tasks-api.step.ts`)
  - 路径: `GET /api/tasks`
  - 功能: 查询所有任务配置和状态

- **QueryTaskLogsAPI** (`query-task-logs-api.step.ts`)
  - 路径: `GET /api/task-logs`
  - 功能: 查询任务执行历史
  - 参数: `taskName`, `status`, `startDate`, `endDate`, `limit`

## API 接口

### 查询行情数据

```bash
GET /api/quotes?tsCode=600519.SH&startDate=2024-01-01&endDate=2024-12-31&limit=100
```

**请求参数**:
- `tsCode` (可选): 股票代码,如 `600519.SH`
- `startDate` (可选): 开始日期,格式 `YYYY-MM-DD`
- `endDate` (可选): 结束日期,格式 `YYYY-MM-DD`
- `limit` (可选): 返回记录数,默认 100

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "ts_code": "600519.SH",
      "trade_date": "2024-01-15",
      "open": 1450.00,
      "high": 1460.00,
      "low": 1445.00,
      "close": 1455.00,
      "vol": 50000,
      "amount": 7250000
    }
  ],
  "count": 1
}
```

### 导出数据

```bash
GET /api/export?format=csv&tsCode=600519.SH&startDate=2024-01-01&endDate=2024-12-31
```

**请求参数**:
- `format` (必填): 导出格式,`csv` 或 `json`
- `tsCode` (可选): 股票代码
- `startDate` (可选): 开始日期
- `endDate` (可选): 结束日期

**响应**: 文件下载

### 查询任务列表

```bash
GET /api/tasks
```

**响应示例**:
```json
{
  "success": true,
  "tasks": [
    {
      "name": "ScheduleDailyCollection",
      "type": "cron",
      "schedule": "0 17 * * 1-5",
      "nextRun": "2024-01-16T17:00:00Z"
    }
  ]
}
```

### 查询任务日志

```bash
GET /api/task-logs?taskName=CollectDailyQuotes&status=SUCCESS&limit=10
```

**请求参数**:
- `taskName` (可选): 任务名称
- `status` (可选): 任务状态,`SUCCESS` 或 `FAILED`
- `startDate` (可选): 开始日期
- `endDate` (可选): 结束日期
- `limit` (可选): 返回记录数,默认 100

## 测试

```bash
# 运行所有测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm run test:coverage

# 运行单元测试
pnpm run test:unit

# 运行集成测试
pnpm run test:integration
```

## 数据库 Schema

### trade_calendar (交易日历)

| 字段 | 类型 | 说明 |
|------|------|------|
| cal_date | TEXT | 日期 (PRIMARY KEY) |
| exchange | TEXT | 交易所代码 |
| is_open | INTEGER | 是否开盘 (0/1) |
| pretrade_date | TEXT | 上一交易日 |
| created_at | TEXT | 创建时间 |

### daily_quotes (日线行情)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| ts_code | TEXT | 股票代码 |
| trade_date | TEXT | 交易日期 |
| open | REAL | 开盘价 |
| high | REAL | 最高价 |
| low | REAL | 最低价 |
| close | REAL | 收盘价 |
| vol | REAL | 成交量 |
| amount | REAL | 成交额 |
| created_at | TEXT | 创建时间 |

### task_logs (任务日志)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| task_name | TEXT | 任务名称 |
| start_time | TEXT | 开始时间 |
| end_time | TEXT | 结束时间 |
| status | TEXT | 状态 (SUCCESS/FAILED) |
| records_count | INTEGER | 处理记录数 |
| error_message | TEXT | 错误信息 |
| created_at | TEXT | 创建时间 |

## 配置说明

### 环境变量

主要环境变量:

- `TUSHARE_TOKEN`: Tushare API Token (必填)
- `DATABASE_PATH`: SQLite 数据库文件路径
- `LOG_LEVEL`: 日志级别 (debug/info/warn/error)
- `RATE_LIMIT_CONCURRENT`: API 并发请求数限制
- `RATE_LIMIT_RETRY_DELAY`: API 重试延迟(毫秒)
- `WORKBENCH_PORT`: Workbench 端口

详见 `.env.example`

### Motia 配置

`motia.config.ts` 文件配置 Motia 运行时参数:

```typescript
export default {
  runtime: {
    port: process.env.WORKBENCH_PORT || 3000,
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

## 运维指南

### 数据备份

```bash
# 手动备份数据库
cp ./data/stock.db ./data/backups/stock_$(date +%Y%m%d).db

# 定期备份(添加到 crontab)
0 2 * * * cd /path/to/app && cp ./data/stock.db ./data/backups/stock_$(date +\%Y\%m\%d).db
```

### 监控

使用 Motia Workbench 监控:
1. 访问 http://localhost:3000
2. 查看 "Traces" 标签查看任务执行历史
3. 查看 "Logs" 标签查看实时日志
4. 查看 "Workflow" 标签查看 Steps 依赖关系

### 常见问题

#### 1. Tushare Token 无效

**解决方案**:
- 检查 `.env` 文件中的 Token 是否正确
- 确认 Token 没有过期
- 测试 Token 是否可用: `curl -X POST https://api.tushare.pro -d '{"api_name":"trade_cal","token":"your_token"}'`

#### 2. 数据库文件无法创建

**解决方案**:
- 确保 `data/` 目录存在
- 检查磁盘空间是否充足
- 检查文件权限: `chmod 755 data/`

#### 3. API 限流错误

**解决方案**:
- 检查 `RATE_LIMIT_CONCURRENT` 配置是否合理
- 确认 Tushare 账户等级和限流配额
- 等待一段时间后重试

#### 4. 采集任务失败

**解决方案**:
- 查看 Workbench 日志获取详细错误信息
- 检查网络连接是否正常
- 确认交易日历数据是否完整
- 查询 `task_logs` 表获取失败原因

## 性能优化

### 数据库优化

1. **索引优化**: 已创建索引
   - `idx_quotes_ts_code`: 按股票代码查询
   - `idx_quotes_trade_date`: 按日期范围查询
   - `idx_calendar_date`: 交易日历查询

2. **批量插入**: 使用事务批量插入数据,提高写入性能

3. **WAL 模式**: SQLite 启用 WAL 模式,支持并发读

### API 限流优化

1. **并发控制**: 使用 `p-limit` 控制并发请求数
2. **重试机制**: Event Steps 自动重试失败请求
3. **缓存策略**: 交易日历数据缓存,减少重复请求

## 技术栈

- **框架**: Motia (事件驱动架构)
- **语言**: TypeScript 5.x
- **运行时**: Node.js 18+ LTS
- **数据源**: Tushare Pro API
- **存储**: SQLite (better-sqlite3)
- **限流**: p-limit
- **测试**: Vitest
- **构建**: TypeScript Compiler

## 相关文档

- [部署文档](./docs/deployment.md)
- [运维手册](./docs/operations.md)
- [Motia 官方文档](https://motia.dev)
- [Tushare Pro 文档](https://tushare.pro/document/2)
- [项目规范](../../specs/017-/)

## 开发贡献

欢迎贡献代码!请遵循以下规范:

1. Fork 本仓库
2. 创建功能分支: `git checkout -b feature/new-feature`
3. 编写测试并确保测试通过
4. 提交代码: `git commit -m "Add new feature"`
5. 推送分支: `git push origin feature/new-feature`
6. 创建 Pull Request

## License

MIT

## 更新日志

### v1.0.0 (2025-10-15)

- ✅ 实现定时数据采集功能 (US1)
- ✅ 实现交易日历维护功能 (US2)
- ✅ 实现数据存储与查询功能 (US3)
- ✅ 实现任务管理功能 (US4)
- ✅ 完整测试覆盖(覆盖率 ≥ 80%)
- ✅ 部署和运维文档完善
