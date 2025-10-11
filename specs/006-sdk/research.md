# Research: SDK文档站技术调研

**Feature**: SDK文档站  
**Date**: 2025-10-11  
**Status**: Complete

## 研究目标

本研究旨在解决以下技术问题:
1. rspress 的核心特性和最佳实践
2. 如何实现代码示例的一键复制功能
3. 如何组织 API 文档的分类结构
4. 如何实现搜索功能的优化
5. 如何支持多版本文档的扩展设计
6. 如何从 SDK 代码注释自动生成 API 文档

## 1. rspress 核心特性与最佳实践

### 决策: 使用 rspress 作为文档站生成器

**理由**:
- **极快的构建速度**: 基于 Rust 工具链(Rspack),构建速度比传统工具快 5-10 倍
- **内置全文搜索**: 自动生成搜索索引,无需额外配置搜索服务
- **MDX 支持**: 可在 Markdown 中使用 React 组件,灵活性高
- **完善的 i18n**: 内置国际化方案,未来支持多语言文档
- **SSG 优化**: 自动生成静态 HTML,SEO 友好,加载速度快
- **活跃维护**: 由字节跳动 Web Infra 团队维护,与 Rspack 生态深度集成

**备选方案**:
- **VitePress**: Vue 生态,但团队主要使用 React,学习成本高
- **Docusaurus**: 功能强大但配置复杂,构建速度较慢
- **Nextra**: 基于 Next.js,灵活但需要更多自定义工作

**最佳实践**:
1. **使用声明式配置**: 通过 `_meta.json` 管理导航和侧边栏,而非编程式配置
2. **模块化组件**: 将可复用的 UI 组件(如代码复制按钮)抽取为独立组件
3. **性能优化**: 
   - 使用代码分割减少首屏加载时间
   - 图片使用 WebP 格式并启用懒加载
   - 合理设置缓存策略
4. **SEO 优化**: 
   - 为每个页面设置合适的 meta 标签
   - 使用语义化的 HTML 结构
   - 生成 sitemap.xml

## 2. 代码示例一键复制功能

### 决策: 使用 rspress 内置的代码块功能 + 自定义复制按钮组件

**技术方案**:

rspress 默认为代码块提供复制按钮,但我们需要增强功能:

```tsx
// src/components/CodeCopy.tsx
import { useState } from 'react';

/**
 * 代码复制按钮组件
 * @param code - 要复制的代码内容
 * @param language - 代码语言类型
 */
export function CodeCopy({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} className="code-copy-btn">
      {copied ? '✓ 已复制' : '复制代码'}
    </button>
  );
}
```

**实现细节**:
1. 使用 `navigator.clipboard.writeText()` API 实现复制
2. 提供视觉反馈(复制成功后显示 "✓ 已复制")
3. 支持键盘快捷键(可选)
4. 处理复制失败的降级方案(使用 `document.execCommand` 作为 fallback)

**测试策略**:
- E2E 测试验证复制功能在不同浏览器中的兼容性
- 单元测试验证组件状态变化逻辑

## 3. API 文档分类结构

### 决策: 使用三级分类结构 + _meta.json 配置

**分类结构设计**:

```
docs/api/
├── _meta.json              # 一级分类配置
├── stock/                  # 股票数据
│   ├── _meta.json         # 二级分类配置
│   ├── basic.md           # 基础信息 API
│   ├── daily.md           # 日线数据 API
│   └── realtime.md        # 实时数据 API
├── fund/                   # 基金数据
│   ├── _meta.json
│   ├── basic.md
│   └── nav.md
└── finance/                # 财务数据
    ├── _meta.json
    ├── income.md
    └── balance.md
```

**_meta.json 配置示例**:

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

**理由**:
- **可扩展性**: 新增 API 只需添加 Markdown 文件和更新 `_meta.json`
- **清晰性**: 目录结构直观反映文档层级关系
- **维护性**: 分类配置集中管理,便于调整顺序和标题

## 4. 搜索功能优化

### 决策: 使用 rspress 内置搜索 + 自定义搜索结果排序

**rspress 内置搜索特性**:
- 自动生成全文搜索索引(基于 FlexSearch)
- 支持中文分词
- 高亮显示匹配关键词
- 搜索结果按相关性排序

**优化策略**:

1. **提升搜索准确性**:
   - 为重要页面设置更高的权重(通过 frontmatter 配置)
   - 优化页面标题和描述,提高搜索匹配度

```markdown
---
title: get_stock_basic - 获取股票基础信息
description: 获取沪深两市股票的基础信息,包括股票代码、名称、上市日期等
keywords: [股票, 基础信息, get_stock_basic]
---
```

2. **性能优化**:
   - 搜索索引预加载,减少首次搜索延迟
   - 使用防抖(debounce)减少搜索请求频率
   - 限制搜索结果数量(默认显示前 10 条)

