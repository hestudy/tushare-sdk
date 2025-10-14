# Data Model: MCP 服务补充 SDK 未集成功能

**Feature**: 016-sdk-mcp
**Date**: 2025-10-14
**Status**: Phase 1 Design

## 概述

本文档定义了三个新增 MCP 工具所涉及的数据实体和它们之间的关系。所有数据模型复用 SDK 已定义的类型,不引入新的数据结构。

## 核心实体

### 1. StockBasicItem (股票基本信息)

**来源**: `packages/tushare-sdk/src/models/stock.ts`

**用途**: 表示一只股票的基础属性,用于股票基本信息查询工具

**字段定义**:

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| `ts_code` | string | ✅ | TS股票代码 | "600519.SH" |
| `symbol` | string | ✅ | 股票代码(不含后缀) | "600519" |
| `name` | string | ✅ | 股票名称 | "贵州茅台" |
| `area` | string | ✅ | 地域 | "贵州" |
| `industry` | string | ✅ | 所属行业 | "白酒" |
| `fullname` | string | ❌ | 股票全称 | "贵州茅台酒股份有限公司" |
| `enname` | string | ❌ | 英文全称 | "Kweichow Moutai Co.,Ltd." |
| `cnspell` | string | ❌ | 拼音缩写 | "gzmt" |
| `market` | string | ✅ | 市场类型 | "主板" |
| `exchange` | string | ✅ | 交易所代码 | "SSE" |
| `curr_type` | string | ❌ | 交易货币 | "CNY" |
| `list_status` | string | ✅ | 上市状态 | "L" (L上市/D退市/P暂停) |
| `list_date` | string | ✅ | 上市日期 | "20010827" |
| `delist_date` | string | ❌ | 退市日期 | "20200101" |
| `is_hs` | string | ❌ | 是否沪深港通 | "H" (N否/H沪股通/S深股通) |

**业务规则**:
- `list_status` 决定股票是否可交易:
  - `L` (Listed): 正常上市,可交易
  - `D` (Delisted): 已退市,不可交易
  - `P` (Paused): 暂停上市
- `is_hs` 标识是否为互联互通标的(重要性较低,可不展示)

**关系**:
- 一对多 → `DailyBasicItem`: 一只股票有多个交易日的技术指标
- 一对多 → `DailyQuoteItem`: 一只股票有多个交易日的行情数据

---

### 2. TradeCalItem (交易日历)

**来源**: `packages/tushare-sdk/src/models/calendar.ts`

**用途**: 表示交易所某一天的交易状态,用于交易日历查询工具

**字段定义**:

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| `exchange` | string | ✅ | 交易所代码 | "SSE" |
| `cal_date` | string | ✅ | 日历日期 (YYYYMMDD) | "20251014" |
| `is_open` | string | ✅ | 是否交易日 | "1" (0休市/1交易) |
| `pretrade_date` | string | ❌ | 上一个交易日 | "20251013" |

**业务规则**:
- `is_open` 决定是否可查询行情数据:
  - `"1"`: 交易日,可查询当日行情
  - `"0"`: 休市日(周末/节假日),无行情数据
- 沪深两市的交易日历完全一致,只需查询 `SSE` 即可

**关系**:
- 被引用 → `DailyBasicItem`: 每日技术指标仅在交易日有数据
- 被引用 → `DailyQuoteItem`: 行情数据仅在交易日有数据

**特殊场景**:
- 节假日调休: `is_open = "1"` 但 `cal_date` 为周末(如2025年春节调休)
- 临时休市: `is_open = "0"` 但 `cal_date` 为工作日(如重大事件)

---

### 3. DailyBasicItem (每日技术指标)

**来源**: `packages/tushare-sdk/src/models/daily-basic.ts`

**用途**: 表示股票某个交易日的技术分析指标,用于每日技术指标查询工具

**字段定义**:

| 字段名 | 类型 | 必填 | 说明 | 单位 | 示例 |
|--------|------|------|------|------|------|
| `ts_code` | string | ✅ | TS股票代码 | - | "600519.SH" |
| `trade_date` | string | ✅ | 交易日期 | YYYYMMDD | "20251014" |
| `close` | number | ✅ | 当日收盘价 | 元 | 1800.50 |
| `turnover_rate` | number | ❌ | 换手率 | % | 0.85 |
| `turnover_rate_f` | number | ❌ | 换手率(自由流通) | % | 1.20 |
| `volume_ratio` | number | ❌ | 量比 | - | 1.15 |
| `pe` | number | ❌ | 市盈率(总市值/净利润TTM) | 倍 | 35.60 |
| `pe_ttm` | number | ❌ | 市盈率TTM | 倍 | 36.20 |
| `pb` | number | ❌ | 市净率 | 倍 | 12.30 |
| `ps` | number | ❌ | 市销率 | 倍 | 10.50 |
| `ps_ttm` | number | ❌ | 市销率TTM | 倍 | 10.80 |
| `dv_ratio` | number | ❌ | 股息率 | % | 1.50 |
| `dv_ttm` | number | ❌ | 股息率TTM | % | 1.60 |
| `total_share` | number | ✅ | 总股本 | 万股 | 125619 |
| `float_share` | number | ❌ | 流通股本 | 万股 | 125619 |
| `free_share` | number | ❌ | 自由流通股本 | 万股 | 100000 |
| `total_mv` | number | ✅ | 总市值 | 万元 | 22612420 |
| `circ_mv` | number | ❌ | 流通市值 | 万元 | 22612420 |

