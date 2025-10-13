# Quick Start: SDK财务数据功能测试

**Feature**: 010-sdk
**Purpose**: 快速开始指南,帮助开发者快速理解如何编写和运行财务数据功能的测试

## 概述

本功能为SDK的财务数据功能(利润表、资产负债表、现金流量表)编写完整的测试套件,包括:

- ✅ **单元测试**: 使用mock验证API函数的行为
- ✅ **集成测试**: 使用真实API验证端到端流程
- ✅ **类型测试**: 验证TypeScript类型定义的完整性

---

## 前置条件

### 1. 环境要求

- Node.js 18+ LTS
- pnpm (包管理器)
- TypeScript 5.3+
- vitest (测试框架,已安装)

### 2. 项目结构

```bash
packages/tushare-sdk/
├── src/
│   ├── api/financial.ts           # 待测试: API函数
│   └── models/financial.ts        # 待测试: 类型定义
└── tests/
    ├── unit/
    │   └── financial.test.ts      # 新建: 单元测试
    └── integration/
        └── financial.integration.test.ts  # 新建: 集成测试
```

---

## 步骤1: 编写单元测试

### 创建测试文件

```bash
# 创建单元测试文件
touch packages/tushare-sdk/tests/unit/financial.test.ts
```

### 基本测试结构

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TushareClient } from '../../src/client/TushareClient.js';
import { getIncomeStatement, getBalanceSheet, getCashFlow } from '../../src/api/financial.js';
import type { IncomeStatementItem } from '../../src/models/financial.js';

describe('财务数据API单元测试', () => {
  let client: TushareClient;
  let mockQuery: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // 每个测试前创建新的mock client
    client = new TushareClient({ token: 'test_token' });
    mockQuery = vi.fn();
    // @ts-expect-error - Mocking query method for testing
    client.query = mockQuery;
  });

  describe('getIncomeStatement', () => {
    it('应该正确调用client.query并传递参数', async () => {
      // Arrange: 准备mock数据
      const mockData: IncomeStatementItem[] = [
        {
          ts_code: '000001.SZ',
          ann_date: '20240430',
          f_ann_date: '20240430',
          end_date: '20231231',
          report_type: '4',
          comp_type: '1',
          end_type: '4'
        }
      ];
      mockQuery.mockResolvedValue(mockData);

      const params = { ts_code: '000001.SZ', period: '20231231' };

      // Act: 执行被测试的函数
      const result = await getIncomeStatement(client, params);

      // Assert: 验证结果
      expect(mockQuery).toHaveBeenCalledWith('income', params);
      expect(result).toEqual(mockData);
    });

    it('应该在无参数时正确调用', async () => {
      mockQuery.mockResolvedValue([]);

      const result = await getIncomeStatement(client);

      expect(mockQuery).toHaveBeenCalledWith('income', undefined);
      expect(result).toEqual([]);
    });

    it('应该正确处理异常', async () => {
      mockQuery.mockRejectedValue(new Error('API Error'));

      await expect(getIncomeStatement(client, { ts_code: '000001.SZ' }))
        .rejects.toThrow('API Error');
    });
  });

  // 类似地为getBalanceSheet和getCashFlow编写测试
});
```

### 运行单元测试

```bash
# 进入SDK目录
cd packages/tushare-sdk

# 运行所有单元测试
pnpm test

# 只运行financial单元测试
pnpm test tests/unit/financial.test.ts

# 运行测试并生成覆盖率报告
pnpm test --coverage
```

**预期结果**:
- ✅ 所有测试通过
- ✅ 执行时间 < 3秒
- ✅ 覆盖率 ≥ 80%

---

## 步骤2: 编写集成测试

### 前置准备

**设置Tushare API Token**:

```bash
# Linux/Mac
export TUSHARE_TOKEN="your_token_here"

