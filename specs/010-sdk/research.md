# Research: SDK财务数据功能测试

**Date**: 2025-10-13
**Feature**: 010-sdk (SDK财务数据功能测试)
**Status**: Phase 0 Complete

本文档记录为财务数据功能编写完整测试套件的研究结果。

## 研究目标

基于Technical Context中的未知项,研究以下主题:

1. **Vitest测试框架最佳实践** - 如何使用vitest编写高质量的单元测试和集成测试
2. **TypeScript类型测试** - 如何验证TypeScript类型定义的完整性和准确性
3. **Mock策略** - 如何正确mock TushareClient以实现快速、稳定的单元测试
4. **集成测试设计** - 如何设计可靠的集成测试,处理外部API依赖
5. **测试覆盖率** - 如何确保测试覆盖率达到80%以上

## 研究发现

### 1. Vitest测试框架最佳实践

**决策**: 使用vitest作为测试框架,完全兼容现有测试代码风格

**理由**:
- 项目已使用vitest,配置完整(`packages/tushare-sdk/vitest.config.ts`)
- 现有测试文件(`daily-basic.test.ts`)提供了完整的参考模板
- vitest提供完整的测试功能: describe/it/expect/vi.fn/beforeEach等
- 执行速度快,支持并行测试

**最佳实践**:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('功能模块描述', () => {
  let client: TushareClient;
  let mockQuery: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // 每个测试前重置mock
    client = new TushareClient({ token: 'test_token' });
    mockQuery = vi.fn();
    // @ts-expect-error - Mocking query method for testing
    client.query = mockQuery;
  });

  describe('场景分组', () => {
    it('测试用例描述 - 详细说明预期行为', async () => {
      // Arrange: 准备测试数据和mock
      const mockData = [/* ... */];
      mockQuery.mockResolvedValue(mockData);

      // Act: 执行被测试的函数
      const result = await functionUnderTest(client, params);

      // Assert: 验证结果
      expect(mockQuery).toHaveBeenCalledWith('api_name', params);
      expect(result).toEqual(mockData);
    });
  });
});
```

**参考文件**: `tests/unit/daily-basic.test.ts`

**考虑的备选方案**: Jest (更流行) - 拒绝原因: 项目已标准化使用vitest,切换成本高

---

### 2. TypeScript类型测试

**决策**: 使用编译时类型检查 + 运行时类型验证的混合策略

**理由**:
- TypeScript编译器可以检测类型错误,但需要实际使用才能触发
- 运行时验证确保实际API返回的数据符合类型定义
- 结合两者可以全面验证类型系统的正确性

**实施方案**:

1. **编译时类型检查**:
   ```typescript
   // 通过实际使用类型来触发TypeScript编译检查
   it('类型定义应该包含所有必需字段', () => {
     const income: IncomeStatementItem = {
       ts_code: '000001.SZ',
       ann_date: '20240430',
       f_ann_date: '20240430',
       end_date: '20231231',
       report_type: '4',
       comp_type: '1',
       end_type: '4',
       // TypeScript会检查必填字段是否完整
     };
     expect(income.ts_code).toBe('000001.SZ');
   });
   ```

2. **运行时类型验证**:
   ```typescript
   it('实际API返回的数据应该符合类型定义', async () => {
     const data = await getIncomeStatement(client, params);

     // 验证返回数据的结构
     expect(Array.isArray(data)).toBe(true);
     if (data.length > 0) {
       const item = data[0];
       // 验证必填字段
       expect(typeof item.ts_code).toBe('string');
       expect(typeof item.ann_date).toBe('string');
       // 验证可选字段类型
       if (item.total_revenue !== undefined) {
         expect(typeof item.total_revenue).toBe('number');
       }
     }
   });
   ```

**工具选择**:
- 主要依赖TypeScript编译器(`tsc --noEmit`)
- 可选: `@vitest/expect-type` (用于更复杂的类型测试,如条件类型、泛型等)
- 本功能暂不需要expect-type,因为类型定义相对简单(主要是接口定义)

**考虑的备选方案**:
- `tsd` - 拒绝原因: 需要额外配置,功能重叠
- 仅依赖TypeScript编译器 - 拒绝原因: 无法验证运行时数据结构

---

### 3. Mock策略

**决策**: 使用vitest的`vi.fn()`mock TushareClient的query方法

**理由**:
- 单元测试不应依赖外部API,否则会变慢且不稳定
- Mock query方法可以完全控制返回值,测试各种场景(成功、失败、空数据等)
- 现有测试已成功使用此策略(`daily-basic.test.ts`)

**Mock实现**:

```typescript
beforeEach(() => {
  client = new TushareClient({ token: 'test_token' });
  mockQuery = vi.fn();
  // @ts-expect-error - Mocking query method for testing
  client.query = mockQuery;
});

