# Data Model: SDK财务数据功能测试

**Date**: 2025-10-13
**Feature**: 010-sdk (SDK财务数据功能测试)
**Status**: Phase 1 Design

本文档定义测试数据模型和测试用例结构。

## 核心实体

### 1. TestClient (测试客户端)

**用途**: Mock的TushareClient实例,用于单元测试

**属性**:
- `token`: string - Mock token (固定值: "test_token")
- `query`: MockedFunction - Mock的query方法

**创建方式**:
```typescript
beforeEach(() => {
  client = new TushareClient({ token: 'test_token' });
  mockQuery = vi.fn();
  // @ts-expect-error - Mocking query method for testing
  client.query = mockQuery;
});
```

**生命周期**: 每个测试用例独立创建,避免状态污染

---

### 2. MockFinancialData (Mock财务数据)

**用途**: 用于单元测试的模拟财务数据

#### 2.1 MockIncomeStatement (Mock利润表)

**最小完整数据** (包含所有必填字段):
```typescript
{
  ts_code: '000001.SZ',
  ann_date: '20240430',
  f_ann_date: '20240430',
  end_date: '20231231',
  report_type: '4',
  comp_type: '1',
  end_type: '4'
}
```

**完整测试数据** (包含常用可选字段):
```typescript
{
  // 必填字段
  ts_code: '000001.SZ',
  ann_date: '20240430',
  f_ann_date: '20240430',
  end_date: '20231231',
  report_type: '4',
  comp_type: '1',
  end_type: '4',

  // 每股指标
  basic_eps: 2.34,
  diluted_eps: 2.30,

  // 收入指标
  total_revenue: 189234567890,
  revenue: 189234567890,

  // 利润指标
  operate_profit: 56789012345,
  total_profit: 58901234567,
  n_income: 45678901234,
  n_income_attr_p: 45000000000,

  // 成本费用
  total_cogs: 132445555555,
  oper_cost: 100000000000,
  sell_exp: 15000000000,
  admin_exp: 10000000000,
  rd_exp: 5000000000,
  fin_exp: 2445555555
}
```

**字段验证规则**:
- `ts_code`: 格式必须为 `XXXXXX.SZ/SH` (6位数字 + 后缀)
- `*_date`: 格式必须为 `YYYYMMDD` (8位数字)
- `report_type`: 必须为 '1'|'2'|'3'|'4'
- `comp_type`: 必须为 '1'|'2'|'3'|'4'
- `end_type`: 必须为 '1'|'2'|'3'|'4'
- 数值字段: number | undefined (可选字段可以为undefined)

#### 2.2 MockBalanceSheet (Mock资产负债表)

**最小完整数据**:
```typescript
{
  ts_code: '000001.SZ',
  ann_date: '20240430',
  f_ann_date: '20240430',
  end_date: '20231231',
  report_type: '4',
  comp_type: '1',
  end_type: '4'
}
```

**完整测试数据**:
```typescript
{
  // 必填字段
  ts_code: '000001.SZ',
  ann_date: '20240430',
  f_ann_date: '20240430',
  end_date: '20231231',
  report_type: '4',
  comp_type: '1',
  end_type: '4',

  // 资产
  total_assets: 5678901234567,
  total_cur_assets: 2000000000000,
  total_nca: 3678901234567,
  money_cap: 500000000000,
  accounts_receiv: 300000000000,
  inventories: 200000000000,
  fix_assets: 1500000000000,

  // 负债
  total_cur_liab: 1500000000000,
  total_ncl: 2000000000000,
  st_borr: 400000000000,
  lt_borr: 1000000000000,

  // 所有者权益
  total_share: 50000000000,
  cap_rese: 800000000000,
  undistr_porfit: 1328901234567
}
```

#### 2.3 MockCashFlow (Mock现金流量表)

**最小完整数据**:
```typescript
{
  ts_code: '000001.SZ',
  ann_date: '20240430',
  f_ann_date: '20240430',
  end_date: '20231231',
  comp_type: '1',
  report_type: '4',
  end_type: '4'
}
```

