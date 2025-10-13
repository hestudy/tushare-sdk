# Financial Data Example Interface Contract

**Feature**: 011- | **Version**: 1.0.0 | **Date**: 2025-10-13

## Overview

本文档定义了财务数据示例模块与演示应用框架之间的接口契约,确保集成的一致性和可维护性。

---

## 1. Module Interface

### 1.1 Exported Function

**函数签名**:
```typescript
export async function runFinancialDataExample(
  config: AppConfig
): Promise<FinancialDataResult>
```

**契约**:
- **输入**: `config: AppConfig` - 应用配置对象,包含 Tushare token 和 API endpoint
- **输出**: `Promise<FinancialDataResult>` - 包含三大报表数据、计算指标和摘要的结果对象
- **异常**: 当 API 调用失败时抛出异常(由 example-runner 捕获)

**职责**:
1. 创建 TushareClient 实例
2. 查询利润表、资产负债表、现金流量表数据
3. 计算财务指标(净利率、流动比率等)
4. 返回结构化结果对象

**不变量**:
- 函数必须是异步的(返回 Promise)
- 函数不应有副作用(除了 API 调用和日志记录)
- 函数必须使用传入的 config,不应访问全局状态

---

### 1.2 Input Contract

**类型定义**:
```typescript
interface AppConfig {
  tushareToken: string;      // Tushare API token
  apiBaseUrl: string;        // API endpoint URL
  debug: boolean;            // 调试模式标志
}
```

**前置条件**:
- `tushareToken` 必须为非空字符串
- `apiBaseUrl` 必须为有效的 URL
- `debug` 可以为任意布尔值

**示例**:
```typescript
const config: AppConfig = {
  tushareToken: 'your-token-here',
  apiBaseUrl: 'http://api.tushare.pro',
  debug: false,
};
```

---

### 1.3 Output Contract

**类型定义**:
```typescript
interface FinancialDataResult {
  reports: {
    incomeStatement: unknown[];
    balanceSheet: unknown[];
    cashFlow: unknown[];
  };
  calculatedMetrics: {
    netProfitMargin?: number;
    currentRatio?: number;
    quickRatio?: number;
    debtRatio?: number;
    roe?: number;
  };
  summary: {
    totalRecords: number;
    reportTypes: number;
    analysisComplete: boolean;
    stockCodes: string[];
    periods: string[];
  };
}
```

**后置条件**:
- `reports` 对象的所有数组字段必须存在(可以为空数组)
- `calculatedMetrics` 的所有字段为可选,缺失数据时为 undefined
- `summary.totalRecords` 必须等于三个报表数组长度之和
- `summary.reportTypes` 必须在 [0, 3] 范围内
- `summary.analysisComplete` 为 true 时,至少有一个报表数组非空

**示例**:
```typescript
const result: FinancialDataResult = {
  reports: {
    incomeStatement: [{...}, {...}],
    balanceSheet: [{...}],
    cashFlow: [{...}],
  },
  calculatedMetrics: {
    netProfitMargin: 45.32,
    currentRatio: 1.85,
    debtRatio: 23.5,
  },
  summary: {
    totalRecords: 4,
    reportTypes: 3,
    analysisComplete: true,
    stockCodes: ['600519.SH', '000001.SZ'],
    periods: ['20231231', '20221231'],
  },
};
```

---

### 1.4 Error Contract

**异常类型**:
- `ApiError`: Tushare API 调用失败
- `AuthenticationError`: Token 无效或过期
- `NetworkError`: 网络连接失败
- `Error`: 其他未知错误

**异常处理契约**:
1. 所有异常必须被捕获并记录日志(使用 `printError`)
2. 异常必须重新抛出,由 example-runner 统一处理
3. 异常信息必须包含足够的上下文(API 名称、参数等)

**示例**:
```typescript
try {
  const data = await client.getIncomeStatement(params);
} catch (error) {
  printError(error);  // 记录日志
  throw error;        // 重新抛出
}
```

---

## 2. Integration Points

### 2.1 Type System Integration

**文件**: `apps/node-demo/src/types.ts`

**变更**:
```typescript
// Before
export type ExampleName = 'stock-list' | 'daily-data' | 'trade-calendar' | 'daily-basic' | 'all';

// After
export type ExampleName = 'stock-list' | 'daily-data' | 'trade-calendar' | 'daily-basic' | 'financial-data' | 'all';
```

**契约**:
- `ExampleName` 类型必须包含 `'financial-data'` 字面量
- 顺序不重要,但应与其他示例保持一致的风格

---

### 2.2 Example Registration

**文件**: `apps/node-demo/src/index.ts`

**导入契约**:
```typescript
import { runFinancialDataExample } from './examples/financial-data.js';
```

