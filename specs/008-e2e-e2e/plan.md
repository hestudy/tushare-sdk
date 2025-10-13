# Implementation Plan: 文档站E2E测试重构

**Branch**: `008-e2e-e2e` | **Date**: 2025-10-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-e2e-e2e/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

完全重构文档站的E2E测试套件,以匹配全新的rspress驱动的文档站。新测试将覆盖所有核心页面(首页、指南页、API文档页、更新日志页)的可访问性、导航功能、代码示例功能和响应式设计。测试使用Playwright框架,基于真实的文档站DOM结构和内容,移除所有过时的测试代码,确保测试准确反映当前文档站的实际功能和用户体验。

## Technical Context

**Language/Version**: TypeScript 5.6+, Node.js 18+ LTS
**Primary Dependencies**:
  - Playwright 1.48.0 (E2E测试框架)
  - rspress 1.45.6 (文档站生成器)
  - @playwright/test (测试运行器和断言库)

**Storage**: N/A (E2E测试不需要持久化存储)
**Testing**: Playwright Test (E2E测试)
**Target Platform**: 浏览器环境 (Chromium桌面版和移动版)
**Project Type**: E2E测试套件 (针对Web应用的测试项目)
**Performance Goals**:
  - 完整测试套件执行时间 < 2分钟 (包括开发服务器启动)
  - 单个测试用例执行时间 < 10秒
  - 页面导航和加载时间 < 3秒

**Constraints**:
  - 测试必须在文档站开发服务器(localhost:3000)就绪后才能运行
  - 测试选择器必须基于rspress生成的实际DOM结构
  - 移动端测试使用Pixel 5设备模拟
  - CI环境使用单个worker串行运行,本地环境并行运行

**Scale/Scope**:
  - 覆盖10个核心页面的验证
  - 约15-20个测试用例
  - 5个用户场景分组 (页面访问、导航、代码示例、更新日志、响应式)
  - 2个测试项目 (桌面Chrome、移动Chrome)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Test-First Development (NON-NEGOTIABLE) ✅ PASS

**规则**: 所有功能实现前必须先编写测试,遵循 TDD 的 Red-Green-Refactor 循环。

**评估**: 本功能是重构E2E测试本身,不涉及业务逻辑实现。E2E测试的编写和重构本身就是测试优先的体现。测试用例基于功能需求规格(spec.md)中明确定义的验收场景编写。

**结论**: ✅ 符合原则 - 测试代码本身是目标交付物,无需额外的测试层。

### II. TypeScript 技术栈 ✅ PASS

**规则**: 使用 TypeScript 5.x+,启用严格模式,提供完整类型定义。

**评估**:
- 使用 TypeScript 5.6+ ✅
- Playwright Test 提供完整的类型支持 ✅
- E2E测试代码将包含明确的类型定义 ✅

**结论**: ✅ 符合原则 - 使用TypeScript编写测试,利用类型安全和IDE支持。

### III. 清晰的代码注释 ✅ PASS

**规则**: 所有公共函数和复杂逻辑必须有中文JSDoc注释。

**评估**:
- 测试用例将使用清晰的 describe/it 命名,明确描述测试场景 ✅
- Page Object 和辅助函数将包含 JSDoc 注释 ✅
- 复杂的选择器和断言逻辑将有行内注释 ✅

**结论**: ✅ 符合原则 - 测试代码将保持清晰的注释和可读性。

### IV. 清晰的代码结构 ✅ PASS

**规则**: 遵循单一职责原则,使用清晰的目录结构。

**评估**:
- 测试文件按功能场景分组 (页面访问、导航、代码示例等) ✅
- 使用 Page Object 模式封装页面交互逻辑 ✅
- 测试文件位于 `tests/e2e/` 目录,结构清晰 ✅

**结论**: ✅ 符合原则 - 测试结构遵循最佳实践,易于维护。

### V. 完整的测试覆盖 ⚠️ CONDITIONAL PASS

**规则**: 单元测试覆盖核心逻辑 ≥80%,包含集成测试和契约测试。

**评估**:
- 本功能是E2E测试重构,不涉及业务逻辑代码 N/A
- E2E测试本身是测试层,不需要为测试编写测试 N/A
- 测试覆盖文档站的所有核心页面和用户场景 ✅

**结论**: ⚠️ 条件通过 - E2E测试代码本身不需要单元测试覆盖,但测试覆盖范围需要全面。

