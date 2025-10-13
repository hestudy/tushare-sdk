/**
 * 财务数据文档导航测试
 *
 * 验证用户能够从文档首页导航到财务数据章节,并能正确访问三大财务报表文档
 * User Story 1: 快速上手财务数据 API (优先级: P1) 🎯 MVP
 *
 * 测试场景:
 * - T008: 从文档首页导航到财务数据章节
 * - T009: 导航到利润表文档页面
 * - T010: 导航到资产负债表文档页面
 * - T011: 导航到现金流量表文档页面
 * - T012: 在三大报表文档间交叉导航
 * - T013: 验证相关 API 链接可用
 */

import { test, expect } from '@playwright/test';
import { ApiPage } from './pages/api-page';
import { HomePage } from './pages/home-page';

test.describe('财务数据文档导航测试', () => {
  test('T008: 从文档首页导航到财务数据章节', async ({ page }) => {
    // Given: 访问文档首页
    const homePage = new HomePage(page);
    await homePage.goto();

    // When: 点击 "API 文档" 导航链接
    await homePage.clickNavLink('API 文档');

    // Then: 验证跳转到 API 文档页面
    await expect(page).toHaveURL(/\/api/);

    // And: 验证侧边栏包含 "财务数据" 分类
    const sidebar = page.locator('aside nav, aside.rspress-sidebar nav, [role="complementary"] nav');
    await sidebar.waitFor({ state: 'visible', timeout: 10000 });
    const sidebarText = await sidebar.textContent();
    expect(sidebarText).toContain('财务数据');
  });

  test('T009: 导航到利润表文档页面', async ({ page }) => {
    // Given: 创建 API 页面对象
    const apiPage = new ApiPage(page);

    // When: 直接访问利润表文档
    await apiPage.gotoApiPage('finance/income');

    // Then: 验证 URL 正确
    await expect(page).toHaveURL(/\/api\/finance\/income/);

    // And: 验证页面包含 "利润表" 或 "income" 关键词
    const content = await page.locator('body').textContent();
    expect(content).toMatch(/利润表|income/i);
  });

  test('T010: 导航到资产负债表文档页面', async ({ page }) => {
    // Given: 创建 API 页面对象
    const apiPage = new ApiPage(page);

    // When: 直接访问资产负债表文档
    await apiPage.gotoApiPage('finance/balance');

    // Then: 验证 URL 正确
    await expect(page).toHaveURL(/\/api\/finance\/balance/);

    // And: 验证页面包含 "资产负债表" 或 "balance" 关键词
    const content = await page.locator('body').textContent();
    expect(content).toMatch(/资产负债表|balance/i);
  });

  test('T011: 导航到现金流量表文档页面', async ({ page }) => {
    // Given: 创建 API 页面对象
    const apiPage = new ApiPage(page);

    // When: 直接访问现金流量表文档
    await apiPage.gotoApiPage('finance/cashflow');

    // Then: 验证 URL 正确
    await expect(page).toHaveURL(/\/api\/finance\/cashflow/);

    // And: 验证页面包含 "现金流量表" 或 "cashflow" 关键词
    const content = await page.locator('body').textContent();
    expect(content).toMatch(/现金流量表|cashflow|cash.*flow/i);
  });

  test('T012: 在三大报表文档间交叉导航 - 从利润表到资产负债表', async ({ page }) => {
    // Given: 访问利润表文档
    const apiPage = new ApiPage(page);
    await apiPage.gotoApiPage('finance/income');
    await expect(page).toHaveURL(/\/api\/finance\/income/);

    // When: 点击侧边栏中的 "资产负债表" 链接
    await apiPage.clickSidebarLink('资产负债表');

    // Then: 验证跳转到资产负债表文档
    await expect(page).toHaveURL(/\/api\/finance\/balance/);
  });

  test('T012: 在三大报表文档间交叉导航 - 从资产负债表到现金流量表', async ({ page }) => {
    // Given: 访问资产负债表文档
    const apiPage = new ApiPage(page);
    await apiPage.gotoApiPage('finance/balance');
    await expect(page).toHaveURL(/\/api\/finance\/balance/);

    // When: 点击侧边栏中的 "现金流量表" 链接
    await apiPage.clickSidebarLink('现金流量表');

    // Then: 验证跳转到现金流量表文档
    await expect(page).toHaveURL(/\/api\/finance\/cashflow/);
  });

  test('T012: 在三大报表文档间交叉导航 - 从现金流量表到利润表', async ({ page }) => {
    // Given: 访问现金流量表文档
    const apiPage = new ApiPage(page);
    await apiPage.gotoApiPage('finance/cashflow');
    await expect(page).toHaveURL(/\/api\/finance\/cashflow/);

    // When: 点击侧边栏中的 "利润表" 链接
    await apiPage.clickSidebarLink('利润表');

    // Then: 验证跳转到利润表文档
    await expect(page).toHaveURL(/\/api\/finance\/income/);
  });

  test('T013: 验证相关 API 链接可用 - 现金流量表页面的相关链接', async ({ page }) => {
    // Given: 访问现金流量表文档
    const apiPage = new ApiPage(page);
    await apiPage.gotoApiPage('finance/cashflow');

    // When: 查找 "相关 API" 或 "相关" 章节
    const relatedSection = page.locator('h2, h3').filter({
      hasText: /相关.*API|相关/,
    });

    // Then: 如果存在相关 API 章节,验证链接可点击
    const count = await relatedSection.count();
    if (count > 0) {
      // 查找该章节下的所有链接
      const links = page.locator('a[href*="/api/finance"]');
      const linkCount = await links.count();

      // 验证至少有 1 个相关链接
      expect(linkCount).toBeGreaterThanOrEqual(1);

      // 验证第一个链接可以点击
      if (linkCount > 0) {
        const firstLink = links.first();
        await expect(firstLink).toBeVisible();
      }
    }
  });

  test('T013: 验证利润表和资产负债表文档中存在相关链接', async ({ page }) => {
    // Test 1: 验证利润表文档
    const apiPage = new ApiPage(page);
    await apiPage.gotoApiPage('finance/income');

    // 验证页面中是否包含指向其他财务报表的链接
    const incomeLinks = page.locator('a[href*="/api/finance"]');
    const incomeLinkCount = await incomeLinks.count();
    expect(incomeLinkCount).toBeGreaterThan(0);

    // Test 2: 验证资产负债表文档
    await apiPage.gotoApiPage('finance/balance');

    // 验证页面中是否包含指向其他财务报表的链接
    const balanceLinks = page.locator('a[href*="/api/finance"]');
    const balanceLinkCount = await balanceLinks.count();
    expect(balanceLinkCount).toBeGreaterThan(0);
  });
});
