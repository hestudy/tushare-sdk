# Contract: MCP 使用指南大纲

**文件路径**: `/apps/docs/docs/guide/mcp-usage.md`
**目标字数**: 3000-5000 字
**目标阅读时间**: 10-15 分钟

## Frontmatter

```yaml
---
title: MCP 使用指南
description: 了解如何通过 MCP 协议在 AI 客户端中使用 Tushare 数据服务
---
```

## 文档结构

### 1. 页面标题

```markdown
# MCP 使用指南
```

### 2. 简介 (Introduction)

```markdown
本指南将帮助你在 AI 客户端(如 Claude Desktop)中配置和使用 Tushare MCP 服务,实现 AI 助手直接查询 A 股市场数据的能力。

**预计完成时间**: 15 分钟
**前置要求**: Node.js 18+, 有效的 Tushare API Token
```

**内容要点**:
- 一句话说明文档用途
- 标注预计完成时间和前置要求

### 3. 什么是 MCP (What is MCP)

```markdown
## 什么是 MCP

[MCP(Model Context Protocol,模型上下文协议)](https://modelcontextprotocol.io) 是一个开源标准协议...

### Tushare MCP 服务

Tushare MCP 服务是基于 MCP 协议实现的 A 股市场数据服务器,为 AI 模型提供以下能力:

- 📈 查询实时股票行情
- 💰 查询公司财务报表
- 📊 查询历史 K 线数据
- 📉 查询市场指数行情
```

**内容要点**:
- 引用 research.md 中的 MCP 协议简介(150 字)
- 说明 Tushare MCP 服务的具体功能(4 项)
- 提供 MCP 协议官网链接

**字数**: 200-300 字

### 4. 前置要求 (Prerequisites)

```markdown
## 前置要求

在开始之前,请确保你已具备以下条件:

### 1. Node.js 环境

- **版本要求**: Node.js 18.0.0 或更高版本
- **安装验证**: 运行 `node --version` 检查版本

### 2. Tushare API Token

Tushare API Token 是访问 Tushare Pro 数据的唯一凭证。

**获取步骤**:
1. 访问 [Tushare Pro 官网](https://tushare.pro/register) 注册账号
2. 登录后进入个人中心
3. 点击"接口 TOKEN"复制你的 Token

**积分说明**: 新注册用户有 100 积分,可以查询基础数据。部分高级数据需要更高积分等级。

### 3. 支持 MCP 的 AI 客户端

本指南重点介绍 Claude Desktop 的配置,同时支持以下客户端:

- [Claude Desktop](https://claude.ai/download) ⭐ 推荐
- [Cursor](https://cursor.sh)
- [VSCode with Cline](https://marketplace.visualstudio.com/items?itemName=saoudrizwan.claude-dev)
- [Zed Editor](https://zed.dev)

更多客户端请查看 [MCP 客户端总览](https://modelcontextprotocol.io/clients)。
```

**内容要点**:
- 明确列出 3 个前置条件
- 提供 Tushare Token 获取的详细步骤
- 列出支持的 AI 客户端(重点推荐 Claude Desktop)
- 所有外部链接可点击

**字数**: 300-400 字

### 5. 安装 (Installation)

```markdown
## 安装

Tushare MCP 服务支持两种部署方式:

### 方式 1: 通过 npm 安装(推荐)

适用于生产使用和快速体验。

\```bash
# 使用 pnpm
pnpm add -g @hestudy/tushare-mcp

# 使用 npm
npm install -g @hestudy/tushare-mcp
\```

### 方式 2: 本地开发

适用于需要修改源码或参与开发的场景。

\```bash
# 克隆仓库
git clone https://github.com/your-org/tushare-sdk.git
cd tushare-sdk

# 安装依赖
pnpm install

# 构建 MCP 服务
cd apps/tushare-mcp
pnpm build
\```

构建完成后,服务入口文件位于 `apps/tushare-mcp/dist/index.js`。
```

**内容要点**:
- 提供两种安装方式
- 说明各自的适用场景
- 提供清晰的命令行指令

**字数**: 150-200 字

### 6. 配置 (Configuration)

