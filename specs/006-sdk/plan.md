# Implementation Plan: SDK文档站

**Branch**: `006-sdk` | **Date**: 2025-10-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-sdk/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

使用 rspress 构建 SDK 文档站,为开发者提供快速查阅 API 用法的平台。rspress 是基于 Rsbuild 和 MDX 的静态站点生成器,提供极快的构建速度、内置全文搜索、MDX 内容编写支持和完善的 i18n 方案。文档站将支持 API 搜索、分类导航、代码示例复制、快速入门指南和版本更新日志等核心功能。

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.x+ / Node.js 18+ LTS  
**Primary Dependencies**: rspress (静态站点生成器), @rspress/plugin-* (官方插件)  
**Storage**: 静态文件(Markdown/MDX 文档源文件)  
**Testing**: Vitest (单元测试), Playwright (E2E 测试)  
**Target Platform**: 静态站点托管服务 (Vercel, Netlify, GitHub Pages 等)
**Project Type**: web (静态文档站点)  
**Performance Goals**: 页面加载时间 <2s, 搜索响应时间 <500ms, 构建时间 <30s (100个文档页面)  
**Constraints**: 支持至少 100 个并发用户, 移动端响应式设计, SEO 友好  
**Scale/Scope**: 初期支持约 50-100 个 API 文档页面, 单一版本, 预留多版本扩展能力

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Test-First Development ✅
- **状态**: 符合
- **说明**: 文档站开发将遵循 TDD 流程,先编写 E2E 测试验证核心用户场景(搜索、导航、代码复制等),再实现功能
- **测试策略**: 
  - E2E 测试: 使用 Playwright 测试用户交互流程
  - 单元测试: 使用 Vitest 测试自定义组件和工具函数
  - 视觉回归测试: 验证页面渲染正确性

### II. TypeScript 技术栈 ✅
- **状态**: 符合
- **说明**: rspress 本身基于 TypeScript 构建,项目配置、自定义组件、插件开发都将使用 TypeScript
- **类型安全**: 
  - 启用 `strict: true` 模式
  - 为所有自定义组件和配置提供完整类型定义
  - 避免使用 `any` 类型

### III. 清晰的代码注释 ✅
- **状态**: 符合
- **说明**: 所有自定义组件、配置文件、工具函数都将提供完整的 JSDoc 注释
- **文档要求**:
  - 自定义 React 组件必须注释 props 和用途
  - 配置文件必须注释每个配置项的作用
  - 复杂的 MDX 插件逻辑必须有行内注释

### IV. 清晰的代码结构 ✅
- **状态**: 符合
- **说明**: 遵循 rspress 推荐的项目结构,清晰组织文档内容、自定义组件和配置
- **目录结构**: 见下方 Project Structure 部分

### V. 完整的测试覆盖 ✅
- **状态**: 符合
- **说明**: 
  - E2E 测试覆盖所有核心用户场景 (P1-P4 用户故事)
  - 单元测试覆盖自定义组件和工具函数,目标覆盖率 ≥ 80%
  - 测试必须独立、可重复、快速执行

### 合规性总结
✅ **所有宪法原则均符合要求,无需豁免或特殊处理**

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
apps/
└── docs/                        # 文档站应用 (新建)
    ├── docs/                    # 文档内容目录
    │   ├── index.md            # 首页
    │   ├── guide/              # 快速入门指南
    │   │   ├── _meta.json      # 导航配置
    │   │   ├── installation.md # 安装指南
    │   │   ├── quick-start.md  # 快速开始
    │   │   └── configuration.md # 配置说明
    │   ├── api/                # API 文档
    │   │   ├── _meta.json      # API 分类配置
    │   │   ├── stock/          # 股票数据 API
    │   │   ├── fund/           # 基金数据 API
    │   │   └── finance/        # 财务数据 API
    │   └── changelog/          # 版本更新日志
    │       └── index.md
    ├── src/                    # 自定义组件和配置
    │   ├── components/         # 自定义 React 组件
    │   │   ├── CodeCopy.tsx   # 代码复制按钮组件
    │   │   ├── ApiCard.tsx    # API 卡片组件
    │   │   └── VersionBadge.tsx # 版本标签组件
    │   └── theme/              # 主题定制
    │       └── index.ts        # 主题配置入口
    ├── public/                 # 静态资源
    │   ├── logo.svg
    │   └── favicon.ico
    ├── tests/                  # 测试文件
    │   ├── e2e/               # E2E 测试
    │   │   ├── search.spec.ts # 搜索功能测试
    │   │   ├── navigation.spec.ts # 导航测试
    │   │   └── code-copy.spec.ts # 代码复制测试
    │   └── unit/              # 单元测试
    │       └── components/    # 组件单元测试
    ├── rspress.config.ts      # rspress 配置文件
    ├── package.json
    ├── tsconfig.json
    └── README.md

packages/tushare-sdk/           # 现有 SDK 包 (已存在)
└── src/
    └── [现有代码,需要添加 JSDoc 注释以支持文档自动生成]
```

**Structure Decision**: 
- 采用 **Web 应用结构**,在 `apps/docs/` 下创建独立的文档站应用
- 遵循 rspress 推荐的项目结构,使用 `docs/` 目录存放 Markdown/MDX 文档
- 使用声明式配置 (`_meta.json`) 管理导航和侧边栏,保持配置简洁
- 自定义组件放在 `src/components/` 下,便于复用和测试
- 测试文件独立组织,E2E 测试和单元测试分离

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

N/A - 所有宪法原则均符合要求,无需复杂性追踪。
