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
}
