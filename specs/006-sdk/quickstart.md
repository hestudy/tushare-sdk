# Quick Start: SDK文档站开发

**Feature**: SDK文档站  
**Date**: 2025-10-11  
**Status**: Complete

## 概述

本文档提供 SDK 文档站的快速开发指南,帮助开发者快速搭建和运行文档站。

## 前置要求

- Node.js 18+ LTS
- pnpm 8+ (推荐) 或 npm 9+
- Git
- 代码编辑器 (推荐 VS Code)

## 快速开始

### 1. 创建文档站项目

在项目根目录的 `apps/` 下创建文档站应用:

```bash
# 进入 apps 目录
cd apps

# 使用 rspress CLI 创建项目
npx @rspress/cli init docs

# 选择以下选项:
# - Project name: docs
# - Template: Default
# - Package manager: pnpm
```

### 2. 安装依赖

```bash
cd docs
pnpm install
```

### 3. 项目结构调整

调整项目结构以符合设计规范:

```bash
# 创建必要的目录
mkdir -p docs/api/stock docs/api/fund docs/api/finance
mkdir -p docs/guide docs/changelog
mkdir -p src/components src/theme
mkdir -p tests/e2e tests/unit/components
mkdir -p public
```

### 4. 配置 rspress

编辑 `rspress.config.ts`:

```typescript
import { defineConfig } from '@rspress/core';

export default defineConfig({
  root: 'docs',
  title: 'Tushare SDK',
  description: 'Tushare SDK 官方文档 - 快速查阅 API 用法',
  icon: '/logo.svg',
  logo: {
    light: '/logo.svg',
    dark: '/logo-dark.svg',
  },
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/installation' },
      { text: 'API 文档', link: '/api/stock/basic' },
      { text: '更新日志', link: '/changelog/' },
    ],
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/your-org/tushare-sdk',
      },
    ],
    lastUpdated: true,
    outline: {
      level: [2, 3],
      title: '目录',
    },
  },
  markdown: {
    showLineNumbers: true,
  },
});
```

### 5. 创建首页

编辑 `docs/index.md`:

```markdown
---
pageType: home
---

# Tushare SDK

快速、类型安全的 Tushare 数据接口 SDK

## 特性

- 🚀 **TypeScript 支持** - 完整的类型定义,提供出色的开发体验
- 📦 **开箱即用** - 简单的 API 设计,快速上手
- 🔍 **全文搜索** - 快速查找所需的 API 文档
- 📱 **响应式设计** - 在任何设备上都能流畅使用

## 快速开始

```bash
# 安装
npm install @tushare/sdk

# 使用
import { getStockBasic } from '@tushare/sdk';

const stocks = await getStockBasic({ list_status: 'L' });
console.log(stocks);
```

## 下一步

- [安装指南](/guide/installation)
- [快速开始](/guide/quick-start)
- [API 文档](/api/stock/basic)
```

### 6. 创建示例 API 文档

创建 `docs/api/stock/basic.md`:

```markdown
---
title: get_stock_basic - 获取股票基础信息
description: 获取沪深两市股票的基础信息,包括股票代码、名称、上市日期等
keywords: [股票, 基础信息, get_stock_basic]
type: api
---

# get_stock_basic

获取沪深两市股票的基础信息。

## 函数签名

```typescript
async function getStockBasic(params?: StockBasicParams): Promise<StockBasic[]>
```

## 参数

| 参数名 | 类型 | 必填 | 描述 | 默认值 | 示例 |
|--------|------|------|------|--------|------|
| params.ts_code | string | 否 | 股票代码 | - | '000001.SZ' |
| params.list_status | string | 否 | 上市状态 | 'L' | 'L', 'D', 'P' |

## 返回值

**类型**: `Promise<StockBasic[]>`

返回股票基础信息数组,每个对象包含:
- `ts_code`: 股票代码
- `name`: 股票名称
- `list_date`: 上市日期

## 代码示例

### 获取所有上市股票

```typescript
import { getStockBasic } from '@tushare/sdk';

const stocks = await getStockBasic({ list_status: 'L' });
console.log(stocks);
```

### 获取指定股票信息

```typescript
const stock = await getStockBasic({ ts_code: '000001.SZ' });
console.log(stock[0].name); // 平安银行
```

## 注意事项

- 不传参数时返回所有上市股票,数据量较大
- 建议使用 `list_status` 参数过滤
```

### 7. 配置导航

创建 `docs/api/_meta.json`:

```json
{
  "stock": {
    "title": "股票数据",
    "order": 1
  },
  "fund": {
    "title": "基金数据",
    "order": 2
  },
  "finance": {
    "title": "财务数据",
    "order": 3
  }
}
```

创建 `docs/api/stock/_meta.json`:

