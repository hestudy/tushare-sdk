# Quick Start: Motia 股市数据采集应用

本指南将帮助你在 15 分钟内完成从安装到首次成功运行股市数据采集任务的完整流程。

> **状态更新**: 本项目已完成全部核心功能实现,包括数据采集、存储、查询和任务管理。

## Prerequisites

在开始之前,请确保你的环境满足以下要求:

- **Node.js**: 18.0.0 或更高版本 (LTS 推荐)
- **npm**: 8.0.0 或更高版本 (使用项目本地 npm,不需要 pnpm)
- **Tushare Token**: 有效的 Tushare Pro API Token ([获取方式](https://tushare.pro/register))
- **磁盘空间**: 至少 5GB 可用空间

检查你的环境:

```bash
node --version  # 应显示 v18.x.x 或更高
npm --version   # 应显示 8.x.x 或更高
```

## Step 1: 进入项目目录

项目已完成搭建,直接进入应用目录:

```bash
cd apps/motia-stock-collector
```

## Step 2: 安装依赖

使用 npm 安装所有依赖:

```bash
npm install
```

这将安装以下核心依赖:
- `@hestudy/tushare-sdk` - Tushare 数据源
- `better-sqlite3` - SQLite 数据库
- `motia` - Motia 框架
- `p-limit` - API 限流控制
- `dotenv` - 环境变量管理
- `zod` - 数据验证

## Step 3: 配置环境变量

复制环境变量示例文件:

```bash
cp .env.example .env
```

编辑 `.env` 文件,填入你的 Tushare Token:

```env
# Tushare API Token (必填)
TUSHARE_TOKEN=your_32_character_token_here

# 数据库路径 (可选,默认为 ./data/stock.db)
DATABASE_PATH=./data/stock.db

# 日志级别 (可选,默认为 info)
LOG_LEVEL=info

# API 限流配置 (可选)
RATE_LIMIT_CONCURRENT=5
RATE_LIMIT_RETRY_DELAY=60000
```

> **安全提示**: `.env` 文件已在 `.gitignore` 中,不会被提交到版本控制系统。

## Step 4: 初始化数据库

确保数据目录存在:

```bash
mkdir -p data
```

数据库将在首次运行时自动创建和初始化。

## Step 5: 启动开发服务器

启动 Motia 开发服务器:

```bash
npm run dev
```

你应该看到类似以下的输出:

```
✓ Motia runtime started
✓ Workbench available at http://localhost:3000
✓ Discovered 8 steps:
  - ScheduleDailyCollection (cron)
  - CollectDailyQuotes (event)
  - CollectTradeCalendar (event)
  - QueryQuotesAPI (api)
  - ExportData (api)
  - ListTasksAPI (api)
  - QueryTaskLogsAPI (api)
```

## Step 6: 访问 Motia Workbench

打开浏览器访问:

```
http://localhost:3000
```

Workbench 提供以下功能:

- **Dashboard**: 查看系统概览和实时状态
- **Steps**: 查看所有已注册的 Steps
- **Workflow**: 可视化 Steps 之间的数据流和事件订阅关系
- **Logs**: 实时查看应用日志
- **Traces**: 查看 Step 执行历史和追踪

## Step 7: 初始化交易日历

首次运行需要获取交易日历数据。在 Workbench 中:

1. 进入 **Steps** 页面
2. 找到 `CollectTradeCalendar` Step
3. 点击 **Trigger** 按钮
4. 输入参数:
   ```json
   {
     "startYear": 2023,
     "endYear": 2025
   }
   ```
5. 点击 **Run** 执行

或使用 curl:

```bash
# 触发交易日历采集事件
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{"topic": "calendar.update.needed", "data": {"startYear": 2023, "endYear": 2025}}'
```

## Step 8: 测试数据查询 API

交易日历初始化后,可以测试查询功能:

### 查询行情数据

```bash
# 查询最新 10 条行情记录
curl "http://localhost:3000/api/quotes?limit=10"

# 查询指定股票的行情
curl "http://localhost:3000/api/quotes?tsCode=600519.SH&limit=20"

# 查询指定日期范围
curl "http://localhost:3000/api/quotes?startDate=2024-01-01&endDate=2024-01-31"
```

### 查看任务日志

```bash
# 查询所有任务日志
curl "http://localhost:3000/api/task-logs"

# 查询指定任务的日志
curl "http://localhost:3000/api/task-logs?taskName=CollectDailyQuotes"
```

### 导出数据

```bash
# 导出为 CSV 格式
curl "http://localhost:3000/api/export?format=csv&tsCode=600519.SH" > quotes.csv

# 导出为 JSON 格式
curl "http://localhost:3000/api/export?format=json&startDate=2024-01-01" > quotes.json
```

## Step 9: 手动触发数据采集

测试数据采集功能(需要有效的 Tushare Token):

```bash
# 触发采集指定日期的行情数据
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{"topic": "data.collection.triggered", "data": {"tradeDate": "2024-10-15"}}'
```

在 Workbench 的 **Logs** 页面可以实时查看采集进度。

## Step 10: 验证定时任务

定时任务配置为每周一至周五 17:00 自动执行。在 Workbench 中:

1. 进入 **Steps** 页面
2. 找到 `ScheduleDailyCollection` Step
3. 查看 **Next Run** 时间,确认调度正常
4. 查看 **Logs** 可以看到定时触发的记录

## Next Steps

恭喜!你已经成功运行了完整的 Motia 股市数据采集应用。接下来可以:

### 1. 历史数据补齐

使用内置的历史数据补齐功能:

```bash
# 在 Node.js REPL 中执行
node
> const { backfillHistoricalData } = require('./lib/backfill');
> backfillHistoricalData('2024-01-01', '2024-12-31');
```

### 2. 自定义数据采集

修改 `steps/collect-daily-quotes.step.ts` 调整采集逻辑:
- 修改股票列表范围
- 调整 API 限流参数
- 添加自定义过滤规则

### 3. 扩展查询功能

在 `steps/query-quotes-api.step.ts` 中添加更多查询条件:
- 按涨跌幅筛选
- 按成交量排序
- 计算技术指标 (MA, MACD 等)

### 4. 部署到生产环境

参考 `docs/deployment.md` 了解:
- 使用 PM2 进程管理
- 配置系统服务 (systemd)
- 设置日志轮转
- 数据库备份策略

### 5. 监控和告警

参考 `docs/operations.md` 配置:
- 任务失败告警
- 数据完整性检查
- 性能监控指标

## Troubleshooting

### 问题 1: "Tushare Token 无效" 或 "API 调用失败"

**解决方案**:

1. 检查 `.env` 文件中的 Token 是否正确(32位字符串)
2. 确认 Token 没有过期,登录 [Tushare](https://tushare.pro) 查看权限
3. 验证 Token 权限足够(免费用户有部分接口限制)
4. 检查网络连接,确保能访问 https://api.tushare.pro

### 问题 2: "数据库文件无法创建" 或 "SQLITE_ERROR"

**解决方案**:

1. 确保 `data/` 目录存在且有写入权限: `mkdir -p data && chmod 755 data`
2. 检查磁盘空间是否充足: `df -h .`
3. 删除损坏的数据库文件重新初始化: `rm data/stock.db && npm run dev`
4. 检查 better-sqlite3 是否正确安装: `npm list better-sqlite3`

### 问题 3: "Motia 服务无法启动"

**解决方案**:

1. 检查端口 3000 是否被占用: `lsof -i :3000`
2. 清除 Motia 缓存重新启动: `rm -rf .motia && npm run dev`
3. 检查 Node.js 版本: `node --version` (需要 >= 18.0.0)
4. 重新安装依赖: `rm -rf node_modules package-lock.json && npm install`

### 问题 4: "Step 没有被发现" 或 "Workflow 不显示"

**解决方案**:

1. 确认 Step 文件格式正确(必须导出 `config` 和 `handler`)
2. 检查 Step 文件是否在 `steps/` 目录下
3. 重启开发服务器: Ctrl+C 停止,然后 `npm run dev`
4. 查看启动日志,确认 Step 被发现

## FAQ

**Q: 如何修改定时任务的执行时间?**

A: 编辑 `schedule-daily-collection.step.ts` 中的 `schedule` 字段,使用标准 Cron 表达式。

**Q: 如何备份数据库?**

A: 直接复制 `data/stock.db` 文件即可。建议定期备份到其他位置。

**Q: 如何查看任务执行历史?**

A: 多种方式:
1. Workbench **Traces** 标签 - 可视化查看所有 Step 执行历史
2. Workbench **Logs** 标签 - 实时日志流
3. API 查询 - `GET /api/task-logs`

**Q: 如何在生产环境运行?**

A: 参考 `docs/deployment.md`,关键步骤:

```bash
# 构建并使用 PM2 启动
npm run build
npm install -g pm2
pm2 start "npm run start" --name motia-stock-collector
pm2 startup && pm2 save
```

---

**Quick Start Complete!** 🎉

如有其他问题,请查看 `README.md` 或 `docs/` 目录。
