# Tasks: 文档站E2E测试重构

**Feature**: 008-e2e-e2e
**Input**: 设计文档来自 `/specs/008-e2e-e2e/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**测试**: 本特性是E2E测试重构,测试代码本身就是交付物,不需要额外的测试层。

**组织方式**: 任务按用户故事分组,确保每个故事可以独立实现和测试。

## 格式: `[ID] [P?] [Story] 描述`
- **[P]**: 可并行运行(不同文件,无依赖关系)
- **[Story]**: 任务所属的用户故事(例如 US1, US2, US3)
- 描述中包含精确的文件路径

## 路径约定
- 测试文件目录: `apps/docs/tests/e2e/`
- Page Object 目录: `apps/docs/tests/e2e/pages/`
- 配置文件: `apps/docs/playwright.config.ts`

---

## Phase 1: 项目设置(共享基础设施)

**目的**: 项目初始化和基础结构搭建

- [X] T001 移除过时的测试文件 `apps/docs/tests/e2e/search.spec.ts` 和 `apps/docs/tests/e2e/quick-start.spec.ts`
- [X] T002 创建 Page Object 目录结构 `apps/docs/tests/e2e/pages/`
- [X] T003 更新 `apps/docs/playwright.config.ts` 配置文件,设置测试目录、baseURL和webServer配置
- [X] T004 在 `apps/docs/package.json` 中添加E2E测试相关的npm脚本命令

---

## Phase 2: 基础层(阻塞性前置条件)

**目的**: 所有用户故事实现前必须完成的核心基础设施

**⚠️ 关键**: 在此阶段完成前,不能开始任何用户故事的工作

- [X] T005 [P] 创建 `BasePage` 基类 `apps/docs/tests/e2e/pages/base-page.ts`,实现通用页面交互方法(goto, getTitle, getMainHeading, waitForPageLoad, getSelectors)
- [X] T006 [P] 定义通用选择器常量 `apps/docs/tests/e2e/pages/selectors.ts`,包含导航栏、侧边栏、主内容区的选择器
- [X] T007 [P] 创建测试辅助工具 `apps/docs/tests/e2e/utils/test-helpers.ts`,包含权限授予、剪贴板操作等通用函数

**检查点**: 基础层已就绪 - 现在可以开始并行实现用户故事

---

## Phase 3: User Story 1 - 验证文档站核心页面可访问性 (优先级: P1) 🎯 MVP

**目标**: 验证所有核心文档页面(首页、指南页、API文档页、更新日志页)能够正常访问并显示预期内容

**独立测试**: 运行 `pnpm test:e2e core-pages.spec.ts`,验证所有10个核心页面的标题和关键内容正确渲染

### User Story 1 实现

- [X] T008 [P] [US1] 创建 `HomePage` 页面对象 `apps/docs/tests/e2e/pages/home-page.ts`,继承 BasePage
- [X] T009 [P] [US1] 创建 `GuidePage` 页面对象 `apps/docs/tests/e2e/pages/guide-page.ts`,继承 BasePage,处理指南页共性
- [X] T010 [P] [US1] 创建 `ApiPage` 页面对象 `apps/docs/tests/e2e/pages/api-page.ts`,继承 BasePage,处理API文档页共性
- [X] T011 [P] [US1] 创建 `ChangelogPage` 页面对象 `apps/docs/tests/e2e/pages/changelog-page.ts`,继承 BasePage
- [X] T012 [US1] 实现核心页面可访问性测试 `apps/docs/tests/e2e/core-pages.spec.ts`,包含10个测试场景:
  - 验证首页可访问并显示 "Tushare SDK" 标题
  - 验证快速入门页(`/guide/quick-start`)显示快速入门内容和代码示例
  - 验证安装指南页(`/guide/installation`)显示安装命令和包名
  - 验证配置指南页(`/guide/configuration`)显示Token配置方法
  - 验证错误处理页(`/guide/error-handling`)显示错误处理内容
  - 验证股票基础信息API页(`/api/stock/basic`)显示API文档和代码示例
  - 验证日线数据API页(`/api/stock/daily`)显示完整API文档
  - 验证交易日历API页(`/api/calendar`)显示API文档内容
  - 验证每日指标API页(`/api/daily-basic`)显示API文档内容
  - 验证更新日志页(`/changelog/`)显示 "更新日志" 标题和版本信息

**检查点**: User Story 1 完成 - 所有核心页面可访问性已验证,可以独立运行测试

---

## Phase 4: User Story 2 - 验证导航栏和侧边栏功能 (优先级: P1)

**目标**: 验证顶部导航栏和侧边栏的所有链接可以正常跳转,确保用户能够顺利浏览文档

**独立测试**: 运行 `pnpm test:e2e navigation.spec.ts`,验证导航链接跳转和URL变化

### User Story 2 实现

- [X] T013 [US2] 扩展 `BasePage`,添加导航相关方法(`clickNavLink`, `clickSidebarLink`, `expectUrlContains`),实现 INavigable 接口
- [X] T014 [US2] 实现导航功能测试 `apps/docs/tests/e2e/navigation.spec.ts`,包含8个测试场景:
  - 从首页点击 "指南" 链接,验证跳转到 `/guide/`
  - 从首页点击 "API 文档" 链接,验证跳转到 `/api/`
  - 从首页点击 "更新日志" 链接,验证跳转到 `/changelog/`
  - 在API文档页验证侧边栏显示 "股票数据" 和 "交易相关" 分类
  - 在 `/api/stock/basic` 页点击侧边栏 "日线数据" 链接,验证跳转到 `/api/stock/daily`
  - 在 `/api/stock/basic` 页点击侧边栏 "交易日历" 链接,验证跳转到 `/api/calendar`
  - 在指南页验证侧边栏显示 "安装"、"快速开始"、"配置"、"错误处理" 链接
  - 在 `/guide/installation` 页点击侧边栏 "快速开始" 链接,验证跳转到 `/guide/quick-start`

**检查点**: User Stories 1 和 2 均已完成 - 页面访问和导航功能均可独立工作

---

## Phase 5: User Story 3 - 验证代码示例功能 (优先级: P2)

**目标**: 验证所有文档页面中的代码示例正确显示、支持语法高亮、显示行号,以及复制按钮能够正常工作

**独立测试**: 运行 `pnpm test:e2e code-examples.spec.ts`,验证代码块渲染和复制功能

### User Story 3 实现

- [X] T015 [US3] 扩展 `BasePage`,添加代码示例相关方法(`getCodeBlocks`, `getFirstCodeBlockContent`, `clickCopyButton`, `getClipboardContent`, `expectCodeBlockContains`),实现 ICodeExamples 接口
- [X] T016 [US3] 实现代码示例功能测试 `apps/docs/tests/e2e/code-examples.spec.ts`,包含7个测试场景:
  - 在 `/guide/quick-start` 页验证至少显示一个代码块且包含 TypeScript 代码
  - 在 `/api/stock/basic` 页验证代码块显示语法高亮和行号
  - 在包含代码块的页面鼠标悬停,验证复制按钮显示
  - 点击复制按钮,验证代码内容成功复制到剪贴板
  - 读取剪贴板内容,验证内容长度大于0且包含代码文本
  - 在 `/guide/quick-start` 验证代码块包含 `import` 语句和 `TushareClient` 相关代码
  - 在 `/api/stock/basic` 验证代码块包含函数调用示例和参数使用说明

**检查点**: User Stories 1、2 和 3 均已完成 - 页面访问、导航和代码示例功能均独立工作

---

## Phase 6: User Story 4 - 验证更新日志页面结构和内容 (优先级: P2)

**目标**: 验证更新日志页面的结构清晰、版本按倒序排列、包含版本号和发布日期、更新内容有明确分类

**独立测试**: 运行 `pnpm test:e2e changelog.spec.ts`,验证更新日志页面的结构、版本号和内容分类

### User Story 4 实现

- [X] T017 [US4] 扩展 `ChangelogPage`,添加更新日志特定方法(`getVersionHeadings`, `validateVersionFormat`, `validateDateFormat`, `validateContentCategories`)
- [X] T018 [US4] 实现更新日志测试 `apps/docs/tests/e2e/changelog.spec.ts`,包含5个测试场景:
  - 访问 `/changelog/` 页面,验证页面包含主标题(h1)和至少一个版本标题(h2)
  - 验证版本号符合 `vX.Y.Z` 或 `X.Y.Z` 格式
  - 验证发布日期格式为 `YYYY-MM-DD`、`YYYY/MM/DD` 或 `YYYY.MM.DD`
  - 验证更新内容包含分类关键词(新增/功能/Features 或 修复/Bug/Fixes)
  - 如果包含破坏性变更,验证包含迁移指南或升级注意事项的说明

**检查点**: User Stories 1-4 均已完成 - 所有核心文档功能均可独立测试

---

## Phase 7: User Story 5 - 验证响应式设计在移动设备上的表现 (优先级: P3)

**目标**: 验证文档站在移动设备(手机、平板)上的布局正确、侧边栏折叠和展开正常、代码块支持横向滚动、导航栏正常显示

**独立测试**: 运行 `pnpm test:e2e responsive.spec.ts --project="Mobile Chrome"`,验证移动端布局和交互

### User Story 5 实现

- [X] T019 [US5] 扩展 `BasePage`,添加响应式测试相关方法(`setViewport`, `isSidebarVisible`, `clickMobileMenuButton`, `expectNavHeightLessThan`),实现 IResponsive 接口
- [X] T020 [US5] 在 `apps/docs/playwright.config.ts` 中配置移动端测试项目 "Mobile Chrome" (Pixel 5)
- [X] T021 [US5] 实现响应式设计测试 `apps/docs/tests/e2e/responsive.spec.ts`,包含6个测试场景:
  - 设置移动端视口(390x844),访问 `/api/stock/basic`,验证侧边栏默认不可见或折叠
  - 在移动端点击菜单按钮,验证侧边栏展开并可见
  - 设置移动端视口(375x667),访问包含代码块的页面,验证代码块支持横向滚动且不破坏布局
  - 设置移动端视口(375x667),访问首页,验证导航栏正常显示且高度小于100px
  - 设置平板视口(768x1024),访问 `/api/stock/basic`,验证侧边栏可见或可以通过菜单按钮展开
  - 在移动端视口,验证页面包含图片时图片宽度不超过视口宽度且正确缩放

**检查点**: 所有5个用户故事均已完成 - 文档站的所有核心功能在桌面和移动端均可独立测试

---

## Phase 8: 优化与跨功能改进

**目的**: 影响多个用户故事的改进和优化

- [X] T022 [P] 为所有测试文件添加清晰的注释和 JSDoc 文档
- [X] T023 [P] 优化测试执行性能,确保完整测试套件执行时间 < 2分钟
- [X] T024 [P] 在 CI 环境配置中启用重试机制和串行执行
- [X] T025 [P] 配置测试失败时的截图、视频和 trace 生成
- [X] T026 验证 quickstart.md 中的所有示例代码和命令可以正常运行
- [X] T027 清理和移除所有未使用的导入和代码
- [ ] T028 运行完整的测试套件,确保所有测试在本地和CI环境100%通过

---

## 依赖关系与执行顺序

### 阶段依赖

- **项目设置 (Phase 1)**: 无依赖 - 可以立即开始
- **基础层 (Phase 2)**: 依赖项目设置完成 - **阻塞所有用户故事**
- **用户故事 (Phase 3-7)**: 全部依赖基础层完成
  - 用户故事可以并行执行(如果有足够人力)
  - 或按优先级顺序执行(P1 → P1 → P2 → P2 → P3)
- **优化 (Phase 8)**: 依赖所有期望的用户故事完成

### 用户故事依赖

- **User Story 1 (P1) - 核心页面可访问性**: 基础层完成后即可开始 - 无其他故事依赖
- **User Story 2 (P1) - 导航功能**: 基础层完成后即可开始 - 可能使用 US1 的页面对象,但独立测试
- **User Story 3 (P2) - 代码示例**: 基础层完成后即可开始 - 独立测试
- **User Story 4 (P2) - 更新日志**: 基础层完成后即可开始 - 完全独立
- **User Story 5 (P3) - 响应式设计**: 基础层完成后即可开始 - 可在所有页面上测试,但独立

### 每个用户故事内部

- Page Object 创建优先于测试实现
- 扩展功能接口在使用前完成
- 核心测试场景优先于边缘情况

### 并行机会

- Phase 1 的所有任务可以并行运行
- Phase 2 的所有标记 [P] 的任务可以并行运行
- 基础层完成后,所有用户故事可以并行开始(如果团队能力允许)
- 每个用户故事内的 Page Object 创建任务可以并行运行(标记 [P])
- Phase 8 的所有标记 [P] 的任务可以并行运行

---

## 并行示例: User Story 1

```bash
# 并行创建所有 Page Object:
Task: "创建 HomePage 页面对象 apps/docs/tests/e2e/pages/home-page.ts"
Task: "创建 GuidePage 页面对象 apps/docs/tests/e2e/pages/guide-page.ts"
Task: "创建 ApiPage 页面对象 apps/docs/tests/e2e/pages/api-page.ts"
Task: "创建 ChangelogPage 页面对象 apps/docs/tests/e2e/pages/changelog-page.ts"

