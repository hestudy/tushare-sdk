# Data Model: Node Demo 每日指标演示

**Feature**: 005-node-demo  
**Date**: 2025-10-10  
**Status**: Complete

## Overview

本文档定义每日指标演示示例中使用的数据模型和类型定义。该示例主要复用现有的应用类型和 SDK 提供的 `DailyBasicItem` 类型,仅定义示例函数的接口。

## Core Entities

### 1. DailyBasicExampleResult (每日指标示例结果)

每日指标示例函数的返回值类型,与其他示例保持一致。

```typescript
/**
 * 每日指标示例执行结果
 */
interface DailyBasicExampleResult {
  /**
   * 返回的数据条数
   */
  count: number;

  /**
   * 示例数据(前 3 条)
   */
  sample: unknown[];
}
```

**验证规则**:
- `count` 应为非负整数
- `sample` 数组长度应 ≤ 3
- `sample` 数组长度应 ≤ `count`

**使用场景**: `runDailyBasicExample()` 函数的返回值

---

### 2. DailyBasicQueryScenario (查询场景)

定义演示的 3 种查询场景。

```typescript
/**
 * 每日指标查询场景
 */
interface DailyBasicQueryScenario {
  /**
   * 场景名称
   */
  name: string;

  /**
   * 场景描述
   */
  description: string;

  /**
   * 查询参数
   */
  params: DailyBasicParams;

  /**
   * 预期数据量说明
   */
  expectedDataSize: string;
}
```

**示例数据**:
```typescript
const scenarios: DailyBasicQueryScenario[] = [
  {
    name: '按交易日期查询全市场数据',
    description: '获取指定交易日所有股票的每日指标',
    params: {
      trade_date: '20241008',
    },
    expectedDataSize: '约 4000-5000 条(全市场股票数量)',
  },
  {
    name: '按股票代码查询历史数据',
    description: '获取单只股票一段时间的指标变化',
    params: {
      ts_code: '000001.SZ',
      start_date: '20240901',
      end_date: '20241001',
    },
    expectedDataSize: '约 20 条(一个月的交易日)',
  },
  {
    name: '自定义返回字段',
    description: '只获取需要的字段,减少数据传输',
    params: {
      trade_date: '20241008',
      fields: 'ts_code,trade_date,pe,pb,turnover_rate,total_mv',
    },
    expectedDataSize: '约 4000-5000 条,但每条数据更小',
  },
];
```

---

## SDK Data Models (复用)

演示应用直接使用 SDK 提供的数据模型:

### 从 SDK 导入的类型

```typescript
import type {
  // 每日指标相关类型
  DailyBasicParams,
  DailyBasicItem,
  
  // 客户端类型
  TushareClient,
  
  // 配置类型(已在现有应用中定义)
  AppConfig,
} from '@hestudy/tushare-sdk';
```

### 1. DailyBasicParams (查询参数)

SDK 提供的每日指标查询参数类型。

**字段**:
- `ts_code?`: 股票代码(可选)
- `trade_date?`: 交易日期,格式 YYYYMMDD(可选)
- `start_date?`: 开始日期,格式 YYYYMMDD(可选)
- `end_date?`: 结束日期,格式 YYYYMMDD(可选)
- `fields?`: 指定返回字段,逗号分隔(可选)

**使用场景**: 传递给 `client.getDailyBasic()` 方法

---

### 2. DailyBasicItem (每日指标数据)

SDK 提供的每日指标数据类型。

**关键字段**(演示中重点展示):
- `ts_code`: 股票代码
- `trade_date`: 交易日期
- `pe`: 市盈率(动态)
- `pb`: 市净率
- `turnover_rate`: 换手率(%)
- `total_mv`: 总市值(万元)

**其他字段**:
- `close`: 当日收盘价
- `ps`: 市销率
- `ps_ttm`: 市销率(TTM)
- `dv_ratio`: 股息率(%)
- `dv_ttm`: 股息率(TTM)(%)
- `total_share`: 总股本(万股)
- `float_share`: 流通股本(万股)
- `free_share`: 自由流通股本(万股)
- `circ_mv`: 流通市值(万元)

**使用场景**: `client.getDailyBasic()` 的返回值数组元素类型

---

### 3. AppConfig (应用配置)

现有应用已定义的配置类型,无需修改。

**字段**:
- `tushareToken`: Tushare API Token
- `apiBaseUrl?`: API 基础 URL
- `debug?`: 是否启用调试日志

**使用场景**: 传递给 `runDailyBasicExample()` 函数

---

## Data Flow

### 1. 示例执行流程

```
用户运行命令
  -> main() 函数解析参数
  -> 加载 AppConfig
  -> 调用 runDailyBasicExample(config)
  -> 创建 TushareClient
  -> 执行 3 种查询场景
  -> 返回 DailyBasicExampleResult
  -> 格式化输出到控制台
```

### 2. 单个查询场景流程

