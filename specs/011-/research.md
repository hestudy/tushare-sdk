# Research: 演示应用财务数据功能集成

**Feature**: 011- | **Date**: 2025-10-13

## Research Questions

本研究文档解决在集成财务数据示例到演示应用框架过程中需要明确的技术决策和最佳实践。

---

## 1. 如何适配 financial-data.ts 使其符合演示框架接口规范?

### Decision
将 `financial-data.ts` 中的 `runFinancialExamples()` 函数重构为 `runFinancialDataExample(config: AppConfig)` 函数,使其返回符合 `ExampleResult` 接口的数据结构,与其他示例(stock-list, daily-data 等)保持一致。

### Rationale
- **一致性**: 所有现有示例都导出一个 `run<Name>Example(config: AppConfig)` 函数
- **可集成性**: 返回标准化的结果对象,便于 example-runner 统一处理
- **错误处理**: 统一的错误捕获和格式化机制
- **日志记录**: 使用统一的 logger 工具记录 API 请求和响应

### Implementation Details
```typescript
// 修改前 (current)
export async function runFinancialExamples() {
  console.log(...);
  await queryIncomeStatement();
  await queryBalanceSheet();
  // ...
}

// 修改后 (target)
export async function runFinancialDataExample(config: AppConfig): Promise<{
  totalReports: number;
  reportTypes: string[];
  summary: Record<string, unknown>;
}> {
  const client = new TushareClient({ token: config.tushareToken });

  // 使用 logger.ts 工具替代 console.log
  logApiRequest('getIncomeStatement', params);
  const data = await client.getIncomeStatement(params);
  logApiResponse('getIncomeStatement', data, duration);

  // 返回结构化数据
  return {
    totalReports: 3,
    reportTypes: ['利润表', '资产负债表', '现金流量表'],
    summary: { /* 汇总数据 */ }
  };
}
```

### Alternatives Considered
- **保持原函数不变,创建包装函数**: 会导致代码重复,不利于维护
- **完全重写示例代码**: 工作量大且不必要,现有代码逻辑已经很好

---

## 2. 如何处理 financial-data.ts 中的多个子示例函数?

### Decision
将原有的5个子示例函数(queryIncomeStatement, queryBalanceSheet, queryCashFlow, comprehensiveFinancialAnalysis, multiPeriodComparison)保留为内部函数,但简化输出,只保留核心演示逻辑,避免在 `--example=all` 模式下输出过于冗长。

### Rationale
- **模块化**: 保持代码结构清晰,每个子示例独立可维护
- **可扩展性**: 未来可以根据需要添加 `--verbose` 模式展示更详细信息
- **用户体验**: 在 `--example=all` 模式下,只展示关键摘要信息,不输出所有详细数据

### Implementation Details
```typescript
async function queryIncomeStatement(client: TushareClient, verbose: boolean) {
  // 查询逻辑保持不变
  const data = await client.getIncomeStatement(...);

  // 根据 verbose 模式决定输出详细程度
  if (verbose) {
    // 输出详细字段
    console.log(`营业总收入: ${income.total_revenue}`);
    console.log(`净利润: ${income.n_income_attr_p}`);
    // ...
  } else {
    // 只输出摘要
    console.log(`利润表查询成功,共 ${data.length} 条记录`);
  }

  return data;
}
```

### Alternatives Considered
- **合并所有子示例为一个函数**: 会导致函数过长,不符合单一职责原则
- **每个子示例作为独立的顶层示例**: 会增加命令行参数复杂度,用户体验不佳

---

## 3. 如何在 types.ts 中扩展 ExampleName 类型?

### Decision
在 `types.ts` 中将 `ExampleName` 类型扩展为包含 `'financial-data'`:
```typescript
export type ExampleName = 'stock-list' | 'daily-data' | 'trade-calendar' | 'daily-basic' | 'financial-data' | 'all';
```

### Rationale
- **类型安全**: TypeScript 编译器会验证所有使用 ExampleName 的地方
- **IDE 支持**: 提供自动补全和类型检查
- **一致性**: 与现有示例的命名模式保持一致

### Implementation Details
修改文件: `apps/node-demo/src/types.ts:84`
```typescript
// Before
export type ExampleName = 'stock-list' | 'daily-data' | 'trade-calendar' | 'daily-basic' | 'all';

// After
export type ExampleName = 'stock-list' | 'daily-data' | 'trade-calendar' | 'daily-basic' | 'financial-data' | 'all';
```

同时更新 `index.ts` 中的参数解析逻辑:
```typescript
if (exampleValue === 'stock-list' || exampleValue === 'daily-data' ||
    exampleValue === 'trade-calendar' || exampleValue === 'daily-basic' ||
    exampleValue === 'financial-data' ||  // 新增
    exampleValue === 'all') {
  example = exampleValue;
}
```

### Alternatives Considered
- **使用字符串枚举**: 更加规范,但会增加代码量,对于简单的示例应用不必要
- **动态注册示例**: 过度设计,不符合当前项目的简洁风格

---

## 4. 如何在 index.ts 中注册财务数据示例?

### Decision
在 `index.ts` 的 `allExamples` 数组中添加财务数据示例的注册项,模式与其他示例完全一致:
```typescript
{
  name: '财务数据查询',
  key: 'financial-data' as const,
  fn: async () => runFinancialDataExample(config),
}
```

### Rationale
- **声明式**: 所有示例在一个地方集中注册,便于管理
- **类型安全**: 使用 `as const` 确保类型推断正确
- **可维护性**: 添加或删除示例只需修改数组,不影响其他代码

