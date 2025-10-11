---
title: 更新日志
description: Tushare SDK 的版本更新记录
---

# 更新日志

本页面记录 Tushare SDK 的所有版本更新内容。

## v1.2.0 (2024-10-01)

### 🎉 新增功能

- **基金数据 API**: 新增 `getFundBasic` 和 `getFundNav` API,支持获取基金基础信息和净值数据 ([#123](https://github.com/your-org/tushare-sdk/pull/123))
- **财务数据 API**: 新增 `getIncome` 和 `getBalance` API,支持获取上市公司利润表和资产负债表数据 ([#125](https://github.com/your-org/tushare-sdk/pull/125))
- **搜索功能**: 文档站新增全文搜索功能,支持按 API 名称和描述搜索 ([#127](https://github.com/your-org/tushare-sdk/pull/127))
- **批量请求**: 新增批量请求工具函数,支持并行请求多个 API ([#130](https://github.com/your-org/tushare-sdk/pull/130))

### 🐛 Bug 修复

- 修复 `getStockDaily` 在某些情况下返回数据不完整的问题 ([#126](https://github.com/your-org/tushare-sdk/pull/126))
- 修复日期参数验证逻辑,支持更多日期格式 ([#128](https://github.com/your-org/tushare-sdk/pull/128))
- 修复 TypeScript 类型定义中的可选参数问题 ([#129](https://github.com/your-org/tushare-sdk/pull/129))
- 修复文档站在移动端显示异常的问题 ([#131](https://github.com/your-org/tushare-sdk/pull/131))

### ⚠️ 破坏性变更

- **`getStockBasic` 参数变更**: `list_status` 参数默认值从 `undefined` 改为 `'L'`(仅返回上市股票)

  **迁移指南**: 如需获取所有状态的股票,请显式传入 `list_status: undefined`:

  ```typescript
  // v1.1.0 及之前版本
  const stocks = await getStockBasic(); // 返回所有状态的股票
  
  // v1.2.0 及之后版本
  const stocks = await getStockBasic(); // 仅返回上市股票
  const allStocks = await getStockBasic({ list_status: undefined }); // 返回所有状态的股票
  ```

### 🚀 性能优化

- 优化 API 请求缓存机制,减少重复请求 ([#132](https://github.com/your-org/tushare-sdk/pull/132))
- 减小打包体积,从 250KB 降至 180KB (gzip 后) ([#133](https://github.com/your-org/tushare-sdk/pull/133))
- 优化类型定义,提升 TypeScript 编译速度 ([#134](https://github.com/your-org/tushare-sdk/pull/134))

### 📚 文档更新

- 新增快速入门指南和配置说明 ([#135](https://github.com/your-org/tushare-sdk/pull/135))
- 完善所有 API 的代码示例 ([#136](https://github.com/your-org/tushare-sdk/pull/136))
- 新增常见问题解答(FAQ)章节 ([#137](https://github.com/your-org/tushare-sdk/pull/137))

---

## v1.1.0 (2024-09-15)

### 🎉 新增功能

- **实时数据 API**: 新增 `getStockRealtime` API,支持获取股票实时行情数据 ([#110](https://github.com/your-org/tushare-sdk/pull/110))
- **配置增强**: 支持自定义请求超时时间和重试次数 ([#112](https://github.com/your-org/tushare-sdk/pull/112))
- **错误处理**: 新增 `ApiError` 和 `ValidationError` 错误类型,提供更详细的错误信息 ([#115](https://github.com/your-org/tushare-sdk/pull/115))

### 🐛 Bug 修复

- 修复环境变量读取失败的问题 ([#111](https://github.com/your-org/tushare-sdk/pull/111))
- 修复日期格式验证不严格的问题 ([#113](https://github.com/your-org/tushare-sdk/pull/113))
- 修复并发请求时的竞态条件问题 ([#114](https://github.com/your-org/tushare-sdk/pull/114))

### 🚀 性能优化

- 优化网络请求,减少不必要的数据传输 ([#116](https://github.com/your-org/tushare-sdk/pull/116))
- 改进内存使用,避免大数据集的内存泄漏 ([#117](https://github.com/your-org/tushare-sdk/pull/117))

### 📚 文档更新

- 新增 API 参考文档 ([#118](https://github.com/your-org/tushare-sdk/pull/118))
- 完善错误处理示例 ([#119](https://github.com/your-org/tushare-sdk/pull/119))

---

## v1.0.0 (2024-08-01)

### 🎉 首次发布

这是 Tushare SDK 的首个正式版本!

#### 核心功能

- **股票数据 API**:
  - `getStockBasic`: 获取股票基础信息
  - `getStockDaily`: 获取股票日线数据
  
- **配置管理**:
  - 支持通过环境变量配置 API Token
  - 支持代码中直接配置
  - 支持配置文件

- **类型安全**:
  - 完整的 TypeScript 类型定义
  - 严格的参数验证
  - 详细的 JSDoc 注释

- **错误处理**:
  - 自动重试失败的请求
  - 详细的错误信息
  - 支持自定义错误处理

#### 文档

- 完整的 API 文档
- 安装和配置指南
- 代码示例

#### 测试

- 单元测试覆盖率 > 80%
- E2E 测试覆盖核心功能
- 持续集成(CI)配置

---

## 版本说明

### 语义化版本

本项目遵循[语义化版本 2.0.0](https://semver.org/lang/zh-CN/)规范:

- **主版本号(MAJOR)**: 不兼容的 API 修改
- **次版本号(MINOR)**: 向下兼容的功能性新增
- **修订号(PATCH)**: 向下兼容的问题修正

### 图标说明

- 🎉 **新增功能**: 新增的功能或 API
- 🐛 **Bug 修复**: 修复的问题
- ⚠️ **破坏性变更**: 不向下兼容的变更
- 🚀 **性能优化**: 性能改进
- 📚 **文档更新**: 文档相关的更新
- 🔧 **配置变更**: 配置或构建相关的变更
- ♻️ **代码重构**: 不影响功能的代码重构
- ✅ **测试**: 测试相关的更新

### 升级建议

- **主版本升级**: 请仔细阅读破坏性变更说明和迁移指南
- **次版本升级**: 可以直接升级,新功能是可选的
- **修订版升级**: 建议及时升级,修复已知问题

### 获取更新

```bash
# 查看当前版本
npm list @tushare/sdk

# 更新到最新版本
npm update @tushare/sdk

# 更新到指定版本
npm install @tushare/sdk@1.2.0
```

### 反馈问题

如果你在使用过程中遇到问题或有功能建议,欢迎:

- 提交 [GitHub Issue](https://github.com/your-org/tushare-sdk/issues)
- 参与 [GitHub Discussions](https://github.com/your-org/tushare-sdk/discussions)
- 发送邮件至 support@example.com

---

## 下一步

- 📚 [快速开始](/guide/quick-start) - 学习如何使用 SDK
- 📖 [API 文档](/api/stock/basic) - 查看完整的 API 文档
- ⚙️ [配置选项](/guide/configuration) - 了解更多配置选项
