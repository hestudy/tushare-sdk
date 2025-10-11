---
title: 错误处理
description: 了解 Tushare SDK 的错误类型和处理机制
---

# 错误处理

本指南详细介绍 Tushare SDK 中的错误类型、错误处理机制和最佳实践。

## 错误类型

SDK 定义了 `ApiError` 类和 `ApiErrorType` 枚举来表示不同类型的错误。

### ApiErrorType 枚举

```typescript
enum ApiErrorType {
  AUTH_ERROR = 'AUTH_ERROR',           // 认证错误
  RATE_LIMIT = 'RATE_LIMIT',           // 限流错误
  NETWORK_ERROR = 'NETWORK_ERROR',     // 网络错误
  SERVER_ERROR = 'SERVER_ERROR',       // 服务器错误
  VALIDATION_ERROR = 'VALIDATION_ERROR', // 参数验证错误
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',     // 超时错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'      // 未知错误
}
```

### 错误类型说明

| 错误类型 | HTTP状态码 | 可重试 | 说明 | 常见原因 |
|---------|-----------|--------|------|----------|
| `AUTH_ERROR` | 401, 403 | ❌ | 认证错误 | Token 无效或过期 |
| `RATE_LIMIT` | 429 | ✅ | 限流错误 | 请求频率超限 |
| `NETWORK_ERROR` | - | ✅ | 网络错误 | 网络连接失败 |
| `SERVER_ERROR` | 500, 502, 503, 504 | ✅ | 服务器错误 | Tushare 服务器内部错误 |
| `VALIDATION_ERROR` | 400 | ❌ | 参数验证错误 | 请求参数不合法 |
| `TIMEOUT_ERROR` | - | ✅ | 超时错误 | 请求超时 |
| `UNKNOWN_ERROR` | 其他 | ❌ | 未知错误 | 其他未分类错误 |

## ApiError 类

### 类定义

```typescript
class ApiError extends Error {
  type: ApiErrorType;           // 错误类型
  message: string;              // 错误消息
  code?: number;                // HTTP 状态码 (如适用)
  originalError?: Error;        // 原始错误对象
  retryable: boolean;           // 是否可重试 (自动计算)
  retryAfter?: number;          // 建议重试延迟 (毫秒)
}
```

### 属性说明

| 属性 | 类型 | 说明 |
|------|------|------|
| `type` | `ApiErrorType` | 错误类型枚举值 |
| `message` | `string` | 人类可读的错误消息 |
| `code` | `number \| undefined` | HTTP 状态码 (网络错误为 undefined) |
| `originalError` | `Error \| undefined` | 原始的 JavaScript Error 对象 |
| `retryable` | `boolean` | 是否可以自动重试 |
| `retryAfter` | `number \| undefined` | 建议的重试延迟时间 (毫秒) |

## 捕获错误

### 基本错误捕获

使用 try-catch 捕获所有错误:

```typescript
import { TushareClient, ApiError } from '@hestudy/tushare-sdk';

const client = new TushareClient({ token: 'YOUR_TOKEN' });

try {
  const stocks = await client.getStockBasic();
  console.log(stocks);
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`错误类型: ${error.type}`);
    console.error(`错误消息: ${error.message}`);
    console.error(`HTTP 状态码: ${error.code}`);
    console.error(`是否可重试: ${error.retryable}`);
  } else {
    console.error('未知错误:', error);
  }
}
```

### 访问错误详情

```typescript
try {
  const stocks = await client.getStockBasic();
} catch (error) {
  if (error instanceof ApiError) {
    // 基本信息
    console.log('错误类型:', error.type);
    console.log('错误消息:', error.message);

    // HTTP 信息 (如果有)
    if (error.code) {
      console.log('HTTP 状态码:', error.code);
    }

    // 重试信息
    if (error.retryable) {
      console.log('该错误可以重试');
      if (error.retryAfter) {
        console.log(`建议等待 ${error.retryAfter}ms 后重试`);
      }
    }

    // 原始错误 (调试用)
    if (error.originalError) {
      console.log('原始错误:', error.originalError);
    }
  }
}
```

## 处理特定错误

### 认证错误 (AUTH_ERROR)

Token 无效或过期时触发:

```typescript
import { TushareClient, ApiError, ApiErrorType } from '@hestudy/tushare-sdk';

const client = new TushareClient({ token: 'YOUR_TOKEN' });

try {
  const stocks = await client.getStockBasic();
} catch (error) {
  if (error instanceof ApiError && error.type === ApiErrorType.AUTH_ERROR) {
    console.error('Token 无效,请检查:');
    console.error('1. Token 是否正确复制 (无多余空格)');
    console.error('2. 账号是否已激活');
    console.error('3. Token 是否已过期');

    // 提示用户重新配置 Token
    process.exit(1);
  }
}
```

### 限流错误 (RATE_LIMIT)

