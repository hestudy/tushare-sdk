# Data Model: 文档站点 MCP 使用指南

**Feature**: 015-mcp
**Date**: 2025-10-14
**Phase**: Phase 1 - 设计与契约

## 概述

本文档定义了 MCP 使用指南功能涉及的文档实体和内容结构。由于本功能为纯文档项目,这里的"数据模型"指的是文档的组织结构、内容实体和它们之间的关系。

## 文档实体

### 1. README MCP 章节 (ReadmeMcpSection)

**位置**: `/README.md` (项目根目录)

**用途**: 在项目 README 中简要介绍 MCP 服务功能,引导用户到详细文档

**内容结构**:
```
## 🤖 MCP 服务 (Model Context Protocol)

### 简介
- [什么是 MCP] (1-2 句话)
- [Tushare MCP 服务的用途] (1-2 句话)

### 快速使用
- [安装命令] (1 行)
- [配置示例] (简化的 JSON 配置,3-5 行)
- [链接到详细文档] (1 行)

### 功能特性
- [支持的工具列表] (bullet points,4 项)
```

**字段说明**:
- **标题**: "🤖 MCP 服务"
- **简介段落**: 引用 research.md 中的 MCP 协议简介 (精简到 50 字以内)
- **快速使用**: 提供最简单的 npx 安装方式和 Claude Desktop 配置示例
- **功能特性**: 列出 4 个主要工具 (query_stock_quote, query_financial, query_kline, query_index)
- **链接**: 指向文档站点的 MCP 使用指南页面

**约束**:
- 总字数不超过 300 字 (保持 README 简洁)
- 不重复现有 README 中的内容
- 不包含详细的配置步骤(留给文档站点)

---

### 2. MCP 使用指南页面 (McpUsageGuidePage)

**位置**: `/apps/docs/docs/guide/mcp-usage.md`

**用途**: 完整的 MCP 服务使用指南,覆盖安装、配置、使用示例、问题排查

**内容结构**:
```
---
title: MCP 使用指南
description: 了解如何通过 MCP 协议在 AI 客户端中使用 Tushare 数据服务
---

## 什么是 MCP (What)
- [MCP 协议简介] (引用 research.md)
- [Tushare MCP 服务说明]
- [支持的功能概述]

## 前置要求 (Prerequisites)
- [Node.js 版本要求]
- [Tushare Token 获取] (链接)
- [AI 客户端要求] (支持 MCP 的客户端列表)

## 安装 (Installation)
- [通过 npm/pnpm 安装]
- [或使用本地开发方式]

## 配置 (Configuration)
### Claude Desktop 配置 (重点)
- [配置文件路径表格] (macOS/Windows/Linux)
- [npx 方式配置示例]
- [本地开发方式配置示例]
- [重启客户端提示]

### 其他客户端配置 (可选)
- [Cursor 配置]
- [VSCode (Cline) 配置]
- [Zed Editor 配置]
- [通用说明]

## 可用工具 (Available Tools)
### 工具列表
- [query_stock_quote]
  - 用途
  - 参数说明 (表格)
  - 参数示例
- [query_financial]
  - 用途
  - 参数说明 (表格)
  - 参数示例
- [query_kline]
  - 用途
  - 参数说明 (表格)
  - 参数示例
- [query_index]
  - 用途
  - 参数说明 (表格)
  - 参数示例

## 使用示例 (Usage Examples)
### 示例 1: 查询股票行情
- [用户问题示例]
- [AI 工具调用说明]
- [返回数据格式示例]

### 示例 2: 查询财务数据
- [用户问题示例]
- [AI 工具调用说明]
- [返回数据格式示例]

### 示例 3: 查询 K 线数据
- [用户问题示例]
- [AI 工具调用说明]
- [返回数据格式示例]

## 进阶配置 (Advanced Configuration)
- [限流参数调整]
- [日志级别设置]
- [环境变量说明]

## 常见问题 (FAQ)
- [Token 无效怎么办?]
- [配置文件找不到怎么办?]
- [服务启动失败怎么办?]
- [如何查看调试日志?]

## 相关链接 (Related Links)
- [MCP 协议官网]
- [Claude Desktop 下载]
- [Tushare Pro 官网]
- [本项目 GitHub]
```

**字段说明**:
- **Frontmatter**: title 和 description (用于 SEO)
- **章节顺序**: 遵循"理解概念 → 准备环境 → 安装 → 配置 → 使用 → 进阶 → 问题排查"的逻辑
- **内容深度**: 每个章节都有详细说明和示例

