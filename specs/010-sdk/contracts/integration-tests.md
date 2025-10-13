# Integration Tests Contract: 财务数据集成测试规范

**Feature**: 010-sdk
**File**: `packages/tushare-sdk/tests/integration/financial.integration.test.ts`
**Purpose**: 定义财务数据功能的集成测试规范,使用真实API验证端到端流程

## 测试范围

**被测试功能**:
- 利润表数据获取 (getIncomeStatement)
- 资产负债表数据获取 (getBalanceSheet)
- 现金流量表数据获取 (getCashFlow)
- TushareClient配置(缓存、重试)
- 错误处理

**测试策略**: 使用真实Tushare API,验证实际环境中的功能表现

---

## 前置条件

### 环境变量

```typescript
const hasToken = !!process.env.TUSHARE_TOKEN;

describe.skipIf(!hasToken)('财务数据集成测试', () => {
  // 如果没有TUSHARE_TOKEN环境变量,所有测试跳过
});
```

### Client配置

```typescript
let client: TushareClient;

beforeAll(() => {
  client = new TushareClient({
    token: process.env.TUSHARE_TOKEN!,
    cache: {
      enabled: false, // 集成测试禁用缓存,确保获取真实数据
    },
    retry: {
      maxRetries: 2,
      initialDelay: 1000,
      maxDelay: 5000,
      backoffFactor: 2,
    },
  });
});
```

---

## Test Suite 1: 利润表数据获取

### ITC-001: 查询指定公司的年报利润表

**Given**:
- 有效的Tushare API token
- 用户积分 ≥ 2000

**When**:
- 调用getIncomeStatement查询平安银行(000001.SZ)的2023年报

**Then**:
- 返回数组长度 > 0
- 数据包含所有必填字段
- ts_code = '000001.SZ'
- end_date = '20231231'
- 数值字段类型正确

**测试代码**:
```typescript
it('ITC-001: 应该能够获取平安银行2023年报利润表', async () => {
  const data = await getIncomeStatement(client, {
    ts_code: '000001.SZ',
    period: '20231231'
  });

  expect(Array.isArray(data)).toBe(true);
  expect(data.length).toBeGreaterThan(0);

  const item = data[0];
  expect(item.ts_code).toBe('000001.SZ');
  expect(item.end_date).toBe('20231231');
  expect(typeof item.ann_date).toBe('string');

  // 验证数值字段
  if (item.total_revenue !== undefined) {
    expect(typeof item.total_revenue).toBe('number');
    expect(Number.isFinite(item.total_revenue)).toBe(true);
  }
}, 30000);
```

### ITC-002: 查询不同报告期类型

**测试数据**:
```typescript
const periods = [
  { period: '20231231', type: '年报' },
  { period: '20230930', type: '三季报' },
  { period: '20230630', type: '中报' },
  { period: '20230331', type: '一季报' }
];
```

**验证**: 每个报告期都能成功返回数据

### ITC-003: 按日期范围查询

**Given**: 指定start_date和end_date
**When**: 查询2023年全年数据
**Then**:
- 返回多条记录(至少4条,对应4个报告期)
- 所有记录的end_date在指定范围内

### ITC-004: 查询不存在的股票代码

**Given**: 使用无效股票代码 '999999.SH'
**When**: 调用getIncomeStatement
**Then**:
- 返回空数组 `[]`
- 不抛出异常

### ITC-005: 验证数据完整性

**Given**: 成功获取利润表数据
**When**: 检查返回数据的字段
**Then**:
- 至少包含7个必填字段
- 至少90%的字段定义被实际数据覆盖(94个字段中至少85个有值或合理缺失)

---

## Test Suite 2: 资产负债表数据获取

### ITC-006: 查询指定公司的资产负债表

**测试逻辑**: 与ITC-001类似,使用getBalanceSheet

**验证点**:
- 数据结构符合BalanceSheetItem
- 包含关键资产/负债字段(total_assets, total_cur_liab等)

### ITC-007: 验证资产负债平衡

**Given**: 成功获取资产负债表
**When**: 检查资产和负债数据
**Then**:
- total_assets应该等于(或接近)total_liab + total_equity
- 允许一定的舍入误差