```markdown
## 配置

### Claude Desktop 配置

Claude Desktop 是使用 MCP 服务最便捷的方式,以下是详细配置步骤。

#### 步骤 1: 找到配置文件

根据你的操作系统,配置文件位于:

| 操作系统 | 配置文件路径 |
|---------|-------------|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` 或<br>`C:\Users\你的用户名\AppData\Roaming\Claude\claude_desktop_config.json` |
| Linux | `~/.config/Claude/claude_desktop_config.json` |

**快捷访问**: 打开 Claude Desktop → 设置 → Developer → 点击 "Edit Config" 按钮

#### 步骤 2: 编辑配置文件

##### 使用 npx 方式(推荐)

无需预先安装,每次启动时自动下载最新版本:

\```json
{
  "mcpServers": {
    "tushare": {
      "command": "npx",
      "args": [
        "-y",
        "@hestudy/tushare-mcp"
      ],
      "env": {
        "TUSHARE_TOKEN": "your_tushare_token_here"
      }
    }
  }
}
\```

##### 使用本地开发方式

适用于需要调试或修改源码的场景:

\```json
{
  "mcpServers": {
    "tushare": {
      "command": "node",
      "args": [
        "/Users/your-username/path/to/tushare-sdk/apps/tushare-mcp/dist/index.js"
      ],
      "env": {
        "TUSHARE_TOKEN": "your_tushare_token_here"
      }
    }
  }
}
\```

**重要提示**:
- 将 `your_tushare_token_here` 替换为你的实际 Tushare Token
- 本地开发方式需要使用绝对路径
- Windows 用户路径示例: `C:\\Users\\your-username\\tushare-sdk\\apps\\tushare-mcp\\dist\\index.js`(注意双反斜杠)

#### 步骤 3: 重启 Claude Desktop

保存配置文件后,**完全退出** Claude Desktop 并重新启动,新配置才会生效。

**验证方法**: 在 Claude 对话中输入 "你现在可以使用哪些工具?",如果看到 Tushare 相关工具,说明配置成功。

### 其他客户端配置

<details>
<summary>Cursor 配置</summary>

**配置文件位置**:
- 全局配置: `~/.cursor/mcp.json`
- 项目配置: `<project-root>/.cursor/mcp.json`

**配置内容** (与 Claude Desktop 相同):

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

</details>

<details>
<summary>VSCode with Cline 配置</summary>

**配置方式**:
1. 点击 Cline 面板顶部的 "MCP Servers" 图标
2. 选择 "Installed" 标签
3. 点击 "Configure MCP Servers"
4. 添加以下配置

**配置文件**: `cline_mcp_settings.json`

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

**提示**: Cline 支持单独启用/禁用每个 MCP 服务器。

</details>

<details>
<summary>Zed Editor 配置</summary>

**配置文件**: `settings.json`

**访问方式**: `Cmd/Ctrl + ,` 或运行命令 `zed: open settings`

**配置内容**:

\```json
{
  "context_servers": {
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

</details>

更多客户端的配置方式,请参考 [MCP 官方文档](https://modelcontextprotocol.io/docs)。
```

**内容要点**:
- 重点详细说明 Claude Desktop 配置(满足 FR-007)
- 提供不同操作系统的路径表格(满足 FR-008)
- 提供两种部署方式的配置示例
- 强调重启客户端的必要性
- 其他客户端使用折叠块展示

**字数**: 800-1000 字

### 7. 可用工具 (Available Tools)

