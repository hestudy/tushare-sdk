# Research: MCP 服务补充 SDK 未集成功能

**Feature**: 016-sdk-mcp
**Date**: 2025-10-14
**Status**: Phase 0 Complete

## 研究目的

本文档记录了在实现"将 SDK 中未集成至 MCP 的功能进行补充"时的技术调研结果。主要解决以下问题:

1. **已实现的 MCP 工具模式**: 如何复用现有架构和最佳实践
2. **SDK API 接口分析**: 确认三个目标 API 的参数、返回值和使用方式
3. **数据格式化策略**: 确定如何将 SDK 返回的数据转换为用户友好的文本
4. **边界情况处理**: 识别并规划特殊场景的处理逻辑

## 研究发现

### 1. 现有 MCP 工具实现模式

**决策**: 遵循现有的 4 层架构模式

**分析**:
通过研究 `stock-quote.handler.ts`,确认了以下标准模式:

```typescript
// 层级 1: 工具定义 (tools/*.ts)
export const toolDefinition: MCPToolDefinition = {
  name: 'query_xxx',
  description: '...',
  inputSchema: { /* JSON Schema */ }
};

// 层级 2: 处理器 (handlers/*.handler.ts)
export async function handleXXX(args: unknown): Promise<ToolCallResponse> {
  try {
    // 步骤 1: 参数验证 (使用 zod)
    const validated = ArgsSchema.parse(args);

    // 步骤 2: 调用 SDK
    const client = new TushareClient({ token: process.env.TUSHARE_TOKEN });
    const response = await client.getXXX(validated);

    // 步骤 3: 数据检查
    if (!response || response.length === 0) {
      throw new Error('...');
    }

    // 步骤 4: 格式化响应
    const text = formatXXXText(response[0]);

    // 步骤 5: 返回结构化响应
    return {
      content: [{ type: 'text', text }],
      structuredContent: response[0]
    };
  } catch (error) {
    // 步骤 6: 统一错误处理
    return handleTushareError(error);
  }
}

// 层级 3: 格式化函数 (handlers/*.handler.ts 内部)
function formatXXXText(data: XXXData): string {
  // 格式化逻辑
}
```

**理由**: 这种模式已被验证,符合 MCP 规范,易于测试和维护。

**备选方案**: 考虑将格式化函数抽取到 `utils/formatter.ts` → **拒绝**,因为每个工具的格式化逻辑差异较大,集中管理反而增加复杂度。

---

### 2. 三个目标 API 的技术分析

#### 2.1 股票基本信息查询 (`stock_basic`)

**SDK API**: `getStockBasic(client, params?: StockBasicParams)`

**参数分析**:
```typescript
interface StockBasicParams {
  ts_code?: string;        // 股票代码 (如 600519.SH)
  name?: string;           // 股票名称 (如"贵州茅台")
  exchange?: string;       // 交易所代码 (SSE/SZSE)
  market?: string;         // 市场类别 (主板/创业板/科创板)
  is_hs?: string;         // 是否沪深港通标的 (N/H/S)
  list_status?: string;    // 上市状态 (L上市/D退市/P暂停上市)
  fields?: string;         // 指定返回字段
}
```

**返回类型**: `StockBasicItem[]`
```typescript
interface StockBasicItem {
  ts_code: string;         // TS代码
  symbol: string;          // 股票代码
  name: string;            // 股票名称
  area: string;            // 地域
  industry: string;        // 所属行业
  market: string;          // 市场类型
  list_date: string;       // 上市日期
  // ... 其他字段
}
```

**MCP 工具设计决策**:
- 工具名称: `query_stock_basic`
- 核心参数: `ts_code` (可选) - 如果不提供,返回所有股票列表(需分页处理)
- 辅助参数: `exchange`, `list_status` - 用于筛选
- 格式化策略:
  - 单个股票: 显示完整信息(代码、名称、行业、上市日期等)
  - 多个股票: 显示简化列表(代码 + 名称),限制返回数量(如前 50 条)

