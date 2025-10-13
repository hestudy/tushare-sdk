# Quick Start: 演示应用财务数据功能集成

**Feature**: 011- | **Date**: 2025-10-13

## 概述

本指南帮助开发者快速理解和实施财务数据示例集成功能,5分钟内完成核心代码理解并准备开始实现。

---

## 1. 核心概念(30秒)

**What**: 将现有的独立财务数据示例集成到演示应用主框架

**Why**: 让用户可以通过统一的命令行接口运行财务数据示例,与其他示例保持一致的体验

**How**: 适配 financial-data.ts 接口 + 注册到 index.ts + 扩展类型定义

---

## 2. 3 个关键文件(1分钟)

### 2.1 `apps/node-demo/src/types.ts`
**作用**: 添加 'financial-data' 到 ExampleName 类型

**修改**:
```typescript
export type ExampleName =
  'stock-list' | 'daily-data' | 'trade-calendar' | 'daily-basic' |
  'financial-data' |  // ← 新增这一行
  'all';
```

### 2.2 `apps/node-demo/src/examples/financial-data.ts`
**作用**: 适配示例函数接口,使其符合演示框架规范

**核心变更**:
```typescript
// Before (current)
export async function runFinancialExamples() { ... }

// After (target)
export async function runFinancialDataExample(config: AppConfig): Promise<FinancialDataResult> { ... }
```

### 2.3 `apps/node-demo/src/index.ts`
**作用**: 注册财务数据示例

**核心变更**:
```typescript
// 1. 导入
import { runFinancialDataExample } from './examples/financial-data.js';

// 2. 注册
const allExamples = [
  // ... 现有示例 ...
  {
    name: '财务数据查询',
    key: 'financial-data' as const,
    fn: async () => runFinancialDataExample(config),
  },
];

// 3. 参数解析(在 parseArgs 函数中)
if (exampleValue === '...' || exampleValue === 'financial-data' || ...) {
  example = exampleValue;
}
```

---

## 3. 实现步骤(2分钟)

### Step 1: 扩展类型定义
```bash
# 文件: apps/node-demo/src/types.ts
# 行号: 84
# 操作: 在 ExampleName 类型中添加 'financial-data'
```

### Step 2: 适配 financial-data.ts
```bash
# 文件: apps/node-demo/src/examples/financial-data.ts
# 操作:
#   1. 重命名主函数: runFinancialExamples → runFinancialDataExample
#   2. 添加参数: config: AppConfig
#   3. 修改返回类型: Promise<FinancialDataResult>
#   4. 使用 logger 工具替代 console.log
#   5. 返回结构化数据对象
```

### Step 3: 注册示例
```bash
# 文件: apps/node-demo/src/index.ts
# 操作:
#   1. 导入 runFinancialDataExample (行号: ~20)
#   2. 注册到 allExamples 数组 (行号: ~106)
#   3. 添加参数解析逻辑 (行号: ~44)
```

### Step 4: 验证集成
```bash
# 运行单个示例
npm start -- --example=financial-data

# 运行所有示例(包含 financial-data)
npm start

# verbose 模式
npm start -- --example=financial-data --verbose

# JSON 输出
npm start -- --example=financial-data --format=json
```

---

## 4. 代码示例(1.5分钟)

### 4.1 适配后的 financial-data.ts 主函数

```typescript
/**
 * 执行财务数据查询示例
 *
 * @param config - 应用配置
 * @returns 财务数据查询结果
 */
export async function runFinancialDataExample(config: AppConfig): Promise<FinancialDataResult> {
  const client = new TushareClient({
    token: config.tushareToken,
    endpoint: config.apiBaseUrl,
  });

  // 初始化结果对象
  const result: FinancialDataResult = {
    reports: {
      incomeStatement: [],
      balanceSheet: [],
      cashFlow: [],
    },
    calculatedMetrics: {},
    summary: {
      totalRecords: 0,
      reportTypes: 0,
      analysisComplete: false,
      stockCodes: [],
      periods: [],
    },
  };

  try {
    // 1. 查询利润表
    logApiRequest('getIncomeStatement', { ts_code: '000001.SZ', period: '20231231' });
    const startTime = Date.now();
    result.reports.incomeStatement = await client.getIncomeStatement({
      ts_code: '000001.SZ',
      period: '20231231',
    });
    logApiResponse('getIncomeStatement', result.reports.incomeStatement, Date.now() - startTime);

    // 2. 查询资产负债表
    result.reports.balanceSheet = await client.getBalanceSheet({
      ts_code: '600519.SH',
      period: '20231231',
    });

    // 3. 查询现金流量表
    result.reports.cashFlow = await client.getCashFlow({
      ts_code: '000001.SZ',
      start_date: '20230101',
      end_date: '20231231',
    });

    // 4. 计算财务指标
    result.calculatedMetrics = calculateMetrics(result.reports);

    // 5. 构建摘要
    result.summary = buildSummary(result.reports);

    return result;

  } catch (error) {
    printError(error);
    throw error;  // 让 example-runner 统一处理
  }
}
```

