# Quick Start: E2E 测试开发指南

**Feature**: 008-e2e-e2e
**Date**: 2025-10-13
**Purpose**: 为开发者提供快速上手E2E测试开发的指南

---

## 前置条件

在开始之前,确保已安装以下工具:

- ✅ Node.js 18+ LTS
- ✅ pnpm 包管理器
- ✅ TypeScript 5.6+
- ✅ 项目依赖已安装 (`pnpm install`)

---

## 目录结构

```
apps/docs/
├── tests/
│   └── e2e/
│       ├── pages/              # Page Object 封装
│       │   ├── base-page.ts
│       │   ├── home-page.ts
│       │   ├── guide-page.ts
│       │   └── api-page.ts
│       ├── core-pages.spec.ts  # 核心页面测试
│       ├── navigation.spec.ts  # 导航功能测试
│       ├── code-examples.spec.ts # 代码示例测试
│       ├── changelog.spec.ts   # 更新日志测试
│       └── responsive.spec.ts  # 响应式测试
├── playwright.config.ts        # Playwright 配置
└── package.json
```

---

## 第一步: 运行现有测试

### 1. 启动文档站开发服务器

```bash
cd apps/docs
pnpm dev
```

等待服务器启动完成,默认运行在 `http://localhost:3000`

### 2. 运行所有测试

在另一个终端窗口:

```bash
cd apps/docs
pnpm test:e2e
```

### 3. 运行特定测试文件

```bash
# 只运行导航测试
pnpm test:e2e navigation.spec.ts

# 只运行响应式测试
pnpm test:e2e responsive.spec.ts
```

### 4. 使用 UI 模式运行测试

```bash
pnpm test:e2e:ui
```

UI 模式提供可视化界面,方便调试和查看测试执行过程。

---

## 第二步: 编写你的第一个测试

### 1. 创建测试文件

创建 `tests/e2e/my-first-test.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('我的第一个测试套件', () => {
  test('验证首页标题', async ({ page }) => {
    // 导航到首页
    await page.goto('/');

    // 获取 h1 标题
    const heading = await page.locator('h1').first().textContent();

    // 断言标题包含 "Tushare SDK"
    expect(heading).toContain('Tushare SDK');
  });
});
```

### 2. 运行新测试

```bash
pnpm test:e2e my-first-test.spec.ts
```

### 3. 查看测试报告

测试完成后,会生成 HTML 报告:

```bash
npx playwright show-report
```

---

## 第三步: 使用 Page Object 模式

### 1. 创建页面对象

创建 `tests/e2e/pages/my-page.ts`:

```typescript
import { Page } from '@playwright/test';
import { BasePage } from './base-page';

export class MyPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * 导航到我的页面
   */
  async goto() {
    await super.goto('/my-page');
  }

  /**
   * 获取页面标题
   */
  async getPageTitle(): Promise<string | null> {
    return this.page.locator('h1').first().textContent();
  }

  /**
   * 点击特定按钮
   */
  async clickButton(buttonText: string) {
    await this.page.click(`button:has-text("${buttonText}")`);
  }
}
```

### 2. 在测试中使用页面对象

```typescript
import { test, expect } from '@playwright/test';
import { MyPage } from './pages/my-page';

test.describe('使用 Page Object', () => {
  test('验证页面标题', async ({ page }) => {
    const myPage = new MyPage(page);

    // 使用页面对象方法
    await myPage.goto();
    const title = await myPage.getPageTitle();

    expect(title).toBe('预期标题');
  });
});
```

---

## 第四步: 常用测试模式

### 1. 验证页面导航

```typescript
test('验证导航到指南页', async ({ page }) => {
  await page.goto('/');

  // 点击导航链接
  await page.click('nav a:has-text("指南")');

  // 验证 URL 变化
  await expect(page).toHaveURL(/\/guide\//);

  // 验证页面标题
  const heading = await page.locator('h1').first().textContent();
  expect(heading).toBeTruthy();
});
```

### 2. 验证侧边栏链接

```typescript
test('验证侧边栏导航', async ({ page }) => {
  await page.goto('/api/stock/basic');

  // 点击侧边栏链接
  await page.click('aside.rspress-sidebar a:has-text("日线数据")');

  // 验证跳转
  await expect(page).toHaveURL('/api/stock/daily');
});
```

### 3. 验证代码块复制功能

```typescript
test('验证代码复制功能', async ({ page, context }) => {
  // 授予剪贴板权限
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  await page.goto('/guide/quick-start');

  // 悬停在代码块上显示复制按钮
  await page.hover('pre code');

  // 点击复制按钮
  await page.click('button[aria-label*="复制"]');

  // 读取剪贴板内容
  const clipboardText = await page.evaluate(() => {
    return navigator.clipboard.readText();
  });

  // 验证复制内容
  expect(clipboardText.length).toBeGreaterThan(0);
  expect(clipboardText).toContain('import');
});
```

### 4. 验证响应式设计

```typescript
test('验证移动端布局', async ({ page }) => {
  // 设置移动端视口
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto('/api/stock/basic');

  // 验证侧边栏默认隐藏
  const sidebar = page.locator('aside.rspress-sidebar');
  await expect(sidebar).not.toBeVisible();

  // 点击菜单按钮
  await page.click('button[aria-label="Toggle menu"]');

  // 验证侧边栏展开
  await expect(sidebar).toBeVisible();
});
```

