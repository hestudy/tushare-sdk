# Data Model: SDK财务数据功能完善

**Feature**: 009-sdk
**Date**: 2025-10-13
**Status**: Completed

## Overview

本文档定义了SDK财务数据功能的完整数据模型,包括三大财务报表(利润表、资产负债表、现金流量表)的TypeScript类型定义、查询参数结构、以及与现有数据模型的集成关系。

---

## Entity Relationship

```
┌─────────────────────┐
│  TushareClient      │
│  (现有类)           │
└──────────┬──────────┘
           │
           │ 调用
           ▼
┌─────────────────────────────────────────────────────┐
│  Financial API Functions (api/financial.ts)        │
│  ├── getIncomeStatement()                          │
│  ├── getBalanceSheet()                             │
│  └── getCashFlow()                                 │
└──────────┬──────────────────────────────────────────┘
           │
           │ 返回
           ▼
┌─────────────────────────────────────────────────────┐
│  Financial Data Models (models/financial.ts)       │
│  ├── IncomeStatementItem (94 fields)               │
│  ├── BalanceSheetItem (81 fields)                  │
│  ├── CashFlowItem (87 fields)                      │
│  └── FinancialQueryParams (共享)                   │
└─────────────────────────────────────────────────────┘
```

**关系说明**:
- TushareClient类通过三个新方法调用对应的API函数
- API函数使用`client.query()`方法查询Tushare API
- 所有数据项遵循统一的基本结构(ts_code、报告期、公告日期等)
- 三个接口共享相同的查询参数类型`FinancialQueryParams`

---

## Core Entities

### 1. IncomeStatementItem (利润表数据项)

**描述**: 表示上市公司利润表的完整数据,包含收入、成本、利润、每股收益等94个字段。

**数据来源**: Tushare `income` 接口

**主键**: `ts_code` + `end_date` + `report_type` (组合唯一标识)

**字段分类**:

#### 1.1 基本标识字段 (必填)
| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| ts_code | string | 股票代码 | "000001.SZ" |
| ann_date | string | 公告日期 YYYYMMDD | "20240430" |
| f_ann_date | string | 实际公告日期 YYYYMMDD | "20240430" |
| end_date | string | 报告期 YYYYMMDD | "20231231" |

#### 1.2 报告类型字段 (必填)
| 字段名 | 类型 | 说明 | 可选值 |
|--------|------|------|--------|
| report_type | string | 报告类型 | "1"-合并报表, "2"-单季合并, "3"-调整单季, "4"-调整合并 |
| comp_type | string | 公司类型 | "1"-一般工商业, "2"-银行, "3"-保险, "4"-证券 |
| end_type | string | 报告期类型 | "1"-一季报, "2"-半年报, "3"-三季报, "4"-年报 |

#### 1.3 核心财务指标 (可选)
| 字段名 | 类型 | 单位 | 说明 |
|--------|------|------|------|
| basic_eps | number | 元/股 | 基本每股收益 |
| diluted_eps | number | 元/股 | 稀释每股收益 |
| total_revenue | number | 元 | 营业总收入 |
| revenue | number | 元 | 营业收入 |
| total_cogs | number | 元 | 营业总成本 |
| oper_cost | number | 元 | 营业成本 |
| sell_exp | number | 元 | 销售费用 |
| admin_exp | number | 元 | 管理费用 |
| fin_exp | number | 元 | 财务费用 |
| operate_profit | number | 元 | 营业利润 |
| total_profit | number | 元 | 利润总额 |
| income_tax | number | 元 | 所得税费用 |
| n_income | number | 元 | 净利润(含少数股东损益) |
| n_income_attr_p | number | 元 | 净利润(不含少数股东损益) |
| minority_gain | number | 元 | 少数股东损益 |
| ebit | number | 元 | 息税前利润 |
| ebitda | number | 元 | 息税折旧摊销前利润 |