3. **用户体验优化**:
   - 支持键盘导航(上下键选择结果,Enter 跳转)
   - 显示搜索结果的面包屑导航
   - 无结果时提供友好提示和建议

**测试目标**:
- 搜索响应时间 < 500ms (符合 SC-008 要求)
- 搜索准确率 > 90% (前 5 个结果包含目标内容)

## 5. 多版本文档扩展设计

### 决策: 预留多版本支持,初期实现单版本

**扩展点设计**:

虽然初期只支持单一版本,但需要在以下方面预留扩展能力:

1. **URL 路由设计**:
   ```
   当前: /api/stock/basic
   未来: /v1.0/api/stock/basic
         /v2.0/api/stock/basic
   ```

2. **文档存储结构**:
   ```
   docs/
   ├── v1.0/              # 版本 1.0 文档
   │   ├── api/
   │   └── guide/
   └── v2.0/              # 版本 2.0 文档 (未来)
       ├── api/
       └── guide/
   ```

3. **版本选择器接口**:
   - 在配置文件中预留 `versions` 配置项
   - 设计版本切换组件的 props 接口
   - 版本数据存储格式标准化

**rspress 多版本支持**:
- rspress 提供内置的多版本功能(通过 `multiVersion` 配置)
- 支持版本切换下拉菜单
- 自动处理版本间的路由跳转

**实施策略**:
- Phase 1: 实现单版本文档,使用默认路由
- Phase 2: 当需要支持多版本时,迁移到 `/v1.0/` 路由,添加版本选择器

## 6. API 文档自动生成方案

### 决策: 混合方式 - 结构化信息自动提取 + 人工编写内容

**技术方案**:

1. **自动提取部分** (使用 TypeDoc 或自定义脚本):
   - API 函数签名(参数类型、返回值类型)
   - JSDoc 注释中的参数说明
   - 类型定义

```typescript
/**
 * 获取股票基础信息
 * @param params - 查询参数
 * @param params.ts_code - 股票代码,如 '000001.SZ'
 * @param params.list_status - 上市状态: L-上市, D-退市, P-暂停上市
 * @returns 返回股票基础信息数组
 * @throws {ApiError} 当 API 调用失败时抛出
 */
export async function getStockBasic(params: StockBasicParams): Promise<StockBasic[]> {
  // 实现代码
}
```

2. **人工编写部分**:
   - 功能描述和使用场景
   - 完整的代码示例
   - 常见问题和注意事项
   - 相关 API 推荐

**工具选择**:
- **TypeDoc**: 成熟的 TypeScript 文档生成工具
- **@rspress/plugin-typedoc**: rspress 官方 TypeDoc 插件,可直接集成

**工作流程**:
1. 开发者在 SDK 代码中编写完整的 JSDoc 注释
2. 构建时运行 TypeDoc 生成 JSON 数据
3. 使用自定义脚本将 JSON 转换为 Markdown 模板
4. 技术写作人员在模板基础上补充内容
5. 最终文档提交到 `docs/api/` 目录

**优势**:
- 减少手动维护参数列表的工作量
- 确保文档与代码同步
- 保留人工编写的灵活性和质量

## 7. 测试策略

### E2E 测试 (Playwright)

**测试场景**:
1. **搜索功能** (`tests/e2e/search.spec.ts`):
   - 输入 API 名称,验证搜索结果正确
   - 点击搜索结果,验证跳转到正确页面
   - 搜索无结果时,验证提示信息

2. **导航功能** (`tests/e2e/navigation.spec.ts`):
   - 点击侧边栏分类,验证展开/收起
   - 点击 API 链接,验证页面加载
   - 验证面包屑导航显示正确

3. **代码复制** (`tests/e2e/code-copy.spec.ts`):
   - 点击复制按钮,验证代码复制到剪贴板
   - 验证复制成功提示显示

### 单元测试 (Vitest)

**测试组件**:
- `CodeCopy.tsx`: 测试复制逻辑和状态变化
- `ApiCard.tsx`: 测试卡片渲染和交互
- `VersionBadge.tsx`: 测试版本标签显示

### 性能测试

**测试指标**:
- 页面加载时间 (Lighthouse)
- 搜索响应时间 (自定义性能监控)
- 构建时间 (CI 环境测量)

## 总结

本研究解决了 SDK 文档站的所有关键技术问题:

1. ✅ **rspress 选型**: 确认使用 rspress,利用其极快构建速度和内置搜索
2. ✅ **代码复制**: 使用自定义 React 组件实现增强的复制功能
3. ✅ **分类结构**: 采用三级分类 + `_meta.json` 配置,易于扩展和维护
4. ✅ **搜索优化**: 利用 rspress 内置搜索,通过 frontmatter 和防抖优化性能
5. ✅ **多版本扩展**: 设计了 URL 路由、存储结构和版本选择器接口
6. ✅ **文档生成**: 混合方式 - TypeDoc 自动提取 + 人工编写内容

所有技术方案均符合项目宪法要求,可以进入 Phase 1 设计阶段。
