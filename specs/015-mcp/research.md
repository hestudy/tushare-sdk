# Research: 文档站点 MCP 使用指南

**Feature**: 015-mcp
**Date**: 2025-10-14
**Status**: Phase 0 完成

## 研究目标

本阶段研究旨在为文档编写提供充分的技术依据和最佳实践指导,包括:
1. MCP 协议的简介内容和外部资源链接
2. 多客户端配置路径和格式规范
3. rspress 文档站点的配置最佳实践

## 研究任务 1: MCP 协议简介和外部资源整理

### 决策: MCP 协议简介内容

**选定内容** (适合在文档中使用的中文简介):

> MCP(Model Context Protocol,模型上下文协议)是一个开源标准协议,用于连接 AI 应用程序与外部系统。它就像 AI 应用的"USB-C 接口",为 AI 模型提供标准化的方式来访问数据源(如 Google Calendar、Notion)和工具(如搜索引擎、计算器)。通过 MCP,开发者可以构建个性化的 AI 助手、企业聊天机器人、AI 驱动的设计和创作工具,使 AI 能够安全、可控地与各种系统和工作流程集成。

**核心概念** (文档中需要说明):
- **Servers(服务器)**: 暴露数据和工具的系统 (如本项目的 Tushare MCP 服务)
- **Clients(客户端)**: 连接到服务器的 AI 应用程序 (如 Claude Desktop)
- **Resources(资源)**: 数据源,如日历、文档、数据库
- **Tools(工具)**: 外部系统功能,如搜索、计算、API 调用

**理由**:
- 简洁易懂,避免过多技术术语
- 使用"USB-C 接口"比喻降低理解门槛
- 涵盖核心概念和主要用途
- 字数适中(约 150 字),适合文档引言部分

**备选方案**:
- 直接链接到 MCP 官网,不提供简介 → 拒绝,用户可能不愿意跳转,导致理解困难

### 决策: 外部参考链接

**MCP 协议官方资源**:
- 主站: https://modelcontextprotocol.io
- 官方文档: https://modelcontextprotocol.io/docs
- Claude Desktop 配置文档: https://support.claude.com/en/articles/10949351-getting-started-with-local-mcp-servers-on-claude-desktop
- MCP 客户端总览: https://modelcontextprotocol.io/clients

**Tushare 相关链接**:
- Tushare Pro 官网: https://tushare.pro
- 注册页面: https://tushare.pro/register
- 快速开始文档: https://tushare.pro/document/1?doc_id=39

**AI 客户端下载链接**:
- Claude Desktop: https://claude.ai/download
- VSCode Cline 文档: https://docs.cline.bot/mcp/configuring-mcp-servers
- Cursor AI MCP 目录: https://cursor.directory/mcp
- Zed Editor MCP 文档: https://zed.dev/docs/ai/mcp

**理由**: 所有链接均为官方来源,确保权威性和稳定性

## 研究任务 2: 多客户端配置示例调研

### 决策: Claude Desktop 配置文件路径

**标准路径清单**:

| 操作系统 | 配置文件完整路径 | 官方支持状态 |
|---------|----------------|------------|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` | ✅ 官方支持 |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` | ✅ 官方支持 |
| Linux | `~/.config/Claude/claude_desktop_config.json` | ⚠️ 社区支持 (遵循 XDG 规范) |

**快捷访问方式**:
- 通过 Claude Desktop 设置菜单 → Developer 选项卡 → "Edit Config" 按钮
- 修改后需要完全退出并重启 Claude Desktop 才能生效

**理由**:
- 覆盖所有主流操作系统 (满足 spec.md FR-008 要求)
- 提供两种访问方式 (GUI + 直接编辑),适应不同用户习惯
- Linux 路径标注为社区支持,避免误导

**备选方案**:
- 仅提供 macOS 和 Windows 路径 → 拒绝,部分用户可能使用 Linux

### 决策: 其他 MCP 客户端配置方式

**支持的客户端清单**:

1. **VSCode with Cline** (重点推荐):
   - 配置文件: `cline_mcp_settings.json`
   - 访问方式: Cline 面板顶部 "MCP Servers" 图标 → "Configure MCP Servers"
   - 特点: 内置 MCP Marketplace,支持单个服务器启用/禁用

2. **Cursor AI**:
   - 配置文件: `~/.cursor/mcp.json` (全局) 或 `<project>/.cursor/mcp.json` (项目)
   - 格式: 与 Claude Desktop 相同 (`mcpServers` 键)

