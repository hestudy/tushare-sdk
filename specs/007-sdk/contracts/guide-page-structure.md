# 指南页面标准结构

**Feature**: 007-sdk | **Date**: 2025-10-11

## Purpose

定义指南类文档页面（如安装、快速开始、配置等）的统一结构，确保用户能轻松上手 SDK。

## Guide Page Types

### Type 1: Installation Guide (安装指南)

#### Required Sections

1. **系统要求**
   ```markdown
   ## 系统要求

   - Node.js >= 18.0.0
   - npm >= 8.0.0 或 pnpm >= 8.0.0
   ```

2. **安装方法**
   ```markdown
   ## 安装

   ### 使用 npm

   \`\`\`bash
   npm install @hestudy/tushare-sdk
   \`\`\`

   ### 使用 pnpm

   \`\`\`bash
   pnpm add @hestudy/tushare-sdk
   \`\`\`

   ### 使用 yarn

   \`\`\`bash
   yarn add @hestudy/tushare-sdk
   \`\`\`
   ```

3. **验证安装**
   ```markdown
   ## 验证安装

   创建测试文件 `test.ts`:

   \`\`\`typescript
   import { TushareClient } from '@hestudy/tushare-sdk';

   console.log('SDK 安装成功!');
   \`\`\`

   运行:

   \`\`\`bash
   npx ts-node test.ts
   \`\`\`
   ```

4. **下一步**
   ```markdown
   ## 下一步

   - [快速开始](/guide/quick-start) - 开始使用 SDK
   - [配置](/guide/configuration) - 了解配置选项
   ```

---

### Type 2: Quick Start Guide (快速开始指南)

#### Required Sections

1. **获取 Token**
   ```markdown
   ## 获取 Tushare Token

   1. 访问 [Tushare Pro 官网](https://tushare.pro/register)
   2. 注册并登录账号
   3. 在个人中心获取 API Token
   ```

2. **创建客户端**
   ```markdown
   ## 创建客户端

   \`\`\`typescript
   import { TushareClient } from '@hestudy/tushare-sdk';

   const client = new TushareClient({
     token: 'YOUR_TUSHARE_TOKEN'
   });
   \`\`\`
   ```

3. **调用 API**
   ```markdown
   ## 调用 API

   \`\`\`typescript
   // 获取股票列表
   const stocks = await client.getStockBasic({
     list_status: 'L'
   });

   console.log(\`共查询到 \${stocks.length} 只股票\`);
   \`\`\`
   ```

4. **完整示例**
   ```markdown
   ## 完整示例

   \`\`\`typescript
   import { TushareClient } from '@hestudy/tushare-sdk';

   async function main() {
     // 创建客户端
     const client = new TushareClient({
       token: 'YOUR_TUSHARE_TOKEN'
     });

     // 查询股票
     const stocks = await client.getStockBasic({
       list_status: 'L',
       exchange: 'SSE'
     });

     // 输出结果
     stocks.slice(0, 5).forEach(stock => {
       console.log(\`\${stock.ts_code} - \${stock.name}\`);
     });
   }

   main().catch(console.error);
   \`\`\`
   ```

5. **常见问题**
   ```markdown
   ## 常见问题

   ### Token 无效错误

   如果遇到认证错误，请检查：
   - Token 是否正确复制（无多余空格）
   - 账号是否已激活

   ### 限流错误

   Tushare Pro 根据积分等级限制请求频率：
   - 200 积分: 1 次/秒
   - 2000 积分: 5 次/秒
   - 5000 积分: 20 次/秒
   ```

6. **下一步**
   ```markdown
   ## 下一步

   - [配置](/guide/configuration) - 配置重试、缓存等高级特性
   - [API 文档](/api/stock/basic) - 查看所有可用 API
   ```

---

### Type 3: Configuration Guide (配置指南)

#### Required Sections

1. **基本配置**
   ```markdown
   ## 基本配置

   \`\`\`typescript
   import { TushareClient } from '@hestudy/tushare-sdk';

   const client = new TushareClient({
     token: 'YOUR_TOKEN',
     timeout: 30000,          // 请求超时时间 (毫秒)
     endpoint: 'https://api.tushare.pro' // API 端点
   });
   \`\`\`
   ```