**注册契约**:
```typescript
const allExamples = [
  // ... 其他示例 ...
  {
    name: '财务数据查询',          // 示例显示名称
    key: 'financial-data' as const,  // 示例标识符
    fn: async () => runFinancialDataExample(config),  // 执行函数
  },
];
```

**不变量**:
- `name` 必须为描述性的中文名称
- `key` 必须与 `ExampleName` 类型中的字面量匹配
- `fn` 必须为接受 config 并返回结果的异步函数
- 注册顺序决定在 `--example=all` 模式下的执行顺序

---

### 2.3 Parameter Parsing Integration

**文件**: `apps/node-demo/src/index.ts`

**解析逻辑契约**:
```typescript
if (exampleValue === 'stock-list' || exampleValue === 'daily-data' ||
    exampleValue === 'trade-calendar' || exampleValue === 'daily-basic' ||
    exampleValue === 'financial-data' ||  // 新增
    exampleValue === 'all') {
  example = exampleValue;
}
```

**不变量**:
- 参数解析逻辑必须包含对 `'financial-data'` 的检查
- 解析失败时默认使用 `'all'`

---

## 3. Logging Contract

### 3.1 API Call Logging

**工具**: `apps/node-demo/src/utils/logger.ts`

**使用契约**:
```typescript
import { logApiRequest, logApiResponse, logVerbose } from '../utils/logger.js';

// 记录 API 请求(在调用前)
logApiRequest('getIncomeStatement', { ts_code: '000001.SZ', period: '20231231' });

// 记录 API 响应(在调用后)
const startTime = Date.now();
const data = await client.getIncomeStatement(params);
const duration = Date.now() - startTime;
logApiResponse('getIncomeStatement', data, duration);

// 记录详细信息(verbose 模式)
logVerbose('财务指标计算完成', { metrics: calculatedMetrics });
```

**不变量**:
- 所有 API 调用必须记录请求和响应
- 日志格式必须与其他示例一致
- verbose 日志仅在 `--verbose` 模式下输出

---

## 4. Output Format Contract

### 4.1 Console Output

**工具**: `apps/node-demo/src/utils/formatter.ts`

**契约**:
- 示例函数只负责返回数据,不直接输出到控制台(除 verbose 日志外)
- formatter 工具根据 `--format` 参数决定输出格式
- console 模式下应显示易读的表格或结构化文本
- JSON 模式下应序列化为有效的 JSON 字符串

**示例输出(Console)**:
```
========================================
财务数据查询示例
========================================

✓ 利润表查询成功: 2 条记录
✓ 资产负债表查询成功: 1 条记录
✓ 现金流量表查询成功: 1 条记录

财务指标:
  净利率:       45.32%
  流动比率:     1.85
  资产负债率:   23.50%

========================================
```

**示例输出(JSON)**:
```json
{
  "reports": { "incomeStatement": [...], ... },
  "calculatedMetrics": { "netProfitMargin": 45.32, ... },
  "summary": { "totalRecords": 4, ... }
}
```

---

## 5. Error Handling Contract

### 5.1 Error Reporting

**工具**: `apps/node-demo/src/utils/error-handler.ts`

**使用契约**:
```typescript
import { printError } from '../utils/error-handler.js';

try {
  // API 调用或业务逻辑
} catch (error) {
  printError(error);  // 格式化错误信息
  throw error;        // 重新抛出给上层处理
}
```

**契约**:
- 所有捕获的错误必须使用 `printError` 记录
- 错误必须重新抛出,由 example-runner 包装为 `ExampleResult.error`
- 错误信息应包含:错误类型、消息、API 名称(如果适用)

---

## 6. Backward Compatibility

### 6.1 Non-Breaking Changes

**保证**:
- 现有示例的运行不受影响
- `--example=all` 包含所有示例(包括新增的 financial-data)
- 命令行参数解析向后兼容

**测试**:
```bash
# 现有示例应正常运行
npm start -- --example=stock-list
npm start -- --example=daily-data

# 新示例应正常运行
npm start -- --example=financial-data

# all 模式应包含所有示例
npm start -- --example=all
```

---

## 7. Version History

| Version | Date       | Changes                          |
|---------|------------|----------------------------------|
| 1.0.0   | 2025-10-13 | 初始版本,定义财务数据示例接口契约  |

---

## Summary

本契约文档定义了:
1. ✅ **模块接口**: runFinancialDataExample 函数签名
2. ✅ **输入输出契约**: 类型定义和约束
3. ✅ **错误处理契约**: 异常类型和处理方式
4. ✅ **集成点**: 类型系统、示例注册、参数解析
5. ✅ **日志契约**: API 调用日志和 verbose 日志
6. ✅ **输出格式契约**: console 和 JSON 输出规范
7. ✅ **向后兼容**: 保证现有功能不受影响

所有契约遵循:
- 与现有示例保持一致
- 类型安全
- 明确的职责边界
- 易于测试和维护
