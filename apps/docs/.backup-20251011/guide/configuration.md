---
title: 配置 Tushare SDK
description: 学习如何配置 API Token 和其他选项
---

# 配置

本指南将帮助你配置 Tushare SDK,包括 API Token 设置和其他可选配置。

## API Token 配置

Tushare SDK 需要 API Token 才能访问数据接口。你可以通过以下方式配置 Token:

### 方式 1: 环境变量 (推荐)

在项目根目录创建 `.env` 文件:

```bash
TUSHARE_TOKEN=your_api_token_here
```

然后在代码中使用:

```typescript
import { configure } from '@tushare/sdk';

// SDK 会自动读取环境变量 TUSHARE_TOKEN
configure();
```

**优点:**
- 安全性高,Token 不会被提交到代码仓库
- 适合团队协作和生产环境
- 支持不同环境使用不同的 Token

### 方式 2: 代码中直接配置

```typescript
import { configure } from '@tushare/sdk';

configure({
  token: 'your_api_token_here'
});
```

**注意:** 不要将 Token 硬编码在代码中并提交到公开仓库!

### 方式 3: 配置文件

创建 `tushare.config.js` 文件:

```javascript
module.exports = {
  token: process.env.TUSHARE_TOKEN,
  timeout: 30000,
  retries: 3
};
```

然后在代码中加载:

```typescript
import { configure } from '@tushare/sdk';
import config from './tushare.config.js';

configure(config);
```

## 获取 API Token

如果你还没有 API Token,请按照以下步骤获取:

1. 访问 [Tushare 官网](https://tushare.pro)
2. 注册账号并登录
3. 进入"个人中心" → "接口 Token"
4. 复制你的 Token

## 配置选项

### 完整配置示例

```typescript
import { configure } from '@tushare/sdk';

configure({
  // API Token (必填)
  token: 'your_api_token_here',
  
  // 请求超时时间 (毫秒,默认: 30000)
  timeout: 30000,
  
  // 失败重试次数 (默认: 3)
  retries: 3,
  
  // 重试延迟 (毫秒,默认: 1000)
  retryDelay: 1000,
  
  // API 基础 URL (默认: https://api.tushare.pro)
  baseURL: 'https://api.tushare.pro',
  
  // 是否启用调试日志 (默认: false)
  debug: false,
  
  // 自定义请求头
  headers: {
    'User-Agent': 'My App/1.0.0'
  }
});
```

### 配置选项说明

#### token

- **类型**: `string`
- **必填**: 是
- **说明**: Tushare API Token

#### timeout

- **类型**: `number`
- **默认值**: `30000` (30秒)
- **说明**: 请求超时时间,单位毫秒

```typescript
configure({
  token: 'your_token',
  timeout: 60000 // 60秒超时
});
```

#### retries

- **类型**: `number`
- **默认值**: `3`
- **说明**: 请求失败时的重试次数

```typescript
configure({
  token: 'your_token',
  retries: 5 // 失败后重试 5 次
});
```

#### retryDelay

- **类型**: `number`
- **默认值**: `1000` (1秒)
- **说明**: 重试之间的延迟时间,单位毫秒

```typescript
configure({
  token: 'your_token',
  retryDelay: 2000 // 重试前等待 2 秒
});
```

#### baseURL

- **类型**: `string`
- **默认值**: `'https://api.tushare.pro'`
- **说明**: API 基础 URL,一般不需要修改

#### debug

- **类型**: `boolean`
- **默认值**: `false`
- **说明**: 是否启用调试日志

```typescript
configure({
  token: 'your_token',
  debug: true // 开发环境启用调试日志
});
```

## 环境变量配置

推荐使用环境变量管理不同环境的配置:

### .env.development (开发环境)

```bash
TUSHARE_TOKEN=your_dev_token
TUSHARE_DEBUG=true
TUSHARE_TIMEOUT=60000
```

### .env.production (生产环境)

```bash
TUSHARE_TOKEN=your_prod_token
TUSHARE_DEBUG=false
TUSHARE_TIMEOUT=30000
```

### 在代码中使用

```typescript
import { configure } from '@tushare/sdk';

configure({
  token: process.env.TUSHARE_TOKEN!,
  debug: process.env.TUSHARE_DEBUG === 'true',
  timeout: parseInt(process.env.TUSHARE_TIMEOUT || '30000')
});
```

## 验证配置

配置完成后,可以通过以下代码验证配置是否正确:

```typescript
import { configure, getStockBasic } from '@tushare/sdk';

async function testConfig() {
  try {
    // 配置 SDK
    configure({
      token: process.env.TUSHARE_TOKEN!,
      debug: true
    });
    
    // 测试 API 调用
    const stocks = await getStockBasic({ list_status: 'L' });
    console.log(`✅ 配置成功! 获取到 ${stocks.length} 只股票`);
  } catch (error) {
    console.error('❌ 配置失败:', error);
  }
}

testConfig();
```

## 常见问题

### Q: Token 无效怎么办?

A: 请检查:
1. Token 是否正确复制(没有多余的空格)
2. Token 是否已过期
3. 账号是否有访问权限

### Q: 如何在 TypeScript 中使用环境变量?

A: 安装 `@types/node` 并配置 `tsconfig.json`:

```bash
npm install -D @types/node
```

```json
{
  "compilerOptions": {
    "types": ["node"]
  }
}
```

### Q: 如何在不同环境使用不同的配置?

A: 使用 `dotenv` 包加载不同的环境变量文件:

```bash
npm install dotenv
```

```typescript
import dotenv from 'dotenv';
import { configure } from '@tushare/sdk';

// 根据环境加载不同的配置文件
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : '.env.development';

dotenv.config({ path: envFile });

configure({
  token: process.env.TUSHARE_TOKEN!
});
```

### Q: 配置是否需要在每个文件中重复?

A: 不需要。只需在应用入口文件(如 `index.ts` 或 `app.ts`)配置一次即可:

```typescript
// index.ts (入口文件)
import { configure } from '@tushare/sdk';

configure({
  token: process.env.TUSHARE_TOKEN!
});

// 其他文件可以直接使用,无需重复配置
import { getStockBasic } from '@tushare/sdk';

const stocks = await getStockBasic();
```

## 安全最佳实践

1. **永远不要将 Token 硬编码在代码中**

```typescript
// ❌ 不要这样做
configure({ token: 'abc123xyz' });

// ✅ 使用环境变量
configure({ token: process.env.TUSHARE_TOKEN! });
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
TUSHARE_DEBUG=false
TUSHARE_TIMEOUT=30000
```

4. **在生产环境使用环境变量管理工具**

如 AWS Secrets Manager, Azure Key Vault, 或 Vercel Environment Variables。

## 下一步

- 📚 [快速开始](/guide/quick-start) - 学习如何使用 SDK
- 📖 [API 文档](/api/stock/basic) - 查看完整的 API 文档
- 📝 [更新日志](/changelog) - 了解最新版本的变化