2. **重试配置**
   ```markdown
   ## 重试配置

   SDK 使用指数退避算法自动重试失败的请求。

   ### 配置选项

   \`\`\`typescript
   const client = new TushareClient({
     token: 'YOUR_TOKEN',
     retry: {
       maxRetries: 3,          // 最大重试次数
       initialDelay: 1000,     // 初始延迟 (毫秒)
       maxDelay: 30000,        // 最大延迟 (毫秒)
       backoffFactor: 2        // 退避因子
     }
   });
   \`\`\`

   ### 延迟计算公式

   \`\`\`
   delay = min(initialDelay * backoffFactor^n, maxDelay)
   \`\`\`

   例如，使用默认配置时：
   - 第1次重试: 1秒
   - 第2次重试: 2秒
   - 第3次重试: 4秒
   ```

3. **缓存配置**
   ```markdown
   ## 缓存配置

   启用缓存可以减少重复请求，提高性能。

   ### 使用内存缓存

   \`\`\`typescript
   const client = new TushareClient({
     token: 'YOUR_TOKEN',
     cache: {
       enabled: true,
       ttl: 3600000  // 缓存 1 小时
     }
   });
   \`\`\`

   ### 自定义缓存提供者

   实现 `CacheProvider` 接口以使用自定义缓存（如 Redis）：

   \`\`\`typescript
   import { CacheProvider } from '@hestudy/tushare-sdk';
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
   \`\`\`
   ```

4. **并发控制配置**
   ```markdown
   ## 并发控制配置

   根据 Tushare 积分等级配置并发限制。

   ### 配置选项

   \`\`\`typescript
   const client = new TushareClient({
     token: 'YOUR_TOKEN',
     concurrency: {
       maxConcurrent: 5,    // 最大并发请求数
       minInterval: 200     // 最小请求间隔 (毫秒)
     }
   });
   \`\`\`

   ### 推荐配置

   根据积分等级选择合适的配置：

   | 积分等级 | 频率限制 | 推荐配置 |
   |---------|---------|---------|
   | 200 积分 | 1 次/秒 | `{ maxConcurrent: 1, minInterval: 1000 }` |
   | 2000 积分 | 5 次/秒 | `{ maxConcurrent: 5, minInterval: 200 }` |
   | 5000 积分 | 20 次/秒 | `{ maxConcurrent: 20, minInterval: 50 }` |
   ```

5. **日志配置**
   ```markdown
   ## 日志配置

   自定义日志输出。

   ### 使用内置日志

   \`\`\`typescript
   import { TushareClient, ConsoleLogger, LogLevel } from '@hestudy/tushare-sdk';

   const client = new TushareClient({
     token: 'YOUR_TOKEN',
     logger: new ConsoleLogger(LogLevel.DEBUG)  // 输出调试日志
   });
   \`\`\`

   ### 自定义日志记录器

   \`\`\`typescript
   import { Logger } from '@hestudy/tushare-sdk';

   class CustomLogger implements Logger {
     debug(message: string, ...args: unknown[]): void {
       // 自定义调试日志处理
     }

     info(message: string, ...args: unknown[]): void {
       // 自定义信息日志处理
     }

     warn(message: string, ...args: unknown[]): void {
       // 自定义警告日志处理
     }

     error(message: string, ...args: unknown[]): void {
       // 自定义错误日志处理
     }
   }

   const client = new TushareClient({
     token: 'YOUR_TOKEN',
     logger: new CustomLogger()
   });
   \`\`\`
   ```

6. **完整配置示例**
   ```markdown
   ## 完整配置示例

   \`\`\`typescript
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

     // 并发控制
     concurrency: {
       maxConcurrent: 5,
       minInterval: 200
     },

     // 日志配置
     logger: new ConsoleLogger(LogLevel.INFO)
   });
   \`\`\`
   ```

---

### Type 4: Error Handling Guide (错误处理指南)

