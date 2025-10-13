# Research: SDK财务数据功能完善

**Feature**: 009-sdk
**Date**: 2025-10-13
**Status**: Completed

## Overview

本文档记录了为Tushare SDK添加财务数据功能的技术研究结果,包括Tushare API接口规范分析、字段完整性评估、TypeScript类型设计决策、以及与现有SDK架构的集成方案。

## Research Areas

### 1. Tushare财务数据API规范分析

#### 1.1 利润表接口 (income)

**决策**: 使用Tushare的`income`接口获取利润表数据

**接口详情**:
- **接口名称**: `income`
- **权限要求**: 至少2000积分
- **调用限制**: 仅支持单股票历史数据查询,不支持单次获取全市场数据(除非使用5000积分的income_vip接口)
- **数据更新**: 通常在财报公告日后1-2个工作日内更新

**输入参数**:
```typescript
{
  ts_code: string;      // 股票代码 (必填)
  ann_date?: string;    // 公告日期 YYYYMMDD
  start_date?: string;  // 报告期开始日期
  end_date?: string;    // 报告期结束日期
  period?: string;      // 报告期 YYYYMMDD
  report_type?: string; // 报告类型: 1-一季报, 2-半年报, 3-三季报, 4-年报
  comp_type?: string;   // 公司类型: 1-合并报表, 2-单季度
}
```

**核心输出字段** (基于官方文档,共50+字段):
- 基本信息: ts_code, ann_date, f_ann_date, end_date, report_type, comp_type, end_type
- 收入类: total_revenue, revenue, int_income, prem_earned, comm_income, n_commis_income
- 成本类: total_cogs, oper_cost, int_exp, commis_exp, biz_tax_surchg, sell_exp, admin_exp, fin_exp
- 利润类: oper_profit, non_oper_income, non_oper_exp, total_profit, income_tax, n_income, n_income_attr_p
- 每股指标: basic_eps, diluted_eps
- 其他: minority_gain, ebit, ebitda 等

**替代方案评估**:
- ❌ **income_vip接口**: 需要5000积分,超出大部分用户权限,暂不实现
- ❌ **财务快报(express)**: 数据不完整,只有季度摘要数据,不适合详细分析

**理由**: `income`接口是标准的2000积分接口,提供完整的利润表数据,字段齐全,适合绝大多数用户使用场景。

---

#### 1.2 资产负债表接口 (balancesheet)

**决策**: 使用Tushare的`balancesheet`接口获取资产负债表数据

**接口详情**:
- **接口名称**: `balancesheet`
- **权限要求**: 至少2000积分
- **调用限制**: 仅支持单股票历史数据查询
- **数据特点**: 提供期末余额数据,包含资产、负债、所有者权益的详细科目

**输入参数**: 与income接口相同(ts_code, ann_date, period, report_type等)

**核心输出字段** (基于官方文档,共60+字段):
- 基本信息: ts_code, ann_date, f_ann_date, end_date, report_type, comp_type
- 资产类:
  - 流动资产: total_cur_assets, money_cap, trad_asset, notes_receiv, accounts_receiv, oth_receiv, prepayment, inventories
  - 非流动资产: total_nca, lt_rec, fixed_assets, cip, const_materials, fixed_assets_disp, produc_bio_assets, oil_and_gas_assets, intan_assets, r_and_d, goodwill, lt_amor_exp, defer_tax_assets
  - 总资产: total_assets
- 负债类:
  - 流动负债: total_cur_liab, st_borr, trad_liab, notes_payable, acct_payable, adv_receipts, payroll_payable, taxes_payable
  - 非流动负债: total_nca_liab, lt_borr, bond_payable, lt_payable, specific_payables, defer_tax_liab
  - 总负债: total_liab
- 所有者权益类: total_hldr_eqy_exc_min_int, total_hldr_eqy_inc_min_int, cap_rese, surplus_rese, undist_profit, less_tsy_stk

**替代方案评估**:
- ❌ **balancesheet_vip接口**: 同样需要5000积分
- ❌ **简化字段方案**: 资产负债表科目繁多,简化会导致无法计算常用财务比率

**理由**: 资产负债表是财务分析三大报表之一,必须提供完整字段才能支持流动比率、资产负债率等关键指标计算。

---

#### 1.3 现金流量表接口 (cashflow)

**决策**: 使用Tushare的`cashflow`接口获取现金流量表数据

**接口详情**:
- **接口名称**: `cashflow`
- **权限要求**: 至少2000积分
- **调用限制**: 仅支持单股票历史数据查询
- **数据特点**: 按经营、投资、筹资三大活动分类展示现金流