**约束**:
- 单页内容不超过 5000 字 (满足 Non-Functional Requirements)
- 所有配置示例可直接复制粘贴使用 (满足 SC-007)
- 包含至少 3 个使用示例 (满足 FR-011)
- 提供至少 3 种常见问题排查 (满足 FR-013)

---

### 3. 配置示例实体 (ConfigurationExample)

**用途**: 表示一个可复制粘贴的配置示例

**属性**:
- **客户端名称** (clientName): string (如 "Claude Desktop", "Cursor")
- **操作系统** (os): string | null (如 "macOS", "Windows", "Linux", null 表示通用)
- **配置文件路径** (configFilePath): string (如 "~/Library/Application Support/Claude/...")
- **配置格式** (format): "json" | "yaml"
- **配置内容** (content): string (JSON/YAML 配置文本)
- **部署方式** (deploymentMethod): "npx" | "node" | "docker" (如 "npx", "node")
- **必填环境变量** (requiredEnvVars): string[] (如 ["TUSHARE_TOKEN"])

**实例示例**:

```typescript
// Claude Desktop (macOS) - npx 方式
{
  clientName: "Claude Desktop",
  os: "macOS",
  configFilePath: "~/Library/Application Support/Claude/claude_desktop_config.json",
  format: "json",
  content: `{
  "mcpServers": {
    "tushare": {
      "command": "npx",
      "args": ["-y", "@hestudy/tushare-mcp@latest"],
      "env": {
        "TUSHARE_TOKEN": "your_tushare_token_here"
      }
    }
  }
}`,
  deploymentMethod: "npx",
  requiredEnvVars: ["TUSHARE_TOKEN"]
}

// Claude Desktop (通用) - 本地开发方式
{
  clientName: "Claude Desktop",
  os: null,
  configFilePath: "见上方操作系统路径",
  format: "json",
  content: `{
  "mcpServers": {
    "tushare": {
      "command": "node",
      "args": ["/absolute/path/to/tushare-sdk/apps/tushare-mcp/dist/index.js"],
      "env": {
        "TUSHARE_TOKEN": "your_tushare_token_here"
      }
    }
  }
}`,
  deploymentMethod: "node",
  requiredEnvVars: ["TUSHARE_TOKEN"]
}
```

**约束**:
- 所有 `requiredEnvVars` 必须在 `content` 的 `env` 字段中体现
- 占位符使用 `your_xxx_here` 格式,方便用户识别需要替换的部分
- 路径使用绝对路径 (除非是标准环境变量如 `~` 或 `%APPDATA%`)

---

### 4. 工具说明实体 (ToolDescription)

**用途**: 表示一个 MCP 工具的文档条目

**属性**:
- **工具名称** (toolName): string (如 "query_stock_quote")
- **工具用途** (purpose): string (如 "查询实时股票行情数据")
- **参数列表** (parameters): Parameter[] (参数数组)
- **示例请求** (exampleRequest): object (JSON 格式的示例参数)

**子实体 - Parameter**:
- **参数名** (name): string (如 "ts_code")
- **是否必填** (required): boolean
- **参数类型** (type): string (如 "string", "number")
- **参数说明** (description): string (如 "股票代码,格式如 '600519.SH'")
- **示例值** (exampleValue): string (如 "600519.SH")

**实例示例**:

```typescript
// query_stock_quote 工具
{
  toolName: "query_stock_quote",
  purpose: "查询实时股票行情数据,包括最新价、涨跌幅、成交量等",
  parameters: [
    {
      name: "ts_code",
      required: true,
      type: "string",
      description: "股票代码,格式如 '600519.SH' (上交所) 或 '000001.SZ' (深交所)",
      exampleValue: "600519.SH"
    },
    {
      name: "trade_date",
      required: false,
      type: "string",
      description: "交易日期,格式如 '20251014',不填则返回最新数据",
      exampleValue: "20251014"
    }
  ],
  exampleRequest: {
    ts_code: "600519.SH",
    trade_date: "20251014"
  }
}
```

**约束**:
- 参数说明必须包含格式要求 (如日期格式 YYYYMMDD)
- 示例值必须是真实有效的值 (可通过现有 MCP 服务验证)
- 必填参数在表格中标注 "✅ 必需"

---

### 5. 示例对话实体 (ExampleDialog)

**用途**: 表示一个完整的使用示例对话

