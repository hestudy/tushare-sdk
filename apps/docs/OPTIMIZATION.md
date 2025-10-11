# 文档站优化指南

本文档说明文档站的性能优化措施和最佳实践。

## 响应式设计

### 移动端适配

rspress 默认提供完整的响应式设计支持:

- **断点设置**:
  - 移动端: < 768px
  - 平板: 768px - 1024px
  - 桌面: > 1024px

- **移动端特性**:
  - 侧边栏自动折叠为抽屉式菜单
  - 导航栏自动适配移动端布局
  - 代码块支持横向滚动
  - 图片自动缩放适应屏幕宽度

### 测试验证

运行响应式测试:

```bash
pnpm test:e2e tests/e2e/responsive.spec.ts
```

## 图片优化

### T067: 图片优化策略

#### 1. 使用 WebP 格式

将所有图片转换为 WebP 格式以减小文件大小:

```bash
# 安装 imagemin 工具
pnpm add -D imagemin imagemin-webp

# 转换图片
npx imagemin public/*.{jpg,png} --out-dir=public --plugin=webp
```

#### 2. 图片懒加载

在 Markdown 中使用图片时,rspress 会自动添加懒加载:

```markdown
![图片描述](/path/to/image.webp)
```

rspress 会自动转换为:

```html
<img src="/path/to/image.webp" alt="图片描述" loading="lazy" />
```

#### 3. 响应式图片

对于大图,提供多个尺寸版本:

```markdown
![图片描述](/path/to/image-800.webp)
```

建议图片尺寸:
- 移动端: 800px 宽
- 平板: 1200px 宽
- 桌面: 1600px 宽

#### 4. 图片压缩

使用 imagemin 压缩图片:

```bash
# 压缩 PNG
npx imagemin public/*.png --out-dir=public --plugin=pngquant

# 压缩 JPEG
npx imagemin public/*.jpg --out-dir=public --plugin=mozjpeg
```

### 图片优化检查清单

- [ ] 所有图片已转换为 WebP 格式
- [ ] 图片已压缩(质量 80-85%)
- [ ] 大图提供多个尺寸版本
- [ ] 图片使用懒加载
- [ ] 图片添加了 alt 属性(SEO 和无障碍)

## 缓存策略

### T068: 配置缓存策略

#### 1. 静态资源缓存

在部署平台配置 HTTP 缓存头:

**Vercel** (`vercel.json`):

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*).html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

**Netlify** (`netlify.toml`):

```toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
```

**Nginx**:

```nginx
location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location ~* \.html$ {
    expires -1;
    add_header Cache-Control "public, max-age=0, must-revalidate";
}
```

#### 2. 缓存策略说明

- **静态资源** (JS, CSS, 图片):
  - `max-age=31536000` (1年)
  - `immutable` 标记,避免重新验证
  - rspress 使用内容哈希命名,确保缓存安全

- **HTML 文件**:
  - `max-age=0` 立即过期
  - `must-revalidate` 每次都验证
  - 确保用户总是获取最新内容

- **搜索索引** (JSON):
  - `max-age=3600` (1小时)
  - 平衡新鲜度和性能

#### 3. Service Worker (可选)

对于需要离线支持的场景,可以配置 Service Worker:

```typescript
// src/sw.ts
import { precacheAndRoute } from 'workbox-precaching';

// 预缓存构建产物
precacheAndRoute(self.__WB_MANIFEST);
```

## 性能测试

### 运行性能测试

```bash
# 页面加载性能测试
pnpm test:e2e tests/performance/page-load.spec.ts

# 搜索性能测试
pnpm test:e2e tests/performance/search.spec.ts
```

### 性能指标目标

| 指标 | 目标值 | 说明 |
|------|--------|------|
| 首页加载时间 | < 2s | 从导航到页面可交互 |
| API 详情页加载时间 | < 2s | 从导航到页面可交互 |
| 搜索响应时间 | < 500ms | 从输入到显示结果 |
| FCP (首次内容绘制) | < 1.5s | 用户看到第一个内容 |
| LCP (最大内容绘制) | < 2.5s | 最大内容元素渲染完成 |
| CLS (累积布局偏移) | < 0.1 | 页面布局稳定性 |
| JavaScript 包大小 | < 500KB | 压缩后的 JS 总大小 |

### 使用 Lighthouse 测试

```bash
# 安装 Lighthouse
npm install -g lighthouse

# 运行 Lighthouse 测试
lighthouse http://localhost:5173 --view

# 仅测试性能
lighthouse http://localhost:5173 --only-categories=performance --view
```

## 构建优化

### 代码分割

rspress 默认启用智能代码分割:

```typescript
// rspress.config.ts
export default {
  builderConfig: {
    performance: {
      chunkSplit: {
        strategy: 'split-by-experience', // 基于经验的分割策略
      },
    },
  },
};
```

### Tree Shaking

确保所有依赖都支持 Tree Shaking:

- 使用 ES Modules 导入
- 避免使用 `import *`
- 使用具名导入

```typescript
// ✅ 推荐
import { getStockBasic } from '@tushare/sdk';

// ❌ 避免
import * as tushare from '@tushare/sdk';
```

### 压缩优化

rspress 默认启用 Terser 压缩:

```typescript
// rspress.config.ts
export default {
  builderConfig: {
    output: {
      minify: {
        js: true,
        css: true,
      },
    },
  },
};
```

## CDN 部署

### 推荐的 CDN 服务

1. **Vercel** (推荐)
   - 自动全球 CDN
   - 边缘缓存
   - 自动 HTTPS

2. **Netlify**
   - 全球 CDN
   - 自动构建
   - 表单处理

3. **Cloudflare Pages**
   - 全球 CDN
   - DDoS 防护
   - 免费 SSL

### CDN 配置建议

- 启用 Brotli 压缩
- 启用 HTTP/2 或 HTTP/3
- 配置合适的缓存策略
- 使用 CDN 的图片优化服务

## 监控和分析

### 性能监控

使用 Web Vitals 监控真实用户性能:

```typescript
// src/analytics.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // 发送到分析服务
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### 分析工具

- **Google Analytics**: 用户行为分析
- **Vercel Analytics**: 性能和用户体验监控
- **Sentry**: 错误监控
- **LogRocket**: 用户会话回放

## 优化检查清单

### 部署前检查

- [ ] 所有图片已优化(WebP 格式,压缩)
- [ ] 配置了合适的缓存策略
- [ ] 运行性能测试,所有指标达标
- [ ] 运行 Lighthouse 测试,性能评分 > 90
- [ ] 测试移动端响应式布局
- [ ] 验证代码分割正常工作
- [ ] 检查 JavaScript 包大小 < 500KB
- [ ] 配置 CDN 和 HTTPS
- [ ] 启用 Gzip/Brotli 压缩
- [ ] 设置性能监控

### 持续优化

- 定期运行性能测试
- 监控真实用户性能指标
- 分析性能瓶颈
- 优化慢速页面
- 更新依赖版本
- 审查新增功能的性能影响

## 参考资源

- [rspress 性能优化](https://rspress.dev/guide/advanced/performance)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebP 图片格式](https://developers.google.com/speed/webp)
- [HTTP 缓存](https://web.dev/http-cache/)
