# Research: 文档站E2E测试重构

**Feature**: 008-e2e-e2e
**Date**: 2025-10-13
**Purpose**: 解决 Technical Context 中的未知项,为实施计划提供技术决策依据

---

## 研究项 1: Playwright Page Object 模式最佳实践

### 决策: 使用分层 Page Object 模式

**选择理由**:
- 通过基类 `BasePage` 封装通用功能(导航、等待、断言)
- 每个页面类型(首页、指南页、API页)继承基类并扩展特定功能
- 页面选择器集中定义为类属性,便于维护和更新
- 方法名使用业务语义(如 `navigateToGuide()` 而非 `clickLink()`)

**实施方案**:
```typescript
// base-page.ts - 基础页面类
export class BasePage {
  constructor(protected page: Page) {}

  async goto(path: string) {
    await this.page.goto(path);
  }

  async getTitle() {
    return this.page.locator('h1').first().textContent();
  }
}

// guide-page.ts - 指南页类
export class GuidePage extends BasePage {
  private selectors = {
    sidebar: '.rspress-sidebar',
    codeBlock: 'pre code',
    copyButton: 'button[aria-label*="复制"]'
  };

  async clickSidebarLink(linkText: string) {
    await this.page.click(`${this.selectors.sidebar} a:has-text("${linkText}")`);
  }
}
```

**替代方案考虑**:
- **平面 Page Object**: 每个页面独立类,无继承 → 拒绝原因: 代码重复,通用功能难以复用
- **函数式辅助工具**: 使用独立函数而非类 → 拒绝原因: 缺少状态管理,不适合复杂页面交互

**参考资料**:
- Playwright 官方文档: Page Object Models
- 最佳实践: 使用 `locator()` 而非 `$()`,利用自动等待机制

---

## 研究项 2: rspress 生成的 DOM 结构和选择器策略

### 决策: 使用语义化选择器 + 备用 data-testid

**选择理由**:
- rspress 使用标准 HTML5 语义化标签(nav, aside, article, footer)
- CSS 类名使用 BEM 规范,前缀 `.rspress-`
- 优先使用语义化选择器(如 `nav a[href="/guide/"]`)
- 对于动态内容,使用 text 匹配或 aria-label
- 必要时添加 data-testid 属性到文档内容

**rspress DOM 结构分析**:
```
<body>
  <div id="root">
    <nav class="rspress-nav">       <!-- 顶部导航栏 -->
      <div class="rspress-nav-menu">
        <a href="/guide/">指南</a>
        <a href="/api/">API 文档</a>
      </div>
    </nav>

    <div class="rspress-doc-layout">
      <aside class="rspress-sidebar">  <!-- 侧边栏 -->
        <div class="rspress-sidebar-group">
          <h3>快速入门</h3>
          <a href="/guide/installation">安装</a>
        </div>
      </aside>

      <article class="rspress-doc-content"> <!-- 主内容区 -->
        <h1>页面标题</h1>
        <pre><code>代码块</code></pre>
      </article>
    </div>

    <footer class="rspress-footer">  <!-- 页脚 -->
      ...
    </footer>
  </div>
</body>
```

**选择器优先级**:
1. **语义化 + 属性**: `nav a[href="/guide/"]` (最优)
2. **角色 + 名称**: `role=navigation >> text=指南` (推荐)
3. **CSS 类名**: `.rspress-sidebar a:has-text("快速开始")` (可接受)
4. **data-testid**: `[data-testid="guide-link"]` (备用方案)

**替代方案考虑**:
- **纯 CSS 选择器**: 使用完整 CSS 路径 → 拒绝原因: 脆弱,DOM 结构变化易失效
- **XPath**: 使用 XPath 表达式 → 拒绝原因: 可读性差,维护困难

**验证方法**:
- 在文档站实际运行后,使用 Playwright Inspector 检查元素
- 编写初步测试验证选择器的稳定性

---

## 研究项 3: 响应式测试的视口配置最佳实践

### 决策: 使用 Playwright 设备模拟 + 自定义视口

**选择理由**:
- 使用 `devices['Pixel 5']` 模拟真实移动设备(390x844)
- 使用 `devices['Desktop Chrome']` 作为桌面基准(1280x720)
- 对特殊场景(小屏手机、平板)使用自定义视口

**视口配置矩阵**:
| 场景 | 宽度 x 高度 | 设备模拟 | 测试重点 |
|------|-------------|----------|----------|
| 桌面浏览器 | 1280x720 | Desktop Chrome | 完整布局、侧边栏可见 |
| 标准手机 | 390x844 | Pixel 5 | 侧边栏折叠、代码块滚动 |
| 小屏手机 | 375x667 | iPhone SE | 最小宽度兼容性 |
| 平板 | 768x1024 | iPad Mini | 中等屏幕布局 |

**实施方案**:
```typescript
// playwright.config.ts
projects: [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] }
  },
  {
    name: 'Mobile Chrome',
    use: { ...devices['Pixel 5'] }
  }
]

// 测试中动态设置视口
test('小屏手机布局', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  // 验证布局...
});
```

