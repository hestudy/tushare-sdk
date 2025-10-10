# Research: Node 应用演示示例

**Feature**: 003-apps-node-sdk  
**Date**: 2025-10-10  
**Status**: Complete

## Overview

本文档记录了为演示应用开发所进行的技术研究和决策。演示应用的目标是验证 Tushare SDK 在真实 Node.js 环境中的功能,并为开发者提供集成参考。

## Research Areas

### 1. pnpm Workspace 配置与本地包引用

**研究任务**: 如何在 pnpm workspace 中正确引用本地 SDK 包

**决策**: 使用 workspace 协议引用本地包
- **方案**: 在演示应用的 `package.json` 中使用 `"@hestudy/tushare-sdk": "workspace:*"` 引用本地 SDK
- **理由**: 
  - workspace 协议确保始终使用本地开发版本,而非外部发布版本
  - 支持热更新,SDK 代码变更后演示应用可立即使用
  - 符合 monorepo 最佳实践
- **配置要求**:
  - 需要更新根目录 `pnpm-workspace.yaml`,添加 `'apps/*'` 到 packages 列表
  - 演示应用需要有独立的 `package.json` 和 `tsconfig.json`

**替代方案考虑**:
- ❌ 使用相对路径引用: 不符合 npm 包管理规范,会导致类型解析问题
- ❌ 使用 `file:` 协议: 会创建符号链接,在某些环境下可能出现问题
- ✅ 使用 `workspace:*`: 最佳实践,类型安全,开发体验好

---

### 2. 环境变量管理最佳实践

**研究任务**: 如何安全地管理 Tushare API Token

**决策**: 使用 dotenv 包 + .env 文件
- **方案**: 
  - 使用 `dotenv` 包加载环境变量
  - 提供 `.env.example` 示例文件(不包含真实 token)
  - `.env` 文件添加到 `.gitignore`,防止泄露
  - 支持从环境变量或 `.env` 文件读取配置
- **理由**:
  - dotenv 是 Node.js 生态标准方案,开发者熟悉
  - 支持本地开发和 CI 环境两种配置方式
  - 安全性高,不会将敏感信息提交到版本控制

**配置示例**:
```typescript
// config.ts
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  tushareToken: process.env.TUSHARE_TOKEN || '',
  apiBaseUrl: process.env.TUSHARE_API_URL || 'https://api.tushare.pro',
};
```

**替代方案考虑**:
- ❌ 硬编码 token: 安全风险高,不可接受
- ❌ 使用配置文件: 容易误提交敏感信息
- ✅ dotenv + 环境变量: 安全、灵活、标准

---

### 3. 演示应用的 API 调用示例选择

**研究任务**: 选择哪些 API 作为演示示例

**决策**: 选择 3 个代表性 API
1. **股票列表 (stock_basic)**: 
   - 最基础的 API,无需复杂参数
   - 返回数据量适中,适合演示
   - 对应 SDK 的 `getStockBasic()` 方法
   
2. **日线数据 (daily)**: 
   - 需要参数(股票代码、日期范围)
   - 演示参数传递和数据过滤
   - 对应 SDK 的 `getDailyQuote()` 方法
   
3. **交易日历 (trade_cal)**:
   - 演示日期相关 API
   - 数据结构简单,易于展示
   - 对应 SDK 的 `getTradeCalendar()` 方法

**理由**:
- 覆盖不同类型的 API(基础数据、行情数据、日历数据)
- 参数复杂度递增,展示不同使用场景
- 都是 SDK 已实现的核心 API

**替代方案考虑**:
- ❌ 只演示一个 API: 无法展示 SDK 的多样性
- ❌ 演示过多 API (>5个): 代码冗长,维护成本高
- ✅ 3 个代表性 API: 平衡演示效果和代码简洁性

---

### 4. 错误处理演示场景

**研究任务**: 演示哪些错误处理场景

**决策**: 演示 3 种核心错误场景
1. **认证错误**: 使用无效或空 token
   - 触发方式: 不配置 `TUSHARE_TOKEN` 环境变量
   - 预期错误: `ApiError` with `ApiErrorType.AUTH_ERROR`
   
2. **参数错误**: 使用无效的 API 参数
   - 触发方式: 传入不存在的股票代码或无效日期格式
   - 预期错误: `ApiError` with `ApiErrorType.PARAM_ERROR`
   
3. **网络错误**: 模拟网络不可用
   - 触发方式: 使用错误的 API 基础 URL
   - 预期错误: `ApiError` with `ApiErrorType.NETWORK_ERROR`