# Windows (PowerShell)
$env:TUSHARE_TOKEN="your_token_here"
```

**注意**: 集成测试需要:
- 有效的Tushare Pro API Token
- 账户积分 ≥ 2000

### 创建集成测试文件

```bash
# 创建集成测试文件
touch packages/tushare-sdk/tests/integration/financial.integration.test.ts
```

### 基本集成测试结构

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { TushareClient } from '../../src/client/TushareClient.js';
import { getIncomeStatement, getBalanceSheet, getCashFlow } from '../../src/api/financial.js';

const hasToken = !!process.env.TUSHARE_TOKEN;

describe.skipIf(!hasToken)('财务数据集成测试', () => {
  let client: TushareClient;

  beforeAll(() => {
    client = new TushareClient({
      token: process.env.TUSHARE_TOKEN!,
      cache: {
        enabled: false, // 集成测试禁用缓存
      },
      retry: {
        maxRetries: 2,
        initialDelay: 1000,
      },
    });
  });

  describe('利润表数据获取', () => {
    it('应该能够获取平安银行2023年报利润表', async () => {
      const data = await getIncomeStatement(client, {
        ts_code: '000001.SZ',
        period: '20231231'
      });

      // 验证返回数据
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);

      // 验证数据结构
      const item = data[0];
      expect(item.ts_code).toBe('000001.SZ');
      expect(item.end_date).toBe('20231231');
      expect(typeof item.ann_date).toBe('string');

      // 验证数值字段
      if (item.total_revenue !== undefined) {
        expect(typeof item.total_revenue).toBe('number');
      }
    }, 30000); // 30秒超时

    it('应该正确处理不存在的股票代码', async () => {
      const data = await getIncomeStatement(client, {
        ts_code: '999999.SH',
        period: '20231231'
      });

      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(0);
    }, 30000);
  });

  // 类似地为资产负债表和现金流量表编写测试
});

// 错误处理测试(无需token)
describe('错误处理集成测试', () => {
  it('应该拒绝无效的token', async () => {
    const invalidClient = new TushareClient({
      token: 'invalid_token'
    });

    await expect(
      getIncomeStatement(invalidClient, {
        ts_code: '000001.SZ',
        period: '20231231'
      })
    ).rejects.toThrow();
  }, 30000);
});
```

### 运行集成测试

```bash
# 确保设置了TUSHARE_TOKEN环境变量
export TUSHARE_TOKEN="your_token_here"

# 运行所有集成测试
pnpm test:integration

# 只运行financial集成测试
pnpm test tests/integration/financial.integration.test.ts
```

**预期结果**:
- ✅ 有token时: 所有测试通过,能够获取真实数据
- ✅ 无token时: 测试优雅跳过,不报错

---

## 步骤3: 验证类型定义

### 类型测试(包含在单元测试中)

```typescript
describe('类型定义测试', () => {
  it('IncomeStatementItem应包含所有必填字段', () => {
    const item: IncomeStatementItem = {
      ts_code: '000001.SZ',
      ann_date: '20240430',
      f_ann_date: '20240430',
      end_date: '20231231',
      report_type: '4',
      comp_type: '1',
      end_type: '4'
      // 可选字段可以省略
    };

    expect(item.ts_code).toBe('000001.SZ');
  });

  it('可选字段应为number或undefined', () => {
    const item: IncomeStatementItem = {
      ts_code: '000001.SZ',
      ann_date: '20240430',
      f_ann_date: '20240430',
      end_date: '20231231',
      report_type: '4',
      comp_type: '1',
      end_type: '4',
      basic_eps: 2.34,  // 可选,类型为number
      // diluted_eps省略,为undefined
    };

    expect(typeof item.basic_eps).toBe('number');
    expect(item.diluted_eps).toBeUndefined();
  });
});
```

### TypeScript类型检查

```bash
# 运行TypeScript编译检查
pnpm --filter @hestudy/tushare-sdk type-check

# 或者
cd packages/tushare-sdk
npx tsc --noEmit
```

**预期结果**:
- ✅ 无TypeScript编译错误
- ✅ 类型定义完整,IDE提供完整提示

---

## 步骤4: 检查测试覆盖率

### 生成覆盖率报告

```bash
cd packages/tushare-sdk

# 运行测试并生成覆盖率报告
pnpm test --coverage

# 查看HTML报告
open coverage/index.html  # Mac
xdg-open coverage/index.html  # Linux
start coverage/index.html  # Windows
```

