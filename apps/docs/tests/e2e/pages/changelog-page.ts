/**
 * ChangelogPage 页面对象
 *
 * 更新日志页面的页面对象,继承 BasePage
 */

import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class ChangelogPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * 导航到更新日志页
   */
  async goto(): Promise<void> {
    await super.goto('/changelog/');
  }

  /**
   * 验证页面是否显示 "更新日志" 标题
   */
  async expectChangelogTitle(): Promise<boolean> {
    const heading = await this.getMainHeading();
    return heading?.includes('更新日志') || heading?.includes('Changelog') ?? false;
  }

  /**
   * 获取所有版本标题 (h2)
   */
  async getVersionHeadings(): Promise<Locator[]> {
    const headings = this.page.locator(`${this.selectors.common.mainContent} h2`);
    const count = await headings.count();
    const results: Locator[] = [];

    for (let i = 0; i < count; i++) {
      results.push(headings.nth(i));
    }

    return results;
  }

  /**
   * 验证版本号格式是否符合 vX.Y.Z 或 X.Y.Z
   */
  async validateVersionFormat(): Promise<boolean> {
    const headings = await this.getVersionHeadings();

    if (headings.length === 0) {
      return false;
    }

    // 至少一个版本号符合格式
    for (const heading of headings) {
      const text = await heading.textContent();
      if (text && /v?\d+\.\d+\.\d+/.test(text)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 验证发布日期格式
   * 支持格式: YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD
   */
  async validateDateFormat(): Promise<boolean> {
    const content = await this.page.locator(this.selectors.common.mainContent).textContent();

    if (!content) {
      return false;
    }

    // 匹配日期格式
    const datePattern = /\d{4}[-/.]\d{2}[-/.]\d{2}/;
    return datePattern.test(content);
  }

  /**
   * 验证更新内容是否包含分类关键词
   * (新增/功能/Features 或 修复/Bug/Fixes)
   */
  async validateContentCategories(): Promise<boolean> {
    const content = await this.page.locator(this.selectors.common.mainContent).textContent();

    if (!content) {
      return false;
    }

    // 检查是否包含分类关键词
    const categories = ['新增', '功能', 'Features', '修复', 'Bug', 'Fixes', 'Fixed'];
    return categories.some((keyword) => content.includes(keyword));
  }

  /**
   * 验证是否包含版本信息
   */
  async hasVersionInfo(): Promise<boolean> {
    const headings = await this.getVersionHeadings();
    return headings.length > 0;
  }
}
