<!--
Sync Impact Report:
Version: 0.0.0 → 1.0.0
Modified Principles: N/A (Initial constitution)
Added Sections:
  - Core Principles (5 principles)
  - Technology Stack
  - Code Quality Standards
  - Governance
Templates Status:
  ✅ plan-template.md - Constitution Check section aligns with principles
  ✅ spec-template.md - Requirements structure supports test-first approach
  ✅ tasks-template.md - Test-first workflow enforced in task ordering
Follow-up TODOs: None
-->

# Tushare SDK Constitution

## Core Principles

### I. Test-First Development (NON-NEGOTIABLE)

**规则**:
- 所有功能实现前必须先编写测试
- 测试必须先失败(Red),然后实现代码使其通过(Green),最后重构(Refactor)
- 严格遵循 TDD 的 Red-Green-Refactor 循环
- 测试必须经过用户审批后才能开始实现
- 禁止在没有测试的情况下提交任何功能代码

**理由**: 测试优先确保代码质量、可维护性和需求的准确实现,减少后期缺陷修复成本。

### II. TypeScript 技术栈

**规则**:
- 项目必须使用 TypeScript 作为主要开发语言
- 必须启用严格模式 (`strict: true`)
- 必须为所有公共 API 提供完整的类型定义
- 禁止使用 `any` 类型,除非有充分的理由并在代码审查中说明
- 使用现代 TypeScript 特性(ES2020+)
- 依赖管理使用 npm 或 pnpm

**理由**: TypeScript 提供类型安全、更好的 IDE 支持和代码可维护性,减少运行时错误。

### III. 清晰的代码注释

**规则**:
- 所有公共函数、类、接口必须有 JSDoc 注释
- 注释必须包含:功能描述、参数说明、返回值说明、异常说明(如适用)
- 复杂的业务逻辑必须有行内注释解释其意图
- 注释必须使用中文,保持简洁明了
- 注释必须与代码保持同步,过时的注释必须更新或删除

**示例**:
```typescript
/**
 * 获取股票历史数据
 * @param symbol - 股票代码,如 '000001.SZ'
 * @param startDate - 开始日期,格式 YYYY-MM-DD
 * @param endDate - 结束日期,格式 YYYY-MM-DD
 * @returns 返回股票历史数据数组
 * @throws {ApiError} 当 API 调用失败时抛出
 */
async function getStockHistory(symbol: string, startDate: string, endDate: string): Promise<StockData[]> {
  // 实现代码
}
```

**理由**: 清晰的注释提高代码可读性,降低维护成本,帮助团队成员快速理解代码意图。

### IV. 清晰的代码结构

**规则**:
- 遵循单一职责原则(SRP):每个模块、类、函数只做一件事
- 使用清晰的目录结构组织代码:
  ```
  src/
  ├── models/      # 数据模型和类型定义
  ├── services/    # 业务逻辑服务
  ├── api/         # API 接口层
  ├── utils/       # 工具函数
  └── types/       # 共享类型定义
  
  tests/
  ├── unit/        # 单元测试
  ├── integration/ # 集成测试
  └── contract/    # 契约测试
  ```
- 文件命名使用 kebab-case (如 `stock-service.ts`)
- 类名使用 PascalCase,函数和变量使用 camelCase
- 每个文件不超过 300 行,超过则拆分
- 相关功能模块化,避免循环依赖

**理由**: 清晰的结构提高代码可维护性、可测试性和团队协作效率。

### V. 完整的测试覆盖

**规则**:
- 单元测试:覆盖所有核心业务逻辑,目标覆盖率 ≥ 80%
- 集成测试:覆盖关键用户场景和 API 交互
- 契约测试:验证外部 API 接口的契约
- 使用 Jest 或 Vitest 作为测试框架
- 测试必须独立、可重复、快速执行
- 测试命名清晰描述测试场景:`describe('功能模块', () => { it('应该...', () => {}) })`

**理由**: 完整的测试覆盖确保代码质量,支持安全重构,减少回归缺陷。

## Technology Stack

**核心技术**:
- **语言**: TypeScript 5.x+
- **运行时**: Node.js 18+ LTS
- **包管理**: pnpm (推荐) 或 npm
- **测试框架**: Jest 或 Vitest
- **代码检查**: ESLint + Prettier
- **类型检查**: TypeScript Compiler (tsc)
- **构建工具**: tsup 或 esbuild

**依赖管理**:
- 必须锁定依赖版本 (使用 `pnpm-lock.yaml` 或 `package-lock.json`)
- 定期更新依赖,但必须经过测试验证
- 避免引入不必要的依赖,优先使用标准库

## Code Quality Standards

**代码审查要求**:
- 所有代码必须经过至少一人审查
- 审查必须验证:测试覆盖、类型安全、注释完整性、代码结构
- 禁止合并未通过 CI 检查的代码

**CI/CD 检查**:
- 类型检查: `tsc --noEmit`
- 代码检查: `eslint src/ tests/`
- 格式检查: `prettier --check .`
- 测试执行: `npm test` (必须全部通过)
- 测试覆盖率检查 (≥ 80%)

**性能标准**:
- API 响应时间 < 200ms (P95)
- 单元测试执行时间 < 5s
- 内存使用合理,避免内存泄漏

## Governance

**宪法权威**:
- 本宪法是项目开发的最高准则,所有实践必须遵守
- 任何违反宪法的代码不得合并到主分支
- 如需违反某项原则,必须在代码审查中提供充分理由并获得批准

**修订流程**:
- 宪法修订必须经过团队讨论和批准
- 修订必须更新版本号(遵循语义化版本)
- 修订必须同步更新所有相关模板和文档
- 重大修订需要提供迁移计划

**合规性审查**:
- 每次 PR 必须验证是否符合宪法要求
- 定期(每季度)审查代码库的宪法合规性
- 发现违规必须立即修复或提出豁免申请

**版本控制**:
- MAJOR: 不兼容的原则移除或重新定义
- MINOR: 新增原则或重大扩展
- PATCH: 澄清、措辞修正、非语义改进

**Version**: 1.0.0 | **Ratified**: 2025-10-09 | **Last Amended**: 2025-10-09