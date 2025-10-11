# E2E 测试选择器修复指南

**日期**: 2025-10-11  
**问题**: E2E 测试失败,测试选择器与 rspress 实际 DOM 结构不匹配  
**状态**: 需要修复

## 问题诊断

### 失败原因

E2E 测试使用了假设的 data 属性选择器,但 rspress 的实际 DOM 结构不同:

```typescript
// 测试中使用的选择器 (不存在)
await page.click('[data-search-button]');
await page.fill('[data-search-input]', 'get_stock_basic');
await page.locator('[data-search-result]');
```

rspress 使用自己的内置搜索组件,DOM 结构由框架控制,不包含这些 data 属性。

### 影响范围

以下测试文件需要更新:
- `tests/e2e/search.spec.ts` - 搜索功能测试
- `tests/e2e/code-copy.spec.ts` - 代码复制测试
- `tests/e2e/navigation.spec.ts` - 导航功能测试
- `tests/e2e/quick-start.spec.ts` - 快速入门测试
- `tests/e2e/changelog.spec.ts` - 更新日志测试
- `tests/e2e/responsive.spec.ts` - 响应式设计测试

## 解决方案

### 步骤 1: 检查 rspress 实际 DOM 结构

启动开发服务器并检查实际的 DOM:

```bash
cd apps/docs
pnpm dev
```

访问 http://localhost:3000,打开浏览器开发者工具,检查:
1. 搜索按钮的实际选择器
2. 搜索输入框的实际选择器
3. 搜索结果列表的实际选择器
4. 代码复制按钮的实际选择器
5. 侧边栏导航的实际选择器

### 步骤 2: 使用 Playwright Inspector

使用 Playwright Inspector 交互式地查找正确的选择器:

```bash
pnpm exec playwright codegen http://localhost:3000
```

这将打开一个浏览器窗口,你可以:
1. 点击页面元素
2. Playwright 会自动生成对应的选择器
3. 复制生成的选择器到测试文件

### 步骤 3: 更新测试选择器

根据实际 DOM 结构,更新测试文件中的选择器。

#### 常见 rspress 选择器模式

rspress 通常使用以下选择器模式:

```typescript
// 搜索功能 (示例,需要根据实际 DOM 调整)
const searchButton = page.locator('button[aria-label="Search"]');
const searchInput = page.locator('input[type="search"]');
const searchResults = page.locator('.search-result-item');

// 导航
const sidebar = page.locator('aside.sidebar');
const navItem = page.locator('nav a[href="/api/stock/basic"]');

// 代码块
const codeBlock = page.locator('pre code');
const copyButton = page.locator('button[title="Copy code"]');
```

### 步骤 4: 使用更健壮的选择器策略

推荐使用以下策略:

1. **优先使用语义化选择器**:
   ```typescript
   page.getByRole('button', { name: 'Search' })
   page.getByRole('searchbox')
   page.getByRole('link', { name: 'API 文档' })
   ```

2. **使用文本内容**:
   ```typescript
   page.getByText('get_stock_basic')
   page.getByText('获取股票基础信息')
   ```

3. **使用 CSS 选择器作为后备**:
   ```typescript
   page.locator('button.search-btn')
   page.locator('input[placeholder*="搜索"]')
   ```

### 步骤 5: 测试示例修复

#### 修复前 (search.spec.ts)

```typescript
test('应该能够搜索 API 并显示结果列表', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-search-button]'); // ❌ 不存在
  await page.fill('[data-search-input]', 'get_stock_basic'); // ❌ 不存在
  const results = page.locator('[data-search-result]'); // ❌ 不存在
  await expect(results.first()).toBeVisible();
});
```

#### 修复后 (示例,需根据实际 DOM 调整)

```typescript
test('应该能够搜索 API 并显示结果列表', async ({ page }) => {
  await page.goto('/');
  
  // 方案 1: 使用语义化选择器
  const searchButton = page.getByRole('button', { name: /search/i });
  await searchButton.click();
  
  // 方案 2: 使用 CSS 选择器
  // const searchButton = page.locator('button[aria-label="Search"]');
  // await searchButton.click();
  
  const searchInput = page.getByRole('searchbox');
  await searchInput.fill('get_stock_basic');
  
  // 等待搜索结果出现
  const results = page.locator('.search-result-item'); // 根据实际类名调整
  await expect(results.first()).toBeVisible({ timeout: 5000 });
  await expect(results.first()).toContainText('get_stock_basic');
});
```

## 测试策略调整

### 选项 1: 修复现有测试 (推荐)

检查 rspress 实际 DOM,更新所有测试选择器以匹配实际结构。

**优点**: 保留完整的测试覆盖
**缺点**: 需要时间调查和更新

### 选项 2: 简化测试

只测试核心功能,不依赖特定的 DOM 结构:

```typescript
test('文档站应该可访问', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Tushare SDK/);
});

test('API 文档页面应该包含完整内容', async ({ page }) => {
  await page.goto('/api/stock/basic');
  const content = await page.textContent('body');
  expect(content).toContain('get_stock_basic');
  expect(content).toContain('函数签名');
  expect(content).toContain('参数');
  expect(content).toContain('返回值');
});
```

**优点**: 快速修复,不依赖 DOM 结构
**缺点**: 测试覆盖度降低

### 选项 3: 混合策略

- 核心页面内容测试: 使用简化策略
- 交互功能测试: 修复选择器

## 执行步骤

1. **启动开发服务器**:
   ```bash
   cd apps/docs
   pnpm dev
   ```

2. **使用 Playwright Inspector 检查 DOM**:
   ```bash
   pnpm exec playwright codegen http://localhost:3000
   ```

3. **逐个修复测试文件**:
   - 从 `search.spec.ts` 开始
   - 使用 Playwright Inspector 找到正确的选择器
   - 更新测试代码
   - 运行测试验证: `pnpm exec playwright test search.spec.ts`

4. **重复步骤 3** 直到所有测试文件修复完成

5. **运行完整测试套件**:
   ```bash
   pnpm test:e2e
   ```

## 验证清单

修复完成后,确保:
- [ ] 所有测试文件使用正确的选择器
- [ ] 测试在 Chrome 和 Mobile Chrome 上都通过
- [ ] 测试覆盖所有核心用户场景
- [ ] 测试代码清晰易读,有适当的注释
- [ ] 更新 `tasks.md`,标记 T086 为完成

## 参考资源

- [Playwright 选择器文档](https://playwright.dev/docs/selectors)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [rspress 文档](https://rspress.dev)
- [Playwright Inspector](https://playwright.dev/docs/debug#playwright-inspector)

## 下一步

修复 E2E 测试后:
1. 运行性能测试 (T088)
2. 执行快速入门验证 (T091)
3. 更新 `IMPLEMENTATION_COMPLETE.md`
4. 部署到生产环境