```json
{
  "basic": {
    "title": "基础信息",
    "order": 1
  },
  "daily": {
    "title": "日线数据",
    "order": 2
  },
  "realtime": {
    "title": "实时数据",
    "order": 3
  }
}
```

### 8. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:5173 查看文档站。

### 9. 构建生产版本

```bash
pnpm build
```

构建产物输出到 `dist/` 目录。

### 10. 本地预览

```bash
pnpm preview
```

---

## 开发自定义组件

### 创建代码复制组件

创建 `src/components/CodeCopy.tsx`:

```typescript
import { useState } from 'react';
import './CodeCopy.css';

/**
 * 代码复制按钮组件
 * @param code - 要复制的代码内容
 * @param language - 代码语言类型
 */
export function CodeCopy({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="code-copy-btn"
      data-testid="code-copy-btn"
    >
      {copied ? '✓ 已复制' : '复制代码'}
    </button>
  );
}
```

创建 `src/components/CodeCopy.css`:

```css
.code-copy-btn {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.code-copy-btn:hover {
  background-color: #2563eb;
}

.code-copy-btn:active {
  background-color: #1d4ed8;
}
```

### 在 MDX 中使用组件

在任何 `.mdx` 文件中导入并使用:

```mdx
import { CodeCopy } from '@/components/CodeCopy';

# API 示例

<CodeCopy code="const x = 1;" language="typescript" />
```

---

## 配置测试环境

### 安装测试依赖

```bash
pnpm add -D vitest @vitest/ui @testing-library/react @testing-library/user-event
pnpm add -D @playwright/test
```

### 配置 Vitest

创建 `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/'],
    },
  },
});
```

### 配置 Playwright

```bash
npx playwright install
```

创建 `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 添加测试脚本

在 `package.json` 中添加:

```json
{
  "scripts": {
    "dev": "rspress dev",
    "build": "rspress build",
    "preview": "rspress preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## 集成到 Monorepo

### 更新根 package.json

在项目根目录的 `package.json` 中添加文档站脚本:

```json
{
  "scripts": {
    "docs:dev": "pnpm --filter docs dev",
    "docs:build": "pnpm --filter docs build",
    "docs:preview": "pnpm --filter docs preview",
    "docs:test": "pnpm --filter docs test",
    "docs:test:e2e": "pnpm --filter docs test:e2e"
  }
}
```

### 更新 turbo.json

如果使用 Turborepo,在 `turbo.json` 中添加:

```json
{
  "pipeline": {
    "docs:dev": {
      "cache": false,
      "persistent": true
    },
    "docs:build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "docs:test": {
      "dependsOn": ["^build"]
    },
    "docs:test:e2e": {
      "dependsOn": ["^build"]
    }
  }
}
```

---

## 部署到生产环境

### 部署到 Vercel

1. 在项目根目录创建 `vercel.json`:

```json
{
  "buildCommand": "pnpm docs:build",
  "outputDirectory": "apps/docs/dist",
  "framework": null
}
```

2. 连接 GitHub 仓库到 Vercel
3. 配置环境变量(如需要)
4. 部署

### 部署到 Netlify

1. 在项目根目录创建 `netlify.toml`:

```toml
[build]
  command = "pnpm docs:build"
  publish = "apps/docs/dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. 连接 GitHub 仓库到 Netlify
3. 部署

### 部署到 GitHub Pages

在 `.github/workflows/deploy-docs.yml`:

```yaml
name: Deploy Docs

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm docs:build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./apps/docs/dist
```

---

## 常见问题

### Q: 如何自定义主题颜色?

A: 在 `src/theme/index.ts` 中配置:

```typescript
export default {
  colors: {
    primary: '#3b82f6',
    // 其他颜色配置
  },
};
```

### Q: 如何添加自定义插件?

A: 在 `rspress.config.ts` 中添加:

```typescript
import customPlugin from './plugins/custom-plugin';

export default defineConfig({
  plugins: [customPlugin()],
});
```

### Q: 如何优化搜索性能?

A: rspress 的搜索是自动优化的,但可以通过以下方式进一步优化:
- 为重要页面设置更高的权重(通过 frontmatter)
- 优化页面标题和描述
- 合理使用关键词

---

## 下一步

- 阅读 [data-model.md](./data-model.md) 了解数据模型设计
- 阅读 [contracts/](./contracts/) 了解 API 契约
- 查看 [research.md](./research.md) 了解技术选型和最佳实践
- 开始编写测试(参考 [contracts/test-scenarios.md](./contracts/test-scenarios.md))

---

## 参考资源

- [rspress 官方文档](https://rspress.dev)
- [MDX 文档](https://mdxjs.com)
- [Playwright 文档](https://playwright.dev)
- [Vitest 文档](https://vitest.dev)
