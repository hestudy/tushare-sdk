# Research: Tushare MCP 服务器应用

**Feature**: Tushare MCP 服务器应用
**Date**: 2025-10-14
**Status**: Phase 0 Complete

## Overview

本文档记录了为 Tushare SDK 实现 MCP(Model Context Protocol)服务器应用的技术研究成果。研究重点包括 MCP TypeScript SDK 的使用方式、stdio 传输协议实现、工具定义最佳实践以及 npx 运行配置。

## Research Areas

### 1. MCP TypeScript SDK 架构与核心概念

#### Decision: 使用官方 @modelcontextprotocol/sdk 包

**Rationale**:
- 官方 SDK 提供完整的类型定义和协议实现
- 支持 stdio 和 HTTP 两种传输方式
- 与 Claude Desktop、Cline 等主流 AI 客户端完全兼容
- 社区活跃,文档和示例丰富

**核心组件**:
- `Server`: MCP 服务器核心类,负责协议处理和请求路由
- `StdioServerTransport`: stdio 传输层实现,通过标准输入输出与客户端通信
- `CallToolRequestSchema`: 工具调用请求的 JSON-RPC 模式
- `ListToolsRequestSchema`: 工具列表查询的 JSON-RPC 模式

**Alternatives considered**:
- 直接实现 JSON-RPC 协议:维护成本高,需要手动处理协议细节,易出错
- 使用第三方 MCP 框架(如 mcp-framework):生态系统不如官方 SDK 成熟

### 2. Stdio 传输协议实现方式

#### Decision: 使用 StdioServerTransport 作为传输层

**Rationale**:
- stdio 是 MCP 标准推荐的本地通信方式,无需网络端口
- AI 客户端(如 Claude Desktop)直接通过 child_process 启动服务器并通过 stdin/stdout 通信
- 简化部署,用户无需管理服务器进程和端口冲突
- 安全性高,仅限本地进程间通信

**实现模式**:
```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server(
  { name: "tushare-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// 注册工具和处理器
server.setRequestHandler(ListToolsRequestSchema, async () => { ... });
server.setRequestHandler(CallToolRequestSchema, async (request) => { ... });

// 连接 stdio 传输层
const transport = new StdioServerTransport();
await server.connect(transport);
```

**关键特性**:
- 自动处理 JSON-RPC 协议封装和解析
- 支持双向异步通信
- 优雅处理连接生命周期(连接、断开、错误)

**Alternatives considered**:
- HTTP 传输(SSE):需要管理服务器端口,增加部署复杂度,不适合 npx 直接运行的场景
- WebSocket:同样需要端口管理,对于单用户本地使用场景过于复杂

### 3. MCP Tool 定义与参数验证

#### Decision: 使用 Zod schema 定义工具输入参数,返回结构化数据和文本内容

**Rationale**:
- Zod 提供强类型的运行时验证,与 TypeScript 类型系统无缝集成
- MCP 协议要求工具输入使用 JSON Schema,Zod 可自动生成 JSON Schema
- 返回结构化数据(`structuredContent`)使 AI 能够编程式处理结果
- 同时返回文本(`content`)确保 AI 能向用户展示易读的描述

**工具定义模式**:
```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "query_stock_quote",
        description: "查询实时股票行情数据,支持A股股票代码(如 600519.SH 贵州茅台)",
        inputSchema: {
          type: "object",
          properties: {
            ts_code: {
              type: "string",
              description: "股票代码,格式: 代码.市场后缀(如 600519.SH)"
            },
            trade_date: {
              type: "string",
              description: "交易日期,格式: YYYYMMDD,可选,默认最新交易日"
            }
          },
          required: ["ts_code"]
        }
      }
    ]
  };
});
```

**工具执行模式**:
```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "query_stock_quote") {
    // 使用 Zod 验证参数
    const schema = z.object({
      ts_code: z.string().regex(/^\d{6}\.(SH|SZ)$/),
      trade_date: z.string().regex(/^\d{8}$/).optional()
    });
    const validated = schema.parse(args);

    // 调用 Tushare SDK
    const result = await tushareClient.stock.daily({
      ts_code: validated.ts_code,
      trade_date: validated.trade_date
    });

    // 返回结构化数据和文本描述
    return {
      content: [
        {
          type: "text",
          text: `股票 ${validated.ts_code}: 最新价 ${result.close} 元, 涨跌幅 ${result.pct_chg}%`
        }
      ],
      structuredContent: result
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});
```

