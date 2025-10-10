# Application Interface Contract

**Feature**: 003-apps-node-sdk  
**Date**: 2025-10-10  
**Type**: Command-Line Application Contract

## Overview

本文档定义演示应用的输入输出契约,包括环境变量、命令行参数、输出格式等。

---

## Input Contract

### 1. 环境变量

演示应用通过环境变量接收配置:

| 变量名 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `TUSHARE_TOKEN` | string | ✅ | - | Tushare API Token |
| `TUSHARE_API_URL` | string | ❌ | `https://api.tushare.pro` | API 基础 URL |
| `DEBUG` | boolean | ❌ | `false` | 是否启用调试日志 |

**示例 `.env` 文件**:
```bash
# Tushare API Token (必需)
TUSHARE_TOKEN=your_token_here

# API 基础 URL (可选)
# TUSHARE_API_URL=https://api.tushare.pro

# 调试模式 (可选)
# DEBUG=true
```

**验证规则**:
- `TUSHARE_TOKEN` 不能为空字符串
- `TUSHARE_API_URL` 必须是有效的 HTTP/HTTPS URL
- `DEBUG` 接受 `true`, `false`, `1`, `0`

**错误处理**:
```typescript
// 缺少必需环境变量
if (!process.env.TUSHARE_TOKEN) {
  console.error('错误: 缺少 TUSHARE_TOKEN 环境变量');
  console.error('请在 .env 文件中设置或通过环境变量传递');
  process.exit(1);
}
```

---

### 2. 命令行参数

演示应用支持以下命令行参数(可选):

```bash
# 基本用法
pnpm dev

# 指定示例
pnpm dev --example=stock-list

# 启用详细输出
pnpm dev --verbose

# 输出 JSON 格式
pnpm dev --format=json
```

| 参数 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `--example` | string | ❌ | `all` | 运行指定示例 (`stock-list`, `daily-data`, `trade-calendar`, `all`) |
| `--verbose` | boolean | ❌ | `false` | 启用详细输出 |
| `--format` | string | ❌ | `console` | 输出格式 (`console`, `json`) |

**示例**:
```bash
# 只运行股票列表示例
pnpm dev -- --example=stock-list

# 输出 JSON 格式
pnpm dev -- --format=json > output.json

# 详细模式
pnpm dev -- --verbose
```

---

## Output Contract

### 1. 控制台输出 (默认)

**格式**: 人类可读的格式化文本

**示例**:
```
========================================
Tushare SDK 演示应用
版本: 1.0.0
SDK 版本: 1.0.0
时间: 2025-10-10 17:00:00
========================================

[1/3] 运行示例: 股票列表查询
✓ 成功 (耗时: 234ms)
返回 5000 条股票数据

示例数据:
┌─────────────┬──────────┬────────────┬──────┬────────┐
│ 股票代码    │ 股票名称 │ 行业       │ 地域 │ 上市日期│
├─────────────┼──────────┼────────────┼──────┼────────┤
│ 000001.SZ   │ 平安银行 │ 银行       │ 深圳 │ 19910403│
│ 000002.SZ   │ 万科A    │ 房地产     │ 深圳 │ 19910129│
└─────────────┴──────────┴────────────┴──────┴────────┘

[2/3] 运行示例: 日线数据查询
✓ 成功 (耗时: 189ms)
返回 30 条日线数据

[3/3] 运行示例: 交易日历查询
✓ 成功 (耗时: 156ms)
返回 365 条交易日历数据

========================================
执行摘要
========================================
总计: 3 个示例
成功: 3 个
失败: 0 个
总耗时: 579ms
========================================
```

**错误输出示例**:
```
[1/3] 运行示例: 股票列表查询
✗ 失败 (耗时: 123ms)
错误类型: AUTH_ERROR
错误信息: 认证失败,Token 无效或已过期

建议: 请检查 TUSHARE_TOKEN 环境变量是否正确设置
```

---

### 2. JSON 输出 (`--format=json`)

**格式**: 结构化 JSON 数据

**Schema**:
```typescript
interface DemoOutput {
  version: string;           // 应用版本
  timestamp: string;         // ISO 8601 时间戳
  sdkVersion: string;        // SDK 版本
  results: ExampleResult[];  // 示例结果数组
  summary: {
    total: number;           // 总示例数
    success: number;         // 成功数
    failed: number;          // 失败数
    totalDuration: number;   // 总耗时(ms)
  };
}

interface ExampleResult {
  name: string;              // 示例名称
  success: boolean;          // 是否成功
  duration: number;          // 耗时(ms)
  data?: unknown;            // 返回数据(成功时)
  error?: {                  // 错误信息(失败时)
    type: string;
    message: string;
    code?: string;
  };
}
```

**示例输出**:
```json
{
  "version": "1.0.0",
  "timestamp": "2025-10-10T17:00:00.000Z",
  "sdkVersion": "1.0.0",
  "results": [
    {
      "name": "股票列表查询",
      "success": true,
      "duration": 234,
      "data": {
        "count": 5000,
        "sample": [
          {
            "ts_code": "000001.SZ",
            "symbol": "000001",
            "name": "平安银行",
            "area": "深圳",
            "industry": "银行",
            "market": "主板",
            "list_date": "19910403"
          }
        ]
      }
    },
    {
      "name": "日线数据查询",
      "success": true,
      "duration": 189,
      "data": {
        "count": 30
      }
    },
    {
      "name": "交易日历查询",
      "success": true,
      "duration": 156,
      "data": {
        "count": 365
      }
    }
  ],
  "summary": {
    "total": 3,
    "success": 3,
    "failed": 0,
    "totalDuration": 579
  }
}
```

