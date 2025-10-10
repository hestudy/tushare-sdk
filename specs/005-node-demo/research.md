# Research: Node Demo 每日指标演示

**Feature**: 005-node-demo  
**Date**: 2025-10-10  
**Status**: Complete

## Overview

本文档记录了为 node-demo 应用添加每日指标演示示例所进行的技术研究和决策。目标是在现有演示应用中新增一个示例,展示如何使用 SDK 的 `getDailyBasic` API 获取股票每日基本面指标数据,同时保持与现有示例(stock-list、daily-data、trade-calendar)的风格一致。

## Research Areas

### 1. 现有示例代码结构分析

**研究任务**: 分析现有示例的代码结构和风格,确保新示例保持一致

**决策**: 遵循现有示例的标准结构
- **文件位置**: `apps/node-demo/src/examples/daily-basic.ts`
- **函数签名**: 
  ```typescript
  export async function runDailyBasicExample(config: AppConfig): Promise<{
    count: number;
    sample: unknown[];
  }>
  ```
- **代码结构**:
  1. 文件头部 JSDoc 注释(中文)
  2. 导入 SDK 客户端和工具函数
  3. 导出异步函数,接收 `AppConfig` 参数
  4. 创建 SDK 客户端实例
  5. 定义查询参数
  6. 记录 API 请求日志(verbose 模式)
  7. 执行 API 调用并计时
  8. 记录 API 响应日志(verbose 模式)
  9. 返回结果统计(count + sample)

**参考示例**: `daily-data.ts` 和 `stock-list.ts`
- 两者结构完全一致,只是 API 方法和参数不同
- 都使用 `logApiRequest` 和 `logApiResponse` 记录日志
- 都返回 `{ count, sample }` 结构
- 都有清晰的中文注释

**理由**:
- 保持代码风格一致性,降低学习成本
- 复用现有工具函数(logger、formatter 等)
- 符合项目宪法的代码结构要求

---

### 2. getDailyBasic API 使用方式研究

**研究任务**: 研究 `getDailyBasic` API 的参数和返回值,确定演示场景

**决策**: 演示 3 种典型查询方式

1. **按交易日期查询全市场数据**:
   ```typescript
   const params1 = {
     trade_date: '20241008',  // 查询指定日期的全市场数据
   };
   const response1 = await client.getDailyBasic(params1);
   ```
   - **使用场景**: 获取某个交易日所有股票的基本面指标
   - **数据量**: 约 4000-5000 条(全市场股票数量)
   - **适用于**: 市场整体分析、筛选股票

2. **按股票代码查询历史数据**:
   ```typescript
   const params2 = {
     ts_code: '000001.SZ',    // 平安银行
     start_date: '20240901',
     end_date: '20241001',
   };
   const response2 = await client.getDailyBasic(params2);
   ```
   - **使用场景**: 获取单只股票一段时间的指标变化
   - **数据量**: 约 20 条(一个月的交易日)
   - **适用于**: 个股分析、趋势跟踪

3. **自定义返回字段**:
   ```typescript
   const params3 = {
     trade_date: '20241008',
     fields: 'ts_code,trade_date,pe,pb,turnover_rate,total_mv',
   };
   const response3 = await client.getDailyBasic(params3);
   ```
   - **使用场景**: 只获取需要的字段,减少数据传输
   - **数据量**: 与场景 1 相同,但每条数据更小
   - **适用于**: 性能优化、特定指标分析

**理由**:
- 覆盖最常见的使用场景
- 展示 API 的灵活性和参数组合
- 帮助开发者理解不同参数的作用

**替代方案考虑**:
- ❌ 只演示一种查询方式: 无法展示 API 的灵活性
- ❌ 演示过多场景 (>3个): 代码冗长,重点不突出
- ✅ 3 种典型场景: 平衡演示效果和代码简洁性

---

### 3. 数据展示方式研究

**研究任务**: 确定如何在控制台清晰展示每日指标数据

**决策**: 分场景展示,突出关键字段

**展示策略**:
1. **场景 1 (全市场数据)**:
   - 显示总数据条数
   - 显示前 3 条完整数据
   - 突出显示关键字段: ts_code, trade_date, pe, pb, turnover_rate, total_mv

2. **场景 2 (历史数据)**:
   - 显示数据条数和日期范围
   - 显示前 3 条数据
   - 可选:显示指标变化趋势(如 PE 的最大值、最小值、平均值)

3. **场景 3 (自定义字段)**:
   - 显示返回的字段列表
   - 显示前 3 条数据
   - 说明字段筛选的好处(性能、带宽)

**实现方式**:
- 复用现有的 `formatter.ts` 工具函数
- 使用 `console.table()` 展示表格数据(如果数据量适中)
- 使用 `JSON.stringify()` 展示完整数据(verbose 模式)

**理由**:
- 清晰展示不同场景的数据特点
- 帮助开发者理解数据结构
- 符合现有示例的展示风格

---

### 4. 错误处理场景研究

**研究任务**: 确定需要演示的错误处理场景

**决策**: 复用现有错误处理机制,添加特定说明

