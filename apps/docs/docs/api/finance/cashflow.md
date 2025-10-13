---
title: get_cashflow - 获取现金流量表数据
description: 获取上市公司的现金流量表数据,包括经营、投资、筹资三大活动现金流
keywords: [财务数据, 现金流量表, get_cashflow, 经营现金流, 投资现金流, 筹资现金流]
type: api
order: 3
---

# get_cashflow

获取上市公司的现金流量表数据,按经营活动、投资活动、筹资活动分类展示企业现金流入和流出情况。

## 函数签名

```typescript
async function getCashFlow(params: FinancialQueryParams): Promise<CashFlowItem[]>
```

## 参数

| 参数名 | 类型 | 必填 | 描述 | 默认值 | 示例 |
|--------|------|------|------|--------|------|
| params.ts_code | string | 否 | 股票代码 | - | '000001.SZ', '600519.SH' |
| params.ann_date | string | 否 | 公告日期 | - | '20240430' |
| params.start_date | string | 否 | 报告期开始日期 | - | '20200101' |
| params.end_date | string | 否 | 报告期结束日期 | - | '20231231' |
| params.period | string | 否 | 报告期(优先级最高) | - | '20231231', '20230930', '20230630', '20230331' |
| params.report_type | string | 否 | 报表类型 | - | '1'-合并报表, '2'-单季合并, '3'-调整单季, '4'-调整合并 |
| params.comp_type | string | 否 | 公司类型 | - | '1'-一般工商业, '2'-银行, '3'-保险, '4'-证券 |

## 返回值

**类型**: `Promise<CashFlowItem[]>`

返回现金流量表数据数组,每个对象包含 **87 个字段**,按三大活动分类:

### 基本标识字段 (8个)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| ts_code | string | 股票代码 |
| ann_date | string | 公告日期 (YYYYMMDD) |
| f_ann_date | string | 实际公告日期 (YYYYMMDD) |
| end_date | string | 报告期 (YYYYMMDD) |
| comp_type | string | 公司类型: 1-一般工商业, 2-银行, 3-保险, 4-证券 |
| report_type | string | 报表类型: 1-合并报表, 2-单季合并, 3-调整单季, 4-调整合并 |
| end_type | string | 报告期类型: 1-一季报, 2-半年报, 3-三季报, 4-年报 |
| update_flag | string | 更新标识: 1-最新数据 |

### 经营活动现金流 (16个核心字段)

| 字段名 | 类型 | 说明 | 单位 |
|--------|------|------|------|
| **n_cashflow_act** | number | **经营活动产生的现金流量净额**(核心指标) | 元 |
| c_fr_sale_sg | number | 销售商品、提供劳务收到的现金 | 元 |
| recp_tax_rends | number | 收到的税费返还 | 元 |
| c_fr_oth_operate_a | number | 收到其他与经营活动有关的现金 | 元 |
| c_inf_fr_operate_a | number | 经营活动现金流入小计 | 元 |
| c_paid_goods_s | number | 购买商品、接受劳务支付的现金 | 元 |
| c_paid_to_for_empl | number | 支付给职工以及为职工支付的现金 | 元 |
| c_paid_for_taxes | number | 支付的各项税费 | 元 |
| pay_handling_chrg | number | 支付手续费的现金 | 元 |
| oth_cash_pay_oper_act | number | 支付其他与经营活动有关的现金 | 元 |
| st_cash_out_act | number | 经营活动现金流出小计 | 元 |
| n_depos_incr_fi | number | 客户存款和同业存放款项净增加额 | 元 |
| n_incr_loans_cb | number | 向中央银行借款净增加额 | 元 |
| n_inc_borr_oth_fi | number | 向其他金融机构拆入资金净增加额 | 元 |
| prem_fr_orig_contr | number | 收到原保险合同保费取得的现金 | 元 |
| n_incr_clt_loan_adv | number | 客户贷款及垫款净增加额 | 元 |

### 投资活动现金流 (9个核心字段)

| 字段名 | 类型 | 说明 | 单位 |
|--------|------|------|------|
| **n_cashflow_inv_act** | number | **投资活动产生的现金流量净额**(核心指标) | 元 |
| c_disp_withdrwl_invest | number | 收回投资收到的现金 | 元 |
| c_recp_return_invest | number | 取得投资收益收到的现金 | 元 |
| n_recp_disp_fiolta | number | 处置固定资产、无形资产和其他长期资产收回的现金净额 | 元 |
| stot_inflows_inv_act | number | 投资活动现金流入小计 | 元 |
| c_pay_acq_const_fiolta | number | 购建固定资产、无形资产和其他长期资产支付的现金(资本支出) | 元 |
| c_paid_invest | number | 投资支付的现金 | 元 |
| oth_pay_ral_inv_act | number | 支付其他与投资活动有关的现金 | 元 |
| stot_out_inv_act | number | 投资活动现金流出小计 | 元 |

