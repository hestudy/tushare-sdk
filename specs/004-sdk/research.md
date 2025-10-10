# Research: SDK每日指标快捷方法

**Feature**: 004-sdk  
**Date**: 2025-10-10  
**Phase**: 0 - Research & Discovery

## 研究目标

解决 Technical Context 中的所有 "NEEDS CLARIFICATION" 项,并研究最佳实践以确保实现与现有 SDK 风格一致。

## 1. Tushare API 每日指标接口规范

### 决策: 使用 `daily_basic` 接口

**官方文档**: https://tushare.pro/document/2?doc_id=32

**接口名称**: `daily_basic`

**功能描述**: 获取全部股票每日重要的基本面指标,可用于选股分析、报表展示等

**更新时间**: 交易日每日15点～17点之间

**权限要求**: 
- 至少 2000 积分才可以调取
- 5000 积分无总量限制

**数据限制**:
- 单次请求最大返回 6000 条数据
- 可按日线循环提取全部历史

### 输入参数 (根据官方文档)

| 参数名 | 类型 | 必选 | 描述 |
|--------|------|------|------|
| ts_code | string | N | 股票代码(如 600230.SH) |
| trade_date | string | N | 交易日期(YYYYMMDD格式,如20181010) |
| start_date | string | N | 开始日期(YYYYMMDD) |
| end_date | string | N | 结束日期(YYYYMMDD) |
| fields | string | N | 指定返回字段,逗号分隔 |

**注意**: 
- 日期格式必须是 YYYYMMDD,如 20181010
- ts_code 和 trade_date 至少需要一个参数
- fields 可以自定义返回字段以减少数据传输量

### 输出字段 (根据官方文档和示例)

核心字段:
- `ts_code`: 股票代码
- `trade_date`: 交易日期
- `turnover_rate`: 换手率(%)
- `volume_ratio`: 量比
- `pe`: 市盈率(总市值/净利润,亏损的PE为空)
- `pe_ttm`: 市盈率(TTM,亏损的PE为空)
- `pb`: 市净率(总市值/净资产)
- `ps`: 市销率
- `ps_ttm`: 市销率(TTM)
- `dv_ratio`: 股息率(%)
- `dv_ttm`: 股息率(TTM)(%)
- `total_share`: 总股本(万股)
- `float_share`: 流通股本(万股)
- `free_share`: 自由流通股本(万)
- `total_mv`: 总市值(万元)
- `circ_mv`: 流通市值(万元)

**理由**: 这些字段是股票基本面分析的核心指标,涵盖估值、流动性、市值等关键维度。

### 官方示例

```python
pro = ts.pro_api()
df = pro.daily_basic(ts_code='', trade_date='20180726', 
                     fields='ts_code,trade_date,turnover_rate,volume_ratio,pe,pb')
```

或使用 query 方法:
```python
df = pro.query('daily_basic', ts_code='', trade_date='20180726',
               fields='ts_code,trade_date,turnover_rate,volume_ratio,pe,pb')
```

## 2. 现有 SDK 实现模式研究

### 决策: 遵循现有的三层架构模式

通过分析现有代码(`getStockBasic`、`getDailyQuote`、`getTradeCalendar`),确定了以下一致的实现模式:

#### 2.1 类型定义层 (`src/models/`)

**模式**:
```typescript
// 1. 查询参数接口: [Feature]Params
export interface DailyBasicParams {
  /** 参数说明 */
  param_name?: string;
}

// 2. 数据项接口: [Feature]Item
export interface DailyBasicItem {
  /** 字段说明 */
  field_name: string;
}
```

**命名约定**:
- 文件名: kebab-case (如 `daily-basic.ts`)
- 接口名: PascalCase + Params/Item 后缀
- 字段名: snake_case (与 Tushare API 保持一致)

**注释风格**:
- 使用 JSDoc 中文注释
- 每个字段都有清晰的说明
- 可选字段使用 `?` 标记

