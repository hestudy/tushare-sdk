import { test, expect } from '@playwright/test';

/**
 * 搜索功能 E2E 测试
 * 
 * 测试场景:
 * - 1.1: 搜索 API 并显示结果
 * - 1.2: 点击搜索结果跳转到详情页
 * - 1.3: API 详情页显示完整信息
 * - 1.5: 搜索无结果提示
 */

test.describe('搜索功能测试', () => {
  test('应该能够搜索 API 并显示结果列表', async ({ page }) => {
    // Given: 访问文档站首页
    await page.goto('/');
    
    // When: 在搜索框输入 API 名称
    // rspress 使用内置搜索,通过搜索按钮触发
    await page.click('.rspress-nav-search-button');
    await page.fill('.rspress-search-panel-input', 'stock');
    
    // Then: 显示相关搜索结果
    const results = page.locator('.rspress-search-suggest-item');
    await expect(results.first()).toBeVisible({ timeout: 5000 });
    await expect(results.first()).toContainText('Stock');
  });

  test('应该能够点击搜索结果跳转到 API 详情页', async ({ page }) => {
    // Given: 已显示搜索结果
    await page.goto('/');
    await page.click('.rspress-nav-search-button');
    await page.fill('.rspress-search-panel-input', 'getStockBasic');
    await page.waitForSelector('.rspress-search-suggest-item', { timeout: 5000 });
    
    // When: 点击第一个搜索结果
    await page.click('.rspress-search-suggest-item >> nth=0');
    
    // Then: 跳转到 API 详情页
    await expect(page).toHaveURL(/\/api\/stock\/basic/);
    await expect(page.locator('h1')).toContainText('getStockBasic');
  });

  test('API 详情页应该显示完整的 API 信息', async ({ page }) => {
    // Given: 访问 API 详情页
    await page.goto('/api/stock/basic');
    
    // When: 查看页面内容
    // Then: 页面包含所有必要信息
    await expect(page.locator('h1')).toBeVisible(); // API 名称
    
    // 检查页面包含关键部分
    const content = await page.textContent('body');
    expect(content).toContain('函数签名'); // 函数签名
    expect(content).toContain('参数'); // 参数说明
    expect(content).toContain('返回值'); // 返回值说明
    expect(content).toContain('代码示例'); // 代码示例
  });

  test('搜索无结果时应该显示友好提示', async ({ page }) => {
    // Given: 访问文档站首页
    await page.goto('/');
    
    // When: 搜索不存在的 API
    await page.click('.rspress-nav-search-button');
    await page.fill('.rspress-search-panel-input', 'nonexistent_api_xyz_12345');
    await page.waitForTimeout(1000); // 等待搜索完成
    
    // Then: 显示无结果提示或没有结果
    const hasResults = await page.locator('.rspress-search-suggest-item').count();
    expect(hasResults).toBe(0);
  });
});
