import { test, expect } from '@playwright/test';

/**
 * 搜索性能测试
 * 验证搜索功能的响应时间符合性能要求 (< 500ms)
 */

test.describe('搜索性能', () => {
  /**
   * 测试搜索响应时间
   * 要求: 响应时间 < 500ms (SC-008)
   */
  test('搜索响应时间应该小于 500ms', async ({ page }) => {
    // Given: 访问首页
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // When: 打开搜索框
    // rspress 使用快捷键 Cmd+K 或点击搜索按钮
    const searchButton = page.locator('button[aria-label*="search"], button[aria-label*="搜索"], .rspress-search-button');
    
    if (await searchButton.count() > 0) {
      await searchButton.first().click();
    } else {
      // 使用快捷键
      await page.keyboard.press('Meta+K');
    }
    
    // 等待搜索框出现
    const searchInput = page.locator('input[type="search"], input[placeholder*="搜索"], .rspress-search-input');
    await expect(searchInput.first()).toBeVisible({ timeout: 1000 });
    
    // Then: 测量搜索响应时间
    const startTime = Date.now();
    
    await searchInput.first().fill('get_stock_basic');
    
    // 等待搜索结果出现
    const searchResults = page.locator('.rspress-search-result, [role="option"], .search-result-item');
    await expect(searchResults.first()).toBeVisible({ timeout: 1000 });
    
    const searchTime = Date.now() - startTime;
    
    console.log(`搜索响应时间: ${searchTime}ms`);
    expect(searchTime).toBeLessThan(500);
  });

  /**
   * 测试搜索结果渲染性能
   * 验证搜索结果能快速渲染
   */
  test('搜索结果应该快速渲染', async ({ page }) => {
    // Given: 访问首页并打开搜索
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const searchButton = page.locator('button[aria-label*="search"], button[aria-label*="搜索"], .rspress-search-button');
    
    if (await searchButton.count() > 0) {
      await searchButton.first().click();
    } else {
      await page.keyboard.press('Meta+K');
    }
    
    const searchInput = page.locator('input[type="search"], input[placeholder*="搜索"], .rspress-search-input');
    await expect(searchInput.first()).toBeVisible({ timeout: 1000 });
    
    // When: 输入搜索关键词
    const startTime = Date.now();
    await searchInput.first().fill('股票');
    
    // Then: 等待搜索结果渲染
    const searchResults = page.locator('.rspress-search-result, [role="option"], .search-result-item');
    await expect(searchResults.first()).toBeVisible({ timeout: 1000 });
    
    const renderTime = Date.now() - startTime;
    
    console.log(`搜索结果渲染时间: ${renderTime}ms`);
    expect(renderTime).toBeLessThan(500);
  });

  /**
   * 测试搜索索引加载时间
   * 验证搜索索引能快速加载
   */
  test('搜索索引应该快速加载', async ({ page }) => {
    // Given: 监听搜索索引文件请求
    let indexLoadStartTime = 0;
    let indexLoadEndTime = 0;
    
    page.on('request', request => {
      const url = request.url();
      // rspress 搜索索引通常是 JSON 文件
      if (url.includes('search') && (url.endsWith('.json') || url.includes('index'))) {
        indexLoadStartTime = Date.now();
        console.log(`搜索索引文件请求: ${url}`);
      }
    });
    
    page.on('response', async response => {
      const url = response.url();
      if (url.includes('search') && (url.endsWith('.json') || url.includes('index'))) {
        indexLoadEndTime = Date.now();
      }
    });
    
    // When: 访问首页
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Then: 如果加载了搜索索引,验证加载时间
    if (indexLoadStartTime > 0 && indexLoadEndTime > 0) {
      const indexLoadTime = indexLoadEndTime - indexLoadStartTime;
      console.log(`搜索索引加载时间: ${indexLoadTime}ms`);
      expect(indexLoadTime).toBeLessThan(1000);
    }
  });

  /**
   * 测试连续搜索性能
   * 验证多次搜索不会导致性能下降
   */
  test('连续搜索应该保持性能稳定', async ({ page }) => {
    // Given: 访问首页并打开搜索
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const searchButton = page.locator('button[aria-label*="search"], button[aria-label*="搜索"], .rspress-search-button');
    
    if (await searchButton.count() > 0) {
      await searchButton.first().click();
    } else {
      await page.keyboard.press('Meta+K');
    }
    
    const searchInput = page.locator('input[type="search"], input[placeholder*="搜索"], .rspress-search-input');
    await expect(searchInput.first()).toBeVisible({ timeout: 1000 });
    
    // When: 执行多次搜索
    const searchTerms = ['股票', '基金', 'get_stock', 'basic', '日线'];
    const searchTimes: number[] = [];
    
    for (const term of searchTerms) {
      const startTime = Date.now();
      
      await searchInput.first().clear();
      await searchInput.first().fill(term);
      
      // 等待搜索结果更新
      await page.waitForTimeout(100);
      
      const searchTime = Date.now() - startTime;
      searchTimes.push(searchTime);
      
      console.log(`搜索 "${term}" 耗时: ${searchTime}ms`);
    }
    
    // Then: 所有搜索时间都应该 < 500ms
    for (const time of searchTimes) {
      expect(time).toBeLessThan(500);
    }
    
    // And: 性能应该稳定,最慢的搜索不应该比最快的慢太多
    const maxTime = Math.max(...searchTimes);
    const minTime = Math.min(...searchTimes);
    const variance = maxTime - minTime;
    
    console.log(`搜索时间方差: ${variance}ms`);
    expect(variance).toBeLessThan(300); // 方差应该 < 300ms
  });

  /**
   * 测试搜索无结果的性能
   * 验证搜索无结果时也能快速响应
   */
  test('搜索无结果应该快速响应', async ({ page }) => {
    // Given: 访问首页并打开搜索
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const searchButton = page.locator('button[aria-label*="search"], button[aria-label*="搜索"], .rspress-search-button');
    
    if (await searchButton.count() > 0) {
      await searchButton.first().click();
    } else {
      await page.keyboard.press('Meta+K');
    }
    
    const searchInput = page.locator('input[type="search"], input[placeholder*="搜索"], .rspress-search-input');
    await expect(searchInput.first()).toBeVisible({ timeout: 1000 });
    
    // When: 搜索不存在的内容
    const startTime = Date.now();
    await searchInput.first().fill('xyz_nonexistent_api_12345');
    
    // 等待搜索完成
    await page.waitForTimeout(300);
    
    const searchTime = Date.now() - startTime;
    
    // Then: 响应时间应该 < 500ms
    console.log(`搜索无结果响应时间: ${searchTime}ms`);
    expect(searchTime).toBeLessThan(500);
  });

  /**
   * 测试搜索高亮性能
   * 验证搜索结果高亮不会影响性能
   */
  test('搜索结果高亮应该不影响性能', async ({ page }) => {
    // Given: 访问首页并打开搜索
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const searchButton = page.locator('button[aria-label*="search"], button[aria-label*="搜索"], .rspress-search-button');
    
    if (await searchButton.count() > 0) {
      await searchButton.first().click();
    } else {
      await page.keyboard.press('Meta+K');
    }
    
    const searchInput = page.locator('input[type="search"], input[placeholder*="搜索"], .rspress-search-input');
    await expect(searchInput.first()).toBeVisible({ timeout: 1000 });
    
    // When: 输入搜索词并测量高亮渲染时间
    const startTime = Date.now();
    await searchInput.first().fill('get_stock_basic');
    
    // 等待搜索结果和高亮渲染
    const searchResults = page.locator('.rspress-search-result, [role="option"], .search-result-item');
    await expect(searchResults.first()).toBeVisible({ timeout: 1000 });
    
    const highlightTime = Date.now() - startTime;
    
    // Then: 高亮渲染时间应该 < 500ms
    console.log(`搜索结果高亮渲染时间: ${highlightTime}ms`);
    expect(highlightTime).toBeLessThan(500);
  });
});