**边界情况**:
1. 无参数调用 → 返回"请至少提供一个筛选条件(股票代码、交易所或上市状态)"
2. 无效股票代码 → SDK 返回空数组 → 提示"未找到该股票"
3. 已退市股票 → 正常返回数据,但在文本中标注"已退市"

---

#### 2.2 交易日历查询 (`trade_cal`)

**SDK API**: `getTradeCalendar(client, params?: TradeCalParams)`

**参数分析**:
```typescript
interface TradeCalParams {
  exchange?: string;       // 交易所 (SSE上交所/SZSE深交所/CFFEX中金所等)
  start_date?: string;     // 开始日期 (YYYYMMDD)
  end_date?: string;       // 结束日期 (YYYYMMDD)
  is_open?: string;        // 是否交易 ('0'休市 '1'交易)
}
```

**返回类型**: `TradeCalItem[]`
```typescript
interface TradeCalItem {
  exchange: string;        // 交易所
  cal_date: string;        // 日历日期 (YYYYMMDD)
  is_open: string;         // 是否交易 (0/1)
  pretrade_date?: string;  // 上一交易日
}
```

**MCP 工具设计决策**:
- 工具名称: `query_trade_calendar`
- 核心参数: `start_date`, `end_date` (必填)
- 辅助参数: `exchange` (默认 SSE,沪深两市日历相同)
- 验证逻辑:
  - 日期范围不超过 1 年(符合 spec.md 要求)
  - 日期格式必须为 YYYYMMDD
- 格式化策略:
  - 单日查询: "2025-10-14 是交易日" 或 "2025-10-14 休市(周末)"
  - 范围查询: 列出所有交易日,格式为 "2025-10-14 (周一)"

**边界情况**:
1. 日期范围超过 1 年 → 提前验证并拒绝
2. 起始日期晚于结束日期 → 提前验证并提示
3. 未来日期 → 允许查询(Tushare 提供未来节假日安排)

---

#### 2.3 每日技术指标查询 (`daily_basic`)

**SDK API**: `getDailyBasic(client, params?: DailyBasicParams)`

**参数分析**:
```typescript
interface DailyBasicParams {
  ts_code?: string;        // 股票代码
  trade_date?: string;     // 交易日期 (YYYYMMDD)
  start_date?: string;     // 开始日期
  end_date?: string;       // 结束日期
  fields?: string;         // 指定返回字段
}
```

**返回类型**: `DailyBasicItem[]`
```typescript
interface DailyBasicItem {
  ts_code: string;         // TS代码
  trade_date: string;      // 交易日期
  close: number;           // 当日收盘价
  turnover_rate: number;   // 换手率(%)
  turnover_rate_f: number; // 换手率(自由流通股)
  volume_ratio: number;    // 量比
  pe: number;              // 市盈率(总市值/净利润TTM)
  pe_ttm: number;          // 市盈率(TTM)
  pb: number;              // 市净率(总市值/净资产)
  ps: number;              // 市销率
  ps_ttm: number;          // 市销率(TTM)
  dv_ratio: number;        // 股息率(%)
  dv_ttm: number;          // 股息率(TTM)
  total_share: number;     // 总股本(万股)
  float_share: number;     // 流通股本(万股)
  free_share: number;      // 自由流通股本(万股)
  total_mv: number;        // 总市值(万元)
  circ_mv: number;         // 流通市值(万元)
}
```

**MCP 工具设计决策**:
- 工具名称: `query_daily_basic`
- 核心参数: `ts_code` (必填), `trade_date` 或 (`start_date` + `end_date`)
- 验证逻辑:
  - 必须提供股票代码(不支持批量查询全市场)
  - 日期范围不超过 3 个月(符合 spec.md 要求)
- 格式化策略:
  - 显示关键指标: PE、PB、换手率、总市值、流通市值
  - 对 N/A 值(如新股无 PE)特殊处理,显示"暂无数据"

**边界情况**:
1. 新股无历史 PE → SDK 返回 null 或 0 → 显示 "N/A (新股暂无)"
2. 非交易日查询 → SDK 返回空数组 → 提示"该日期为非交易日,最近交易日为 [X]"(需查询交易日历)
3. 日期范围超过 3 个月 → 提前验证并拒绝

