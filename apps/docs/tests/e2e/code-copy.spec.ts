import { test, expect } from '@playwright/test';

/**
 * 代码复制功能 E2E 测试
 * 
 * 测试场景:
 * - 1.4: 代码示例复制功能
 */

test.describe('代码复制功能测试', () => {
  test('应该能够复制代码示例到剪贴板', async ({ page, context }) => {
    // Given: 访问包含代码示例的 API 详情页
    await page.goto('/api/stock/basic');
    
    // 授予剪贴板权限
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    // When: 点击复制按钮
    // rspress 默认为代码块提供复制按钮
    const copyButton = page.locator('button[class*="copy"]').first();
    await expect(copyButton).toBeVisible();
    await copyButton.click();
    
    // Then: 代码被复制到剪贴板
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText.length).toBeGreaterThan(0);
    
    // And: 显示复制成功提示 (rspress 通常会改变按钮状态)
    // 等待一小段时间让按钮状态更新
    await page.waitForTimeout(500);
  });

  test('代码块应该包含可复制的内容', async ({ page }) => {
    // Given: 访问 API 详情页
    await page.goto('/api/stock/basic');
    
    // When: 查看代码块
    const codeBlocks = page.locator('pre code');
    
    // Then: 至少有一个代码块
    const count = await codeBlocks.count();
    expect(count).toBeGreaterThan(0);
    
    // And: 代码块包含内容
    const firstCodeBlock = codeBlocks.first();
    const codeContent = await firstCodeBlock.textContent();
    expect(codeContent?.length).toBeGreaterThan(0);
  });
});
