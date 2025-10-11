# Data Model: SDK文档站

**Feature**: SDK文档站  
**Date**: 2025-10-11  
**Status**: Complete

## 概述

本文档定义 SDK 文档站的核心数据模型。由于文档站是静态生成的,大部分数据以 Markdown/MDX 文件和配置文件形式存储,而非传统的数据库模型。

## 核心实体

### 1. DocumentPage (文档页面)

**描述**: 表示单个文档页面,可以是 API 文档、指南或更新日志。

**存储形式**: Markdown/MDX 文件 + Frontmatter 元数据

**数据结构**:

```typescript
/**
 * 文档页面元数据
 */
interface DocumentPageMeta {
  /** 页面标题 */
  title: string;
  
  /** 页面描述,用于 SEO 和搜索 */
  description: string;
  
  /** 关键词列表,用于搜索优化 */
  keywords?: string[];
  
  /** 页面类型 */
  type: 'api' | 'guide' | 'changelog';
  
  /** 排序权重,数字越大越靠前 */
  order?: number;
  
  /** 是否在导航中隐藏 */
  hidden?: boolean;
  
  /** 最后更新日期 */
  lastUpdated?: string;
  
  /** 相关页面链接 */
  related?: string[];
}
```

**示例** (`docs/api/stock/basic.md`):

```markdown
---
title: get_stock_basic - 获取股票基础信息
description: 获取沪深两市股票的基础信息,包括股票代码、名称、上市日期等
keywords: [股票, 基础信息, get_stock_basic, 股票列表]
type: api
order: 1
related: ['/api/stock/daily', '/api/stock/realtime']
---

# get_stock_basic

获取股票基础信息...
```

**验证规则**:
- `title` 必填,长度 5-100 字符
- `description` 必填,长度 10-200 字符
- `type` 必须是枚举值之一
- `keywords` 数组长度不超过 10 个

---

### 2. ApiDocumentation (API 文档)

**描述**: 继承自 DocumentPage,专门用于 API 文档,包含额外的 API 特定信息。

**数据结构**:

```typescript
/**
 * API 文档内容结构
 */
interface ApiDocumentation extends DocumentPageMeta {
  type: 'api';
  
  /** API 函数签名 */
  signature: ApiSignature;
  
  /** 参数列表 */
  parameters: ApiParameter[];
  
  /** 返回值说明 */
  returns: ApiReturn;
  
  /** 代码示例列表 */
  examples: CodeExample[];
  
  /** 可能抛出的异常 */
  throws?: ApiException[];
  
  /** 注意事项 */
  notes?: string[];
}

/**
 * API 函数签名
 */
interface ApiSignature {
  /** 函数名 */
  name: string;
  
  /** 是否异步函数 */
  async: boolean;
  
  /** TypeScript 类型签名 */
  typeSignature: string;
}

/**
 * API 参数
 */
interface ApiParameter {
  /** 参数名 */
  name: string;
  
  /** 参数类型 */
  type: string;
  
  /** 是否必填 */
  required: boolean;
  
  /** 参数描述 */
  description: string;
  
  /** 默认值 */
  default?: string;
  
  /** 示例值 */
  example?: string;
}

/**
 * API 返回值
 */
interface ApiReturn {
  /** 返回值类型 */
  type: string;
  
  /** 返回值描述 */
  description: string;
  
  /** 返回值示例 */
  example?: string;
}

/**
 * 代码示例
 */
interface CodeExample {
  /** 示例标题 */
  title: string;
  
  /** 代码语言 */
  language: 'typescript' | 'javascript';
  
  /** 代码内容 */
  code: string;
  
  /** 示例说明 */
  description?: string;
}

/**
 * API 异常
 */
interface ApiException {
  /** 异常类型 */
  type: string;
  
  /** 异常描述 */
  description: string;
  
  /** 触发条件 */
  condition: string;
}
```

**示例** (`docs/api/stock/basic.md`):

```markdown
---
title: get_stock_basic - 获取股票基础信息
description: 获取沪深两市股票的基础信息
type: api
---

# get_stock_basic

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

## 异常

| 异常类型 | 描述 | 触发条件 |
|----------|------|----------|
| ApiError | API 调用失败 | 网络错误或服务端错误 |
| ValidationError | 参数验证失败 | 参数格式不正确 |

## 注意事项

- 不传参数时返回所有上市股票,数据量较大
- 建议使用 `list_status` 参数过滤
```