3. **Zed Editor**:
   - 配置文件: `settings.json`
   - 访问方式: `Cmd/Ctrl + ,` 或 `zed: open settings` 命令
   - 格式: 使用 `context_servers` 键

4. **VSCode (原生 MCP 支持)**:
   - 配置文件: 通过命令面板运行 `MCP: Open User Configuration`
   - 格式: 使用 `servers` 键 (注意与 Claude Desktop 不同)
   - 特点: 支持 `inputs` 变量系统处理敏感信息

**理由**:
- Cline 是 VSCode 中最流行的 AI 代码助手扩展,值得重点说明
- Cursor 和 Zed 是常用的 AI 代码编辑器
- VSCode 原生支持为 2024 年底新增功能,值得提及

**备选方案**:
- 为所有客户端提供详细配置 → 拒绝,文档会过长且维护成本高
- 只提供 Claude Desktop 配置 → 拒绝,不满足 spec.md 对多客户端支持的要求

### 决策: 配置文件格式和关键字段

**标准 JSON Schema** (Claude Desktop / Cursor / Cline 使用):

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "@org/package-name", "arg1"],
      "env": {
        "API_KEY": "your-api-key",
        "ENV_VAR": "value"
      },
      "timeout": 60000
    }
  }
}
```

**关键字段说明**:
- `command`: 启动 MCP 服务器的命令 (如 `npx`, `node`, `python`, `docker`)
- `args`: 命令行参数数组 (必须为数组,即使只有一个参数)
- `env`: 环境变量对象 (用于传递 API Token 等敏感信息)
- `timeout`: 超时时间,单位毫秒 (可选)

**VSCode 格式差异**:

```json
{
  "servers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "@org/package-name"],
      "env": {
        "API_KEY": "${input:api-key}"
      }
    }
  },
  "inputs": [
    {
      "type": "promptString",
      "id": "api-key",
      "description": "Your API Key",
      "password": true
    }
  ]
}
```

**关键差异**:
- 顶层键名: `mcpServers` vs `servers`
- VSCode 支持 `inputs` 系统安全处理敏感信息

**理由**:
- 明确区分两种主要格式,避免用户混淆
- 重点说明 `env` 字段用于传递 Token (满足 spec.md FR-006 要求)
- VSCode 的 `inputs` 系统提供更好的安全性

### 决策: 配置示例结构

**推荐结构** (文档中使用):

```markdown
## 配置

### Claude Desktop 配置

**配置文件位置**:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

**快捷访问**: 设置 → Developer → Edit Config

**配置示例**:
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

**本地开发配置** (可选):
```json
{
  "mcpServers": {
    "tushare": {
      "command": "node",
      "args": ["/absolute/path/to/tushare-sdk/apps/tushare-mcp/dist/index.js"],
      "env": {
        "TUSHARE_TOKEN": "your_tushare_token_here"
      }
    }
  }
}
```

**重启客户端**: 保存配置后,完全退出并重启 Claude Desktop

### 其他客户端配置

