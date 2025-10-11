# Quick Start: 文档更新快速开始指南

**Feature**: 007-sdk | **Date**: 2025-10-11 | **Plan**: [plan.md](./plan.md)

## Purpose

本指南帮助文档编写者快速了解如何更新 Tushare SDK 文档站的内容，确保文档与源代码保持一致。

## Prerequisites

1. 熟悉 Markdown 语法
2. 了解 TypeScript 基础知识
3. 能够阅读 TypeScript 源代码和 JSDoc 注释
4. 安装了 Node.js 18+ 和 pnpm

## Documentation Structure Overview

```
apps/docs/docs/
├── guide/                  # 指南页面
│   ├── installation.md     # 安装指南
│   ├── quick-start.md      # 快速开始
│   └── configuration.md    # 配置指南
├── api/                    # API 文档
│   ├── stock/
│   │   ├── basic.md        # 股票基础信息
│   │   └── daily.md        # 日线行情
│   └── ...
└── index.md                # 首页
```

## Step-by-Step Workflow

### Step 1: 确定要更新的文档页面

参考 [spec.md](./spec.md) 中的用户故事，确定需要更新的文档：

**优先级 P1 (必须更新)**:
- [ ] `api/stock/basic.md` - 股票基础信息API
- [ ] `api/stock/daily.md` - 日线行情API
- [ ] 新增: `api/calendar.md` - 交易日历API
- [ ] 新增: `api/daily-basic.md` - 每日指标API

**优先级 P2 (重要)**:
- [ ] `guide/installation.md` - 更新包名
- [ ] `guide/quick-start.md` - 更新示例代码
- [ ] `guide/configuration.md` - 补充配置选项
- [ ] 新增: `guide/error-handling.md` - 错误处理指南

### Step 2: 查找对应的源代码文件

使用 [data-model.md](./data-model.md) 中的映射表快速定位源代码：

| 文档页面 | 源代码文件 |
|----------|-----------|
| `api/stock/basic.md` | `packages/tushare-sdk/src/client/TushareClient.ts` (getStockBasic方法)<br>`packages/tushare-sdk/src/models/stock.ts` (类型定义) |
| `api/stock/daily.md` | `packages/tushare-sdk/src/client/TushareClient.ts` (getDailyQuote方法)<br>`packages/tushare-sdk/src/models/quote.ts` (类型定义) |
| `guide/configuration.md` | `packages/tushare-sdk/src/types/config.ts` (所有配置接口) |

### Step 3: 提取类型定义和 JSDoc 注释

#### 3.1 从源代码复制类型定义

```typescript
// 示例：从 src/models/stock.ts 提取 StockBasicParams

export interface StockBasicParams {
  /**
   * 股票代码
   * 格式: TS代码,如 600230.SH, 000001.SZ
   */
  ts_code?: string;

  /**
   * 上市状态
   * L: 上市, D: 退市, P: 暂停
   */
  list_status?: string;

  // ... 其他字段
}
```

#### 3.2 转换为文档表格

| 参数名 | 类型 | 必需 | 说明 | 取值示例 |
|--------|------|------|------|----------|
| `ts_code` | `string` | ❌ | 股票代码 (TS格式) | `'000001.SZ'` |
| `list_status` | `string` | ❌ | 上市状态 | `'L'` (上市), `'D'` (退市), `'P'` (暂停) |

### Step 4: 编写示例代码

#### 4.1 提取源代码中的示例

从 `TushareClient.ts` 的 JSDoc 注释中提取示例：

```typescript
/**
 * @example
 * ```typescript
 * const stocks = await client.getStockBasic({
 *   list_status: 'L',
 *   exchange: 'SSE'
 * });
 * ```
 */
async getStockBasic(params?: StockBasicParams): Promise<StockBasicItem[]>
```

#### 4.2 扩展为完整示例

