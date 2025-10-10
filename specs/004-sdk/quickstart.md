# Quick Start: SDK每日指标快捷方法

**Feature**: 004-sdk  
**Date**: 2025-10-10

## 概述

本指南帮助你快速上手使用 Tushare SDK 的每日指标功能,5分钟内完成从安装到第一次查询。

## 前置要求

1. **Node.js**: 18+ LTS
2. **Tushare Token**: 需要在 [Tushare Pro](https://tushare.pro) 注册并获取 token
3. **积分要求**: 至少 2000 积分(查看[积分获取办法](https://tushare.pro/document/1?doc_id=13))

## 安装

```bash
# 使用 npm
npm install tushare-sdk

# 使用 pnpm
pnpm add tushare-sdk

# 使用 yarn
yarn add tushare-sdk
```

## 基础使用

### 1. 初始化客户端

```typescript
import { TushareClient } from 'tushare-sdk';

// 创建客户端实例
const client = new TushareClient({
  token: 'your_tushare_token_here'
});
```

**安全提示**: 不要在代码中硬编码 token,建议使用环境变量:

```typescript
// 推荐方式:使用环境变量
const client = new TushareClient({
  token: process.env.TUSHARE_TOKEN!
});
```

### 2. 查询每日指标

```typescript
import { getDailyBasic } from 'tushare-sdk';

// 获取指定日期所有股票的每日指标
const data = await getDailyBasic(client, {
  trade_date: '20180726'
});

console.log(`获取到 ${data.length} 条数据`);
console.log('第一条数据:', data[0]);
```

**输出示例**:
```
获取到 3856 条数据
第一条数据: {
  ts_code: '600230.SH',
  trade_date: '20180726',
  turnover_rate: 2.4584,
  volume_ratio: 0.72,
  pe: 8.6928,
  pb: 3.7203,
  total_mv: 123456.78,
  circ_mv: 98765.43
}
```

## 常见使用场景

### 场景 1: 按日期查询全市场数据

**用途**: 获取某个交易日所有股票的指标,用于选股分析

```typescript
import { TushareClient, getDailyBasic } from 'tushare-sdk';

const client = new TushareClient({ token: process.env.TUSHARE_TOKEN! });

async function getMarketDataByDate(date: string) {
  const data = await getDailyBasic(client, {
    trade_date: date
  });
  
  // 筛选低估值股票 (PE < 15, PB < 2)
  const undervaluedStocks = data.filter(item => 
    item.pe && item.pe < 15 && 
    item.pb && item.pb < 2
  );
  
  console.log(`找到 ${undervaluedStocks.length} 只低估值股票`);
  return undervaluedStocks;
}

// 使用
const result = await getMarketDataByDate('20180726');
```

### 场景 2: 按股票查询历史数据

**用途**: 分析单只股票的历史指标变化趋势

```typescript
async function getStockHistory(tsCode: string, startDate: string, endDate: string) {
  const data = await getDailyBasic(client, {
    ts_code: tsCode,
    start_date: startDate,
    end_date: endDate
  });
  
  // 计算平均市盈率
  const validPE = data.filter(item => item.pe).map(item => item.pe!);
  const avgPE = validPE.reduce((sum, pe) => sum + pe, 0) / validPE.length;
  
  console.log(`${tsCode} 在 ${startDate} 到 ${endDate} 期间:`);
  console.log(`- 交易日数: ${data.length}`);
  console.log(`- 平均市盈率: ${avgPE.toFixed(2)}`);
  
  return data;
}

// 使用
const history = await getStockHistory('600230.SH', '20180101', '20181231');
```

### 场景 3: 自定义返回字段

**用途**: 只获取需要的字段,减少数据传输量,提高性能

```typescript
async function getCustomFields(date: string) {
  const data = await getDailyBasic(client, {
    trade_date: date,
    fields: 'ts_code,trade_date,pe,pb,total_mv'
  });
  
  // 返回的数据只包含指定字段
  console.log('自定义字段数据:', data[0]);
  // { ts_code: '600230.SH', trade_date: '20180726', pe: 8.69, pb: 3.72, total_mv: 123456 }
  
  return data;
}

// 使用
const customData = await getCustomFields('20180726');
```

### 场景 4: 查询特定股票特定日期

**用途**: 获取单只股票在某个交易日的指标

```typescript
async function getStockDailyData(tsCode: string, date: string) {
  const data = await getDailyBasic(client, {
    ts_code: tsCode,
    trade_date: date
  });
  
  if (data.length === 0) {
    console.log(`${tsCode} 在 ${date} 无数据(可能是非交易日)`);
    return null;
  }
  
  return data[0];
}

// 使用
const stockData = await getStockDailyData('600230.SH', '20180726');
console.log(stockData);
```

## 完整示例

### 示例: 构建股票筛选器

```typescript
import { TushareClient, getDailyBasic, type DailyBasicItem } from 'tushare-sdk';

// 初始化客户端
const client = new TushareClient({
  token: process.env.TUSHARE_TOKEN!
});

// 定义筛选条件
interface FilterCriteria {
  maxPE?: number;      // 最大市盈率
  maxPB?: number;      // 最大市净率
  minDvRatio?: number; // 最小股息率
  minTotalMv?: number; // 最小总市值(万元)
}

// 股票筛选函数
async function filterStocks(
  date: string,
  criteria: FilterCriteria
): Promise<DailyBasicItem[]> {
  console.log(`正在查询 ${date} 的数据...`);
  
  // 获取全市场数据
  const allData = await getDailyBasic(client, {
    trade_date: date
  });
  
  console.log(`获取到 ${allData.length} 条数据,开始筛选...`);
  
  // 应用筛选条件
  const filtered = allData.filter(item => {
    // 市盈率筛选
    if (criteria.maxPE && (!item.pe || item.pe > criteria.maxPE)) {
      return false;
    }
    
    // 市净率筛选
    if (criteria.maxPB && (!item.pb || item.pb > criteria.maxPB)) {
      return false;
    }
    
    // 股息率筛选
    if (criteria.minDvRatio && (!item.dv_ratio || item.dv_ratio < criteria.minDvRatio)) {
      return false;
    }
    
    // 市值筛选
    if (criteria.minTotalMv && (!item.total_mv || item.total_mv < criteria.minTotalMv)) {
      return false;
    }
    
    return true;
  });
  
  console.log(`筛选出 ${filtered.length} 只股票`);
  return filtered;
}

// 使用筛选器
async function main() {
  try {
    const result = await filterStocks('20180726', {
      maxPE: 15,        // 市盈率 < 15
      maxPB: 2,         // 市净率 < 2
      minDvRatio: 2,    // 股息率 > 2%
      minTotalMv: 100000 // 总市值 > 10亿
    });
    
    // 显示结果
    console.log('\n筛选结果:');
    result.slice(0, 10).forEach((item, index) => {
      console.log(`${index + 1}. ${item.ts_code}`);
      console.log(`   PE: ${item.pe?.toFixed(2)}, PB: ${item.pb?.toFixed(2)}`);
      console.log(`   股息率: ${item.dv_ratio?.toFixed(2)}%, 市值: ${(item.total_mv! / 10000).toFixed(2)}亿`);
    });
  } catch (error) {
    console.error('查询失败:', error);
  }
}

// 运行
main();
```

**预期输出**:
```
正在查询 20180726 的数据...
获取到 3856 条数据,开始筛选...
筛选出 23 只股票

筛选结果:
1. 600230.SH
   PE: 8.69, PB: 3.72
   股息率: 2.30%, 市值: 12.35亿
2. 601818.SH
   PE: 6.31, PB: 0.72
   股息率: 4.50%, 市值: 156.78亿
...
```

## 错误处理

### 基本错误处理

```typescript
async function safeQuery(date: string) {
  try {
    const data = await getDailyBasic(client, {
      trade_date: date
    });
    return data;
  } catch (error) {
    if (error instanceof Error) {
      console.error('查询失败:', error.message);
    }
    return [];
  }
}
```

### 常见错误及解决方案

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 权限不足 | 积分 < 2000 | 获取更多积分 |
| 参数错误 | 日期格式错误 | 使用 YYYYMMDD 格式 |
| 网络超时 | 网络问题 | 重试或检查网络 |
| Token 无效 | Token 错误或过期 | 检查 token 是否正确 |

## 性能优化建议

### 1. 使用 fields 参数

```typescript
// ❌ 不推荐:获取所有字段
const data = await getDailyBasic(client, {
  trade_date: '20180726'
});

// ✅ 推荐:只获取需要的字段
const data = await getDailyBasic(client, {
  trade_date: '20180726',
  fields: 'ts_code,trade_date,pe,pb'
});
```

### 2. 避免重复查询

```typescript
// ❌ 不推荐:多次查询同一天数据
const data1 = await getDailyBasic(client, { trade_date: '20180726' });
const data2 = await getDailyBasic(client, { trade_date: '20180726' });

// ✅ 推荐:查询一次,复用数据
const data = await getDailyBasic(client, { trade_date: '20180726' });
const filtered1 = data.filter(/* 条件1 */);
const filtered2 = data.filter(/* 条件2 */);
```

### 3. 处理大量数据

```typescript
// 当需要查询多个日期时,使用循环并控制并发
async function queryMultipleDates(dates: string[]) {
  const results = [];
  
  for (const date of dates) {
    const data = await getDailyBasic(client, { trade_date: date });
    results.push({ date, data });
    
    // 避免请求过快,适当延迟
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}
```

## TypeScript 类型支持

SDK 提供完整的 TypeScript 类型定义:

```typescript
import type { 
  DailyBasicParams,  // 查询参数类型
  DailyBasicItem     // 返回数据类型
} from 'tushare-sdk';

// 类型安全的参数
const params: DailyBasicParams = {
  trade_date: '20180726',
  fields: 'ts_code,pe,pb'
};

// 类型安全的数据处理
function processDailyBasic(items: DailyBasicItem[]) {
  items.forEach(item => {
    // IDE 会提供完整的类型提示
    console.log(item.ts_code, item.pe, item.pb);
  });
}
```

## 下一步

- 📖 查看 [API 文档](./contracts/daily-basic-api.md) 了解完整的 API 规范
- 📊 查看 [数据模型](./data-model.md) 了解所有字段的详细说明
- 🧪 查看测试用例了解更多使用示例
- 🔗 访问 [Tushare 官方文档](https://tushare.pro/document/2?doc_id=32) 了解 API 详情

## 常见问题

### Q: 如何获取最新的交易日数据?

A: 数据在交易日 15:00-17:00 更新,建议在 17:00 后查询当日数据。

### Q: 为什么有些股票的 PE 为空?

A: 亏损股票的市盈率无法计算,因此为空。

### Q: 单次查询最多返回多少条数据?

A: 最多 6000 条。如果需要更多数据,需要分页查询。

### Q: 如何查询非交易日的数据?

A: 非交易日查询会返回空数组 `[]`,这是正常行为。

### Q: 可以查询未来日期的数据吗?

A: 不可以,只能查询历史数据。

## 获取帮助

- 📧 GitHub Issues: [提交问题](https://github.com/your-repo/tushare-sdk/issues)
- 💬 讨论区: [参与讨论](https://github.com/your-repo/tushare-sdk/discussions)
- 📚 官方文档: [Tushare Pro](https://tushare.pro)

---

**祝你使用愉快! 🎉**