```markdown
## 可用工具

Tushare MCP 服务提供以下 4 个工具,可在 AI 对话中自动调用。

### 1. query_stock_quote - 股票行情查询

查询实时股票行情数据,包括最新价、涨跌幅、成交量等。

**参数说明**:

| 参数名 | 是否必填 | 类型 | 说明 | 示例值 |
|-------|---------|------|------|--------|
| ts_code | ✅ 必需 | string | 股票代码,格式如 '600519.SH'(上交所)或 '000001.SZ'(深交所) | `600519.SH` |
| trade_date | ⚪ 可选 | string | 交易日期,格式如 '20251014',不填则返回最新数据 | `20251014` |

**示例参数**:

\```json
{
  "ts_code": "600519.SH",
  "trade_date": "20251014"
}
\```

### 2. query_financial - 财务数据查询

查询公司财务报表数据,支持利润表、资产负债表、现金流量表。

**参数说明**:

| 参数名 | 是否必填 | 类型 | 说明 | 示例值 |
|-------|---------|------|------|--------|
| ts_code | ✅ 必需 | string | 股票代码 | `600519.SH` |
| period | ✅ 必需 | string | 报告期,格式如 '20231231'(季度末日期) | `20231231` |
| report_type | ✅ 必需 | string | 报表类型: "income"(利润表), "balance"(资产负债表), "cashflow"(现金流量表) | `income` |

**示例参数**:

\```json
{
  "ts_code": "600519.SH",
  "period": "20231231",
  "report_type": "income"
}
\```

### 3. query_kline - K线数据查询

查询历史 K 线数据,支持日线、周线、月线。

**参数说明**:

| 参数名 | 是否必填 | 类型 | 说明 | 示例值 |
|-------|---------|------|------|--------|
| ts_code | ✅ 必需 | string | 股票代码 | `600519.SH` |
| start_date | ✅ 必需 | string | 开始日期,格式如 '20251001' | `20251001` |
| end_date | ✅ 必需 | string | 结束日期,格式如 '20251014' | `20251014` |
| freq | ⚪ 可选 | string | K线频率: "D"(日线), "W"(周线), "M"(月线),默认 "D" | `D` |

**示例参数**:

\```json
{
  "ts_code": "600519.SH",
  "start_date": "20251001",
  "end_date": "20251014",
  "freq": "D"
}
\```

### 4. query_index - 市场指数查询

查询市场指数行情数据,如上证指数、深证成指、创业板指等。

**参数说明**:

| 参数名 | 是否必填 | 类型 | 说明 | 示例值 |
|-------|---------|------|------|--------|
| ts_code | ✅ 必需 | string | 指数代码,如 '000001.SH'(上证指数) | `000001.SH` |
| trade_date | ⚪ 可选 | string | 交易日期,格式如 '20251014' | `20251014` |

**常用指数代码**:
- `000001.SH`: 上证指数
- `399001.SZ`: 深证成指
- `399006.SZ`: 创业板指
- `000300.SH`: 沪深300
- `000016.SH`: 上证50

**示例参数**:

\```json
{
  "ts_code": "000001.SH",
  "trade_date": "20251014"
}
\```
```

**内容要点**:
- 列出所有 4 个工具(满足 FR-009)
- 每个工具提供完整的参数表格(满足 FR-010)
- 参数表格包含:参数名、是否必填、类型、说明、示例值
- 提供 JSON 格式的示例参数

**字数**: 600-800 字

### 8. 使用示例 (Usage Examples)

```markdown
## 使用示例

以下是典型的使用场景示例,展示如何在 AI 对话中使用 Tushare MCP 服务。

### 示例 1: 查询股票行情

**用户提问**:

> "帮我查询贵州茅台 (600519.SH) 最新的股票行情"

**AI 工具调用**:

AI 会自动调用 `query_stock_quote` 工具:

\```json
{
  "tool": "query_stock_quote",
  "parameters": {
    "ts_code": "600519.SH"
  }
}
\```

**返回数据示例**:

AI 会收到类似以下的数据并为你分析:

| 字段 | 值 |
|------|-----|
| 股票代码 | 600519.SH |
| 股票名称 | 贵州茅台 |
| 最新价 | 1680.50 元 |
| 涨跌幅 | +1.23% |
| 成交量 | 1,234,567 股 |
| 成交额 | 20.8 亿元 |

### 示例 2: 查询财务数据

**用户提问**:

> "查询平安银行 2023 年年报的利润表数据"

**AI 工具调用**:

\```json
{
  "tool": "query_financial",
  "parameters": {
    "ts_code": "000001.SZ",
    "period": "20231231",
    "report_type": "income"
  }
}
\```

**返回数据示例**:

| 财务指标 | 金额(亿元) |
|---------|----------|
| 营业总收入 | 1,856.32 |
| 营业利润 | 523.45 |
| 利润总额 | 530.12 |
| 净利润 | 450.87 |

### 示例 3: 查询 K 线数据

**用户提问**:

> "获取上证指数最近一个月的日线数据"

**AI 工具调用**:

\```json
{
  "tool": "query_kline",
  "parameters": {
    "ts_code": "000001.SH",
    "start_date": "20250914",
    "end_date": "20251014",
    "freq": "D"
  }
}
\```

**返回数据示例**:

AI 会收到 20+ 条 K 线数据,包含:

| 字段 | 说明 |
|------|------|
| trade_date | 交易日期 |
| open | 开盘价 |
| high | 最高价 |
| low | 最低价 |
| close | 收盘价 |
| volume | 成交量 |

AI 可以基于这些数据分析趋势、计算涨跌幅等。

### 更多使用技巧

- **组合查询**: 你可以在一次对话中要求 AI 查询多只股票,AI 会自动调用多次工具
- **数据分析**: AI 不仅返回数据,还能帮你分析财务指标、计算涨跌幅、绘制趋势图等
- **自然语言**: 无需记忆参数格式,用自然语言描述你的需求即可
```