```typescript
import { TushareClient } from '@hestudy/tushare-sdk';

const client = new TushareClient({ token: 'YOUR_TOKEN' });

// 获取上交所所有上市股票
const stocks = await client.getStockBasic({
  list_status: 'L',
  exchange: 'SSE'
});

console.log(`共查询到 ${stocks.length} 只股票`);
```

### Step 5: 使用文档模板

使用 [contracts/api-page-structure.md](./contracts/api-page-structure.md) 或 [contracts/guide-page-structure.md](./contracts/guide-page-structure.md) 中的模板创建或更新文档。

#### API 文档模板使用示例

```markdown
---
title: 获取股票基础信息
description: 查询股票列表，获取股票代码、名称、上市日期等基础信息
---

# 获取股票基础信息

[从源代码提取的 API 说明]

**接口名称**: `stock_basic`

## 基本用法

[从 JSDoc 提取的示例代码]

## 参数说明

[从类型定义生成的表格]

## 返回值说明

[从类型定义生成的表格]

## 使用示例

[至少 3 个不同场景的示例]

## 注意事项

[从 JSDoc 或源代码注释中提取]

## 相关 API

[链接到相关文档]
```

### Step 6: 验证文档内容

#### 6.1 类型一致性检查

- [ ] 文档中的类型定义与源代码一致
- [ ] 所有字段都有说明
- [ ] 必需/可选参数标记正确

#### 6.2 示例代码检查

- [ ] 包名正确 (`@hestudy/tushare-sdk`)
- [ ] 方法名正确 (如 `getDailyQuote` 而不是 `getStockDaily`)
- [ ] 参数格式正确 (如日期格式 `'20241001'`)
- [ ] 代码可以复制运行

#### 6.3 使用检查清单

每个文档页面更新完成后，使用对应模板中的 "Validation Checklist" 进行自检。

### Step 7: 构建和预览文档站

#### 7.1 本地构建

```bash
# 在项目根目录执行
pnpm docs:build
```

#### 7.2 本地预览

```bash
pnpm docs:dev
```

访问 http://localhost:3000/tushare-sdk/ 查看更新后的文档。

#### 7.3 检查构建错误

如果构建失败，检查：
- Markdown 语法是否正确
- frontmatter 格式是否正确
- 链接是否指向存在的页面

## Common Patterns

### Pattern 1: 更新 API 文档

```
1. 定位源代码: packages/tushare-sdk/src/client/TushareClient.ts
2. 找到方法: async getStockBasic(params?: StockBasicParams)
3. 读取 JSDoc 注释和方法签名
4. 定位数据模型: packages/tushare-sdk/src/models/stock.ts
5. 复制类型定义: StockBasicParams, StockBasicItem
6. 使用 API 文档模板创建/更新文档
7. 验证和构建
```

### Pattern 2: 更新配置文档

```
1. 定位源代码: packages/tushare-sdk/src/types/config.ts
2. 找到配置接口: TushareConfig, RetryConfig, CacheConfig, etc.
3. 读取所有字段的 JSDoc 注释
4. 找到默认值: DEFAULT_RETRY_CONFIG, DEFAULT_CACHE_CONFIG
5. 使用配置指南模板更新文档
6. 为每个配置选项提供示例
7. 验证和构建
```

### Pattern 3: 纠正错误

```
1. 在文档中找到错误的引用 (如错误的包名或方法名)
2. 在源代码中确认正确的值
3. 更新文档中的所有相关位置
4. 搜索是否有其他地方使用了相同的错误引用
5. 验证和构建
```

## Reference Files

在更新文档时，经常参考以下文件：

### Source Code Files (源代码)

| 文件 | 用途 |
|------|------|
| `packages/tushare-sdk/src/index.ts` | 查看所有导出的类型和函数 |
| `packages/tushare-sdk/src/client/TushareClient.ts` | 查看所有 API 方法和使用示例 |
| `packages/tushare-sdk/src/types/config.ts` | 查看所有配置接口和默认值 |
| `packages/tushare-sdk/src/types/error.ts` | 查看错误类型定义 |
| `packages/tushare-sdk/src/models/*.ts` | 查看数据模型类型定义 |

