# Unit Tests Contract: 财务数据单元测试规范

**Feature**: 010-sdk
**File**: `packages/tushare-sdk/tests/unit/financial.test.ts`
**Purpose**: 定义财务数据API函数的单元测试规范

## 测试范围

**被测试模块**:
- `src/api/financial.ts` - 财务数据API函数
  - `getIncomeStatement()`
  - `getBalanceSheet()`
  - `getCashFlow()`

**测试策略**: 使用mock隔离外部依赖,验证函数行为的正确性

---

## Test Suite 1: getIncomeStatement 单元测试

### 测试组织结构

```typescript
describe('getIncomeStatement 单元测试', () => {
  describe('参数传递测试', () => {
    // TC-001 ~ TC-003
  });

  describe('返回值处理测试', () => {
    // TC-004 ~ TC-005
  });

  describe('异常处理测试', () => {
    // TC-006
  });
});
```

### TC-001: 带完整参数调用

**Given**: TushareClient实例已创建且query方法被mock
**When**: 调用getIncomeStatement传入ts_code和period参数
**Then**:
- 应该调用`client.query('income', params)`
- 参数完整传递
- 返回mock数据

**测试代码模板**:
```typescript
it('TC-001: 带完整参数调用 - 验证参数传递到query方法', async () => {
  const mockData: IncomeStatementItem[] = [
    createMinimalIncomeStatement()
  ];
  mockQuery.mockResolvedValue(mockData);

  const params = {
    ts_code: '000001.SZ',
    period: '20231231'
  };

  const result = await getIncomeStatement(client, params);

  expect(mockQuery).toHaveBeenCalledWith('income', params);
  expect(result).toEqual(mockData);
});
```

### TC-002: 不带参数调用

**Given**: TushareClient实例已创建
**When**: 调用getIncomeStatement不传参数
**Then**:
- 应该调用`client.query('income', undefined)`
- 返回mock数据

### TC-003: 多种参数组合

**Given**: TushareClient实例已创建
**When**: 调用getIncomeStatement传入不同参数组合(start_date/end_date, report_type等)
**Then**: 所有参数都正确传递给query方法

**测试用例**:
- `{ ts_code, start_date, end_date }`
- `{ ts_code, period, report_type }`
- `{ ann_date }`

### TC-004: 返回空数组

**Given**: mock的query方法返回空数组
**When**: 调用getIncomeStatement
**Then**:
- 应该返回空数组
- 不抛出异常

### TC-005: 返回多条数据

**Given**: mock的query方法返回包含10条数据的数组
**When**: 调用getIncomeStatement
**Then**:
- 应该返回完整的数组
- 数组长度为10

### TC-006: 异常抛出

**Given**: mock的query方法抛出ApiError
**When**: 调用getIncomeStatement
**Then**:
- 异常应该向上传播
- 不被吞掉或转换

---

## Test Suite 2: getBalanceSheet 单元测试

**结构**: 与getIncomeStatement完全相同

**关键差异**:
- API名称: `'balancesheet'`
- 数据类型: `BalanceSheetItem[]`
- Mock数据: 使用createMinimalBalanceSheet()

**测试用例**:
- TC-007: 带完整参数调用
- TC-008: 不带参数调用
- TC-009: 多种参数组合
- TC-010: 返回空数组
- TC-011: 返回多条数据
- TC-012: 异常抛出

---

## Test Suite 3: getCashFlow 单元测试

**结构**: 与getIncomeStatement完全相同

**关键差异**:
- API名称: `'cashflow'`
- 数据类型: `CashFlowItem[]`
- Mock数据: 使用createMinimalCashFlow()

**测试用例**:
- TC-013: 带完整参数调用
- TC-014: 不带参数调用
- TC-015: 多种参数组合
- TC-016: 返回空数组
- TC-017: 返回多条数据
- TC-018: 异常抛出

---

## Test Suite 4: 类型定义测试