**注**: 这是数据质量验证,但不强制要求(可能因数据源问题不平衡)

### ITC-008: 查询不同公司类型

**测试数据**:
```typescript
const companies = [
  { ts_code: '000001.SZ', type: '银行', comp_type: '2' },
  { ts_code: '600519.SH', type: '工商业', comp_type: '1' },
  { ts_code: '601318.SH', type: '保险', comp_type: '3' }
];
```

**验证**: 不同公司类型的数据结构一致

---

## Test Suite 3: 现金流量表数据获取

### ITC-009: 查询现金流量表

**Given**: 有效token和积分
**When**: 调用getCashFlow查询贵州茅台2023年报
**Then**:
- 返回数据包含三大活动现金流(经营、投资、筹资)
- n_cashflow_act存在且为number
- n_cashflow_inv_act存在且为number
- n_cash_flows_fnc_act存在且为number

### ITC-010: 验证现金流平衡

**Given**: 成功获取现金流量表
**When**: 计算现金净增加额
**Then**:
- n_incr_cash_cash_equ ≈ n_cashflow_act + n_cashflow_inv_act + n_cash_flows_fnc_act + eff_fx_flu_cash
- 允许一定的舍入误差

### ITC-011: 查询多个报告期

**Given**: 按日期范围查询
**When**: 查询2022-2023两年数据
**Then**:
- 返回至少8条记录(2年×4个报告期)
- 数据按时间排序

---

## Test Suite 4: TushareClient类方法测试

### ITC-012: 通过client方法调用

**Given**: TushareClient实例
**When**: 调用client.getIncomeStatement
**Then**:
- 结果与直接调用getIncomeStatement(client, params)一致
- 继承client配置(如重试机制)

**测试代码**:
```typescript
it('ITC-012: client方法应该与函数调用结果一致', async () => {
  const params = { ts_code: '000001.SZ', period: '20231231' };

  const result1 = await client.getIncomeStatement(params);
  const result2 = await getIncomeStatement(client, params);

  expect(result1).toEqual(result2);
  expect(result1.length).toBeGreaterThan(0);
}, 30000);
```

### ITC-013: 配置继承测试

**Given**: Client配置了重试机制
**When**: API请求失败
**Then**: 应该自动重试(通过日志或时间验证)

---

## Test Suite 5: 缓存机制测试

**注意**: 此套件需要启用缓存

```typescript
let cachedClient: TushareClient;

beforeAll(() => {
  cachedClient = new TushareClient({
    token: process.env.TUSHARE_TOKEN!,
    cache: {
      enabled: true,
      ttl: 3600000, // 1小时
    },
  });
});
```

### ITC-014: 第二次请求使用缓存

**Given**: 启用缓存的client
**When**:
1. 第一次请求记录响应时间t1
2. 第二次相同请求记录响应时间t2

**Then**:
- t2 < t1 * 0.5 (第二次请求至少快50%)
- 两次返回的数据一致

**测试代码**:
```typescript
it('ITC-014: 第二次相同请求应该使用缓存', async () => {
  const params = { ts_code: '000001.SZ', period: '20231231' };

  // 第一次请求
  const start1 = performance.now();
  const data1 = await cachedClient.getIncomeStatement(params);
  const time1 = performance.now() - start1;

  // 第二次请求(应该命中缓存)
  const start2 = performance.now();
  const data2 = await cachedClient.getIncomeStatement(params);
  const time2 = performance.now() - start2;

  console.log(`第一次: ${time1.toFixed(2)}ms, 第二次: ${time2.toFixed(2)}ms`);

  expect(time2).toBeLessThan(time1 * 0.5);
  expect(data1).toEqual(data2);
}, 60000);
```

---

## Test Suite 6: 错误处理

### ITC-015: 无效token应该抛出错误

**Given**: 使用无效token创建client
**When**: 调用任意财务数据方法
**Then**:
- 抛出异常
- 错误信息包含认证或权限相关字样

