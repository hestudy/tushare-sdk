# Implementation Plan: SDK财务数据功能测试

**Branch**: `010-sdk` | **Date**: 2025-10-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-sdk/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

为SDK的财务数据功能(利润表、资产负债表、现金流量表)编写完整的测试套件,包括单元测试、集成测试和类型测试。测试需要验证API函数的参数传递、返回值处理、异常处理,以及TypeScript类型定义的完整性和准确性。测试框架使用vitest,遵循TDD原则,确保代码覆盖率达到80%以上。

## Technical Context

**Language/Version**: TypeScript 5.3+ / Node.js 18+ LTS
**Primary Dependencies**: vitest (测试框架), @vitest/expect-type (类型测试), 现有TushareClient (测试目标)
**Storage**: N/A (测试不需要持久化存储)
**Testing**: vitest (单元测试、集成测试、类型测试), mock技术(vi.fn)
**Target Platform**: Node.js 18+ LTS (开发和CI环境)
**Project Type**: 单项目 (monorepo中的packages/tushare-sdk)
**Performance Goals**: 单元测试执行时间 < 3秒, 集成测试单个用例 < 30秒
**Constraints**:
  - 单元测试不依赖真实API调用,使用mock
  - 集成测试需要TUSHARE_TOKEN环境变量
  - 集成测试需要至少2000积分的Tushare账户权限
  - 测试覆盖率必须达到80%以上
  - 测试代码风格需与现有测试保持一致(参考daily-basic.test.ts)
**Scale/Scope**:
  - 3个API函数测试(getIncomeStatement, getBalanceSheet, getCashFlow)
  - 3个类型定义测试(IncomeStatementItem 94字段, BalanceSheetItem 81字段, CashFlowItem 87字段)
  - 至少15个不同的测试场景
  - 预计创建2个测试文件(unit + integration)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

根据项目宪法 (constitution.md v1.0.0) 进行检查:

### I. Test-First Development (NON-NEGOTIABLE) ✅ **PASS**
- **符合性**: 本功能是为财务数据功能编写测试,完全遵循测试优先原则
- **说明**: 财务数据功能已实现(specs/009-sdk),现在补充完整的测试套件,符合TDD补测阶段
- **用户批准**: 需要在测试编写完成后获得用户批准才能执行(运行测试)

### II. TypeScript 技术栈 ✅ **PASS**
- **符合性**: 使用TypeScript 5.3+编写测试代码,启用严格模式
- **说明**:
  - 测试文件使用.ts扩展名
  - 所有类型定义从@hestudy/tushare-sdk导入
  - 使用@vitest/expect-type进行类型测试
  - 避免使用any类型,使用具体的接口类型

### III. 清晰的代码注释 ✅ **PASS**
- **符合性**: 测试代码需要清晰的注释说明测试意图
- **说明**:
  - 每个测试套件使用describe清晰描述测试模块
  - 每个测试用例使用it描述测试场景
  - 复杂的mock逻辑需要添加注释
  - 参考现有测试文件的注释风格(daily-basic.test.ts)

### IV. 清晰的代码结构 ✅ **PASS**
- **符合性**: 测试文件放置在正确的目录结构中
- **说明**:
  - 单元测试: `packages/tushare-sdk/tests/unit/financial.test.ts`
  - 集成测试: `packages/tushare-sdk/tests/integration/financial.integration.test.ts`
  - 遵循现有测试文件的命名规范
  - 每个文件按测试场景分组(describe块)

### V. 完整的测试覆盖 ✅ **PASS**
- **符合性**: 本功能就是为了实现完整的测试覆盖
- **说明**:
  - 目标覆盖率 ≥ 80%
  - 单元测试覆盖所有API函数和核心逻辑
  - 集成测试覆盖关键用户场景
  - 类型测试验证所有类型定义的完整性

**结论**: 所有宪法原则均通过,无需特殊豁免。本功能完全符合项目宪法要求。

## Project Structure

### Documentation (this feature)

```
specs/010-sdk/
├── spec.md              # Feature specification
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output - 测试最佳实践研究
├── data-model.md        # Phase 1 output - 测试数据模型设计
├── quickstart.md        # Phase 1 output - 测试快速开始指南
├── contracts/           # Phase 1 output - 测试合约规范
│   ├── unit-tests.md    # 单元测试规范
│   ├── integration-tests.md  # 集成测试规范
│   └── type-tests.md    # 类型测试规范
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
packages/tushare-sdk/
├── src/
│   ├── api/
│   │   └── financial.ts           # 待测试: 财务数据API函数
│   ├── models/
│   │   └── financial.ts           # 待测试: 财务数据类型定义
│   └── client/
│       └── TushareClient.ts       # 待测试: Client类的财务数据方法
│
└── tests/
    ├── unit/
    │   ├── daily-basic.test.ts    # 参考: 现有单元测试示例
    │   └── financial.test.ts      # 新建: 财务数据单元测试 ⬅️
    │
    └── integration/
        ├── daily-basic.integration.test.ts  # 参考: 现有集成测试示例
        └── financial.integration.test.ts    # 新建: 财务数据集成测试 ⬅️
```

**Structure Decision**:

本项目是monorepo结构,测试文件放置在`packages/tushare-sdk/tests/`目录下。选择单项目测试结构(Option 1),因为:

1. **现有结构**: 项目已有清晰的tests目录分层(unit/integration/contract)
2. **测试分离**: 单元测试和集成测试分离,符合测试金字塔原则
3. **命名规范**: 遵循现有命名规范(*.test.ts用于单元测试, *.integration.test.ts用于集成测试)
4. **参考模板**: 完全参考daily-basic的测试文件结构和代码风格
5. **目标文件**:
   - `tests/unit/financial.test.ts` - 财务数据单元测试(新建)
   - `tests/integration/financial.integration.test.ts` - 财务数据集成测试(新建)

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**N/A** - 本功能没有任何宪法违规,所有原则均已通过。无需复杂度豁免或特殊说明。
