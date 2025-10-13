# Type Tests Contract: 财务数据类型测试规范

**Feature**: 010-sdk
**File**: Integrated in `packages/tushare-sdk/tests/unit/financial.test.ts`
**Purpose**: 定义财务数据TypeScript类型定义的测试规范

## 测试范围

**被测试模块**:
- `src/models/financial.ts` - 财务数据类型定义
  - `IncomeStatementItem` (94字段)
  - `BalanceSheetItem` (81字段)
  - `CashFlowItem` (87字段)
  - `FinancialQueryParams`

**测试策略**: 编译时类型检查 + 运行时类型验证

---

## 测试方法论

### 方法1: 编译时类型检查

**原理**: TypeScript编译器会验证类型使用的正确性

**测试方式**:
```typescript
it('类型定义测试会在编译时检查', () => {
  // 如果类型定义不正确,这里会有TypeScript编译错误
  const item: IncomeStatementItem = {
    ts_code: '000001.SZ',
    ann_date: '20240430',
    f_ann_date: '20240430',
    end_date: '20231231',
    report_type: '4',
    comp_type: '1',
    end_type: '4'
    // 如果缺少必填字段,TypeScript会报错
  };

  expect(item.ts_code).toBe('000001.SZ');
});
```

### 方法2: 运行时类型验证

**原理**: 验证实际API返回的数据符合类型定义

**测试方式**:
```typescript
it('API返回数据应符合类型定义', async () => {
  const data = await getIncomeStatement(client, params);

  if (data.length > 0) {
    const item = data[0];

    // 验证必填字段类型
    expect(typeof item.ts_code).toBe('string');
    expect(typeof item.ann_date).toBe('string');

    // 验证可选字段类型
    if (item.total_revenue !== undefined) {
      expect(typeof item.total_revenue).toBe('number');
    }
  }
});
```

---

## Test Suite 1: IncomeStatementItem类型测试

### TTC-001: 必填字段完整性

**Given**: IncomeStatementItem类型定义
**When**: 创建符合类型的对象
**Then**:
- 必须包含7个必填字段
- 缺少任何必填字段会导致TypeScript编译错误

**必填字段列表**:
1. `ts_code: string`
2. `ann_date: string`
3. `f_ann_date: string`
4. `end_date: string`
5. `report_type: string`
6. `comp_type: string`
7. `end_type: string`

**测试代码**:
```typescript
describe('IncomeStatementItem类型测试', () => {
  it('TTC-001: 应包含所有必填字段', () => {
    const item: IncomeStatementItem = {
      ts_code: '000001.SZ',
      ann_date: '20240430',
      f_ann_date: '20240430',
      end_date: '20231231',
      report_type: '4',
      comp_type: '1',
      end_type: '4'
    };

    expect(item).toBeDefined();
    expect(typeof item.ts_code).toBe('string');
    expect(typeof item.ann_date).toBe('string');
  });
});
```

### TTC-002: 可选字段类型正确性

**Given**: IncomeStatementItem包含可选的数值字段
**When**: 创建包含可选字段的对象
**Then**:
- 可选字段可以省略
- 如果提供,类型必须为number

**测试代码**:
```typescript
it('TTC-002: 可选字段应为number或undefined', () => {
  const item: IncomeStatementItem = {
    ts_code: '000001.SZ',
    ann_date: '20240430',
    f_ann_date: '20240430',
    end_date: '20231231',
    report_type: '4',
    comp_type: '1',
    end_type: '4',
    basic_eps: 2.34,          // 可选,类型为number
    total_revenue: 189234567890,
    // 其他可选字段可以省略
  };

  expect(typeof item.basic_eps).toBe('number');
  expect(item.diluted_eps).toBeUndefined(); // 未提供的可选字段
});
```

### TTC-003: 字段总数验证

**Given**: IncomeStatementItem类型定义
**When**: 查看类型定义的所有字段
**Then**:
- 总共应有94个字段(7个必填 + 87个可选)
- 字段名与Tushare API文档一致

**验证方式**: 代码审查 + 文档对比

### TTC-004: 每股指标字段类型

**Given**: IncomeStatementItem的每股指标字段
**When**: 使用这些字段
**Then**:
- `basic_eps?: number` - 基本每股收益
- `diluted_eps?: number` - 稀释每股收益

### TTC-005: 收入类指标字段类型

**关键字段**:
- `total_revenue?: number` - 营业总收入
- `revenue?: number` - 营业收入
- `int_income?: number` - 利息收入
- 等其他收入指标

### TTC-006: 利润类指标字段类型

**关键字段**:
- `operate_profit?: number` - 营业利润
- `total_profit?: number` - 利润总额
- `n_income?: number` - 净利润
- `n_income_attr_p?: number` - 归属于母公司净利润

