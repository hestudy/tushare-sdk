# Data Model: SDK每日指标快捷方法

**Feature**: 004-sdk  
**Date**: 2025-10-10  
**Phase**: 1 - Design

## 概述

本文档定义了每日指标功能的数据模型,包括查询参数和返回数据的类型定义。设计遵循现有 SDK 的模式,保持与 `StockBasicParams/Item`、`DailyQuoteParams/Item` 等一致的风格。

## 实体定义

### 1. DailyBasicParams (查询参数)

**用途**: 定义查询每日指标数据时的输入参数

**TypeScript 定义**:

```typescript
/**
 * 每日指标查询参数
 */
export interface DailyBasicParams {
  /**
   * 股票代码
   * 格式: TS代码,如 600230.SH, 000001.SZ
   * 可选,不传则查询所有股票
   */
  ts_code?: string;

  /**
   * 交易日期
   * 格式: YYYYMMDD,如 20181010
   * 与 ts_code 至少传一个
   */
  trade_date?: string;

  /**
   * 开始日期
   * 格式: YYYYMMDD
   * 用于日期范围查询
   */
  start_date?: string;

  /**
   * 结束日期
   * 格式: YYYYMMDD
   * 用于日期范围查询
   */
  end_date?: string;

  /**
   * 指定返回字段
   * 格式: 逗号分隔的字段名,如 'ts_code,trade_date,pe,pb'
   * 可选,不传则返回所有字段
   */
  fields?: string;
}
```

**字段说明**:

| 字段 | 类型 | 必选 | 说明 | 示例 |
|------|------|------|------|------|
| ts_code | string | N | 股票代码 | '600230.SH' |
| trade_date | string | N* | 交易日期 | '20181010' |
| start_date | string | N | 开始日期 | '20180101' |
| end_date | string | N | 结束日期 | '20181231' |
| fields | string | N | 返回字段列表 | 'ts_code,pe,pb' |

*注: `ts_code` 和 `trade_date` 至少需要一个

**验证规则**:
- 日期格式必须是 YYYYMMDD (8位数字字符串)
- ts_code 格式: 6位数字 + '.' + 2-4位交易所代码
- fields 为逗号分隔的字段名,不能有空格

**使用场景**:
1. **按日期查询**: 传入 `trade_date`,获取该日所有股票数据
2. **按股票查询**: 传入 `ts_code`,获取该股票历史数据
3. **范围查询**: 传入 `ts_code` + `start_date` + `end_date`
4. **自定义字段**: 传入 `fields` 减少数据传输量

### 2. DailyBasicItem (数据项)

**用途**: 定义每日指标数据的返回结构

**TypeScript 定义**:

```typescript
/**
 * 每日指标数据项
 */
export interface DailyBasicItem {
  /**
   * 股票代码
   * 格式: TS代码,如 600230.SH
   */
  ts_code: string;

  /**
   * 交易日期
   * 格式: YYYYMMDD,如 20181010
   */
  trade_date: string;

  /**
   * 换手率 (%)
   * 定义: 成交量/流通股本 * 100%
   * 可能为空
   */
  turnover_rate?: number;

  /**
   * 换手率(自由流通股) (%)
   * 可能为空
   */
  turnover_rate_f?: number;

  /**
   * 量比
   * 定义: 当日成交量/过去5日平均成交量
   * 可能为空
   */
  volume_ratio?: number;

  /**
   * 市盈率 (总市值/净利润)
   * 亏损时为空
   */
  pe?: number;

  /**
   * 市盈率 (TTM)
   * TTM = Trailing Twelve Months (最近12个月)
   * 亏损时为空
   */
  pe_ttm?: number;

  /**
   * 市净率 (总市值/净资产)
   * 可能为空
   */
  pb?: number;

  /**
   * 市销率 (总市值/营业收入)
   * 可能为空
   */
  ps?: number;

  /**
   * 市销率 (TTM)
   * 可能为空
   */
  ps_ttm?: number;

  /**
   * 股息率 (%)
   * 定义: 每股分红/股价 * 100%
   * 可能为空
   */
  dv_ratio?: number;

  /**
   * 股息率 (TTM) (%)
   * 可能为空
   */
  dv_ttm?: number;

  /**
   * 总股本 (万股)
   * 可能为空
   */
  total_share?: number;

  /**
   * 流通股本 (万股)
   * 可能为空
   */
  float_share?: number;

  /**
   * 自由流通股本 (万股)
   * 定义: 剔除限售股后的流通股本
   * 可能为空
   */
  free_share?: number;

  /**
   * 总市值 (万元)
   * 定义: 总股本 * 收盘价
   * 可能为空
   */
  total_mv?: number;

  /**
   * 流通市值 (万元)
   * 定义: 流通股本 * 收盘价
   * 可能为空
   */
  circ_mv?: number;
}
```

**字段分类**:

#### 流动性指标
- `turnover_rate`: 换手率
- `turnover_rate_f`: 换手率(自由流通股)
- `volume_ratio`: 量比

#### 估值指标
- `pe`: 市盈率
- `pe_ttm`: 市盈率(TTM)
- `pb`: 市净率
- `ps`: 市销率
- `ps_ttm`: 市销率(TTM)

#### 分红指标
- `dv_ratio`: 股息率
- `dv_ttm`: 股息率(TTM)

#### 股本和市值
- `total_share`: 总股本
- `float_share`: 流通股本
- `free_share`: 自由流通股本
- `total_mv`: 总市值
- `circ_mv`: 流通市值

**数据特征**:
- 所有数值字段都是可选的 (`?`),因为 API 可能返回 null
- 亏损股票的 PE 为空
- 某些新股或特殊情况下,部分指标可能缺失

