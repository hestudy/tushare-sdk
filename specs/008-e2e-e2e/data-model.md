# Data Model: 文档站E2E测试重构

**Feature**: 008-e2e-e2e
**Date**: 2025-10-13
**Purpose**: 定义E2E测试的核心实体、页面对象和数据结构

---

## 核心实体

### 1. TestSuite (测试套件)

**描述**: E2E测试套件的顶层容器,按用户场景分组

**属性**:
- `name: string` - 测试套件名称 (如 "核心页面可访问性测试")
- `priority: 'P1' | 'P2' | 'P3'` - 优先级
- `scenarios: TestScenario[]` - 包含的测试场景列表
- `tags: string[]` - 标签 (如 ['navigation', 'mobile'])

**状态**:
- `pending` - 待执行
- `running` - 执行中
- `passed` - 全部通过
- `failed` - 有失败用例

**验证规则**:
- 每个测试套件必须至少包含1个测试场景
- 测试套件名称必须清晰描述测试目标

---

### 2. TestScenario (测试场景)

**描述**: 单个测试用例,对应功能需求中的验收场景

**属性**:
- `given: string` - 前置条件 (如 "用户在首页")
- `when: string` - 操作步骤 (如 "点击指南链接")
- `then: string` - 期望结果 (如 "跳转到指南页面")
- `timeout?: number` - 超时时间(毫秒,默认30000)
- `retries?: number` - 重试次数

**关联**:
- 属于某个 `TestSuite`
- 在特定的 `PageObject` 上执行

**验证规则**:
- Given-When-Then 三部分必须完整
- 超时时间不应超过60秒
- 重试次数不应超过3次

---

### 3. PageObject (页面对象)

**描述**: 封装页面交互逻辑的类,提供业务语义的方法

**基类**: `BasePage`

**继承层次**:
```
BasePage (基类)
├── HomePage (首页)
├── GuidePage (指南页)
│   ├── InstallationPage
│   ├── QuickStartPage
│   ├── ConfigurationPage
│   └── ErrorHandlingPage
├── ApiPage (API文档页)
│   ├── StockBasicPage
│   ├── StockDailyPage
│   ├── CalendarPage
│   └── DailyBasicPage
└── ChangelogPage (更新日志页)
```

**共有属性 (BasePage)**:
- `page: Page` - Playwright Page 实例
- `baseURL: string` - 文档站基础URL
- `selectors: Selectors` - 页面选择器集合

**共有方法 (BasePage)**:
- `goto(path: string): Promise<void>` - 导航到指定路径
- `getTitle(): Promise<string>` - 获取页面标题
- `getMainHeading(): Promise<string>` - 获取主标题(h1)
- `waitForPageLoad(): Promise<void>` - 等待页面完全加载
- `takeScreenshot(name: string): Promise<void>` - 截图

**验证规则**:
- 所有页面对象必须继承 `BasePage`
- 选择器必须使用语义化命名
- 方法名必须反映业务操作,而非技术细节

---

### 4. Selectors (选择器集合)

**描述**: 页面元素的选择器定义,集中管理便于维护

**通用选择器 (所有页面)**:
```typescript
interface CommonSelectors {
  nav: string;                  // 顶部导航栏
  navLinks: {
    guide: string;              // 指南链接
    api: string;                // API文档链接
    changelog: string;          // 更新日志链接
    github: string;             // GitHub链接
  };
  sidebar: string;              // 侧边栏
  sidebarGroup: string;         // 侧边栏分组
  sidebarLink: string;          // 侧边栏链接
  mainContent: string;          // 主内容区
  footer: string;               // 页脚
}
```

**代码示例相关选择器**:
```typescript
interface CodeSelectors {
  codeBlock: string;            // 代码块容器
  codeContent: string;          // 代码内容
  copyButton: string;           // 复制按钮
  lineNumbers: string;          // 行号
}
```

**移动端选择器**:
```typescript
interface MobileSelectors {
  menuButton: string;           // 菜单按钮(汉堡图标)
  mobileNav: string;            // 移动端导航
  mobileSidebar: string;        // 移动端侧边栏
}
```

**实际值 (基于 rspress 结构)**:
```typescript
const commonSelectors: CommonSelectors = {
  nav: 'nav.rspress-nav',
  navLinks: {
    guide: 'nav.rspress-nav a[href*="/guide/"]',
    api: 'nav.rspress-nav a[href*="/api/"]',
    changelog: 'nav.rspress-nav a[href*="/changelog/"]',
    github: 'nav.rspress-nav a[href*="github.com"]'
  },
  sidebar: 'aside.rspress-sidebar',
  sidebarGroup: '.rspress-sidebar-group',
  sidebarLink: '.rspress-sidebar a',
  mainContent: 'article.rspress-doc-content',
  footer: 'footer.rspress-footer'
};

const codeSelectors: CodeSelectors = {
  codeBlock: 'pre',
  codeContent: 'pre code',
  copyButton: 'button[aria-label*="复制"], button[title*="复制"]',
  lineNumbers: '.line-number'
};

const mobileSelectors: MobileSelectors = {
  menuButton: 'button[aria-label="Toggle menu"]',
  mobileNav: '.rspress-nav-menu-mobile',
  mobileSidebar: '.rspress-sidebar-mobile'
};
```