### Implementation Details
修改文件: `apps/node-demo/src/index.ts:84-106`

在导入部分添加:
```typescript
import { runFinancialDataExample } from './examples/financial-data.js';
```

在 allExamples 数组中添加:
```typescript
const allExamples = [
  // ... 现有示例 ...
  {
    name: '财务数据查询',
    key: 'financial-data' as const,
    fn: async () => runFinancialDataExample(config),
  },
];
```

### Alternatives Considered
- **使用插件系统自动发现示例**: 过度设计,增加复杂度
- **在单独的配置文件中注册**: 增加文件数量,不符合当前简洁的代码结构

---

## 5. 错误处理和日志记录的最佳实践

### Decision
使用现有的 `logger.ts` 和 `error-handler.ts` 工具模块,确保与其他示例一致的错误处理和日志记录行为。

### Rationale
- **统一体验**: 所有示例的错误信息格式一致
- **代码复用**: 避免重复实现错误处理逻辑
- **可维护性**: 统一修改日志格式或错误处理策略

### Implementation Details

使用 logger 工具:
```typescript
import { logApiRequest, logApiResponse, logVerbose } from '../utils/logger.js';

// 记录 API 请求
logApiRequest('getIncomeStatement', { ts_code: '000001.SZ', period: '20231231' });

// 记录 API 响应
const startTime = Date.now();
const data = await client.getIncomeStatement(params);
const duration = Date.now() - startTime;
logApiResponse('getIncomeStatement', data, duration);

// verbose 模式日志
logVerbose('财务数据查询详情', { count: data.length, duration });
```

错误处理:
```typescript
import { printError } from '../utils/error-handler.js';

try {
  // API 调用
} catch (error) {
  printError(error);
  throw error; // 让 example-runner 统一处理
}
```

### Alternatives Considered
- **在 financial-data.ts 中自定义日志逻辑**: 会导致不一致的输出格式
- **不使用 verbose 模式**: 会失去调试和详细分析能力

---

## 6. 输出格式的处理(console vs JSON)

### Decision
财务数据示例应该返回结构化的数据对象,由 `formatter.ts` 统一处理输出格式,支持 `--format=json` 和 `--format=console` 两种模式。

### Rationale
- **一致性**: 所有示例的输出格式处理逻辑统一
- **可扩展性**: 未来可以轻松添加新的输出格式(如 CSV, XML)
- **用户友好**: 用户可以选择适合的输出格式用于后续处理

### Implementation Details

财务数据示例返回的数据结构:
```typescript
export async function runFinancialDataExample(config: AppConfig): Promise<{
  reports: {
    incomeStatement: unknown[];
    balanceSheet: unknown[];
    cashFlow: unknown[];
  };
  calculatedMetrics: {
    netProfitMargin?: number;
    currentRatio?: number;
    debtRatio?: number;
  };
  summary: {
    totalRecords: number;
    reportTypes: number;
    analysisComplete: boolean;
  };
}> {
  // 实现逻辑
}
```

formatter 自动处理:
- `--format=console`: 格式化为易读的文本输出
- `--format=json`: 序列化为 JSON 输出

### Alternatives Considered
- **在示例中直接实现 JSON 输出**: 违反单一职责原则,代码重复
- **不支持 JSON 格式**: 限制了用户的使用场景

---

## 7. 测试策略

### Decision
采用手动集成测试为主,自动化测试为辅的策略:
1. 手动测试:运行 `npm start -- --example=financial-data` 验证功能
2. 手动测试:运行 `npm start` 验证在 all 模式下正常运行
3. 如有必要,添加单元测试验证示例注册和参数解析逻辑

### Rationale
- **实用性**: 演示应用的主要目的是展示 SDK 用法,不是生产代码
- **成本效益**: 手动测试已经足够验证功能正确性
- **灵活性**: SDK API 可能变化,过多的自动化测试反而增加维护负担

### Implementation Details

手动测试清单:
```bash
# 测试1: 单独运行财务数据示例
npm start -- --example=financial-data

# 测试2: verbose 模式
npm start -- --example=financial-data --verbose

# 测试3: JSON 格式输出
npm start -- --example=financial-data --format=json

# 测试4: 所有示例(包含财务数据)
npm start

# 测试5: 验证错误处理(无效 token)
TUSHARE_TOKEN=invalid npm start -- --example=financial-data
```

可选的自动化测试:
```typescript
// tests/integration/financial-data.test.ts
describe('financial-data example', () => {
  it('should be registered in example list', () => {
    // 验证示例已注册
  });

  it('should accept financial-data as example parameter', () => {
    // 验证参数解析正确
  });
});
```

### Alternatives Considered
- **完全依赖自动化测试**: 对于演示应用来说过于重量级
- **不做任何测试**: 可能导致集成后发现问题,影响用户体验

---

## Summary

本研究文档涵盖了将财务数据示例集成到演示应用框架所需的所有关键技术决策:

1. **接口适配**: 重构为符合演示框架标准的函数签名
2. **子示例处理**: 保留模块化结构,支持 verbose 模式
3. **类型扩展**: 在 ExampleName 中添加 'financial-data'
4. **示例注册**: 在 index.ts 中声明式注册
5. **工具复用**: 使用 logger 和 error-handler 工具
6. **格式支持**: 返回结构化数据,支持多种输出格式
7. **测试策略**: 手动测试为主,确保功能正确

所有决策都基于以下原则:
- 与现有示例保持一致
- 代码简洁,避免过度设计
- 用户体验友好
- 可维护性高

下一步将在 Phase 1 中生成数据模型和合约文档。
