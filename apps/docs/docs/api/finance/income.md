---
title: get_income - 获取利润表数据
description: 获取上市公司的利润表数据,包括营业收入、净利润等财务指标
keywords: [财务数据, 利润表, get_income, 营业收入, 净利润]
type: api
order: 1
---

# get_income

获取上市公司的利润表数据。

## 函数签名

```typescript
async function getIncome(params: IncomeParams): Promise<Income[]>
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

**类型**: `Promise<Income[]>`

返回利润表数据数组,每个对象包含:
- `ts_code`: 股票代码
- `ann_date`: 公告日期
- `f_ann_date`: 实际公告日期
- `end_date`: 报告期
- `report_type`: 报表类型
- `comp_type`: 公司类型
- `basic_eps`: 基本每股收益
- `diluted_eps`: 稀释每股收益
- `total_revenue`: 营业总收入
- `revenue`: 营业收入
- `int_income`: 利息收入
- `prem_earned`: 已赚保费
- `comm_income`: 手续费及佣金收入
- `n_commis_income`: 手续费及佣金净收入
- `n_oth_income`: 其他经营净收益
- `n_oth_b_income`: 加:其他业务净收益
- `prem_income`: 保险业务收入
- `out_prem`: 减:分出保费
- `une_prem_reser`: 提取未到期责任准备金
- `reins_income`: 其中:分保费收入
- `n_sec_tb_income`: 代理买卖证券业务净收入
- `n_sec_uw_income`: 证券承销业务净收入
- `n_asset_mg_income`: 受托客户资产管理业务净收入
- `oth_b_income`: 其他业务收入
- `fv_value_chg_gain`: 加:公允价值变动净收益
- `invest_income`: 加:投资净收益
- `ass_invest_income`: 其中:对联营企业和合营企业的投资收益
- `forex_gain`: 加:汇兑净收益
- `total_cogs`: 营业总成本
- `oper_cost`: 减:营业成本
- `int_exp`: 减:利息支出
- `comm_exp`: 减:手续费及佣金支出
- `biz_tax_surchg`: 减:营业税金及附加
- `sell_exp`: 减:销售费用
- `admin_exp`: 减:管理费用
- `fin_exp`: 减:财务费用
- `assets_impair_loss`: 减:资产减值损失
- `prem_refund`: 退保金
- `compens_payout`: 赔付总支出
- `reser_insur_liab`: 提取保险责任准备金
- `div_payt`: 保户红利支出
- `reins_exp`: 分保费用
- `oper_exp`: 营业支出
- `compens_payout_refu`: 减:摊回赔付支出
- `insur_reser_refu`: 减:摊回保险责任准备金
- `reins_cost_refund`: 减:摊回分保费用
- `other_bus_cost`: 其他业务成本
- `operate_profit`: 营业利润
- `non_oper_income`: 加:营业外收入
- `non_oper_exp`: 减:营业外支出
- `nca_disploss`: 其中:减:非流动资产处置净损失
- `total_profit`: 利润总额
- `income_tax`: 减:所得税费用
- `n_income`: 净利润(含少数股东损益)
- `n_income_attr_p`: 净利润(不含少数股东损益)
- `minority_gain`: 少数股东损益
- `oth_compr_income`: 其他综合收益
- `t_compr_income`: 综合收益总额
- `compr_inc_attr_p`: 归属于母公司(或股东)的综合收益总额
- `compr_inc_attr_m_s`: 归属于少数股东的综合收益总额
- `ebit`: 息税前利润
- `ebitda`: 息税折旧摊销前利润
- `insurance_exp`: 保险业务支出
- `undist_profit`: 年初未分配利润
- `distable_profit`: 可分配利润

## 代码示例

### 获取指定公司的最新利润表

```typescript
import { getIncome } from '@tushare/sdk';

const incomeData = await getIncome({
  ts_code: '000001.SZ',
  period: '20240930'
});

console.log(`营业收入: ${incomeData[0].revenue / 100000000} 亿元`);
console.log(`净利润: ${incomeData[0].n_income_attr_p / 100000000} 亿元`);
```

### 获取指定时间范围的利润表

```typescript
const incomeData = await getIncome({
  ts_code: '000001.SZ',
  start_date: '20230101',
  end_date: '20241231'
});

console.log(`共有 ${incomeData.length} 期财报数据`);
incomeData.forEach(item => {
  console.log(`${item.end_date}: 营业收入 ${item.revenue / 100000000} 亿元`);
});
```

### 计算营业利润率

```typescript
const incomeData = await getIncome({
  ts_code: '000001.SZ',
  period: '20240930'
});

if (incomeData.length > 0) {
  const data = incomeData[0];
  const profitMargin = ((data.operate_profit / data.revenue) * 100).toFixed(2);
  console.log(`营业利润率: ${profitMargin}%`);
}
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

## 相关 API

- [get_balance](/api/finance/balance) - 获取资产负债表数据
- [get_stock_basic](/api/stock/basic) - 获取股票基础信息
