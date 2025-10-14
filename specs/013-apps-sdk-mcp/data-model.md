# Data Model: Tushare MCP 服务器应用

**Feature**: Tushare MCP 服务器应用
**Date**: 2025-10-14
**Status**: Phase 1 Complete

## Overview

本文档定义 Tushare MCP 服务器的核心数据模型,包括 MCP Tool 实体、请求/响应结构、配置模型和错误类型。这些模型构成了服务器与 AI 客户端交互的数据契约基础。

## Core Entities

### 1. MCPTool (MCP 工具定义)

**Description**: 代表一个可供 AI 调用的功能单元,符合 MCP 协议规范。

**Fields**:

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| `name` | string | Yes | 工具唯一标识符,使用 snake_case 命名 | 正则: `^[a-z_][a-z0-9_]*$` |
| `description` | string | Yes | 工具功能描述,向 AI 解释用途 | 长度: 10-500 字符 |
| `inputSchema` | JSONSchema | Yes | 输入参数的 JSON Schema 定义 | 必须是有效的 JSON Schema Draft 7 |

**Relationships**:
- 一个 MCPTool 对应一个 ToolHandler(执行器)
- 多个 MCPTool 注册到一个 MCPServer

**State Transitions**:
```
[Registered] --> (server startup) --> [Available]
[Available] --> (server shutdown) --> [Unregistered]
```

**Example**:
```typescript
{
  name: "query_stock_quote",
  description: "查询实时股票行情数据,支持A股股票代码(如 600519.SH 贵州茅台)",
  inputSchema: {
    type: "object",
    properties: {
      ts_code: {
        type: "string",
        description: "股票代码,格式: 代码.市场后缀(如 600519.SH)"
      },
      trade_date: {
        type: "string",
        description: "交易日期,格式: YYYYMMDD,可选,默认最新交易日"
      }
    },
    required: ["ts_code"]
  }
}
```

---

### 2. ToolRequest (工具调用请求)

**Description**: AI 客户端发起的工具调用请求,遵循 MCP JSON-RPC 协议。

**Fields**:

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| `method` | string | Yes | 固定值 "tools/call" | 枚举: `["tools/call"]` |
| `params.name` | string | Yes | 要调用的工具名称 | 必须是已注册的 MCPTool.name |
| `params.arguments` | object | Yes | 工具输入参数 | 必须符合对应 MCPTool.inputSchema |

**Relationships**:
- 一个 ToolRequest 触发一个 ToolHandler 执行
- 执行成功返回一个 ToolResponse
- 执行失败返回一个 ToolError

**Validation Rules**:
- `params.arguments` 必须通过 Zod schema 验证
- 股票代码格式: `^\d{6}\.(SH|SZ)$`
- 日期格式: `^\d{8}$` (YYYYMMDD)
- 报告期格式: `^\d{4}(03|06|09|12)31$` (季度末日期)

**Example**:
```json
{
  "method": "tools/call",
  "params": {
    "name": "query_stock_quote",
    "arguments": {
      "ts_code": "600519.SH",
      "trade_date": "20251014"
    }
  }
}
```

---

### 3. ToolResponse (工具调用响应)

**Description**: 工具执行成功后返回的结构化响应,包含文本和结构化数据。

**Fields**:

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| `content` | TextContent[] | Yes | 文本内容数组,向用户展示 | 至少包含一个 TextContent |
| `structuredContent` | object | No | 结构化数据,供 AI 编程式处理 | 可选,建议提供 |
| `isError` | boolean | No | 是否为错误响应 | 默认 false |

**TextContent Structure**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | 固定值 "text" |
| `text` | string | Yes | 文本内容 |

**Relationships**:
- 一个 ToolRequest 产生一个 ToolResponse
- ToolResponse 包含来自 Tushare SDK 的原始数据(经过格式化)

**Example**:
```json
{
  "content": [
    {
      "type": "text",
      "text": "股票 600519.SH (贵州茅台) 2025-10-14 行情:\n- 收盘价: 1888.00 元\n- 涨跌幅: +2.35%\n- 成交量: 1234567 手\n- 成交额: 23.45 亿元"
    }
  ],
  "structuredContent": {
    "ts_code": "600519.SH",
    "trade_date": "20251014",
    "close": 1888.00,
    "pct_chg": 2.35,
    "vol": 1234567,
    "amount": 2345000
  }
}
```