---

## 第五步: 调试测试

### 1. 使用 Playwright Inspector

```bash
PWDEBUG=1 pnpm test:e2e navigation.spec.ts
```

Playwright Inspector 会打开,可以:
- 单步执行测试
- 查看页面状态
- 检查选择器
- 查看控制台输出

### 2. 使用 `page.pause()`

在测试中添加断点:

```typescript
test('调试测试', async ({ page }) => {
  await page.goto('/');

  // 暂停测试,打开 Playwright Inspector
  await page.pause();

  await page.click('nav a:has-text("指南")');
});
```

### 3. 查看截图和视频

测试失败时,会自动生成截图和视频:

```
test-results/
├── navigation-验证导航到指南页-chromium/
│   ├── test-failed-1.png
│   └── video.webm
```

### 4. 查看 Trace

```bash
npx playwright show-trace test-results/path-to-trace.zip
```

Trace 包含完整的测试执行过程,包括:
- 网络请求
- DOM 快照
- 控制台日志
- 截图

---

## 第六步: 测试最佳实践

### 1. 使用语义化选择器

✅ **推荐**:
```typescript
await page.click('nav a[href="/guide/"]');
await page.locator('article.rspress-doc-content h1');
```

❌ **不推荐**:
```typescript
await page.click('div > div > a:nth-child(2)'); // 脆弱的 CSS 路径
await page.locator('#root > div > div > h1'); // 容易失效
```

### 2. 使用自动等待

Playwright 会自动等待元素可见、可点击,无需手动 `waitFor`:

✅ **推荐**:
```typescript
await page.click('button:has-text("提交")');
```

❌ **不推荐**:
```typescript
await page.waitForTimeout(1000); // 硬编码等待时间
await page.click('button:has-text("提交")');
```

### 3. 测试独立性

每个测试应该独立运行,不依赖其他测试:

✅ **推荐**:
```typescript
test('测试A', async ({ page }) => {
  await page.goto('/page-a');
  // 测试逻辑...
});

test('测试B', async ({ page }) => {
  await page.goto('/page-b'); // 独立导航
  // 测试逻辑...
});
```

❌ **不推荐**:
```typescript
test.describe.serial('依赖测试', () => {
  test('测试A', async ({ page }) => {
    await page.goto('/page-a');
    // 修改状态...
  });

  test('测试B', async ({ page }) => {
    // 依赖测试A的状态 ❌
  });
});
```

### 4. 清晰的测试命名

使用 Given-When-Then 模式:

```typescript
test('Given 用户在首页, When 点击指南链接, Then 跳转到指南页', async ({ page }) => {
  // Given
  await page.goto('/');

  // When
  await page.click('nav a:has-text("指南")');

  // Then
  await expect(page).toHaveURL(/\/guide\//);
});
```

---

## 常用命令

```bash
# 运行所有测试
pnpm test:e2e

# 运行特定文件
pnpm test:e2e navigation.spec.ts

# 使用 UI 模式
pnpm test:e2e:ui

# 调试模式
PWDEBUG=1 pnpm test:e2e

# 查看测试报告
npx playwright show-report

# 查看 Trace
npx playwright show-trace test-results/path-to-trace.zip

# 更新 Playwright 浏览器
npx playwright install

# 生成代码
npx playwright codegen http://localhost:3000
```

---

## 配置说明

### playwright.config.ts

```typescript
export default defineConfig({
  // 测试文件目录
  testDir: './tests/e2e',

  // 基础 URL
  use: {
    baseURL: 'http://localhost:3000',
  },

  // 测试项目
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } }
  ],

  // 开发服务器
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  }
});
```

---

## 故障排查

### 问题: 测试超时

**解决方案**:
1. 增加超时时间:
```typescript
test('慢速测试', async ({ page }) => {
  test.setTimeout(60000); // 60秒
  // ...
});
```

2. 检查网络请求是否被阻塞

### 问题: 选择器找不到元素

**解决方案**:
1. 使用 Playwright Inspector 检查选择器:
```bash
PWDEBUG=1 pnpm test:e2e
```

2. 使用更宽松的选择器:
```typescript
// 从
await page.click('.exact-class-name');

// 改为
await page.click('button:has-text("按钮文本")');
```

### 问题: 剪贴板权限被拒绝

**解决方案**:
确保在配置和测试中授予权限:

```typescript
// playwright.config.ts
use: {
  permissions: ['clipboard-read', 'clipboard-write']
}

// 测试中
await context.grantPermissions(['clipboard-read', 'clipboard-write']);
```

---

## 下一步

- ✅ 完成 quickstart.md (当前文档)
- ⏭️ 查看 [data-model.md](./data-model.md) 了解数据模型
- ⏭️ 查看 [research.md](./research.md) 了解技术决策
- ⏭️ 查看 [contracts/](./contracts/) 了解接口契约
- ⏭️ 开始实施测试重构 (使用 `/speckit.tasks` 生成任务清单)

---

## 参考资料

- [Playwright 官方文档](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [rspress 文档](https://rspress.dev/)
- [项目宪法](../../.specify/memory/constitution.md)