### 总体评估: ✅ PASS - 可以继续到 Phase 0

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
apps/docs/                           # 文档站应用
├── docs/                            # 文档内容
│   ├── index.md                     # 首页
│   ├── guide/                       # 指南页面
│   │   ├── installation.md
│   │   ├── quick-start.md
│   │   ├── configuration.md
│   │   └── error-handling.md
│   ├── api/                         # API 文档页面
│   │   ├── stock/
│   │   │   ├── basic.md
│   │   │   └── daily.md
│   │   ├── calendar.md
│   │   └── daily-basic.md
│   └── changelog/                   # 更新日志
│       └── index.md
├── tests/                           # 测试目录
│   └── e2e/                         # E2E 测试 (本功能重构目标)
│       ├── pages/                   # Page Object 封装 (新增)
│       │   ├── base-page.ts         # 基础页面类
│       │   ├── home-page.ts         # 首页
│       │   ├── guide-page.ts        # 指南页基类
│       │   ├── api-page.ts          # API页基类
│       │   └── changelog-page.ts    # 更新日志页
│       ├── core-pages.spec.ts       # 核心页面可访问性测试 (重构)
│       ├── navigation.spec.ts       # 导航功能测试 (重构)
│       ├── code-examples.spec.ts    # 代码示例功能测试 (重构)
│       ├── changelog.spec.ts        # 更新日志测试 (重构)
│       └── responsive.spec.ts       # 响应式设计测试 (重构)
├── rspress.config.ts                # rspress 配置
└── playwright.config.ts             # Playwright 配置
```

**Structure Decision**:
- 测试文件按功能场景分组,每个spec文件对应一个用户故事
- 引入 Page Object 模式,将页面交互逻辑封装在独立的类中,提高代码复用性和可维护性
- 测试文件位于 `apps/docs/tests/e2e/`,与文档站项目紧密关联
- 移除现有过时测试文件(如search.spec.ts和quick-start.spec.ts),重新组织测试结构

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

无违规项需要记录。所有宪法原则均已满足或有合理的例外说明。

---

## Phase 1 后的 Constitution Check 重新评估

*在完成设计工件(research.md, data-model.md, contracts/, quickstart.md)后重新评估*

### 设计决策审查

#### 1. Page Object 模式设计

**决策**: 使用分层 Page Object 模式,通过 `BasePage` 基类封装通用功能

**宪法合规性**:
- ✅ **清晰的代码结构**: Page Object 模式遵循单一职责原则,每个页面类封装特定页面的交互逻辑
- ✅ **TypeScript 技术栈**: 所有接口和类都使用 TypeScript 严格类型定义
- ✅ **清晰的代码注释**: contracts/page-object-interface.ts 提供完整的 JSDoc 注释

#### 2. 测试配置设计

**决策**: 使用环境检测自动选择配置(本地/CI),提供验证函数确保配置完整性

**宪法合规性**:
- ✅ **清晰的代码结构**: 配置通过 TypeScript 接口定义,类型安全
- ✅ **TypeScript 技术栈**: test-config-schema.ts 使用严格类型定义和验证规则

#### 3. 选择器策略

**决策**: 优先使用语义化选择器,备用 data-testid

**宪法合规性**:
- ✅ **代码可维护性**: 语义化选择器基于 HTML5 标准,比 CSS 路径更稳定
- ✅ **清晰的代码注释**: research.md 详细说明选择器优先级和最佳实践

#### 4. 测试隔离性策略

**决策**: 每个测试独立运行,CI 环境启用重试机制

**宪法合规性**:
- ✅ **测试覆盖**: 测试独立性确保可靠性,重试机制减少假失败
- ✅ **清晰的代码结构**: 测试按用户场景分组,结构清晰

### 最终评估

所有设计决策均符合项目宪法要求:

1. **Test-First Development** ✅
   - E2E 测试本身是测试层,设计基于功能需求规格

2. **TypeScript 技术栈** ✅
   - 所有代码使用 TypeScript 5.6+
   - 接口契约提供完整类型定义
   - 配置包含验证函数

3. **清晰的代码注释** ✅
   - contracts/ 包含完整 JSDoc 注释
   - quickstart.md 提供详细使用指南
   - research.md 记录技术决策理由

4. **清晰的代码结构** ✅
   - Page Object 模式遵循最佳实践
   - 测试文件按场景分组
   - 目录结构清晰

5. **完整的测试覆盖** ✅
   - 覆盖 10 个核心页面
   - 5 个用户场景全覆盖
   - 桌面和移动端都测试

### 结论: ✅ 所有宪法原则满足,可以进入 Phase 2 (任务生成)
