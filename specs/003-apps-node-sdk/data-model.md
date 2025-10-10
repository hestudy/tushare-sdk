# Data Model: Node 应用演示示例

**Feature**: 003-apps-node-sdk  
**Date**: 2025-10-10  
**Status**: Complete

## Overview

本文档定义演示应用中使用的数据模型和类型定义。演示应用主要复用 SDK 提供的类型,仅定义少量应用特定的配置和输出类型。

## Core Entities

### 1. AppConfig (应用配置)

演示应用的配置信息,从环境变量加载。

```typescript
/**
 * 演示应用配置
 */
interface AppConfig {
  /**
   * Tushare API Token
   * 从环境变量 TUSHARE_TOKEN 读取
   */
  tushareToken: string;

  /**
   * API 基础 URL
   * 默认: https://api.tushare.pro
   * 可通过 TUSHARE_API_URL 环境变量覆盖
   */
  apiBaseUrl?: string;

  /**
   * 是否启用调试日志
   * 默认: false
   * 可通过 DEBUG 环境变量设置
   */
  debug?: boolean;
}
```

**验证规则**:
- `tushareToken` 必须非空,否则抛出配置错误
- `apiBaseUrl` 可选,默认使用 SDK 默认值
- `debug` 可选,默认为 false

**状态转换**: N/A (配置对象不可变)

---

### 2. ExampleResult (示例执行结果)

单个 API 调用示例的执行结果。

```typescript
/**
 * 示例执行结果
 */
interface ExampleResult {
  /**
   * 示例名称
   */
  name: string;

  /**
   * 是否成功
   */
  success: boolean;

  /**
   * 执行时长(毫秒)
   */
  duration: number;

  /**
   * 返回的数据(成功时)
   */
  data?: unknown;

  /**
   * 错误信息(失败时)
   */
  error?: {
    type: string;
    message: string;
    code?: string;
  };
}
```

**验证规则**:
- `success` 为 true 时,`data` 应存在
- `success` 为 false 时,`error` 应存在
- `duration` 应为非负数

**状态转换**:
```
[初始化] -> [执行中] -> [成功/失败]
```

---

### 3. DemoOutput (演示输出)

演示应用的完整输出结果。

```typescript
/**
 * 演示应用输出
 */
interface DemoOutput {
  /**
   * 演示应用版本
   */
  version: string;

  /**
   * 执行时间戳
   */
  timestamp: string;

  /**
   * SDK 版本
   */
  sdkVersion: string;

  /**
   * 所有示例的执行结果
   */
  results: ExampleResult[];

  /**
   * 总体统计
   */
  summary: {
    total: number;
    success: number;
    failed: number;
    totalDuration: number;
  };
}
```

**验证规则**:
- `summary.total` 应等于 `results.length`
- `summary.success + summary.failed` 应等于 `summary.total`
- `summary.totalDuration` 应等于所有 `results[].duration` 之和

---

## SDK Data Models (复用)

演示应用直接使用 SDK 提供的数据模型,无需重新定义:

### 从 SDK 导入的类型

```typescript
import type {
  // 配置类型
  TushareConfig,
  
  // 响应类型
  TushareResponse,
  TushareResponseData,
  
  // 错误类型
  ApiError,
  ApiErrorType,
  
  // 数据模型
  StockBasicItem,
  StockBasicParams,
  DailyQuoteItem,
  DailyQuoteParams,
  TradeCalItem,
  TradeCalParams,
} from '@hestudy/tushare-sdk';
```

### 1. StockBasicItem (股票基本信息)

SDK 提供的股票基本信息类型,演示应用用于展示股票列表。

**字段**: 
- `ts_code`: 股票代码
- `symbol`: 股票简称
- `name`: 股票名称
- `area`: 地域
- `industry`: 行业
- `market`: 市场类型
- `list_date`: 上市日期

**使用场景**: `examples/stock-list.ts` 中展示股票列表

---

### 2. DailyQuoteItem (日线行情)

SDK 提供的日线行情数据类型,演示应用用于展示历史行情。

**字段**:
- `ts_code`: 股票代码
- `trade_date`: 交易日期
- `open`: 开盘价
- `high`: 最高价
- `low`: 最低价
- `close`: 收盘价
- `vol`: 成交量
- `amount`: 成交额

**使用场景**: `examples/daily-data.ts` 中展示日线数据