**内容要点**:
- 提供至少 3 个示例(满足 FR-011)
- 每个示例包含:用户提问、AI 工具调用、返回数据格式(满足 FR-012)
- 覆盖主要工具(股票行情、财务数据、K线数据)
- 使用表格清晰展示数据格式

**字数**: 600-800 字

### 9. 进阶配置 (Advanced Configuration)

```markdown
## 进阶配置

### 环境变量说明

除了 `TUSHARE_TOKEN`,还可以配置以下环境变量:

| 环境变量 | 说明 | 默认值 | 示例 |
|---------|------|--------|------|
| `TUSHARE_TOKEN` | Tushare API Token | (必需) | `your_token_here` |
| `LOG_LEVEL` | 日志级别 | `info` | `debug` / `info` / `warn` / `error` |
| `RATE_LIMIT_MAX_REQUESTS` | 限流:最大请求数 | `100` | `200` |
| `RATE_LIMIT_WINDOW_MS` | 限流:时间窗口(毫秒) | `60000` | `60000` |

### 调整限流参数

如果你的 Tushare 积分等级较高,可以调整限流参数提升性能:

\```json
{
  "mcpServers": {
    "tushare": {
      "command": "npx",
      "args": ["-y", "@hestudy/tushare-mcp"],
      "env": {
        "TUSHARE_TOKEN": "your_token",
        "RATE_LIMIT_MAX_REQUESTS": "200",
        "RATE_LIMIT_WINDOW_MS": "60000"
      }
    }
  }
}
\```

**积分等级参考**:
- 100 积分: 1 次/秒 (默认配置已足够)
- 2000 积分: 5 次/秒 (可设置 `MAX_REQUESTS=300`)
- 5000 积分: 20 次/秒 (可设置 `MAX_REQUESTS=1200`)

### 调试日志

如需查看详细的调试日志,设置 `LOG_LEVEL=debug`:

\```json
{
  "env": {
    "TUSHARE_TOKEN": "your_token",
    "LOG_LEVEL": "debug"
  }
}
\```

日志文件位置:
- macOS/Linux: `~/Library/Logs/Claude/mcp-server-tushare.log`
- Windows: `%APPDATA%\Claude\Logs\mcp-server-tushare.log`
```

**内容要点**:
- 说明所有可配置的环境变量(满足 FR-014)
- 提供限流参数调整示例
- 说明日志级别设置和日志文件位置

**字数**: 300-400 字

### 10. 常见问题 (FAQ)

