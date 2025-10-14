# Quick Start: MCP 服务补充 SDK 未集成功能

**Feature**: 016-sdk-mcp
**Date**: 2025-10-14
**Status**: Phase 1 Design

## 目标

本快速开始指南帮助开发者快速理解和使用三个新增的 MCP 工具:
1. `query_stock_basic` - 股票基本信息查询
2. `query_trade_calendar` - 交易日历查询
3. `query_daily_basic` - 每日技术指标查询

## 前置条件

### 环境要求

- Node.js 18+ LTS
- pnpm 8+
- 有效的 Tushare Token (从 https://tushare.pro 获取)

### 配置 Token

在 MCP 客户端配置文件中设置环境变量:

```json
{
  "mcpServers": {
    "tushare": {
      "command": "node",
      "args": ["/path/to/tushare-mcp/dist/index.js"],
      "env": {
        "TUSHARE_TOKEN": "your_tushare_token_here"
      }
    }
  }
}
```

## 使用示例

### 1. 查询股票基本信息

**场景**: 用户想了解某只股票的基本属性

**自然语言查询**:
```
查询贵州茅台的基本信息
```

**MCP 工具调用**:
```json
{
  "name": "query_stock_basic",
  "arguments": {
    "ts_code": "600519.SH"
  }
}
```

**响应示例**:
```
股票基本信息:
- 股票代码: 600519.SH
- 股票名称: 贵州茅台
- 所属行业: 白酒
- 所属市场: 主板
- 上市日期: 2001-08-27
- 上市状态: 正常上市
```

---

### 2. 查询交易日历

**场景 A**: 用户想知道今天是否为交易日

**自然语言查询**:
```
2025年10月14日是交易日吗?
```

**MCP 工具调用**:
```json
{
  "name": "query_trade_calendar",
  "arguments": {
    "start_date": "20251014",
    "end_date": "20251014"
  }
}
```

**响应示例**:
```
2025-10-14 是交易日 ✓

交易状态: 正常交易
上一交易日: 2025-10-13
```

---

**场景 B**: 用户想查询某个月的所有交易日

**自然语言查询**:
```
查询2025年10月的所有交易日
```

**MCP 工具调用**:
```json
{
  "name": "query_trade_calendar",
  "arguments": {
    "start_date": "20251001",
    "end_date": "20251031"
  }
}
```

**响应示例**:
```
2025年10月交易日历:

交易日 (共 20 天):
1. 2025-10-01 (周三) [国庆假期调休]
2. 2025-10-08 (周三)
3. 2025-10-09 (周四)
...
20. 2025-10-31 (周五)

休市日 (共 11 天):
- 2025-10-04 ~ 2025-10-07 (国庆假期)
- 2025-10-11, 2025-10-12 (周末)
...
```

---

### 3. 查询每日技术指标

**场景 A**: 用户想查询某只股票今天的估值指标

**自然语言查询**:
```
查询贵州茅台今天的市盈率和市净率
```

**MCP 工具调用**:
```json
{
  "name": "query_daily_basic",
  "arguments": {
    "ts_code": "600519.SH",
    "trade_date": "20251014"
  }
}
```

**响应示例**:
```
贵州茅台 (600519.SH) 2025-10-14 技术指标:

估值指标:
- 市盈率(PE): 35.60 倍
- 市净率(PB): 12.30 倍
- 市销率(PS): 10.50 倍

市值指标:
- 总市值: 2261.24 亿元
- 流通市值: 2261.24 亿元

交易指标:
- 换手率: 0.85%
- 量比: 1.15

股本信息:
- 总股本: 12.56 亿股
- 流通股本: 12.56 亿股
```

---

**场景 B**: 用户想分析某只股票近期的估值趋势

**自然语言查询**:
```
查询贵州茅台10月份的PE和PB变化趋势
```

**MCP 工具调用**:
```json
{
  "name": "query_daily_basic",
  "arguments": {
    "ts_code": "600519.SH",
    "start_date": "20251001",
    "end_date": "20251031"
  }
}
```

**响应示例**:
```
贵州茅台 (600519.SH) 2025年10月技术指标趋势:

共 20 个交易日数据:

日期          | PE(倍) | PB(倍) | 换手率(%) | 总市值(亿元)
-------------|--------|--------|-----------|-------------
2025-10-01   | 35.20  | 12.10  | 0.65      | 2250.00
2025-10-08   | 35.40  | 12.20  | 0.75      | 2255.00
...
2025-10-31   | 35.80  | 12.40  | 0.90      | 2270.00

统计摘要:
- PE 均值: 35.50 倍
- PB 均值: 12.25 倍
- 平均换手率: 0.80%
- 平均总市值: 2260.00 亿元
```

---

## 常见错误处理

### 错误 1: 股票代码格式错误

**错误消息**:
```
参数格式错误: 股票代码格式错误,示例: 600519.SH
```

**解决方案**:
- 确保股票代码为 6 位数字 + 市场后缀
- 上交所使用 `.SH` 后缀 (如 `600519.SH`)
- 深交所使用 `.SZ` 后缀 (如 `000001.SZ`)

---

### 错误 2: 查询非交易日数据

**错误消息**:
```
2025-10-12 为非交易日,无技术指标数据。

最近交易日:
- 上一交易日: 2025-10-11
- 下一交易日: 2025-10-13

提示: 可使用 query_trade_calendar 工具查询交易日历。
```

**解决方案**:
1. 先使用 `query_trade_calendar` 确认交易日
2. 或者查询最近的交易日(根据错误提示)

---

### 错误 3: 日期范围超限

**错误消息**:
```
查询范围不能超过 3 个月(90 天),当前范围: 365 天。请分批查询。
```

**解决方案**:
- 交易日历: 单次查询最多 1 年(365 天)
- 技术指标: 单次查询最多 3 个月(90 天)
- 超出限制时,分批查询多个时间段

---

### 错误 4: Tushare Token 无效

**错误消息**:
```
Tushare Token 无效或已过期,请检查环境变量 TUSHARE_TOKEN 配置。
获取 Token: https://tushare.pro/register
```

**解决方案**:
1. 访问 https://tushare.pro/register 注册账号
2. 获取 Token 并配置到 `TUSHARE_TOKEN` 环境变量
3. 确认 Token 有足够的积分(基础接口通常不需要高级权限)

---

## 测试步骤

### 步骤 1: 安装依赖

```bash
cd /path/to/tushare-sdk
pnpm install
```

### 步骤 2: 构建项目

```bash
pnpm build
```

### 步骤 3: 配置 Token

创建 `.env` 文件:
```bash
echo "TUSHARE_TOKEN=your_token_here" > apps/tushare-mcp/.env
```

### 步骤 4: 启动 MCP 服务器

```bash
cd apps/tushare-mcp
node dist/index.js
```

### 步骤 5: 使用 AI 客户端测试

在支持 MCP 的 AI 客户端(如 Claude Desktop)中:

1. 配置 MCP 服务器连接
2. 测试查询: "查询贵州茅台的基本信息"
3. 验证响应内容是否正确

---

## 开发者指南

### 添加新工具的标准流程

如果需要添加更多 Tushare API 支持,遵循以下步骤:

#### 1. 定义工具 schema (`src/tools/xxx.ts`)

```typescript
import type { MCPToolDefinition } from '../types/mcp-tools.types.js';

export const xxxTool: MCPToolDefinition = {
  name: 'query_xxx',
  description: '...',
  inputSchema: {
    type: 'object',
    properties: {
      // 参数定义
    },
    required: [/* 必填参数 */]
  }
};
```

#### 2. 实现处理器 (`src/handlers/xxx.handler.ts`)

```typescript
import { z } from 'zod';
import { TushareClient } from '@hestudy/tushare-sdk';
import type { ToolCallResponse } from '../types/mcp-tools.types.js';
import { handleTushareError } from '../utils/error-handler.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('info');

// 定义参数 schema (zod)
const ArgsSchema = z.object({
  // 参数验证规则
});

// 实现处理器
export async function handleXXX(args: unknown): Promise<ToolCallResponse> {
  try {
    // 1. 参数验证
    const validated = ArgsSchema.parse(args);

    // 2. 调用 SDK
    const client = new TushareClient({ token: process.env.TUSHARE_TOKEN || '' });
    const response = await client.getXXX(validated);

    // 3. 数据检查
    if (!response || response.length === 0) {
      throw new Error('未找到数据');
    }

    // 4. 格式化响应
    const text = formatXXXText(response[0]);

    // 5. 返回结构化响应
    return {
      content: [{ type: 'text', text }],
      structuredContent: response[0]
    };
  } catch (error) {
    return handleTushareError(error);
  }
}

// 格式化函数
function formatXXXText(data: XXXData): string {
  // 格式化逻辑
}
```

#### 3. 注册工具 (`src/server.ts`)

```typescript
import { xxxTool } from './tools/xxx.js';
import { handleXXX } from './handlers/xxx.handler.js';

const tools: MCPToolDefinition[] = [
  // ... 现有工具
  xxxTool
];

const toolHandlers = new Map([
  // ... 现有处理器
  ['query_xxx', handleXXX]
]);
```

#### 4. 编写测试 (`tests/handlers/xxx.handler.test.ts`)

```typescript
import { describe, it, expect } from 'vitest';
import { handleXXX } from '../../src/handlers/xxx.handler.js';

describe('handleXXX', () => {
  it('应该返回正确的数据', async () => {
    // 测试逻辑
  });

  it('应该处理错误情况', async () => {
    // 错误测试
  });
});
```

---

## 性能优化建议

### 1. 限流策略

MCP 服务器已配置默认限流(100 次/分钟),避免触发:
- 批量查询时添加延迟
- 复用已查询的数据
- 合理使用日期范围查询

### 2. 数据缓存 (可选,后续版本)

考虑缓存以下数据以减少 API 调用:
- 股票基本信息 (变更频率低,可缓存 1 天)
- 交易日历 (年初发布,可缓存 1 年)
- 历史技术指标 (已收盘数据不变,可永久缓存)

### 3. 参数优化

使用 `fields` 参数仅返回必要字段:
```typescript
const response = await client.getDailyBasic({
  ts_code: '600519.SH',
  trade_date: '20251014',
  fields: 'ts_code,trade_date,pe,pb,total_mv'  // 仅返回指定字段
});
```

---

## 故障排查

### 问题: MCP 服务器无响应

**检查清单**:
1. ✅ Node.js 版本 ≥ 18
2. ✅ `TUSHARE_TOKEN` 环境变量已配置
3. ✅ `pnpm build` 已成功执行
4. ✅ 查看日志输出(默认在 stderr)

**调试命令**:
```bash
# 启用 debug 日志
LOG_LEVEL=debug node dist/index.js
```

---

### 问题: 数据格式不符合预期

**检查清单**:
1. ✅ SDK 版本是否最新 (`@hestudy/tushare-sdk@latest`)
2. ✅ Tushare API 文档是否有更新
3. ✅ 查看 `structuredContent` 原始数据

**调试建议**:
- 直接调用 SDK API 验证返回数据
- 对比 MCP 工具返回的 `structuredContent` 字段

---

## 相关资源

- **功能规格**: [spec.md](./spec.md)
- **实现计划**: [plan.md](./plan.md)
- **数据模型**: [data-model.md](./data-model.md)
- **API Contracts**: [contracts/](./contracts/)
- **Tushare 官方文档**: https://tushare.pro/document/2
- **MCP 协议规范**: https://modelcontextprotocol.io/

---

**下一步**: 查看 [tasks.md](./tasks.md) 了解详细的实现任务清单 (由 `/speckit.tasks` 命令生成)