```
DailyBasicQueryScenario
  -> DailyBasicParams
  -> client.getDailyBasic(params)
  -> DailyBasicItem[]
  -> 数据统计和采样
  -> 控制台展示
```

### 3. 数据展示流程

```
DailyBasicItem[]
  -> 计算 count
  -> 提取 sample (前 3 条)
  -> 格式化关键字段
  -> logApiResponse() 记录日志
  -> 控制台输出
```

---

## Validation Rules

### 示例结果验证

```typescript
/**
 * 验证每日指标示例结果
 * @throws {Error} 结果无效时抛出错误
 */
function validateDailyBasicResult(result: DailyBasicExampleResult): void {
  if (result.count < 0) {
    throw new Error(
      `数据条数不能为负数: ${result.count}`
    );
  }

  if (result.sample.length > 3) {
    throw new Error(
      `示例数据不应超过 3 条: ${result.sample.length}`
    );
  }

  if (result.sample.length > result.count) {
    throw new Error(
      `示例数据条数(${result.sample.length})不应超过总条数(${result.count})`
    );
  }
}
```

### 查询参数验证

```typescript
/**
 * 验证日期格式
 * @param date - 日期字符串,格式 YYYYMMDD
 * @returns 是否有效
 */
function isValidDateFormat(date: string): boolean {
  return /^\d{8}$/.test(date);
}

/**
 * 验证股票代码格式
 * @param tsCode - 股票代码,格式 XXXXXX.XX
 * @returns 是否有效
 */
function isValidTsCode(tsCode: string): boolean {
  return /^\d{6}\.(SH|SZ)$/.test(tsCode);
}
```

---

## Type Safety

### 严格类型检查

示例代码启用 TypeScript 严格模式,确保类型安全:

```typescript
/**
 * 每日指标示例函数
 * 
 * @param config - 应用配置
 * @returns 查询结果统计
 */
export async function runDailyBasicExample(
  config: AppConfig
): Promise<DailyBasicExampleResult> {
  // 类型安全的实现
}
```

### 类型守卫

```typescript
/**
 * 检查是否为有效的每日指标数据
 */
function isDailyBasicItem(item: unknown): item is DailyBasicItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    'ts_code' in item &&
    'trade_date' in item &&
    typeof item.ts_code === 'string' &&
    typeof item.trade_date === 'string'
  );
}
```

---

## Display Format

### 控制台输出格式

**场景 1: 全市场数据**
```
=== 场景 1: 按交易日期查询全市场数据 ===
查询参数: { trade_date: '20241008' }
返回数据: 4523 条
示例数据(前 3 条):
  - 000001.SZ | 2024-10-08 | PE: 5.23 | PB: 0.68 | 换手率: 0.45% | 总市值: 23456789 万元
  - 000002.SZ | 2024-10-08 | PE: 12.45 | PB: 1.23 | 换手率: 0.78% | 总市值: 12345678 万元
  - 000004.SZ | 2024-10-08 | PE: 8.90 | PB: 0.95 | 换手率: 0.32% | 总市值: 9876543 万元
```

**场景 2: 历史数据**
```
=== 场景 2: 按股票代码查询历史数据 ===
查询参数: { ts_code: '000001.SZ', start_date: '20240901', end_date: '20241001' }
返回数据: 21 条
示例数据(前 3 条):
  - 000001.SZ | 2024-09-02 | PE: 5.20 | PB: 0.67 | 换手率: 0.42%
  - 000001.SZ | 2024-09-03 | PE: 5.21 | PB: 0.68 | 换手率: 0.45%
  - 000001.SZ | 2024-09-04 | PE: 5.22 | PB: 0.68 | 换手率: 0.43%
```

**场景 3: 自定义字段**
```
=== 场景 3: 自定义返回字段 ===
查询参数: { trade_date: '20241008', fields: 'ts_code,trade_date,pe,pb,turnover_rate,total_mv' }
返回字段: ts_code, trade_date, pe, pb, turnover_rate, total_mv
返回数据: 4523 条
示例数据(前 3 条):
  - 000001.SZ | 2024-10-08 | PE: 5.23 | PB: 0.68 | 换手率: 0.45% | 总市值: 23456789 万元
  ...
```

---

## Summary

### 新增类型 (2 个)
1. **DailyBasicExampleResult**: 示例函数返回值类型
2. **DailyBasicQueryScenario**: 查询场景定义(内部使用)

### 复用 SDK 类型 (3 个)
1. **DailyBasicParams**: 查询参数类型
2. **DailyBasicItem**: 数据项类型
3. **TushareClient**: 客户端类型

### 复用应用类型 (1 个)
1. **AppConfig**: 应用配置类型(已在现有应用中定义)

### 设计原则
- ✅ 最小化自定义类型,优先复用现有类型
- ✅ 与其他示例保持一致的返回值结构
- ✅ 所有类型都有 JSDoc 注释
- ✅ 启用严格类型检查,禁止 `any`
- ✅ 清晰的数据流和展示格式

**状态**: 数据模型设计完成,可以进入契约定义阶段
