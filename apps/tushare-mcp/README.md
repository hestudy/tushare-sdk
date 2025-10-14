# Tushare MCP 服务器

基于 Model Context Protocol (MCP) 的 Tushare 数据服务器,为 AI 模型提供 A 股市场数据查询能力。

## 功能特性

- **股票行情查询**: 查询实时股票行情数据,包括最新价、涨跌幅、成交量等
- **财务数据查询**: 查询公司财务报表数据(利润表、资产负债表、现金流量表)
- **K线数据查询**: 查询历史 K 线数据,支持日线、周线、月线
- **市场指数查询**: 查询市场指数行情数据(上证指数、深证成指、创业板指等)

## 安装

### 前置要求

- Node.js >= 18.0.0
- 有效的 Tushare Token (从 [Tushare 官网](https://tushare.pro) 注册获取)

### 安装依赖

```bash
pnpm install
```

### 配置环境变量

复制 `.env.example` 文件为 `.env`,并配置您的 Tushare Token:

```bash
cp .env.example .env
```

编辑 `.env` 文件:

```env
TUSHARE_TOKEN=your_tushare_token_here
LOG_LEVEL=info
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
```

## 使用方法

### 构建项目

```bash
pnpm build
```

### 运行服务器

```bash
pnpm start
```

### Claude Desktop 配置

在 Claude Desktop 配置文件中添加以下配置:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "tushare": {
      "command": "node",
      "args": [
        "/absolute/path/to/tushare-sdk/apps/tushare-mcp/dist/index.js"
      ],
      "env": {
        "TUSHARE_TOKEN": "your_tushare_token_here"
      }
    }
  }
}
```

也可以使用 `npx` 方式:

```json
{
  "mcpServers": {
    "tushare": {
      "command": "npx",
      "args": [
        "-y",
        "@hestudy/tushare-mcp"
      ],
      "env": {
        "TUSHARE_TOKEN": "your_tushare_token_here"
      }
    }
  }
}
```

## 可用工具

### 1. query_stock_quote - 股票行情查询

查询实时股票行情数据。

**参数**:
- `ts_code` (必需): 股票代码,格式如 "600519.SH"
- `trade_date` (可选): 交易日期,格式如 "20251014"

**示例**:
```json
{
  "ts_code": "600519.SH",
  "trade_date": "20251014"
}
```

### 2. query_financial - 财务数据查询

查询公司财务报表数据。

**参数**:
- `ts_code` (必需): 股票代码,格式如 "600519.SH"
- `period` (必需): 报告期,格式如 "20231231" (季度末日期)
- `report_type` (必需): 报表类型,可选 "income"(利润表)、"balance"(资产负债表)、"cashflow"(现金流量表)

**示例**:
```json
{
  "ts_code": "600519.SH",
  "period": "20231231",
  "report_type": "income"
}
```

### 3. query_kline - K线数据查询

查询历史 K 线数据。

**参数**:
- `ts_code` (必需): 股票代码,格式如 "600519.SH"
- `start_date` (必需): 开始日期,格式如 "20251001"
- `end_date` (必需): 结束日期,格式如 "20251014"
- `freq` (可选): K线频率,可选 "D"(日线)、"W"(周线)、"M"(月线),默认 "D"

**示例**:
```json
{
  "ts_code": "600519.SH",
  "start_date": "20251001",
  "end_date": "20251014",
  "freq": "D"
}
```

### 4. query_index - 市场指数查询

查询市场指数行情数据。

**参数**:
- `ts_code` (必需): 指数代码,如 "000001.SH"(上证指数)
- `trade_date` (可选): 交易日期,格式如 "20251014"

**常用指数代码**:
- `000001.SH`: 上证指数
- `399001.SZ`: 深证成指
- `399006.SZ`: 创业板指
- `000300.SH`: 沪深300
- `000016.SH`: 上证50

**示例**:
```json
{
  "ts_code": "000001.SH"
}
```

## 开发

### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行单元测试
pnpm test tests/unit

# 运行集成测试
pnpm test tests/integration
```

### 类型检查

```bash
pnpm type-check
```

### 代码格式化

```bash
pnpm format
pnpm lint
```

## 项目结构

```
apps/tushare-mcp/
├── src/
│   ├── index.ts              # 入口文件
│   ├── server.ts             # MCP 服务器配置
│   ├── config/               # 配置管理
│   ├── types/                # TypeScript 类型定义
│   ├── utils/                # 工具函数(日志、错误处理、限流等)
│   ├── tools/                # MCP 工具定义
│   └── handlers/             # 工具处理器实现
├── tests/
│   ├── unit/                 # 单元测试
│   └── integration/          # 集成测试
├── package.json
├── tsconfig.json
└── README.md
```

## 限流说明

默认限流配置:
- 最大请求数: 100 次/分钟
- 时间窗口: 60 秒

可通过环境变量调整:
```env
RATE_LIMIT_MAX_REQUESTS=200
RATE_LIMIT_WINDOW_MS=60000
```

## 错误处理

服务器会自动处理以下错误类型:
- `VALIDATION_ERROR`: 参数格式错误
- `AUTH_ERROR`: Tushare Token 无效或积分不足
- `RATE_LIMIT`: 请求频率超限
- `DATA_NOT_FOUND`: 数据不存在
- `NETWORK_ERROR`: 网络请求失败

所有错误消息都是用户友好的自然语言描述。

## 许可证

MIT

## 相关链接

- [Tushare Pro](https://tushare.pro)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Claude Desktop](https://claude.ai/download)
