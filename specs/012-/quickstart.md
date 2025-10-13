# Quick Start Guide: 财务数据文档

**Feature Branch**: `012-` | **Date**: 2025-10-13 | **Spec**: [spec.md](./spec.md)

## 概述

本快速开始指南帮助开发者快速上手财务数据文档,包括如何找到文档、理解文档结构、执行示例代码以及处理常见错误。

## 目标读者

- SDK 使用者(开发者)
- 文档站访客
- 新手用户(第一次使用财务数据 API)

## 第一步: 找到财务数据文档

### 从文档首页导航

1. **访问文档站首页**
   - 开发环境: `http://localhost:3000`
   - 生产环境: (根据实际部署地址)

2. **定位 API 文档章节**
   - 在顶部导航栏或侧边栏找到 "API 文档" 入口
   - 点击展开 API 文档章节

3. **找到财务数据章节**
   - 在 API 文档下找到 "财务数据" 子章节
   - 点击展开,查看三大财务报表文档:
     - 利润表
     - 资产负债表
     - 现金流量表

### 直接访问文档链接

如果知道文档路径,可以直接访问:

- 利润表: `/api/finance/income`
- 资产负债表: `/api/finance/balance`
- 现金流量表: `/api/finance/cashflow`

### 使用搜索功能

如果文档站支持搜索:
1. 点击搜索图标或按 `Ctrl+K` / `Cmd+K`
2. 输入关键词,如 "现金流量表"、"利润表"、"财务数据"
3. 从搜索结果中选择目标文档

---

## 第二步: 理解文档结构

每个财务报表文档都遵循统一的结构,方便快速定位所需信息。

### 文档章节说明

#### 1. 标题和简介
- **位置**: 文档顶部
- **内容**: API 名称和简短说明
- **作用**: 快速了解这个 API 是做什么的

#### 2. 函数签名
- **位置**: 紧接简介之后
- **内容**: TypeScript 函数定义
- **作用**: 了解函数名称、参数类型、返回值类型
- **示例**:
  ```typescript
  async function getCashFlow(params: FinancialQueryParams): Promise<CashFlowItem[]>
  ```

#### 3. 参数说明
- **位置**: 函数签名之后
- **内容**: 参数表格,包含参数名、类型、必填、描述、示例
- **作用**: 了解如何传递参数
- **重点关注**:
  - 哪些参数是必填的
  - 日期格式要求(YYYYMMDD)
  - 股票代码格式(如 `000001.SZ`)

#### 4. 返回值说明
- **位置**: 参数说明之后
- **内容**: 返回数据结构和字段列表
- **作用**: 了解返回数据包含哪些字段及其含义
- **阅读技巧**:
  - 先看字段分类(如经营活动、投资活动、筹资活动)
  - 关注标注为"核心"的字段
  - 注意金额单位(元)

#### 5. 代码示例
- **位置**: 返回值说明之后
- **内容**: 2-5 个实际使用场景的完整代码示例
- **作用**: 快速复制粘贴,开始使用 API
- **示例类型**:
  - 基础查询: 查询单个公司最新数据
  - 区间查询: 查询多个报告期数据
  - 指标计算: 基于原始数据计算财务比率
  - 业务场景: 实际业务逻辑实现

#### 6. 异常说明
- **位置**: 代码示例之后
- **内容**: 常见错误类型和触发条件
- **作用**: 提前了解可能遇到的问题

#### 7. 注意事项
- **位置**: 异常说明之后
- **内容**: 重要提示和最佳实践
- **作用**: 避免常见陷阱
- **重点关注**:
  - 权限要求(如需要 2000 积分)
  - 数据时效性(公告后 T+1 日更新)
  - 日期和金额单位

#### 8. 相关 API(可选)
- **位置**: 文档底部
- **内容**: 指向其他相关文档的链接
- **作用**: 发现更多相关功能

---

## 第三步: 执行示例代码

### 前提条件

1. **已安装 SDK**
   ```bash
   npm install @hestudy/tushare-sdk
   ```

