# MCP Tools Contracts

本目录包含 Tushare MCP 服务器提供的所有工具的 JSON Schema 契约定义。

## Contract Files

| File | Tool Name | Description | Priority |
|------|-----------|-------------|----------|
| `query_stock_quote.json` | query_stock_quote | 查询实时股票行情数据 | P1 (核心功能) |
| `query_financial.json` | query_financial | 查询公司财务报表数据(利润表/资产负债表/现金流量表) | P2 |
| `query_kline.json` | query_kline | 查询历史K线数据(日/周/月线) | P3 |
| `query_index.json` | query_index | 查询市场指数行情数据 | P4 |

## Contract Structure

每个契约文件遵循以下结构:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Tool Title",
  "description": "Tool description for AI clients",
  "type": "object",
  "properties": {
    "input": {
      "type": "object",
      "properties": { /* input parameters */ },
      "required": [ /* required fields */ ]
    },
    "output": {
      /* output schema */
    }
  },
  "examples": [ /* usage examples */ ],
  "errors": [ /* error scenarios */ ]
}
```

## Usage in MCP Server

这些契约定义将在 MCP 服务器实现中用于:

1. **工具注册**: 从契约中提取 `input.properties` 生成 `inputSchema`
2. **参数验证**: 使用 Zod 根据契约定义验证 AI 传递的参数
3. **文档生成**: 契约中的 `examples` 和 `notes` 可用于生成用户文档
4. **测试用例**: 契约中的 `examples` 和 `errors` 可直接转换为集成测试用例

## Validation Rules

所有契约定义遵循以下通用验证规则:

| 字段类型 | 格式要求 | 示例 |
|---------|---------|------|
| 股票代码 | `^\d{6}\.(SH\|SZ)$` | "600519.SH", "000001.SZ" |
| 交易日期 | `^\d{8}$` (YYYYMMDD) | "20251014" |
| 报告期 | `^\d{4}(0331\|0630\|0930\|1231)$` | "20231231" |
| K线频率 | 枚举: `["D", "W", "M"]` | "D" (日线) |
| 报表类型 | 枚举: `["income", "balance", "cashflow"]` | "income" (利润表) |

## Error Codes

所有工具共享以下错误代码:

| Code | Trigger Condition | User Message Pattern |
|------|------------------|---------------------|
| `VALIDATION_ERROR` | 参数格式错误或缺少必填字段 | "参数格式错误: [字段名]" |
| `AUTH_ERROR` | Tushare Token 无效或过期 | "Tushare Token 无效或已过期" |
| `RATE_LIMIT` | 触发频率限制 | "请求过于频繁,已触发限流保护" |
| `DATA_NOT_FOUND` | 股票代码不存在或无数据 | "未找到相关数据" |
| `NETWORK_ERROR` | 网络超时或服务不可用 | "网络请求超时,Tushare 服务暂时不可用" |

## Implementation Checklist

在实现每个工具时,确保:

- [ ] 从契约中生成 Zod schema 用于参数验证
- [ ] 实现契约中定义的所有 `required` 字段验证
- [ ] 处理契约中列出的所有错误场景
- [ ] 返回符合契约 `output` 定义的结构化数据
- [ ] 为每个工具编写基于契约 `examples` 的单元测试
- [ ] 确保错误消息与契约中的 `errors.message` 一致

---

**Generated**: 2025-10-14
**Version**: 1.0.0
