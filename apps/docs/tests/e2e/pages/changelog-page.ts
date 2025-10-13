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
    return (heading?.includes('更新日志') || heading?.includes('Changelog')) ?? false;
  }

  /**
   * 获取所有版本标题 (h2)
   */
  async getVersionHeadings(): Promise<Locator[]> {
    // 尝试多个可能的选择器
    let headings = this.page.locator('article h2, main h2, .doc-content h2, .content h2');
    let count = await headings.count();

    // 如果找不到,尝试只用 h2
    if (count === 0) {
      headings = this.page.locator('h2');
      count = await headings.count();
    }

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
   * 支持格式: YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD (可能在括号内)
   */
  async validateDateFormat(): Promise<boolean> {
    // 尝试多个可能的内容区域选择器
    const selectors = ['article', 'main', '.doc-content', '.content', 'body'];
    // 匹配日期格式,包括可能的括号包裹
    const datePattern = /\(?\d{4}[-/.]\d{2}[-/.]\d{2}\)?/;

    for (const selector of selectors) {
      const content = await this.page.locator(selector).first().textContent().catch(() => null);
      if (content && datePattern.test(content)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 验证更新内容是否包含分类关键词
   * (新增/功能/Features 或 修复/Bug/Fixes)
   */
  async validateContentCategories(): Promise<boolean> {
    // 尝试多个可能的内容区域选择器
    const selectors = ['article', 'main', '.doc-content', '.content', 'body'];
    const categories = ['新增', '功能', 'Features', '修复', 'Bug', 'Fixes', 'Fixed'];

    for (const selector of selectors) {
      const content = await this.page.locator(selector).first().textContent().catch(() => null);
      if (content && categories.some((keyword) => content.includes(keyword))) {
        return true;
      }
    }
    return false;
  }

  /**
   * 验证是否包含版本信息
   */
  async hasVersionInfo(): Promise<boolean> {
    const headings = await this.getVersionHeadings();
    return headings.length > 0;
  }
}