```markdown
## 常见问题

### Q1: Token 无效或认证失败

**错误信息**: "Authentication failed" 或 "Invalid token"

**解决方案**:
1. 检查 Token 是否正确复制(无多余空格)
2. 访问 [Tushare Pro](https://tushare.pro) 登录账号,在个人中心确认 Token
3. 如果 Token 已泄露,可以在个人中心点击"刷新"生成新 Token
4. 确认账号状态是否正常(未被封禁)

### Q2: 配置文件找不到或修改不生效

**问题描述**: 找不到配置文件,或者修改后没有效果

**解决方案**:
1. **找不到文件**: 参考本文档"配置"章节的路径表格,确保路径正确
   - macOS: `~/Library/Application Support/Claude/` (注意 `Library` 是隐藏文件夹)
   - Windows: 在文件管理器地址栏输入 `%APPDATA%\Claude`
2. **修改不生效**: 确保完全退出 Claude Desktop(不是最小化),然后重新启动
3. **JSON 格式错误**: 使用 JSON 验证工具检查配置文件语法是否正确

### Q3: MCP 服务启动失败

**错误信息**: "Failed to start MCP server" 或连接超时

**解决方案**:
1. **Node.js 版本**: 确认 Node.js 版本 >= 18.0.0 (`node --version`)
2. **网络问题**: npx 方式需要联网下载,确保网络畅通
3. **路径问题**: 本地开发方式需要使用绝对路径,检查路径是否正确
4. **查看日志**: 设置 `LOG_LEVEL=debug` 并查看日志文件定位问题

### Q4: 查询返回空数据

**问题描述**: 工具调用成功,但返回的数据为空

**可能原因**:
1. **非交易日**: 查询的日期是周末或节假日,没有交易数据
2. **参数格式错误**: 检查日期格式是否为 `YYYYMMDD`(如 `20251014`)
3. **股票代码错误**: 确认股票代码格式正确(如 `600519.SH` 而非 `600519`)
4. **积分不足**: 某些高级数据(如每日指标)需要更高的积分等级

**解决方案**: 先查询交易日历确认是否为交易日,然后检查参数格式

### Q5: 如何查看 AI 调用了哪些工具?

**方法**:
1. 在 Claude 对话中直接询问: "你刚才调用了哪些工具?"
2. 查看 Claude Desktop 的 Developer 面板(如果支持)
3. 设置 `LOG_LEVEL=debug` 查看详细日志

### Q6: 支持哪些 AI 客户端?

**官方支持**:
- Claude Desktop (推荐)
- Cursor
- VSCode with Cline
- Zed Editor

**理论支持**: 所有符合 MCP 协议标准的客户端都应该可以使用,具体配置方式可能有差异。

更多问题请访问 [GitHub Issues](https://github.com/your-org/tushare-sdk/issues)。
```

**内容要点**:
- 提供至少 3 种常见问题(满足 FR-013)
- 每个问题包含:问题描述、可能原因、解决方案
- 覆盖 Token 错误、配置问题、启动失败、数据为空等场景

**字数**: 500-600 字

### 11. 相关链接 (Related Links)

```markdown
## 相关链接

### 官方资源

- **MCP 协议**: https://modelcontextprotocol.io
- **MCP 官方文档**: https://modelcontextprotocol.io/docs
- **MCP 客户端总览**: https://modelcontextprotocol.io/clients

### Tushare Pro

- **Tushare Pro 官网**: https://tushare.pro
- **注册获取 Token**: https://tushare.pro/register
- **Tushare 文档**: https://tushare.pro/document/2

### AI 客户端

- **Claude Desktop**: https://claude.ai/download
- **Cursor**: https://cursor.sh
- **VSCode Cline**: https://docs.cline.bot
- **Zed Editor**: https://zed.dev

### 本项目

- **GitHub 仓库**: https://github.com/your-org/tushare-sdk
- **MCP 服务源码**: https://github.com/your-org/tushare-sdk/tree/main/apps/tushare-mcp
- **Tushare SDK 文档**: /guide/quick-start
- **问题反馈**: https://github.com/your-org/tushare-sdk/issues
```

**内容要点**:
- 包含所有必需的外部链接(满足 FR-015)
- 分类组织:官方资源、Tushare、AI 客户端、本项目
- 所有链接可点击

**字数**: 100-150 字

## 验收标准

- [ ] 文档字数在 3000-5000 字之间
- [ ] 包含所有 11 个章节
- [ ] 至少 3 个使用示例,覆盖不同工具
- [ ] 至少 3 种常见问题排查
- [ ] 所有配置示例可直接复制粘贴
- [ ] 所有外部链接有效
- [ ] 代码块正确使用语言标识
- [ ] 表格格式规范
- [ ] Frontmatter 包含 title 和 description

## 估计字数分布

| 章节 | 估计字数 |
|-----|---------|
| 简介 | 100 |
| 什么是 MCP | 250 |
| 前置要求 | 350 |
| 安装 | 180 |
| 配置 | 950 |
| 可用工具 | 700 |
| 使用示例 | 700 |
| 进阶配置 | 350 |
| 常见问题 | 550 |
| 相关链接 | 120 |
| **总计** | **~4250** |
