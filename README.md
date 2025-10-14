# Tushare TypeScript SDK

[![npm version](https://img.shields.io/npm/v/@hestudy/tushare-sdk.svg)](https://www.npmjs.com/package/@hestudy/tushare-sdk)
[![CI](https://github.com/hestudy/tushare-sdk/workflows/CI/badge.svg)](https://github.com/hestudy/tushare-sdk/actions/workflows/ci.yml)
[![Publish](https://github.com/hestudy/tushare-sdk/workflows/Publish%20to%20npm/badge.svg)](https://github.com/hestudy/tushare-sdk/actions/workflows/publish.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

TypeScript SDK for [Tushare Pro](https://tushare.pro) - 为 Node.js 和浏览器提供类型安全的金融数据访问能力。

## ✨ 特性

- 🎯 **完整的 TypeScript 类型定义** - 严格模式,零 any 类型泄漏
- 🚀 **现代化工具链** - 基于 Turborepo + rslib + Vitest
- 🔄 **自动重试机制** - 指数退避 + 抖动算法
- 💾 **可插拔缓存** - 内置内存缓存,支持 Redis 等外部缓存
- 🌐 **多环境支持** - Node.js 18+ 和现代浏览器
- 📝 **完整的 JSDoc 注释** - 提供最佳 IDE 智能提示
- ⚡ **高性能** - 并发控制 + 请求优化
- 🧪 **测试覆盖率 ≥ 80%** - 单元测试 + 集成测试 + 契约测试

## 🤖 MCP 服务

本项目提供基于 [Model Context Protocol (MCP)](https://modelcontextprotocol.io) 的 Tushare 数据服务,让 AI 助手(如 Claude Desktop)能够直接查询 A 股市场数据。

### 功能特性

- 📈 **股票行情查询**: 查询实时股票行情数据,包括最新价、涨跌幅、成交量等
- 💰 **财务数据查询**: 查询公司财务报表数据(利润表、资产负债表、现金流量表)
- 📊 **K线数据查询**: 查询历史 K 线数据,支持日线、周线、月线
- 📉 **市场指数查询**: 查询市场指数行情数据(上证指数、深证成指、创业板指等)

### 快速使用

**1. 安装**

```bash
pnpm add -g @hestudy/tushare-mcp
```

**2. 配置 Claude Desktop**

编辑 Claude Desktop 配置文件 (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "tushare": {
      "command": "npx",
      "args": ["-y", "@hestudy/tushare-mcp"],
      "env": {
        "TUSHARE_TOKEN": "your_tushare_token_here"
      }
    }
  }
}
```

**3. 重启 Claude Desktop** 并开始使用!

### 使用示例

在 Claude Desktop 中直接提问:

- "帮我查询贵州茅台 (600519.SH) 最新的股票行情"
- "查询平安银行 2023 年的利润表数据"
- "获取上证指数最近一个月的日线数据"

AI 会自动调用 Tushare MCP 服务获取数据并为你分析。

### 相关链接

- [MCP 使用指南](./apps/docs/docs/guide/mcp-usage.md) - 完整的安装和配置文档
- [MCP 服务源码](./apps/tushare-mcp) - 查看 MCP 服务器实现
- [Tushare Pro](https://tushare.pro) - 获取 API Token
- [Model Context Protocol](https://modelcontextprotocol.io) - 了解 MCP 协议

## 📦 安装

```bash
# 使用 pnpm (推荐)
pnpm add @hestudy/tushare-sdk

# 使用 npm
npm install @hestudy/tushare-sdk

# 使用 yarn
yarn add @hestudy/tushare-sdk
```

## 🚀 快速开始

```typescript
import { TushareClient } from '@hestudy/tushare-sdk';

// 创建客户端实例
const client = new TushareClient({
  token: 'YOUR_TUSHARE_API_TOKEN',
});

// 获取股票列表
const stocks = await client.getStockBasic({
  list_status: 'L', // L=上市 D=退市 P=暂停
  exchange: 'SSE',  // SSE=上交所 SZSE=深交所
});

console.log(`共获取 ${stocks.length} 只股票`);
```

## 📚 文档

- [快速开始指南](./specs/001-tushare-typescript-sdk/quickstart.md)
- [API 文档](./specs/001-tushare-typescript-sdk/contracts/)
- [数据模型](./specs/001-tushare-typescript-sdk/data-model.md)
- [技术研究](./specs/001-tushare-typescript-sdk/research.md)
- [测试指南](./docs/testing-guide.md)

## 🛠️ 开发

```bash
# 安装依赖
pnpm install

# 构建
pnpm build

# 测试(需要配置 TUSHARE_TOKEN 环境变量)
pnpm test

# 测试覆盖率
pnpm test:coverage

# 代码检查
pnpm lint

# 格式化代码
pnpm format
```

### 测试说明

本项目包含单元测试和集成测试:

- **单元测试**: 不需要 API Token,始终运行
- **集成测试**: 需要有效的 `TUSHARE_TOKEN` 环境变量,如果未配置会自动跳过

配置环境变量:
```bash
# 复制环境变量模板
cp apps/node-demo/.env.example apps/node-demo/.env

# 编辑 .env 文件,填入你的 Tushare Token
# TUSHARE_TOKEN=your_token_here
```

详细测试指南请参考 [测试指南](./docs/testing-guide.md)。

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request!

## 📧 联系方式

- 官网: [https://tushare.pro](https://tushare.pro)
- GitHub: [https://github.com/hestudy/tushare-sdk](https://github.com/hestudy/tushare-sdk)