---

### 3. 数据格式化最佳实践

**决策**: 每个处理器内部实现独立的格式化函数

**通用格式化规则**:

1. **日期格式**: YYYYMMDD → YYYY-MM-DD
   ```typescript
   const formattedDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
   ```

2. **数值格式**:
   - 价格: 保留 2 位小数 (`toFixed(2)`)
   - 百分比: 保留 2 位小数 + `%`
   - 大数值: 使用千分位分隔 (`toLocaleString()`)

3. **单位转换**:
   - 成交额: 千元 → 亿元 (`amount / 100000`)
   - 市值: 万元 → 亿元 (`total_mv / 10000`)

4. **空值处理**:
   - `null` → "N/A"
   - `0` (明确为无效) → "暂无数据"
   - 空数组 → "未找到数据"

**示例** (股票基本信息格式化):
```typescript
function formatStockBasicText(data: StockBasicItem): string {
  return `股票基本信息:
- 股票代码: ${data.ts_code}
- 股票名称: ${data.name}
- 所属行业: ${data.industry}
- 所属市场: ${data.market}
- 上市日期: ${formatDate(data.list_date)}
- 上市状态: ${data.list_status === 'L' ? '正常上市' : data.list_status === 'D' ? '已退市' : '暂停上市'}`;
}
```

---

### 4. 参数验证策略

**决策**: 使用 `zod` 进行运行时参数验证,复用现有模式

**标准验证规则**:

```typescript
import { z } from 'zod';

// 股票代码验证
const tsCodeSchema = z.string()
  .regex(/^\d{6}\.(SH|SZ)$/, '股票代码格式错误,示例: 600519.SH');

// 日期验证
const dateSchema = z.string()
  .regex(/^\d{8}$/, '日期格式错误,示例: 20251014');

// 日期范围验证 (自定义逻辑)
function validateDateRange(start: string, end: string, maxDays: number): void {
  const startDate = new Date(
    parseInt(start.slice(0, 4)),
    parseInt(start.slice(4, 6)) - 1,
    parseInt(start.slice(6, 8))
  );
  const endDate = new Date(
    parseInt(end.slice(0, 4)),
    parseInt(end.slice(4, 6)) - 1,
    parseInt(end.slice(6, 8))
  );

  const diffDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

  if (diffDays < 0) {
    throw new Error('起始日期不能晚于结束日期');
  }

  if (diffDays > maxDays) {
    throw new Error(`日期范围不能超过 ${maxDays} 天`);
  }
}
```

**特定工具验证规则**:

1. **`query_stock_basic`**:
   - `ts_code` 可选,但如果不提供其他筛选条件则拒绝
   - `exchange` 必须为 SSE 或 SZSE

2. **`query_trade_calendar`**:
   - `start_date` 和 `end_date` 必须同时提供或同时省略
   - 日期范围 ≤ 365 天

3. **`query_daily_basic`**:
   - `ts_code` 必填
   - 日期范围 ≤ 90 天

---

### 5. 错误处理策略

**决策**: 复用 `handleTushareError` 函数,无需新增错误分类

**现有错误分类完全覆盖本功能需求**:
- `AUTH_ERROR`: Token 无效(所有 API 通用)
- `RATE_LIMIT`: 请求频繁(所有 API 通用)
- `DATA_NOT_FOUND`: 数据不存在(股票不存在、日期无数据等)
- `NETWORK_ERROR`: 网络超时(所有 API 通用)
- `VALIDATION_ERROR`: 参数格式错误(zod 验证失败)

**特定场景的错误消息增强**:

1. **股票基本信息**:
   - 股票代码不存在 → "未找到股票 600XXX.SH,请检查代码是否正确"
   - 无筛选条件 → "请提供至少一个筛选条件(股票代码、交易所或上市状态)"

2. **交易日历**:
   - 日期范围超限 → "查询范围不能超过 1 年,当前范围: [X] 天"
   - 未来日期无数据 → "未找到该日期的交易日历,请检查日期是否在支持范围内"

