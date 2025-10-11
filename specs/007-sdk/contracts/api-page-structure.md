# API 文档页面标准结构

**Feature**: 007-sdk | **Date**: 2025-10-11

## Purpose

定义所有 API 文档页面的统一结构，确保文档内容完整性和一致性。

## Standard Structure

所有 API 文档页面必须包含以下部分（按顺序）：

### 1. Frontmatter (可选)

```yaml
---
title: API 名称
description: API 简要描述
---
```

### 2. 标题和简介 (必需)

```markdown
# API 名称

API 的简要说明（1-2句话）。

**接口名称**: `api_name` (Tushare Pro API 名称)
**权限要求**: 至少 X 积分 (如适用，否则省略)
```

### 3. 基本用法 (必需)

```markdown
## 基本用法

\`\`\`typescript
import { TushareClient } from '@hestudy/tushare-sdk';

const client = new TushareClient({ token: 'YOUR_TOKEN' });

// 调用 API
const result = await client.someMethod(params);
console.log(result);
\`\`\`
```

**要求**:
- 必须包含完整的导入语句
- 使用正确的包名 `@hestudy/tushare-sdk`
- 使用实际存在的方法名
- 参数示例应使用真实的 Tushare 数据格式

### 4. 参数说明 (必需)

```markdown
## 参数说明

### 输入参数

\`\`\`typescript
interface SomeParams {
  field1: string;
  field2?: number;
  // ...
}
\`\`\`

| 参数名 | 类型 | 必需 | 说明 | 示例 |
|--------|------|------|------|------|
| `field1` | `string` | ✅ | 字段1说明 | `'example'` |
| `field2` | `number` | ❌ | 字段2说明 | `123` |
```

**要求**:
- 必须展示完整的 TypeScript 接口定义
- 类型定义必须与源代码完全一致
- 表格必须包含：参数名、类型、必需性、说明、示例
- 必需参数用 ✅ 标记，可选参数用 ❌ 标记

### 5. 返回值说明 (必需)

```markdown
## 返回值说明

### 返回类型

\`\`\`typescript
interface SomeItem {
  field1: string;
  field2: number;
  // ...
}

// 方法返回 Promise<SomeItem[]>
\`\`\`

| 字段名 | 类型 | 说明 | 单位/格式 |
|--------|------|------|-----------|
| `field1` | `string` | 字段1说明 | - |
| `field2` | `number` | 字段2说明 | 元/% |
```

**要求**:
- 必须展示完整的 TypeScript 接口定义
- 类型定义必须与源代码完全一致
- 对于计算型字段，必须提供计算公式（如：`换手率 = 成交量/流通股本 × 100%`）
- 标注可能为空的字段（nullable fields）

### 6. 使用示例 (必需)

```markdown
## 使用示例

### 示例1：基本查询

\`\`\`typescript
const client = new TushareClient({ token: 'YOUR_TOKEN' });

const result = await client.someMethod({
  param1: 'value1'
});

console.log(\`查询到 \${result.length} 条数据\`);
\`\`\`

### 示例2：条件过滤

\`\`\`typescript
const result = await client.someMethod({
  param1: 'value1',
  start_date: '20240101',
  end_date: '20241231'
});
\`\`\`

### 示例3：指定返回字段

\`\`\`typescript
const result = await client.someMethod({
  param1: 'value1',
  fields: 'field1,field2,field3'
});
\`\`\`
```

**要求**:
- 至少提供 3 个不同场景的示例
- 示例代码必须完整且可直接运行
- 每个示例都应有清晰的标题说明用途

### 7. 注意事项 (推荐)

```markdown
## 注意事项

- 参数约束说明（如：`ts_code` 和 `trade_date` 至少传一个）
- 数据更新频率（如：每日更新）
- 权限说明（如：需要至少 2000 积分）
- 常见错误提示
```

### 8. 相关 API (可选)

```markdown
## 相关 API

- [股票基础信息](/api/stock/basic) - 获取股票列表
- [交易日历](/api/calendar) - 查询交易日
```

**要求**:
- 仅链接到实际存在的 API 文档页面
- 不要链接到未实现或占位页面

## Template Example

完整的 API 文档页面模板示例：

