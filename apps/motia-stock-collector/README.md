# Motia 股市数据采集应用

基于 Motia 框架的 A 股市场数据自动采集与存储应用。

## 功能特性

- 📊 **自动数据采集**: 定时采集 A 股日线行情数据
- 📅 **交易日历维护**: 自动管理交易日历，智能跳过非交易日
- 💾 **本地数据存储**: 使用 SQLite 存储历史数据，支持复杂查询
- 📤 **数据导出**: 支持 CSV/JSON 格式导出
- 🔄 **自动重试**: 内置容错和重试机制，应对 API 限流
- 📈 **可视化监控**: Motia Workbench 提供任务执行监控

## 快速开始

### 环境要求

- Node.js 18+ LTS
- npm 或 pnpm
- Tushare Pro API Token ([免费注册](https://tushare.pro/register))

### 安装

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入你的 TUSHARE_TOKEN
```

### 运行

```bash
# 开发模式（启动 Workbench）
npm run dev

# 生产模式
npm start
```

访问 Workbench: http://localhost:3000

## 项目结构

```
apps/motia-stock-collector/
├── steps/              # Motia Steps (业务逻辑)
├── lib/                # 共享服务和工具
├── types/              # TypeScript 类型定义
├── tests/              # 测试文件
│   ├── unit/           # 单元测试
│   └── integration/    # 集成测试
├── data/               # SQLite 数据库文件
├── motia.config.ts     # Motia 配置
└── .env.example        # 环境变量示例
```

## 核心 Steps

- **ScheduleDailyCollection**: 定时触发采集任务（每日 17:00）
- **CollectDailyQuotes**: 采集日线行情数据
- **CollectTradeCalendar**: 采集交易日历
- **QueryQuotesAPI**: 查询历史行情接口
- **ExportData**: 数据导出接口

## API 接口

### 查询行情数据

```bash
GET /api/quotes?tsCode=600519.SH&startDate=2024-01-01&endDate=2024-12-31&limit=100
```

### 导出数据

```bash
GET /api/export?format=csv&tsCode=600519.SH&startDate=2024-01-01&endDate=2024-12-31
```

## 测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage
```

## 配置说明

主要环境变量：

- `TUSHARE_TOKEN`: Tushare API Token (必填)
- `DATABASE_PATH`: SQLite 数据库文件路径
- `LOG_LEVEL`: 日志级别 (debug/info/warn/error)
- `RATE_LIMIT_CONCURRENT`: API 并发请求数限制
- `WORKBENCH_PORT`: Workbench 端口

详见 `.env.example`

## 数据备份

```bash
# 备份数据库
cp ./data/stock.db ./data/backups/stock_$(date +%Y%m%d).db
```

## 技术栈

- **框架**: Motia (事件驱动架构)
- **语言**: TypeScript 5.x
- **数据源**: Tushare Pro API
- **存储**: SQLite (better-sqlite3)
- **测试**: Vitest

## License

MIT

## 相关链接

- [Motia 文档](https://motia.dev)
- [Tushare Pro](https://tushare.pro)
- [项目规范](../../specs/017-/)
