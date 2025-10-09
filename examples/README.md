# Tushare SDK 使用示例

本目录包含 Tushare TypeScript SDK 的使用示例。

## 运行示例

### 1. 设置环境变量

```bash
export TUSHARE_TOKEN="your_tushare_token_here"
```

### 2. 安装依赖

```bash
cd /Users/Zhuanz/Documents/project/tushare-sdk
pnpm install
pnpm build
```

### 3. 运行示例

```bash
# 使用 tsx 运行 TypeScript 文件
npx tsx examples/basic-usage.ts
```

## 示例说明

### basic-usage.ts

演示 SDK 的基础使用方法:
- 创建客户端实例
- 获取股票列表
- 获取日线行情
- 使用通用查询方法

## 获取 Token

访问 [Tushare 官网](https://tushare.pro/register) 注册账号并获取 API Token。

## 更多信息

- [快速开始指南](../specs/001-tushare-typescript-sdk/quickstart.md)
- [API 文档](../specs/001-tushare-typescript-sdk/contracts/)
- [数据模型](../specs/001-tushare-typescript-sdk/data-model.md)