### Specification Files (规格文件)

| 文件 | 用途 |
|------|------|
| [spec.md](./spec.md) | 了解功能需求和验收标准 |
| [data-model.md](./data-model.md) | 快速查找类型定义和映射关系 |
| [research.md](./research.md) | 了解技术决策和最佳实践 |
| [contracts/api-page-structure.md](./contracts/api-page-structure.md) | API 文档页面模板 |
| [contracts/guide-page-structure.md](./contracts/guide-page-structure.md) | 指南页面模板 |

## Tips and Best Practices

### Tip 1: 使用 VSCode 并排查看

在 VSCode 中同时打开源代码文件和文档文件，可以快速对比和复制：

```
左侧: packages/tushare-sdk/src/models/stock.ts
右侧: apps/docs/docs/api/stock/basic.md
```

### Tip 2: 善用 TypeScript 类型检查

将文档中的示例代码复制到 `.ts` 文件中，使用 `tsc --noEmit` 检查类型正确性：

```bash
# 创建测试文件
echo "import { TushareClient } from '@hestudy/tushare-sdk';" > test.ts
# 将文档示例代码粘贴到 test.ts

# 运行类型检查
npx tsc --noEmit test.ts
```

### Tip 3: 批量替换错误引用

如果发现多处使用了错误的引用（如包名），使用 VSCode 全局搜索替换：

```
搜索: @tushare/sdk
替换为: @hestudy/tushare-sdk
文件匹配: apps/docs/docs/**/*.md
```

### Tip 4: 保持示例代码一致性

所有示例代码都应遵循相同的风格：

```typescript
// ✅ 推荐：完整的导入和初始化
import { TushareClient } from '@hestudy/tushare-sdk';

const client = new TushareClient({ token: 'YOUR_TOKEN' });

const result = await client.someMethod(params);

// ❌ 避免：不完整的示例
const result = await someMethod(params);  // 没有导入和初始化
```

### Tip 5: 标注权限要求

对于需要特定积分的 API，必须在文档中明确标注：

```markdown
# 获取每日指标

**接口名称**: `daily_basic`
**权限要求**: 至少 2000 积分
```

## Troubleshooting

### 问题：构建失败，提示 "Cannot find module"

**原因**: 文档中的链接指向了不存在的页面

**解决**:
1. 检查 rspress.config.ts 中的导航配置
2. 确认链接指向的文件是否存在
3. 移除或更新无效链接

### 问题：类型定义与源代码不一致

**原因**: 源代码已更新，但文档未同步

**解决**:
1. 使用 VSCode 的 "Go to Definition" 功能跳转到源代码
2. 复制最新的类型定义
3. 更新文档中的类型定义

### 问题：示例代码无法运行

**原因**: 包名、方法名或参数格式错误

**解决**:
1. 检查包名是否为 `@hestudy/tushare-sdk`
2. 检查方法名是否存在于 TushareClient 类中
3. 检查参数格式是否符合 Tushare API 要求（如日期格式为 YYYYMMDD）

## Next Steps

完成文档更新后：

1. 运行 `pnpm docs:build` 验证构建成功
2. 运行 `pnpm docs:test:e2e` 执行 E2E 测试
3. 使用 [data-model.md](./data-model.md) 中的验证规则检查所有更新的文档
4. 提交更改并创建 Pull Request

## Useful Commands

```bash
# 启动文档开发服务器
pnpm docs:dev

# 构建文档
pnpm docs:build

# 预览构建后的文档
pnpm docs:preview

# 运行文档测试
pnpm docs:test

# 运行 E2E 测试
pnpm docs:test:e2e

# 类型检查 SDK 源代码
pnpm --filter @hestudy/tushare-sdk type-check

# 构建 SDK
pnpm --filter @hestudy/tushare-sdk build
```
