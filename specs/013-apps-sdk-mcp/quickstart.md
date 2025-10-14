# Quick Start: Tushare MCP 服务器

本指南将帮助你在 10 分钟内完成从安装到首次成功查询 Tushare 数据的完整流程。

## Prerequisites

在开始之前,请确保你的环境满足以下要求:

- **Node.js**: 18.0.0 或更高版本(LTS 推荐)
- **pnpm**: 8.0.0 或更高版本
- **Tushare Token**: 有效的 Tushare Pro API Token([获取方式](https://tushare.pro/register))
- **AI 客户端**: Claude Desktop、Cline VSCode 扩展或其他支持 MCP 的客户端

检查你的环境:

```bash
node --version  # 应显示 v18.x.x 或更高
pnpm --version  # 应显示 8.x.x 或更高
```

## Step 1: 安装项目依赖

如果你是首次克隆仓库,需要先安装所有依赖:

```bash
# 克隆仓库(如果尚未克隆)
git clone https://github.com/your-username/tushare-sdk.git
cd tushare-sdk

# 安装所有 workspace 依赖
pnpm install
```

## Step 2: 构建 Tushare SDK 核心包

MCP 服务器依赖 `@hestudy/tushare-sdk` 核心包,需要先构建:

```bash
# 构建核心 SDK(如果尚未构建)
pnpm --filter @hestudy/tushare-sdk build
```

## Step 3: 配置 Tushare Token

创建 `.env` 文件配置你的 Tushare API Token:

```bash
cd apps/tushare-mcp
cp .env.example .env
```

编辑 `.env` 文件,填入你的 Token:

```env
# Tushare API Token (必填)
TUSHARE_TOKEN=your_32_character_token_here

# 日志级别 (可选,默认: info)
LOG_LEVEL=info

# 限流配置 (可选)
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
```

> **安全提示**: 不要将 `.env` 文件提交到版本控制系统。该文件已包含在 `.gitignore` 中。

## Step 4: 本地测试运行

在配置 AI 客户端之前,先本地测试服务器是否正常启动:

```bash
# 在 apps/tushare-mcp 目录下
pnpm dev
```

如果看到以下输出,说明服务器启动成功:

```
Tushare MCP Server v1.0.0 started
Listening on stdio transport...
```

按 `Ctrl+C` 停止服务器。

## Step 5: 配置 AI 客户端(以 Claude Desktop 为例)

### 5.1 找到 Claude Desktop 配置文件

配置文件位置:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### 5.2 添加 MCP 服务器配置

编辑配置文件,在 `mcpServers` 字段中添加:

```json
{
  "mcpServers": {
    "tushare": {
      "command": "node",
      "args": [
        "/absolute/path/to/tushare-sdk/apps/tushare-mcp/dist/index.js"
      ],
      "env": {
        "TUSHARE_TOKEN": "your_token_here"
      }
    }
  }
}
```

> **重要**:
> - 将 `/absolute/path/to/tushare-sdk` 替换为你的项目绝对路径
> - 将 `your_token_here` 替换为你的 Tushare Token
> - 确保已运行 `pnpm build` 生成 `dist/index.js` 文件

### 5.3 重启 Claude Desktop

完全退出 Claude Desktop(确保后台进程也已关闭),然后重新启动应用。

## Step 6: 验证 MCP 服务器连接

在 Claude Desktop 中:

1. 打开新对话
2. 查看界面左下角或工具栏是否显示 "Tushare" MCP 服务器图标
3. 如果看到绿色连接指示器,说明连接成功

如果连接失败:
- 检查 Claude Desktop 日志(菜单 -> View -> Developer -> Developer Tools -> Console)
- 确认配置文件路径和格式正确
- 确认 Token 有效

## Step 7: 首次查询测试

在 Claude Desktop 对话框中输入以下测试查询:

### 测试 1: 查询股票行情

```
帮我查询贵州茅台(600519.SH)今天的股价表现
```

**预期响应**: Claude 会调用 `query_stock_quote` 工具,返回包含最新价、涨跌幅、成交量等数据的结构化信息。

### 测试 2: 查询财务数据

```
分析一下贵州茅台 2023 年的盈利能力(查询 2023 年报利润表)
```

**预期响应**: Claude 会调用 `query_financial` 工具,返回 2023 年报的营收、净利润、毛利率等财务指标。

### 测试 3: 查询 K 线数据

```
获取贵州茅台最近 5 个交易日的日 K 线数据
```

**预期响应**: Claude 会调用 `query_kline` 工具,返回 5 天的开高低收价格和成交量数据。

### 测试 4: 查询市场指数

```
今天上证指数表现如何?
```

**预期响应**: Claude 会调用 `query_index` 工具,返回上证指数的最新点位、涨跌幅等数据。

## Step 8: 使用 NPX 运行(可选)

如果你已将包发布到 npm,可以直接通过 npx 运行:

```bash
npx @hestudy/tushare-mcp
```

相应地,Claude Desktop 配置可简化为:

```json
{
  "mcpServers": {
    "tushare": {
      "command": "npx",
      "args": ["-y", "@hestudy/tushare-mcp"],
      "env": {
        "TUSHARE_TOKEN": "your_token_here"
      }
    }
  }
}
```

## Troubleshooting

### 问题 1: "Tushare Token 无效或已过期"

**原因**: Token 配置错误或 Token 已失效

**解决方案**:
1. 检查 `.env` 文件或 Claude Desktop 配置中的 Token 是否正确
2. 前往 [Tushare 官网](https://tushare.pro) 确认 Token 是否有效
3. 确认 Token 字符串没有多余的空格或换行符

### 问题 2: "请求过于频繁,已触发限流保护"

**原因**: 短时间内发起了过多请求

**解决方案**:
1. 等待 1 分钟后重试
2. 调整 `.env` 中的 `RATE_LIMIT_MAX_REQUESTS` 参数降低限流阈值
3. 避免让 AI 批量查询过多股票(如"查询所有沪深 300 成分股")

### 问题 3: "未找到相关数据"

**原因**: 股票代码不存在或请求的日期无数据

**解决方案**:
1. 确认股票代码格式正确(如 `600519.SH`,而不是 `600519`)
2. 确认请求的交易日期不是节假日或周末
3. 对于新股,确认上市日期晚于查询日期

### 问题 4: MCP 服务器在 Claude Desktop 中不显示

**原因**: 配置文件路径错误或 JSON 格式不正确

**解决方案**:
1. 使用 JSON 校验工具检查配置文件格式(可以使用 `jq` 或在线工具)
2. 确认配置文件路径正确(macOS: `~/Library/Application Support/Claude/`)
3. 查看 Claude Desktop Developer Tools 的 Console 标签页,查找错误日志
4. 确保 `dist/index.js` 文件存在(运行 `pnpm build` 生成)

### 问题 5: "网络请求超时"

**原因**: Tushare API 服务响应慢或网络不稳定

**解决方案**:
1. 检查网络连接
2. 稍后重试(Tushare 服务可能临时过载)
3. 调整 `.env` 中的 `REQUEST_TIMEOUT_MS` 参数增加超时时间

## Next Steps

现在你已经成功运行 Tushare MCP 服务器!接下来可以:

1. **探索更多查询场景**: 尝试组合多个查询,如对比多只股票或分析行业趋势
2. **查看工具文档**: 参考 `contracts/` 目录下的 JSON Schema 了解每个工具的完整参数
3. **自定义配置**: 根据需要调整 `.env` 文件中的日志级别和限流参数
4. **集成到工作流**: 在日常投资分析工作中使用 AI + Tushare 数据组合

## FAQ

**Q: 是否需要付费才能使用 Tushare?**

A: Tushare 提供免费和付费两种账户类型。免费账户有接口调用频率和数据范围限制。部分高级接口(如分钟级行情)需要积分,可通过贡献社区或购买获取。

**Q: MCP 服务器是否会存储我的查询历史或 Token?**

A: 不会。MCP 服务器是无状态的,所有查询直接转发到 Tushare API,不会记录查询内容。Token 仅用于 API 认证,不会被记录到日志或持久化存储。

**Q: 可以在多个 AI 客户端中同时使用吗?**

A: 可以。只需在每个客户端的 MCP 配置中添加 Tushare 服务器配置即可。但请注意 Tushare API 的总频率限制,多个客户端共享同一个 Token 的请求配额。

**Q: 如何更新 MCP 服务器版本?**

A: 拉取最新代码后,重新运行 `pnpm install && pnpm build`,然后重启 AI 客户端即可。

---

**Quick Start Complete!** 如有其他问题,请参考完整文档或提交 Issue。