**错误输出示例**:
```json
{
  "version": "1.0.0",
  "timestamp": "2025-10-10T17:00:00.000Z",
  "sdkVersion": "1.0.0",
  "results": [
    {
      "name": "股票列表查询",
      "success": false,
      "duration": 123,
      "error": {
        "type": "AUTH_ERROR",
        "message": "认证失败,Token 无效或已过期",
        "code": "40001"
      }
    }
  ],
  "summary": {
    "total": 1,
    "success": 0,
    "failed": 1,
    "totalDuration": 123
  }
}
```

---

## Exit Codes

演示应用使用标准退出码:

| 退出码 | 含义 | 场景 |
|--------|------|------|
| `0` | 成功 | 所有示例执行成功 |
| `1` | 配置错误 | 缺少必需的环境变量或配置无效 |
| `2` | 运行时错误 | 示例执行过程中发生错误 |
| `3` | 部分失败 | 部分示例成功,部分失败 |

**示例**:
```typescript
// 所有成功
process.exit(0);

// 配置错误
if (!config.tushareToken) {
  console.error('错误: 缺少 TUSHARE_TOKEN');
  process.exit(1);
}

// 部分失败
if (summary.failed > 0 && summary.success > 0) {
  process.exit(3);
}

// 全部失败
if (summary.failed === summary.total) {
  process.exit(2);
}
```

---

## Performance Contract

### 响应时间

| 操作 | 目标时间 | 说明 |
|------|----------|------|
| 应用启动 | < 2s | 从执行命令到开始运行第一个示例 |
| 单个 API 调用 | < 5s | 包括网络请求和数据解析 |
| 完整演示 | < 15s | 运行所有 3 个示例 |

### 资源使用

| 资源 | 限制 | 说明 |
|------|------|------|
| 内存 | < 100MB | 峰值内存使用 |
| CPU | < 50% | 单核 CPU 使用率 |
| 网络 | < 1MB | 总数据传输量 |

---

## Error Handling Contract

### 错误类型

演示应用处理以下错误类型:

1. **配置错误** (`ConfigError`)
   - 缺少必需环境变量
   - 无效的配置值
   - 退出码: 1

2. **认证错误** (`ApiError.AUTH_ERROR`)
   - Token 无效或过期
   - Token 权限不足
   - 退出码: 2

3. **网络错误** (`ApiError.NETWORK_ERROR`)
   - 网络连接失败
   - 请求超时
   - 退出码: 2

4. **参数错误** (`ApiError.PARAM_ERROR`)
   - API 参数无效
   - 参数格式错误
   - 退出码: 2

### 错误消息格式

所有错误消息遵循统一格式:

```
错误: [错误类型]
消息: [详细错误信息]
建议: [解决建议]
```

**示例**:
```
错误: AUTH_ERROR
消息: 认证失败,Token 无效或已过期
建议: 请检查 TUSHARE_TOKEN 环境变量是否正确设置,或访问 https://tushare.pro 获取新 Token
```

---

## Compatibility Contract

### Node.js 版本

- **最低版本**: Node.js 18.0.0 LTS
- **推荐版本**: Node.js 20.x LTS
- **测试版本**: 18.x, 20.x, 21.x

### 操作系统

- ✅ macOS (Intel & Apple Silicon)
- ✅ Linux (Ubuntu 20.04+, CentOS 8+)
- ✅ Windows 10/11 (WSL2 推荐)

### 终端支持

- ✅ 支持 ANSI 颜色输出
- ✅ 支持 Unicode 字符(表格绘制)
- ✅ 支持标准输入输出重定向

---

## Testing Contract

### 测试覆盖

演示应用的测试覆盖契约:

| 测试类型 | 覆盖率目标 | 说明 |
|----------|-----------|------|
| 单元测试 | ≥ 80% | 配置加载、错误处理 |
| 集成测试 | ≥ 70% | SDK 初始化、API 调用 |
| E2E 测试 | 核心场景 | 完整演示流程 |

### 测试场景

必须覆盖的测试场景:

1. ✅ 正常流程: 所有示例成功执行
2. ✅ 配置错误: 缺少 Token
3. ✅ 认证错误: Token 无效
4. ✅ 网络错误: API 不可达
5. ✅ 参数错误: 无效参数
6. ✅ 输出格式: JSON 和控制台输出

---

## Summary

### 输入契约
- ✅ 环境变量: `TUSHARE_TOKEN` (必需), `TUSHARE_API_URL`, `DEBUG`
- ✅ 命令行参数: `--example`, `--verbose`, `--format`

### 输出契约
- ✅ 控制台输出: 格式化文本
- ✅ JSON 输出: 结构化数据
- ✅ 退出码: 0 (成功), 1 (配置错误), 2 (运行时错误), 3 (部分失败)

### 性能契约
- ✅ 启动时间 < 2s
- ✅ API 调用 < 5s
- ✅ 完整演示 < 15s

### 兼容性契约
- ✅ Node.js 18+
- ✅ 跨平台支持 (macOS, Linux, Windows)

**状态**: 应用接口契约定义完成
