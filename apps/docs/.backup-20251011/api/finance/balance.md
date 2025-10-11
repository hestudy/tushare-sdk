---
title: get_balance - 获取资产负债表数据
description: 获取上市公司的资产负债表数据,包括总资产、总负债、股东权益等财务指标
keywords: [财务数据, 资产负债表, get_balance, 总资产, 股东权益]
type: api
order: 2
---

# get_balance

获取上市公司的资产负债表数据。

## 函数签名

```typescript
async function getBalance(params: BalanceParams): Promise<Balance[]>
```

## 参数

| 参数名 | 类型 | 必填 | 描述 | 默认值 | 示例 |
|--------|------|------|------|--------|------|
| params.ts_code | string | 是 | 股票代码 | - | '000001.SZ' |
| params.start_date | string | 否 | 报告期开始日期 | - | '20240101' |
| params.end_date | string | 否 | 报告期结束日期 | - | '20241231' |
| params.period | string | 否 | 报告期 | - | '20240331', '20240630', '20240930', '20241231' |
| params.report_type | string | 否 | 报表类型 | - | '1'-合并报表, '2'-单季合并, '3'-调整单季合并 |

## 返回值

**类型**: `Promise<Balance[]>`

返回资产负债表数据数组,每个对象包含:
- `ts_code`: 股票代码
- `ann_date`: 公告日期
- `f_ann_date`: 实际公告日期
- `end_date`: 报告期
- `report_type`: 报表类型
- `comp_type`: 公司类型
- `total_share`: 期末总股本
- `cap_rese`: 资本公积金
- `undistr_porfit`: 未分配利润
- `surplus_rese`: 盈余公积金
- `special_rese`: 专项储备
- `money_cap`: 货币资金
- `trad_asset`: 交易性金融资产
- `notes_receiv`: 应收票据
- `accounts_receiv`: 应收账款
- `oth_receiv`: 其他应收款
- `prepayment`: 预付款项
- `div_receiv`: 应收股利
- `int_receiv`: 应收利息
- `inventories`: 存货
- `amor_exp`: 长期待摊费用
- `nca_within_1y`: 一年内到期的非流动资产
- `sett_rsrv`: 结算备付金
- `loanto_oth_bank_fi`: 拆出资金
- `premium_receiv`: 应收保费
- `reinsur_receiv`: 应收分保账款
- `reinsur_res_receiv`: 应收分保合同准备金
- `pur_resale_fa`: 买入返售金融资产
- `oth_cur_assets`: 其他流动资产
- `total_cur_assets`: 流动资产合计
- `fa_avail_for_sale`: 可供出售金融资产
- `htm_invest`: 持有至到期投资
- `lt_eqt_invest`: 长期股权投资
- `invest_real_estate`: 投资性房地产
- `time_deposits`: 定期存款
- `oth_assets`: 其他资产
- `lt_rec`: 长期应收款
- `fix_assets`: 固定资产
- `cip`: 在建工程
- `const_materials`: 工程物资
- `fixed_assets_disp`: 固定资产清理
- `produc_bio_assets`: 生产性生物资产
- `oil_and_gas_assets`: 油气资产
- `intan_assets`: 无形资产
- `r_and_d`: 研发支出
- `goodwill`: 商誉
- `lt_amor_exp`: 长期待摊费用
- `defer_tax_assets`: 递延所得税资产
- `decr_in_disbur`: 发放贷款及垫款
- `oth_nca`: 其他非流动资产
- `total_nca`: 非流动资产合计
- `cash_reser_cb`: 现金及存放中央银行款项
- `depos_in_oth_bfi`: 存放同业和其它金融机构款项
- `prec_metals`: 贵金属
- `deriv_assets`: 衍生金融资产
- `rr_reins_une_prem`: 应收分保未到期责任准备金
- `rr_reins_outstd_cla`: 应收分保未决赔款准备金
- `rr_reins_lins_liab`: 应收分保寿险责任准备金
- `rr_reins_lthins_liab`: 应收分保长期健康险责任准备金
- `refund_depos`: 存出保证金
- `ph_pledge_loans`: 保户质押贷款
- `refund_cap_depos`: 存出资本保证金
- `indep_acct_assets`: 独立账户资产
- `client_depos`: 其中:客户资金存款
- `client_prov`: 其中:客户备付金
- `transac_seat_fee`: 其中:交易席位费
- `invest_as_receiv`: 应收款项类投资
- `total_assets`: 资产总计
- `lt_borr`: 长期借款
- `st_borr`: 短期借款
- `cb_borr`: 向中央银行借款
- `depos_ib_deposits`: 吸收存款及同业存放
- `loan_oth_bank`: 拆入资金
- `trading_fl`: 交易性金融负债
- `notes_payable`: 应付票据
- `acct_payable`: 应付账款
- `adv_receipts`: 预收款项
- `sold_for_repur_fa`: 卖出回购金融资产款
- `comm_payable`: 应付手续费及佣金
- `payroll_payable`: 应付职工薪酬
- `taxes_payable`: 应交税费
- `int_payable`: 应付利息
- `div_payable`: 应付股利
- `oth_payable`: 其他应付款
- `acc_exp`: 预提费用
- `deferred_inc`: 递延收益
- `st_bonds_payable`: 应付短期债券
- `payable_to_reinsurer`: 应付分保账款
- `rsrv_insur_cont`: 保险合同准备金
- `acting_trading_sec`: 代理买卖证券款
- `acting_uw_sec`: 代理承销证券款
- `non_cur_liab_due_1y`: 一年内到期的非流动负债
- `oth_cur_liab`: 其他流动负债
- `total_cur_liab`: 流动负债合计
- `bond_payable`: 应付债券
- `lt_payable`: 长期应付款
- `specific_payables`: 专项应付款
- `estimated_liab`: 预计负债
- `defer_tax_liab`: 递延所得税负债
- `defer_inc_non_cur_liab`: 递延收益-非流动负债
- `oth_ncl`: 其他非流动负债
- `total_ncl`: 非流动负债合计
- `depos_oth_bfi`: 同业和其它金融机构存放款项
- `deriv_liab`: 衍生金融负债
- `depos`: 吸收存款
- `agency_bus_liab`: 代理业务负债
- `oth_liab`: 其他负债
- `prem_receiv_adva`: 预收保费
- `depos_received`: 存入保证金
- `ph_invest`: 保户储金及投资款
- `reser_une_prem`: 未到期责任准备金
- `reser_outstd_claims`: 未决赔款准备金
- `reser_lins_liab`: 寿险责任准备金
- `reser_lthins_liab`: 长期健康险责任准备金
- `indept_acc_liab`: 独立账户负债
- `pledge_borr`: 其中:质押借款
- `indem_payable`: 应付赔付款
- `policy_div_payable`: 应付保单红利
- `total_liab`: 负债合计
- `treasury_share`: 减:库存股
- `ordin_risk_reser`: 一般风险准备
- `forex_differ`: 外币报表折算差额
- `invest_loss_unconf`: 未确认的投资损失
- `minority_int`: 少数股东权益
- `total_hldr_eqy_exc_min_int`: 股东权益合计(不含少数股东权益)
- `total_hldr_eqy_inc_min_int`: 股东权益合计(含少数股东权益)
- `total_liab_hldr_eqy`: 负债及股东权益总计
- `lt_payroll_payable`: 长期应付职工薪酬
- `oth_comp_income`: 其他综合收益
- `oth_eqt_tools`: 其他权益工具
- `oth_eqt_tools_p_shr`: 其他权益工具(优先股)
- `lending_funds`: 融出资金
- `acc_receivable`: 应收款项
- `st_fin_payable`: 应付短期融资款
- `payables`: 应付款项
- `hfs_assets`: 持有待售的资产
- `hfs_sales`: 持有待售的负债
- `cost_fin_assets`: 以摊余成本计量的金融资产
- `fair_value_fin_assets`: 以公允价值计量且其变动计入其他综合收益的金融资产
- `cip_total`: 在建工程(合计)
- `oth_pay_total`: 其他应付款(合计)
- `long_pay_total`: 长期应付款(合计)
- `debt_invest`: 债权投资
- `oth_debt_invest`: 其他债权投资
- `oth_eq_invest`: 其他权益工具投资
- `oth_illiq_fin_assets`: 其他非流动金融资产
- `oth_eq_ppbond`: 其他权益工具:永续债
- `receiv_financing`: 应收款项融资
- `use_right_assets`: 使用权资产
- `lease_liab`: 租赁负债
- `contract_assets`: 合同资产
- `contract_liab`: 合同负债
- `accounts_receiv_bill`: 应收票据及应收账款
- `accounts_pay`: 应付票据及应付账款
- `oth_rcv_total`: 其他应收款(合计)
- `fix_assets_total`: 固定资产(合计)