**理由**:
- 覆盖最常见的错误类型
- 帮助开发者理解如何正确处理 SDK 错误
- 每种错误都有明确的触发方式和处理建议

**错误处理模式**:
```typescript
try {
  const result = await client.getStockBasic();
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.type) {
      case ApiErrorType.AUTH_ERROR:
        console.error('认证失败,请检查 API Token');
        break;
      case ApiErrorType.PARAM_ERROR:
        console.error('参数错误:', error.message);
        break;
      case ApiErrorType.NETWORK_ERROR:
        console.error('网络错误,请检查网络连接');
        break;
    }
  }
}
```

---

### 5. 测试框架选择

**研究任务**: 选择与主项目一致的测试框架

**决策**: 使用 Vitest
- **方案**: 使用 Vitest 作为测试框架,与 SDK 主包保持一致
- **理由**:
  - SDK 主包已使用 Vitest (见 `packages/tushare-sdk/package.json`)
  - Vitest 对 TypeScript 和 ESM 支持更好
  - 性能优于 Jest,测试执行更快
  - 配置简单,与 Vite 生态集成好
- **测试类型**:
  - 单元测试: 测试配置加载、错误处理逻辑
  - 集成测试: 测试 SDK 初始化和 API 调用(使用 mock)

**配置要求**:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/coverage-v8": "^1.0.0"
  }
}
```

**替代方案考虑**:
- ❌ Jest: 虽然流行,但配置复杂,对 ESM 支持不如 Vitest
- ✅ Vitest: 与主项目一致,性能好,配置简单

---

### 6. TypeScript 配置

**研究任务**: 确定演示应用的 TypeScript 配置

**决策**: 继承根配置,启用严格模式
- **方案**: 
  - 继承根目录的 `tsconfig.base.json`
  - 启用 `strict: true` 和所有严格检查
  - 配置路径映射以正确解析 SDK 类型
- **理由**:
  - 符合项目宪法要求(TypeScript 严格模式)
  - 确保类型安全,减少运行时错误
  - 与主项目配置保持一致

**配置示例**:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "target": "ES2020",
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

---

### 7. 构建和运行方式

**研究任务**: 确定演示应用的构建和运行方式

**决策**: 使用 tsx 直接运行 TypeScript
- **方案**: 
  - 开发环境: 使用 `tsx` 直接运行 `.ts` 文件,无需编译
  - 生产环境: 使用 `tsc` 编译为 JavaScript
  - 提供两种运行方式: `pnpm dev` (开发) 和 `pnpm start` (生产)
- **理由**:
  - tsx 提供快速的开发体验,支持热重载
  - 编译后的 JavaScript 可在任何 Node.js 环境运行
  - 符合 TypeScript 项目最佳实践

**脚本配置**:
```json
{
  "scripts": {
    "dev": "tsx src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest run",
    "type-check": "tsc --noEmit"
  }
}
```

**依赖**:
```json
{
  "dependencies": {
    "@hestudy/tushare-sdk": "workspace:*",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "tsx": "^4.7.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0",
    "@types/node": "^20.10.0"
  }
}
```

---

## Technology Stack Summary

基于以上研究,演示应用的技术栈确定如下:

| 技术领域 | 选择 | 版本 | 理由 |
|---------|------|------|------|
| 语言 | TypeScript | 5.3+ | 类型安全,符合宪法要求 |
| 运行时 | Node.js | 18+ LTS | 与主项目保持一致 |
| 包管理 | pnpm | 8.10+ | Workspace 支持,性能好 |
| 测试框架 | Vitest | 1.0+ | 与 SDK 主包一致 |
| 环境变量 | dotenv | 16.3+ | 标准方案,安全可靠 |
| 开发工具 | tsx | 4.7+ | 快速开发体验 |
| SDK 引用 | workspace:* | - | 本地开发版本 |

## Implementation Readiness

✅ **所有技术决策已完成,可以进入 Phase 1 设计阶段**

### 已解决的问题
1. ✅ pnpm workspace 配置方式
2. ✅ 环境变量管理方案
3. ✅ API 调用示例选择
4. ✅ 错误处理演示场景
5. ✅ 测试框架选择
6. ✅ TypeScript 配置
7. ✅ 构建和运行方式

### 无需进一步研究的项
- 无需研究新的技术栈,全部使用现有技术
- 无需研究外部 API,使用已实现的 SDK
- 无需研究复杂的架构模式,演示应用结构简单

## Next Steps

进入 **Phase 1: Design & Contracts**,生成以下文档:
1. `data-model.md` - 数据模型定义
2. `contracts/` - API 契约(如适用)
3. `quickstart.md` - 快速开始指南