---

### 4. ToolError (工具调用错误)

**Description**: 工具执行失败时返回的错误响应,提供用户友好的错误消息。

**Fields**:

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| `content` | TextContent[] | Yes | 错误描述文本 | 必须是自然语言,不能包含堆栈信息 |
| `isError` | boolean | Yes | 固定值 true | 必须为 true |
| `errorCode` | string | No | 错误分类代码 | 枚举: `["AUTH_ERROR", "RATE_LIMIT", "DATA_NOT_FOUND", "NETWORK_ERROR", "VALIDATION_ERROR"]` |

**Error Categories**:

| Error Code | Trigger Condition | User Message Template | Actionable Advice |
|------------|-------------------|----------------------|-------------------|
| `AUTH_ERROR` | Tushare Token 无效或过期 | "Tushare Token 无效或已过期" | 检查环境变量 TUSHARE_TOKEN |
| `RATE_LIMIT` | 触发频率限制(客户端或 Tushare 服务端) | "请求过于频繁,已触发限流保护" | 稍后重试(1分钟后自动恢复) |
| `DATA_NOT_FOUND` | 股票代码不存在或时间范围无数据 | "未找到相关数据" | 检查股票代码或日期范围 |
| `NETWORK_ERROR` | 网络超时或 Tushare 服务不可用 | "网络请求超时,Tushare 服务暂时不可用" | 稍后重试 |
| `VALIDATION_ERROR` | 参数格式错误或缺少必填参数 | "参数格式错误: [具体字段]" | 参考工具文档修正参数 |

**Example**:
```json
{
  "content": [
    {
      "type": "text",
      "text": "Tushare Token 无效或已过期,请检查环境变量 TUSHARE_TOKEN 配置"
    }
  ],
  "isError": true,
  "errorCode": "AUTH_ERROR"
}
```

---

### 5. ServerConfiguration (服务器配置)

**Description**: MCP 服务器的运行时配置,从环境变量或配置文件加载。

**Fields**:

| Field | Type | Required | Description | Default Value | Validation Rules |
|-------|------|----------|-------------|---------------|------------------|
| `tushareToken` | string | Yes | Tushare API Token | N/A | 长度 >= 32 字符 |
| `logLevel` | string | No | 日志级别 | "info" | 枚举: `["debug", "info", "warn", "error"]` |
| `rateLimitMaxRequests` | number | No | 限流:时间窗口内最大请求数 | 100 | 范围: 1-1000 |
| `rateLimitWindowMs` | number | No | 限流:时间窗口大小(毫秒) | 60000 | 范围: 1000-600000 |
| `requestTimeoutMs` | number | No | Tushare API 请求超时(毫秒) | 30000 | 范围: 5000-120000 |

**Configuration Sources** (优先级从高到低):
1. 环境变量:
   - `TUSHARE_TOKEN`
   - `LOG_LEVEL`
   - `RATE_LIMIT_MAX_REQUESTS`
   - `RATE_LIMIT_WINDOW_MS`
   - `REQUEST_TIMEOUT_MS`
2. 配置文件: `.env` (使用 dotenv 加载)
3. 默认值

**Validation Rules**:
- `tushareToken` 缺失时,服务器启动失败,返回错误:"Missing required environment variable: TUSHARE_TOKEN"
- 所有数值型配置超出范围时,使用默认值并记录警告日志

**Example** (.env 文件):
```env
TUSHARE_TOKEN=your_32_character_token_here
LOG_LEVEL=debug
RATE_LIMIT_MAX_REQUESTS=50
RATE_LIMIT_WINDOW_MS=60000
REQUEST_TIMEOUT_MS=15000
```

---

### 6. StockQuoteData (股票行情数据)

**Description**: 从 Tushare SDK 获取的股票实时行情数据,映射到 MCP Tool 响应。

**Fields** (对应 Tushare `stock.daily()` 接口返回):

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `ts_code` | string | 股票代码 | "600519.SH" |
| `trade_date` | string | 交易日期(YYYYMMDD) | "20251014" |
| `open` | number | 开盘价(元) | 1850.50 |
| `high` | number | 最高价(元) | 1900.00 |
| `low` | number | 最低价(元) | 1845.00 |
| `close` | number | 收盘价(元) | 1888.00 |
| `pre_close` | number | 前收盘价(元) | 1845.00 |
| `change` | number | 涨跌额(元) | 43.00 |
| `pct_chg` | number | 涨跌幅(%) | 2.35 |
| `vol` | number | 成交量(手) | 1234567 |
| `amount` | number | 成交额(千元) | 2345000 |