**替代方案考虑**:
- **仅测试桌面**: 只验证桌面浏览器 → 拒绝原因: 文档站支持移动端,必须测试响应式
- **真实设备测试**: 使用 BrowserStack 等云服务 → 拒绝原因: 增加复杂度和成本,Playwright 设备模拟已足够

**参考资料**:
- Playwright 设备模拟文档
- rspress 默认响应式断点: 768px (移动端/桌面端)

---

## 研究项 4: Clipboard API 的测试方法

### 决策: 使用 Playwright 的 `evaluate()` + `navigator.clipboard`

**选择理由**:
- Playwright 支持访问浏览器的 Clipboard API
- 使用 `page.evaluate()` 在浏览器上下文中读取剪贴板
- 需要在测试配置中授予 clipboard-read 权限

**实施方案**:
```typescript
// playwright.config.ts
use: {
  baseURL: 'http://localhost:3000',
  permissions: ['clipboard-read', 'clipboard-write'],
}

// 测试代码
test('复制代码功能', async ({ page, context }) => {
  // 授予剪贴板权限
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  // 点击复制按钮
  await page.click('button[aria-label*="复制"]');

  // 读取剪贴板内容
  const clipboardText = await page.evaluate(() => {
    return navigator.clipboard.readText();
  });

  // 断言
  expect(clipboardText).toContain('import { TushareClient }');
  expect(clipboardText.length).toBeGreaterThan(0);
});
```

**边缘情况处理**:
- **浏览器不支持 Clipboard API**: 测试跳过并记录警告
- **权限被拒绝**: 在 beforeAll 中检查权限,失败则跳过相关测试
- **异步操作**: 使用 `waitForTimeout()` 或监听复制事件确保操作完成

**替代方案考虑**:
- **模拟 clipboard API**: 使用 mock 替代真实 API → 拒绝原因: 无法测试真实浏览器行为
- **手动验证**: 不自动测试复制功能 → 拒绝原因: 复制功能是核心特性,必须自动化测试

**参考资料**:
- Playwright Clipboard 文档
- MDN: Clipboard API

---

## 研究项 5: E2E 测试的隔离性和稳定性策略

### 决策: 测试独立性 + 重试机制 + 详细日志

**选择理由**:
- 每个测试用例独立运行,不依赖其他测试的状态
- 使用 `test.beforeEach()` 确保每个测试从干净状态开始
- CI 环境启用重试(最多2次),本地开发不重试
- 失败时自动截图和录制视频,便于调试

**实施策略**:
1. **测试隔离**:
   - 每个测试独立导航到目标页面
   - 不共享页面状态或数据
   - 使用 `test.describe.configure({ mode: 'parallel' })` 并行运行独立测试

2. **等待策略**:
   - 使用 Playwright 的自动等待机制(默认30秒)
   - 对动态内容使用 `waitForSelector({ state: 'visible' })`
   - 对网络请求使用 `waitForResponse()`

3. **重试和容错**:
   ```typescript
   // playwright.config.ts
   retries: process.env.CI ? 2 : 0,
   use: {
     trace: 'on-first-retry',
     screenshot: 'only-on-failure',
     video: 'retain-on-failure'
   }
   ```

4. **调试支持**:
   - 测试失败时生成 trace 文件,可用 `npx playwright show-trace` 查看
   - 使用 `test.slow()` 标记慢速测试,延长超时
   - 添加 `console.log` 输出关键步骤

**替代方案考虑**:
- **共享状态**: 使用 `test.describe.serial()` 按顺序运行测试 → 拒绝原因: 降低测试独立性,一个失败影响后续
- **无重试**: CI 环境不重试失败测试 → 拒绝原因: 网络或临时问题可能导致假失败

**参考资料**:
- Playwright Best Practices
- 测试稳定性指南

---

## 技术依赖总结

| 依赖 | 版本 | 用途 |
|------|------|------|
| Playwright | 1.48.0 | E2E测试框架 |
| @playwright/test | 1.48.0 | 测试运行器和断言 |
| TypeScript | 5.6+ | 测试代码编写 |
| rspress | 1.45.6 | 文档站生成器(被测对象) |

---

## 风险和缓解措施

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| rspress DOM 结构变化 | 选择器失效 | 使用语义化选择器,定期维护 |
| 测试执行时间过长 | 开发体验下降 | 并行运行,优化等待时间 |
| CI 环境不稳定 | 测试假失败 | 启用重试,记录详细日志 |
| 移动端设备模拟不准确 | 响应式问题未发现 | 补充真实设备测试(手动) |

---

## 下一步行动

1. ✅ 完成 research.md (当前文档)
2. ⏭️ 生成 data-model.md (定义测试实体和页面对象结构)
3. ⏭️ 生成 contracts/ (定义测试接口和配置契约)
4. ⏭️ 生成 quickstart.md (测试开发快速开始指南)
