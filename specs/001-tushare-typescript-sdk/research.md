# Research Document: Tushare TypeScript SDK

**Branch**: `001-tushare-typescript-sdk` | **Date**: 2025-10-09  
**Status**: Phase 0 Complete

## 研究概述

本文档记录了 Tushare TypeScript SDK 项目的技术研究成果，包括技术选型、最佳实践、API 调用机制等关键决策。

---

## 1. Tushare API 调用机制

### 决策: 使用 HTTP POST + JSON 格式调用 Tushare API

**研究发现**:
- Tushare Pro API 使用统一的 HTTP 接口：`https://api.tushare.pro`
- 所有 API 调用均通过 POST 方法，请求体为 JSON 格式
- 请求格式:
  ```json
  {
    "api_name": "stock_basic",
    "token": "YOUR_TOKEN",
    "params": {
      "exchange": "",
      "list_status": "L"
    },
    "fields": "ts_code,symbol,name,area,industry,list_date"
  }
  ```
- 响应格式:
  ```json
  {
    "code": 0,
    "msg": "success",
    "data": {
      "fields": ["ts_code", "symbol", "name"],
      "items": [
        ["000001.SZ", "000001", "平安银行"],
        ["000002.SZ", "000002", "万科A"]
      ]
    }
  }
  ```

**理由**:
- 统一的接口端点简化了客户端实现
- JSON 格式易于类型化，天然契合 TypeScript
- POST 方法避免 URL 长度限制，适合复杂参数

**备选方案**:
- ❌ GraphQL: Tushare 未提供 GraphQL 端点
- ❌ gRPC: 金融数据场景不需要流式传输

---

## 2. 构建工具: rslib

### 决策: 使用 rslib 作为构建工具

**研究发现**:
- rslib 是专为 TypeScript 库构建设计的现代工具，基于 Rspack
- 核心优势: 极快构建速度、支持多格式输出、零配置、自动生成类型定义

**理由**: 构建速度快、与 Turborepo 集成良好、专门针对库构建优化

**备选方案**: tsc (慢)、tsup、rollup (配置复杂)、webpack (重)

---

## 3. 测试框架: Vitest

### 决策: 使用 Vitest 作为测试框架

**研究发现**:
- Vitest 是 Vite 生态的测试框架，与 Jest API 兼容
- 核心优势: 极快测试速度、原生 TypeScript 支持、内置覆盖率报告

**理由**: 速度快、与构建工具生态一致、符合测试覆盖率要求

**备选方案**: Jest (慢)、Mocha (配置多)、AVA (生态小)

---

## 4. Monorepo 管理: Turborepo

### 决策: 使用 Turborepo 管理 monorepo

**研究发现**:
- Turborepo 是高性能的 monorepo 构建系统
- 核心优势: 并行任务执行、远程缓存、任务依赖图分析

**理由**: 增量构建节省时间、支持多包依赖、为未来扩展预留空间

**备选方案**: Nx (复杂)、Lerna (不活跃)、Rush (学习曲线陡)

---

## 5. HTTP 客户端

### 决策: 使用原生 fetch API

**研究发现**:
- fetch API 现为 Web 标准，Node.js 18+ 原生支持
- 核心优势: 浏览器和 Node.js 统一 API、无需外部依赖、支持请求取消

**理由**: Node.js 18+ 原生支持、API 简洁、易于测试

**备选方案**: axios (体积大)、got (仅 Node.js)、superagent (老旧)

---

## 6. 错误处理和重试机制

### 决策: 自定义 ApiError 类 + 指数退避重试

**研究发现**: Tushare API 错误类型: 401 (认证)、429 (限流)、500 (服务器)、timeout (超时)

**实现方案**:
- 错误类型枚举: AUTH_ERROR, RATE_LIMIT, NETWORK_ERROR, SERVER_ERROR, VALIDATION_ERROR, TIMEOUT_ERROR
- 指数退避: 延迟 = min(初始延迟 * 因子^n, 最大延迟)
- 抖动: 添加 ±20% 随机抖动避免惊群效应
- 429 特殊处理: 遵循 Retry-After 响应头

**理由**: 避免过度请求、遵循服务端指示、明确区分可重试错误

