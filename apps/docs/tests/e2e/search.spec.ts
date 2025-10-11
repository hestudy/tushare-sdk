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
    // rspress 使用内置搜索,通常通过快捷键或搜索按钮触发
    await page.click('[data-search-button]');
    await page.fill('[data-search-input]', 'get_stock_basic');
    
    // Then: 显示相关搜索结果
    const results = page.locator('[data-search-result]');
    await expect(results.first()).toBeVisible({ timeout: 5000 });
    await expect(results.first()).toContainText('get_stock_basic');
  });

  test('应该能够点击搜索结果跳转到 API 详情页', async ({ page }) => {
    // Given: 已显示搜索结果
    await page.goto('/');
    await page.click('[data-search-button]');
    await page.fill('[data-search-input]', 'get_stock_basic');
    await page.waitForSelector('[data-search-result]', { timeout: 5000 });
    
    // When: 点击第一个搜索结果
    await page.click('[data-search-result]:first-child');
    
    // Then: 跳转到 API 详情页
    await expect(page).toHaveURL(/\/api\/stock\/basic/);
    await expect(page.locator('h1')).toContainText('get_stock_basic');
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
    await page.click('[data-search-button]');
    await page.fill('[data-search-input]', 'nonexistent_api_xyz_12345');
    await page.waitForTimeout(1000); // 等待搜索完成
    
    // Then: 显示无结果提示或没有结果
    const hasResults = await page.locator('[data-search-result]').count();
    expect(hasResults).toBe(0);
  });
});