## 代码示例

### 获取指定公司的最新资产负债表

```typescript
import { getBalance } from '@tushare/sdk';

const balanceData = await getBalance({
  ts_code: '000001.SZ',
  period: '20240930'
});

console.log(`总资产: ${balanceData[0].total_assets / 100000000} 亿元`);
console.log(`总负债: ${balanceData[0].total_liab / 100000000} 亿元`);
console.log(`股东权益: ${balanceData[0].total_hldr_eqy_inc_min_int / 100000000} 亿元`);
```

### 计算资产负债率

```typescript
const balanceData = await getBalance({
  ts_code: '000001.SZ',
  period: '20240930'
});

if (balanceData.length > 0) {
  const data = balanceData[0];
  const debtRatio = ((data.total_liab / data.total_assets) * 100).toFixed(2);
  console.log(`资产负债率: ${debtRatio}%`);
}
```

### 分析资产结构

```typescript
const balanceData = await getBalance({
  ts_code: '000001.SZ',
  period: '20240930'
});

if (balanceData.length > 0) {
  const data = balanceData[0];
  const currentAssetRatio = ((data.total_cur_assets / data.total_assets) * 100).toFixed(2);
  const nonCurrentAssetRatio = ((data.total_nca / data.total_assets) * 100).toFixed(2);
  
  console.log(`流动资产占比: ${currentAssetRatio}%`);
  console.log(`非流动资产占比: ${nonCurrentAssetRatio}%`);
}
```