**参考**: `src/models/stock.ts`, `src/models/quote.ts`, `src/models/calendar.ts`

#### 2.2 API 函数层 (`src/api/`)

**模式**:
```typescript
import type { TushareClient } from '../client/TushareClient.js';
import type { DailyBasicParams, DailyBasicItem } from '../models/daily-basic.js';

/**
 * 获取每日指标
 * 
 * 功能描述
 * 
 * @param client - Tushare 客户端实例
 * @param params - 查询参数
 * @returns 数据列表
 * 
 * @example
 * ```typescript
 * const data = await getDailyBasic(client, {
 *   trade_date: '20180726'
 * });
 * ```
 */
export async function getDailyBasic(
  client: TushareClient,
  params?: DailyBasicParams
): Promise<DailyBasicItem[]> {
  return client.query<DailyBasicItem>('daily_basic', params as Record<string, unknown>);
}
```

**命名约定**:
- 函数名: `get[Feature]` 格式,camelCase
- 文件名: 与 models 对应,kebab-case

**注释要求**:
- 完整的 JSDoc 注释
- 包含功能描述、参数说明、返回值、示例代码
- 示例代码展示典型用法

**参数设计**:
- 第一个参数: `client: TushareClient`
- 第二个参数: `params?: [Feature]Params` (可选)
- 返回类型: `Promise<[Feature]Item[]>`

**实现方式**:
- 直接调用 `client.query<T>(api_name, params)`
- 不做额外的数据处理或转换
- 保持简洁,单一职责

**参考**: `src/api/stock.ts`, `src/api/quote.ts`, `src/api/calendar.ts`

#### 2.3 导出层 (`src/index.ts`)

**模式**:
```typescript
// 导出类型
export type { DailyBasicParams, DailyBasicItem } from './models/daily-basic.js';

// 导出API函数
export { getDailyBasic } from './api/daily-basic.js';
```

**理由**: 统一的导出入口,方便用户使用

## 3. TypeScript 类型设计最佳实践

### 决策: 使用严格类型定义,避免 `any`

**最佳实践**:
1. **所有字段都明确类型**: `string | number | undefined`
2. **可选字段使用 `?`**: 表示该字段可能不存在
3. **数值字段使用 `number`**: 即使 API 可能返回 null,也用 `number | undefined`
4. **日期字段使用 `string`**: Tushare 使用 YYYYMMDD 格式字符串
5. **枚举值使用联合类型**: 如 `'SSE' | 'SZSE'`

**示例**:
```typescript
export interface DailyBasicItem {
  /** 股票代码 */
  ts_code: string;
  
  /** 交易日期 (YYYYMMDD) */
  trade_date: string;
  
  /** 换手率 (%) - 可能为空 */
  turnover_rate?: number;
  
  /** 市盈率 - 亏损时为空 */
  pe?: number;
}
```

**理由**: 
- 严格类型提供更好的 IDE 支持和编译时检查
- 可选字段反映 API 的真实行为
- 避免运行时类型错误

## 4. 测试策略研究

### 决策: 遵循 TDD 流程,分层测试

基于宪法要求和现有测试模式,确定以下测试策略:

#### 4.1 单元测试 (`tests/unit/`)

**测试内容**:
- 类型定义的正确性
- API 函数的参数传递
- 错误处理逻辑

**Mock 策略**:
- Mock `TushareClient.query()` 方法
- 返回预定义的测试数据
- 验证调用参数的正确性

**测试用例**:
1. 按交易日期查询
2. 按股票代码查询
3. 同时传入股票代码和交易日期
4. 自定义返回字段
5. 空参数调用
6. 参数类型验证

#### 4.2 集成测试 (`tests/integration/`)

**测试内容**:
- 真实 API 调用(需要有效 token)
- 数据格式验证
- 边界情况处理