**完整字段清单** (94个):
```typescript
ts_code, ann_date, f_ann_date, end_date, report_type, comp_type, end_type,
basic_eps, diluted_eps, total_revenue, revenue, int_income, prem_earned,
comm_income, n_commis_income, n_oth_income, n_oth_b_income, prem_income,
out_prem, une_prem_reser, reins_income, n_sec_tb_income, n_sec_uw_income,
n_asset_mg_income, oth_b_income, fv_value_chg_gain, invest_income,
ass_invest_income, forex_gain, total_cogs, oper_cost, int_exp, comm_exp,
biz_tax_surchg, sell_exp, admin_exp, fin_exp, assets_impair_loss,
prem_refund, compens_payout, reser_insur_liab, div_payt, reins_exp,
oper_exp, compens_payout_refu, insur_reser_refu, reins_cost_refund,
other_bus_cost, operate_profit, non_oper_income, non_oper_exp,
nca_disploss, total_profit, income_tax, n_income, n_income_attr_p,
minority_gain, oth_compr_income, t_compr_income, compr_inc_attr_p,
compr_inc_attr_m_s, ebit, ebitda, insurance_exp, undist_profit,
distable_profit, rd_exp, fin_exp_int_exp, fin_exp_int_inc,
transfer_surplus_rese, transfer_housing_imprest, transfer_oth,
adj_lossgain, withdra_legal_surplus, withdra_legal_pubfund,
withdra_biz_devfund, withdra_rese_fund, withdra_oth_ersu,
workers_welfare, distr_profit_shrhder, prfshare_payable_dvd,
comshare_payable_dvd, capit_comstock_div, net_after_nr_lp_correct,
credit_impa_loss, net_expo_hedging_benefits, oth_impair_loss_assets,
total_opcost, amodcost_fin_assets, oth_income, asset_disp_income,
continued_net_profit, end_net_profit, update_flag
```

**字段设计决策**:
- 前7个字段为必填字段(标识信息)
- 其余87个财务数据字段为可选字段(`number?`),因为不同公司类型的科目不同
- 所有金额字段单位统一为"元"
- update_flag为字符串类型,用于标识数据版本

---

### 2. BalanceSheetItem (资产负债表数据项)

**描述**: 表示上市公司资产负债表的完整数据,包含资产、负债、所有者权益等81个字段。

**数据来源**: Tushare `balancesheet` 接口

**主键**: `ts_code` + `end_date` + `report_type`

**字段分类**:

#### 2.1 基本标识字段 (必填)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| ts_code | string | 股票代码 |
| ann_date | string | 公告日期 |
| f_ann_date | string | 实际公告日期 |
| end_date | string | 报告期 |
| report_type | string | 报表类型 |
| comp_type | string | 公司类型 |
| end_type | string | 报告期类型 |

#### 2.2 资产类字段 (可选)

**流动资产** (15个字段):
| 字段名 | 说明 |
|--------|------|
| money_cap | 货币资金 |
| trad_asset | 交易性金融资产 |
| notes_receiv | 应收票据 |
| accounts_receiv | 应收账款 |
| oth_receiv | 其他应收款 |
| prepayment | 预付款项 |
| inventories | 存货 |
| oth_cur_assets | 其他流动资产 |
| total_cur_assets | **流动资产合计** |
| ... | 等 |

**非流动资产** (18个字段):
| 字段名 | 说明 |
|--------|------|
| fix_assets | 固定资产 |
| cip | 在建工程 |
| intan_assets | 无形资产 |
| goodwill | 商誉 |
| lt_amor_exp | 长期待摊费用 |
| defer_tax_assets | 递延所得税资产 |
| total_nca | **非流动资产合计** |
| ... | 等 |

**总资产**:
- `total_assets`: 资产总计

#### 2.3 负债类字段 (可选)

**流动负债** (10个字段):
| 字段名 | 说明 |
|--------|------|
| st_borr | 短期借款 |
| notes_payable | 应付票据 |
| acct_payable | 应付账款 |
| adv_receipts | 预收款项 |
| payroll_payable | 应付职工薪酬 |
| taxes_payable | 应交税费 |
| oth_payable | 其他应付款 |
| total_cur_liab | **流动负债合计** |
| ... | 等 |

**非流动负债** (6个字段):
| 字段名 | 说明 |
|--------|------|
| lt_borr | 长期借款 |
| bond_payable | 应付债券 |
| lt_payable | 长期应付款 |
| defer_tax_liab | 递延所得税负债 |
| total_ncl | **非流动负债合计** |
| ... | 等 |

#### 2.4 所有者权益类字段 (可选)
| 字段名 | 说明 |
|--------|------|
| total_share | 期末总股本 |
| cap_rese | 资本公积金 |
| surplus_rese | 盈余公积金 |
| undistr_porfit | 未分配利润 |
| special_rese | 专项储备 |