2. **已获取 Tushare API Token**
   - 访问 [Tushare 官网](https://tushare.pro) 注册并获取 token
   - 确保账户积分满足权限要求(财务数据需要至少 2000 积分)

3. **配置环境变量**
   创建 `.env` 文件:
   ```bash
   TUSHARE_TOKEN=your_token_here
   ```

### 执行步骤

#### 1. 创建测试文件

创建 `test-financial.ts`:
```typescript
import { TushareClient } from '@hestudy/tushare-sdk';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

async function main() {
  // 初始化客户端
  const client = new TushareClient({
    token: process.env.TUSHARE_TOKEN || ''
  });

  // 这里粘贴文档中的示例代码
  const cashflowData = await client.getCashFlow({
    ts_code: '000001.SZ',
    period: '20231231'
  });

  console.log('查询结果:', cashflowData);
}

main().catch(console.error);
```

#### 2. 复制示例代码

从文档的 "代码示例" 章节:
1. 选择适合你场景的示例
2. 点击代码块右上角的复制按钮(如果有)
3. 粘贴到测试文件的 `main()` 函数中

**注意**: 如果示例代码使用了独立函数导入(如 `import { getCashFlow } from '@tushare/sdk'`),需要改为使用客户端方法调用(如 `client.getCashFlow()`)。

#### 3. 执行代码

```bash
npx tsx test-financial.ts
```

或者如果使用 TypeScript 编译:
```bash
npx tsc test-financial.ts
node test-financial.js
```

#### 4. 查看结果

成功执行后,你应该看到类似输出:
```
查询结果: [
  {
    ts_code: '000001.SZ',
    ann_date: '20240430',
    end_date: '20231231',
    n_cashflow_act: 123456789.0,
    n_cashflow_inv_act: -234567890.0,
    n_cash_flows_fnc_act: 345678901.0,
    ...
  }
]
```

---

## 第四步: 常见错误处理

### 错误 1: Token 未配置

**错误信息**:
```
Error: Token is required
```

**原因**: 未设置 Tushare API Token

**解决方法**:
1. 检查 `.env` 文件是否存在且包含 `TUSHARE_TOKEN=xxx`
2. 确认代码中正确加载了环境变量(`dotenv.config()`)
3. 确认环境变量名称拼写正确

### 错误 2: 权限不足

**错误信息**:
```
Error: Permission denied (code: 40203)
```

**原因**: 账户积分不足,无法访问财务数据接口

**解决方法**:
1. 登录 Tushare 账户,查看当前积分
2. 财务数据接口需要至少 **2000 积分**
3. 如果积分不足,需要升级账户或完成积分任务

### 错误 3: 股票代码格式错误

**错误信息**:
```
Error: Invalid ts_code format
```

**原因**: 股票代码格式不正确

**解决方法**:
1. 股票代码必须包含交易所后缀:
   - 深圳交易所: `.SZ` (如 `000001.SZ`)
   - 上海交易所: `.SH` (如 `600519.SH`)
   - 北京交易所: `.BJ` (如 `430047.BJ`)
2. 确保代码长度为 6 位数字 + 3 位交易所代码

### 错误 4: 日期格式错误

**错误信息**:
```
Error: Invalid date format
```

**原因**: 日期参数格式不正确

**解决方法**:
1. 所有日期参数必须使用 **YYYYMMDD** 格式
2. 正确示例: `'20231231'`
3. 错误示例: `'2023-12-31'`, `'2023/12/31'`, `20231231`(数字类型)

### 错误 5: 数据不存在

**错误信息**:
```
返回空数组: []
```

**原因**: 指定的股票代码或报告期不存在数据

**可能情况**:
1. 小公司可能缺少某些报告期的数据
2. 报告期还未到公告日期
3. 股票代码输入错误

**解决方法**:
1. 检查股票代码是否正确
2. 尝试使用更早的报告期(如使用 `20221231` 而不是 `20231231`)
3. 查询大盘股(如 `600519.SH` 贵州茅台)确认 API 是否正常

### 错误 6: 网络错误

**错误信息**:
```
Error: Network error / Timeout
```

**原因**: 网络连接问题或 API 服务不可用

**解决方法**:
1. 检查网络连接
2. 尝试访问 Tushare 官网确认服务状态
3. 稍后重试

### 错误 7: 返回数据字段为 undefined

**问题**: 某些字段值为 `undefined`

**原因**: 这是正常现象,不是所有字段都有值

**说明**:
1. 财务报表包含 80-90 个字段
2. 某些字段可能因为:
   - 不适用于该公司(如银行专用字段)
   - 该报告期没有发生(如某项支出为 0)
   - 数据缺失
3. 使用前应检查字段是否存在:
   ```typescript
   if (data.n_cashflow_act !== undefined) {
     console.log(`经营现金流: ${data.n_cashflow_act}`);
   }
   ```

---

## 进阶技巧

### 1. 查询多个报告期

```typescript
// 查询多个季度的数据
const periods = ['20231231', '20230930', '20230630', '20230331'];
const promises = periods.map(period =>
  client.getCashFlow({ ts_code: '600519.SH', period })
);
const results = await Promise.all(promises);
```

### 2. 计算财务指标

```typescript
// 计算自由现金流(FCF = 经营现金流 - 资本支出)
const cashflow = data[0];
const fcf = cashflow.n_cashflow_act - cashflow.c_pay_acq_const_fiolta;
console.log(`自由现金流: ${fcf / 100000000} 亿元`);
```

### 3. 使用 TypeScript 类型提示

```typescript
import type { CashFlowItem } from '@hestudy/tushare-sdk';

const data: CashFlowItem[] = await client.getCashFlow({
  ts_code: '000001.SZ',
  period: '20231231'
});

// 享受完整的 TypeScript 类型提示
data.forEach((item: CashFlowItem) => {
  console.log(item.n_cashflow_act); // 自动补全和类型检查
});
```

### 4. 错误处理最佳实践

```typescript
try {
  const data = await client.getCashFlow({
    ts_code: '000001.SZ',
    period: '20231231'
  });

  if (data.length === 0) {
    console.warn('未查询到数据');
    return;
  }

  // 处理数据...
} catch (error) {
  if (error.code === 40203) {
    console.error('权限不足,请升级账户');
  } else if (error.code === 40001) {
    console.error('参数错误:', error.message);
  } else {
    console.error('未知错误:', error);
  }
}
```

---

## 常见问题(FAQ)

### Q1: 如何知道某个字段的业务含义?

**A**: 在文档的 "返回值" 章节查看完整的字段列表和说明。每个字段都包含业务含义的中文描述。

### Q2: 为什么我的查询返回空数组?

**A**: 可能原因:
1. 股票代码或报告期不存在
2. 数据尚未更新(财务数据在公告后 T+1 日更新)
3. 权限不足(检查账户积分)

### Q3: 如何查询最新的报告期?

**A**: 财务报表通常按季度发布,报告期为:
- Q1: `YYYY0331`
- Q2(中报): `YYYY0630`
- Q3: `YYYY0930`
- Q4(年报): `YYYY1231`

最新报告期取决于当前日期和公司公告进度。

### Q4: 金额单位是什么?

**A**: 所有金额字段单位为 **元**。如需转换为亿元,除以 `100000000`:
```typescript
const revenueInBillion = data.total_revenue / 100000000;
```

### Q5: 如何同时查询三大报表?

**A**: 使用 Promise.all 并行查询:
```typescript
const [income, balance, cashflow] = await Promise.all([
  client.getIncomeStatement({ ts_code: '000001.SZ', period: '20231231' }),
  client.getBalanceSheet({ ts_code: '000001.SZ', period: '20231231' }),
  client.getCashFlow({ ts_code: '000001.SZ', period: '20231231' })
]);
```

---

## 相关资源

### 文档
- [利润表文档](/api/finance/income)
- [资产负债表文档](/api/finance/balance)
- [现金流量表文档](/api/finance/cashflow)

### SDK 资源
- [SDK GitHub 仓库](https://github.com/your-org/tushare-sdk)
- [SDK API 参考](https://github.com/your-org/tushare-sdk/tree/main/docs)

### Tushare 官方资源
- [Tushare 官网](https://tushare.pro)
- [Tushare 官方文档](https://tushare.pro/document/2)
- [Tushare 积分说明](https://tushare.pro/document/1?doc_id=13)

### 示例项目
- [Node Demo 应用](https://github.com/your-org/tushare-sdk/tree/main/apps/node-demo)
- 查看 `apps/node-demo/src/examples/financial-data.ts` 了解完整的财务分析示例

---

## 下一步

1. **浏览示例代码**: 在文档的 "代码示例" 章节,尝试不同的使用场景
2. **查看演示应用**: 参考 `apps/node-demo` 中的完整财务分析实现
3. **阅读相关文档**: 了解利润表和资产负债表的使用方法
4. **实践业务场景**: 结合实际需求,实现财务指标计算和趋势分析

---

**快速开始指南版本**: v1.0
**最后更新**: 2025-10-13
**反馈**: 如有问题或建议,请提交 Issue 到项目仓库
