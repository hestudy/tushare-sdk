/**
 * BasePage 基类
 *
 * 所有页面对象的基类,提供通用的页面交互方法
 * 实现 IBasePage, INavigable, ICodeExamples, IResponsive 接口
 */

import { Page, Locator, expect } from '@playwright/test';
import type {
  IBasePage,
  INavigable,
  ICodeExamples,
  IResponsive,
  PageSelectors,
} from '../../../specs/008-e2e-e2e/contracts/page-object-interface';
import { getPageSelectors } from './selectors';
import { readClipboard, urlContains, isElementVisible } from '../utils/test-helpers';

export class BasePage implements IBasePage, INavigable, ICodeExamples, IResponsive {
  readonly page: Page;
  readonly baseURL: string;
  protected selectors: PageSelectors;

  constructor(page: Page) {
    this.page = page;
    this.baseURL = process.env.BASE_URL || 'http://localhost:3000';
    this.selectors = getPageSelectors();
  }

  /**
   * 导航到指定路径
   */
  async goto(path: string): Promise<void> {
    const url = path.startsWith('http') ? path : `${this.baseURL}${path}`;
    await this.page.goto(url);
    await this.waitForPageLoad();
  }

  /**
   * 获取页面标题 (document.title)
   */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * 获取主标题 (h1 标签)
   */
  async getMainHeading(): Promise<string | null> {
    const heading = this.page.locator('h1').first();
    return heading.textContent();
  }

  /**
   * 等待页面完全加载
   */
  async waitForPageLoad(timeout: number = 30000): Promise<void> {
    // 等待网络空闲
    await this.page.waitForLoadState('networkidle', { timeout });

    // 等待 DOM 加载完成
    await this.page.waitForLoadState('domcontentloaded', { timeout });

    // 等待至少一个主要内容元素可见 (h1 或 main content)
    try {
      await Promise.race([
        this.page.locator('h1').first().waitFor({ state: 'visible', timeout: 10000 }),
        this.page.locator('article').first().waitFor({ state: 'visible', timeout: 10000 }),
        this.page.locator('main').first().waitFor({ state: 'visible', timeout: 10000 }),
      ]);
    } catch (error) {
      // 如果没有找到这些元素,等待一段时间让页面完全渲染
      await this.page.waitForTimeout(2000);
    }
  }

  /**
   * 获取页面选择器
   */
  getSelectors(): PageSelectors {
    return this.selectors;
  }

  // ===== INavigable 接口实现 =====

  /**
   * 点击顶部导航栏链接
   */
  async clickNavLink(linkText: string): Promise<void> {
    const link = this.page.locator(`${this.selectors.common.nav} a:has-text("${linkText}")`);
    await link.click();
  }

  /**
   * 点击侧边栏链接
   */
  async clickSidebarLink(linkText: string): Promise<void> {
    const link = this.page.locator(`${this.selectors.common.sidebar} a:has-text("${linkText}")`);
    await link.click();
  }

  /**
   * 验证当前 URL 是否包含指定路径
   */
  async expectUrlContains(path: string): Promise<boolean> {
    return urlContains(this.page, path);
  }

  // ===== ICodeExamples 接口实现 =====

  /**
   * 获取所有代码块
   */
  async getCodeBlocks(): Promise<Locator[]> {
    const codeBlocks = this.page.locator(this.selectors.code!.codeBlock);
    const count = await codeBlocks.count();
    const blocks: Locator[] = [];

    for (let i = 0; i < count; i++) {
      blocks.push(codeBlocks.nth(i));
    }

    return blocks;
  }

  /**
   * 获取第一个代码块的内容
   */
  async getFirstCodeBlockContent(): Promise<string | null> {
    const codeBlock = this.page.locator(this.selectors.code!.codeContent).first();
    return codeBlock.textContent();
  }

  /**
   * 点击代码块的复制按钮
   */
  async clickCopyButton(index: number = 0): Promise<void> {
    const codeBlock = this.page.locator(this.selectors.code!.codeBlock).nth(index);

    // 悬停在代码块上显示复制按钮
    await codeBlock.hover();

    // 等待复制按钮可见
    const copyButton = this.page.locator(this.selectors.code!.copyButton).first();
    await copyButton.waitFor({ state: 'visible', timeout: 5000 });

    // 点击复制按钮
    await copyButton.click();

    // 等待复制完成
    await this.page.waitForTimeout(500);
  }

  /**
   * 获取剪贴板内容
   */
  async getClipboardContent(): Promise<string> {
    return readClipboard(this.page);
  }

  /**
   * 验证代码块是否包含特定文本
   */
  async expectCodeBlockContains(text: string, index: number = 0): Promise<boolean> {
    const codeBlock = this.page.locator(this.selectors.code!.codeContent).nth(index);
    const content = await codeBlock.textContent();
    return content?.includes(text) ?? false;
  }

  // ===== IResponsive 接口实现 =====

  /**
   * 设置视口尺寸
   */
  async setViewport(width: number, height: number): Promise<void> {
    await this.page.setViewportSize({ width, height });
  }

  /**
   * 验证侧边栏是否可见
   */
  async isSidebarVisible(): Promise<boolean> {
    return isElementVisible(this.page, this.selectors.common.sidebar);
  }

  /**
   * 点击移动端菜单按钮
   */
  async clickMobileMenuButton(): Promise<void> {
    const menuButton = this.page.locator(this.selectors.mobile!.menuButton);
    await menuButton.click();
  }

  /**
   * 验证导航栏高度
   */
  async expectNavHeightLessThan(maxHeight: number): Promise<boolean> {
    const nav = this.page.locator(this.selectors.common.nav);
    const box = await nav.boundingBox();
    return box ? box.height < maxHeight : false;
  }

  // ===== 辅助方法 =====

  /**
   * 获取元素文本内容
   */
  protected async getElementText(selector: string): Promise<string | null> {
    const element = this.page.locator(selector).first();
    return element.textContent();
  }

  /**
   * 验证元素是否存在
   */
  protected async elementExists(selector: string): Promise<boolean> {
    try {
      const element = this.page.locator(selector);
      const count = await element.count();
      return count > 0;
    } catch {
      return false;
    }
  }

  /**
   * 等待元素可见
   */
  protected async waitForElement(
    selector: string,
    timeout: number = 10000
  ): Promise<void> {
    await this.page.locator(selector).waitFor({
      state: 'visible',
      timeout,
    });
  }

  /**
   * 截图
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `test-results/${name}.png`, fullPage: true });
  }
}