**业务规则**:
- **PE/PB 特殊情况**:
  - 新股上市初期可能为 `null` 或 `0` (无历史利润/净资产数据)
  - 亏损股 PE 为负数或无意义,应显示 "N/A"
- **换手率计算**:
  - `turnover_rate`: 基于总股本
  - `turnover_rate_f`: 基于自由流通股本(更准确)
- **市值单位**: 万元 → 格式化时转换为亿元显示

**关系**:
- 多对一 → `StockBasicItem`: 每条记录属于一只股票
- 多对一 → `TradeCalItem`: 每条记录对应一个交易日

**数据质量**:
- ❌ 必填字段缺失 → SDK 层已处理,不会出现
- ⚠️ 可选字段为 `null` → 需在格式化时处理,显示 "N/A"

---

## 输入参数模型

### StockBasicParams (股票基本信息查询参数)

**来源**: `packages/tushare-sdk/src/models/stock.ts`

```typescript
interface StockBasicParams {
  ts_code?: string;        // 股票代码 (如 600519.SH)
  name?: string;           // 股票名称 (如 "贵州茅台")
  exchange?: string;       // 交易所 (SSE/SZSE)
  market?: string;         // 市场类别
  is_hs?: string;         // 是否沪深港通
  list_status?: string;    // 上市状态 (L/D/P)
  fields?: string;         // 指定返回字段
}
```

**验证规则**:
- 至少提供一个筛选条件(不允许无参数查询全市场)
- `ts_code` 格式: `^\d{6}\.(SH|SZ)$`
- `exchange` 枚举: `SSE` | `SZSE`
- `list_status` 枚举: `L` | `D` | `P`

---

### TradeCalParams (交易日历查询参数)

**来源**: `packages/tushare-sdk/src/models/calendar.ts`

```typescript
interface TradeCalParams {
  exchange?: string;       // 交易所 (默认 SSE)
  start_date?: string;     // 开始日期 (YYYYMMDD)
  end_date?: string;       // 结束日期 (YYYYMMDD)
  is_open?: string;        // 是否交易日 ('0'/'1')
}
```

**验证规则**:
- `start_date` 和 `end_date` 必须同时提供
- 日期格式: `^\d{8}$`
- 日期范围: `end_date - start_date ≤ 365 天`
- `start_date` 不能晚于 `end_date`

---

### DailyBasicParams (每日技术指标查询参数)

**来源**: `packages/tushare-sdk/src/models/daily-basic.ts`

```typescript
interface DailyBasicParams {
  ts_code?: string;        // 股票代码 (必填)
  trade_date?: string;     // 单日查询
  start_date?: string;     // 范围查询开始日期
  end_date?: string;       // 范围查询结束日期
  fields?: string;         // 指定返回字段
}
```

**验证规则**:
- `ts_code` 必填
- `trade_date` 与 (`start_date` + `end_date`) 二选一
- 日期格式: `^\d{8}$`
- 日期范围: `end_date - start_date ≤ 90 天`

---

## 输出响应模型

### ToolCallResponse (统一响应结构)

**来源**: `apps/tushare-mcp/src/types/mcp-tools.types.ts`

```typescript
interface ToolCallResponse {
  content: TextContent[];         // 文本内容(必填)
  structuredContent?: unknown;    // 结构化数据(可选)
  isError?: boolean;              // 是否错误响应
}

interface TextContent {
  type: 'text';
  text: string;                   // 格式化的用户友好文本
}
```

**业务规则**:
- `content` 包含用户可读的格式化文本
- `structuredContent` 包含原始 SDK 返回的数据(供 AI 编程式处理)
- `isError = true` 时,`content` 包含错误消息,无 `structuredContent`

---

## 数据流图

```
用户请求 (自然语言)
    ↓
AI 客户端 (解析意图)
    ↓
MCP Server (工具路由)
    ↓
Handler (参数验证)
    ↓
SDK API (调用 Tushare)
    ↓
SDK 返回 (原始数据)
    ↓
Handler (格式化)
    ↓
ToolCallResponse
    ├── content: TextContent[]        → 用户可读文本
    └── structuredContent: Entity[]   → 原始数据
```

