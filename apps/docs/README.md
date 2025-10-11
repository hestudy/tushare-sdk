# Tushare SDK 文档站

基于 rspress 构建的 Tushare SDK 官方文档站。

## 功能特性

- 🚀 **极快构建**: 基于 Rspack,构建速度提升 5-10 倍
- 🔍 **全文搜索**: 内置搜索功能,支持中文分词
- 📱 **响应式设计**: 完美适配桌面和移动设备
- 💻 **代码复制**: 一键复制代码示例
- 📚 **分类导航**: 清晰的 API 分类结构
- 🎨 **MDX 支持**: 在 Markdown 中使用 React 组件

## 开发指南

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:5173 查看文档站。

### 构建生产版本

```bash
pnpm build
```

构建产物输出到 `dist/` 目录。

### 本地预览

```bash
pnpm preview
```

## 测试

### 单元测试

```bash
pnpm test
```

### E2E 测试

```bash
pnpm test:e2e
```

### 测试覆盖率

```bash
pnpm test -- --coverage
```

## 项目结构

```
apps/docs/
├── docs/                    # 文档内容
│   ├── index.md            # 首页
│   ├── guide/              # 快速入门指南
│   ├── api/                # API 文档
│   └── changelog/          # 版本更新日志
├── src/                    # 自定义组件和配置
│   ├── components/         # React 组件
│   └── theme/              # 主题定制
├── tests/                  # 测试文件
│   ├── e2e/               # E2E 测试
│   └── unit/              # 单元测试
├── public/                 # 静态资源
├── rspress.config.ts      # rspress 配置
├── vitest.config.ts       # Vitest 配置
└── playwright.config.ts   # Playwright 配置
```

## 文档编写规范

### API 文档模板

每个 API 文档应包含以下部分:

1. **Frontmatter**: 元数据(标题、描述、关键词)
2. **函数签名**: TypeScript 类型签名
3. **参数说明**: 参数表格
4. **返回值**: 返回值类型和说明
5. **代码示例**: 完整的使用示例
6. **注意事项**: 重要提示和最佳实践

### 示例

```markdown
---
title: get_stock_basic - 获取股票基础信息
description: 获取沪深两市股票的基础信息
keywords: [股票, 基础信息, get_stock_basic]
type: api
---

# get_stock_basic

获取股票基础信息...
```

## 部署

文档站可以部署到以下平台:

- Vercel
- Netlify
- GitHub Pages
- 任何支持静态站点的托管服务

## 参考资源

- [rspress 官方文档](https://rspress.dev)
- [MDX 文档](https://mdxjs.com)
- [Playwright 文档](https://playwright.dev)
- [Vitest 文档](https://vitest.dev)

## License

MIT