**输入参数**: 与income接口相同

**核心输出字段** (基于官方文档,共40+字段):
- 基本信息: ts_code, ann_date, f_ann_date, end_date, comp_type, report_type
- 经营活动现金流:
  - 流入: c_fr_sale_sg, recp_tax_rends, n_depos_incr_fi, n_incr_loans_cb, oth_cash_recp_ral_oper_act
  - 流出: c_paid_goods_s, c_paid_to_for_empl, c_paid_for_taxes, oth_cash_pay_ral_oper_act
  - 净额: n_cashflow_act
- 投资活动现金流:
  - 流入: c_disp_withdrwl_invest, c_recp_return_invest, n_recp_disp_fiolta
  - 流出: c_paid_acq_const_fiolta, c_paid_invest
  - 净额: n_cashflow_inv_act
- 筹资活动现金流:
  - 流入: c_recp_borrow, proc_issue_bonds, c_proc_oth_recp_ral_fnc_act
  - 流出: c_prepay_amt_borr, c_pay_dist_dpcp_int_exp
  - 净额: n_cash_flows_fnc_act
- 汇总: n_incr_cash_cash_equ, c_cash_equ_beg_period, c_cash_equ_end_period

**替代方案评估**:
- ❌ **自行计算**: 现金流量表数据无法从资产负债表和利润表简单推算
- ❌ **cashflow_vip接口**: 同样需要5000积分

**理由**: 现金流量表反映企业的真实盈利质量,是评估企业现金创造能力的关键数据源。

---

### 2. TypeScript类型设计决策

#### 2.1 字段可选性设计

**决策**: 所有财务数据字段(除了基本标识字段)均设计为可选类型(optional)

**理由**:
1. Tushare API返回的财务数据可能因公司类型不同而有字段缺失(如银行、保险、一般企业的科目差异)
2. 某些报告期可能尚未公布完整数据
3. 避免TypeScript严格模式下的null/undefined类型错误

**示例**:
```typescript
export interface IncomeStatementItem {
  // 必填字段 - 唯一标识
  ts_code: string;
  ann_date: string;
  end_date: string;

  // 可选字段 - 所有财务数据
  total_revenue?: number;
  revenue?: number;
  net_profit?: number;
  // ...
}
```

**替代方案评估**:
- ❌ **全部必填**: 会导致API返回数据与类型定义不匹配
- ❌ **使用null**: 增加用户代码复杂度,需要额外处理null情况

---

#### 2.2 报告类型枚举设计

**决策**: 使用联合类型(Union Type)而非枚举(Enum)定义报告类型

**实现**:
```typescript
export type ReportType = 1 | 2 | 3 | 4;

export interface FinancialQueryParams {
  report_type?: ReportType; // 1-一季报, 2-半年报, 3-三季报, 4-年报
}
```

**理由**:
1. 与Tushare API的实际参数类型(数字)保持一致
2. 避免枚举在编译后产生额外的JavaScript代码
3. 更简洁,符合TypeScript最佳实践(优先使用联合类型)

**替代方案评估**:
- ❌ **使用enum**: `enum ReportType { Q1 = 1, Q2 = 2, Q3 = 3, Annual = 4 }` - 会生成运行时代码,增加包体积
- ❌ **使用字符串**: Tushare API接受的是数字类型,不匹配

---

#### 2.3 参数类型复用设计

**决策**: 三个财务报表接口共享相同的查询参数类型`FinancialQueryParams`

**理由**:
1. 三个接口的查询参数完全一致(ts_code, period, start_date, end_date, report_type等)
2. 减少类型重复定义,提高可维护性
3. 用户学习成本低,参数使用方式统一

**实现**:
```typescript
export interface FinancialQueryParams {
  ts_code?: string;
  ann_date?: string;
  start_date?: string;
  end_date?: string;
  period?: string;
  report_type?: 1 | 2 | 3 | 4;
  comp_type?: '1' | '2'; // 1-合并报表, 2-单季度
}

// 三个接口都使用相同的参数类型
export async function getIncomeStatement(
  client: TushareClient,
  params?: FinancialQueryParams
): Promise<IncomeStatementItem[]> { ... }
```

**替代方案评估**:
- ❌ **为每个接口单独定义参数类型**: 造成代码重复,不符合DRY原则

---

### 3. 与现有SDK架构集成方案

#### 3.1 TushareClient方法添加策略

**决策**: 在TushareClient类中直接添加三个方法,而非只提供独立API函数