---

## 数据转换规则

### 日期格式转换

```typescript
// 输入: YYYYMMDD (SDK 格式)
"20251014"

// 输出: YYYY-MM-DD (用户友好格式)
"2025-10-14"

// 实现:
const formattedDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
```

---

### 数值格式转换

```typescript
// 市值转换: 万元 → 亿元
const total_mv_yuan = 22612420;  // 万元
const total_mv_yi = (total_mv_yuan / 10000).toFixed(2);  // "2261.24" 亿元

// 成交额转换: 千元 → 亿元
const amount_qian = 500000;  // 千元
const amount_yi = (amount_qian / 100000).toFixed(2);  // "5.00" 亿元

// 百分比格式化
const pct_chg = 2.35;
const formatted = `${pct_chg >= 0 ? '+' : ''}${pct_chg.toFixed(2)}%`;  // "+2.35%"

// 大数值千分位分隔
const vol = 1234567;
const formatted = vol.toLocaleString();  // "1,234,567"
```

---

### 空值处理规则

| 原始值 | 含义 | 显示值 |
|--------|------|--------|
| `null` | 数据未披露 | "N/A" |
| `0` (PE/PB) | 无意义值 | "N/A (亏损)" |
| `undefined` | 字段不存在 | "暂无数据" |
| `[]` (空数组) | 查询无结果 | 抛出 `DATA_NOT_FOUND` 错误 |

---

## 数据完整性约束

### 必填字段检查

**在 Handler 层实现**:

```typescript
// 股票基本信息
if (!data.ts_code || !data.name || !data.industry) {
  throw new Error('数据不完整,缺少必填字段');
}

// 交易日历
if (!data.cal_date || !data.is_open) {
  throw new Error('交易日历数据不完整');
}

// 每日技术指标
if (!data.ts_code || !data.trade_date || !data.total_mv) {
  throw new Error('技术指标数据不完整');
}
```

---

### 数据范围约束

**在参数验证层实现** (zod schema):

```typescript
// 日期必须为 8 位数字
z.string().regex(/^\d{8}$/)

// 股票代码必须为 6 位数字 + 市场后缀
z.string().regex(/^\d{6}\.(SH|SZ)$/)

// 上市状态必须为枚举值
z.enum(['L', 'D', 'P'])
```

---

## 索引和查询优化

**本功能不涉及本地存储,无需索引设计**。

所有数据查询直接调用 Tushare API,优化策略:
1. 限制单次查询的日期范围(交易日历 ≤ 1年,技术指标 ≤ 3个月)
2. 使用 `fields` 参数仅返回必要字段(减少数据传输量)
3. 依赖现有限流机制避免 API 过载

---

## 版本兼容性

### SDK 版本依赖

- **最低版本**: `@hestudy/tushare-sdk@1.0.0`
- **API 兼容性**:
  - `getStockBasic()` - 稳定 API,无版本依赖
  - `getTradeCalendar()` - 稳定 API,无版本依赖
  - `getDailyBasic()` - 稳定 API,无版本依赖

### 数据模型变更策略

如果 Tushare 官方新增字段:
1. SDK 自动包含新字段(TypeScript 类型更新)
2. MCP Handler 不受影响(只使用核心字段)
3. `structuredContent` 自动包含新字段(透传原始数据)

---

## 测试数据

### 测试用例数据集

**股票基本信息**:
```typescript
// 正常股票
{ ts_code: '600519.SH', name: '贵州茅台', list_status: 'L' }

// 已退市股票
{ ts_code: '600000.SH', name: '某退市股', list_status: 'D', delist_date: '20200101' }

// 创业板股票
{ ts_code: '300750.SZ', name: '宁德时代', exchange: 'SZSE', market: '创业板' }
```

**交易日历**:
```typescript
// 正常交易日
{ exchange: 'SSE', cal_date: '20251014', is_open: '1' }

// 周末休市
{ exchange: 'SSE', cal_date: '20251012', is_open: '0' }

// 节假日
{ exchange: 'SSE', cal_date: '20251001', is_open: '0' }
```

**每日技术指标**:
```typescript
// 正常数据
{ ts_code: '600519.SH', trade_date: '20251014', pe: 35.60, pb: 12.30, total_mv: 22612420 }

// PE 为 null (新股)
{ ts_code: '301XXX.SZ', trade_date: '20251014', pe: null, pb: null, total_mv: 500000 }

// PE 为负数 (亏损股)
{ ts_code: '600XXX.SH', trade_date: '20251014', pe: -5.20, pb: 0.80, total_mv: 100000 }
```

---

**下一步**: 生成 API contracts