### TTC-007: 类型导入导出

**Given**: 从@hestudy/tushare-sdk导入类型
**When**: 在TypeScript代码中使用
**Then**:
- 类型可以正常导入
- IDE提供完整的类型提示

**测试代码**:
```typescript
import type { IncomeStatementItem } from '@hestudy/tushare-sdk';

it('TTC-007: 类型应该可以正常导入', () => {
  // 类型导入成功,编译通过
  const item: IncomeStatementItem = {
    ts_code: '000001.SZ',
    ann_date: '20240430',
    f_ann_date: '20240430',
    end_date: '20231231',
    report_type: '4',
    comp_type: '1',
    end_type: '4'
  };

  expect(item).toBeDefined();
});
```

---

## Test Suite 2: BalanceSheetItem类型测试

### TTC-008: 必填字段完整性

**必填字段**: 与IncomeStatementItem相同(7个)

### TTC-009: 资产类字段类型

**关键字段**:
- `total_assets?: number` - 资产总计
- `total_cur_assets?: number` - 流动资产合计
- `total_nca?: number` - 非流动资产合计
- `money_cap?: number` - 货币资金
- `fix_assets?: number` - 固定资产

### TTC-010: 负债类字段类型

**关键字段**:
- `total_cur_liab?: number` - 流动负债合计
- `total_ncl?: number` - 非流动负债合计
- `st_borr?: number` - 短期借款
- `lt_borr?: number` - 长期借款

### TTC-011: 所有者权益字段类型

**关键字段**:
- `total_share?: number` - 期末总股本
- `cap_rese?: number` - 资本公积金
- `undistr_porfit?: number` - 未分配利润
- `surplus_rese?: number` - 盈余公积金

### TTC-012: 字段总数验证

**验证**: BalanceSheetItem总共81个字段(7个必填 + 74个可选)

---

## Test Suite 3: CashFlowItem类型测试

### TTC-013: 必填字段完整性

**必填字段**: 与IncomeStatementItem相同(7个)

### TTC-014: 经营活动现金流字段类型

**关键字段**:
- `n_cashflow_act?: number` - 经营活动产生的现金流量净额
- `c_fr_sale_sg?: number` - 销售商品、提供劳务收到的现金
- `c_paid_goods_s?: number` - 购买商品、接受劳务支付的现金
- `c_paid_to_for_empl?: number` - 支付给职工以及为职工支付的现金

### TTC-015: 投资活动现金流字段类型

**关键字段**:
- `n_cashflow_inv_act?: number` - 投资活动产生的现金流量净额
- `c_pay_acq_const_fiolta?: number` - 购建固定资产支付的现金
- `c_recp_return_invest?: number` - 取得投资收益收到的现金

### TTC-016: 筹资活动现金流字段类型

**关键字段**:
- `n_cash_flows_fnc_act?: number` - 筹资活动产生的现金流量净额
- `c_recp_borrow?: number` - 取得借款收到的现金
- `c_prepay_amt_borr?: number` - 偿还债务支付的现金

### TTC-017: 现金汇总字段类型

**关键字段**:
- `n_incr_cash_cash_equ?: number` - 现金及现金等价物净增加额
- `c_cash_equ_beg_period?: number` - 期初现金及现金等价物余额
- `c_cash_equ_end_period?: number` - 期末现金及现金等价物余额

### TTC-018: 字段总数验证

**验证**: CashFlowItem总共87个字段(7个必填 + 80个可选)

---

## Test Suite 4: FinancialQueryParams类型测试

### TTC-019: 参数类型定义

**Given**: FinancialQueryParams类型
**When**: 使用该类型创建参数对象
**Then**:
- 所有字段都是可选的
- 字段类型正确

**字段定义**:
```typescript
interface FinancialQueryParams {
  ts_code?: string;
  ann_date?: string;
  start_date?: string;
  end_date?: string;
  period?: string;
  report_type?: '1' | '2' | '3' | '4';
  comp_type?: '1' | '2';
}
```

### TTC-020: report_type字面量类型

**Given**: report_type字段
**When**: 赋值时
**Then**:
- 只接受 '1' | '2' | '3' | '4'
- 其他值导致TypeScript编译错误

**测试代码**:
```typescript
it('TTC-020: report_type应该只接受特定值', () => {
  const params1: FinancialQueryParams = {
    ts_code: '000001.SZ',
    report_type: '4'  // ✅ 正确
  };

  // const params2: FinancialQueryParams = {
  //   ts_code: '000001.SZ',
  //   report_type: '5'  // ❌ TypeScript编译错误
  // };

  expect(params1.report_type).toBe('4');
});
```

### TTC-021: 参数可选性验证

**Given**: FinancialQueryParams所有字段都是可选的
**When**: 创建空参数对象
**Then**: TypeScript编译通过