**Data Transformations**:
- `amount` 需要除以 1000 转换为"亿元"单位展示给用户
- `vol` 需要乘以 100 转换为"手"单位(Tushare 返回单位是"百股")

---

### 7. FinancialData (财务数据)

**Description**: 从 Tushare SDK 获取的公司财务报表数据。

**Sub-types**:

#### 7.1 IncomeStatement (利润表)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `ts_code` | string | 股票代码 | "600519.SH" |
| `end_date` | string | 报告期(YYYYMMDD) | "20231231" |
| `total_revenue` | number | 营业总收入(元) | 149371000000 |
| `revenue` | number | 营业收入(元) | 149371000000 |
| `operate_profit` | number | 营业利润(元) | 89371000000 |
| `total_profit` | number | 利润总额(元) | 89500000000 |
| `n_income` | number | 净利润(元) | 74982000000 |
| `gross_margin` | number | 毛利率(%) | 91.50 |

#### 7.2 BalanceSheet (资产负债表)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `ts_code` | string | 股票代码 | "600519.SH" |
| `end_date` | string | 报告期(YYYYMMDD) | "20231231" |
| `total_assets` | number | 总资产(元) | 280000000000 |
| `total_cur_assets` | number | 流动资产合计(元) | 180000000000 |
| `total_liab` | number | 负债合计(元) | 80000000000 |
| `total_hldr_eqy_exc_min_int` | number | 股东权益合计(元) | 200000000000 |

#### 7.3 CashFlowStatement (现金流量表)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `ts_code` | string | 股票代码 | "600519.SH" |
| `end_date` | string | 报告期(YYYYMMDD) | "20231231" |
| `n_cashflow_act` | number | 经营活动现金流量净额(元) | 70000000000 |
| `n_cashflow_inv_act` | number | 投资活动现金流量净额(元) | -20000000000 |
| `n_cash_flows_fnc_act` | number | 筹资活动现金流量净额(元) | -30000000000 |

**Data Transformations**:
- 所有金额需要除以 100000000 转换为"亿元"单位展示
- 报告期日期需要转换为可读格式:"2023-12-31 (2023年报)"

---

### 8. KLineData (K线数据)

**Description**: 从 Tushare SDK 获取的历史 K 线时间序列数据。

**Fields**:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `ts_code` | string | 股票代码 | "600519.SH" |
| `trade_date` | string | 交易日期(YYYYMMDD) | "20251014" |
| `open` | number | 开盘价(元) | 1850.50 |
| `high` | number | 最高价(元) | 1900.00 |
| `low` | number | 最低价(元) | 1845.00 |
| `close` | number | 收盘价(元) | 1888.00 |
| `vol` | number | 成交量(手) | 1234567 |
| `amount` | number | 成交额(千元) | 2345000 |

**Array Structure**:
- 返回按日期升序排列的 K 线数组
- 数组长度由查询时间范围决定
- 文本展示格式:"[日期] 开:X 高:X 低:X 收:X 量:X"

**Example**:
```json
[
  {
    "ts_code": "600519.SH",
    "trade_date": "20251001",
    "open": 1800.00,
    "high": 1820.00,
    "low": 1795.00,
    "close": 1810.00,
    "vol": 980000,
    "amount": 1770000
  },
  {
    "ts_code": "600519.SH",
    "trade_date": "20251002",
    "open": 1810.00,
    "high": 1850.00,
    "low": 1805.00,
    "close": 1845.00,
    "vol": 1120000,
    "amount": 2050000
  }
]
```

---

### 9. IndexData (指数数据)

**Description**: 从 Tushare SDK 获取的市场指数行情数据。

**Fields**:

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `ts_code` | string | 指数代码 | "000001.SH" |
| `trade_date` | string | 交易日期(YYYYMMDD) | "20251014" |
| `close` | number | 收盘点位 | 3250.50 |
| `open` | number | 开盘点位 | 3200.00 |
| `high` | number | 最高点位 | 3260.00 |
| `low` | number | 最低点位 | 3195.00 |
| `pre_close` | number | 前收盘点位 | 3200.00 |
| `change` | number | 涨跌点数 | 50.50 |
| `pct_chg` | number | 涨跌幅(%) | 1.58 |
| `vol` | number | 成交量(手) | 350000000 |
| `amount` | number | 成交额(千元) | 450000000 |

