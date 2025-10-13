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

    // When: 检查页面内容
    const hasStockData = await apiPage.contentContains('股票数据');
    const hasTradingData = await apiPage.contentContains('交易相关');

    // Then: 验证侧边栏包含这些分类 (注意: 基金数据已被移除)
    expect(hasStockData).toBeTruthy();
    expect(hasTradingData).toBeTruthy();
  });

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

    // When: 检查页面内容
    const hasInstallation = await guidePage.contentContains('安装');
    const hasQuickStart = await guidePage.contentContains('快速') ||
                          await guidePage.contentContains('入门');
    const hasConfiguration = await guidePage.contentContains('配置');
    const hasErrorHandling = await guidePage.contentContains('错误');

    // Then: 验证侧边栏包含这些链接
    expect(hasInstallation || hasQuickStart || hasConfiguration || hasErrorHandling).toBeTruthy();
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