<折叠块:Cursor / VSCode / Zed 配置示例>
```

**理由**:
- 重点展示 Claude Desktop 配置 (主流客户端)
- 提供两种部署方式 (npx + 本地开发),满足不同场景
- 使用表格清晰展示不同操作系统的路径
- 强调"重启客户端"的必要性 (常见遗漏步骤)
- 其他客户端使用折叠块减少篇幅

**备选方案**:
- 所有客户端平铺展示 → 拒绝,文档过长影响阅读体验
- 只提供 npx 方式 → 拒绝,本地开发者需要直接运行 dist/index.js

## 研究任务 3: rspress 文档站点配置最佳实践

### 决策: 侧边栏配置语法

**rspress.config.ts 中的侧边栏配置**:

```typescript
themeConfig: {
  sidebar: {
    '/guide/': [
      {
        text: '快速入门',
        items: [
          { text: '安装', link: '/guide/installation' },
          { text: '快速开始', link: '/guide/quick-start' },
          { text: '配置', link: '/guide/configuration' },
          { text: '错误处理', link: '/guide/error-handling' },
          { text: 'MCP 使用指南', link: '/guide/mcp-usage' }, // 新增
        ],
      },
    ],
  },
}
```

**理由**:
- MCP 使用指南放在"快速入门"组的最后,逻辑顺序合理 (基础 SDK 使用 → MCP 服务使用)
- 使用 `/guide/mcp-usage` 路径,与文件路径 `docs/guide/mcp-usage.md` 对应
- 保持与现有侧边栏配置的一致性

**备选方案**:
- 新建独立的"MCP 服务"分组 → 拒绝,内容较少无需单独分组
- 放在 API 文档部分 → 拒绝,MCP 是使用指南而非 API 参考

### 决策: Markdown frontmatter 使用

**MCP 使用指南的 frontmatter**:

```yaml
---
title: MCP 使用指南
description: 了解如何通过 MCP 协议在 AI 客户端中使用 Tushare 数据服务
---
```

**理由**:
- `title`: 用于页面标题和浏览器标签
- `description`: 用于 SEO 和搜索结果摘要
- 保持简洁,不添加不必要的字段

**备选方案**:
- 添加更多 frontmatter 字段 (如 `keywords`, `author`) → 拒绝,rspress 不强制要求,保持简洁

### 决策: 代码高亮和代码块最佳实践

**JSON 配置示例** (使用 `json` 语言标识):

````markdown
```json
{
  "mcpServers": {
    "tushare": {
      "command": "npx",
      "args": ["-y", "@hestudy/tushare-mcp"]
    }
  }
}
```
````

**Bash 命令示例** (使用 `bash` 语言标识):

````markdown
```bash
pnpm install @hestudy/tushare-mcp
```
````

**TypeScript 示例** (使用 `typescript` 语言标识):

````markdown
```typescript
import { TushareClient } from '@hestudy/tushare-sdk';
```
````

**理由**:
- rspress 基于 rspack,支持所有主流语言的语法高亮
- 正确的语言标识提供更好的阅读体验
- 已在 rspress.config.ts 中配置 `showLineNumbers: true`,代码块自动显示行号

**备选方案**:
- 不指定语言标识 → 拒绝,失去语法高亮效果

## 研究总结

### 关键决策汇总

| 决策点 | 选定方案 | 理由 |
|-------|---------|------|
| MCP 简介位置 | 文档中直接提供 150 字简介 | 降低理解门槛,避免跳转 |
| 主要配置客户端 | 详细说明 Claude Desktop,其他提供通用说明 | 主流客户端优先,减少文档复杂度 |
| 配置文件路径展示 | 表格形式展示所有操作系统 | 清晰易查,满足 FR-008 要求 |
| 部署方式 | 提供 npx + 本地开发两种方式 | 覆盖生产使用和本地开发场景 |
| 侧边栏位置 | 放在"快速入门"组的最后 | 逻辑顺序合理,易于发现 |
| 代码高亮 | 使用正确的语言标识 (`json`, `bash`, `typescript`) | 提供最佳阅读体验 |

### 需要在 Phase 1 明确的内容

Phase 0 已解决所有技术调研问题,无遗留的 "NEEDS CLARIFICATION" 项。Phase 1 将基于本研究结果生成:

1. **data-model.md**: 文档结构和内容框架
   - README MCP 章节的具体内容框架
   - MCP 使用指南的详细章节结构
   - 配置示例的组织方式

2. **contracts/**: 文档大纲和配置修改清单
   - `readme-mcp-section.md`: 项目 README 中 MCP 章节的大纲
   - `mcp-usage-guide-outline.md`: 文档站点 MCP 使用指南的详细大纲
   - `rspress-config-changes.md`: rspress.config.ts 的修改清单

3. **quickstart.md**: 验证步骤
   - 如何验证文档站点构建成功
   - 如何在本地预览文档站点
   - 如何验证配置示例可用

### 外部资源链接清单

**必须在文档中包含的链接** (满足 spec.md FR-015 要求):

- [MCP 协议官网](https://modelcontextprotocol.io)
- [MCP 官方文档](https://modelcontextprotocol.io/docs)
- [Claude Desktop 配置文档](https://support.claude.com/en/articles/10949351-getting-started-with-local-mcp-servers-on-claude-desktop)
- [Tushare Pro 官网](https://tushare.pro)
- [Tushare Token 获取](https://tushare.pro/register)
- [Claude Desktop 下载](https://claude.ai/download)

**可选链接** (进阶用户参考):

- [MCP 客户端总览](https://modelcontextprotocol.io/clients)
- [VSCode Cline 文档](https://docs.cline.bot/mcp/configuring-mcp-servers)
- [Cursor AI MCP 目录](https://cursor.directory/mcp)
- [Zed Editor MCP 文档](https://zed.dev/docs/ai/mcp)

---

**Phase 0 状态**: ✅ 完成
**下一步**: 执行 Phase 1 - 设计与契约