# 等待所有 Page Object 创建完成后,再实现测试
```

## 并行示例: Phase 2 基础层

```bash
# 并行创建所有基础设施:
Task: "创建 BasePage 基类 apps/docs/tests/e2e/pages/base-page.ts"
Task: "定义通用选择器常量 apps/docs/tests/e2e/pages/selectors.ts"
Task: "创建测试辅助工具 apps/docs/tests/e2e/utils/test-helpers.ts"
```

---

## 实施策略

### MVP 优先(仅 User Story 1 和 2)

1. 完成 Phase 1: 项目设置
2. 完成 Phase 2: 基础层(关键 - 阻塞所有故事)
3. 完成 Phase 3: User Story 1 - 核心页面可访问性
4. 完成 Phase 4: User Story 2 - 导航功能
5. **停止并验证**: 独立测试 US1 和 US2
6. 如果准备好,部署/演示

### 增量交付

1. 完成项目设置 + 基础层 → 基础就绪
2. 添加 User Story 1 → 独立测试 → 部署/演示(MVP!)
3. 添加 User Story 2 → 独立测试 → 部署/演示
4. 添加 User Story 3 → 独立测试 → 部署/演示
5. 添加 User Story 4 → 独立测试 → 部署/演示
6. 添加 User Story 5 → 独立测试 → 部署/演示
7. 每个故事增加价值且不破坏之前的故事

### 并行团队策略

多个开发人员时:

1. 团队一起完成项目设置 + 基础层
2. 基础层完成后:
   - 开发者 A: User Story 1 + User Story 2
   - 开发者 B: User Story 3
   - 开发者 C: User Story 4 + User Story 5
3. 故事独立完成并集成

---

## 任务统计

- **总任务数**: 28
- **Phase 1 (项目设置)**: 4 个任务
- **Phase 2 (基础层)**: 3 个任务
- **Phase 3 (US1 - 核心页面)**: 5 个任务
- **Phase 4 (US2 - 导航)**: 2 个任务
- **Phase 5 (US3 - 代码示例)**: 2 个任务
- **Phase 6 (US4 - 更新日志)**: 2 个任务
- **Phase 7 (US5 - 响应式)**: 3 个任务
- **Phase 8 (优化)**: 7 个任务

### 并行机会识别

- **Phase 1**: 4 个任务可串行或部分并行
- **Phase 2**: 3 个任务均可并行 [P]
- **User Story Page Objects**: 各故事内的 Page Object 创建可并行
- **Phase 8**: 6 个任务可并行 [P]
- **用户故事**: 基础层完成后,5 个用户故事可并行开发

### 独立测试标准

每个用户故事都有明确的独立测试命令:
- **US1**: `pnpm test:e2e core-pages.spec.ts`
- **US2**: `pnpm test:e2e navigation.spec.ts`
- **US3**: `pnpm test:e2e code-examples.spec.ts`
- **US4**: `pnpm test:e2e changelog.spec.ts`
- **US5**: `pnpm test:e2e responsive.spec.ts --project="Mobile Chrome"`

### 建议的 MVP 范围

**最小可行产品应包括**:
- Phase 1: 项目设置
- Phase 2: 基础层(必需!)
- Phase 3: User Story 1 - 核心页面可访问性(P1)
- Phase 4: User Story 2 - 导航功能(P1)

这将提供基本的E2E测试覆盖,验证文档站的核心功能(页面访问和导航)。

---

## 注意事项

- [P] 标记的任务 = 不同文件,无依赖关系,可并行
- [Story] 标签将任务映射到特定用户故事,便于追溯
- 每个用户故事应该可以独立完成和测试
- 每个任务或逻辑组后提交代码
- 在任何检查点停止以独立验证故事
- 避免: 模糊的任务、同文件冲突、破坏独立性的跨故事依赖

---

## 快速开始

**准备开始实施?**

1. 确保所有设计文档已审阅: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md
2. 检出特性分支: `git checkout 008-e2e-e2e`
3. 安装依赖: `pnpm install`
4. 开始 Phase 1: 项目设置
5. 完成 Phase 2: 基础层(关键!)
6. 选择实施策略(MVP优先/增量交付/并行团队)
7. 开始实现用户故事!

**测试执行**:
- 本地测试: `pnpm test:e2e`
- UI 模式: `pnpm test:e2e:ui`
- 特定文件: `pnpm test:e2e core-pages.spec.ts`
- 调试模式: `PWDEBUG=1 pnpm test:e2e`

祝编码愉快! 🚀