### 覆盖率目标

| 模块 | 目标覆盖率 | 说明 |
|------|-----------|------|
| src/api/financial.ts | ≥ 80% (目标100%) | 所有API函数 |
| src/models/financial.ts | 100% | 类型导出 |
| 整体 | ≥ 80% | 项目要求 |

---

## 常见问题

### Q1: 单元测试mock不起作用?

**问题**: mockQuery没有被调用,或者调用了真实API

**解决**:
```typescript
beforeEach(() => {
  client = new TushareClient({ token: 'test_token' });
  mockQuery = vi.fn();
  // 确保添加这一行
  // @ts-expect-error - Mocking query method for testing
  client.query = mockQuery;
});
```

### Q2: 集成测试被跳过?

**问题**: 集成测试显示"skipped"

**原因**: 没有设置TUSHARE_TOKEN环境变量

**解决**:
```bash
export TUSHARE_TOKEN="your_token_here"
pnpm test:integration
```

### Q3: 集成测试超时?

**问题**: 测试运行超过30秒超时

**解决**:
```typescript
it('测试用例', async () => {
  // ... test code
}, 60000); // 增加超时时间到60秒
```

### Q4: 类型测试编译错误?

**问题**: TypeScript报类型错误

**解决**: 确保从正确的路径导入类型
```typescript
import type { IncomeStatementItem } from '../../src/models/financial.js';
// 注意.js扩展名(ESM模块)
```

### Q5: 覆盖率不达标?

**问题**: 代码覆盖率低于80%

**解决**:
1. 查看覆盖率报告,找到未覆盖的代码
2. 为未覆盖的分支添加测试用例
3. 确保测试了所有异常路径

---

## 测试命令速查表

```bash
# 单元测试
pnpm --filter @hestudy/tushare-sdk test                    # 运行所有测试
pnpm --filter @hestudy/tushare-sdk test financial          # 只运行financial相关测试
pnpm --filter @hestudy/tushare-sdk test --coverage         # 生成覆盖率报告

# 集成测试
export TUSHARE_TOKEN="your_token"                          # 设置token
pnpm --filter @hestudy/tushare-sdk test:integration        # 运行集成测试
pnpm --filter @hestudy/tushare-sdk test financial.integration  # 只运行financial集成测试

# 类型检查
pnpm --filter @hestudy/tushare-sdk type-check              # TypeScript类型检查

# 所有检查(完整CI流程)
pnpm --filter @hestudy/tushare-sdk type-check              # 类型检查
pnpm --filter @hestudy/tushare-sdk test --coverage         # 测试+覆盖率
```

---

## 下一步

完成测试编写后:

1. **✅ 验证所有测试通过**
   ```bash
   pnpm test
   ```

2. **✅ 检查覆盖率达标**
   ```bash
   pnpm test --coverage
   ```

3. **✅ 提交代码审查**
   - 测试代码清晰,注释完整
   - 遵循现有测试文件的风格(参考daily-basic.test.ts)
   - 无TypeScript编译错误

4. **✅ 运行集成测试验证**
   ```bash
   export TUSHARE_TOKEN="your_token"
   pnpm test:integration
   ```

5. **✅ 更新文档**
   - 如有新增或修改,更新相关文档

---

## 参考资料

### 项目文档
- [研究文档](./research.md) - 测试策略和最佳实践
- [数据模型](./data-model.md) - 测试数据模型设计
- [单元测试合约](./contracts/unit-tests.md) - 单元测试规范
- [集成测试合约](./contracts/integration-tests.md) - 集成测试规范
- [类型测试合约](./contracts/type-tests.md) - 类型测试规范

### 参考测试文件
- `tests/unit/daily-basic.test.ts` - 单元测试模板
- `tests/integration/daily-basic.integration.test.ts` - 集成测试模板

### 外部资源
- [Vitest文档](https://vitest.dev/)
- [Tushare Pro API文档](https://tushare.pro/document/2)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)

---

## 支持

如有问题,请查看:
1. 本项目的README
2. 相关测试合约文档
3. 参考现有测试文件的实现
4. Vitest官方文档