it('测试场景', async () => {
  // 配置mock返回值
  mockQuery.mockResolvedValue([
    {
      ts_code: '000001.SZ',
      ann_date: '20240430',
      // ... 完整的mock数据
    }
  ]);

  const result = await getIncomeStatement(client, params);

  // 验证调用参数
  expect(mockQuery).toHaveBeenCalledWith('income', params);
  // 验证返回值
  expect(result).toEqual(expect.arrayContaining([
    expect.objectContaining({
      ts_code: '000001.SZ'
    })
  ]));
});
```

**Mock数据设计原则**:
1. **完整性**: Mock数据应包含所有类型定义的字段(至少是必填字段)
2. **真实性**: 字段值应符合实际API返回的格式和范围
3. **可维护性**: 复杂的mock数据可以提取为测试辅助函数

**测试场景覆盖**:
- ✅ 正常返回数据
- ✅ 返回空数组
- ✅ 抛出异常(网络错误、权限错误等)
- ✅ 参数传递验证
- ✅ 大数据量场景

**考虑的备选方案**:
- 直接new一个fake client类 - 拒绝原因: 需要实现完整的client接口,工作量大
- 使用真实API + record/replay - 拒绝原因: 增加复杂度,不适合单元测试

---

### 4. 集成测试设计

**决策**: 使用真实Tushare API,支持在无token时优雅跳过

**理由**:
- 集成测试的目的是验证与真实API的交互
- 使用历史数据确保测试结果稳定可预测
- 支持跳过确保CI环境能正常运行(即使没有token)

**集成测试模式**:

```typescript
const hasToken = !!process.env.TUSHARE_TOKEN;

describe.skipIf(!hasToken)('财务数据集成测试', () => {
  let client: TushareClient;

  beforeAll(() => {
    client = new TushareClient({
      token: process.env.TUSHARE_TOKEN!,
      cache: {
        enabled: false, // 禁用缓存,确保获取真实数据
      },
      retry: {
        maxRetries: 2,
        initialDelay: 1000,
      },
    });
  });

  it('应该能够获取真实的利润表数据', async () => {
    // 使用历史日期确保数据稳定
    const data = await getIncomeStatement(client, {
      ts_code: '000001.SZ',
      period: '20231231', // 使用已公布的历史报告期
    });

    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);

    // 验证数据结构
    const item = data[0];
    expect(item.ts_code).toBe('000001.SZ');
    expect(item.end_date).toBe('20231231');
    expect(typeof item.ann_date).toBe('string');
  }, 30000); // 30秒超时
});
```

**关键设计点**:

1. **环境变量处理**:
   - 使用`process.env.TUSHARE_TOKEN`获取token
   - 使用`describe.skipIf(!hasToken)`在无token时跳过
   - 在文档中明确说明如何设置环境变量

2. **测试数据选择**:
   - 使用真实存在的股票代码(000001.SZ、600519.SH等)
   - 使用历史报告期(如2023年报),确保数据已公布
   - 避免使用当前年度或未来日期

3. **超时配置**:
   - 单个测试用例超时时间: 30秒
   - 考虑网络延迟和API响应时间

4. **错误处理测试**:
   - 无效token: 使用新的client实例
   - 无效参数: 验证API返回的错误
   - 权限不足: 使用低积分账户(文档说明)

5. **缓存测试**:
   - 第一次请求: 记录响应时间
   - 第二次请求: 验证响应时间显著更快(至少50%)

**考虑的备选方案**:
- 使用mock server(如MSW) - 拒绝原因: 无法验证真实API行为
- 总是运行集成测试 - 拒绝原因: CI环境可能没有token,会导致测试失败

---

### 5. 测试覆盖率

**决策**: 使用vitest的内置覆盖率工具,目标≥80%

**理由**:
- vitest集成了c8/istanbul覆盖率工具
- 可以生成详细的覆盖率报告(行覆盖、分支覆盖、函数覆盖)
- 与CI/CD系统集成容易

**覆盖率配置**:

```typescript
// vitest.config.ts (已存在)
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/**/*.test.ts'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
```

**覆盖率目标分解**:

| 模块 | 文件 | 目标覆盖率 | 关键测试点 |
|------|------|-----------|-----------|
| API函数 | `src/api/financial.ts` | 100% | 所有3个函数的参数传递和返回值 |
| 类型定义 | `src/models/financial.ts` | 100% | 类型导出和使用 |
| Client方法 | `src/client/TushareClient.ts` | 部分(新增方法) | 3个财务数据方法 |

**测试策略**:

1. **单元测试覆盖** (核心):
   - 所有API函数的正常流程
   - 所有API函数的异常流程
   - 参数传递验证
   - 返回值处理

2. **集成测试覆盖** (补充):
   - 真实API调用
   - 缓存机制
   - 重试机制
   - 错误处理

3. **类型测试覆盖**:
   - 类型导入导出
   - 类型使用场景
   - 必填/可选字段验证

**覆盖率检查命令**:
```bash
# 运行测试并生成覆盖率报告
pnpm --filter @hestudy/tushare-sdk test --coverage

