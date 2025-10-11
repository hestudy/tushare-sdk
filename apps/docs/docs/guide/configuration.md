---
title: 配置 Tushare SDK
description: 学习如何配置重试、缓存、并发控制等高级特性
---

# 配置

本指南详细介绍 Tushare SDK 的所有配置选项,包括重试策略、缓存配置、并发控制和日志记录等高级特性。

## 基本配置

创建 `TushareClient` 实例时传入配置选项:

```typescript
import { TushareClient } from '@hestudy/tushare-sdk';

const client = new TushareClient({
  token: 'YOUR_TUSHARE_TOKEN',
  timeout: 30000,              // 请求超时时间 (毫秒)
  endpoint: 'https://api.tushare.pro'  // API 端点
});
```

### 配置接口

```typescript
interface TushareConfig {
  token: string;                              // API Token (必需)
  endpoint?: string;                          // API 端点 (默认: 'https://api.tushare.pro')
  timeout?: number;                           // 请求超时时间 (默认: 30000ms)
  retry?: Partial<RetryConfig>;               // 重试配置
  cache?: Partial<CacheConfig>;               // 缓存配置
  concurrency?: Partial<ConcurrencyConfig>;   // 并发控制配置
  logger?: Logger;                            // 日志记录器
}
```

| 配置项 | 类型 | 必需 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `token` | `string` | ✅ | - | Tushare API Token |
| `endpoint` | `string` | ❌ | `'https://api.tushare.pro'` | API 端点 |
| `timeout` | `number` | ❌ | `30000` | 请求超时时间 (毫秒) |
| `retry` | `Partial<RetryConfig>` | ❌ | - | 重试配置 |
| `cache` | `Partial<CacheConfig>` | ❌ | - | 缓存配置 |
| `concurrency` | `Partial<ConcurrencyConfig>` | ❌ | - | 并发控制配置 |
| `logger` | `Logger` | ❌ | `ConsoleLogger(INFO)` | 日志记录器 |

## 重试配置

SDK 使用指数退避算法自动重试失败的请求。

### 配置选项

```typescript
import { TushareClient } from '@hestudy/tushare-sdk';

const client = new TushareClient({
  token: 'YOUR_TOKEN',
  retry: {
    maxRetries: 3,          // 最大重试次数
    initialDelay: 1000,     // 初始延迟 (毫秒)
    maxDelay: 30000,        // 最大延迟 (毫秒)
    backoffFactor: 2        // 退避因子
  }
});
```

### RetryConfig 接口

```typescript
interface RetryConfig {
  maxRetries: number;      // 最大重试次数 (默认: 3)
  initialDelay: number;    // 初始延迟 (默认: 1000ms)
  maxDelay: number;        // 最大延迟 (默认: 30000ms)
  backoffFactor: number;   // 指数退避因子 (默认: 2)
}
```

| 配置项 | 类型 | 默认值 | 取值范围 | 说明 |
|--------|------|--------|----------|------|
| `maxRetries` | `number` | `3` | 0-10 | 最大重试次数 |
| `initialDelay` | `number` | `1000` | ≥0 | 初始延迟 (毫秒) |
| `maxDelay` | `number` | `30000` | ≥1000 | 最大延迟 (毫秒) |
| `backoffFactor` | `number` | `2` | ≥1 | 指数退避因子 |

### 延迟计算公式

```
delay = min(initialDelay * backoffFactor^n, maxDelay)
```

例如,使用默认配置时:
- 第1次重试: 1秒
- 第2次重试: 2秒
- 第3次重试: 4秒

### 可重试的错误类型

SDK 会自动重试以下类型的错误:
- `RATE_LIMIT` - 限流错误 (请求频率超限)
- `NETWORK_ERROR` - 网络错误 (网络连接失败)
- `TIMEOUT_ERROR` - 超时错误 (请求超时)
- `SERVER_ERROR` - 服务器错误 (500, 502, 503, 504)

## 缓存配置

启用缓存可以减少重复请求,提高性能。

### 使用内存缓存

