---
title: get_fund_nav - 获取基金净值数据
description: 获取公募基金的单位净值、累计净值等历史数据
keywords: [基金, 净值, get_fund_nav, 基金净值]
type: api
order: 2
---

# get_fund_nav

获取公募基金的净值数据。

## 函数签名

```typescript
async function getFundNav(params: FundNavParams): Promise<FundNav[]>
```

## 参数

| 参数名 | 类型 | 必填 | 描述 | 默认值 | 示例 |
|--------|------|------|------|--------|------|
| params.ts_code | string | 是 | 基金代码 | - | '110022.OF' |
| params.start_date | string | 否 | 开始日期 | - | '20240101' |
| params.end_date | string | 否 | 结束日期 | - | '20241231' |

## 返回值

**类型**: `Promise<FundNav[]>`

返回基金净值数据数组,每个对象包含:
- `ts_code`: 基金代码
- `ann_date`: 公告日期
- `nav_date`: 净值日期
- `unit_nav`: 单位净值
- `accum_nav`: 累计净值
- `accum_div`: 累计分红
- `net_asset`: 资产净值(元)
- `total_netasset`: 合计资产净值(元)
- `adj_nav`: 复权单位净值

## 代码示例

### 获取指定基金的最新净值

```typescript
import { getFundNav } from '@tushare/sdk';

const navData = await getFundNav({
  ts_code: '110022.OF',
  start_date: '20240101',
  end_date: '20241231'
});

console.log(`最新净值: ${navData[0].unit_nav}`);
console.log(`累计净值: ${navData[0].accum_nav}`);
```

### 计算基金收益率

```typescript
const navData = await getFundNav({
  ts_code: '110022.OF',
  start_date: '20240101',
  end_date: '20241231'
});

if (navData.length >= 2) {
  const latestNav = navData[0].unit_nav;
  const oldestNav = navData[navData.length - 1].unit_nav;
  const returnRate = ((latestNav - oldestNav) / oldestNav * 100).toFixed(2);
  console.log(`收益率: ${returnRate}%`);
}
```

### 批量获取多个基金的净值

```typescript
const fundCodes = ['110022.OF', '110011.OF', '110003.OF'];

const allNavData = await Promise.all(
  fundCodes.map(code => getFundNav({ ts_code: code }))
);

allNavData.forEach((navData, index) => {
  console.log(`${fundCodes[index]}: ${navData[0].unit_nav}`);
});
```

## 异常

| 异常类型 | 描述 | 触发条件 |
|----------|------|----------|
| ApiError | API 调用失败 | 网络错误或服务端错误 |
| ValidationError | 参数验证失败 | 基金代码格式不正确或日期格式错误 |
| NotFoundError | 数据不存在 | 指定基金代码不存在 |

## 注意事项

- `ts_code` 参数必填
- 日期格式: YYYYMMDD (如 '20240101')
- 不指定日期范围时返回最近的净值数据
- 数据按日期倒序排列(最新的在前)
- 数据更新频率: T+1 日更新(交易日后一天)
- 单次查询建议不超过 1 年数据量

## 相关 API

- [get_fund_basic](/api/fund/basic) - 获取基金基础信息
- [get_stock_daily](/api/stock/daily) - 获取股票日线数据