---

### 5. ViewportConfig (视口配置)

**描述**: 测试使用的视口尺寸配置,用于响应式测试

**属性**:
- `name: string` - 配置名称 (如 "Desktop", "Mobile", "Tablet")
- `width: number` - 宽度(像素)
- `height: number` - 高度(像素)
- `deviceScaleFactor?: number` - 设备像素比
- `isMobile?: boolean` - 是否为移动设备
- `hasTouch?: boolean` - 是否支持触摸

**预定义配置**:
```typescript
const viewportConfigs: ViewportConfig[] = [
  {
    name: 'Desktop Chrome',
    width: 1280,
    height: 720,
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false
  },
  {
    name: 'Pixel 5',
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  },
  {
    name: 'iPhone SE',
    width: 375,
    height: 667,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  },
  {
    name: 'iPad Mini',
    width: 768,
    height: 1024,
    deviceScaleFactor: 2,
    isMobile: false,
    hasTouch: true
  }
];
```

**验证规则**:
- 宽度必须 > 0
- 高度必须 > 0
- 设备像素比通常为 1, 2, 或 3

---

### 6. TestReport (测试报告)

**描述**: 测试运行的结果报告,包含通过/失败状态和调试信息

**属性**:
- `suites: TestSuiteResult[]` - 测试套件结果列表
- `totalTests: number` - 总测试数
- `passedTests: number` - 通过的测试数
- `failedTests: number` - 失败的测试数
- `skippedTests: number` - 跳过的测试数
- `duration: number` - 总执行时间(毫秒)
- `timestamp: string` - 执行时间戳

**TestSuiteResult**:
```typescript
interface TestSuiteResult {
  suiteName: string;
  scenarios: TestScenarioResult[];
  duration: number;
}

interface TestScenarioResult {
  scenarioName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  screenshots?: string[];
  videos?: string[];
  trace?: string;
}
```

---

## 实体关系图

```
┌─────────────┐
│  TestSuite  │
│             │
│ - name      │
│ - priority  │
│ - scenarios │◄─────┐
└─────────────┘      │
                     │
                     │ 1:N
                     │
              ┌──────┴──────────┐
              │  TestScenario   │
              │                 │
              │ - given         │
              │ - when          │
              │ - then          │
              │ - timeout       │
              └────────┬────────┘
                       │
                       │ N:1
                       │
                ┌──────▼──────────┐
                │   PageObject    │
                │                 │
                │ - page          │
                │ - selectors     │
                │ + goto()        │
                │ + getTitle()    │
                └──────┬──────────┘
                       │
                       │ uses
                       │
                ┌──────▼──────────┐
                │   Selectors     │
                │                 │
                │ - nav           │
                │ - sidebar       │
                │ - codeBlock     │
                └─────────────────┘

┌──────────────────┐
│ ViewportConfig   │
│                  │
│ - name           │
│ - width/height   │
└──────────────────┘
         │
         │ used in
         ▼
┌──────────────────┐
│  TestScenario    │
└──────────────────┘
         │
         │ produces
         ▼
┌──────────────────┐
│   TestReport     │
└──────────────────┘
```

---

## 数据流

1. **测试初始化**:
   - 读取 `playwright.config.ts` 获取基础配置
   - 加载 `ViewportConfig` 和 `Selectors`
   - 初始化 `PageObject` 实例

2. **测试执行**:
   - `TestSuite` 遍历 `TestScenario` 列表
   - 每个 `TestScenario` 使用 `PageObject` 执行操作
   - `PageObject` 通过 `Selectors` 查找元素并交互

3. **结果收集**:
   - 每个 `TestScenario` 生成 `TestScenarioResult`
   - 汇总为 `TestSuiteResult`
   - 最终生成 `TestReport`

---

## 状态转换

### TestScenario 状态转换:
```
[pending] ─execute()→ [running] ─success→ [passed]
                         │
                         └──fail→ [failed] ─retry→ [running]
                         │
                         └──skip→ [skipped]
```

### TestSuite 状态转换:
```
[pending] ─start()→ [running] ─all_pass→ [passed]
                         │
                         └──any_fail→ [failed]
```

---

## 验证和约束

### 页面对象约束:
1. 所有页面对象必须实现 `goto()` 方法
2. 选择器必须使用常量定义,不允许硬编码在测试中
3. 方法必须返回 Promise 以支持异步操作

### 测试场景约束:
1. 每个场景必须独立,不依赖其他场景的状态
2. 场景超时时间不应超过30秒(除非明确标记为慢速测试)
3. 失败时必须提供清晰的错误信息

### 选择器约束:
1. 优先使用语义化选择器(nav, aside, article)
2. 避免使用脆弱的 CSS 路径(如 `div > div > span`)
3. 对动态内容使用 text 匹配或 aria-label

---

## 下一步

- ✅ 完成 data-model.md (当前文档)
- ⏭️ 生成 contracts/ (定义测试接口和配置契约)
- ⏭️ 生成 quickstart.md (测试开发快速开始指南)