### 4.2 辅助函数示例

```typescript
/**
 * 计算财务指标
 */
function calculateMetrics(reports: FinancialDataResult['reports']): FinancialDataResult['calculatedMetrics'] {
  const metrics: FinancialDataResult['calculatedMetrics'] = {};

  // 净利率
  if (reports.incomeStatement.length > 0) {
    const income = reports.incomeStatement[0];
    if (income.total_revenue && income.n_income_attr_p) {
      metrics.netProfitMargin = (income.n_income_attr_p / income.total_revenue) * 100;
    }
  }

  // 流动比率
  if (reports.balanceSheet.length > 0) {
    const balance = reports.balanceSheet[0];
    if (balance.total_cur_assets && balance.total_cur_liab) {
      metrics.currentRatio = balance.total_cur_assets / balance.total_cur_liab;
    }
  }

  return metrics;
}

/**
 * 构建摘要信息
 */
function buildSummary(reports: FinancialDataResult['reports']): FinancialDataResult['summary'] {
  const totalRecords =
    reports.incomeStatement.length +
    reports.balanceSheet.length +
    reports.cashFlow.length;

  const reportTypes =
    (reports.incomeStatement.length > 0 ? 1 : 0) +
    (reports.balanceSheet.length > 0 ? 1 : 0) +
    (reports.cashFlow.length > 0 ? 1 : 0);

  const stockCodes = Array.from(new Set([
    ...reports.incomeStatement.map(item => item.ts_code),
    ...reports.balanceSheet.map(item => item.ts_code),
    ...reports.cashFlow.map(item => item.ts_code),
  ]));

  const periods = Array.from(new Set([
    ...reports.incomeStatement.map(item => item.end_date),
    ...reports.balanceSheet.map(item => item.end_date),
    ...reports.cashFlow.map(item => item.end_date),
  ]));

  return {
    totalRecords,
    reportTypes,
    analysisComplete: reportTypes > 0,
    stockCodes,
    periods,
  };
}
```

---

## 5. 测试检查清单

运行以下命令验证实现:

- [ ] `npm start -- --example=financial-data` 成功运行
- [ ] `npm start` (all 模式)包含财务数据示例
- [ ] `npm start -- --example=financial-data --verbose` 输出详细日志
- [ ] `npm start -- --example=financial-data --format=json` 输出 JSON
- [ ] 错误处理:使用无效 token 测试错误提示
- [ ] TypeScript 编译通过:`npm run build`

---

## 6. 关键注意事项

### ✅ Do
- 使用 `logApiRequest` / `logApiResponse` 记录 API 调用
- 使用 `printError` 处理错误
- 返回结构化数据对象,由 formatter 统一处理输出
- 保持与其他示例一致的代码风格

### ❌ Don't
- 不要在示例函数中直接输出到控制台(除 verbose 日志外)
- 不要自定义错误处理逻辑,使用统一工具
- 不要修改现有示例的代码
- 不要在 financial-data.ts 中导入 example-runner 或 formatter

---

## 7. 常见问题

### Q1: 为什么要重构 runFinancialExamples?
**A**: 现有函数直接输出到控制台,不符合演示框架的"数据返回 → formatter 处理"模式。重构后统一由框架处理输出格式(console/JSON)。

### Q2: 现有的5个子示例函数需要删除吗?
**A**: 不需要。保留它们作为内部函数,在主函数中调用。可以根据 verbose 模式决定是否输出详细信息。

### Q3: 如何处理数据缺失?
**A**: 使用可选字段(?)和 undefined。计算指标时检查必需字段,缺失时跳过计算。

### Q4: 是否需要添加自动化测试?
**A**: 非强制。演示应用以手动测试为主。如果需要,可以添加集成测试验证示例注册和参数解析逻辑。

---

## 8. 下一步

完成上述实现后:
1. 运行测试检查清单
2. 提交代码前运行 `npm run lint` 和 `npm run build`
3. 查看 [tasks.md](./tasks.md) 了解详细的实现任务清单(待生成)

---

## 9. 参考资料

- [Feature Spec](./spec.md) - 完整的功能规范
- [Research](./research.md) - 技术决策和最佳实践
- [Data Model](./data-model.md) - 数据结构定义
- [Interface Contract](./contracts/financial-data-interface.md) - 接口契约
- [Project Constitution](../../.specify/memory/constitution.md) - 项目开发准则

---

**预计实现时间**: 1-2 小时
**难度**: ⭐⭐☆☆☆ (中等偏易)
**风险**: 低(主要是集成工作,不涉及新功能开发)