**完整测试数据**:
```typescript
{
  // 必填字段
  ts_code: '000001.SZ',
  ann_date: '20240430',
  f_ann_date: '20240430',
  end_date: '20231231',
  comp_type: '1',
  report_type: '4',
  end_type: '4',

  // 经营活动现金流
  n_cashflow_act: 60000000000,
  c_fr_sale_sg: 200000000000,
  c_paid_goods_s: 100000000000,
  c_paid_to_for_empl: 30000000000,
  c_paid_for_taxes: 10000000000,

  // 投资活动现金流
  n_cashflow_inv_act: -30000000000,
  c_pay_acq_const_fiolta: 35000000000,
  c_recp_return_invest: 5000000000,

  // 筹资活动现金流
  n_cash_flows_fnc_act: 15000000000,
  c_recp_borrow: 50000000000,
  c_prepay_amt_borr: 35000000000,

  // 现金汇总
  n_incr_cash_cash_equ: 45000000000,
  c_cash_equ_beg_period: 100000000000,
  c_cash_equ_end_period: 145000000000
}
```

---

### 3. TestScenario (测试场景)

**用途**: 定义测试用例的结构

**结构**:
```typescript
interface TestScenario {
  id: string;              // 测试用例ID (如 "US1-SC1")
  description: string;     // 测试描述
  arrange: {               // 准备阶段
    mockData: any[];       // Mock数据
    params?: object;       // 输入参数
  };
  act: {                   // 执行阶段
    function: string;      // 被测试的函数名
    args: any[];           // 函数参数
  };
  assert: {                // 验证阶段
    queryCalledWith: [string, any]; // 验证query调用参数
    result: any;           // 预期结果
  };
}
```

**示例**:
```typescript
const scenario: TestScenario = {
  id: 'US1-SC1',
  description: '调用getIncomeStatement传入查询参数,验证正确调用query方法',
  arrange: {
    mockData: [mockIncomeStatementItem],
    params: {
      ts_code: '000001.SZ',
      period: '20231231'
    }
  },
  act: {
    function: 'getIncomeStatement',
    args: [client, { ts_code: '000001.SZ', period: '20231231' }]
  },
  assert: {
    queryCalledWith: ['income', { ts_code: '000001.SZ', period: '20231231' }],
    result: [mockIncomeStatementItem]
  }
};
```

---

### 4. IntegrationTestData (集成测试数据)

**用途**: 用于集成测试的真实API调用参数

#### 4.1 有效测试股票

```typescript
const validStocks = [
  { ts_code: '000001.SZ', name: '平安银行' },
  { ts_code: '600519.SH', name: '贵州茅台' },
  { ts_code: '000858.SZ', name: '五粮液' }
];
```

#### 4.2 有效报告期

```typescript
const validPeriods = [
  '20231231',  // 2023年报
  '20230930',  // 2023三季报
  '20230630',  // 2023中报
  '20230331'   // 2023一季报
];
```

#### 4.3 测试参数组合

```typescript
const testCases = [
  {
    name: '查询平安银行2023年报',
    params: {
      ts_code: '000001.SZ',
      period: '20231231'
    }
  },
  {
    name: '查询贵州茅台2023年报',
    params: {
      ts_code: '600519.SH',
      period: '20231231'
    }
  },
  {
    name: '按日期范围查询',
    params: {
      ts_code: '000001.SZ',
      start_date: '20230101',
      end_date: '20231231'
    }
  }
];
```

#### 4.4 错误场景数据

```typescript
const errorScenarios = [
  {
    name: '无效股票代码',
    params: { ts_code: '999999.SH', period: '20231231' },
    expectedResult: []  // 应返回空数组
  },
  {
    name: '无效token',
    token: 'invalid_token_12345',
    params: { ts_code: '000001.SZ', period: '20231231' },
    expectError: true
  },
  {
    name: '未来日期',
    params: { ts_code: '000001.SZ', period: '20991231' },
    expectedResult: []  // 应返回空数组
  }
];
```

---

## 数据关系图