**实现模式** (参考现有的getDailyQuote、getStockBasic):
```typescript
// packages/tushare-sdk/src/client/TushareClient.ts
export class TushareClient {
  // ... 现有方法

  /**
   * 获取利润表数据
   *
   * **权限要求**: 至少 2000 积分
   */
  async getIncomeStatement(params?: FinancialQueryParams): Promise<IncomeStatementItem[]> {
    return getIncomeStatementApi(this, params);
  }

  async getBalanceSheet(params?: FinancialQueryParams): Promise<BalanceSheetItem[]> {
    return getBalanceSheetApi(this, params);
  }

  async getCashFlow(params?: FinancialQueryParams): Promise<CashFlowItem[]> {
    return getCashFlowApi(this, params);
  }
}
```

**理由**:
1. 与现有SDK设计保持一致(`client.getDailyQuote()`而非`getDailyQuote(client, ...)`)
2. 用户通过IDE自动补全可以直接发现可用方法
3. 更符合面向对象设计,方法属于客户端实例

**替代方案评估**:
- ❌ **仅提供独立API函数**: 用户需要额外导入,使用体验不一致
- ❌ **使用插件模式扩展客户端**: 过度设计,增加复杂度

---

#### 3.2 API函数实现模式

**决策**: API函数调用`client.query()`通用方法,而非直接调用HTTP客户端

**实现**:
```typescript
// packages/tushare-sdk/src/api/financial.ts
export async function getIncomeStatement(
  client: TushareClient,
  params?: FinancialQueryParams
): Promise<IncomeStatementItem[]> {
  return client.query<IncomeStatementItem>('income', params as Record<string, unknown>);
}
```

**理由**:
1. 自动继承现有的缓存、重试、并发控制等特性
2. 代码简洁,避免重复实现底层逻辑
3. 与现有API函数(getStockBasic、getDailyQuote)的实现模式一致

**替代方案评估**:
- ❌ **直接调用httpClient**: 无法利用现有的重试、缓存机制
- ❌ **重新实现一套财务数据专用客户端**: 过度设计,造成代码重复

---

#### 3.3 向后兼容策略

**决策**: 保留现有的`FinancialItem`和`FinancialParams`类型,新增类型作为补充

**实现**:
```typescript
// 现有类型 - 保持不变
export interface FinancialItem { ... }
export interface FinancialParams { ... }
export async function getFinancialData(...) { ... }

// 新增类型 - 扩展功能
export interface IncomeStatementItem { ... }
export interface BalanceSheetItem { ... }
export interface CashFlowItem { ... }
export interface FinancialQueryParams { ... }
export async function getIncomeStatement(...) { ... }
export async function getBalanceSheet(...) { ... }
export async function getCashFlow(...) { ... }
```

**理由**:
1. 不破坏现有用户代码(已经使用`getFinancialData`的代码继续有效)
2. 提供更细粒度的类型定义,满足新用户需求
3. 遵循语义化版本控制原则(向后兼容的功能增加)

---

### 4. 字段完整性评估

#### 4.1 利润表字段完整性

**评估结果**: 需要定义**50+字段**才能覆盖Tushare income接口的完整输出

**关键字段分类**:
1. **基本信息** (7个): ts_code, ann_date, f_ann_date, end_date, report_type, comp_type, end_type
2. **收入类** (8个): total_revenue, revenue, int_income, prem_earned, comm_income等
3. **成本费用类** (12个): total_cogs, oper_cost, int_exp, sell_exp, admin_exp, fin_exp等
4. **利润类** (10个): oper_profit, total_profit, n_income, n_income_attr_p等
5. **每股指标** (2个): basic_eps, diluted_eps
6. **其他指标** (11个): ebit, ebitda, insurance_exp, undist_profit, distable_profit等

**设计决策**:
- ✅ 定义所有50+字段,确保完整性
- ✅ 每个字段必须包含JSDoc注释,说明字段含义和单位
- ✅ 数值字段使用`number`类型,日期字段使用`string`类型(YYYYMMDD格式)

---

#### 4.2 资产负债表字段完整性

**评估结果**: 需要定义**60+字段**才能覆盖Tushare balancesheet接口的完整输出

**关键字段分类**:
1. **基本信息** (6个)
2. **流动资产** (15个): money_cap, trad_asset, notes_receiv, accounts_receiv, inventories等
3. **非流动资产** (18个): fixed_assets, cip, intan_assets, goodwill, lt_amor_exp等
4. **流动负债** (10个): st_borr, notes_payable, acct_payable, payroll_payable等
5. **非流动负债** (6个): lt_borr, bond_payable, lt_payable等
6. **所有者权益** (5个): total_hldr_eqy, cap_rese, surplus_rese, undist_profit等

---

#### 4.3 现金流量表字段完整性

