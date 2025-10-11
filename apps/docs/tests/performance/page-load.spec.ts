import { test, expect } from '@playwright/test';

/**
 * 页面加载性能测试
 * 验证文档站的页面加载时间符合性能要求 (< 2s)
 */

test.describe('页面加载性能', () => {
  /**
   * 测试首页加载时间
   * 要求: 加载时间 < 2000ms (SC-002)
   */
  test('首页加载时间应该小于 2 秒', async ({ page }) => {
    // Given: 准备测量加载时间
    const startTime = Date.now();
    
    // When: 访问首页
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Then: 计算加载时间
    const loadTime = Date.now() - startTime;
    
    console.log(`首页加载时间: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(2000);
  });

  /**
   * 测试 API 详情页加载时间
   * 要求: 加载时间 < 2000ms (SC-002)
   */
  test('API 详情页加载时间应该小于 2 秒', async ({ page }) => {
    // Given: 准备测量加载时间
    const startTime = Date.now();
    
    // When: 访问 API 详情页
    await page.goto('/api/stock/basic', { waitUntil: 'networkidle' });
    
    // Then: 计算加载时间
    const loadTime = Date.now() - startTime;
    
    console.log(`API 详情页加载时间: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(2000);
  });

  /**
   * 测试快速入门页面加载时间
   */
  test('快速入门页面加载时间应该小于 2 秒', async ({ page }) => {
    // Given: 准备测量加载时间
    const startTime = Date.now();
    
    // When: 访问快速入门页面
    await page.goto('/guide/quick-start', { waitUntil: 'networkidle' });
    
    // Then: 计算加载时间
    const loadTime = Date.now() - startTime;
    
    console.log(`快速入门页面加载时间: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(2000);
  });

  /**
   * 测试更新日志页面加载时间
   */
  test('更新日志页面加载时间应该小于 2 秒', async ({ page }) => {
    // Given: 准备测量加载时间
    const startTime = Date.now();
    
    // When: 访问更新日志页面
    await page.goto('/changelog/', { waitUntil: 'networkidle' });
    
    // Then: 计算加载时间
    const loadTime = Date.now() - startTime;
    
    console.log(`更新日志页面加载时间: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(2000);
  });

  /**
   * 测试页面首次内容绘制 (FCP)
   * 使用 Performance API 测量
   */
  test('首页 FCP 应该小于 1.5 秒', async ({ page }) => {
    // When: 访问首页
    await page.goto('/');
    
    // Then: 获取 FCP 指标
    const fcp = await page.evaluate(() => {
      const entries = performance.getEntriesByType('paint');
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
      return fcpEntry ? fcpEntry.startTime : 0;
    });
    
    console.log(`首页 FCP: ${fcp}ms`);
    expect(fcp).toBeLessThan(1500);
  });

  /**
   * 测试最大内容绘制 (LCP)
   * 使用 PerformanceObserver API
   */
  test('首页 LCP 应该小于 2.5 秒', async ({ page }) => {
    // When: 访问首页并监听 LCP
    await page.goto('/');
    
    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let lcpValue = 0;
        
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          lcpValue = lastEntry.renderTime || lastEntry.loadTime;
        });
        
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
        
        // 等待 2 秒后返回结果
        setTimeout(() => {
          observer.disconnect();
          resolve(lcpValue);
        }, 2000);
      });
    });
    
    console.log(`首页 LCP: ${lcp}ms`);
    expect(lcp).toBeLessThan(2500);
  });

  /**
   * 测试累积布局偏移 (CLS)
   * 验证页面加载过程中没有明显的布局抖动
   */
  test('首页 CLS 应该小于 0.1', async ({ page }) => {
    // When: 访问首页并监听 CLS
    await page.goto('/');
    
    // 等待页面完全加载
    await page.waitForLoadState('networkidle');
    
    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0;
        
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
        });
        
        observer.observe({ type: 'layout-shift', buffered: true });
        
        // 等待 1 秒后返回结果
        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 1000);
      });
    });
    
    console.log(`首页 CLS: ${cls}`);
    expect(cls).toBeLessThan(0.1);
  });

  /**
   * 测试资源加载数量
   * 验证页面不会加载过多资源
   */
  test('首页加载的资源数量应该合理', async ({ page }) => {
    // Given: 监听所有网络请求
    const requests: string[] = [];
    
    page.on('request', request => {
      requests.push(request.url());
    });
    
    // When: 访问首页
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Then: 资源数量应该合理 (< 50 个)
    console.log(`首页加载资源数量: ${requests.length}`);
    expect(requests.length).toBeLessThan(50);
  });

  /**
   * 测试 JavaScript 包大小
   * 验证 JS 包不会过大
   */
  test('JavaScript 包总大小应该合理', async ({ page }) => {
    // Given: 监听 JS 文件请求
    let totalJsSize = 0;
    
    page.on('response', async response => {
      const url = response.url();
      if (url.endsWith('.js')) {
        try {
          const buffer = await response.body();
          totalJsSize += buffer.length;
        } catch (error) {
          // 忽略无法获取 body 的响应
        }
      }
    });
    
    // When: 访问首页
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Then: JS 总大小应该 < 500KB (压缩后)
    const totalJsSizeKB = totalJsSize / 1024;
    console.log(`JavaScript 包总大小: ${totalJsSizeKB.toFixed(2)} KB`);
    expect(totalJsSizeKB).toBeLessThan(500);
  });
});