### 筹资活动现金流 (8个核心字段)

| 字段名 | 类型 | 说明 | 单位 |
|--------|------|------|------|
| **n_cash_flows_fnc_act** | number | **筹资活动产生的现金流量净额**(核心指标) | 元 |
| c_recp_borrow | number | 取得借款收到的现金 | 元 |
| proc_issue_bonds | number | 发行债券收到的现金 | 元 |
| oth_cash_recp_ral_fnc_act | number | 收到其他与筹资活动有关的现金 | 元 |
| stot_cash_in_fnc_act | number | 筹资活动现金流入小计 | 元 |
| c_prepay_amt_borr | number | 偿还债务支付的现金 | 元 |
| c_pay_dist_dpcp_int_exp | number | 分配股利、利润或偿付利息支付的现金 | 元 |
| oth_cashpay_ral_fnc_act | number | 支付其他与筹资活动有关的现金 | 元 |
| stot_cashout_fnc_act | number | 筹资活动现金流出小计 | 元 |

### 现金汇总指标 (7个核心字段)

| 字段名 | 类型 | 说明 | 单位 |
|--------|------|------|------|
| **n_incr_cash_cash_equ** | number | **现金及现金等价物净增加额**(核心指标) | 元 |
| c_cash_equ_beg_period | number | 期初现金及现金等价物余额 | 元 |
| c_cash_equ_end_period | number | 期末现金及现金等价物余额 | 元 |
| eff_fx_flu_cash | number | 汇率变动对现金的影响 | 元 |
| c_recp_cap_contrib | number | 吸收投资收到的现金 | 元 |
| end_bal_cash | number | 现金的期末余额 | 元 |
| beg_bal_cash | number | 现金的期初余额 | 元 |

### 补充项目 (39个字段)

包含间接法计算、资产减值、折旧摊销等补充信息:

| 字段名 | 类型 | 说明 | 单位 |
|--------|------|------|------|
| net_profit | number | 净利润 | 元 |
| finan_exp | number | 财务费用 | 元 |
| prov_depr_assets | number | 加:资产减值准备 | 元 |
| depr_fa_coga_dpba | number | 固定资产折旧、油气资产折耗、生产性生物资产折旧 | 元 |
| amort_intang_assets | number | 无形资产摊销 | 元 |
| lt_amort_deferred_exp | number | 长期待摊费用摊销 | 元 |
| decr_inventories | number | 存货的减少 | 元 |
| decr_oper_payable | number | 经营性应收项目的减少 | 元 |
| incr_oper_payable | number | 经营性应付项目的增加 | 元 |
| im_net_cashflow_oper_act | number | 经营活动产生的现金流量净额(间接法) | 元 |
| im_n_incr_cash_equ | number | 现金及现金等价物的净增加额(间接法) | 元 |
| free_cashflow | number | 企业自由现金流量 | 元 |

更多补充字段(含融资租赁、债务转资本、折旧摊销细节等)请参考 SDK 类型定义: `CashFlowItem` 接口。

## 代码示例

### 示例 1: 获取指定公司最新现金流量表

```typescript
import { getCashFlow } from '@tushare/sdk';

const cashflowData = await getCashFlow({
  ts_code: '000001.SZ',
  period: '20231231'
});

if (cashflowData.length > 0) {
  const data = cashflowData[0];
  console.log(`报告期: ${data.end_date}`);
  console.log(`经营现金流净额: ${data.n_cashflow_act / 100000000} 亿元`);
  console.log(`投资现金流净额: ${data.n_cashflow_inv_act / 100000000} 亿元`);
  console.log(`筹资现金流净额: ${data.n_cash_flows_fnc_act / 100000000} 亿元`);
}
```

### 示例 2: 现金流健康度分析

```typescript
import { getCashFlow } from '@tushare/sdk';

const cashflowData = await getCashFlow({
  ts_code: '600519.SH',
  period: '20231231'
});

if (cashflowData.length > 0) {
  const data = cashflowData[0];

  // 分析三大活动现金流健康度
  const operatingCF = data.n_cashflow_act || 0;
  const investingCF = data.n_cashflow_inv_act || 0;
  const financingCF = data.n_cash_flows_fnc_act || 0;

  console.log('=== 现金流健康度分析 ===');
  console.log(`经营活动现金流: ${(operatingCF / 100000000).toFixed(2)} 亿元 ${operatingCF > 0 ? '✓' : '✗'}`);
  console.log(`投资活动现金流: ${(investingCF / 100000000).toFixed(2)} 亿元 ${investingCF < 0 ? '✓(正常扩张)' : ''}`);
  console.log(`筹资活动现金流: ${(financingCF / 100000000).toFixed(2)} 亿元`);

  // 健康模式判断
  if (operatingCF > 0 && investingCF < 0 && financingCF < 0) {
    console.log('\n现金流模式: 成熟型企业(经营赚钱,投资扩张,偿还债务) ✓');
  } else if (operatingCF > 0 && investingCF < 0 && financingCF > 0) {
    console.log('\n现金流模式: 成长型企业(经营赚钱,投资扩张,融资支持) ✓');
  } else if (operatingCF < 0) {
    console.log('\n现金流模式: 警告!经营现金流为负 ✗');
  }
}
```

