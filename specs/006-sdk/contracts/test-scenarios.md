# 测试场景契约

**Feature**: SDK文档站  
**Date**: 2025-10-11  
**Status**: Complete

## 概述

本文档定义文档站的测试场景和验收标准,基于 spec.md 中的用户故事。

## E2E 测试场景

### 1. 搜索功能测试 (User Story 1 - P1)

**测试文件**: `tests/e2e/search.spec.ts`

#### 场景 1.1: 搜索 API 并查看结果

```typescript
test('应该能够搜索 API 并显示结果列表', async ({ page }) => {
  // Given: 访问文档站首页
  await page.goto('/');
  
  // When: 在搜索框输入 API 名称
  await page.fill('[data-testid="search-input"]', 'get_stock_basic');
  
  // Then: 显示相关搜索结果
  const results = page.locator('[data-testid="search-result"]');
  await expect(results).toBeVisible();
  await expect(results).toContainText('get_stock_basic');
});
```

#### 场景 1.2: 点击搜索结果跳转到详情页

```typescript
test('应该能够点击搜索结果跳转到 API 详情页', async ({ page }) => {
  // Given: 已显示搜索结果
  await page.goto('/');
  await page.fill('[data-testid="search-input"]', 'get_stock_basic');
  await page.waitForSelector('[data-testid="search-result"]');
  
  // When: 点击第一个搜索结果
  await page.click('[data-testid="search-result"]:first-child');
  
  // Then: 跳转到 API 详情页
  await expect(page).toHaveURL(/\/api\/stock\/basic/);
  await expect(page.locator('h1')).toContainText('get_stock_basic');
});
```

#### 场景 1.3: API 详情页显示完整信息

```typescript
test('API 详情页应该显示完整的 API 信息', async ({ page }) => {
  // Given: 访问 API 详情页
  await page.goto('/api/stock/basic');
  
  // When: 查看页面内容
  // Then: 页面包含所有必要信息
  await expect(page.locator('h1')).toBeVisible(); // API 名称
  await expect(page.locator('[data-testid="api-description"]')).toBeVisible(); // 功能描述
  await expect(page.locator('[data-testid="api-parameters"]')).toBeVisible(); // 参数说明
  await expect(page.locator('[data-testid="api-returns"]')).toBeVisible(); // 返回值说明
  await expect(page.locator('[data-testid="code-example"]')).toBeVisible(); // 代码示例
});
```

#### 场景 1.4: 代码示例复制功能

```typescript
test('应该能够复制代码示例到剪贴板', async ({ page, context }) => {
  // Given: 访问包含代码示例的 API 详情页
  await page.goto('/api/stock/basic');
  
  // 授予剪贴板权限
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  
  // When: 点击复制按钮
  await page.click('[data-testid="code-copy-btn"]:first-child');
  
  // Then: 代码被复制到剪贴板
  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboardText).toContain('getStockBasic');
  
  // And: 显示复制成功提示
  await expect(page.locator('[data-testid="copy-success"]')).toBeVisible();
  await expect(page.locator('[data-testid="copy-success"]')).toContainText('已复制');
});
```

#### 场景 1.5: 搜索无结果提示

```typescript
test('搜索无结果时应该显示友好提示', async ({ page }) => {
  // Given: 访问文档站首页
  await page.goto('/');
  
  // When: 搜索不存在的 API
  await page.fill('[data-testid="search-input"]', 'nonexistent_api_xyz');
  await page.waitForTimeout(500); // 等待搜索完成
  
  // Then: 显示无结果提示
  await expect(page.locator('[data-testid="search-no-results"]')).toBeVisible();
  await expect(page.locator('[data-testid="search-no-results"]')).toContainText('未找到相关 API');
});
```

---

### 2. 导航功能测试 (User Story 2 - P2)

**测试文件**: `tests/e2e/navigation.spec.ts`

#### 场景 2.1: 侧边栏显示分类目录

```typescript
test('侧边栏应该显示按功能分类的 API 目录树', async ({ page }) => {
  // Given: 访问文档站
  await page.goto('/api/stock/basic');
  
  // When: 查看侧边栏
  // Then: 显示分类目录
  const sidebar = page.locator('[data-testid="sidebar"]');
  await expect(sidebar).toBeVisible();
  await expect(sidebar).toContainText('股票数据');
  await expect(sidebar).toContainText('基金数据');
  await expect(sidebar).toContainText('财务数据');
});
```

