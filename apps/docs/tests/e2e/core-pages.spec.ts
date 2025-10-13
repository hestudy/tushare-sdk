/**
 * 核心页面可访问性测试
 *
 * 验证文档站所有核心页面能够正常访问并显示预期内容
 * User Story 1: 验证文档站核心页面可访问性 (优先级: P1)
 */

import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home-page';
import { GuidePage } from './pages/guide-page';
import { ApiPage } from './pages/api-page';
import { ChangelogPage } from './pages/changelog-page';

test.describe('核心页面可访问性测试', () => {
  test('验证首页可访问并显示 "Tushare SDK" 标题', async ({ page }) => {
    // Given: 创建首页对象
    const homePage = new HomePage(page);

    // When: 访问首页
    await homePage.goto();

    // Then: 验证页面包含 "Tushare SDK" 标题
    // rspress 首页使用 hero 组件,标题可能在特殊结构中
    const heroTitle = await homePage.getHeroTitle();
    const mainHeading = await homePage.getMainHeading();
    const titleText = heroTitle || mainHeading;

    expect(titleText).toBeTruthy();
    expect(titleText).toContain('Tushare SDK');
  });

  test('验证快速入门页显示快速入门内容和代码示例', async ({ page }) => {
    // Given: 创建指南页对象
    const guidePage = new GuidePage(page);

    // When: 访问快速入门页
    await guidePage.gotoQuickStart();

    // Then: 验证页面标题和内容
    const heading = await guidePage.getMainHeading();
    expect(heading).toBeTruthy();
    expect(heading).toMatch(/快速|Quick|入门|Start/i);

    // Then: 验证页面包含代码示例
    const hasCode = await guidePage.hasCodeExamples();
    expect(hasCode).toBeTruthy();
  });

  test('验证安装指南页显示安装命令和包名', async ({ page }) => {
    // Given: 创建指南页对象
    const guidePage = new GuidePage(page);

    // When: 访问安装指南页
    await guidePage.gotoInstallation();

    // Then: 验证页面标题
    const heading = await guidePage.getMainHeading();
    expect(heading).toBeTruthy();
    expect(heading).toMatch(/安装|Installation/i);

    // Then: 验证页面包含安装相关内容
    const hasNpm = await guidePage.contentContains('npm');
    const hasPnpm = await guidePage.contentContains('pnpm');
    const hasTushare = await guidePage.contentContains('tushare');
    const hasHestudy = await guidePage.contentContains('hestudy');

    // 至少包含 npm 或 pnpm
    expect(hasNpm || hasPnpm).toBeTruthy();
    // 包含 tushare 或 hestudy 包名
    expect(hasTushare || hasHestudy).toBeTruthy();
  }, { timeout: 60000 });

  test('验证配置指南页显示Token配置方法', async ({ page }) => {
    // Given: 创建指南页对象
    const guidePage = new GuidePage(page);

    // When: 访问配置指南页
    await guidePage.gotoConfiguration();

    // Then: 验证页面标题
    const heading = await guidePage.getMainHeading();
    expect(heading).toBeTruthy();
    expect(heading).toMatch(/配置|Configuration/i);

    // Then: 验证页面包含 Token 相关内容
    const hasToken = await guidePage.contentContains('token');
    expect(hasToken).toBeTruthy();
  }, { timeout: 60000 });

  test('验证错误处理页显示错误处理内容', async ({ page }) => {
    // Given: 创建指南页对象
    const guidePage = new GuidePage(page);

    // When: 访问错误处理页
    await guidePage.gotoErrorHandling();

    // Then: 验证页面标题
    const heading = await guidePage.getMainHeading();
    expect(heading).toBeTruthy();
    expect(heading).toMatch(/错误|Error|异常|Exception/i);

    // Then: 验证页面包含错误处理相关内容
    const hasErrorContent = await guidePage.contentContains('错误') ||
                             await guidePage.contentContains('Error') ||
                             await guidePage.contentContains('异常');
    expect(hasErrorContent).toBeTruthy();
  }, { timeout: 60000 });

  test('验证股票基础信息API页显示API文档和代码示例', async ({ page }) => {
    // Given: 创建API页对象
    const apiPage = new ApiPage(page);

    // When: 访问股票基础信息API页
    await apiPage.gotoStockBasic();

    // Then: 验证页面标题
    const heading = await apiPage.getMainHeading();
    expect(heading).toBeTruthy();

    // Then: 验证页面包含代码示例
    const hasCode = await apiPage.hasCodeExamples();
    expect(hasCode).toBeTruthy();
  });

  test('验证日线数据API页显示完整API文档', async ({ page }) => {
    // Given: 创建API页对象
    const apiPage = new ApiPage(page);

    // When: 访问日线数据API页
    await apiPage.gotoStockDaily();

    // Then: 验证页面标题
    const heading = await apiPage.getMainHeading();
    expect(heading).toBeTruthy();

    // Then: 验证页面包含API相关内容
    const hasApiContent = await apiPage.contentContains('API') ||
                          await apiPage.contentContains('接口') ||
                          await apiPage.contentContains('数据');
    expect(hasApiContent).toBeTruthy();
  }, { timeout: 60000 });

  test('验证交易日历API页显示API文档内容', async ({ page }) => {
    // Given: 创建API页对象
    const apiPage = new ApiPage(page);

    // When: 访问交易日历API页
    await apiPage.gotoCalendar();

    // Then: 验证页面标题
    const heading = await apiPage.getMainHeading();
    expect(heading).toBeTruthy();

    // Then: 验证页面包含日历相关内容
    const hasCalendarContent = await apiPage.contentContains('日历') ||
                                await apiPage.contentContains('Calendar') ||
                                await apiPage.contentContains('交易日');
    expect(hasCalendarContent).toBeTruthy();
  }, { timeout: 60000 });

  test('验证每日指标API页显示API文档内容', async ({ page }) => {
    // Given: 创建API页对象
    const apiPage = new ApiPage(page);

    // When: 访问每日指标API页
    await apiPage.gotoDailyBasic();

    // Then: 验证页面标题
    const heading = await apiPage.getMainHeading();
    expect(heading).toBeTruthy();

    // Then: 验证页面包含指标相关内容
    const hasMetricContent = await apiPage.contentContains('指标') ||
                             await apiPage.contentContains('Basic') ||
                             await apiPage.contentContains('每日');
    expect(hasMetricContent).toBeTruthy();
  }, { timeout: 60000 });

  test('验证更新日志页显示 "更新日志" 标题和版本信息', async ({ page }) => {
    // Given: 创建更新日志页对象
    const changelogPage = new ChangelogPage(page);

    // When: 访问更新日志页
    await changelogPage.goto();

    // Then: 验证页面标题包含 "更新日志" 或 "Changelog"
    const hasTitle = await changelogPage.expectChangelogTitle();
    expect(hasTitle).toBeTruthy();

    // Then: 验证页面包含版本信息
    const hasVersions = await changelogPage.hasVersionInfo();
    expect(hasVersions).toBeTruthy();
  });
});