**测试代码**:
```typescript
it('TTC-021: 所有参数都是可选的', () => {
  const params1: FinancialQueryParams = {};
  const params2: FinancialQueryParams = {
    ts_code: '000001.SZ'
  };
  const params3: FinancialQueryParams = {
    period: '20231231',
    report_type: '4'
  };

  expect(params1).toBeDefined();
  expect(params2).toBeDefined();
  expect(params3).toBeDefined();
});
```

---

## Test Suite 5: API函数返回类型测试

### TTC-022: getIncomeStatement返回类型

**Given**: getIncomeStatement函数
**When**: 调用该函数
**Then**:
- 返回类型为 `Promise<IncomeStatementItem[]>`
- TypeScript能够正确推断返回类型

**测试代码**:
```typescript
it('TTC-022: getIncomeStatement应返回正确类型', async () => {
  mockQuery.mockResolvedValue([createMinimalIncomeStatement()]);

  const result = await getIncomeStatement(client, { ts_code: '000001.SZ' });

  // TypeScript推断result类型为IncomeStatementItem[]
  expect(Array.isArray(result)).toBe(true);
  if (result.length > 0) {
    const item = result[0];
    // item类型为IncomeStatementItem,有完整的类型提示
    expect(typeof item.ts_code).toBe('string');
  }
});
```

### TTC-023: getBalanceSheet返回类型

**验证**: 返回类型为 `Promise<BalanceSheetItem[]>`

### TTC-024: getCashFlow返回类型

**验证**: 返回类型为 `Promise<CashFlowItem[]>`

---

## Test Suite 6: TushareClient方法类型测试

### TTC-025: client.getIncomeStatement方法签名

**Given**: TushareClient类
**When**: 查看getIncomeStatement方法
**Then**:
- 方法签名: `getIncomeStatement(params?: FinancialQueryParams): Promise<IncomeStatementItem[]>`
- IDE提供完整的类型提示和参数提示

### TTC-026: client.getBalanceSheet方法签名

**验证**: 方法签名正确,与API函数一致

### TTC-027: client.getCashFlow方法签名

**验证**: 方法签名正确,与API函数一致

---

## 类型验证辅助函数

```typescript
/**
 * 验证必填字段类型
 */
function validateRequiredFieldTypes(item: any): boolean {
  return (
    typeof item.ts_code === 'string' &&
    typeof item.ann_date === 'string' &&
    typeof item.f_ann_date === 'string' &&
    typeof item.end_date === 'string' &&
    typeof item.report_type === 'string' &&
    typeof item.comp_type === 'string' &&
    typeof item.end_type === 'string'
  );
}

/**
 * 验证可选数值字段类型
 */
function validateOptionalNumberField(value: any): boolean {
  return value === undefined || (typeof value === 'number' && Number.isFinite(value));
}

/**
 * 统计类型定义的字段数量
 */
function countTypeFields<T>(typeExample: T): number {
  return Object.keys(typeExample as object).length;
}
```

---

## 类型测试覆盖率

| 类型 | 总字段数 | 必填字段 | 可选字段 | 测试用例数 |
|------|---------|---------|---------|-----------|
| IncomeStatementItem | 94 | 7 | 87 | 7 |
| BalanceSheetItem | 81 | 7 | 74 | 5 |
| CashFlowItem | 87 | 7 | 80 | 6 |
| FinancialQueryParams | 7 | 0 | 7 | 3 |
| API函数返回类型 | - | - | - | 3 |
| Client方法签名 | - | - | - | 3 |
| **总计** | **269** | **21** | **248** | **27** |

---

## 类型文档对比

### 验证来源

1. **Tushare Pro API文档**: https://tushare.pro/document/2?doc_id=33
2. **项目类型定义**: `packages/tushare-sdk/src/models/financial.ts`

### 验证方法

**人工审查**:
- 逐字段对比类型定义与API文档
- 确认字段名、类型、描述一致

**自动化验证**:
- TypeScript编译检查
- 运行时类型验证(通过测试)

---

## 验收标准

- ✅ 所有27个类型测试用例通过
- ✅ TypeScript编译无错误无警告
- ✅ 三大报表类型字段数量正确(94, 81, 87)
- ✅ 所有必填字段验证通过
- ✅ 可选字段类型正确(number | undefined)
- ✅ 参数类型的字面量类型约束生效
- ✅ API函数返回类型推断正确
- ✅ Client方法类型签名正确

---

## TypeScript配置要求

**tsconfig.json关键配置**:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true
  }
}
```

**说明**: 严格模式确保类型检查的有效性

---

## 参考资料

- Tushare API文档: https://tushare.pro/document/2
- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/
- 项目类型定义: `packages/tushare-sdk/src/models/financial.ts`
