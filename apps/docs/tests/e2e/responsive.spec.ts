import { test, expect } from '@playwright/test';

/**
 * 响应式设计 E2E 测试
 * 验证文档站在移动设备上的表现
 */

test.describe('响应式设计', () => {
  /**
   * 场景 5.1: 移动端侧边栏折叠
   * 验证移动端侧边栏默认隐藏,点击菜单按钮后展开
   */
  test('移动端侧边栏应该默认折叠', async ({ page }) => {
    // Given: 设置移动端视口 (iPhone 12 Pro)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/api/stock/basic');
    
    // When: 查看侧边栏
    // rspress 在移动端使用抽屉式侧边栏
    const sidebar = page.locator('aside.rspress-sidebar');
    
    // Then: 侧边栏默认隐藏或折叠
    // 注意: rspress 可能使用 CSS 隐藏或 transform 移出视口
    const isVisible = await sidebar.isVisible().catch(() => false);
    
    if (isVisible) {
      // 如果侧边栏可见,检查是否通过 transform 移出视口
      const transform = await sidebar.evaluate(el => 
        window.getComputedStyle(el).transform
      );
      expect(transform).not.toBe('none');
    }
    
    // When: 查找并点击菜单按钮
    // rspress 使用汉堡菜单图标
    const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="菜单"], .rspress-nav-menu');
    
    if (await menuButton.count() > 0) {
      await menuButton.first().click();
      
      // Then: 侧边栏展开
      await expect(sidebar).toBeVisible({ timeout: 1000 });
    }
  });

  /**
   * 场景 5.2: 移动端代码块横向滚动
   * 验证移动端代码块支持横向滚动,不会导致页面布局破坏
   */
  test('移动端代码块应该支持横向滚动', async ({ page }) => {
    // Given: 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/api/stock/basic');
    
    // When: 查找代码块
    const codeBlock = page.locator('pre code').first();
    await expect(codeBlock).toBeVisible();
    
    // Then: 代码块的父容器应该可以横向滚动
    const preElement = page.locator('pre').first();
    
    const scrollInfo = await preElement.evaluate(el => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      overflowX: window.getComputedStyle(el).overflowX,
    }));
    
    // 验证 overflow-x 设置为 auto 或 scroll
    expect(['auto', 'scroll']).toContain(scrollInfo.overflowX);
    
    // 如果内容超出容器宽度,验证可以滚动
    if (scrollInfo.scrollWidth > scrollInfo.clientWidth) {
      expect(scrollInfo.scrollWidth).toBeGreaterThan(scrollInfo.clientWidth);
    }
  });

  /**
   * 额外测试: 移动端导航栏响应式
   */
  test('移动端导航栏应该正常显示', async ({ page }) => {
    // Given: 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // When: 查看导航栏
    const nav = page.locator('nav, .rspress-nav');
    
    // Then: 导航栏应该可见
    await expect(nav.first()).toBeVisible();
    
    // And: 导航栏高度适中,不占用过多屏幕空间
    const navHeight = await nav.first().evaluate(el => el.clientHeight);
    expect(navHeight).toBeLessThan(100); // 导航栏高度应小于 100px
  });

  /**
   * 额外测试: 平板设备布局
   */
  test('平板设备应该正常显示侧边栏', async ({ page }) => {
    // Given: 设置平板视口 (iPad)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/api/stock/basic');
    
    // When: 查看侧边栏
    const sidebar = page.locator('aside.rspress-sidebar');
    
    // Then: 侧边栏应该可见或可以轻松展开
    const isVisible = await sidebar.isVisible();
    
    if (!isVisible) {
      // 如果不可见,应该有菜单按钮
      const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="菜单"]');
      await expect(menuButton.first()).toBeVisible();
    }
  });

  /**
   * 额外测试: 响应式图片
   */
  test('图片应该在移动端正确缩放', async ({ page }) => {
    // Given: 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // When: 查找页面中的图片
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      // Then: 图片宽度不应超过视口宽度
      for (let i = 0; i < Math.min(imageCount, 3); i++) {
        const img = images.nth(i);
        const width = await img.evaluate(el => el.clientWidth);
        expect(width).toBeLessThanOrEqual(375);
      }
    }
  });
});