### TC-019: IncomeStatementItem类型完整性

**Given**: 导入IncomeStatementItem类型
**When**: 创建符合类型的对象
**Then**:
- TypeScript编译通过
- 必填字段不能省略
- 可选字段可以省略

**测试代码**:
```typescript
it('TC-019: IncomeStatementItem类型应包含所有必填字段', () => {
  // 这个测试主要依赖TypeScript编译器
  // 如果必填字段缺失,编译会报错
  const item: IncomeStatementItem = {
    ts_code: '000001.SZ',
    ann_date: '20240430',
    f_ann_date: '20240430',
    end_date: '20231231',
    report_type: '4',
    comp_type: '1',
    end_type: '4'
    // 可选字段可以省略
  };

  expect(item.ts_code).toBe('000001.SZ');
});
```

### TC-020: BalanceSheetItem类型完整性

**测试逻辑**: 同TC-019,使用BalanceSheetItem类型

### TC-021: CashFlowItem类型完整性

**测试逻辑**: 同TC-019,使用CashFlowItem类型

### TC-022: 可选字段类型验证

**Given**: Mock数据包含可选字段
**When**: 检查字段类型
**Then**:
- 数值字段类型为number或undefined
- 字符串字段类型为string或undefined

---

## Test Suite 5: TushareClient类方法测试

### TC-023: client.getIncomeStatement方法

**Given**: 创建TushareClient实例
**When**: 调用client.getIncomeStatement
**Then**: 应该与直接调用getIncomeStatement(client, params)结果一致

**测试代码**:
```typescript
it('TC-023: client.getIncomeStatement应该正确工作', async () => {
  const mockData = [createMinimalIncomeStatement()];
  mockQuery.mockResolvedValue(mockData);

  const params = { ts_code: '000001.SZ', period: '20231231' };

  // 通过client方法调用
  const result1 = await client.getIncomeStatement(params);

  // 直接调用函数
  const result2 = await getIncomeStatement(client, params);

  expect(result1).toEqual(result2);
  expect(result1).toEqual(mockData);
});
```

### TC-024: client.getBalanceSheet方法

**测试逻辑**: 同TC-023

### TC-025: client.getCashFlow方法

**测试逻辑**: 同TC-023

---

## Mock Setup

**Setup代码** (每个测试套件的beforeEach):
```typescript
let client: TushareClient;
let mockQuery: ReturnType<typeof vi.fn>;

beforeEach(() => {
  client = new TushareClient({ token: 'test_token' });
  mockQuery = vi.fn();
  // @ts-expect-error - Mocking query method for testing
  client.query = mockQuery;
});
```

---

## 辅助函数

**数据生成辅助函数**:
```typescript
function createMinimalIncomeStatement(
  overrides?: Partial<IncomeStatementItem>
): IncomeStatementItem {
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

function createMinimalBalanceSheet(
  overrides?: Partial<BalanceSheetItem>
): BalanceSheetItem {
  // 类似实现
}

function createMinimalCashFlow(
  overrides?: Partial<CashFlowItem>
): CashFlowItem {
  // 类似实现
}
```

---

## 测试覆盖率目标

| 模块 | 目标覆盖率 | 关键指标 |
|------|-----------|---------|
| src/api/financial.ts | 100% | 所有函数的所有分支 |
| 类型导出 | 100% | 所有类型可用 |

---

## 验收标准

- ✅ 所有25个测试用例通过
- ✅ 测试执行时间 < 3秒
- ✅ 代码覆盖率 ≥ 80% (目标100%)
- ✅ 无TypeScript编译错误
- ✅ 无console警告或错误

---

## 参考文件

- 模板: `packages/tushare-sdk/tests/unit/daily-basic.test.ts`
- 被测试文件: `packages/tushare-sdk/src/api/financial.ts`
- 类型定义: `packages/tushare-sdk/src/models/financial.ts`