---

### 3. TradeCalItem (交易日历)

SDK 提供的交易日历类型,演示应用用于展示交易日信息。

**字段**:
- `exchange`: 交易所
- `cal_date`: 日历日期
- `is_open`: 是否交易日
- `pretrade_date`: 上一交易日

**使用场景**: `examples/trade-calendar.ts` 中展示交易日历

---

### 4. ApiError (API 错误)

SDK 提供的错误类型,演示应用用于错误处理演示。

**字段**:
- `type`: 错误类型 (ApiErrorType)
- `message`: 错误消息
- `code`: 错误代码
- `details`: 错误详情

**使用场景**: `error-handling.ts` 中演示各种错误处理

---

## Data Flow

### 1. 配置加载流程

```
环境变量 (.env) 
  -> dotenv.config()
  -> AppConfig
  -> TushareConfig (SDK 配置)
  -> TushareClient (SDK 客户端)
```

### 2. API 调用流程

```
用户请求
  -> 示例函数 (examples/*.ts)
  -> TushareClient.method()
  -> TushareResponse<T>
  -> 数据解析和展示
  -> ExampleResult
```

### 3. 错误处理流程

```
API 调用
  -> 错误发生
  -> ApiError
  -> 错误类型判断 (ApiErrorType)
  -> 错误信息格式化
  -> ExampleResult (success: false)
```

### 4. 输出生成流程

```
所有示例执行
  -> ExampleResult[]
  -> 统计计算
  -> DemoOutput
  -> JSON 输出 / 控制台展示
```

---

## Validation Rules

### 配置验证

```typescript
/**
 * 验证应用配置
 * @throws {Error} 配置无效时抛出错误
 */
function validateConfig(config: AppConfig): void {
  if (!config.tushareToken || config.tushareToken.trim() === '') {
    throw new Error(
      '缺少 Tushare API Token。请设置环境变量 TUSHARE_TOKEN 或在 .env 文件中配置。'
    );
  }

  if (config.apiBaseUrl && !isValidUrl(config.apiBaseUrl)) {
    throw new Error(
      `无效的 API URL: ${config.apiBaseUrl}`
    );
  }
}
```

### 结果验证

```typescript
/**
 * 验证示例结果
 * @throws {Error} 结果无效时抛出错误
 */
function validateExampleResult(result: ExampleResult): void {
  if (result.success && !result.data) {
    throw new Error(
      `示例 ${result.name} 标记为成功但没有返回数据`
    );
  }

  if (!result.success && !result.error) {
    throw new Error(
      `示例 ${result.name} 标记为失败但没有错误信息`
    );
  }

  if (result.duration < 0) {
    throw new Error(
      `示例 ${result.name} 的执行时长不能为负数: ${result.duration}`
    );
  }
}
```

---

## Type Safety

### 严格类型检查

演示应用启用 TypeScript 严格模式,确保类型安全:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

### 类型守卫

```typescript
/**
 * 检查是否为 ApiError
 */
function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * 检查是否为有效的配置
 */
function isValidConfig(config: unknown): config is AppConfig {
  return (
    typeof config === 'object' &&
    config !== null &&
    'tushareToken' in config &&
    typeof config.tushareToken === 'string'
  );
}
```

---

## Data Persistence

演示应用 **不需要数据持久化**:
- 所有数据来自 Tushare API,不需要本地存储
- 配置从环境变量读取,不需要配置文件
- 输出结果仅在控制台展示或输出为 JSON,不需要数据库

---

## Summary

### 应用特定类型 (3 个)
1. **AppConfig**: 应用配置
2. **ExampleResult**: 示例执行结果
3. **DemoOutput**: 演示输出

### 复用 SDK 类型 (8+ 个)
- 配置类型: `TushareConfig`
- 响应类型: `TushareResponse`, `TushareResponseData`
- 错误类型: `ApiError`, `ApiErrorType`
- 数据模型: `StockBasicItem`, `DailyQuoteItem`, `TradeCalItem` 等

### 设计原则
- ✅ 最小化自定义类型,优先复用 SDK 类型
- ✅ 所有类型都有 JSDoc 注释
- ✅ 启用严格类型检查,禁止 `any`
- ✅ 提供类型守卫和验证函数
- ✅ 清晰的数据流和状态转换

**状态**: 数据模型设计完成,可以进入契约定义阶段