#### 场景 2.2: 点击分类展开/收起

```typescript
test('应该能够点击分类节点展开或收起', async ({ page }) => {
  // Given: 访问文档站
  await page.goto('/api/stock/basic');
  
  // When: 点击分类节点
  const categoryToggle = page.locator('[data-testid="category-toggle-stock"]');
  await categoryToggle.click();
  
  // Then: 分类收起,子项隐藏
  await expect(page.locator('[data-testid="api-link-basic"]')).not.toBeVisible();
  
  // When: 再次点击
  await categoryToggle.click();
  
  // Then: 分类展开,子项显示
  await expect(page.locator('[data-testid="api-link-basic"]')).toBeVisible();
});
```

#### 场景 2.3: 点击 API 链接跳转

```typescript
test('应该能够点击 API 链接跳转到详情页', async ({ page }) => {
  // Given: 访问文档站
  await page.goto('/api/stock/basic');
  
  // When: 点击侧边栏中的另一个 API 链接
  await page.click('[data-testid="api-link-daily"]');
  
  // Then: 跳转到对应的 API 详情页
  await expect(page).toHaveURL(/\/api\/stock\/daily/);
  await expect(page.locator('h1')).toContainText('get_stock_daily');
});
```

#### 场景 2.4: 面包屑导航显示

```typescript
test('页面应该显示面包屑导航', async ({ page }) => {
  // Given: 访问 API 详情页
  await page.goto('/api/stock/basic');
  
  // When: 查看页面
  // Then: 显示面包屑导航
  const breadcrumb = page.locator('[data-testid="breadcrumb"]');
  await expect(breadcrumb).toBeVisible();
  await expect(breadcrumb).toContainText('首页');
  await expect(breadcrumb).toContainText('API 文档');
  await expect(breadcrumb).toContainText('股票数据');
  await expect(breadcrumb).toContainText('基础信息');
});
```

---

### 3. 快速入门指南测试 (User Story 3 - P3)

**测试文件**: `tests/e2e/quick-start.spec.ts`

#### 场景 3.1: 访问快速入门页面

```typescript
test('应该能够访问快速入门指南页面', async ({ page }) => {
  // Given: 访问文档站首页
  await page.goto('/');
  
  // When: 点击"快速入门"链接
  await page.click('[data-testid="nav-link-guide"]');
  
  // Then: 跳转到快速入门页面
  await expect(page).toHaveURL(/\/guide\/quick-start/);
  await expect(page.locator('h1')).toContainText('快速开始');
});
```

#### 场景 3.2: 快速入门页面包含完整内容

```typescript
test('快速入门页面应该包含安装、配置和示例代码', async ({ page }) => {
  // Given: 访问快速入门页面
  await page.goto('/guide/quick-start');
  
  // When: 查看页面内容
  // Then: 包含所有必要部分
  await expect(page.locator('[data-testid="installation-section"]')).toBeVisible();
  await expect(page.locator('[data-testid="configuration-section"]')).toBeVisible();
  await expect(page.locator('[data-testid="example-section"]')).toBeVisible();
  
  // And: 包含可运行的示例代码
  const codeBlock = page.locator('[data-testid="code-example"]');
  await expect(codeBlock).toBeVisible();
  await expect(codeBlock).toContainText('import');
});
```

#### 场景 3.3: 引导到 API 文档

```typescript
test('快速入门完成后应该引导用户查看 API 文档', async ({ page }) => {
  // Given: 访问快速入门页面
  await page.goto('/guide/quick-start');
  
  // When: 滚动到页面底部
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  
  // Then: 显示"下一步"链接
  const nextStepLink = page.locator('[data-testid="next-step-link"]');
  await expect(nextStepLink).toBeVisible();
  
  // When: 点击链接
  await nextStepLink.click();
  
  // Then: 跳转到 API 文档
  await expect(page).toHaveURL(/\/api\//);
});
```

---

### 4. 版本更新日志测试 (User Story 4 - P4)

**测试文件**: `tests/e2e/changelog.spec.ts`

#### 场景 4.1: 访问更新日志页面

```typescript
test('应该能够访问版本更新日志页面', async ({ page }) => {
  // Given: 访问文档站
  await page.goto('/');
  
  // When: 点击"更新日志"链接
  await page.click('[data-testid="nav-link-changelog"]');
  
  // Then: 跳转到更新日志页面
  await expect(page).toHaveURL(/\/changelog/);
  await expect(page.locator('h1')).toContainText('更新日志');
});
```

