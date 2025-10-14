# Contract: rspress 配置修改清单

**文件路径**: `/apps/docs/rspress.config.ts`
**修改类型**: 更新侧边栏配置
**影响范围**: 文档站点导航

## 修改内容

### 位置: themeConfig.sidebar['/guide/']

在 `themeConfig.sidebar['/guide/']` 的 "快速入门" 组中,添加 MCP 使用指南链接。

### 当前配置

```typescript
themeConfig: {
  sidebar: {
    '/guide/': [
      {
        text: '快速入门',
        items: [
          { text: '安装', link: '/guide/installation' },
          { text: '快速开始', link: '/guide/quick-start' },
          { text: '配置', link: '/guide/configuration' },
          { text: '错误处理', link: '/guide/error-handling' },
        ],
      },
    ],
  },
}
```

### 修改后配置

```typescript
themeConfig: {
  sidebar: {
    '/guide/': [
      {
        text: '快速入门',
        items: [
          { text: '安装', link: '/guide/installation' },
          { text: '快速开始', link: '/guide/quick-start' },
          { text: '配置', link: '/guide/configuration' },
          { text: '错误处理', link: '/guide/error-handling' },
          { text: 'MCP 使用指南', link: '/guide/mcp-usage' }, // 新增此行
        ],
      },
    ],
  },
}
```

## 具体修改步骤

1. 打开文件 `/apps/docs/rspress.config.ts`
2. 定位到 `themeConfig.sidebar['/guide/']` 配置
3. 在 "快速入门" 组的 `items` 数组末尾添加新项:
   ```typescript
   { text: 'MCP 使用指南', link: '/guide/mcp-usage' }
   ```
4. 保存文件

## 验证方式

### 1. TypeScript 类型检查

```bash
cd apps/docs
pnpm type-check
```

预期输出: 无类型错误

### 2. 文档站点构建

```bash
cd apps/docs
pnpm build
```

预期输出: 构建成功,无错误

### 3. 本地预览

```bash
cd apps/docs
pnpm dev
```

访问 `http://localhost:3000`,检查:
- [ ] 左侧边栏"快速入门"组中显示"MCP 使用指南"链接
- [ ] 点击链接跳转到 `/guide/mcp-usage` 页面
- [ ] 页面内容正常显示

## 可选修改: 顶部导航栏

如果希望在顶部导航栏中也突出显示 MCP 服务,可以考虑添加导航项(可选,不强制):

### 当前配置

```typescript
themeConfig: {
  nav: [
    { text: '指南', link: '/guide/installation' },
    { text: 'API 文档', link: '/api/stock/basic' },
    { text: '更新日志', link: '/changelog/' },
    { text: 'GitHub', link: 'https://github.com/your-org/tushare-sdk' },
  ],
}
```

### 可选修改

```typescript
themeConfig: {
  nav: [
    { text: '指南', link: '/guide/installation' },
    { text: 'MCP 服务', link: '/guide/mcp-usage' }, // 新增此行(可选)
    { text: 'API 文档', link: '/api/stock/basic' },
    { text: '更新日志', link: '/changelog/' },
    { text: 'GitHub', link: 'https://github.com/your-org/tushare-sdk' },
  ],
}
```

**建议**: 暂不修改顶部导航栏,保持简洁。用户可以通过侧边栏访问 MCP 使用指南。如果后续 MCP 服务成为核心功能,再考虑添加到顶部导航。

## 注意事项

1. **链接格式**: 使用 `/guide/mcp-usage` 而不是 `/guide/mcp-usage.md`,rspress 会自动处理 `.md` 扩展名
2. **文本内容**: "MCP 使用指南" 应与文档页面的标题一致
3. **顺序位置**: 放在"错误处理"之后,因为 MCP 是进阶功能
4. **TypeScript 语法**: 确保对象末尾的逗号正确(JavaScript/TypeScript 允许尾随逗号)

## 回滚方案

如果需要回滚修改:

```bash
git checkout apps/docs/rspress.config.ts
```

或手动删除新增的这一行:

```typescript
{ text: 'MCP 使用指南', link: '/guide/mcp-usage' }, // 删除此行
```

## 验收标准

- [ ] rspress.config.ts 文件修改正确,无语法错误
- [ ] TypeScript 类型检查通过 (`pnpm type-check`)
- [ ] 文档站点构建成功 (`pnpm build`)
- [ ] 本地预览时侧边栏显示新链接
- [ ] 点击链接可正常跳转到 MCP 使用指南页面
- [ ] 页面在不同浏览器和设备上正常显示
