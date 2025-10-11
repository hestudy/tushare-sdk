---
title: get_fund_basic - 获取基金基础信息
description: 获取公募基金的基础信息,包括基金代码、名称、类型、管理人等
keywords: [基金, 基础信息, get_fund_basic, 基金列表]
type: api
order: 1
---

# get_fund_basic

获取公募基金的基础信息。

## 函数签名

```typescript
async function getFundBasic(params?: FundBasicParams): Promise<FundBasic[]>
```

## 参数

| 参数名 | 类型 | 必填 | 描述 | 默认值 | 示例 |
|--------|------|------|------|--------|------|
| params.ts_code | string | 否 | 基金代码 | - | '110022.OF' |
| params.market | string | 否 | 交易市场 | - | 'E', 'O' |
| params.status | string | 否 | 存续状态 | 'D' | 'D'-正常, 'I'-发行, 'L'-清盘 |

## 返回值

**类型**: `Promise<FundBasic[]>`

返回基金基础信息数组,每个对象包含:
- `ts_code`: 基金代码
- `name`: 基金名称
- `management`: 管理人
- `fund_type`: 基金类型
- `found_date`: 成立日期
- `due_date`: 到期日期
- `list_date`: 上市日期
- `issue_amount`: 发行规模(亿元)

## 代码示例

### 获取所有正常存续的基金

```typescript
import { getFundBasic } from '@tushare/sdk';

const funds = await getFundBasic({ status: 'D' });
console.log(funds);
```

### 获取指定基金信息

```typescript
const fund = await getFundBasic({ ts_code: '110022.OF' });
console.log(fund[0].name); // 易方达消费行业股票
console.log(fund[0].management); // 易方达基金管理有限公司
```

### 获取场内交易基金

```typescript
const etfFunds = await getFundBasic({ market: 'E', status: 'D' });
console.log(`共有 ${etfFunds.length} 只场内基金`);
```

## 异常

| 异常类型 | 描述 | 触发条件 |
|----------|------|----------|
| ApiError | API 调用失败 | 网络错误或服务端错误 |
| ValidationError | 参数验证失败 | 参数格式不正确 |

## 注意事项

- 不传参数时返回所有正常存续的基金
- `market` 参数: 'E'-场内, 'O'-场外
- 基金代码格式: 6位数字 + '.OF'(场外) 或 '.SH'/'SZ'(场内)
- 数据更新频率: 每日更新

## 相关 API

- [get_fund_nav](/api/fund/nav) - 获取基金净值数据
- [get_stock_basic](/api/stock/basic) - 获取股票基础信息
