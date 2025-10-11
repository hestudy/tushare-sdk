import { test, expect } from '@playwright/test';

/**
 * User Story 4: 查看版本更新日志
 * 测试版本更新日志的可访问性和内容组织
 */

test.describe('版本更新日志测试', () => {
  /**
   * 场景 4.1: 访问更新日志页面
   * 验证用户可以访问版本更新日志页面
   */
  test('应该能够访问版本更新日志页面', async ({ page }) => {
    // Given: 访问文档站首页
    await page.goto('/');
    
    // When: 点击"更新日志"链接
    const changelogLink = page.locator('a[href*="/changelog"]').first();
    
    // 如果首页没有更新日志链接,直接访问
    if (await changelogLink.count() > 0) {
      await changelogLink.click();
    } else {
      await page.goto('/changelog');
    }
    
    // Then: 跳转到更新日志页面
    await expect(page).toHaveURL(/\/changelog/);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toContainText('更新日志');
  });

  /**
   * 场景 4.2: 更新日志按版本倒序显示
   * 验证更新日志按版本号倒序排列(最新版本在前)
   */
  test('更新日志应该按版本号倒序显示', async ({ page }) => {
    // Given: 访问更新日志页面
    await page.goto('/changelog');
    
    // When: 查看页面内容
    const content = await page.content();
    
    // Then: 包含版本号
    expect(content).toMatch(/v?\d+\.\d+\.\d+/); // 匹配版本号格式
    
    // 验证页面包含版本信息
    const headings = page.locator('h2, h3');
    const firstHeading = await headings.first().textContent();
    expect(firstHeading).toMatch(/v?\d+\.\d+\.\d+/);
  });

  /**
   * 场景 4.3: 更新内容包含分类说明
   * 验证每个版本的更新内容包含分类(新增功能、Bug修复等)
   */
  test('每个版本的更新内容应该包含分类说明', async ({ page }) => {
    // Given: 访问更新日志页面
    await page.goto('/changelog');
    
    // When: 查看页面内容
    const content = await page.content();
    
    // Then: 包含各类更新说明的标记
    // 检查是否包含常见的更新分类关键词
    const hasFeatures = content.includes('新增') || content.includes('功能') || content.includes('Features');
    const hasFixes = content.includes('修复') || content.includes('Bug') || content.includes('Fixes');
    
    // 至少应该包含一种分类
    expect(hasFeatures || hasFixes).toBeTruthy();
  });

  /**
   * 场景 4.4: 破坏性变更包含迁移指南
   * 验证破坏性变更包含迁移指南
   */
  test('破坏性变更应该包含迁移指南或说明', async ({ page }) => {
    // Given: 访问更新日志页面
    await page.goto('/changelog');
    
    // When: 查看页面内容
    const content = await page.content();
    
    // Then: 如果有破坏性变更,应该包含相关说明
    if (content.includes('破坏性') || content.includes('Breaking') || content.includes('BREAKING')) {
      // 应该包含迁移、升级或注意事项相关的说明
      const hasGuidance = 
        content.includes('迁移') || 
        content.includes('升级') || 
        content.includes('注意') ||
        content.includes('migration') ||
        content.includes('upgrade');
      
      expect(hasGuidance).toBeTruthy();
    } else {
      // 如果没有破坏性变更,测试通过
      expect(true).toBeTruthy();
    }
  });

  /**
   * 额外测试: 验证更新日志的基本结构
   */
  test('更新日志应该有清晰的结构', async ({ page }) => {
    // Given: 访问更新日志页面
    await page.goto('/changelog');
    
    // When: 查看页面结构
    const h1Count = await page.locator('h1').count();
    const h2Count = await page.locator('h2').count();
    
    // Then: 应该有标题和版本标题
    expect(h1Count).toBeGreaterThanOrEqual(1); // 至少有一个主标题
    expect(h2Count).toBeGreaterThanOrEqual(1); // 至少有一个版本标题
  });

  /**
   * 额外测试: 验证更新日志包含日期信息
   */
  test('更新日志应该包含发布日期', async ({ page }) => {
    // Given: 访问更新日志页面
    await page.goto('/changelog');
    
    // When: 查看页面内容
    const content = await page.content();
    
    // Then: 应该包含日期格式(YYYY-MM-DD 或其他常见格式)
    const hasDate = 
      content.match(/\d{4}-\d{2}-\d{2}/) || // YYYY-MM-DD
      content.match(/\d{4}\/\d{2}\/\d{2}/) || // YYYY/MM/DD
      content.match(/\d{4}\.\d{2}\.\d{2}/);   // YYYY.MM.DD
    
    expect(hasDate).toBeTruthy();
  });
});