**属性**:
- **场景名称** (scenarioName): string (如 "查询股票行情")
- **用户问题** (userQuestion): string (如 "帮我查询贵州茅台最新的股票行情")
- **AI 工具调用** (aiToolCall): object (工具名称和参数)
- **返回数据格式** (responseFormat): string (Markdown 格式的数据示例)
- **说明** (notes): string | null (可选的额外说明)

**实例示例**:

```typescript
// 示例 1: 查询股票行情
{
  scenarioName: "查询股票行情",
  userQuestion: "帮我查询贵州茅台 (600519.SH) 最新的股票行情",
  aiToolCall: {
    toolName: "query_stock_quote",
    parameters: {
      ts_code: "600519.SH"
    }
  },
  responseFormat: `| 字段 | 值 |
|------|-----|
| 股票代码 | 600519.SH |
| 股票名称 | 贵州茅台 |
| 最新价 | 1680.50 |
| 涨跌幅 | +1.23% |
| 成交量 | 1234567 |
| 成交额 | 2.08 亿 |`,
  notes: "数据为模拟示例,实际数据以 Tushare API 返回为准"
}
```

**约束**:
- 用户问题必须使用自然语言,贴近真实场景
- AI 工具调用的参数必须与工具定义一致
- 返回数据格式使用表格或 JSON,清晰易读
- 至少提供 3 个示例,覆盖不同工具 (满足 FR-011)

---

## 文档实体关系图

```
ReadmeMcpSection (README 中的 MCP 章节)
    |
    | [links to]
    |
    v
McpUsageGuidePage (文档站点 MCP 使用指南)
    |
    |-- contains --> ConfigurationExample (配置示例) [多个]
    |                   |
    |                   |-- for clients: Claude Desktop, Cursor, VSCode, Zed
    |                   |-- for deployment: npx, node
    |
    |-- contains --> ToolDescription (工具说明) [4 个]
    |                   |
    |                   |-- tools: query_stock_quote, query_financial, query_kline, query_index
    |                   |-- each contains --> Parameter[] (参数列表)
    |
    |-- contains --> ExampleDialog (示例对话) [至少 3 个]
                        |
                        |-- scenarios: 股票行情、财务数据、K线数据
```

## 文档内容验证规则

### 验证规则 1: 配置示例完整性

**规则**: 所有配置示例必须包含:
- 配置文件路径 (根据操作系统)
- 完整的 JSON 配置 (可直接复制粘贴)
- 必填环境变量说明 (如 TUSHARE_TOKEN)
- 重启客户端的提示

**验证方式**: 手动检查每个配置示例是否包含上述 4 项

### 验证规则 2: 工具参数说明完整性

**规则**: 每个工具的参数说明必须包含:
- 参数名称
- 是否必填
- 参数类型
- 参数说明 (包含格式要求)
- 示例值

**验证方式**: 检查工具说明表格是否包含上述 5 列

### 验证规则 3: 示例对话可执行性

**规则**: 每个示例对话必须:
- 用户问题真实自然
- 工具调用参数有效 (可通过现有 MCP 服务验证)
- 返回数据格式清晰

**验证方式**: 在本地 MCP 服务中实际执行工具调用,验证参数有效性

### 验证规则 4: 外部链接有效性

**规则**: 所有外部链接必须:
- 可访问 (HTTP 200 状态)
- 指向官方或权威来源
- 在文档中正确引用 (Markdown 链接语法)

**验证方式**: 使用链接检查工具或手动访问验证

### 验证规则 5: 文档长度控制

**规则**:
- README MCP 章节不超过 300 字
- MCP 使用指南页面不超过 5000 字

**验证方式**: 使用字数统计工具 (如 `wc -m`)

## 数据来源

所有文档内容基于以下来源:

1. **现有 MCP 服务文档**: `apps/tushare-mcp/README.md`
   - 工具列表和参数说明
   - 配置示例
   - 错误处理说明

2. **Phase 0 研究结果**: `specs/015-mcp/research.md`
   - MCP 协议简介
   - 多客户端配置路径
   - 外部参考链接

3. **功能规格说明**: `specs/015-mcp/spec.md`
   - 用户故事和场景
   - 功能需求 (FR-001 ~ FR-015)
   - 成功标准 (SC-001 ~ SC-007)

---

**Phase 1 任务**: ✅ 数据模型定义完成
**下一步**: 生成文档大纲 (contracts/)
