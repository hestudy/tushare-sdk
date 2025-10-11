# Research: 基于SDK源代码完善文档站内容

**Feature**: 007-sdk | **Date**: 2025-10-11 | **Plan**: [plan.md](./plan.md)

## Overview

本研究文档解决 Technical Context 中的 NEEDS CLARIFICATION 项，并为文档更新提供技术指导和最佳实践。

## Research Topics

### 1. Rspress 文档框架技术细节

**研究问题**: 如何高效使用 rspress 编写技术文档？文档站的 Markdown 格式有哪些特殊要求？

**研究发现**:

基于项目现有的 `rspress.config.ts` 配置，已确认以下技术细节：

- **框架版本**: rspress (React-based 文档框架，类似于 VitePress/Docusaurus)
- **文档目录**: `apps/docs/docs/` - 所有 Markdown 文件存放位置
- **导航配置**: 在 `rspress.config.ts` 的 `themeConfig.nav` 和 `themeConfig.sidebar` 中定义
- **Markdown 增强**:
  - 支持 GitHub Flavored Markdown
  - 代码块支持行号显示 (`showLineNumbers: true`)
  - 代码块支持浅色/深色主题切换
  - 支持 frontmatter 元数据
  - 支持 `[[toc]]` 自动生成目录

**应用决策**:
- 所有文档使用标准 Markdown 语法
- 代码示例使用 TypeScript 高亮 (```typescript)
- 每个文档页面包含清晰的标题层级 (h1 → h2 → h3)
- API 文档采用统一的结构模板（见 contracts/）

---

### 2. SDK 源代码中的 API 实现完整性

**研究问题**: SDK 中实际实现了哪些 API 方法？哪些方法已在 index.ts 中导出？

**研究发现**:

通过分析 `packages/tushare-sdk/src/index.ts` 和 `TushareClient.ts`，确认以下 API 方法：

**已实现并导出的 API**:
1. ✅ `getStockBasic(params?: StockBasicParams)` - 获取股票基础信息
2. ✅ `getDailyQuote(params: DailyQuoteParams)` - 获取日线行情
3. ✅ `getTradeCalendar(params?: TradeCalParams)` - 获取交易日历
4. ✅ `getDailyBasic(params?: DailyBasicParams)` - 获取每日指标

**已导出但未在 TushareClient 中实现的独立函数**:
- `getStockBasic` (api/stock.ts) - 独立函数版本
- `getDailyQuote` (api/quote.ts) - 独立函数版本
- `getFinancialData` (api/financial.ts) - 财务数据API
- `getTradeCalendar` (api/calendar.ts) - 独立函数版本
- `getDailyBasic` (api/daily-basic.ts) - 独立函数版本

**应用决策**:
- 文档主要关注 `TushareClient` 类的方法（面向对象用法）
- 暂不为独立函数版本创建单独文档（属于高级用法）
- `getFinancialData` 需要单独检查实现状态，决定是否为其创建文档
- 移除或标注 rspress.config.ts 中指向未实现 API 的导航链接（fund/basic, fund/nav, finance/income, finance/balance）

---

### 3. 文档与源代码的一致性验证方法

**研究问题**: 如何确保文档中的类型定义、方法签名与源代码100%一致？

**研究方法**:

1. **类型定义对比**:
   - 直接从源代码文件复制类型定义（如 `StockBasicParams`、`DailyBasicItem`）
   - 使用 TypeScript 的 JSDoc 注释作为字段说明的唯一来源
   - 对比现有文档与源代码中的字段名、类型、注释

2. **方法签名验证**:
   - 从 `TushareClient.ts` 复制完整的方法签名
   - 包括参数类型（必需/可选）、返回值类型、泛型
   - 确保示例代码中的方法调用与签名一致

3. **配置选项验证**:
   - 从 `types/config.ts` 提取所有配置接口
   - 逐一核对默认值（如 `DEFAULT_RETRY_CONFIG`）
   - 确保文档中的配置示例使用正确的属性名和值

**应用决策**:
- 建立文档页面检查清单（见 contracts/api-page-structure.md）
- 每个 API 文档必须包含"类型定义"部分，直接展示源代码中的 TypeScript 接口
- 示例代码必须可以通过类型检查（使用 `tsc --noEmit` 验证）

---

### 4. 文档示例代码的最佳实践

**研究问题**: API 文档中的示例代码应该包含哪些内容？如何编写高质量的示例？

**最佳实践**:

基于现有 SDK 的 JSDoc 注释和行业标准，确定以下示例结构：

1. **基本用法示例** (必需):
   ```typescript
   // 创建客户端
   const client = new TushareClient({ token: 'YOUR_TOKEN' });

   // 调用 API
   const result = await client.someMethod(params);
   ```

2. **参数过滤示例** (推荐):
   ```typescript
   // 展示如何使用参数进行数据过滤
   const result = await client.someMethod({
     ts_code: '000001.SZ',
     start_date: '20240101',
     end_date: '20241231'
   });
   ```

3. **错误处理示例** (推荐):
   ```typescript
   try {
     const result = await client.someMethod(params);
   } catch (error) {
     if (error instanceof ApiError) {
       console.error(`API Error: ${error.type} - ${error.message}`);
     }
   }
   ```

4. **高级场景示例** (可选):
   - 批量请求
   - 使用缓存
   - 自定义配置

**应用决策**:
- 每个 API 文档至少包含基本用法和参数过滤示例
- 错误处理示例统一放在配置指南中
- 所有示例使用真实的 Tushare API 参数格式（如 trade_date: '20241001'）

---

### 5. SDK 配置选项的完整性

**研究问题**: TushareConfig 及其子配置接口包含哪些配置项？默认值是什么？

**研究发现**:

从 `types/config.ts` 提取完整的配置结构：

**TushareConfig 主配置**:
- `token: string` (必需) - API访问令牌
- `endpoint?: string` (可选, 默认: 'https://api.tushare.pro')
- `timeout?: number` (可选, 默认: 30000ms)
- `retry?: Partial<RetryConfig>` (可选)
- `cache?: Partial<CacheConfig>` (可选)
- `concurrency?: Partial<ConcurrencyConfig>` (可选)
- `logger?: Logger` (可选)

**RetryConfig 重试配置** (默认值):
- `maxRetries: 3` - 最大重试次数
- `initialDelay: 1000` - 初始延迟(ms)
- `maxDelay: 30000` - 最大延迟(ms)
- `backoffFactor: 2` - 退避因子

**CacheConfig 缓存配置** (默认值):
- `enabled: false` - 是否启用
- `provider?: CacheProvider` - 缓存提供者(默认: MemoryCacheProvider)
- `ttl: 3600000` - 过期时间(ms, 1小时)

**ConcurrencyConfig 并发配置** (默认值):
- `maxConcurrent: 5` - 最大并发数
- `minInterval: 200` - 最小间隔(ms)

**应用决策**:
- 配置文档必须包含所有15个配置属性（主配置7个 + 子配置8个）
- 每个配置项必须注明类型、默认值、取值范围
- 提供针对不同 Tushare 积分等级的推荐配置示例

---

### 6. 错误处理机制的文档化

**研究问题**: ApiError 类和 ApiErrorType 枚举有哪些值？如何正确使用？

**研究发现**:

从 `types/error.ts` 提取错误类型：

**ApiErrorType 枚举** (7个值):
1. `AUTH_ERROR` - 认证错误 (401, Token无效或过期)
2. `RATE_LIMIT` - 限流错误 (429, 请求频率超限)
3. `NETWORK_ERROR` - 网络错误 (网络连接失败)
4. `SERVER_ERROR` - 服务器错误 (500, 服务器内部错误)
5. `VALIDATION_ERROR` - 参数验证错误 (请求参数不合法)
6. `TIMEOUT_ERROR` - 超时错误 (请求超时)
7. `UNKNOWN_ERROR` - 未知错误

**ApiError 类属性**:
- `type: ApiErrorType` - 错误类型
- `code?: number` - HTTP 状态码
- `originalError?: Error` - 原始错误对象
- `retryable: boolean` - 是否可重试 (自动计算)
- `retryAfter?: number` - 建议重试延迟(ms)

**可重试的错误类型**:
- RATE_LIMIT (限流 - 可重试)
- NETWORK_ERROR (网络 - 可重试)
- TIMEOUT_ERROR (超时 - 可重试)
- SERVER_ERROR (服务器错误 - 可重试)

**应用决策**:
- 错误处理文档必须列出所有7个错误类型及其触发条件
- 提供使用 `error.retryable` 判断是否自动重试的示例
- 说明 RATE_LIMIT 错误会自动从响应头读取 `retryAfter` 值

---

### 7. 每日指标 (DailyBasic) 的字段完整性

**研究问题**: DailyBasicItem 包含哪些字段？每个字段的含义和计算公式是什么？

**研究发现**:

从 `models/daily-basic.ts` 提取完整字段列表（共15个字段）：

**基础字段**:
- `ts_code: string` - 股票代码 (如 600230.SH)
- `trade_date: string` - 交易日期 (YYYYMMDD格式)

**换手率指标**:
- `turnover_rate?: number` - 换手率(%) = 成交量/流通股本 * 100%
- `turnover_rate_f?: number` - 换手率(自由流通股)(%)
- `volume_ratio?: number` - 量比 = 当日成交量/过去5日平均成交量

**估值指标**:
- `pe?: number` - 市盈率 = 总市值/净利润 (亏损时为空)
- `pe_ttm?: number` - 市盈率(TTM) (最近12个月)
- `pb?: number` - 市净率 = 总市值/净资产
- `ps?: number` - 市销率 = 总市值/营业收入
- `ps_ttm?: number` - 市销率(TTM)

**股息指标**:
- `dv_ratio?: number` - 股息率(%) = 每股分红/股价 * 100%
- `dv_ttm?: number` - 股息率(TTM)(%)

**股本市值指标**:
- `total_share?: number` - 总股本(万股)
- `float_share?: number` - 流通股本(万股)
- `free_share?: number` - 自由流通股本(万股) (剔除限售股)
- `total_mv?: number` - 总市值(万元) = 总股本 * 收盘价
- `circ_mv?: number` - 流通市值(万元) = 流通股本 * 收盘价

**应用决策**:
- DailyBasic 文档必须包含所有15个字段的详细说明
- 每个计算型指标必须注明计算公式
- 标注哪些字段可能为空（如 pe 在公司亏损时为空）

---

## Summary of Decisions

### 技术栈确认
- ✅ 文档框架: rspress (React-based)
- ✅ Markdown 格式: GitHub Flavored Markdown + frontmatter
- ✅ 代码高亮: TypeScript
- ✅ 测试方法: rspress 构建 + E2E 测试 (playwright)

### API 覆盖范围
- ✅ 4个核心 API 方法需要完整文档
- ⚠️ 需要检查并移除/标注未实现 API 的导航链接
- ✅ 暂不为独立函数版本创建文档

### 文档结构标准
- ✅ 使用统一的 API 文档模板（见 contracts/api-page-structure.md）
- ✅ 所有配置项必须包含类型、默认值、取值范围
- ✅ 每个 API 至少提供3个场景的示例代码

### 一致性保证
- ✅ 类型定义直接从源代码复制
- ✅ 使用 JSDoc 注释作为字段说明来源
- ✅ 示例代码可通过 TypeScript 类型检查

## Next Steps (Phase 1)

1. 生成 `data-model.md` - 记录所有数据模型的字段映射
2. 创建 `contracts/` 目录 - 定义 API 文档和指南文档的标准结构
3. 生成 `quickstart.md` - 提供文档更新的快速开始指南
4. 更新 agent context - 添加 rspress 和文档更新技术信息