**完整字段清单** (81个):
```typescript
ts_code, ann_date, f_ann_date, end_date, report_type, comp_type, end_type,
total_share, cap_rese, undistr_porfit, surplus_rese, special_rese,
money_cap, trad_asset, notes_receiv, accounts_receiv, oth_receiv,
prepayment, div_receiv, int_receiv, inventories, amor_exp,
nca_within_1y, sett_rsrv, loanto_oth_bank_fi, premium_receiv,
reinsur_receiv, reinsur_res_receiv, pur_resale_fa, oth_cur_assets,
total_cur_assets, fa_avail_for_sale, htm_invest, lt_eqt_invest,
invest_real_estate, time_deposits, oth_assets, lt_rec, fix_assets,
cip, const_materials, fixed_assets_disp, produc_bio_assets,
oil_and_gas_assets, intan_assets, r_and_d, goodwill, lt_amor_exp,
defer_tax_assets, decr_in_disbur, oth_nca, total_nca, cash_reser_cb,
depos_in_oth_bfi, prec_metals, deriv_assets, rr_reins_une_prem,
rr_reins_outstd_cla, rr_reins_lins_liab, rr_reins_lthins_liab,
refund_depos, ph_pledge_loans, refund_cap_depos, indep_acct_assets,
client_depos, client_prov, transac_seat_fee, invest_as_receiv,
total_assets, lt_borr, st_borr, cb_borr, depos_ib_deposits,
loan_oth_bank, trading_fl, notes_payable, acct_payable, adv_receipts,
sold_for_repur_fa, comm_payable, payroll_payable, taxes_payable,
int_payable, div_payable, oth_payable, acc_exp, deferred_inc,
st_bonds_payable, payable_to_reinsurer, rsrv_insur_cont,
acting_trading_sec, acting_uw_sec, non_cur_liab_due_1y, oth_cur_liab,
total_cur_liab, bond_payable, lt_payable, specific_payables,
estimated_liab, defer_tax_liab, defer_inc_non_cur_liab, oth_ncl,
total_ncl, depos_oth_bfi, deriv_liab, depos, agency_bus_liab,
oth_liab, prem_receiv_adva, depos_received, ph_invest, reser_une_prem,
reser_outstd_claims, reser_lins_liab, reser_lthins_liab,
lt_payroll_payable, oth_comp_income, oth_eqt_tools, oth_eqt_tools_p_shr,
lending_funds, acc_receivable, st_fin_payable, payables, hfs_assets,
hfs_sales, cost_fin_assets, fair_value_fin_assets, cip_total,
oth_pay_total, long_pay_total, debt_invest, oth_debt_invest,
oth_eq_invest, oth_illiq_fin_assets, oth_eq_ppbond, receiv_financing,
use_right_assets, lease_liab, contract_assets, contract_liab,
accounts_receiv_bill, accounts_pay, oth_rcv_total, fix_assets_total,
update_flag
```

**重要财务比率支持**:
- 流动比率 = total_cur_assets / total_cur_liab
- 资产负债率 = total_liab / total_assets (注: total_liab需要手动计算或使用total_cur_liab + total_ncl)
- 速动比率 = (total_cur_assets - inventories) / total_cur_liab

---

### 3. CashFlowItem (现金流量表数据项)

**描述**: 表示上市公司现金流量表的完整数据,按经营、投资、筹资三大活动分类,共87个字段。

**数据来源**: Tushare `cashflow` 接口

**主键**: `ts_code` + `end_date` + `report_type`

**字段分类**:

#### 3.1 基本标识字段 (必填)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| ts_code | string | 股票代码 |
| ann_date | string | 公告日期 |
| f_ann_date | string | 实际公告日期 |
| end_date | string | 报告期 |
| comp_type | string | 公司类型 |
| report_type | string | 报表类型 |
| end_type | string | 报告期类型 |