**测试用例** (基于 spec.md 的 User Stories):
1. **User Story 1**: 按交易日期获取所有股票每日指标
2. **User Story 2**: 按股票代码获取历史每日指标
3. **Edge Cases**: 非交易日、无效股票代码、积分不足等

**注意事项**:
- 集成测试需要真实的 Tushare token
- 使用环境变量配置 token
- 测试数据使用历史日期,避免依赖当日数据

#### 4.3 测试覆盖率目标

- **目标**: ≥ 80% 代码覆盖率
- **重点**: 核心业务逻辑和边界情况
- **工具**: Jest/Vitest 内置覆盖率工具

## 5. 错误处理和边界情况

### 决策: 依赖 TushareClient 的统一错误处理

**现有机制**:
- `TushareClient` 已经处理了 API 错误
- 错误会被抛出为异常
- 快捷方法不需要额外的错误处理

**边界情况**:
1. **非交易日查询**: API 返回空数组,正常行为
2. **无效股票代码**: API 返回空数组,正常行为
3. **积分不足**: API 返回错误,由 client 抛出异常
4. **超过 6000 条限制**: 用户需要自行分页(未来可考虑自动分页)

**理由**: 保持简洁,不过度设计,遵循现有模式

## 6. 性能考虑

### 决策: 不做额外优化,保持简洁

**分析**:
- 单个交易日全市场约 4000 只股票
- API 响应时间主要取决于 Tushare 服务器
- SDK 本身不做缓存或批处理

**性能目标**:
- 单次查询 < 30s (基于 spec.md 的 SC-002)
- 主要由网络延迟和 API 处理时间决定

**未来优化方向** (不在本次实现范围):
- 自动分页处理超过 6000 条的数据
- 本地缓存减少重复请求
- 批量查询优化

## 7. 文档和示例

### 决策: 提供清晰的 JSDoc 和使用示例

**文档要求**:
1. **JSDoc 注释**: 所有公共 API 都有完整注释
2. **示例代码**: 展示典型用法
3. **参数说明**: 清晰的参数描述和类型
4. **返回值说明**: 明确返回的数据结构

**示例代码风格**:
```typescript
/**
 * @example
 * ```typescript
 * // 获取指定日期的所有股票每日指标
 * const data = await getDailyBasic(client, {
 *   trade_date: '20180726'
 * });
 * 
 * // 获取指定股票的每日指标
 * const stockData = await getDailyBasic(client, {
 *   ts_code: '600230.SH',
 *   start_date: '20180101',
 *   end_date: '20181231'
 * });
 * ```
 */
```

## 研究结论

### 所有 NEEDS CLARIFICATION 已解决

1. ✅ **API 接口规范**: 明确使用 `daily_basic` 接口,了解所有输入输出参数
2. ✅ **实现模式**: 遵循现有三层架构(models/api/index)
3. ✅ **类型设计**: 使用严格类型,避免 any
4. ✅ **测试策略**: TDD 流程,单元测试 + 集成测试
5. ✅ **错误处理**: 依赖现有 client 的统一处理
6. ✅ **性能目标**: 明确性能预期,不过度优化
7. ✅ **文档规范**: 完整的 JSDoc 和示例代码

### 技术选型总结

| 决策项 | 选择 | 理由 |
|--------|------|------|
| 文件结构 | models/ + api/ | 与现有代码一致 |
| 命名约定 | kebab-case 文件, PascalCase 类型 | 遵循现有规范 |
| 类型系统 | 严格类型,可选字段用 ? | TypeScript 最佳实践 |
| API 调用 | client.query() | 复用现有基础设施 |
| 错误处理 | 依赖 client | 保持简洁,避免重复 |
| 测试框架 | Jest/Vitest | 项目现有选择 |
| 测试策略 | TDD + 分层测试 | 宪法要求 |

### 下一步: Phase 1 设计

所有研究已完成,可以进入 Phase 1 生成:
- `data-model.md`: 详细的数据模型定义
- `contracts/`: API 契约定义
- `quickstart.md`: 快速开始指南