#### 场景 4.2: 更新日志按版本倒序显示

```typescript
test('更新日志应该按版本号倒序显示', async ({ page }) => {
  // Given: 访问更新日志页面
  await page.goto('/changelog');
  
  // When: 查看页面内容
  const versions = await page.locator('[data-testid="version-entry"]').allTextContents();
  
  // Then: 版本号倒序排列
  expect(versions[0]).toContain('v1.2.0');
  expect(versions[1]).toContain('v1.1.0');
  expect(versions[2]).toContain('v1.0.0');
});
```

#### 场景 4.3: 更新内容包含分类说明

```typescript
test('每个版本的更新内容应该包含分类说明', async ({ page }) => {
  // Given: 访问更新日志页面
  await page.goto('/changelog');
  
  // When: 查看第一个版本的更新内容
  const latestVersion = page.locator('[data-testid="version-entry"]:first-child');
  
  // Then: 包含各类更新说明
  await expect(latestVersion.locator('[data-testid="features"]')).toBeVisible();
  await expect(latestVersion.locator('[data-testid="fixes"]')).toBeVisible();
  await expect(latestVersion.locator('[data-testid="breaking"]')).toBeVisible();
});
```

#### 场景 4.4: 破坏性变更包含迁移指南

```typescript
test('破坏性变更应该包含迁移指南', async ({ page }) => {
  // Given: 访问包含破坏性变更的版本
  await page.goto('/changelog');
  
  // When: 查看破坏性变更部分
  const breakingChanges = page.locator('[data-testid="breaking"]');
  
  // Then: 包含迁移指南
  await expect(breakingChanges).toContainText('迁移指南');
  await expect(breakingChanges.locator('[data-testid="migration-guide"]')).toBeVisible();
});
```

---

### 5. 响应式设计测试

**测试文件**: `tests/e2e/responsive.spec.ts`

#### 场景 5.1: 移动端侧边栏折叠

```typescript
test('移动端侧边栏应该默认折叠', async ({ page }) => {
  // Given: 设置移动端视口
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/api/stock/basic');
  
  // When: 查看侧边栏
  const sidebar = page.locator('[data-testid="sidebar"]');
  
  // Then: 侧边栏默认隐藏
  await expect(sidebar).not.toBeVisible();
  
  // When: 点击菜单按钮
  await page.click('[data-testid="menu-toggle"]');
  
  // Then: 侧边栏展开
  await expect(sidebar).toBeVisible();
});
```

#### 场景 5.2: 移动端代码块横向滚动

```typescript
test('移动端代码块应该支持横向滚动', async ({ page }) => {
  // Given: 设置移动端视口
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/api/stock/basic');
  
  // When: 查看代码块
  const codeBlock = page.locator('[data-testid="code-example"]');
  
  // Then: 代码块可以横向滚动
  const scrollWidth = await codeBlock.evaluate(el => el.scrollWidth);
  const clientWidth = await codeBlock.evaluate(el => el.clientWidth);
  expect(scrollWidth).toBeGreaterThan(clientWidth);
});
```

---

## 单元测试场景

### 1. CodeCopy 组件测试

**测试文件**: `tests/unit/components/CodeCopy.test.tsx`

```typescript
describe('CodeCopy 组件', () => {
  test('应该渲染复制按钮', () => {
    const { getByRole } = render(<CodeCopy code="const x = 1;" />);
    expect(getByRole('button')).toHaveTextContent('复制代码');
  });

  test('点击按钮应该复制代码到剪贴板', async () => {
    const mockClipboard = vi.fn();
    Object.assign(navigator, {
      clipboard: { writeText: mockClipboard },
    });

    const { getByRole } = render(<CodeCopy code="const x = 1;" />);
    await userEvent.click(getByRole('button'));

    expect(mockClipboard).toHaveBeenCalledWith('const x = 1;');
  });

  test('复制成功后应该显示成功提示', async () => {
    const { getByRole } = render(<CodeCopy code="const x = 1;" />);
    await userEvent.click(getByRole('button'));

    expect(getByRole('button')).toHaveTextContent('✓ 已复制');
  });

  test('2秒后应该恢复默认文本', async () => {
    vi.useFakeTimers();
    const { getByRole } = render(<CodeCopy code="const x = 1;" />);
    
    await userEvent.click(getByRole('button'));
    expect(getByRole('button')).toHaveTextContent('✓ 已复制');

    vi.advanceTimersByTime(2000);
    expect(getByRole('button')).toHaveTextContent('复制代码');
    
    vi.useRealTimers();
  });

  test('复制失败应该调用 onCopyError 回调', async () => {
    const onCopyError = vi.fn();
    const mockError = new Error('Clipboard error');
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockRejectedValue(mockError) },
    });

    const { getByRole } = render(
      <CodeCopy code="const x = 1;" onCopyError={onCopyError} />
    );
    await userEvent.click(getByRole('button'));

    expect(onCopyError).toHaveBeenCalledWith(mockError);
  });
});
```