#### Required Sections

1. **错误类型**
   ```markdown
   ## 错误类型

   SDK 定义了以下错误类型：

   | 错误类型 | 说明 | 可重试 |
   |---------|------|--------|
   | `AUTH_ERROR` | 认证错误 (Token 无效或过期) | ❌ |
   | `RATE_LIMIT` | 限流错误 (请求频率超限) | ✅ |
   | `NETWORK_ERROR` | 网络错误 (网络连接失败) | ✅ |
   | `SERVER_ERROR` | 服务器错误 (500, 502, 503, 504) | ✅ |
   | `VALIDATION_ERROR` | 参数验证错误 (请求参数不合法) | ❌ |
   | `TIMEOUT_ERROR` | 超时错误 (请求超时) | ✅ |
   | `UNKNOWN_ERROR` | 未知错误 | ❌ |
   ```

2. **捕获错误**
   ```markdown
   ## 捕获错误

   \`\`\`typescript
   import { TushareClient, ApiError, ApiErrorType } from '@hestudy/tushare-sdk';

   const client = new TushareClient({ token: 'YOUR_TOKEN' });

   try {
     const stocks = await client.getStockBasic();
   } catch (error) {
     if (error instanceof ApiError) {
       console.error(\`错误类型: \${error.type}\`);
       console.error(\`错误消息: \${error.message}\`);
       console.error(\`HTTP 状态码: \${error.code}\`);
       console.error(\`是否可重试: \${error.retryable}\`);
     }
   }
   \`\`\`
   ```

3. **处理特定错误**
   ```markdown
   ## 处理特定错误

   ### 认证错误

   \`\`\`typescript
   try {
     const stocks = await client.getStockBasic();
   } catch (error) {
     if (error instanceof ApiError && error.type === ApiErrorType.AUTH_ERROR) {
       console.error('Token 无效，请检查 API Token');
     }
   }
   \`\`\`

   ### 限流错误

   \`\`\`typescript
   try {
     const stocks = await client.getStockBasic();
   } catch (error) {
     if (error instanceof ApiError && error.type === ApiErrorType.RATE_LIMIT) {
       console.log(\`请求频率超限，建议等待 \${error.retryAfter}ms 后重试\`);
     }
   }
   \`\`\`
   ```

4. **自动重试**
   ```markdown
   ## 自动重试

   SDK 会自动重试以下类型的错误：
   - `RATE_LIMIT` (限流)
   - `NETWORK_ERROR` (网络错误)
   - `TIMEOUT_ERROR` (超时)
   - `SERVER_ERROR` (服务器错误)

   可以通过 `retry` 配置调整重试策略：

   \`\`\`typescript
   const client = new TushareClient({
     token: 'YOUR_TOKEN',
     retry: {
       maxRetries: 5,  // 增加重试次数
       initialDelay: 2000  // 增加初始延迟
     }
   });
   \`\`\`
   ```

---

## Common Elements

所有指南页面都应包含以下通用元素：

### Navigation Links

每个指南页面结尾应包含导航链接：

```markdown
## 下一步

- [相关指南1](/guide/xxx) - 说明
- [相关指南2](/guide/yyy) - 说明
```

### Code Examples

- 所有代码示例必须完整可运行
- 使用正确的包名 `@hestudy/tushare-sdk`
- 包含必要的导入语句
- 使用真实的 Tushare 数据格式

### Type Definitions

配置相关指南应展示完整的 TypeScript 类型定义：

```typescript
interface SomeConfig {
  field1: type1;
  field2?: type2;
}
```

## Validation Checklist

更新指南文档时，使用此检查清单确保完整性：

- [ ] 标题和简介清晰描述指南内容
- [ ] 所有代码示例完整且可运行
- [ ] 使用正确的包名 `@hestudy/tushare-sdk`
- [ ] 配置选项包含类型定义和默认值
- [ ] 提供了实际应用场景的示例
- [ ] 包含常见问题或注意事项
- [ ] 结尾提供了导航链接
- [ ] 所有类型定义与源代码一致