#### 3.2 经营活动现金流 (15个字段)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| c_fr_sale_sg | number? | 销售商品、提供劳务收到的现金 |
| recp_tax_rends | number? | 收到的税费返还 |
| c_fr_oth_operate_a | number? | 收到其他与经营活动有关的现金 |
| c_inf_fr_operate_a | number? | 经营活动现金流入小计 |
| c_paid_goods_s | number? | 购买商品、接受劳务支付的现金 |
| c_paid_to_for_empl | number? | 支付给职工以及为职工支付的现金 |
| c_paid_for_taxes | number? | 支付的各项税费 |
| oth_cash_pay_oper_act | number? | 支付其他与经营活动有关的现金 |
| st_cash_out_act | number? | 经营活动现金流出小计 |
| **n_cashflow_act** | **number?** | **经营活动产生的现金流量净额** ⭐ |
| ... | | 等 |

#### 3.3 投资活动现金流 (8个字段)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| c_disp_withdrwl_invest | number? | 收回投资收到的现金 |
| c_recp_return_invest | number? | 取得投资收益收到的现金 |
| n_recp_disp_fiolta | number? | 处置固定资产、无形资产和其他长期资产收回的现金净额 |
| stot_inflows_inv_act | number? | 投资活动现金流入小计 |
| c_pay_acq_const_fiolta | number? | 购建固定资产、无形资产和其他长期资产支付的现金 |
| c_paid_invest | number? | 投资支付的现金 |
| stot_out_inv_act | number? | 投资活动现金流出小计 |
| **n_cashflow_inv_act** | **number?** | **投资活动产生的现金流量净额** ⭐ |

#### 3.4 筹资活动现金流 (8个字段)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| c_recp_borrow | number? | 取得借款收到的现金 |
| proc_issue_bonds | number? | 发行债券收到的现金 |
| c_recp_cap_contrib | number? | 吸收投资收到的现金 |
| stot_cash_in_fnc_act | number? | 筹资活动现金流入小计 |
| c_prepay_amt_borr | number? | 偿还债务支付的现金 |
| c_pay_dist_dpcp_int_exp | number? | 分配股利、利润或偿付利息支付的现金 |
| stot_cashout_fnc_act | number? | 筹资活动现金流出小计 |
| **n_cash_flows_fnc_act** | **number?** | **筹资活动产生的现金流量净额** ⭐ |

#### 3.5 现金汇总指标 (3个字段)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| eff_fx_flu_cash | number? | 汇率变动对现金的影响 |
| **n_incr_cash_cash_equ** | **number?** | **现金及现金等价物净增加额** ⭐ |
| c_cash_equ_beg_period | number? | 期初现金及现金等价物余额 |
| c_cash_equ_end_period | number? | 期末现金及现金等价物余额 |

**完整字段清单** (87个):
```typescript
ts_code, ann_date, f_ann_date, end_date, comp_type, report_type, end_type,
net_profit, finan_exp, c_fr_sale_sg, recp_tax_rends, n_depos_incr_fi,
n_incr_loans_cb, n_inc_borr_oth_fi, prem_fr_orig_contr, n_incr_insured_dep,
n_reinsur_prem, n_incr_disp_tfa, ifc_cash_incr, n_incr_disp_faas,
n_incr_loans_oth_bank, n_cap_incr_repur, c_fr_oth_operate_a,
c_inf_fr_operate_a, c_paid_goods_s, c_paid_to_for_empl, c_paid_for_taxes,
n_incr_clt_loan_adv, n_incr_dep_cbob, c_pay_claims_orig_inco,
pay_handling_chrg, pay_comm_insur_plcy, oth_cash_pay_oper_act,
st_cash_out_act, n_cashflow_act, oth_recp_ral_inv_act,
c_disp_withdrwl_invest, c_recp_return_invest, n_recp_disp_fiolta,
n_recp_disp_sobu, stot_inflows_inv_act, c_pay_acq_const_fiolta,
c_paid_invest, n_disp_subs_oth_biz, oth_pay_ral_inv_act,
n_incr_pledge_loan, stot_out_inv_act, n_cashflow_inv_act, c_recp_borrow,
proc_issue_bonds, oth_cash_recp_ral_fnc_act, stot_cash_in_fnc_act,
free_cashflow, c_prepay_amt_borr, c_pay_dist_dpcp_int_exp,
incl_dvd_profit_paid_sc_ms, oth_cashpay_ral_fnc_act, stot_cashout_fnc_act,
n_cash_flows_fnc_act, eff_fx_flu_cash, n_incr_cash_cash_equ,
c_cash_equ_beg_period, c_cash_equ_end_period, c_recp_cap_contrib,
incl_cash_rec_saims, uncon_invest_loss, prov_depr_assets,
depr_fa_coga_dpba, amort_intang_assets, lt_amort_deferred_exp,
decr_deferred_exp, incr_acc_exp, loss_disp_fiolta, loss_scr_fa,
loss_fv_chg, invest_loss, decr_def_inc_tax_assets, incr_def_inc_tax_liab,
decr_inventories, decr_oper_payable, incr_oper_payable, others,
im_net_cashflow_oper_act, conv_debt_into_cap, conv_copbonds_due_within_1y,
fa_fnc_leases, im_n_incr_cash_equ, net_dism_capital_add, net_cash_rece_sec,
credit_impa_loss, use_right_asset_dep, oth_loss_asset, end_bal_cash,
beg_bal_cash, end_bal_cash_equ, beg_bal_cash_equ, update_flag
```