### 获取多期数据进行对比

```typescript
const balanceData = await getBalance({
  ts_code: '000001.SZ',
  start_date: '20230101',
  end_date: '20241231'
});

console.log('资产规模变化:');
balanceData.forEach(item => {
  console.log(`${item.end_date}: ${item.total_assets / 100000000} 亿元`);
});
```

## 异常

| 异常类型 | 描述 | 触发条件 |
|----------|------|----------|
| ApiError | API 调用失败 | 网络错误或服务端错误 |
| ValidationError | 参数验证失败 | 股票代码或日期格式不正确 |
| NotFoundError | 数据不存在 | 指定股票代码或报告期不存在 |

## 注意事项

- `ts_code` 参数必填
- 日期格式: YYYYMMDD (如 '20240101')
- 报告期格式: YYYYMMDD,通常为季度末日期(0331, 0630, 0930, 1231)
- 金额单位: 元
- 数据更新频率: 上市公司公告后 T+1 日更新
- 建议使用 `period` 参数查询特定报告期,避免返回过多数据
- 合并报表(`report_type=1`)是最常用的报表类型
- 资产负债表遵循会计恒等式: 资产 = 负债 + 股东权益

## 相关 API

- [get_income](/api/finance/income) - 获取利润表数据
- [get_stock_basic](/api/stock/basic) - 获取股票基础信息
