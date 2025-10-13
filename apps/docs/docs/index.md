---
pageType: home
title: Tushare SDK - 快速、类型安全的 Tushare 数据接口 SDK
description: Tushare SDK 官方文档,提供完整的 TypeScript 类型定义,支持全文搜索、响应式设计,帮助开发者快速查阅 API 用法
keywords: [Tushare, SDK, TypeScript, 股票数据, 基金数据, API文档, 金融数据]

hero:
  name: Tushare SDK
  text: 快速、类型安全的 Tushare 数据接口 SDK
  tagline: 完整的 TypeScript 类型定义,开箱即用
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/quick-start
    - theme: alt
      text: API 文档
      link: /api/stock/basic
---

## 特性

### 🚀 TypeScript 支持

完整的类型定义,提供出色的开发体验和代码提示

### 📦 开箱即用

简单的 API 设计,无需复杂配置即可快速上手

### 🔍 全文搜索

快速查找所需的 API 文档,支持中文分词

### 📱 响应式设计

在任何设备上都能流畅使用,完美适配移动端

## 快速开始

```bash
# 安装
npm install @hestudy/tushare-sdk

# 或使用 pnpm
pnpm add @hestudy/tushare-sdk
```

```typescript
// 使用示例
import { TushareClient } from '@hestudy/tushare-sdk';

const client = new TushareClient({ token: 'YOUR_TOKEN' });

// 获取所有上市股票
const stocks = await client.getStockBasic({ list_status: 'L' });
console.log(stocks);
```

## 下一步

- [安装指南](/guide/installation) - 了解如何安装和配置 SDK
- [快速开始](/guide/quick-start) - 通过示例快速上手
- [API 文档](/api/stock/basic) - 查看完整的 API 参考文档