**错误场景**:
1. **权限不足**: 
   - 触发条件: 用户积分 < 2000
   - 错误信息: "权限不足,daily_basic 接口需要 2000+ 积分"
   - 处理建议: 提示用户升级积分或使用其他接口

2. **参数错误**:
   - 触发条件: 日期格式错误、股票代码不存在
   - 错误信息: 显示 API 返回的错误详情
   - 处理建议: 检查参数格式和有效性

3. **无数据返回**:
   - 触发条件: 查询的日期是周末或节假日
   - 处理方式: 返回空数组,显示提示信息
   - 不视为错误,正常处理

**实现方式**:
```typescript
try {
  const response = await client.getDailyBasic(params);
  if (response.length === 0) {
    console.log('提示: 该日期无交易数据(可能是周末或节假日)');
  }
  return { count: response.length, sample: response.slice(0, 3) };
} catch (error) {
  // 错误处理由 example-runner 统一处理
  throw error;
}
```

**理由**:
- 复用现有的错误处理框架(`error-handler.ts`)
- 添加每日指标特定的提示信息
- 保持与其他示例一致的错误处理风格

---

### 5. 命令行参数集成研究

**研究任务**: 确定如何将新示例集成到现有命令行参数系统

**决策**: 添加 `daily-basic` 到示例列表

**需要修改的文件**:

1. **`src/types.ts`**:
   ```typescript
   export type ExampleName = 
     | 'stock-list' 
     | 'daily-data' 
     | 'trade-calendar' 
     | 'daily-basic'  // 新增
     | 'all';
   ```

2. **`src/index.ts`**:
   ```typescript
   const allExamples = [
     // ... 现有示例
     {
       name: '每日指标查询',
       key: 'daily-basic' as const,
       fn: async () => runDailyBasicExample(config),
     },
   ];
   ```

3. **参数解析逻辑**:
   ```typescript
   if (exampleValue === 'stock-list' || exampleValue === 'daily-data' || 
       exampleValue === 'trade-calendar' || exampleValue === 'daily-basic' || 
       exampleValue === 'all') {
     example = exampleValue;
   }
   ```

**运行方式**:
- 单独运行: `pnpm --filter node-demo start --example=daily-basic`
- 全部运行: `pnpm --filter node-demo start --example=all`
- 支持 verbose: `pnpm --filter node-demo start --example=daily-basic --verbose`
- 支持 JSON 输出: `pnpm --filter node-demo start --example=daily-basic --format=json`

**理由**:
- 与现有示例保持一致的运行方式
- 支持所有现有的命令行参数
- 可以单独运行或与其他示例一起运行

---

### 6. README 文档更新研究

**研究任务**: 确定如何在 README 中添加每日指标示例说明

**决策**: 在"可用示例"章节添加新条目

**文档结构**:
```markdown
## 可用示例

### 1. 股票列表查询 (stock-list)
...

### 2. 日线数据查询 (daily-data)
...

### 3. 交易日历查询 (trade-calendar)
...

### 4. 每日指标查询 (daily-basic)  // 新增

演示如何使用 `getDailyBasic` API 获取股票每日基本面指标数据。

**运行命令**:
```bash
pnpm --filter node-demo start --example=daily-basic
```

**演示内容**:
- 按交易日期查询全市场数据
- 按股票代码查询历史数据
- 自定义返回字段

**关键字段**:
- `ts_code`: 股票代码
- `trade_date`: 交易日期
- `pe`: 市盈率(动态)
- `pb`: 市净率
- `turnover_rate`: 换手率(%)
- `total_mv`: 总市值(万元)

**权限要求**: 需要 2000+ 积分
```

**理由**:
- 保持与现有示例说明的一致性
- 提供完整的使用说明和示例输出
- 说明权限要求,避免用户困惑

---

## Technology Stack Summary

基于以上研究,新增每日指标示例的技术栈与现有示例完全一致:

| 技术领域 | 选择 | 说明 |
|---------|------|------|
| 语言 | TypeScript 5.x+ | 与现有示例一致 |
| SDK API | getDailyBasic | 已在 SDK 中实现 |
| 工具函数 | logger, formatter, error-handler | 复用现有工具 |
| 代码风格 | 与 daily-data.ts 一致 | 保持一致性 |
| 测试框架 | Vitest | 与主项目一致 |
| 运行方式 | tsx + pnpm | 与现有示例一致 |

## Implementation Readiness

✅ **所有技术决策已完成,可以进入 Phase 1 设计阶段**

### 已解决的问题
1. ✅ 现有示例代码结构分析
2. ✅ getDailyBasic API 使用方式
3. ✅ 数据展示方式
4. ✅ 错误处理场景
5. ✅ 命令行参数集成
6. ✅ README 文档更新

### 无需进一步研究的项
- 无需研究新的技术栈,全部使用现有技术
- 无需研究 SDK API,已在 004-sdk 中实现
- 无需研究工具函数,复用现有实现
- 无需研究测试框架,与主项目一致

## Next Steps

进入 **Phase 1: Design & Contracts**,生成以下文档:
1. `data-model.md` - 数据模型定义(示例函数接口)
2. `contracts/example-interface.md` - 示例接口契约
3. `quickstart.md` - 快速开始指南