请求频率超过积分等级限制时触发:

```typescript
try {
  const stocks = await client.getStockBasic();
} catch (error) {
  if (error instanceof ApiError && error.type === ApiErrorType.RATE_LIMIT) {
    console.log('请求频率超限');

    if (error.retryAfter) {
      console.log(`Tushare 建议等待 ${error.retryAfter}ms 后重试`);

      // 可选: 等待后自动重试
      await new Promise(resolve => setTimeout(resolve, error.retryAfter!));
      // 重试逻辑...
    } else {
      console.log('建议:');
      console.log('1. 配置并发控制 (concurrency 选项)');
      console.log('2. 增加请求间隔时间');
      console.log('3. 升级 Tushare 积分等级');
    }
  }
}
```

### 网络错误 (NETWORK_ERROR)

网络连接失败时触发:

```typescript
try {
  const stocks = await client.getStockBasic();
} catch (error) {
  if (error instanceof ApiError && error.type === ApiErrorType.NETWORK_ERROR) {
    console.error('网络连接失败,请检查:');
    console.error('1. 网络连接是否正常');
    console.error('2. 是否可以访问 api.tushare.pro');
    console.error('3. 防火墙或代理设置是否正确');

    // SDK 会自动重试网络错误
    console.log('SDK 将自动重试...');
  }
}
```

### 服务器错误 (SERVER_ERROR)

Tushare 服务器返回 5xx 错误时触发:

```typescript
try {
  const stocks = await client.getStockBasic();
} catch (error) {
  if (error instanceof ApiError && error.type === ApiErrorType.SERVER_ERROR) {
    console.error(`Tushare 服务器错误 (${error.code})`);
    console.error('这通常是 Tushare 服务端的临时问题');
    console.error('SDK 将自动重试,如果持续失败,请稍后再试');
  }
}
```

### 参数验证错误 (VALIDATION_ERROR)

请求参数不合法时触发:

```typescript
try {
  const dailyData = await client.getDailyQuote({
    // 错误: 日期格式不正确 (应该是 YYYYMMDD)
    start_date: '2024-01-01',
    end_date: '2024-01-31'
  });
} catch (error) {
  if (error instanceof ApiError && error.type === ApiErrorType.VALIDATION_ERROR) {
    console.error('参数验证失败:', error.message);
    console.error('请检查:');
    console.error('1. 参数格式是否正确 (如日期格式为 YYYYMMDD)');
    console.error('2. 必需参数是否提供');
    console.error('3. 参数值是否在有效范围内');
  }
}
```

### 超时错误 (TIMEOUT_ERROR)

请求超时时触发:

```typescript
try {
  const stocks = await client.getStockBasic();
} catch (error) {
  if (error instanceof ApiError && error.type === ApiErrorType.TIMEOUT_ERROR) {
    console.error('请求超时');
    console.error('建议:');
    console.error('1. 增加 timeout 配置值');
    console.error('2. 减少查询的数据量 (使用日期范围过滤)');
    console.error('3. 检查网络连接速度');

    // SDK 会自动重试超时错误
    console.log('SDK 将自动重试...');
  }
}
```

## 自动重试机制

SDK 会自动重试以下类型的错误:
- `RATE_LIMIT` - 限流错误
- `NETWORK_ERROR` - 网络错误
- `TIMEOUT_ERROR` - 超时错误
- `SERVER_ERROR` - 服务器错误

### 重试行为

SDK 使用**指数退避算法**进行重试:

```
delay = min(initialDelay * backoffFactor^n, maxDelay)
```

默认配置:
- 最大重试次数: 3 次
- 初始延迟: 1000ms (1秒)
- 最大延迟: 30000ms (30秒)
- 退避因子: 2

### 配置重试策略

```typescript
const client = new TushareClient({
  token: 'YOUR_TOKEN',
  retry: {
    maxRetries: 5,        // 增加重试次数
    initialDelay: 2000,   // 增加初始延迟
    maxDelay: 60000,      // 增加最大延迟
    backoffFactor: 2      // 保持退避因子
  }
});
```

更多重试配置选项,请查看 [配置指南](/guide/configuration#重试配置)。

### 禁用自动重试

```typescript
const client = new TushareClient({
  token: 'YOUR_TOKEN',
  retry: {
    maxRetries: 0  // 禁用重试
  }
});
```

## 错误处理最佳实践

### 1. 始终使用 try-catch

所有 API 调用都应该包裹在 try-catch 中:

```typescript
// ✅ 推荐
async function fetchStocks() {
  try {
    const stocks = await client.getStockBasic();
    return stocks;
  } catch (error) {
    console.error('获取股票列表失败:', error);
    throw error; // 或返回默认值
  }
}

// ❌ 不推荐 - 缺少错误处理
async function fetchStocks() {
  const stocks = await client.getStockBasic();
  return stocks;
}
```

### 2. 区分可重试和不可重试错误

根据 `error.retryable` 属性决定是否重试:

```typescript
async function fetchWithRetry(fn: () => Promise<any>, maxAttempts = 3) {
  let lastError: ApiError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof ApiError) {
        lastError = error;

        // 如果错误不可重试,立即抛出
        if (!error.retryable) {
          throw error;
        }

        // 如果还有重试机会,等待后重试
        if (attempt < maxAttempts) {
          const delay = error.retryAfter || 1000 * attempt;
          console.log(`第 ${attempt} 次尝试失败,等待 ${delay}ms 后重试...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }

      throw error;
    }
  }

  throw lastError!;
}

