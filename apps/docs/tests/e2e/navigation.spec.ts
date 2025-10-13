/**
 * 导航功能测试
 *
 * 验证顶部导航栏和侧边栏的所有链接可以正常跳转
 * User Story 2: 验证导航栏和侧边栏功能 (优先级: P1)
 */

import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home-page';
import { GuidePage } from './pages/guide-page';
import { ApiPage } from './pages/api-page';
import { ChangelogPage } from './pages/changelog-page';

test.describe('导航功能测试', () => {
  test('从首页点击 "指南" 链接,验证跳转到指南页', async ({ page }) => {
    // Given: 创建首页对象并访问
    const homePage = new HomePage(page);
    await homePage.goto();

    // When: 点击顶部导航栏的 "指南" 链接
    await homePage.clickNavLink('指南');

    // Then: 验证跳转到指南页
    await expect(page).toHaveURL(/\/guide/);
  });

  test('从首页点击 "API 文档" 链接,验证跳转到 API 页', async ({ page }) => {
    // Given: 创建首页对象并访问
    const homePage = new HomePage(page);
    await homePage.goto();

    // When: 点击顶部导航栏的 "API 文档" 链接 (使用完整文本)
    await homePage.clickNavLink('API 文档');

    // Then: 验证跳转到 API 页
    await expect(page).toHaveURL(/\/api/);
  });

  test('从首页点击 "更新日志" 链接,验证跳转到更新日志页', async ({ page }) => {
    // Given: 创建首页对象并访问
    const homePage = new HomePage(page);
    await homePage.goto();

    // When: 点击顶部导航栏的 "更新日志" 链接
    await homePage.clickNavLink('更新日志');

    // Then: 验证跳转到更新日志页
    await expect(page).toHaveURL(/\/changelog/);
  });

  test('在API文档页验证侧边栏显示 "股票数据" 和 "交易相关" 分类', async ({ page }) => {
    // Given: 创建API页对象并访问股票基础信息页
    const apiPage = new ApiPage(page);
    await apiPage.gotoStockBasic();

    // When: 等待侧边栏加载并检查分类
    const sidebar = page.locator('aside nav, aside.rspress-sidebar nav, [role="complementary"] nav');
    await sidebar.waitFor({ state: 'visible', timeout: 10000 });

    // Then: 验证侧边栏包含这些分类
    const sidebarText = await sidebar.textContent();
    expect(sidebarText).toContain('股票数据');
    expect(sidebarText).toContain('交易相关');
  }, { timeout: 60000 });

  test('在 /api/stock/basic 页点击侧边栏 "日线数据" 链接,验证跳转到 /api/stock/daily', async ({
    page,
  }) => {
    // Given: 创建API页对象并访问股票基础信息页
    const apiPage = new ApiPage(page);
    await apiPage.gotoStockBasic();

    // When: 点击侧边栏 "日线数据" 链接
    await apiPage.clickSidebarLink('日线数据');

    // Then: 验证跳转到日线数据页
    await expect(page).toHaveURL(/\/api\/stock\/daily/);
  });

  test('在 /api/stock/basic 页点击侧边栏 "交易日历" 链接,验证跳转到 /api/calendar', async ({
    page,
  }) => {
    // Given: 创建API页对象并访问股票基础信息页
    const apiPage = new ApiPage(page);
    await apiPage.gotoStockBasic();

    // When: 点击侧边栏 "交易日历" 链接
    await apiPage.clickSidebarLink('交易日历');

    // Then: 验证跳转到交易日历页
    await expect(page).toHaveURL(/\/api\/calendar/);
  });

  test('在指南页验证侧边栏显示 "安装"、"快速开始"、"配置"、"错误处理" 链接', async ({
    page,
  }) => {
    // Given: 创建指南页对象并访问安装页
    const guidePage = new GuidePage(page);
    await guidePage.gotoInstallation();

    // When/Then: 验证侧边栏包含所有链接
    // 使用 locator 直接验证链接是否可见
    const sidebar = page.locator('aside nav, aside.rspress-sidebar nav, complementary nav');

    // 验证包含 "安装" 链接
    await expect(sidebar.locator('a:has-text("安装")')).toBeVisible();

    // 验证包含 "快速开始" 或 "快速入门" 链接
    const quickStartLink = sidebar.locator('a').filter({ hasText: /快速(开始|入门)/ });
    await expect(quickStartLink.first()).toBeVisible();

    // 验证包含 "配置" 链接
    await expect(sidebar.locator('a:has-text("配置")')).toBeVisible();

    // 验证包含 "错误处理" 链接
    await expect(sidebar.locator('a:has-text("错误处理")')).toBeVisible();
  });

  test('在 /guide/installation 页点击侧边栏 "快速开始" 链接,验证跳转到 /guide/quick-start', async ({
    page,
  }) => {
    // Given: 创建指南页对象并访问安装页
    const guidePage = new GuidePage(page);
    await guidePage.gotoInstallation();

    // When: 点击侧边栏 "快速开始" 链接
    await guidePage.clickSidebarLink('快速开始');

    // Then: 验证跳转到快速入门页
    await expect(page).toHaveURL(/\/guide\/quick-start/);
  });
});