---

### 3. NavigationCategory (导航分类)

**描述**: 表示文档的分类结构,用于生成侧边栏导航。

**存储形式**: `_meta.json` 配置文件

**数据结构**:

```typescript
/**
 * 导航分类配置
 */
interface NavigationMeta {
  /** 分类 ID (对应目录名或文件名) */
  [key: string]: NavigationItem;
}

/**
 * 导航项
 */
interface NavigationItem {
  /** 显示标题 */
  title: string;
  
  /** 排序权重 */
  order?: number;
  
  /** 是否折叠 */
  collapsed?: boolean;
  
  /** 外部链接 */
  link?: string;
  
  /** 图标 (可选) */
  icon?: string;
}
```

**示例** (`docs/api/_meta.json`):

```json
{
  "stock": {
    "title": "股票数据",
    "order": 1,
    "collapsed": false
  },
  "fund": {
    "title": "基金数据",
    "order": 2,
    "collapsed": false
  },
  "finance": {
    "title": "财务数据",
    "order": 3,
    "collapsed": false
  }
}
```

**验证规则**:
- 每个分类必须有 `title` 字段
- `order` 必须是正整数
- 分类 ID 必须与目录名或文件名匹配

---

### 4. ChangelogEntry (更新日志条目)

**描述**: 表示 SDK 的某个版本更新记录。

**存储形式**: Markdown 文件,使用特定格式

**数据结构**:

```typescript
/**
 * 更新日志条目
 */
interface ChangelogEntry {
  /** 版本号 */
  version: string;
  
  /** 发布日期 */
  date: string;
  
  /** 更新类型分组 */
  changes: {
    /** 新增功能 */
    features?: ChangeItem[];
    
    /** Bug 修复 */
    fixes?: ChangeItem[];
    
    /** 破坏性变更 */
    breaking?: ChangeItem[];
    
    /** 性能优化 */
    performance?: ChangeItem[];
    
    /** 文档更新 */
    docs?: ChangeItem[];
  };
}

/**
 * 更新项
 */
interface ChangeItem {
  /** 更新描述 */
  description: string;
  
  /** 相关 PR 或 Issue 链接 */
  link?: string;
  
  /** 影响范围 */
  scope?: string;
}
```

**示例** (`docs/changelog/index.md`):

```markdown
# 更新日志

## v1.2.0 (2025-10-01)

### 🎉 新增功能

- 新增 `getFundBasic` API,支持获取基金基础信息 ([#123](https://github.com/...))
- 新增搜索功能,支持按 API 名称和描述搜索

### 🐛 Bug 修复

- 修复 `getStockDaily` 在某些情况下返回数据不完整的问题 ([#125](https://github.com/...))
- 修复文档站在移动端显示异常的问题

### ⚠️ 破坏性变更

- `getStockBasic` 的 `list_status` 参数默认值从 `undefined` 改为 `'L'`
- **迁移指南**: 如需获取所有状态的股票,请显式传入 `list_status: undefined`

## v1.1.0 (2025-09-15)

...
```

---

### 5. SearchIndex (搜索索引)

**描述**: 用于全文搜索的索引数据,由 rspress 自动生成。

**存储形式**: 构建时生成的 JSON 文件

**数据结构**:

```typescript
/**
 * 搜索索引项
 */
interface SearchIndexItem {
  /** 页面 ID */
  id: string;
  
  /** 页面标题 */
  title: string;
  
  /** 页面描述 */
  description: string;
  
  /** 页面内容 (分词后) */
  content: string[];
  
  /** 页面路径 */
  path: string;
  
  /** 搜索权重 */
  weight: number;
  
  /** 关键词 */
  keywords: string[];
}
```

**说明**:
- 由 rspress 自动生成,开发者无需手动维护
- 支持中文分词
- 搜索时按权重和相关性排序

---

## 数据关系

```
NavigationCategory (分类)
    │
    ├── 1:N ──> DocumentPage (文档页面)
    │               │
    │               ├── 继承 ──> ApiDocumentation (API 文档)
    │               │               │
    │               │               └── 1:N ──> CodeExample (代码示例)
    │               │
    │               └── 继承 ──> ChangelogEntry (更新日志)
    │
    └── 1:N ──> SearchIndexItem (搜索索引)
```

