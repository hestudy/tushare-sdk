# Contract: README MCP 章节大纲

**文件路径**: `/README.md`
**章节位置**: 在"特性"章节之后,"快速开始"章节之前
**目标字数**: 200-300 字

## 章节结构

### 标题

```markdown
## 🤖 MCP 服务
```

### 副标题 1: 什么是 MCP 服务?

```markdown
本项目提供基于 [Model Context Protocol (MCP)](https://modelcontextprotocol.io) 的 Tushare 数据服务,让 AI 助手(如 Claude Desktop)能够直接查询 A 股市场数据。
```

**内容要点**:
- 一句话说明 MCP 服务的用途
- 提供 MCP 协议官网链接
- 举例说明支持的 AI 客户端

### 副标题 2: 功能特性

```markdown
### 功能特性

- 📈 **股票行情查询**: 查询实时股票行情数据,包括最新价、涨跌幅、成交量等
- 💰 **财务数据查询**: 查询公司财务报表数据(利润表、资产负债表、现金流量表)
- 📊 **K线数据查询**: 查询历史 K 线数据,支持日线、周线、月线
- 📉 **市场指数查询**: 查询市场指数行情数据(上证指数、深证成指、创业板指等)
```

**内容要点**:
- 使用 emoji 提升可读性
- 列出 4 个主要工具的功能
- 每项简短说明(不超过 20 字)

### 副标题 3: 快速使用

```markdown
### 快速使用

**1. 安装**

\```bash
pnpm add @hestudy/tushare-mcp
\```

**2. 配置 Claude Desktop**

编辑 Claude Desktop 配置文件 (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

\```json
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
\```

**3. 重启 Claude Desktop** 并开始使用!

📚 **详细文档**: [MCP 使用指南](https://your-docs-site.com/guide/mcp-usage)
```

**内容要点**:
- 提供最简单的安装方式 (npx)
- 只展示 Claude Desktop (macOS) 的配置示例
- 强调需要重启客户端
- 提供文档站点链接

### 副标题 4: 使用示例

```markdown
### 使用示例

在 Claude Desktop 中直接提问:

- "帮我查询贵州茅台 (600519.SH) 最新的股票行情"
- "查询平安银行 2023 年的利润表数据"
- "获取上证指数最近一个月的日线数据"

AI 会自动调用 Tushare MCP 服务获取数据并为你分析。
```

**内容要点**:
- 提供 3 个自然语言问题示例
- 覆盖不同的工具(行情、财务、K线)
- 说明 AI 会自动调用服务

### 副标题 5: 相关链接

```markdown
### 相关链接

- [MCP 使用指南](https://your-docs-site.com/guide/mcp-usage) - 完整的安装和配置文档
- [MCP 服务源码](./apps/tushare-mcp) - 查看 MCP 服务器实现
- [Tushare Pro](https://tushare.pro) - 获取 API Token
- [Model Context Protocol](https://modelcontextprotocol.io) - 了解 MCP 协议
```

**内容要点**:
- 提供 4 个关键链接
- 包含文档站点、源码、Tushare 官网、MCP 官网

## 插入位置

在现有 README.md 的以下位置插入:

```markdown
(现有内容)

## ✨ 特性

- 🎯 **完整的 TypeScript 类型定义** - 严格模式,零 any 类型泄漏
- 🚀 **现代化工具链** - 基于 Turborepo + rslib + Vitest
...

## 🤖 MCP 服务          <--- 在此处插入新章节

(MCP 章节内容)

## 📦 安装

\```bash
# 使用 pnpm (推荐)
...
```

## 验收标准

- [ ] 章节字数在 200-300 字之间
- [ ] 包含所有 5 个副标题(什么是、功能特性、快速使用、使用示例、相关链接)
- [ ] 配置示例可直接复制粘贴使用
- [ ] 所有外部链接有效
- [ ] 章节位置在"特性"之后,"安装"之前
- [ ] 不重复现有 README 内容