**Common Index Codes**:
- `000001.SH`: 上证指数
- `399001.SZ`: 深证成指
- `399006.SZ`: 创业板指
- `000300.SH`: 沪深300
- `000016.SH`: 上证50

---

## Data Flow Diagrams

### Tool Call Flow

```
AI Client                MCP Server              Tushare SDK
    |                         |                         |
    |--ToolRequest----------->|                         |
    |  (query_stock_quote)    |                         |
    |                         |--Validate Parameters--->|
    |                         |                         |
    |                         |--SDK Call: stock.daily->|
    |                         |                         |
    |                         |<--StockQuoteData--------|
    |                         |                         |
    |                         |--Format Response------->|
    |<--ToolResponse----------|                         |
    |  (text + structured)    |                         |
```

### Error Handling Flow

```
AI Client                MCP Server              Tushare SDK
    |                         |                         |
    |--ToolRequest----------->|                         |
    |                         |--SDK Call-------------->|
    |                         |                         |
    |                         |<--HTTP 403 (Auth Fail)--|
    |                         |                         |
    |                         |--Classify Error-------->|
    |                         |  (errorCode: AUTH_ERROR)|
    |                         |                         |
    |<--ToolError-------------|                         |
    |  (user-friendly message)|                         |
```

---

## TypeScript Type Definitions

```typescript
// MCP Tool Definition
export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: JSONSchema7;
}

// Tool Request/Response
export interface ToolCallRequest {
  method: "tools/call";
  params: {
    name: string;
    arguments: Record<string, unknown>;
  };
}

export interface ToolCallResponse {
  content: TextContent[];
  structuredContent?: unknown;
  isError?: boolean;
}

export interface TextContent {
  type: "text";
  text: string;
}

// Error Response
export type ErrorCode =
  | "AUTH_ERROR"
  | "RATE_LIMIT"
  | "DATA_NOT_FOUND"
  | "NETWORK_ERROR"
  | "VALIDATION_ERROR";

export interface ToolErrorResponse extends ToolCallResponse {
  isError: true;
  errorCode?: ErrorCode;
}

// Server Configuration
export interface ServerConfig {
  tushareToken: string;
  logLevel: "debug" | "info" | "warn" | "error";
  rateLimitMaxRequests: number;
  rateLimitWindowMs: number;
  requestTimeoutMs: number;
}

// Domain Data Models
export interface StockQuoteData {
  ts_code: string;
  trade_date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  pre_close: number;
  change: number;
  pct_chg: number;
  vol: number;
  amount: number;
}

export interface FinancialIncomeData {
  ts_code: string;
  end_date: string;
  total_revenue: number;
  revenue: number;
  operate_profit: number;
  total_profit: number;
  n_income: number;
  gross_margin: number;
}

export interface KLineDataPoint {
  ts_code: string;
  trade_date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  vol: number;
  amount: number;
}

export interface IndexData {
  ts_code: string;
  trade_date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  pre_close: number;
  change: number;
  pct_chg: number;
  vol: number;
  amount: number;
}
```

---

## Validation Rules Summary

| Entity | Field | Validation Rule | Error Message |
|--------|-------|-----------------|---------------|
| ToolRequest | `params.arguments.ts_code` | `/^\d{6}\.(SH\|SZ)$/` | "股票代码格式错误,示例: 600519.SH" |
| ToolRequest | `params.arguments.trade_date` | `/^\d{8}$/` | "交易日期格式错误,示例: 20251014" |
| ToolRequest | `params.arguments.start_date` | `/^\d{8}$/` | "开始日期格式错误,示例: 20250101" |
| ToolRequest | `params.arguments.end_date` | `/^\d{8}$/` 且 >= start_date | "结束日期必须晚于或等于开始日期" |
| ServerConfig | `tushareToken` | 长度 >= 32 | "Tushare Token 格式无效" |
| ServerConfig | `rateLimitMaxRequests` | 1 <= value <= 1000 | "限流配置无效,使用默认值 100" |

---

**Data Model Complete**: 2025-10-14
**Next Step**: 生成 contracts/ 目录,定义每个工具的 JSON Schema 契约