**测试代码**:
```typescript
it('ITC-015: 无效token应该抛出错误', async () => {
  const invalidClient = new TushareClient({
    token: 'invalid_token_12345'
  });

  await expect(
    getIncomeStatement(invalidClient, {
      ts_code: '000001.SZ',
      period: '20231231'
    })
  ).rejects.toThrow();
}, 30000);
```

### ITC-016: 权限不足应该有明确错误提示

**Given**: 使用积分不足的账户(< 2000积分)
**When**: 调用财务数据接口
**Then**:
- 抛出ApiError
- 错误信息包含积分或权限字样

**注**: 需要低积分测试账户,如无可跳过此测试

### ITC-017: 无效参数格式

**Given**: 传入错误格式的日期参数
**When**: 调用财务数据方法
**Then**:
- API返回错误或空数据
- SDK不崩溃

**测试用例**:
```typescript
await expect(
  getIncomeStatement(client, {
    trade_date: 'invalid_date'
  })
).rejects.toThrow();
```

---

## Test Suite 7: 性能测试

### ITC-018: 单次查询响应时间

**Given**: 标准查询(单个股票单个报告期)
**When**: 测量响应时间
**Then**:
- 响应时间 < 10秒(P95)
- 大部分请求 < 5秒

### ITC-019: 批量查询性能

**Given**: 查询多个股票的数据
**When**: 顺序执行3次查询
**Then**:
- 总时间 < 30秒
- 无超时错误

---

## 数据验证辅助函数

```typescript
/**
 * 验证必填字段
 */
function validateRequiredFields(item: any): boolean {
  const required = [
    'ts_code', 'ann_date', 'f_ann_date',
    'end_date', 'report_type', 'comp_type', 'end_type'
  ];
  return required.every(field =>
    typeof item[field] === 'string' && item[field].length > 0
  );
}

/**
 * 验证数值字段
 */
function validateNumberField(value: any): boolean {
  return value === undefined ||
    (typeof value === 'number' && Number.isFinite(value));
}

/**
 * 计算字段覆盖率
 */
function calculateFieldCoverage(
  item: any,
  totalFields: number
): number {
  const nonEmptyFields = Object.values(item)
    .filter(v => v !== undefined && v !== null).length;
  return (nonEmptyFields / totalFields) * 100;
}
```

---

## 测试数据

### 有效股票代码

```typescript
const VALID_STOCKS = [
  '000001.SZ',  // 平安银行
  '600519.SH',  // 贵州茅台
  '000858.SZ',  // 五粮液
  '601318.SH'   // 中国平安
];
```

### 有效报告期

```typescript
const VALID_PERIODS = [
  '20231231',  // 2023年报
  '20230930',  // 2023三季报
  '20230630',  // 2023中报
  '20230331'   // 2023一季报
];
```

---

## 测试执行配置

### 超时设置

- 标准测试: 30秒
- 性能测试: 60秒
- 批量测试: 120秒

### 重试配置

- 网络错误: 自动重试2次
- 其他错误: 不重试,直接失败

### 并发控制

- 集成测试顺序执行,避免API限流

---

## 验收标准

- ✅ 所有19个集成测试用例通过(有token时)
- ✅ 无token时优雅跳过所有测试
- ✅ 数据结构验证通过(字段完整性≥90%)
- ✅ 缓存机制有效(第二次请求快≥50%)
- ✅ 错误处理正确(无效token/参数抛出异常)
- ✅ 性能满足要求(单次查询<10秒)

---

## 环境设置指南

### 设置Token

```bash
# Linux/Mac
export TUSHARE_TOKEN="your_token_here"

# Windows (PowerShell)
$env:TUSHARE_TOKEN="your_token_here"

# Windows (CMD)
set TUSHARE_TOKEN=your_token_here
```

### 运行集成测试

```bash
# 运行所有集成测试
pnpm --filter @hestudy/tushare-sdk test:integration

# 只运行财务数据集成测试
pnpm --filter @hestudy/tushare-sdk test tests/integration/financial.integration.test.ts
```

---

## 参考文件

- 模板: `packages/tushare-sdk/tests/integration/daily-basic.integration.test.ts`
- 被测试文件: `packages/tushare-sdk/src/api/financial.ts`
- API文档: Tushare Pro API文档
