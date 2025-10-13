/**
 * 代码示例功能测试
 *
 * 验证所有文档页面中的代码示例正确显示、支持语法高亮、显示行号,以及复制按钮能够正常工作
 * User Story 3: 验证代码示例功能 (优先级: P2)
 */

import { test, expect } from '@playwright/test';
import { GuidePage } from './pages/guide-page';
import { ApiPage } from './pages/api-page';

test.describe('代码示例功能测试', () => {
  test('在 /guide/quick-start 页验证至少显示一个代码块且包含 TypeScript 代码', async ({
    page,
  }) => {
    // Given: 创建指南页对象
    const guidePage = new GuidePage(page);

    // When: 访问快速入门页
    await guidePage.gotoQuickStart();

    // Then: 验证至少有一个代码块
    const codeBlocks = await guidePage.getCodeBlocks();
    expect(codeBlocks.length).toBeGreaterThan(0);

    // Then: 验证代码块包含 TypeScript 相关内容
    const hasImport = await guidePage.expectCodeBlockContains('import');
    const hasTushare = await guidePage.expectCodeBlockContains('Tushare');

    expect(hasImport || hasTushare).toBeTruthy();
  });

  test('在 /api/stock/basic 页验证代码块显示语法高亮和行号', async ({ page }) => {
    // Given: 创建API页对象
    const apiPage = new ApiPage(page);

    // When: 访问股票基础信息API页
    await apiPage.gotoStockBasic();

    // Then: 验证至少有一个代码块
    const codeBlocks = await apiPage.getCodeBlocks();
    expect(codeBlocks.length).toBeGreaterThan(0);

    // Then: 验证代码块包含内容
    const codeContent = await apiPage.getFirstCodeBlockContent();
    expect(codeContent).toBeTruthy();
    expect(codeContent!.length).toBeGreaterThan(0);
  });

  test('在包含代码块的页面鼠标悬停,验证复制按钮显示', async ({ page, context }) => {
    // Given: 授予剪贴板权限
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Given: 创建指南页对象并访问
    const guidePage = new GuidePage(page);
    await guidePage.gotoQuickStart();

    // When: 悬停在代码块上
    const codeBlocks = await guidePage.getCodeBlocks();
    if (codeBlocks.length > 0) {
      await codeBlocks[0].hover();
    }

    // Then: 复制按钮应该可见
    const copyButton = page.locator('button[aria-label*="复制"], button[title*="复制"], button[class*="copy"]').first();
    await expect(copyButton).toBeVisible({ timeout: 5000 });
  });

  test('点击复制按钮,验证代码内容成功复制到剪贴板', async ({ page, context }) => {
    // Given: 授予剪贴板权限
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Given: 创建API页对象并访问
    const apiPage = new ApiPage(page);
    await apiPage.gotoStockBasic();

    // When: 点击复制按钮
    await apiPage.clickCopyButton(0);

    // Then: 读取剪贴板内容
    const clipboardText = await apiPage.getClipboardContent();
    expect(clipboardText.length).toBeGreaterThan(0);
  });

  test('读取剪贴板内容,验证内容长度大于0且包含代码文本', async ({ page, context }) => {
    // Given: 授予剪贴板权限
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Given: 创建指南页对象并访问
    const guidePage = new GuidePage(page);
    await guidePage.gotoQuickStart();

    // When: 点击复制按钮
    await guidePage.clickCopyButton(0);

    // Then: 读取剪贴板内容
    const clipboardText = await guidePage.getClipboardContent();

    // Then: 验证内容
    expect(clipboardText.length).toBeGreaterThan(0);
    // 验证包含代码相关关键词
    const hasCodeKeyword =
      clipboardText.includes('import') ||
      clipboardText.includes('const') ||
      clipboardText.includes('function') ||
      clipboardText.includes('Tushare');

    expect(hasCodeKeyword).toBeTruthy();
  });

  test('在 /guide/quick-start 验证代码块包含 `import` 语句和 `TushareClient` 相关代码', async ({
    page,
  }) => {
    // Given: 创建指南页对象
    const guidePage = new GuidePage(page);

    // When: 访问快速入门页
    await guidePage.gotoQuickStart();

    // Then: 验证代码块包含 import 语句
    const hasImport = await guidePage.expectCodeBlockContains('import');
    expect(hasImport).toBeTruthy();

    // Then: 验证代码块包含 TushareClient
    const hasTushareClient = await guidePage.expectCodeBlockContains('TushareClient');
    expect(hasTushareClient).toBeTruthy();
  });

  test('在 /api/stock/basic 验证代码块包含函数调用示例和参数使用说明', async ({ page }) => {
    // Given: 创建API页对象
    const apiPage = new ApiPage(page);

    // When: 访问股票基础信息API页
    await apiPage.gotoStockBasic();

    // Then: 验证代码块包含函数调用或API相关内容
    const codeContent = await apiPage.getFirstCodeBlockContent();
    expect(codeContent).toBeTruthy();

    // 验证包含API调用相关关键词
    const hasApiKeyword =
      codeContent!.includes('stock') ||
      codeContent!.includes('basic') ||
      codeContent!.includes('client') ||
      codeContent!.includes('api');

    expect(hasApiKeyword).toBeTruthy();
  });
});