**关键指标说明**:
- **自由现金流** (free_cashflow): 企业自由现金流量,衡量企业创造现金的能力
- **三大活动净额**: n_cashflow_act (经营) + n_cashflow_inv_act (投资) + n_cash_flows_fnc_act (筹资) + eff_fx_flu_cash (汇率) = n_incr_cash_cash_equ (现金净增加额)

---

### 4. FinancialQueryParams (财务数据查询参数)

**描述**: 三个财务报表接口共享的查询参数类型。

**用途**: 用于查询利润表、资产负债表、现金流量表数据。

**字段定义**:

| 字段名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| ts_code | string | 否 | 股票代码 | "000001.SZ" |
| ann_date | string | 否 | 公告日期 YYYYMMDD | "20240430" |
| start_date | string | 否 | 报告期开始日期 YYYYMMDD | "20230101" |
| end_date | string | 否 | 报告期结束日期 YYYYMMDD | "20231231" |
| period | string | 否 | 报告期 YYYYMMDD | "20231231" |
| report_type | "1" \| "2" \| "3" \| "4" | 否 | 报表类型 | "1" |
| comp_type | "1" \| "2" | 否 | 公司类型 | "1" |

**参数说明**:
- `report_type`: "1"-合并报表, "2"-单季合并, "3"-调整单季, "4"-调整合并
- `comp_type`: "1"-合并报表, "2"-单季度
- `period` 与 `start_date/end_date` 互斥,优先使用 `period`
- 所有参数均为可选,但建议至少提供 `ts_code` 或 `period` 之一

**查询模式示例**:
```typescript
// 模式1: 查询指定公司的指定报告期
{ ts_code: '000001.SZ', period: '20231231' }

// 模式2: 查询指定公司的时间范围
{ ts_code: '000001.SZ', start_date: '20200101', end_date: '20231231' }

// 模式3: 查询指定公司的年报
{ ts_code: '000001.SZ', report_type: '4' }

// 模式4: 查询指定报告期的所有公司(仅VIP接口支持,当前不实现)
{ period: '20231231' }
```

---

## Validation Rules

### 1. 输入参数验证

#### 1.1 日期格式验证
- **规则**: 所有日期字段必须符合 YYYYMMDD 格式
- **示例**: "20231231" ✅, "2023-12-31" ❌
- **实现**: 在 `validator.ts` 中添加日期格式校验函数

#### 1.2 股票代码验证
- **规则**: ts_code 必须符合 {6位数字}.{2位交易所代码} 格式
- **示例**: "000001.SZ" ✅, "600519.SH" ✅, "000001" ❌
- **实现**: 使用正则表达式 `/^\d{6}\.(SZ|SH|BJ)$/`

#### 1.3 参数组合验证
- **规则1**: 如果同时提供 `period` 和 `start_date/end_date`,则 `period` 优先
- **规则2**: 如果未提供 `ts_code`,则必须提供 `period`(用于查询全市场数据,但当前2000积分接口不支持)

### 2. 输出数据验证

#### 2.1 必填字段验证
- **规则**: API返回的数据必须包含 `ts_code`, `ann_date`, `end_date` 三个基本字段
- **处理**: 如果缺失,记录警告日志但不抛出异常

#### 2.2 数值类型验证
- **规则**: 所有数值字段应为 `number` 类型或 `null/undefined`
- **处理**: Tushare API返回的是数字或null,SDK自动转换为TypeScript类型

---

## State Transitions