```
TestClient (Mock)
    ↓ 使用
API Functions (getIncomeStatement, getBalanceSheet, getCashFlow)
    ↓ 返回
MockFinancialData (单元测试) / RealFinancialData (集成测试)
    ↓ 验证
TypeScript Type Definitions (IncomeStatementItem, BalanceSheetItem, CashFlowItem)
```

---

## 测试数据生成策略

### 单元测试数据生成

**原则**: 最小化mock数据,只包含必要字段

**辅助函数**:
```typescript
// 生成最小完整的利润表数据
function createMinimalIncomeStatement(overrides?: Partial<IncomeStatementItem>): IncomeStatementItem {
  return {
    ts_code: '000001.SZ',
    ann_date: '20240430',
    f_ann_date: '20240430',
    end_date: '20231231',
    report_type: '4',
    comp_type: '1',
    end_type: '4',
    ...overrides
  };
}

// 生成完整的利润表数据(包含常用字段)
function createFullIncomeStatement(overrides?: Partial<IncomeStatementItem>): IncomeStatementItem {
  return {
    ...createMinimalIncomeStatement(),
    basic_eps: 2.34,
    total_revenue: 189234567890,
    n_income_attr_p: 45000000000,
    ...overrides
  };
}
```

### 集成测试数据选择

**原则**: 使用真实、稳定、历史的数据

**选择标准**:
1. 股票必须真实存在且活跃
2. 报告期必须已公布(使用历史数据)
3. 避免使用当前年度或未来日期
4. 优先选择大盘股(数据更完整)

---

## 数据验证规则

### 1. 必填字段验证

所有三大报表都包含以下必填字段:
- `ts_code`: string
- `ann_date`: string
- `f_ann_date`: string
- `end_date`: string
- `report_type`: string
- `comp_type`: string
- `end_type`: string

**验证方法**:
```typescript
function validateRequiredFields(item: any): boolean {
  const requiredFields = [
    'ts_code', 'ann_date', 'f_ann_date',
    'end_date', 'report_type', 'comp_type', 'end_type'
  ];

  return requiredFields.every(field => {
    return typeof item[field] === 'string' && item[field].length > 0;
  });
}
```

### 2. 日期格式验证

**格式**: YYYYMMDD (8位数字)

**验证方法**:
```typescript
function validateDateFormat(date: string): boolean {
  return /^\d{8}$/.test(date);
}
```

### 3. 数值字段验证

**规则**:
- 类型必须为 `number | undefined`
- 如果有值,必须是有限数值(不是NaN或Infinity)

**验证方法**:
```typescript
function validateNumberField(value: any): boolean {
  return value === undefined || (typeof value === 'number' && Number.isFinite(value));
}
```

---

## 测试覆盖矩阵

| 功能模块 | 单元测试 | 集成测试 | 类型测试 |
|---------|---------|---------|---------|
| getIncomeStatement | ✅ 参数传递<br>✅ 返回值处理<br>✅ 异常处理 | ✅ 真实API调用<br>✅ 数据结构验证 | ✅ 类型导入<br>✅ 字段类型 |
| getBalanceSheet | ✅ 参数传递<br>✅ 返回值处理<br>✅ 异常处理 | ✅ 真实API调用<br>✅ 数据结构验证 | ✅ 类型导入<br>✅ 字段类型 |
| getCashFlow | ✅ 参数传递<br>✅ 返回值处理<br>✅ 异常处理 | ✅ 真实API调用<br>✅ 数据结构验证 | ✅ 类型导入<br>✅ 字段类型 |
| TushareClient方法 | ✅ 方法调用一致性 | ✅ 配置继承 | ✅ 方法签名 |
| 边界条件 | ✅ 空参数<br>✅ 空返回 | ✅ 无效代码<br>✅ 权限错误 | ✅ 可选字段 |

---

## 数据存储

**单元测试**: 无需持久化,所有数据在内存中mock

**集成测试**: 无需持久化,直接调用API获取数据

**测试结果**: 由vitest生成覆盖率报告,可选存储到CI系统

---

## 下一步

数据模型设计完成,准备生成:
1. 测试合约规范 (contracts/)
2. 快速开始指南 (quickstart.md)
