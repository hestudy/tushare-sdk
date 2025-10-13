# Data Model: 演示应用财务数据功能集成

**Feature**: 011- | **Date**: 2025-10-13

## Overview

本文档定义了财务数据示例集成所涉及的数据实体、类型定义和数据流。

---

## 1. Core Entities

### 1.1 ExampleName (Type Extension)

**描述**: 示例名称枚举类型,用于命令行参数解析和示例筛选。

**定义**:
```typescript
export type ExampleName =
  | 'stock-list'
  | 'daily-data'
  | 'trade-calendar'
  | 'daily-basic'
  | 'financial-data'  // 新增
  | 'all';
```

**字段说明**:
- 所有值均为字符串字面量类型
- `'financial-data'`: 财务数据示例标识符
- `'all'`: 运行所有示例的特殊标识符

**验证规则**:
- 必须是上述字符串之一
- 在命令行参数解析时进行验证

**状态转换**: N/A (静态类型,无状态)

---

### 1.2 FinancialDataResult

**描述**: 财务数据示例的执行结果,包含查询到的三大报表数据、计算的财务指标和摘要信息。

**定义**:
```typescript
export interface FinancialDataResult {
  /**
   * 三大报表查询结果
   */
  reports: {
    /**
     * 利润表数据数组
     */
    incomeStatement: IncomeStatementItem[];

    /**
     * 资产负债表数据数组
     */
    balanceSheet: BalanceSheetItem[];

    /**
     * 现金流量表数据数组
     */
    cashFlow: CashFlowItem[];
  };

  /**
   * 基于原始数据计算的财务指标
   */
  calculatedMetrics: {
    /**
     * 净利率 (净利润 / 营业收入)
     */
    netProfitMargin?: number;

    /**
     * 流动比率 (流动资产 / 流动负债)
     */
    currentRatio?: number;

    /**
     * 速动比率 ((流动资产 - 存货) / 流动负债)
     */
    quickRatio?: number;

    /**
     * 资产负债率 (负债合计 / 总资产)
     */
    debtRatio?: number;

    /**
     * ROE (简化) (净利润 / 未分配利润)
     */
    roe?: number;
  };

  /**
   * 执行摘要
   */
  summary: {
    /**
     * 查询到的总记录数(跨所有报表)
     */
    totalRecords: number;

    /**
     * 成功查询的报表类型数量
     */
    reportTypes: number;

    /**
     * 是否完成综合分析
     */
    analysisComplete: boolean;

    /**
     * 查询的股票代码列表
     */
    stockCodes: string[];

    /**
     * 查询的报告期列表
     */
    periods: string[];
  };
}
```

**字段说明**:
- `reports`: 包含三大报表的原始查询结果
- `calculatedMetrics`: 所有指标为可选,当数据不足以计算时为 undefined
- `summary`: 提供高层次的执行摘要信息

**验证规则**:
- `totalRecords` 必须 >= 0
- `reportTypes` 取值范围 [0, 3]
- `netProfitMargin`, `debtRatio` 等比率可以为负数或大于1(金融行业特殊情况)
- 当 `analysisComplete = true` 时,至少应有一个 `calculatedMetrics` 不为 undefined

**状态转换**: N/A (查询结果,只读数据)

---

### 1.3 IncomeStatementItem

**描述**: 利润表单条记录,来自 SDK API 返回数据。

**定义**:
```typescript
/**
 * 利润表数据项(简化,仅包含示例中使用的字段)
 */
export interface IncomeStatementItem {
  ts_code: string;           // 股票代码
  end_date: string;          // 报告期
  ann_date: string;          // 公告日期
  total_revenue?: number;    // 营业总收入
  revenue?: number;          // 营业收入
  n_income_attr_p?: number;  // 净利润(归母)
  basic_eps?: number;        // 基本每股收益
  diluted_eps?: number;      // 稀释每股收益
}
```

**字段说明**:
- 所有金额字段单位为元(人民币)
- 可选字段表示 Tushare API 可能不返回该字段

**验证规则**:
- `ts_code` 格式: 6位数字 + '.' + 交易所代码(SZ/SH)
- `end_date`, `ann_date` 格式: YYYYMMDD

---

### 1.4 BalanceSheetItem

**描述**: 资产负债表单条记录。

**定义**:
```typescript
/**
 * 资产负债表数据项(简化)
 */
export interface BalanceSheetItem {
  ts_code: string;            // 股票代码
  end_date: string;           // 报告期
  total_assets?: number;      // 总资产
  total_cur_assets?: number;  // 流动资产
  total_nca?: number;         // 非流动资产
  total_cur_liab?: number;    // 流动负债
  total_ncl?: number;         // 非流动负债
  money_cap?: number;         // 货币资金
  inventories?: number;       // 存货
  fix_assets?: number;        // 固定资产
  undistr_porfit?: number;    // 未分配利润
}
```

**字段说明**:
- 金额单位为元
- 资产类字段(assets)应为正数
- 负债类字段(liab)应为正数

**验证规则**:
- `total_assets` 应约等于 `total_cur_assets + total_nca`
- `total_cur_assets` 应大于等于 `money_cap + inventories`

---

### 1.5 CashFlowItem

**描述**: 现金流量表单条记录。