```typescript
import { TushareClient } from '@hestudy/tushare-sdk';

const client = new TushareClient({
  token: 'YOUR_TOKEN',
  cache: {
    enabled: true,
    ttl: 3600000  // 缓存 1 小时 (毫秒)
  }
});
```

### CacheConfig 接口

```typescript
interface CacheConfig {
  enabled: boolean;         // 是否启用缓存 (默认: false)
  provider?: CacheProvider; // 缓存提供者 (默认: MemoryCacheProvider)
  ttl: number;              // 缓存过期时间 (默认: 3600000ms = 1小时)
}
```

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `enabled` | `boolean` | `false` | 是否启用缓存 |
| `provider` | `CacheProvider` | `MemoryCacheProvider` | 缓存提供者 |
| `ttl` | `number` | `3600000` (1小时) | 缓存过期时间 (毫秒) |

### 自定义缓存提供者

实现 `CacheProvider` 接口以使用自定义缓存(如 Redis):

```typescript
import { CacheProvider, TushareClient } from '@hestudy/tushare-sdk';
import Redis from 'ioredis';

class RedisCacheProvider implements CacheProvider {
  private redis: Redis;

  constructor(redis: Redis) {
    this.redis = redis;
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set<T>(key: string, value: T, ttl = 3600000): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), 'PX', ttl);
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async clear(): Promise<void> {
    await this.redis.flushdb();
  }
}

// 使用自定义缓存
const redis = new Redis();
const client = new TushareClient({
  token: 'YOUR_TOKEN',
  cache: {
    enabled: true,
    provider: new RedisCacheProvider(redis),
    ttl: 7200000  // 2 小时
  }
});
```

### CacheProvider 接口

```typescript
interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}
```

## 并发控制配置

根据 Tushare 积分等级配置并发限制,避免触发限流。

### 配置选项

```typescript
import { TushareClient } from '@hestudy/tushare-sdk';

const client = new TushareClient({
  token: 'YOUR_TOKEN',
  concurrency: {
    maxConcurrent: 5,    // 最大并发请求数
    minInterval: 200     // 最小请求间隔 (毫秒)
  }
});
```

### ConcurrencyConfig 接口

```typescript
interface ConcurrencyConfig {
  maxConcurrent: number;  // 最大并发请求数 (默认: 5)
  minInterval: number;    // 最小请求间隔 (默认: 200ms)
}
```

| 配置项 | 类型 | 默认值 | 取值范围 | 说明 |
|--------|------|--------|----------|------|
| `maxConcurrent` | `number` | `5` | 1-50 | 最大并发请求数 |
| `minInterval` | `number` | `200` | ≥0 | 最小请求间隔 (毫秒) |

### 积分等级推荐配置

根据积分等级选择合适的配置:

| 积分等级 | 频率限制 | 推荐配置 |
|---------|---------|---------|
| 200 积分 | 1 次/秒 | `{ maxConcurrent: 1, minInterval: 1000 }` |
| 2000 积分 | 5 次/秒 | `{ maxConcurrent: 5, minInterval: 200 }` |
| 5000 积分 | 20 次/秒 | `{ maxConcurrent: 20, minInterval: 50 }` |

### 示例: 200积分配置

```typescript
const client = new TushareClient({
  token: 'YOUR_TOKEN',
  concurrency: {
    maxConcurrent: 1,
    minInterval: 1000  // 1 次/秒
  }
});
```

### 示例: 5000积分配置

```typescript
const client = new TushareClient({
  token: 'YOUR_TOKEN',
  concurrency: {
    maxConcurrent: 20,
    minInterval: 50  // 20 次/秒
  }
});
```

## 日志配置

自定义日志输出。

### 使用内置日志

```typescript
import { TushareClient, ConsoleLogger, LogLevel } from '@hestudy/tushare-sdk';

const client = new TushareClient({
  token: 'YOUR_TOKEN',
  logger: new ConsoleLogger(LogLevel.DEBUG)  // 输出调试日志
});
```

### LogLevel 枚举

```typescript
enum LogLevel {
  DEBUG = 0,  // 调试日志
  INFO = 1,   // 信息日志
  WARN = 2,   // 警告日志
  ERROR = 3   // 错误日志
}
```

