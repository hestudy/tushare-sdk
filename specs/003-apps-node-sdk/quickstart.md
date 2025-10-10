# Quick Start: Node 应用演示示例

**Feature**: 003-apps-node-sdk  
**Date**: 2025-10-10  
**Audience**: 开发者

## 概述

本文档提供演示应用的快速开始指南,帮助开发者在 5 分钟内运行演示应用并查看 Tushare SDK 的功能。

---

## 前置要求

在开始之前,请确保您的开发环境满足以下要求:

### 必需
- ✅ **Node.js**: 18.0.0 或更高版本
- ✅ **pnpm**: 8.0.0 或更高版本
- ✅ **Tushare API Token**: 从 [Tushare Pro](https://tushare.pro) 获取

### 检查环境

```bash
# 检查 Node.js 版本
node --version
# 应输出: v18.x.x 或更高

# 检查 pnpm 版本
pnpm --version
# 应输出: 8.x.x 或更高

# 如果没有安装 pnpm
npm install -g pnpm
```

---

## 快速开始 (5 分钟)

### 步骤 1: 克隆项目并安装依赖

```bash
# 克隆项目(如果还没有)
git clone https://github.com/hestudy/tushare-sdk.git
cd tushare-sdk

# 安装所有依赖(包括 SDK 和演示应用)
pnpm install
```

### 步骤 2: 配置 API Token

在演示应用目录创建 `.env` 文件:

```bash
# 进入演示应用目录
cd apps/node-demo

# 复制环境变量示例文件
cp .env.example .env

# 编辑 .env 文件,填入您的 Tushare API Token
# 使用您喜欢的编辑器,例如:
nano .env
# 或
vim .env
# 或
code .env
```

在 `.env` 文件中设置您的 Token:

```bash
# Tushare API Token (必需)
TUSHARE_TOKEN=your_actual_token_here

# API 基础 URL (可选,使用默认值即可)
# TUSHARE_API_URL=https://api.tushare.pro

# 调试模式 (可选)
# DEBUG=true
```

> **获取 Token**: 如果您还没有 Tushare API Token,请访问 [https://tushare.pro](https://tushare.pro) 注册并获取。

### 步骤 3: 运行演示应用

```bash
# 在 apps/node-demo 目录下运行
pnpm dev
```

您应该看到类似以下的输出:

```
========================================
Tushare SDK 演示应用
版本: 1.0.0
SDK 版本: 1.0.0
时间: 2025-10-10 17:00:00
========================================

[1/3] 运行示例: 股票列表查询
✓ 成功 (耗时: 234ms)
返回 5000 条股票数据

[2/3] 运行示例: 日线数据查询
✓ 成功 (耗时: 189ms)
返回 30 条日线数据

[3/3] 运行示例: 交易日历查询
✓ 成功 (耗时: 156ms)
返回 365 条交易日历数据

========================================
执行摘要
========================================
总计: 3 个示例
成功: 3 个
失败: 0 个
总耗时: 579ms
========================================
```

🎉 **恭喜!** 您已成功运行 Tushare SDK 演示应用!

---

## 进阶使用

### 运行特定示例

```bash
# 只运行股票列表示例
pnpm dev -- --example=stock-list

# 只运行日线数据示例
pnpm dev -- --example=daily-data

# 只运行交易日历示例
pnpm dev -- --example=trade-calendar
```

### 启用详细输出

```bash
# 查看详细的 API 请求和响应信息
pnpm dev -- --verbose
```

### 输出 JSON 格式

```bash
# 输出结构化 JSON 数据
pnpm dev -- --format=json

# 保存到文件
pnpm dev -- --format=json > output.json
```

### 启用调试模式

在 `.env` 文件中设置:

```bash
DEBUG=true
```

或通过环境变量:

```bash
DEBUG=true pnpm dev
```

---

## 项目结构

演示应用的目录结构:

```
apps/node-demo/
├── src/
│   ├── index.ts              # 主入口文件
│   ├── config.ts             # 配置管理
│   ├── error-handling.ts     # 错误处理演示
│   └── examples/             # API 调用示例
│       ├── stock-list.ts     # 股票列表查询
│       ├── daily-data.ts     # 日线数据查询
│       └── trade-calendar.ts # 交易日历查询
├── tests/                    # 测试文件
├── .env.example              # 环境变量示例
├── .env                      # 您的配置(不提交到 Git)
├── package.json
├── tsconfig.json
└── README.md
```

---

## 示例代码解析

### 示例 1: 股票列表查询

```typescript
import { TushareClient } from '@hestudy/tushare-sdk';

// 创建客户端
const client = new TushareClient({
  token: process.env.TUSHARE_TOKEN!,
});

// 查询股票列表
const result = await client.getStockBasic({
  exchange: 'SSE', // 上交所
  list_status: 'L', // 上市状态
});

console.log(`查询到 ${result.data.length} 条股票数据`);
```

### 示例 2: 日线数据查询

```typescript
import { TushareClient } from '@hestudy/tushare-sdk';

const client = new TushareClient({
  token: process.env.TUSHARE_TOKEN!,
});

// 查询平安银行最近 30 天的日线数据
const result = await client.getDailyQuote({
  ts_code: '000001.SZ',
  start_date: '20240901',
  end_date: '20241001',
});

console.log(`查询到 ${result.data.length} 条日线数据`);
```

### 示例 3: 错误处理

```typescript
import { TushareClient, ApiError, ApiErrorType } from '@hestudy/tushare-sdk';

const client = new TushareClient({
  token: process.env.TUSHARE_TOKEN!,
});

try {
  const result = await client.getStockBasic();
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.type) {
      case ApiErrorType.AUTH_ERROR:
        console.error('认证失败,请检查 API Token');
        break;
      case ApiErrorType.NETWORK_ERROR:
        console.error('网络错误,请检查网络连接');
        break;
      case ApiErrorType.PARAM_ERROR:
        console.error('参数错误:', error.message);
        break;
      default:
        console.error('未知错误:', error.message);
    }
  }
}
```

---

## 开发工作流

### 开发模式

```bash
# 启动开发模式(自动重载)
pnpm dev
```

### 构建

```bash
# 编译 TypeScript 为 JavaScript
pnpm build

# 运行编译后的代码
pnpm start
```

### 测试

```bash
# 运行所有测试
pnpm test

# 运行测试并监听变化
pnpm test:watch

# 生成测试覆盖率报告
pnpm test:coverage
```

### 代码检查

```bash
# 类型检查
pnpm type-check

# 代码格式检查
pnpm lint
```

---

## 常见问题

### Q1: 提示 "缺少 TUSHARE_TOKEN" 错误

**问题**: 运行应用时提示缺少 Token

**解决方案**:
1. 确保在 `apps/node-demo/` 目录下创建了 `.env` 文件
2. 确保 `.env` 文件中设置了 `TUSHARE_TOKEN=your_token`
3. 确保 Token 没有多余的空格或引号

### Q2: API 调用失败,提示认证错误

**问题**: Token 无效或已过期

**解决方案**:
1. 检查 Token 是否正确复制(没有多余字符)
2. 访问 [Tushare Pro](https://tushare.pro) 检查 Token 状态
3. 如果 Token 过期,获取新的 Token

### Q3: 网络连接超时

**问题**: API 请求超时

**解决方案**:
1. 检查网络连接是否正常
2. 检查是否需要配置代理
3. 尝试增加超时时间(在 SDK 配置中)

### Q4: pnpm install 失败

**问题**: 依赖安装失败

**解决方案**:
```bash
# 清理缓存
pnpm store prune

# 删除 node_modules 和锁文件
rm -rf node_modules pnpm-lock.yaml

# 重新安装
pnpm install
```

### Q5: 类型错误或导入失败

**问题**: TypeScript 类型错误

**解决方案**:
```bash
# 确保 SDK 已构建
cd packages/tushare-sdk
pnpm build

# 返回演示应用目录
cd ../../apps/node-demo

# 重新安装依赖
pnpm install
```

---

## 下一步

### 学习更多

- 📖 查看 [SDK 完整文档](../../docs/api.md)
- 📖 阅读 [API 参考](../../packages/tushare-sdk/README.md)
- 📖 浏览 [更多示例](../../examples/)

### 集成到您的项目

1. **安装 SDK**:
   ```bash
   npm install @hestudy/tushare-sdk
   # 或
   pnpm add @hestudy/tushare-sdk
   ```

2. **参考演示代码**:
   - 复制 `apps/node-demo/src/examples/` 中的示例代码
   - 根据您的需求修改参数和逻辑

3. **实现错误处理**:
   - 参考 `error-handling.ts` 实现健壮的错误处理

### 贡献

如果您发现问题或有改进建议:

1. 提交 Issue: [GitHub Issues](https://github.com/hestudy/tushare-sdk/issues)
2. 提交 PR: [GitHub Pull Requests](https://github.com/hestudy/tushare-sdk/pulls)

---

## 支持

如果您需要帮助:

- 📧 邮件: [support@example.com](mailto:support@example.com)
- 💬 讨论: [GitHub Discussions](https://github.com/hestudy/tushare-sdk/discussions)
- 📚 文档: [完整文档](../../README.md)

---

## 总结

通过本快速开始指南,您应该能够:

- ✅ 安装和配置演示应用
- ✅ 运行演示应用并查看输出
- ✅ 理解基本的 SDK 使用方式
- ✅ 处理常见的错误场景
- ✅ 将 SDK 集成到您的项目

**预计时间**: 5 分钟  
**难度**: 简单  
**前置知识**: 基本的 Node.js 和 TypeScript 知识

祝您使用愉快! 🚀