**评估结果**: 需要定义**40+字段**才能覆盖Tushare cashflow接口的完整输出

**关键字段分类**:
1. **基本信息** (6个)
2. **经营活动现金流** (15个): c_fr_sale_sg, recp_tax_rends, c_paid_goods_s, n_cashflow_act等
3. **投资活动现金流** (8个): c_disp_withdrwl_invest, c_paid_acq_const_fiolta等
4. **筹资活动现金流** (8个): c_recp_borrow, proc_issue_bonds, c_prepay_amt_borr等
5. **汇总指标** (3个): n_incr_cash_cash_equ, c_cash_equ_beg_period, c_cash_equ_end_period

---

### 5. 错误处理与权限提示

**决策**: 在JSDoc注释中明确标注权限要求,依赖Tushare API的错误响应

**实现**:
```typescript
/**
 * 获取利润表数据
 *
 * **权限要求**: 至少 2000 积分
 *
 * @throws {ApiError} 当权限不足时,错误信息为"该接口需要至少2000积分"
 */
async getIncomeStatement(params?: FinancialQueryParams): Promise<IncomeStatementItem[]> {
  // 不在客户端侧验证权限,由Tushare API返回错误
  return getIncomeStatementApi(this, params);
}
```

**理由**:
1. 客户端无法准确获知用户的实际积分余额
2. Tushare API会返回清晰的权限错误提示
3. 避免在客户端维护积分规则(规则可能变更)

---

## Technology Choices

| Technology | Decision | Rationale |
|------------|----------|-----------|
| **API接口选择** | income / balancesheet / cashflow (标准2000积分接口) | 覆盖绝大多数用户权限,数据完整性满足需求 |
| **类型系统** | TypeScript严格模式 + 可选字段 + JSDoc完整注释 | 平衡类型安全和API数据灵活性 |
| **参数类型** | 共享FinancialQueryParams类型 | 减少重复,提高一致性 |
| **集成方式** | 扩展TushareClient类 + 独立API函数 | 与现有架构保持一致,用户体验最佳 |
| **向后兼容** | 保留现有FinancialItem,新增专用类型 | 不破坏现有代码,平滑升级 |
| **字段完整性** | 利润表50+、资产负债表60+、现金流量表40+ | 完整覆盖Tushare官方API字段 |
| **错误处理** | 依赖Tushare API错误响应 + JSDoc权限标注 | 简化客户端逻辑,保持真实错误信息 |

---

## Open Questions & Resolutions

### Q1: 是否需要实现VIP接口(income_vip等)?
**决策**: 不实现
**理由**: VIP接口需要5000积分,超出大部分用户权限。可在future scope中考虑。

### Q2: 是否需要在SDK中提供财务比率计算功能(如流动比率、ROE等)?
**决策**: 不实现
**理由**:
- 超出spec.md的范围(Out of Scope明确排除)
- 财务比率计算逻辑应由用户根据业务需求自定义
- SDK职责是提供数据,而非业务逻辑

### Q3: 如何处理不同公司类型(银行、保险、一般企业)的科目差异?
**决策**: 使用可选字段(optional fields)
**理由**:
- TypeScript的可选字段可以优雅处理字段缺失情况
- 用户可以使用可选链操作符(?.)安全访问字段
- 避免为每种公司类型创建独立的接口(过度设计)

### Q4: 是否需要支持fields参数(指定返回字段)?
**决策**: 不实现
**理由**:
- 现有TushareClient的query方法支持fields参数,但高级API方法不暴露此参数
- 保持与getStockBasic、getDailyQuote等方法的一致性
- 完整字段定义已提供类型安全,无需手动指定

### Q5: 测试策略应该如何设计?
**决策**: 使用mock Tushare API响应进行单元测试
**理由**:
- 避免依赖真实API token和网络连接
- 可以测试边界情况(空数据、错误响应等)
- 加快测试执行速度
- 示例测试将使用真实API演示功能

---

## Implementation Readiness

✅ **所有技术决策已完成**
✅ **无阻塞性未知问题**
✅ **可以进入Phase 1设计阶段**

---

## References

- [Tushare财务数据官方文档](https://tushare.pro/document/2?doc_id=16)
- [Tushare利润表接口文档](https://tushare.pro/document/2?doc_id=33)
- [Tushare资产负债表接口文档](https://tushare.pro/document/2?doc_id=36)
- [Tushare现金流量表接口文档](https://tushare.pro/document/2?doc_id=44)
- 现有SDK代码: `packages/tushare-sdk/src/client/TushareClient.ts`
- 现有财务数据模块: `packages/tushare-sdk/src/models/financial.ts`