// 使用
try {
  const stocks = await fetchWithRetry(() => client.getStockBasic());
} catch (error) {
  console.error('重试失败:', error);
}
```

### 3. 记录错误日志

记录详细的错误信息便于调试:

```typescript
import { TushareClient, ApiError, ConsoleLogger, LogLevel } from '@hestudy/tushare-sdk';

// 启用调试日志
const client = new TushareClient({
  token: 'YOUR_TOKEN',
  logger: new ConsoleLogger(LogLevel.DEBUG)
});

try {
  const stocks = await client.getStockBasic();
} catch (error) {
  if (error instanceof ApiError) {
    // 记录完整的错误信息
    console.error({
      timestamp: new Date().toISOString(),
      errorType: error.type,
      message: error.message,
      code: error.code,
      retryable: error.retryable,
      stack: error.stack
    });
  }
}
```

### 4. 提供用户友好的错误消息

将技术错误转换为用户可理解的消息:

```typescript
function getUserFriendlyErrorMessage(error: ApiError): string {
  switch (error.type) {
    case ApiErrorType.AUTH_ERROR:
      return '身份验证失败,请检查 API Token 是否正确';

    case ApiErrorType.RATE_LIMIT:
      return '请求过于频繁,请稍后再试';

    case ApiErrorType.NETWORK_ERROR:
      return '网络连接失败,请检查网络设置';

    case ApiErrorType.SERVER_ERROR:
      return 'Tushare 服务暂时不可用,请稍后再试';

    case ApiErrorType.VALIDATION_ERROR:
      return `参数错误: ${error.message}`;

    case ApiErrorType.TIMEOUT_ERROR:
      return '请求超时,请重试或减少查询数据量';

    default:
      return `发生错误: ${error.message}`;
  }
}

// 使用
try {
  const stocks = await client.getStockBasic();
} catch (error) {
  if (error instanceof ApiError) {
    const userMessage = getUserFriendlyErrorMessage(error);
    console.error(userMessage);
  }
}
```

### 5. 实现降级策略

当 API 调用失败时,提供备用方案:

```typescript
async function getStocksWithFallback() {
  try {
    // 尝试从 API 获取
    return await client.getStockBasic({ list_status: 'L' });
  } catch (error) {
    if (error instanceof ApiError) {
      console.warn('API 调用失败,使用缓存数据:', error.message);

      // 降级方案: 返回缓存数据或默认值
      return getCachedStocks(); // 从缓存或数据库读取
    }
    throw error;
  }
}
```

## 常见错误场景

### 场景 1: Token 无效

**错误信息**: `AUTH_ERROR: Invalid token`

**解决方法**:
1. 检查 Token 是否正确复制 (无多余空格)
2. 确认账号已激活
3. 检查 Token 是否已过期
4. 重新获取 Token

### 场景 2: 请求频率超限

**错误信息**: `RATE_LIMIT: Request rate limit exceeded`

**解决方法**:
1. 配置并发控制:
   ```typescript
   const client = new TushareClient({
     token: 'YOUR_TOKEN',
     concurrency: {
       maxConcurrent: 1,
       minInterval: 1000  // 1 次/秒
     }
   });
   ```
2. 增加积分等级
3. 启用缓存减少重复请求

### 场景 3: 参数格式错误

**错误信息**: `VALIDATION_ERROR: Invalid date format`

**解决方法**:
- 日期格式必须为 YYYYMMDD (如 `'20240131'`)
- 股票代码格式为 TS 格式 (如 `'000001.SZ'`)
- 检查 API 文档确认参数要求

### 场景 4: 网络超时

**错误信息**: `TIMEOUT_ERROR: Request timeout`

**解决方法**:
1. 增加超时时间:
   ```typescript
   const client = new TushareClient({
     token: 'YOUR_TOKEN',
     timeout: 60000  // 60秒
   });
   ```
2. 减少查询数据量 (使用日期范围过滤)
3. 检查网络连接

## 下一步

- [配置指南](/guide/configuration) - 了解如何配置重试策略
- [快速开始](/guide/quick-start) - 学习基本用法
- [API 文档](/api/stock/basic) - 查看所有可用的 API
