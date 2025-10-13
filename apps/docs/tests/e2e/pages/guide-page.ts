/**
 * GuidePage 页面对象
 *
 * 指南页面的页面对象,继承 BasePage
 * 处理所有指南页面的共性功能
 */

import { Page } from '@playwright/test';
import { BasePage } from './base-page';

export class GuidePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * 导航到指定的指南页
   * @param pageName - 页面名称 (quick-start, installation, configuration, error-handling)
   */
  async gotoGuidePage(pageName: string): Promise<void> {
    await super.goto(`/guide/${pageName}`);
  }

  /**
   * 导航到快速入门页
   */
  async gotoQuickStart(): Promise<void> {
    await this.gotoGuidePage('quick-start');
  }

  /**
   * 导航到安装指南页
   */
  async gotoInstallation(): Promise<void> {
    await this.gotoGuidePage('installation');
  }

  /**
   * 导航到配置指南页
   */
  async gotoConfiguration(): Promise<void> {
    await this.gotoGuidePage('configuration');
  }

  /**
   * 导航到错误处理页
   */
  async gotoErrorHandling(): Promise<void> {
    await this.gotoGuidePage('error-handling');
  }

  /**
   * 验证页面是否包含代码示例
   */
  async hasCodeExamples(): Promise<boolean> {
    const codeBlocks = await this.getCodeBlocks();
    return codeBlocks.length > 0;
  }

  /**
   * 验证页面内容是否包含特定关键词
   */
  async contentContains(keyword: string): Promise<boolean> {
    try {
      // 等待页面加载完成
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });

      // 直接获取整个 body 的文本内容
      const bodyText = await this.page.locator('body').textContent();

      if (!bodyText) {
        return false;
      }

      return bodyText.toLowerCase().includes(keyword.toLowerCase());
    } catch (error) {
      return false;
    }
  }
}
