import { test, expect } from '@playwright/test';

/**
 * User Story 3: 查看快速入门指南
 * 测试快速入门指南的可访问性和内容完整性
 */

test.describe('快速入门指南测试', () => {
  /**
   * 场景 3.1: 访问快速入门页面
   * 验证用户可以通过导航访问快速入门指南
   */
  test('应该能够访问快速入门指南页面', async ({ page }) => {
    // Given: 访问文档站首页
    await page.goto('/');
    
    // When: 点击"快速入门"或"指南"链接
    const guideLink = page.locator('a[href*="/guide"]').first();
    await guideLink.click();
    
    // Then: 跳转到快速入门页面
    await expect(page).toHaveURL(/\/guide/);
    await expect(page.locator('h1')).toBeVisible();
  });

  /**
   * 场景 3.2: 快速入门页面包含完整内容
   * 验证快速入门页面包含安装、配置和示例代码
   */
  test('快速入门页面应该包含安装、配置和示例代码', async ({ page }) => {
    // Given: 访问快速入门页面
    await page.goto('/guide/quick-start');
    
    // When: 查看页面内容
    const content = await page.content();
    
    // Then: 包含所有必要部分
    expect(content).toContain('安装');
    expect(content).toContain('npm');
    expect(content).toContain('pnpm');
    
    // And: 包含配置说明
    expect(content).toContain('配置');
    
    // And: 包含代码示例
    const codeBlocks = page.locator('pre code');
    await expect(codeBlocks.first()).toBeVisible();
    
    // 验证代码示例包含 import 语句
    const firstCodeBlock = await codeBlocks.first().textContent();
    expect(firstCodeBlock).toContain('import');
  });

  /**
   * 场景 3.3: 引导到 API 文档
   * 验证快速入门完成后引导用户查看 API 文档
   */
  test('快速入门完成后应该引导用户查看 API 文档', async ({ page }) => {
    // Given: 访问快速入门页面
    await page.goto('/guide/quick-start');
    
    // When: 查看页面内容
    const content = await page.content();
    
    // Then: 包含指向 API 文档的链接
    expect(content).toContain('API');
    
    // 验证存在指向 API 文档的链接
    const apiLinks = page.locator('a[href*="/api"]');
    await expect(apiLinks.first()).toBeVisible();
  });

  /**
   * 额外测试: 验证安装指南页面
   */
  test('安装指南页面应该包含详细的安装步骤', async ({ page }) => {
    // Given: 访问安装指南页面
    await page.goto('/guide/installation');
    
    // When: 查看页面内容
    const content = await page.content();
    
    // Then: 包含安装命令
    expect(content).toContain('npm install');
    expect(content).toContain('@tushare/sdk');
  });

  /**
   * 额外测试: 验证配置说明页面
   */
  test('配置说明页面应该包含 API Token 配置方法', async ({ page }) => {
    // Given: 访问配置说明页面
    await page.goto('/guide/configuration');
    
    // When: 查看页面内容
    const content = await page.content();
    
    // Then: 包含配置相关内容
    expect(content).toContain('token');
    expect(content).toContain('API');
  });

  /**
   * 额外测试: 验证导航结构
   */
  test('指南分类应该在侧边栏中可见', async ({ page }) => {
    // Given: 访问任意指南页面
    await page.goto('/guide/installation');
    
    // When: 查看页面内容
    const content = await page.content();
    
    // Then: 侧边栏包含指南分类
    expect(content).toContain('安装');
    expect(content).toContain('快速开始');
    expect(content).toContain('配置');
  });
});