财务数据本身是**无状态**的查询数据,不存在状态转换。但数据的**更新状态**可以通过 `update_flag` 字段追踪:

```
┌─────────────┐
│  初始数据   │  update_flag = "0" (旧数据)
│  (Old)      │
└──────┬──────┘
       │
       │ 财报更正/补充
       ▼
┌─────────────┐
│  更新数据   │  update_flag = "1" (最新数据)
│  (Latest)   │
└─────────────┘
```

**说明**:
- Tushare可能因为财报更正发布多个版本的数据
- `update_flag = "1"` 表示该条数据是最新版本
- 用户应优先使用 `update_flag = "1"` 的数据

---

## Integration with Existing Models

### 现有模型兼容性

**现有 FinancialItem** (保留,向后兼容):
```typescript
// packages/tushare-sdk/src/models/financial.ts (现有)
export interface FinancialItem {
  ts_code: string;
  end_date: string;
  ann_date: string;
  report_type: 1 | 2 | 3 | 4;
  total_revenue?: number;
  revenue?: number;
  net_profit?: number;
  total_assets?: number;
  total_liabilities?: number;
  total_equity?: number;
  eps?: number;
  roe?: number;
}
```

**新增模型关系**:
```typescript
// IncomeStatementItem 是 FinancialItem 的超集(包含更多字段)
// BalanceSheetItem 和 CashFlowItem 是独立的新类型

// 用户迁移路径:
// 旧代码: const data = await getFinancialData(client, { ... });
// 新代码: const data = await client.getIncomeStatement({ ... });
```

**迁移指南**:
- 现有使用 `FinancialItem` 的代码无需修改
- 新代码推荐使用 `IncomeStatementItem`、`BalanceSheetItem`、`CashFlowItem` 获得更完整的类型支持
- `FinancialQueryParams` 可以与现有 `FinancialParams` 并存

---

## Design Decisions

### 决策1: 所有财务字段设计为可选类型

**理由**:
1. 不同公司类型(一般工商业、银行、保险、证券)的财务报表科目不同
2. Tushare API可能返回null值
3. 避免TypeScript严格模式下的类型错误

**示例**:
```typescript
export interface IncomeStatementItem {
  ts_code: string;  // 必填
  total_revenue?: number;  // 可选
  int_income?: number;  // 银行特有,一般企业为null
}
```

---

### 决策2: 共享查询参数类型

**理由**:
1. 三个接口的参数完全一致
2. 减少代码重复,提高可维护性
3. 用户学习成本低

**实现**:
```typescript
// 共享类型
export interface FinancialQueryParams { ... }

// 三个函数都使用相同参数
export async function getIncomeStatement(
  client: TushareClient,
  params?: FinancialQueryParams
): Promise<IncomeStatementItem[]>

export async function getBalanceSheet(
  client: TushareClient,
  params?: FinancialQueryParams
): Promise<BalanceSheetItem[]>

export async function getCashFlow(
  client: TushareClient,
  params?: FinancialQueryParams
): Promise<CashFlowItem[]>
```

---

### 决策3: 保留现有FinancialItem类型

**理由**:
1. 向后兼容,不破坏现有代码
2. 提供渐进式升级路径
3. 遵循语义化版本控制原则

---

## Type Mapping

| Tushare类型 | TypeScript类型 | 说明 |
|-------------|----------------|------|
| str | string | 字符串类型 |
| float | number \| undefined | 浮点数,可选 |
| int | number \| undefined | 整数,可选 |
| date (YYYYMMDD) | string | 日期字符串 |

**日期处理说明**:
- Tushare API返回的日期格式为字符串 "YYYYMMDD"
- SDK不进行日期类型转换,保持字符串格式
- 用户如需Date对象,可使用 `utils/date.ts` 中的辅助函数

---

## Summary

本数据模型设计包含:
- **3个核心实体**: IncomeStatementItem (94字段)、BalanceSheetItem (81字段)、CashFlowItem (87字段)
- **1个共享参数类型**: FinancialQueryParams
- **完整的字段级文档**: 每个字段都有清晰的中文说明和单位
- **向后兼容设计**: 保留现有FinancialItem,新增类型作为扩展
- **类型安全保证**: 所有字段都有明确的TypeScript类型定义

所有设计决策都经过充分评估,确保既满足功能需求,又保持与现有SDK架构的一致性。