3. **每日技术指标**:
   - 非交易日查询 → "2025-10-12 为非交易日,无技术指标数据。最近交易日: 2025-10-11"
   - 新股无 PE → 在格式化函数中处理,显示 "N/A (新股暂无历史数据)"

---

### 6. 测试策略

**决策**: 采用测试优先(TDD)开发方式

**测试层级**:

1. **工具定义测试** (`tools/*.test.ts`):
   - 验证工具定义的 `inputSchema` 正确性
   - 验证必填字段和可选字段
   - 验证正则表达式模式

2. **处理器单元测试** (`handlers/*.handler.test.ts`):
   - 使用 mock SDK 客户端
   - 测试参数验证逻辑
   - 测试数据格式化逻辑
   - 测试错误处理逻辑
   - 测试边界情况(空数据、非交易日等)

3. **集成测试** (可选,需真实 Token):
   - 测试与 Tushare API 的实际通信
   - 测试限流机制
   - 测试真实数据的格式化

**测试用例示例** (股票基本信息):
```typescript
describe('handleStockBasic', () => {
  it('应该返回单个股票的基本信息', async () => {
    // 测试正常场景
  });

  it('应该处理股票代码不存在的情况', async () => {
    // 测试 DATA_NOT_FOUND 错误
  });

  it('应该验证股票代码格式', async () => {
    // 测试 VALIDATION_ERROR
  });

  it('应该拒绝无筛选条件的请求', async () => {
    // 测试自定义验证逻辑
  });
});
```

---

## 技术债务和改进建议

### 当前不解决(记录到 Out of Scope)

1. **数据缓存**:
   - 问题: 频繁查询相同数据浪费 API 配额
   - 建议: 后续版本考虑添加内存缓存(特别是交易日历和股票基本信息)
   - 理由: 本期专注功能完整性,缓存可独立优化

2. **批量查询优化**:
   - 问题: 用户查询多只股票需多次调用
   - 建议: 后续版本支持批量股票代码输入
   - 理由: 需重新设计响应格式,超出本期范围

3. **智能日期处理**:
   - 问题: 用户查询"今天"时,如果是非交易日需自动回退
   - 建议: 在 `query_daily_basic` 中集成交易日历查询
   - 理由: 增加复杂度,且现有错误提示已足够

### 需在实现阶段解决

1. ⚠️ **格式化逻辑复用**:
   - 问题: 三个工具都需要日期格式化和数值格式化
   - 解决: 在 Phase 1 实现时评估是否抽取到 `utils/formatter.ts`
   - 判断标准: 如果复用超过 3 次,则抽取;否则保持内联

---

## 实现优先级建议

基于 spec.md 中的用户故事优先级:

1. **P1 - 股票基本信息查询** (`query_stock_basic`)
   - 理由: 是其他查询的基础,用户需要先查代码再查行情

2. **P2 - 交易日历查询** (`query_trade_calendar`)
   - 理由: 可优化非交易日查询体验,但不阻塞其他功能

3. **P3 - 每日技术指标查询** (`query_daily_basic`)
   - 理由: 高级功能,依赖基本信息和行情数据

---

## 未解决问题(NEEDS CLARIFICATION)

**状态**: 全部解决 ✅

Constitution Check 中的 ⚠️ 项已在本 research 阶段解决:
- 格式化逻辑复用: 决定在实现阶段根据实际复用情况动态评估

---

## 参考资料

1. **现有代码**:
   - `apps/tushare-mcp/src/handlers/stock-quote.handler.ts` - 标准处理器模式
   - `apps/tushare-mcp/src/utils/error-handler.ts` - 统一错误处理
   - `apps/tushare-mcp/src/types/mcp-tools.types.ts` - 类型定义规范

2. **SDK 文档**:
   - `packages/tushare-sdk/src/api/stock.ts`
   - `packages/tushare-sdk/src/api/calendar.ts`
   - `packages/tushare-sdk/src/api/daily-basic.ts`

3. **外部资源**:
   - Tushare Pro 官方文档: https://tushare.pro/document/2
   - Model Context Protocol 规范: https://modelcontextprotocol.io/

---

**下一步**: 进入 Phase 1,生成 `data-model.md` 和 API contracts