# 只检查financial相关文件的覆盖率
pnpm --filter @hestudy/tushare-sdk test --coverage src/api/financial.ts src/models/financial.ts
```

**考虑的备选方案**:
- 目标100%覆盖率 - 拒绝原因: 成本过高,边际收益递减
- 目标60%覆盖率 - 拒绝原因: 不符合项目宪法要求(≥80%)

---

## 依赖技术栈总结

根据研究结果,确定以下技术栈:

| 技术 | 用途 | 版本 | 说明 |
|------|------|------|------|
| vitest | 测试框架 | 现有 | 单元测试、集成测试 |
| vi.fn() | Mock工具 | vitest内置 | Mock TushareClient.query方法 |
| TypeScript Compiler | 类型检查 | 5.3+ | 编译时类型验证 |
| @hestudy/tushare-sdk | 被测试模块 | 现有 | 财务数据API和类型 |
| dotenv | 环境变量 | 现有 | 集成测试的token管理 |

**无需新增依赖** - 所有工具和框架都已存在于项目中。

---

## 测试文件结构设计

基于研究结果,确定测试文件结构:

### 单元测试文件: `tests/unit/financial.test.ts`

```typescript
describe('财务数据API单元测试', () => {
  describe('getIncomeStatement', () => {
    it('测试用例1: 带参数调用 - 验证参数传递');
    it('测试用例2: 不带参数调用');
    it('测试用例3: 返回空数组');
    it('测试用例4: 抛出异常');
  });

  describe('getBalanceSheet', () => {
    // 类似结构
  });

  describe('getCashFlow', () => {
    // 类似结构
  });

  describe('类型定义测试', () => {
    it('IncomeStatementItem应包含所有必填字段');
    it('BalanceSheetItem应包含所有必填字段');
    it('CashFlowItem应包含所有必填字段');
  });
});
```

### 集成测试文件: `tests/integration/financial.integration.test.ts`

```typescript
describe.skipIf(!hasToken)('财务数据集成测试', () => {
  describe('利润表数据获取', () => {
    it('应该能够获取真实的利润表数据');
    it('应该能够处理无效的股票代码');
    it('应该能够处理权限不足的错误');
  });

  describe('资产负债表数据获取', () => {
    // 类似结构
  });

  describe('现金流量表数据获取', () => {
    // 类似结构
  });

  describe('缓存机制测试', () => {
    it('第二次请求应该更快(使用缓存)');
  });

  describe('错误处理测试', () => {
    it('无效token应该抛出错误');
    it('无效参数应该抛出错误');
  });
});
```

**估计代码量**:
- 单元测试: ~400-500行
- 集成测试: ~300-400行
- 总计: ~700-900行

---

## 风险和缓解措施

### 风险1: 集成测试依赖外部API,可能不稳定

**缓解措施**:
- 使用历史数据,确保数据已存在
- 配置重试机制
- 设置合理的超时时间
- 使用`skipIf`在无token时优雅跳过

### 风险2: Mock数据可能与真实API不一致

**缓解措施**:
- Mock数据基于真实API文档设计
- 集成测试验证真实数据结构
- 定期检查Tushare API更新,同步mock数据

### 风险3: 测试覆盖率难以达到80%

**缓解措施**:
- 单元测试覆盖所有分支路径
- 集成测试补充覆盖边界条件
- 使用覆盖率报告识别未覆盖代码
- 逐个补充缺失的测试用例

---

## 下一步行动

Phase 0 研究完成,所有未知项已解决。可以进入Phase 1设计阶段:

1. ✅ 测试框架选择: vitest
2. ✅ Mock策略: vi.fn() mock query方法
3. ✅ 类型测试: TypeScript编译检查 + 运行时验证
4. ✅ 集成测试: 真实API + skipIf无token
5. ✅ 覆盖率目标: ≥80%, 使用vitest内置工具

**准备进入Phase 1**: 生成data-model.md, contracts/, quickstart.md