**定义**:
```typescript
/**
 * 现金流量表数据项(简化)
 */
export interface CashFlowItem {
  ts_code: string;                // 股票代码
  end_date: string;               // 报告期
  n_cashflow_act?: number;        // 经营活动现金流净额
  n_cashflow_inv_act?: number;    // 投资活动现金流净额
  n_cash_flows_fnc_act?: number;  // 筹资活动现金流净额
  n_incr_cash_cash_equ?: number;  // 现金净增加额
  free_cashflow?: number;         // 自由现金流
}
```

**字段说明**:
- 金额单位为元
- 现金流可以为负数(现金流出)

**验证规则**:
- `n_incr_cash_cash_equ` 应约等于三大活动现金流之和

---

## 2. Data Flow

### 2.1 示例执行流程

```
用户执行命令
    ↓
index.ts 解析参数
    ↓
筛选示例列表 (包含 financial-data)
    ↓
example-runner.ts 执行示例
    ↓
runFinancialDataExample(config)
    ├─→ 创建 TushareClient
    ├─→ 查询利润表 → IncomeStatementItem[]
    ├─→ 查询资产负债表 → BalanceSheetItem[]
    ├─→ 查询现金流量表 → CashFlowItem[]
    ├─→ 计算财务指标 → calculatedMetrics
    └─→ 构建摘要 → summary
    ↓
返回 FinancialDataResult
    ↓
包装为 ExampleResult
    ↓
formatter.ts 格式化输出
    ↓
输出到控制台或 JSON
```

### 2.2 数据转换

```
SDK API 响应 (Tushare 格式)
    ↓
解构为业务对象 (IncomeStatementItem, BalanceSheetItem, CashFlowItem)
    ↓
应用业务逻辑 (计算财务指标)
    ↓
聚合为结果对象 (FinancialDataResult)
    ↓
包装为统一格式 (ExampleResult)
    ↓
序列化输出 (Console / JSON)
```

---

## 3. Error Handling

### 3.1 数据缺失处理

**场景**: API 返回空数组或部分字段为 null/undefined

**策略**:
- 返回空数组时,在 summary 中记录 `totalRecords = 0`
- 字段为 null/undefined 时,跳过该字段的计算,对应的 calculatedMetrics 为 undefined
- 在 console 输出中显示 "N/A"

**示例**:
```typescript
// 安全计算净利率
if (income.total_revenue && income.n_income_attr_p) {
  metrics.netProfitMargin = (income.n_income_attr_p / income.total_revenue) * 100;
} else {
  metrics.netProfitMargin = undefined;  // 数据不足,无法计算
}
```

### 3.2 API 调用失败

**场景**: 网络错误、认证失败、API 限流等

**策略**:
- 在 runFinancialDataExample 中捕获异常
- 使用 printError 工具记录错误
- 抛出异常给 example-runner 统一处理
- example-runner 将错误包装为 ExampleResult.error

**示例**:
```typescript
try {
  const data = await client.getIncomeStatement(params);
} catch (error) {
  printError(error);
  throw error;  // 交给上层处理
}
```

---

## 4. Type Definitions Summary

### 新增类型

**文件**: `apps/node-demo/src/types.ts`

```typescript
// 扩展 ExampleName 类型
export type ExampleName =
  | 'stock-list'
  | 'daily-data'
  | 'trade-calendar'
  | 'daily-basic'
  | 'financial-data'  // NEW
  | 'all';
```

### 内部类型(可选,在 financial-data.ts 中定义)

```typescript
/**
 * 财务数据示例返回结果
 */
export interface FinancialDataResult {
  reports: {
    incomeStatement: unknown[];  // 使用 unknown 保持灵活性
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

**注**: IncomeStatementItem, BalanceSheetItem, CashFlowItem 由 SDK 包提供,演示应用无需重新定义。

---

## 5. Data Constraints

### 业务约束

1. **查询限制**:
   - 单次查询不应超过100个报告期
   - API 调用间隔应遵守 Tushare 频率限制

2. **数据完整性**:
   - 财务指标计算需要完整的必需字段
   - 缺失字段时优雅降级,不影响其他指标计算

3. **展示限制**:
   - 在 verbose 模式下展示详细数据
   - 在 all 模式下只展示摘要,避免输出过长

### 技术约束

1. **类型安全**:
   - 所有公共接口必须有明确的类型定义
   - 避免使用 any 类型

2. **向后兼容**:
   - 新增字段必须为可选,不影响现有代码
   - ExampleName 扩展不应破坏现有示例的运行

---

## 6. Future Extensibility

### 可扩展点

1. **新增报表类型**: 在 reports 对象中添加新字段
2. **新增财务指标**: 在 calculatedMetrics 中添加新字段
3. **多期对比**: 扩展 summary 包含历史数据对比
4. **图表展示**: 在 verbose 模式下使用 ASCII 图表

### 不变约束

1. **接口签名**: `runFinancialDataExample(config: AppConfig)` 保持不变
2. **返回类型**: 必须可序列化为 JSON
3. **错误处理**: 必须使用统一的错误处理机制

---

## Summary

本数据模型文档定义了:
1. ✅ 核心实体:ExampleName 扩展、FinancialDataResult、三大报表数据项
2. ✅ 数据流:从命令解析到输出的完整流程
3. ✅ 错误处理:数据缺失和 API 失败的处理策略
4. ✅ 类型定义:TypeScript 类型声明
5. ✅ 约束条件:业务和技术约束
6. ✅ 可扩展性:未来功能扩展点

所有实体设计遵循:
- 类型安全
- 可选字段应对数据缺失
- 与现有代码结构一致
- 支持多种输出格式