**Alternatives considered**:
- 仅返回文本:AI 无法编程式处理数据,无法进行复杂计算或数据组合
- 使用自定义验证库:Zod 是社区标准,提供最佳的 TypeScript 集成和错误消息

### 4. 错误处理与用户友好提示

#### Decision: 捕获所有 Tushare SDK 错误,转换为用户可理解的自然语言消息

**Rationale**:
- MCP 工具返回的错误会直接展示给 AI 和最终用户
- 技术错误堆栈(如 HTTP 500、JSON 解析错误)对用户无意义
- 需要针对常见错误场景提供可操作的建议

**错误分类与处理策略**:
```typescript
async function handleTushareError(error: unknown): Promise<string> {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Token 无效或过期
    if (message.includes('token') || message.includes('auth')) {
      return "Tushare Token 无效或已过期,请检查环境变量 TUSHARE_TOKEN 配置";
    }

    // 积分不足
    if (message.includes('point') || message.includes('permission')) {
      return "Tushare 积分不足或权限不够,请升级账户或选择其他接口";
    }

    // 请求频率限制
    if (message.includes('frequency') || message.includes('rate limit')) {
      return "请求过于频繁,已触发 Tushare 频率限制,请稍后重试";
    }

    // 数据不存在
    if (message.includes('no data') || message.includes('not found')) {
      return "未找到相关数据,请检查股票代码或日期范围是否正确";
    }

    // 网络超时
    if (message.includes('timeout') || message.includes('network')) {
      return "网络请求超时,Tushare 服务可能暂时不可用,请稍后重试";
    }
  }

  return `数据查询失败: ${error}`;
}
```

**Alternatives considered**:
- 直接抛出原始错误:用户体验差,无法理解技术错误
- 返回统一的通用错误消息:丢失错误上下文,用户无法采取正确的修复措施

### 5. NPX 直接运行配置

#### Decision: 配置 package.json 的 bin 字段,使用 tsx 作为运行时

**Rationale**:
- `bin` 字段允许通过 `npx @hestudy/tushare-mcp` 直接运行,无需全局安装
- `tsx` 支持直接运行 TypeScript,无需预编译,简化开发和调试流程
- 符合用户预期的"零配置启动"体验

**package.json 配置**:
```json
{
  "name": "@hestudy/tushare-mcp",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "tushare-mcp": "./dist/index.js"
  },
  "scripts": {
    "build": "rslib build",
    "dev": "tsx src/index.ts",
    "prepublishOnly": "npm run build"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "@hestudy/tushare-sdk": "workspace:*",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "tsx": "^4.7.0",
    "typescript": "^5.3.0"
  }
}
```

**入口文件(src/index.ts)配置**:
```typescript
#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// 确保 Shebang 存在,使文件可直接执行
async function main() {
  const server = new Server(/* ... */);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
```

**Claude Desktop 配置示例**:
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

**Alternatives considered**:
- 要求用户手动编译:增加使用门槛,不符合"开箱即用"的设计目标
- 使用 node --loader:兼容性差,Node.js 不同版本行为不一致
- 打包成单文件可执行程序(如 pkg):增加构建复杂度,文件体积大

### 6. 工具分类与接口映射

#### Decision: 根据用户故事优先级,实现 4 类核心 MCP Tools

**工具清单**:

| Tool Name | Priority | 对应 Tushare SDK 接口 | 输入参数 | 输出数据 |
|-----------|----------|----------------------|---------|---------|
| `query_stock_quote` | P1 | `stock.daily()` | ts_code, trade_date(可选) | 股票代码、最新价、涨跌幅、成交量、成交额 |
| `query_financial` | P2 | `stock.income()`, `stock.balancesheet()`, `stock.cashflow()` | ts_code, period(报告期), report_type(利润表/资产负债表/现金流量表) | 财务指标数据(营收、净利润、资产、负债等) |
| `query_kline` | P3 | `stock.daily()` | ts_code, start_date, end_date, freq(日/周/月) | 时间序列 K 线数据(开高低收、成交量) |
| `query_index` | P4 | `index.daily()` | ts_code(指数代码如 000001.SH), trade_date(可选) | 指数点位、涨跌幅、成交额 |

**实现顺序**:
1. Phase 1: 实现 `query_stock_quote`(P1),验证 MCP 服务器基础架构
2. Phase 2: 实现 `query_financial`(P2),增加财务数据查询能力
3. Phase 3: 实现 `query_kline` 和 `query_index`(P3, P4),完成核心功能