**备选方案**: 固定延迟 (压力大)、无限重试 (死循环)、线性退避 (效果差)

---

## 7. 缓存策略

### 决策: 内存缓存 + 可插拔外部缓存接口

**实现方案**:
- 定义 CacheProvider 接口: get, set, delete, clear
- 默认 MemoryCacheProvider 实现
- 缓存键生成: `tushare:{api_name}:{sorted_params}`
- 不同数据不同 TTL: 基础数据 (1天+)、日线 (当日)、分钟 (1-5分钟)

**理由**: 内存缓存满足多数场景、可插拔接口支持 Redis 等、TTL 灵活

**备选方案**: 仅 Redis (复杂)、无缓存 (浪费)、文件缓存 (兼容性)

---

## 8. 日期处理

### 决策: 原生 Date API + 自定义格式化

**实现方案**:
- Tushare 格式: YYYYMMDD
- 支持输入: YYYY-MM-DD 字符串、Date 对象、时间戳
- formatDate(): 转换为 YYYYMMDD
- parseDate(): 解析 YYYYMMDD 为 Date

**理由**: 原生 API 足够、避免额外依赖、支持多种输入格式

**备选方案**: moment.js (重 67KB)、date-fns (多余)、dayjs (过度)

---

## 9. TypeScript 类型定义

### 决策: 为每个 API 生成独立的请求参数和响应类型

**实现方案**:
- 基础类型: TushareResponse, TushareRequest
- 接口类型: 每个 API 定义 Params 和 Item 类型
- JSDoc 注释: 提供字段说明
- 联合类型: 限制无效输入 (如 list_status: 'L' | 'D' | 'P')

**理由**: 完整类型提供最佳 IDE 支持、符合严格模式要求

**备选方案**: any (失去安全)、部分类型 (不完整)、OpenAPI (无规范)

---

## 10. 日志和调试

### 决策: 可配置的日志接口，默认 console

**实现方案**:
- Logger 接口: debug, info, warn, error
- LogLevel 枚举: DEBUG, INFO, WARN, ERROR, SILENT
- ConsoleLogger 默认实现
- 可集成外部日志库 (winston, pino)

**理由**: 可插拔支持任何日志库、默认零依赖、日志级别控制

**备选方案**: 强制 winston/pino (体积)、无日志 (调试难)、仅 console (无集成)

---

## 11. 并发控制

### 决策: 基于队列的并发控制

**实现方案**:
- ConcurrencyLimiter 类
- 配置: maxConcurrent (最大并发)、minInterval (最小间隔)
- 队列机制确保顺序
- 适应不同积分等级: 200积分 (1次/秒)、2000积分 (5次/秒)、5000积分 (20次/秒)

**理由**: 防止触发限流、可配置适应不同等级

**备选方案**: 无控制 (易限流)、p-limit (简单场景不需要)、固定并发 (不灵活)

---

## 12. 浏览器环境支持

### 决策: 通过条件导出和构建配置支持浏览器

**实现方案**:
- 条件导出: package.json exports 字段
- 浏览器特定构建: target: 'web'
- 安全性警告: 提醒 Token 泄露风险
- 建议通过后端代理

**理由**: 支持不同环境、提醒安全风险

**备选方案**: 仅 Node.js (限制场景)、无提示 (安全风险)、强制代理 (复杂)

---

## 13. 性能优化

### 决策: 多层次优化策略

**实现方案**:
- 响应数据转换优化: 使用 for 循环代替 forEach
- 缓存预热: warmupCache() 方法加载常用数据
- 请求合并: 未来可使用 DataLoader 模式

**理由**: 减少 CPU 开销、减少首次延迟、减少网络开销

---

## 总结

所有技术选型均已完成研究，关键决策包括:
- ✅ 使用 rslib + vitest + turborepo 构建现代化工具链
- ✅ 原生 fetch API 支持 Node.js 和浏览器
- ✅ 指数退避重试 + 内存缓存优化性能
- ✅ 完整的 TypeScript 类型定义
- ✅ 可插拔的缓存和日志接口

下一步: 进入 Phase 1，生成数据模型和 API 契约。
