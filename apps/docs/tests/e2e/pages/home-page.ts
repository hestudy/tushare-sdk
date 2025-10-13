/**
 * HomePage 页面对象
 *
 * 首页的页面对象,继承 BasePage
 */

import { Page } from '@playwright/test';
import { BasePage } from './base-page';

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * 导航到首页
   */
  async goto(): Promise<void> {
    await super.goto('/');
  }

  /**
   * 验证首页主标题是否包含 "Tushare SDK"
   */
  async expectTitleContainsTushareSDK(): Promise<boolean> {
    const heading = await this.getMainHeading();
    return heading?.includes('Tushare SDK') ?? false;
  }

  /**
   * 获取首页的欢迎消息或介绍文本
   */
  async getIntroText(): Promise<string | null> {
    const intro = this.page.locator(`${this.selectors.common.mainContent} p`).first();
    return intro.textContent();
  }

  /**
   * 获取首页hero区域的标题
   * rspress 首页使用 hero 组件,标题可能在特殊的 class 中
   */
  async getHeroTitle(): Promise<string | null> {
    // 尝试多个可能的hero标题选择器
    const selectors = [
      '.rspress-hero-title',
      '.rspress-hero h1',
      '[class*="hero"] h1',
      '[class*="Hero"] h1',
      'h1',
    ];

    for (const selector of selectors) {
      const element = this.page.locator(selector).first();
      const count = await element.count();
      if (count > 0) {
        const text = await element.textContent();
        if (text && text.trim().length > 0) {
          return text;
        }
      }
    }

    return null;
  }
}
