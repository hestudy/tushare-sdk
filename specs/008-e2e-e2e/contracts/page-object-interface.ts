/**
 * Page Object 接口契约
 *
 * 定义所有页面对象必须实现的接口和方法签名
 */

import { Page, Locator } from '@playwright/test';

/**
 * 基础页面接口
 * 所有页面对象必须实现此接口
 */
export interface IBasePage {
  /**
   * Playwright Page 实例
   */
  readonly page: Page;

  /**
   * 页面基础 URL
   */
  readonly baseURL: string;

  /**
   * 导航到指定路径
   * @param path - 相对路径或绝对URL
   * @example
   * await page.goto('/guide/quick-start');
   */
  goto(path: string): Promise<void>;

  /**
   * 获取页面标题 (document.title)
   * @returns 页面标题文本
   */
  getTitle(): Promise<string>;

  /**
   * 获取主标题 (h1 标签)
   * @returns h1 标签的文本内容
   */
  getMainHeading(): Promise<string | null>;

  /**
   * 等待页面完全加载
   * @param timeout - 超时时间(毫秒),默认30000
   */
  waitForPageLoad(timeout?: number): Promise<void>;

  /**
   * 获取页面选择器
   * @returns 选择器对象
   */
  getSelectors(): PageSelectors;
}

/**
 * 导航功能接口
 * 需要导航功能的页面对象实现此接口
 */
export interface INavigable {
  /**
   * 点击顶部导航栏链接
   * @param linkText - 链接文本 (如 "指南", "API 文档")
   */
  clickNavLink(linkText: string): Promise<void>;

  /**
   * 点击侧边栏链接
   * @param linkText - 链接文本
   */
  clickSidebarLink(linkText: string): Promise<void>;

  /**
   * 验证当前 URL 是否包含指定路径
   * @param path - 期望的路径片段
   */
  expectUrlContains(path: string): Promise<boolean>;
}

/**
 * 代码示例功能接口
 * 包含代码块的页面实现此接口
 */
export interface ICodeExamples {
  /**
   * 获取所有代码块
   * @returns 代码块 Locator 数组
   */
  getCodeBlocks(): Promise<Locator[]>;

  /**
   * 获取第一个代码块的内容
   * @returns 代码文本内容
   */
  getFirstCodeBlockContent(): Promise<string | null>;

  /**
   * 点击代码块的复制按钮
   * @param index - 代码块索引,默认0(第一个)
   */
  clickCopyButton(index?: number): Promise<void>;

  /**
   * 获取剪贴板内容
   * @returns 剪贴板文本
   */
  getClipboardContent(): Promise<string>;

  /**
   * 验证代码块是否包含特定文本
   * @param text - 期望包含的文本
   * @param index - 代码块索引,默认0
   */
  expectCodeBlockContains(text: string, index?: number): Promise<boolean>;
}

/**
 * 响应式设计接口
 * 需要测试响应式布局的页面实现此接口
 */
export interface IResponsive {
  /**
   * 设置视口尺寸
   * @param width - 宽度(像素)
   * @param height - 高度(像素)
   */
  setViewport(width: number, height: number): Promise<void>;

  /**
   * 验证侧边栏是否可见
   */
  isSidebarVisible(): Promise<boolean>;

  /**
   * 点击移动端菜单按钮
   */
  clickMobileMenuButton(): Promise<void>;

  /**
   * 验证导航栏高度
   * @param maxHeight - 最大高度(像素)
   */
  expectNavHeightLessThan(maxHeight: number): Promise<boolean>;
}

/**
 * 页面选择器接口
 */
export interface PageSelectors {
  /**
   * 通用选择器
   */
  common: CommonSelectors;

  /**
   * 代码相关选择器
   */
  code?: CodeSelectors;

  /**
   * 移动端选择器
   */
  mobile?: MobileSelectors;
}

/**
 * 通用选择器
 */
export interface CommonSelectors {
  nav: string;
  navLinks: {
    guide: string;
    api: string;
    changelog: string;
    github: string;
  };
  sidebar: string;
  sidebarGroup: string;
  sidebarLink: string;
  mainContent: string;
  footer: string;
}

/**
 * 代码相关选择器
 */
export interface CodeSelectors {
  codeBlock: string;
  codeContent: string;
  copyButton: string;
  lineNumbers: string;
}

/**
 * 移动端选择器
 */
export interface MobileSelectors {
  menuButton: string;
  mobileNav: string;
  mobileSidebar: string;
}

/**
 * 页面类型枚举
 */
export enum PageType {
  HOME = 'home',
  GUIDE = 'guide',
  API = 'api',
  CHANGELOG = 'changelog'
}

/**
 * 视口配置
 */
export interface ViewportConfig {
  name: string;
  width: number;
  height: number;
  deviceScaleFactor?: number;
  isMobile?: boolean;
  hasTouch?: boolean;
}

/**
 * 页面对象工厂接口
 */
export interface IPageFactory {
  /**
   * 创建页面对象实例
   * @param pageType - 页面类型
   * @param page - Playwright Page 实例
   */
  createPage(pageType: PageType, page: Page): IBasePage;
}