**Alternatives considered**:
- 实现所有 Tushare 接口:范围过大,维护成本高,大部分接口使用频率低
- 仅实现单一工具:无法满足多样化金融分析需求

### 7. 请求限流与 Tushare 频率限制应对

#### Decision: 实现基于时间窗口的客户端限流,避免触发 Tushare API 频率限制

**Rationale**:
- Tushare 对 API 调用频率有限制(如每分钟 200 次)
- AI 可能在短时间内发起大量批量查询请求
- 提前限流可避免账号被临时封禁

**限流实现策略**:
```typescript
import { RateLimiter } from './utils/rate-limiter';

const limiter = new RateLimiter({
  maxRequests: 100,  // 每分钟最多 100 次请求(留有余量)
  windowMs: 60000    // 1 分钟时间窗口
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // 限流检查
  if (!limiter.tryAcquire()) {
    return {
      content: [{
        type: "text",
        text: "请求过于频繁,已触发限流保护,请稍后重试(1分钟后自动恢复)"
      }],
      isError: true
    };
  }

  // 执行工具逻辑
  // ...
});
```

**Alternatives considered**:
- 不做限流:风险高,可能导致用户账号被封禁,影响所有功能
- 使用队列延迟执行:增加响应延迟,用户体验差,AI 可能认为服务不可用

### 8. 日志记录与调试支持

#### Decision: 使用结构化日志记录关键操作,支持通过环境变量控制日志级别

**Rationale**:
- stdio 是全双工通信通道,日志不能直接输出到 stdout(会干扰协议)
- 需要将日志写入文件或 stderr,便于用户调试配置和性能问题
- 生产环境默认关闭详细日志,减少 I/O 开销

**日志实现**:
```typescript
import { createLogger } from './utils/logger';

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',  // debug, info, warn, error
  output: 'stderr'  // 避免污染 stdout
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  logger.debug('Received tool call', {
    tool: request.params.name,
    args: request.params.arguments
  });

  try {
    const result = await executeTool(request);
    logger.info('Tool call success', { tool: request.params.name });
    return result;
  } catch (error) {
    logger.error('Tool call failed', {
      tool: request.params.name,
      error: error.message
    });
    throw error;
  }
});
```

**Alternatives considered**:
- 使用 console.log:污染 stdout,破坏 MCP 协议通信
- 不记录日志:无法调试生产环境问题,用户反馈问题时缺少上下文

## Summary of Key Decisions

| 决策领域 | 选择 | 关键原因 |
|---------|------|---------|
| SDK | @modelcontextprotocol/sdk | 官方支持,协议完整性,社区成熟 |
| 传输层 | StdioServerTransport | 标准推荐,简化部署,安全性高 |
| 参数验证 | Zod + JSON Schema | 类型安全,自动生成 schema,错误消息友好 |
| 错误处理 | 分类转换为自然语言 | 用户可理解,提供可操作建议 |
| 运行方式 | npx + tsx | 零配置,开箱即用,开发体验好 |
| 工具范围 | 4 类核心工具 | 覆盖主要场景,维护成本可控 |
| 限流策略 | 客户端时间窗口限流 | 保护账号,避免被封禁 |
| 日志记录 | 结构化日志到 stderr | 不干扰协议,支持调试 |

## Implementation Risks & Mitigations

| 风险 | 影响 | 缓解措施 |
|-----|------|---------|
| MCP SDK API 变更 | 中 | 锁定主版本号,关注官方 changelog,编写适配器层 |
| Tushare API 频率限制 | 高 | 实现客户端限流,提供清晰的限流错误提示 |
| AI 客户端兼容性 | 中 | 严格遵循 MCP 规范,在多个客户端(Claude Desktop、Cline)进行测试 |
| 参数验证漏洞 | 中 | 使用 Zod 强制验证所有输入,编写参数边界测试用例 |
| 错误消息不清晰 | 低 | 建立错误分类体系,收集用户反馈持续优化 |

## Next Steps (Phase 1)

基于以上研究成果,进入 Phase 1 设计阶段:

1. **生成 data-model.md**: 定义 MCP Tool 的数据结构和状态模型
2. **生成 contracts/**: 为每个 Tool 定义输入输出的 JSON Schema 契约
3. **生成 quickstart.md**: 编写快速开始指南,包含安装、配置、运行步骤
4. **更新 CLAUDE.md**: 将 MCP SDK 相关技术栈添加到项目上下文

---

**Research Complete**: 2025-10-14
**Next Phase**: Phase 1 - Design & Contracts