## 实体关系

```
┌─────────────────────┐
│ DailyBasicParams    │
│ (查询参数)           │
└──────────┬──────────┘
           │
           │ 作为输入
           ▼
┌─────────────────────┐
│ getDailyBasic()     │
│ (API 函数)          │
└──────────┬──────────┘
           │
           │ 返回数组
           ▼
┌─────────────────────┐
│ DailyBasicItem[]    │
│ (数据列表)           │
└─────────────────────┘
```

**关系说明**:
- `DailyBasicParams` 是输入,定义查询条件
- `getDailyBasic()` 是 API 函数,接收参数并调用 Tushare API
- `DailyBasicItem[]` 是输出,返回符合条件的数据数组

## 数据流转

### 1. 按日期查询全市场

```typescript
// 输入
const params: DailyBasicParams = {
  trade_date: '20180726'
};

// 输出
const result: DailyBasicItem[] = [
  {
    ts_code: '600230.SH',
    trade_date: '20180726',
    turnover_rate: 2.4584,
    volume_ratio: 0.72,
    pe: 8.6928,
    pb: 3.7203,
    // ... 其他字段
  },
  // ... 约4000条记录
];
```

### 2. 按股票查询历史

```typescript
// 输入
const params: DailyBasicParams = {
  ts_code: '600230.SH',
  start_date: '20180101',
  end_date: '20181231'
};

// 输出
const result: DailyBasicItem[] = [
  {
    ts_code: '600230.SH',
    trade_date: '20180102',
    // ... 字段
  },
  {
    ts_code: '600230.SH',
    trade_date: '20180103',
    // ... 字段
  },
  // ... 该股票在日期范围内的所有交易日数据
];
```

### 3. 自定义返回字段

```typescript
// 输入
const params: DailyBasicParams = {
  trade_date: '20180726',
  fields: 'ts_code,trade_date,pe,pb'
};

// 输出 (只包含指定字段)
const result: DailyBasicItem[] = [
  {
    ts_code: '600230.SH',
    trade_date: '20180726',
    pe: 8.6928,
    pb: 3.7203,
    // 其他字段为 undefined
  },
  // ...
];
```

## 状态转换

本功能为无状态查询,不涉及状态转换。每次查询都是独立的,不依赖之前的查询结果。

## 数据约束

### 业务规则

1. **日期格式**: 必须是 YYYYMMDD 格式的8位数字字符串
2. **股票代码格式**: 6位数字 + '.' + 交易所代码(SH/SZ/BJ)
3. **日期范围**: 只能查询历史数据,不能查询未来日期
4. **数据量限制**: 单次请求最多返回 6000 条记录
5. **权限要求**: 需要至少 2000 积分

### 数据完整性

1. **必填字段**: `ts_code` 和 `trade_date` 始终存在
2. **可选字段**: 其他所有数值字段都可能为空
3. **空值处理**: 
   - 亏损股票的 PE 为 undefined
   - 新股或特殊情况下,某些指标可能为 undefined
   - 非交易日查询返回空数组 `[]`

### 数据一致性

1. **日期一致性**: 返回数据的 `trade_date` 必须在查询的日期范围内
2. **股票一致性**: 返回数据的 `ts_code` 必须匹配查询的股票代码
3. **数据时效性**: 数据在交易日 15:00-17:00 更新

## 与现有模型的对比

| 特性 | StockBasicItem | DailyQuoteItem | DailyBasicItem |
|------|----------------|----------------|----------------|
| 主键 | ts_code | ts_code + trade_date | ts_code + trade_date |
| 时间维度 | 静态(上市信息) | 动态(每日) | 动态(每日) |
| 数据类型 | 基础信息 | 行情数据 | 基本面指标 |
| 可选字段 | 少 | 无 | 多 |
| 更新频率 | 不定期 | 每日 | 每日 |

**设计一致性**:
- 所有模型都使用 `Params` 和 `Item` 后缀
- 所有模型都使用 snake_case 字段名(与 API 一致)
- 所有模型都使用 JSDoc 中文注释
- 所有模型都将可选字段标记为 `?`

## 文件位置

```
packages/tushare-sdk/src/models/daily-basic.ts
```

**导出**:
```typescript
export type { DailyBasicParams, DailyBasicItem } from './models/daily-basic.js';
```

## 测试数据示例

### 正常数据

```typescript
const mockData: DailyBasicItem = {
  ts_code: '600230.SH',
  trade_date: '20180726',
  turnover_rate: 2.4584,
  volume_ratio: 0.72,
  pe: 8.6928,
  pe_ttm: 8.5,
  pb: 3.7203,
  ps: 1.5,
  ps_ttm: 1.6,
  dv_ratio: 2.3,
  dv_ttm: 2.4,
  total_share: 100000,
  float_share: 80000,
  free_share: 75000,
  total_mv: 500000,
  circ_mv: 400000,
};
```

### 亏损股票数据

```typescript
const lossStockData: DailyBasicItem = {
  ts_code: '600001.SH',
  trade_date: '20180726',
  turnover_rate: 1.5,
  volume_ratio: 0.8,
  pe: undefined,      // 亏损,PE为空
  pe_ttm: undefined,  // 亏损,PE_TTM为空
  pb: 2.5,
  // ... 其他字段
};
```

### 空结果

```typescript
// 非交易日或无效查询
const emptyResult: DailyBasicItem[] = [];
```

## 总结

本数据模型设计:
- ✅ 完全遵循现有 SDK 的模式和风格
- ✅ 提供完整的类型定义和注释
- ✅ 覆盖所有 Tushare API 的输入输出字段
- ✅ 考虑了数据的可选性和边界情况
- ✅ 为测试提供了清晰的数据示例
