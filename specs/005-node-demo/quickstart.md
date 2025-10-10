# Quick Start: 每日指标演示示例

**Feature**: 005-node-demo  
**Date**: 2025-10-10  
**Audience**: 开发者

## 概述

本文档提供每日指标演示示例的快速开始指南,帮助开发者快速了解如何使用 Tushare SDK 的 `getDailyBasic` API 获取股票每日基本面指标数据。

---

## 前置要求

### 必需
- ✅ **Node.js**: 18.0.0 或更高版本
- ✅ **pnpm**: 8.0.0 或更高版本
- ✅ **Tushare API Token**: 从 [Tushare Pro](https://tushare.pro) 获取
- ✅ **积分要求**: 2000+ 积分(daily_basic 接口要求)

### 检查权限

每日指标接口需要 **2000+ 积分**。您可以在 [Tushare Pro 个人中心](https://tushare.pro/user/token) 查看您的积分。

如果积分不足,您可以:
- 通过签到、分享等方式获取积分
- 或使用其他示例(stock-list、daily-data、trade-calendar)

---

## 快速开始 (2 分钟)

### 步骤 1: 确保已安装依赖

```bash
# 在项目根目录
cd /path/to/tushare-sdk

# 安装依赖(如果还没有)
pnpm install
```

### 步骤 2: 配置 API Token

确保 `apps/node-demo/.env` 文件中已配置 Token:

```bash
# Tushare API Token (必需)
TUSHARE_TOKEN=your_actual_token_here
```

### 步骤 3: 运行每日指标示例

```bash
# 从项目根目录运行
pnpm --filter node-demo start --example=daily-basic
```

您应该看到类似以下的输出:

```
========================================
Tushare SDK 演示应用
版本: 1.0.0
SDK 版本: 1.0.0
时间: 2025-10-10 17:00:00
========================================

[1/1] 运行示例: 每日指标查询
✓ 成功 (耗时: 5234ms)

=== 场景 1: 按交易日期查询全市场数据 ===
查询参数: { trade_date: '20241008' }
返回数据: 4523 条
示例数据(前 3 条):
  - 000001.SZ | 2024-10-08 | PE: 5.23 | PB: 0.68 | 换手率: 0.45% | 总市值: 23456789 万元
  - 000002.SZ | 2024-10-08 | PE: 12.45 | PB: 1.23 | 换手率: 0.78% | 总市值: 12345678 万元
  - 000004.SZ | 2024-10-08 | PE: 8.90 | PB: 0.95 | 换手率: 0.32% | 总市值: 9876543 万元

=== 场景 2: 按股票代码查询历史数据 ===
查询参数: { ts_code: '000001.SZ', start_date: '20240901', end_date: '20241001' }
返回数据: 21 条
示例数据(前 3 条):
  - 000001.SZ | 2024-09-02 | PE: 5.20 | PB: 0.67 | 换手率: 0.42%
  - 000001.SZ | 2024-09-03 | PE: 5.21 | PB: 0.68 | 换手率: 0.45%
  - 000001.SZ | 2024-09-04 | PE: 5.22 | PB: 0.68 | 换手率: 0.43%

=== 场景 3: 自定义返回字段 ===
查询参数: { trade_date: '20241008', fields: 'ts_code,trade_date,pe,pb,turnover_rate,total_mv' }
返回字段: ts_code, trade_date, pe, pb, turnover_rate, total_mv
返回数据: 4523 条
示例数据(前 3 条):
  - 000001.SZ | 2024-10-08 | PE: 5.23 | PB: 0.68 | 换手率: 0.45% | 总市值: 23456789 万元

========================================
执行摘要
========================================
总计: 1 个示例
成功: 1 个
失败: 0 个
总耗时: 5234ms
========================================
```

🎉 **恭喜!** 您已成功运行每日指标演示示例!

---

## 演示场景说明

### 场景 1: 按交易日期查询全市场数据

**使用场景**: 获取指定交易日所有股票的基本面指标,用于市场整体分析或股票筛选。

**查询参数**:
```typescript
{
  trade_date: '20241008'  // 交易日期,格式 YYYYMMDD
}
```

**返回数据**: 约 4000-5000 条(全市场股票数量)

**关键字段**:
- `ts_code`: 股票代码
- `trade_date`: 交易日期
- `pe`: 市盈率(动态)
- `pb`: 市净率
- `turnover_rate`: 换手率(%)
- `total_mv`: 总市值(万元)

**适用于**:
- 市场整体估值分析
- 低估值股票筛选
- 高换手率股票发现

---

### 场景 2: 按股票代码查询历史数据

**使用场景**: 获取单只股票一段时间的指标变化,用于个股分析或趋势跟踪。

**查询参数**:
```typescript
{
  ts_code: '000001.SZ',      // 股票代码
  start_date: '20240901',    // 开始日期
  end_date: '20241001'       // 结束日期
}
```

**返回数据**: 约 20 条(一个月的交易日)

**适用于**:
- 个股估值变化分析
- PE/PB 历史走势
- 换手率变化趋势

---

### 场景 3: 自定义返回字段

**使用场景**: 只获取需要的字段,减少数据传输量,提升性能。

**查询参数**:
```typescript
{
  trade_date: '20241008',
  fields: 'ts_code,trade_date,pe,pb,turnover_rate,total_mv'  // 指定字段
}
```

**返回数据**: 约 4000-5000 条,但每条数据更小

**适用于**:
- 性能优化场景
- 只关注特定指标
- 减少网络带宽消耗

---

## 进阶使用

### 启用详细输出

查看详细的 API 请求和响应信息:

```bash
pnpm --filter node-demo start --example=daily-basic --verbose
```

输出将包含:
```
[API 请求] getDailyBasic
参数: { trade_date: '20241008' }

[API 响应] getDailyBasic
状态: 成功
数据条数: 4523
耗时: 1234ms
```

### 输出 JSON 格式

输出结构化 JSON 数据:

```bash
pnpm --filter node-demo start --example=daily-basic --format=json
```

保存到文件:

```bash
pnpm --filter node-demo start --example=daily-basic --format=json > daily-basic-output.json
```

### 与其他示例一起运行

运行所有示例(包括每日指标):

```bash
pnpm --filter node-demo start --example=all
```

---

## 代码示例

如果您想在自己的项目中使用 `getDailyBasic` API,可以参考以下代码:

### 基本用法

```typescript
import { TushareClient } from '@hestudy/tushare-sdk';

// 创建客户端
const client = new TushareClient({
  token: 'your_token_here',
});

// 查询指定日期的全市场数据
const result = await client.getDailyBasic({
  trade_date: '20241008',
});

console.log(`返回 ${result.length} 条数据`);
console.log('示例数据:', result.slice(0, 3));
```

### 按股票代码查询

```typescript
// 查询平安银行最近一个月的每日指标
const result = await client.getDailyBasic({
  ts_code: '000001.SZ',
  start_date: '20240901',
  end_date: '20241001',
});

// 分析 PE 变化
const peValues = result.map(item => item.pe).filter(pe => pe !== null);
const avgPe = peValues.reduce((sum, pe) => sum + pe, 0) / peValues.length;
console.log(`平均市盈率: ${avgPe.toFixed(2)}`);
```

### 自定义返回字段

```typescript
// 只获取需要的字段
const result = await client.getDailyBasic({
  trade_date: '20241008',
  fields: 'ts_code,trade_date,pe,pb,turnover_rate,total_mv',
});

// 筛选低估值股票
const lowPeStocks = result.filter(item => 
  item.pe !== null && item.pe > 0 && item.pe < 15
);

console.log(`低估值股票(PE < 15): ${lowPeStocks.length} 只`);
```

### 错误处理

```typescript
import { TushareClient, ApiError, ApiErrorType } from '@hestudy/tushare-sdk';

try {
  const result = await client.getDailyBasic({
    trade_date: '20241008',
  });
  
  if (result.length === 0) {
    console.log('提示: 该日期无交易数据(可能是周末或节假日)');
  }
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.type) {
      case ApiErrorType.AUTH_ERROR:
        console.error('认证失败,请检查 API Token');
        break;
      case ApiErrorType.PERMISSION_DENIED:
        console.error('权限不足,daily_basic 接口需要 2000+ 积分');
        break;
      case ApiErrorType.PARAM_ERROR:
        console.error('参数错误:', error.message);
        break;
      case ApiErrorType.NETWORK_ERROR:
        console.error('网络错误,请检查网络连接');
        break;
      default:
        console.error('未知错误:', error.message);
    }
  }
}
```

---

## 常见问题

### Q1: 为什么返回的数据为空?

**A**: 可能的原因:
1. 查询的日期是周末或节假日,没有交易数据
2. 日期格式错误,应使用 YYYYMMDD 格式(如 '20241008')
3. 股票代码不存在或格式错误

**解决方法**:
- 使用交易日查询(可通过 `getTradeCalendar` 获取交易日列表)
- 检查日期和股票代码格式

### Q2: 为什么提示权限不足?

**A**: `daily_basic` 接口需要 **2000+ 积分**。

**解决方法**:
- 在 [Tushare Pro 个人中心](https://tushare.pro/user/token) 查看您的积分
- 通过签到、分享等方式获取积分
- 或使用其他不需要高积分的接口

### Q3: 查询全市场数据很慢怎么办?

**A**: 全市场数据约 4000-5000 条,查询时间可能需要 5-10 秒。

**优化方法**:
1. 使用 `fields` 参数只获取需要的字段
2. 如果只需要部分股票,使用 `ts_code` 参数指定股票代码
3. 考虑缓存数据,避免频繁查询

### Q4: 如何理解各个指标?

**A**: 关键指标说明:
- **PE (市盈率)**: 股价 / 每股收益,衡量估值水平,一般 10-20 为合理区间
- **PB (市净率)**: 股价 / 每股净资产,< 1 表示股价低于净资产
- **换手率**: 成交量 / 流通股本,反映股票活跃度
- **总市值**: 股价 × 总股本,反映公司规模

更多指标说明请参考 [Tushare 文档](https://tushare.pro/document/2?doc_id=32)

### Q5: 可以获取实时数据吗?

**A**: `daily_basic` 接口提供的是每日收盘后的数据,不是实时数据。

如需实时数据,请使用其他接口:
- 实时行情: 需要更高权限
- 分钟级数据: 需要更高权限

---

## 下一步

### 探索其他示例

```bash
# 股票列表查询
pnpm --filter node-demo start --example=stock-list

# 日线数据查询
pnpm --filter node-demo start --example=daily-data

# 交易日历查询
pnpm --filter node-demo start --example=trade-calendar
```

### 查看完整文档

- [Tushare SDK 文档](../../README.md)
- [API 参考文档](../../docs/api.md)
- [每日指标接口文档](https://tushare.pro/document/2?doc_id=32)

### 在您的项目中使用

```bash
# 安装 SDK
npm install @hestudy/tushare-sdk

# 或使用 pnpm
pnpm add @hestudy/tushare-sdk
```

---

## 反馈与支持

如果您在使用过程中遇到问题或有建议,欢迎:
- 提交 [GitHub Issue](https://github.com/hestudy/tushare-sdk/issues)
- 查看 [常见问题文档](../../docs/faq.md)
- 参考 [Tushare 官方文档](https://tushare.pro/document/2)

**状态**: 快速开始指南完成