---

### 2. ApiCard 组件测试

**测试文件**: `tests/unit/components/ApiCard.test.tsx`

```typescript
describe('ApiCard 组件', () => {
  test('应该渲染 API 名称和描述', () => {
    const { getByText } = render(
      <ApiCard
        name="get_stock_basic"
        description="获取股票基础信息"
        link="/api/stock/basic"
      />
    );

    expect(getByText('get_stock_basic')).toBeInTheDocument();
    expect(getByText('获取股票基础信息')).toBeInTheDocument();
  });

  test('应该渲染标签', () => {
    const { getByText } = render(
      <ApiCard
        name="get_stock_basic"
        description="获取股票基础信息"
        link="/api/stock/basic"
        tags={['股票', '基础数据']}
      />
    );

    expect(getByText('股票')).toBeInTheDocument();
    expect(getByText('基础数据')).toBeInTheDocument();
  });

  test('新增 API 应该显示"新"标签', () => {
    const { getByText } = render(
      <ApiCard
        name="get_stock_basic"
        description="获取股票基础信息"
        link="/api/stock/basic"
        isNew={true}
      />
    );

    expect(getByText('新')).toBeInTheDocument();
  });

  test('废弃 API 应该显示废弃提示', () => {
    const { getByText } = render(
      <ApiCard
        name="get_stock_basic"
        description="获取股票基础信息"
        link="/api/stock/basic"
        deprecated={true}
        deprecationMessage="请使用 get_stock_info 代替"
      />
    );

    expect(getByText(/已废弃/)).toBeInTheDocument();
    expect(getByText(/请使用 get_stock_info 代替/)).toBeInTheDocument();
  });
});
```

---

## 性能测试场景

### 1. 页面加载性能

**测试文件**: `tests/performance/page-load.spec.ts`

```typescript
test('首页加载时间应该小于 2 秒', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;

  expect(loadTime).toBeLessThan(2000);
});

test('API 详情页加载时间应该小于 2 秒', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/api/stock/basic');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;

  expect(loadTime).toBeLessThan(2000);
});
```

---

### 2. 搜索性能

**测试文件**: `tests/performance/search.spec.ts`

```typescript
test('搜索响应时间应该小于 500ms', async ({ page }) => {
  await page.goto('/');

  const startTime = Date.now();
  await page.fill('[data-testid="search-input"]', 'get_stock_basic');
  await page.waitForSelector('[data-testid="search-result"]');
  const searchTime = Date.now() - startTime;

  expect(searchTime).toBeLessThan(500);
});
```

---

## 验收标准总结

### 功能验收

- ✅ **FR-001**: 全文搜索功能正常,支持按 API 名称和描述搜索
- ✅ **FR-002**: 分类导航正常,树形结构清晰
- ✅ **FR-003**: API 详情页包含完整信息
- ✅ **FR-004**: 代码复制功能正常
- ✅ **FR-005**: 快速入门指南完整
- ✅ **FR-006**: 版本更新日志按版本倒序显示
- ✅ **FR-007**: 响应式布局在移动端正常工作
- ✅ **FR-008**: 面包屑导航显示正确
- ✅ **FR-009**: 长文档有页面内锚点导航

### 性能验收

- ✅ **SC-001**: 10 秒内找到目标 API
- ✅ **SC-002**: 页面加载时间 < 2s
- ✅ **SC-005**: 支持 100 个并发用户
- ✅ **SC-006**: 代码复制成功率 99%
- ✅ **SC-007**: 移动端体验良好
- ✅ **SC-008**: 搜索响应时间 < 500ms

### 测试覆盖率目标

- E2E 测试: 覆盖所有 P1-P4 用户故事
- 单元测试: 自定义组件覆盖率 ≥ 80%
- 性能测试: 覆盖关键性能指标
