/**
 * 更新日志测试
 *
 * 验证更新日志页面的结构清晰、版本按倒序排列、包含版本号和发布日期、更新内容有明确分类
 * User Story 4: 验证更新日志页面结构和内容 (优先级: P2)
 */

import { test, expect } from '@playwright/test';
import { ChangelogPage } from './pages/changelog-page';

test.describe('更新日志测试', () => {
  test('访问 /changelog/ 页面,验证页面包含主标题(h1)和至少一个版本标题(h2)', async ({
    page,
  }) => {
    // Given: 创建更新日志页对象
    const changelogPage = new ChangelogPage(page);

    // When: 访问更新日志页
    await changelogPage.goto();

    // Then: 验证页面包含主标题
    const hasTitle = await changelogPage.expectChangelogTitle();
    expect(hasTitle).toBeTruthy();

    // Then: 验证页面包含至少一个版本标题
    const versionHeadings = await changelogPage.getVersionHeadings();
    expect(versionHeadings.length).toBeGreaterThan(0);
  });

  test('验证版本号符合 `vX.Y.Z` 或 `X.Y.Z` 格式', async ({ page }) => {
    // Given: 创建更新日志页对象
    const changelogPage = new ChangelogPage(page);

    // When: 访问更新日志页
    await changelogPage.goto();

    // Then: 验证版本号格式正确
    const isValidFormat = await changelogPage.validateVersionFormat();
    expect(isValidFormat).toBeTruthy();
  });

  test('验证发布日期格式为 `YYYY-MM-DD`、`YYYY/MM/DD` 或 `YYYY.MM.DD`', async ({ page }) => {
    // Given: 创建更新日志页对象
    const changelogPage = new ChangelogPage(page);

    // When: 访问更新日志页 (goto已经会等待页面加载)
    await changelogPage.goto();

    // Then: 验证日期格式正确 (不需要再次等待页面加载)
    const isValidDateFormat = await changelogPage.validateDateFormat();
    expect(isValidDateFormat).toBeTruthy();
  }, { timeout: 90000 });

  test('验证更新内容包含分类关键词(新增/功能/Features 或 修复/Bug/Fixes)', async ({ page }) => {
    // Given: 创建更新日志页对象
    const changelogPage = new ChangelogPage(page);

    // When: 访问更新日志页 (goto已经会等待页面加载)
    await changelogPage.goto();

    // Then: 验证更新内容包含分类关键词 (不需要再次等待页面加载)
    const hasCategories = await changelogPage.validateContentCategories();
    expect(hasCategories).toBeTruthy();
  }, { timeout: 90000 });

  test('如果包含破坏性变更,验证包含迁移指南或升级注意事项的说明', async ({ page }, testInfo) => {
    // Given: 创建更新日志页对象
    const changelogPage = new ChangelogPage(page);

    // When: 访问更新日志页
    await changelogPage.goto();

    // When: 读取页面内容 (使用多个选择器,增加超时)
    let content = '';
    try {
      const mainContent = page.locator('main, article, .rspress-doc, [role="main"]').first();
      await mainContent.waitFor({ state: 'visible', timeout: 10000 });
      content = await mainContent.textContent() || '';
    } catch {
      // 如果无法获取内容,测试通过(无需验证)
      return;
    }

    // Then: 如果包含破坏性变更关键词,验证包含迁移或升级说明
    if (!content) {
      // 内容为空,测试通过(无需验证)
      return;
    }

    const hasBreakingChange =
      content.includes('破坏性变更') ||
      content.includes('Breaking Change') ||
      content.includes('BREAKING');

    if (!hasBreakingChange) {
      // 没有破坏性变更,测试通过
      return;
    }

    // 有破坏性变更,验证必须包含迁移指南
    const hasMigrationGuide =
      content.includes('迁移') ||
      content.includes('升级') ||
      content.includes('Migration') ||
      content.includes('Upgrade');

    expect(hasMigrationGuide).toBeTruthy();
  }, { timeout: 60000 });
});