**关系说明**:
1. 一个分类包含多个文档页面
2. 文档页面可以是 API 文档或更新日志
3. 一个 API 文档包含多个代码示例
4. 所有文档页面都会生成搜索索引项

---

## 状态转换

### DocumentPage 生命周期

```
[草稿] ──编写完成──> [待审核] ──审核通过──> [已发布] ──版本更新──> [已归档]
   │                                              │
   └──────────────────需要修改───────────────────┘
```

**状态说明**:
- **草稿**: 文档正在编写中,不会被构建
- **待审核**: 文档编写完成,等待技术审核
- **已发布**: 文档已发布到生产环境
- **已归档**: 旧版本文档,仅供参考

**实现方式**:
- 通过 frontmatter 的 `draft: true` 标记草稿
- 通过 Git 分支管理审核流程
- 通过版本目录管理归档文档

---

## 数据验证规则

### 1. DocumentPage 验证

```typescript
/**
 * 验证文档页面元数据
 */
function validateDocumentPage(meta: DocumentPageMeta): ValidationResult {
  const errors: string[] = [];
  
  // 标题验证
  if (!meta.title || meta.title.length < 5 || meta.title.length > 100) {
    errors.push('标题长度必须在 5-100 字符之间');
  }
  
  // 描述验证
  if (!meta.description || meta.description.length < 10 || meta.description.length > 200) {
    errors.push('描述长度必须在 10-200 字符之间');
  }
  
  // 类型验证
  if (!['api', 'guide', 'changelog'].includes(meta.type)) {
    errors.push('类型必须是 api, guide 或 changelog');
  }
  
  // 关键词验证
  if (meta.keywords && meta.keywords.length > 10) {
    errors.push('关键词数量不能超过 10 个');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

### 2. NavigationMeta 验证

```typescript
/**
 * 验证导航配置
 */
function validateNavigationMeta(meta: NavigationMeta): ValidationResult {
  const errors: string[] = [];
  
  for (const [key, item] of Object.entries(meta)) {
    // 标题必填
    if (!item.title) {
      errors.push(`分类 ${key} 缺少 title 字段`);
    }
    
    // order 必须是正整数
    if (item.order !== undefined && (item.order < 0 || !Number.isInteger(item.order))) {
      errors.push(`分类 ${key} 的 order 必须是正整数`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

## 性能考虑

### 1. 搜索索引优化

- **索引大小**: 控制在 500KB 以内(约 100 个文档页面)
- **分词策略**: 使用 FlexSearch 的中文分词,平衡准确性和性能
- **预加载**: 首页加载时预加载搜索索引,减少首次搜索延迟

### 2. 文档页面优化

- **代码分割**: 每个文档页面独立打包,按需加载
- **图片优化**: 使用 WebP 格式,启用懒加载
- **缓存策略**: 静态资源设置长期缓存,HTML 设置短期缓存

---

## 扩展性设计

### 1. 多版本支持

当需要支持多版本文档时,数据模型扩展如下:

```typescript
/**
 * 版本化文档页面元数据
 */
interface VersionedDocumentPageMeta extends DocumentPageMeta {
  /** 所属版本 */
  version: string;
  
  /** 版本状态 */
  versionStatus: 'latest' | 'stable' | 'deprecated';
}
```

### 2. 多语言支持

当需要支持多语言时,数据模型扩展如下:

```typescript
/**
 * 国际化文档页面元数据
 */
interface I18nDocumentPageMeta extends DocumentPageMeta {
  /** 语言代码 */
  locale: 'zh-CN' | 'en-US';
  
  /** 翻译状态 */
  translationStatus?: 'complete' | 'partial' | 'outdated';
}
```

---

## 总结

本数据模型设计:

1. ✅ **符合 rspress 规范**: 使用 Markdown + Frontmatter + _meta.json
2. ✅ **类型安全**: 所有数据结构都有完整的 TypeScript 类型定义
3. ✅ **可扩展**: 预留多版本和多语言扩展点
4. ✅ **易维护**: 数据结构清晰,验证规则完善
5. ✅ **高性能**: 考虑搜索索引和页面加载优化

可以进入下一阶段:生成 API 契约和快速入门指南。
