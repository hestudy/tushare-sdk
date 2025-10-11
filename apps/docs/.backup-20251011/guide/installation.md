---
title: 安装 Tushare SDK
description: 学习如何安装 Tushare SDK 到你的项目中
---

# 安装

本指南将帮助你在项目中安装 Tushare SDK。

## 系统要求

在开始之前,请确保你的开发环境满足以下要求:

- **Node.js**: 18.0.0 或更高版本
- **包管理器**: npm 9.0.0+ 或 pnpm 8.0.0+ 或 yarn 1.22.0+
- **TypeScript** (可选): 5.0.0 或更高版本

## 使用 npm 安装

```bash
npm install @tushare/sdk
```

## 使用 pnpm 安装

```bash
pnpm add @tushare/sdk
```

## 使用 yarn 安装

```bash
yarn add @tushare/sdk
```

## 验证安装

安装完成后,你可以通过以下方式验证安装是否成功:

```typescript
import { getStockBasic } from '@tushare/sdk';

console.log('Tushare SDK 安装成功!');
```

如果没有报错,说明 SDK 已经成功安装。

## TypeScript 支持

Tushare SDK 使用 TypeScript 编写,提供完整的类型定义。如果你的项目使用 TypeScript,无需额外安装类型定义包。

### tsconfig.json 配置建议

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

## 常见问题

### Q: 安装时出现权限错误怎么办?

A: 如果使用 npm 安装时遇到权限错误,可以尝试:

```bash
# 使用 --legacy-peer-deps 标志
npm install @tushare/sdk --legacy-peer-deps

# 或者使用 sudo (不推荐)
sudo npm install @tushare/sdk
```

推荐使用 pnpm 或配置 npm 的全局安装路径。

### Q: 如何更新到最新版本?

A: 使用以下命令更新到最新版本:

```bash
# npm
npm update @tushare/sdk

# pnpm
pnpm update @tushare/sdk

# yarn
yarn upgrade @tushare/sdk
```

### Q: 如何安装特定版本?

A: 在包名后指定版本号:

```bash
npm install @tushare/sdk@1.2.0
```

## 下一步

- [快速开始](/guide/quick-start) - 学习如何使用 SDK
- [配置](/guide/configuration) - 配置 API Token 和其他选项
- [API 文档](/api/stock/basic) - 查看完整的 API 文档
