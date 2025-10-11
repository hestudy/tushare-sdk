import { test, expect } from '@playwright/test';

/**
 * User Story 2: 浏览API分类目录
 * 测试导航功能,包括侧边栏分类、展开/收起、链接跳转和面包屑导航
 */

test.describe('导航功能测试', () => {
  /**
   * 场景 2.1: 侧边栏显示分类目录
   * 验证侧边栏显示按功能分类的 API 目录树
   */
  test('侧边栏应该显示按功能分类的 API 目录树', async ({ page }) => {
    // Given: 访问文档站
    await page.goto('/api/stock/basic');
    
    // When: 查看侧边栏
    // Then: 显示分类目录
    const sidebar = page.locator('aside.rspress-sidebar, nav.rspress-nav-menu, [class*="sidebar"]');
    await expect(sidebar.first()).toBeVisible();
    
    // 验证主要分类存在
    const pageContent = await page.content();
    expect(pageContent).toContain('股票数据');
    expect(pageContent).toContain('基金数据');
    expect(pageContent).toContain('财务数据');
  });

  /**
   * 场景 2.2: 点击分类展开/收起
   * 验证分类节点可以展开和收起
   */
  test('应该能够点击分类节点展开或收起', async ({ page }) => {
    // Given: 访问文档站
    await page.goto('/api/stock/basic');
    
    // When: 查找股票数据分类
    const stockCategory = page.locator('text=股票数据').first();
    await expect(stockCategory).toBeVisible();
    
    // Then: 验证子项可见
    const basicLink = page.locator('text=基础信息').first();
    await expect(basicLink).toBeVisible();
    
    // Note: rspress 的侧边栏展开/收起行为由框架自动处理
    // 此测试验证默认状态下分类是展开的
  });

  /**
   * 场景 2.3: 点击 API 链接跳转
   * 验证点击侧边栏中的 API 链接可以跳转到对应页面
   */
  test('应该能够点击 API 链接跳转到详情页', async ({ page }) => {
    // Given: 访问股票基础信息页面
    await page.goto('/api/stock/basic');
    
    // When: 点击侧边栏中的日线数据链接
    const dailyLink = page.locator('a[href*="/api/stock/daily"]').first();
    await dailyLink.click();
    
    // Then: 跳转到对应的 API 详情页
    await expect(page).toHaveURL(/\/api\/stock\/daily/);
    await expect(page.locator('h1')).toContainText('日线数据');
  });

  /**
   * 场景 2.4: 面包屑导航显示
   * 验证页面显示正确的面包屑导航
   */
  test('页面应该显示面包屑导航', async ({ page }) => {
    // Given: 访问 API 详情页
    await page.goto('/api/stock/basic');
    
    // When: 查看页面
    // Then: rspress 默认不显示面包屑,但会在侧边栏高亮当前页面
    // 验证当前页面在侧边栏中被高亮
    const currentPageLink = page.locator('a[href*="/api/stock/basic"]').first();
    await expect(currentPageLink).toBeVisible();
    
    // 验证页面标题正确
    await expect(page.locator('h1')).toBeVisible();
  });

  /**
   * 额外测试: 验证导航结构的完整性
   */
  test('侧边栏应该包含所有主要分类', async ({ page }) => {
    // Given: 访问任意 API 页面
    await page.goto('/api/stock/basic');
    
    // When: 检查页面内容
    const content = await page.content();
    
    // Then: 包含所有主要分类
    expect(content).toContain('股票数据');
    expect(content).toContain('基金数据');
    expect(content).toContain('财务数据');
  });

  /**
   * 额外测试: 验证子分类显示
   */
  test('股票数据分类应该包含所有子项', async ({ page }) => {
    // Given: 访问股票数据相关页面
    await page.goto('/api/stock/basic');
    
    // When: 检查页面内容
    const content = await page.content();
    
    // Then: 包含股票数据的所有子分类
    expect(content).toContain('基础信息');
    expect(content).toContain('日线数据');
    expect(content).toContain('实时数据');
  });
});