### 示例 3: 自由现金流计算

```typescript
import { getCashFlow } from '@tushare/sdk';

const cashflowData = await getCashFlow({
  ts_code: '000001.SZ',
  period: '20231231'
});

if (cashflowData.length > 0) {
  const data = cashflowData[0];

  // 计算自由现金流 (FCF = 经营现金流 - 资本支出)
  const operatingCF = data.n_cashflow_act || 0;
  const capex = data.c_pay_acq_const_fiolta || 0; // 资本支出
  const freeCashFlow = operatingCF - capex;

  console.log('=== 自由现金流分析 ===');
  console.log(`经营活动现金流: ${(operatingCF / 100000000).toFixed(2)} 亿元`);
  console.log(`资本支出(CAPEX): ${(capex / 100000000).toFixed(2)} 亿元`);
  console.log(`自由现金流(FCF): ${(freeCashFlow / 100000000).toFixed(2)} 亿元`);

  if (freeCashFlow > 0) {
    console.log('✓ 企业有充足的自由现金流,可用于分红、回购或偿债');
  } else {
    console.log('✗ 自由现金流为负,企业需要额外融资');
  }
}
```

### 示例 4: 多期现金流趋势分析

```typescript
import { getCashFlow } from '@tushare/sdk';

// 查询最近四个季度的现金流量表
const periods = ['20231231', '20230930', '20230630', '20230331'];
const promises = periods.map(period =>
  getCashFlow({ ts_code: '600519.SH', period })
);

const results = await Promise.all(promises);

console.log('=== 多期现金流趋势分析 ===');
results.forEach((data, index) => {
  if (data.length > 0) {
    const item = data[0];
    const operatingCF = item.n_cashflow_act || 0;
    console.log(`${item.end_date}: 经营现金流 ${(operatingCF / 100000000).toFixed(2)} 亿元`);
  }
});

// 计算同比增长率(如果有去年同期数据)
if (results[0].length > 0 && results[3].length > 0) {
  const currentYearQ4 = results[0][0].n_cashflow_act || 0;
  const currentYearQ1 = results[3][0].n_cashflow_act || 0;
  const growth = ((currentYearQ4 - currentYearQ1) / Math.abs(currentYearQ1)) * 100;
  console.log(`\n全年经营现金流增长: ${growth.toFixed(2)}%`);
}
```

## 异常

| 异常类型 | 描述 | 触发条件 |
|----------|------|----------|
| ApiError | API 调用失败 | 网络错误或服务端错误 |
| ValidationError | 参数验证失败 | 股票代码或日期格式不正确 |
| NotFoundError | 数据不存在 | 指定股票代码或报告期不存在数据 |
| PermissionError | 权限不足 | 账户积分不足 2000(财务数据接口要求) |

## 注意事项

- 金额单位: **元**(如需转换为亿元,除以 `100000000`)
- 日期格式: **YYYYMMDD**(如 `'20231231'`)
- 报告期格式: 通常为季度末日期(`0331`, `0630`, `0930`, `1231`)
- **权限要求**: 财务数据接口需要至少 **2000 积分**
- 数据时效性: 上市公司公告后 **T+1 日**更新
- 参数优先级: `period` > `start_date`/`end_date` > `ann_date`
- 建议使用 `period` 参数查询特定报告期,避免返回过多数据
- 合并报表(`report_type='1'`)是最常用的报表类型

### 现金流量表分析要点

1. **经营现金流健康度**:
   - 正值且持续增长 → 企业主营业务盈利质量高
   - 负值或波动大 → 需警惕利润质量

2. **投资现金流**:
   - 通常为负值(投资扩张)是正常的
   - 长期为正值 → 可能缺乏成长性或在出售资产

3. **筹资现金流**:
   - 正值 → 企业在融资(借款、发债、增发等)
   - 负值 → 企业在偿债或分红

4. **自由现金流(FCF)**:
   - FCF = 经营现金流 - 资本支出
   - 正值 → 企业有充足现金用于分红、回购或偿债
   - 负值 → 企业依赖外部融资

5. **现金流平衡关系**:
   - 理论上: 经营现金流 + 投资现金流 + 筹资现金流 ≈ 现金净增加额(考虑汇率影响)

## 相关 API

- [get_income](/api/finance/income) - 获取利润表数据
- [get_balance](/api/finance/balance) - 获取资产负债表数据
- [get_stock_basic](/api/stock/basic) - 获取股票基础信息
