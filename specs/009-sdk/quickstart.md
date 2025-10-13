# Quickstart: SDK财务数据功能

**Feature**: 009-sdk
**Date**: 2025-10-13
**Estimated Time**: 5-10分钟

## 概述

本快速入门指南将帮助您在5-10分钟内开始使用Tushare SDK的财务数据功能,包括查询利润表、资产负债表、现金流量表等核心财务报表数据。

---

## 前置要求

1. **Node.js环境**: Node.js 18+ LTS
2. **Tushare账户**:
   - 注册账号: [https://tushare.pro/register](https://tushare.pro/register)
   - 获取Token: [https://tushare.pro/user/token](https://tushare.pro/user/token)
   - **积分要求**: 至少 2000 积分 (获取积分: https://tushare.pro/document/1?doc_id=13)
3. **SDK安装**:
   ```bash
   npm install @hestudy/tushare-sdk
   # 或
   pnpm add @hestudy/tushare-sdk
   ```

---

## 快速开始

### Step 1: 创建客户端实例

```typescript
import { TushareClient } from '@hestudy/tushare-sdk';

const client = new TushareClient({
  token: 'YOUR_TUSHARE_TOKEN',  // 替换为您的实际Token
  cache: { enabled: true },      // 可选:启用缓存,提高性能
});
```

**⚠️ 安全提示**:
- 不要将Token硬编码在代码中
- 推荐使用环境变量: `process.env.TUSHARE_TOKEN`
- 生产环境建议通过后端代理访问API

---

### Step 2: 查询利润表数据

```typescript
// 查询平安银行 (000001.SZ) 的最新年报利润表
const incomeData = await client.getIncomeStatement({
  ts_code: '000001.SZ',
  period: '20231231'  // 2023年年报
});

console.log('利润表数据:', incomeData[0]);
console.log(`营业总收入: ${incomeData[0].total_revenue?.toLocaleString()} 元`);
console.log(`净利润: ${incomeData[0].n_income_attr_p?.toLocaleString()} 元`);
console.log(`基本每股收益: ${incomeData[0].basic_eps} 元/股`);
```

**输出示例**:
```
营业总收入: 189,234,567,890 元
净利润: 45,678,901,234 元
基本每股收益: 2.34 元/股
```

---

### Step 3: 查询资产负债表数据

```typescript
// 查询贵州茅台 (600519.SH) 的资产负债表
const balanceData = await client.getBalanceSheet({
  ts_code: '600519.SH',
  period: '20231231'
});

const data = balanceData[0];
console.log('资产负债表数据:');
console.log(`总资产: ${data.total_assets?.toLocaleString()} 元`);
console.log(`流动资产: ${data.total_cur_assets?.toLocaleString()} 元`);
console.log(`流动负债: ${data.total_cur_liab?.toLocaleString()} 元`);
console.log(`股东权益: ${data.undistr_porfit?.toLocaleString()} 元(未分配利润)`);

// 计算财务比率
const currentRatio = (data.total_cur_assets! / data.total_cur_liab!).toFixed(2);
console.log(`流动比率: ${currentRatio}`);
```

**输出示例**:
```
总资产: 567,890,123,456 元
流动资产: 456,789,012,345 元
流动负债: 123,456,789,012 元
股东权益: 234,567,890,123 元(未分配利润)
流动比率: 3.70
```

---

### Step 4: 查询现金流量表数据

```typescript
// 查询平安银行的现金流量表(时间序列)
const cashflowData = await client.getCashFlow({
  ts_code: '000001.SZ',
  start_date: '20230101',
  end_date: '20231231'
});

console.log(`共查询到 ${cashflowData.length} 个报告期的数据`);

cashflowData.forEach(item => {
  console.log(`\n报告期: ${item.end_date}`);
  console.log(`  经营活动现金流: ${item.n_cashflow_act?.toLocaleString()} 元`);
  console.log(`  投资活动现金流: ${item.n_cashflow_inv_act?.toLocaleString()} 元`);
  console.log(`  筹资活动现金流: ${item.n_cash_flows_fnc_act?.toLocaleString()} 元`);
  console.log(`  自由现金流: ${item.free_cashflow?.toLocaleString()} 元`);
});
```

**输出示例**:
```
共查询到 4 个报告期的数据

报告期: 20231231
  经营活动现金流: 12,345,678,901 元
  投资活动现金流: -3,456,789,012 元
  筹资活动现金流: -1,234,567,890 元
  自由现金流: 8,888,888,899 元
...
```

---

## 常见使用场景

### 场景1: 多期财务数据对比分析

```typescript
// 获取贵州茅台近3年的年报利润表
const years = ['20211231', '20221231', '20231231'];

for (const period of years) {
  const data = await client.getIncomeStatement({
    ts_code: '600519.SH',
    period
  });

  if (data.length > 0) {
    const year = period.substring(0, 4);
    const revenue = data[0].total_revenue;
    const profit = data[0].n_income_attr_p;
    const margin = ((profit! / revenue!) * 100).toFixed(2);

    console.log(`${year}年: 营收 ${revenue?.toLocaleString()}元, 净利润 ${profit?.toLocaleString()}元, 净利率 ${margin}%`);
  }
}
```

**输出示例**:
```
2021年: 营收 106,017,160,000元, 净利润 52,460,000,000元, 净利率 49.49%
2022年: 营收 127,146,800,000元, 净利润 62,749,110,000元, 净利率 49.35%
2023年: 营收 149,964,800,000元, 净利润 74,779,850,000元, 净利率 49.87%
```

---

### 场景2: 计算财务健康指标

```typescript
async function analyzeFinancialHealth(tsCode: string, period: string) {
  // 并行查询三大报表
  const [incomeData, balanceData, cashflowData] = await Promise.all([
    client.getIncomeStatement({ ts_code: tsCode, period }),
    client.getBalanceSheet({ ts_code: tsCode, period }),
    client.getCashFlow({ ts_code: tsCode, period })
  ]);

  if (incomeData.length === 0 || balanceData.length === 0) {
    console.log('未找到数据');
    return;
  }

  const income = incomeData[0];
  const balance = balanceData[0];
  const cashflow = cashflowData[0];

  // 盈利能力指标
  const netProfitMargin = ((income.n_income_attr_p! / income.total_revenue!) * 100).toFixed(2);
  const roe = ((income.n_income_attr_p! / balance.undistr_porfit!) * 100).toFixed(2);

  // 偿债能力指标
  const currentRatio = (balance.total_cur_assets! / balance.total_cur_liab!).toFixed(2);
  const quickRatio = ((balance.total_cur_assets! - balance.inventories!) / balance.total_cur_liab!).toFixed(2);
  const totalLiab = balance.total_cur_liab! + balance.total_ncl!;
  const debtRatio = ((totalLiab / balance.total_assets!) * 100).toFixed(2);

  // 现金流指标
  const operCashFlow = cashflow.n_cashflow_act || 0;
  const freeCashFlow = cashflow.free_cashflow || 0;

  console.log(`\n${tsCode} - ${period} 财务健康分析`);
  console.log('='.repeat(50));
  console.log('\n盈利能力:');
  console.log(`  净利率: ${netProfitMargin}%`);
  console.log(`  ROE: ${roe}%`);
  console.log('\n偿债能力:');
  console.log(`  流动比率: ${currentRatio}`);
  console.log(`  速动比率: ${quickRatio}`);
  console.log(`  资产负债率: ${debtRatio}%`);
  console.log('\n现金流:');
  console.log(`  经营现金流: ${operCashFlow.toLocaleString()}元`);
  console.log(`  自由现金流: ${freeCashFlow.toLocaleString()}元`);
}

// 使用示例
await analyzeFinancialHealth('600519.SH', '20231231');
```

---

### 场景3: 筛选优质股票

```typescript
import type { IncomeStatementItem } from '@hestudy/tushare-sdk';

async function findQualityStocks(stockCodes: string[], period: string) {
  const results: Array<{
    code: string;
    revenue: number;
    profit: number;
    eps: number;
    roe: number;
  }> = [];

  for (const code of stockCodes) {
    try {
      const [incomeData, balanceData] = await Promise.all([
        client.getIncomeStatement({ ts_code: code, period }),
        client.getBalanceSheet({ ts_code: code, period })
      ]);

      if (incomeData.length > 0 && balanceData.length > 0) {
        const income = incomeData[0];
        const balance = balanceData[0];
        const roe = (income.n_income_attr_p! / balance.undistr_porfit!) * 100;

        results.push({
          code,
          revenue: income.total_revenue || 0,
          profit: income.n_income_attr_p || 0,
          eps: income.basic_eps || 0,
          roe
        });
      }
    } catch (error) {
      console.error(`查询 ${code} 失败:`, error);
    }
  }

  // 筛选条件: ROE > 15%, EPS > 1元
  const qualityStocks = results.filter(s => s.roe > 15 && s.eps > 1);

  console.log('\n符合条件的优质股票:');
  qualityStocks
    .sort((a, b) => b.roe - a.roe)  // 按ROE降序
    .forEach(stock => {
      console.log(`${stock.code}: ROE ${stock.roe.toFixed(2)}%, EPS ${stock.eps.toFixed(2)}元`);
    });

  return qualityStocks;
}

// 使用示例
const candidates = ['000001.SZ', '600519.SH', '000858.SZ', '600036.SH'];
await findQualityStocks(candidates, '20231231');
```

---

## 高级功能

### 1. 查询指定报告类型

```typescript
// 只查询年报数据 (report_type 未在基础接口中直接支持,使用comp_type)
const annualReports = await client.getIncomeStatement({
  ts_code: '000001.SZ',
  start_date: '20200101',
  end_date: '20231231',
  comp_type: '1'  // 1-合并报表
});

console.log(`查询到 ${annualReports.length} 个报告期`);
```

### 2. 使用环境变量配置Token

```typescript
// .env 文件
// TUSHARE_TOKEN=your_actual_token_here

import dotenv from 'dotenv';
dotenv.config();

const client = new TushareClient({
  token: process.env.TUSHARE_TOKEN!,
  cache: { enabled: true, ttl: 86400000 },  // 缓存24小时
  retry: { maxRetries: 3 }
});
```

### 3. 配置缓存和重试

```typescript
const client = new TushareClient({
  token: process.env.TUSHARE_TOKEN!,

  // 缓存配置
  cache: {
    enabled: true,
    ttl: 3600000  // 1小时 (财务数据更新不频繁,可以设置更长)
  },

  // 重试配置
  retry: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffFactor: 2
  },

  // 并发控制
  concurrency: {
    maxConcurrent: 5,
    minInterval: 200
  }
});
```

---

## 错误处理

### 常见错误及解决方案

#### 1. 权限不足错误

```typescript
import { ApiError } from '@hestudy/tushare-sdk';

try {
  const data = await client.getIncomeStatement({ ts_code: '000001.SZ' });
} catch (error) {
  if (error instanceof ApiError && error.code === 40003) {
    console.error('积分不足!财务数据接口需要至少2000积分');
    console.error('获取积分: https://tushare.pro/document/1?doc_id=13');
  } else {
    throw error;
  }
}
```

#### 2. 无数据返回

```typescript
const data = await client.getIncomeStatement({
  ts_code: '000001.SZ',
  period: '20501231'  // 未来日期
});

if (data.length === 0) {
  console.log('未找到数据,可能原因:');
  console.log('- 报告期尚未公布');
  console.log('- 股票代码不存在');
  console.log('- 参数格式不正确');
}
```

#### 3. 网络错误处理

```typescript
try {
  const data = await client.getIncomeStatement({ ts_code: '000001.SZ' });
} catch (error) {
  if (error instanceof ApiError && error.code === 50001) {
    console.error('网络错误,SDK会自动重试3次');
    console.error('如果仍然失败,请检查网络连接');
  }
}
```

---

## 最佳实践

### 1. 批量查询优化

```typescript
// ❌ 不推荐:串行查询
for (const code of stockCodes) {
  const data = await client.getIncomeStatement({ ts_code: code });
  // ...
}

// ✅ 推荐:并行查询
const promises = stockCodes.map(code =>
  client.getIncomeStatement({ ts_code: code })
);
const results = await Promise.all(promises);
```

**注意**: SDK内置并发控制(默认5个并发),会自动管理请求队列,避免触发API限流。

### 2. 数据缓存策略

```typescript
// 财务数据更新不频繁,推荐较长的缓存时间
const client = new TushareClient({
  token: process.env.TUSHARE_TOKEN!,
  cache: {
    enabled: true,
    ttl: 86400000  // 24小时,因为财报数据一天内不会变化
  }
});
```

### 3. 类型安全使用

```typescript
import type { IncomeStatementItem, FinancialQueryParams } from '@hestudy/tushare-sdk';

function calculateProfitMargin(data: IncomeStatementItem): number {
  // TypeScript会提供完整的类型提示
  if (!data.total_revenue || !data.n_income_attr_p) {
    return 0;
  }
  return (data.n_income_attr_p / data.total_revenue) * 100;
}

const params: FinancialQueryParams = {
  ts_code: '000001.SZ',
  period: '20231231'
};
```

---

## 下一步

- 📖 查看完整的API文档: [API Reference](./contracts/financial-api-contract.md)
- 🏗️ 查看数据模型文档: [Data Model](./data-model.md)
- 🔬 查看研究文档: [Research](./research.md)
- 💻 查看完整示例代码: `apps/node-demo/examples/financial-data.ts`
- 📝 查看实施任务: [Tasks](./tasks.md) (待生成)

---

## 常见问题(FAQ)

### Q1: 如何获取2000积分?

**A**: 访问 [Tushare积分获取指南](https://tushare.pro/document/1?doc_id=13),通过以下方式获取积分:
- 新用户注册赠送 120 积分
- 每日签到获取积分
- 分享平台获取积分
- 充值购买积分

### Q2: 为什么查询返回空数组?

**A**: 可能的原因:
1. 股票代码不存在或格式错误(正确格式: `000001.SZ`)
2. 报告期尚未公布(例如查询未来日期)
3. 该公司在指定报告期未披露财报
4. 参数组合不正确

### Q3: 利润表、资产负债表、现金流量表有什么区别?

**A**:
- **利润表**: 反映企业盈利能力,包含营收、成本、利润等
- **资产负债表**: 反映企业财务状况,包含资产、负债、权益等
- **现金流量表**: 反映企业现金流动,包含经营、投资、筹资活动现金流

完整的财务分析需要结合三大报表综合判断。

### Q4: 如何理解report_type和comp_type?

**A**:
- `report_type`: 报表类型
  - "1": 合并报表(母公司+子公司)
  - "2": 单季度合并(仅当季数据)
  - "3": 调整后的单季合并
  - "4": 调整后的合并报表
- `comp_type`: 公司类型
  - "1": 合并报表
  - "2": 单季度报表

一般用户推荐使用默认值,无需指定这两个参数。

### Q5: 数据多久更新一次?

**A**:
- 财务数据通常在公司公告日后1-2个工作日内更新
- 年报: 每年4月30日前公布
- 中报: 每年8月31日前公布
- 季报: 季度结束后1个月内公布

---

## 总结

通过本快速入门指南,您已经学会了:

✅ 创建TushareClient实例
✅ 查询利润表、资产负债表、现金流量表
✅ 计算常用财务比率
✅ 处理常见错误
✅ 应用最佳实践

现在您可以开始构建自己的财务分析应用了!

---

**需要帮助?**
- GitHub Issues: https://github.com/your-org/tushare-sdk/issues
- Tushare官方文档: https://tushare.pro/document/2?doc_id=16