### 自定义日志记录器

实现 `Logger` 接口以使用自定义日志记录器:

```typescript
import { Logger, TushareClient } from '@hestudy/tushare-sdk';

class CustomLogger implements Logger {
  debug(message: string, ...args: unknown[]): void {
    // 自定义调试日志处理
    console.debug(`[DEBUG] ${message}`, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    // 自定义信息日志处理
    console.info(`[INFO] ${message}`, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    // 自定义警告日志处理
    console.warn(`[WARN] ${message}`, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    // 自定义错误日志处理
    console.error(`[ERROR] ${message}`, ...args);
  }
}

const client = new TushareClient({
  token: 'YOUR_TOKEN',
  logger: new CustomLogger()
});
```

### Logger 接口

```typescript
interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}
```

## 完整配置示例

```typescript
import { TushareClient, ConsoleLogger, LogLevel } from '@hestudy/tushare-sdk';

const client = new TushareClient({
  // 基本配置
  token: 'YOUR_TOKEN',
  endpoint: 'https://api.tushare.pro',
  timeout: 30000,

  // 重试配置
  retry: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffFactor: 2
  },

  // 缓存配置
  cache: {
    enabled: true,
    ttl: 3600000  // 1 小时
  },

  // 并发控制 (2000积分等级)
  concurrency: {
    maxConcurrent: 5,
    minInterval: 200
  },

  // 日志配置
  logger: new ConsoleLogger(LogLevel.INFO)
});
```

## 环境变量配置

推荐使用环境变量管理 Token:

### .env 文件

```bash
TUSHARE_TOKEN=your_api_token_here
```

### 在代码中使用

```typescript
import { TushareClient } from '@hestudy/tushare-sdk';

const client = new TushareClient({
  token: process.env.TUSHARE_TOKEN!
});
```

## 获取 API Token

如果你还没有 API Token,请按照以下步骤获取:

1. 访问 [Tushare Pro 官网](https://tushare.pro/register)
2. 注册并登录账号
3. 在个人中心获取 API Token
4. 查看积分等级,根据积分配置并发限制

## 常见问题

### Q: Token 无效怎么办?

A: 请检查:
1. Token 是否正确复制(没有多余的空格)
2. Token 是否已过期
3. 账号是否已激活

### Q: 如何选择合适的并发配置?

A: 根据 Tushare 积分等级选择:
- 200 积分: `{ maxConcurrent: 1, minInterval: 1000 }`
- 2000 积分: `{ maxConcurrent: 5, minInterval: 200 }`
- 5000 积分: `{ maxConcurrent: 20, minInterval: 50 }`

### Q: 是否应该启用缓存?

A: 推荐启用缓存,特别是在以下场景:
- 频繁查询相同的数据(如股票基础信息)
- 需要减少 API 调用次数以避免限流
- 数据更新频率较低(如日线数据)

### Q: 如何在不同环境使用不同的配置?

A: 使用环境变量文件:

```typescript
// .env.development
TUSHARE_TOKEN=dev_token
TUSHARE_LOG_LEVEL=DEBUG

// .env.production
TUSHARE_TOKEN=prod_token
TUSHARE_LOG_LEVEL=INFO
```

## 安全最佳实践

1. **永远不要将 Token 硬编码在代码中**

```typescript
// ❌ 不要这样做
const client = new TushareClient({ token: 'abc123xyz' });

// ✅ 使用环境变量
const client = new TushareClient({ token: process.env.TUSHARE_TOKEN! });
```

2. **将 .env 文件添加到 .gitignore**

```bash
# .gitignore
.env
.env.local
.env.*.local
```

3. **提供 .env.example 模板**

```bash
# .env.example
TUSHARE_TOKEN=your_token_here
```

4. **在生产环境使用环境变量管理工具**

如 AWS Secrets Manager, Azure Key Vault, 或 Vercel Environment Variables。

## 下一步

- [快速开始](/guide/quick-start) - 学习如何使用 SDK
- [错误处理](/guide/error-handling) - 了解错误处理机制
- [API 文档](/api/stock/basic) - 查看完整的 API 文档