```markdown
---
title: 获取股票基础信息
description: 查询股票列表，获取股票代码、名称、上市日期等基础信息
---

# 获取股票基础信息

获取沪深两市所有股票的基础信息，包括股票代码、名称、上市日期、上市状态等。

**接口名称**: `stock_basic`

## 基本用法

\`\`\`typescript
import { TushareClient } from '@hestudy/tushare-sdk';

const client = new TushareClient({ token: 'YOUR_TOKEN' });

// 获取所有上市状态的股票
const stocks = await client.getStockBasic({
  list_status: 'L'
});

console.log(\`共查询到 \${stocks.length} 只股票\`);
\`\`\`

## 参数说明

### 输入参数

\`\`\`typescript
interface StockBasicParams {
  ts_code?: string;
  list_status?: string;
  exchange?: string;
  fields?: string;
}
\`\`\`

| 参数名 | 类型 | 必需 | 说明 | 取值示例 |
|--------|------|------|------|----------|
| `ts_code` | `string` | ❌ | 股票代码 | `'000001.SZ'` |
| `list_status` | `string` | ❌ | 上市状态 | `'L'` (上市), `'D'` (退市), `'P'` (暂停) |
| `exchange` | `string` | ❌ | 交易所 | `'SSE'` (上交所), `'SZSE'` (深交所) |
| `fields` | `string` | ❌ | 指定返回字段 (逗号分隔) | `'ts_code,name,list_date'` |

## 返回值说明

### 返回类型

\`\`\`typescript
interface StockBasicItem {
  ts_code: string;
  symbol: string;
  name: string;
  area: string;
  industry: string;
  market: string;
  list_date: string;
  list_status: string;
  exchange: string;
}

// 方法返回 Promise<StockBasicItem[]>
\`\`\`

| 字段名 | 类型 | 说明 | 格式示例 |
|--------|------|------|----------|
| `ts_code` | `string` | 股票代码 (TS格式) | `'000001.SZ'` |
| `symbol` | `string` | 股票代码 (不含后缀) | `'000001'` |
| `name` | `string` | 股票名称 | `'平安银行'` |
| `area` | `string` | 地区 | `'深圳'` |
| `industry` | `string` | 行业 | `'银行'` |
| `market` | `string` | 市场类型 | `'主板'` |
| `list_date` | `string` | 上市日期 | `'19910403'` (YYYYMMDD) |
| `list_status` | `string` | 上市状态 | `'L'`, `'D'`, `'P'` |
| `exchange` | `string` | 交易所 | `'SZSE'`, `'SSE'` |

## 使用示例

### 示例1：获取所有上市股票

\`\`\`typescript
const client = new TushareClient({ token: 'YOUR_TOKEN' });

const stocks = await client.getStockBasic({
  list_status: 'L'
});

console.log(\`共有 \${stocks.length} 只上市股票\`);
\`\`\`

### 示例2：获取上交所股票

\`\`\`typescript
const stocks = await client.getStockBasic({
  list_status: 'L',
  exchange: 'SSE'
});

stocks.forEach(stock => {
  console.log(\`\${stock.ts_code} - \${stock.name}\`);
});
\`\`\`

### 示例3：指定返回字段

\`\`\`typescript
const stocks = await client.getStockBasic({
  list_status: 'L',
  fields: 'ts_code,name,list_date'
});
\`\`\`

## 注意事项

- 不传入任何参数时，将返回所有股票（包括已退市股票）
- `list_status` 参数推荐设置为 `'L'` 以仅获取上市股票
- 数据每日更新

## 相关 API

- [日线行情](/api/stock/daily) - 获取股票日线数据
- [每日指标](/api/daily-basic) - 获取股票估值指标
\`\`\`

## Validation Checklist

更新 API 文档时，使用此检查清单确保完整性：

- [ ] 标题和简介清晰描述 API 用途
- [ ] 标注正确的 Tushare API 接口名称
- [ ] 如需权限，标注积分要求
- [ ] 基本用法示例完整可运行
- [ ] 参数说明包含完整的 TypeScript 接口定义
- [ ] 参数表格包含所有参数及其说明
- [ ] 返回值说明包含完整的 TypeScript 接口定义
- [ ] 返回值表格包含所有字段及其说明
- [ ] 计算型字段提供了计算公式
- [ ] 至少提供 3 个不同场景的使用示例
- [ ] 所有示例代码使用正确的包名 `@hestudy/tushare-sdk`
- [ ] 所有类型定义与源代码一致
- [ ] 相关 API 链接指向实际存在的页面
