/**
 * 页面选择器常量定义
 *
 * 集中管理所有页面元素的选择器,便于维护和更新
 * 基于 rspress 生成的 DOM 结构
 */

import type { CommonSelectors, CodeSelectors, MobileSelectors, PageSelectors } from '../../../specs/008-e2e-e2e/contracts/page-object-interface';

/**
 * 通用选择器 - 适用于所有页面
 */
export const commonSelectors: CommonSelectors = {
  // 顶部导航栏
  nav: 'nav.rspress-nav',

  // 导航栏链接
  navLinks: {
    guide: 'nav.rspress-nav a[href*="/guide"]',
    api: 'nav.rspress-nav a[href*="/api"]',
    changelog: 'nav.rspress-nav a[href*="/changelog"]',
    github: 'nav.rspress-nav a[href*="github.com"]',
  },

  // 侧边栏
  sidebar: 'aside.rspress-sidebar',
  sidebarGroup: '.rspress-sidebar-group',
  sidebarLink: '.rspress-sidebar a',

  // 主内容区
  mainContent: 'article.rspress-doc-content',

  // 页脚
  footer: 'footer.rspress-footer',
};

/**
 * 代码示例相关选择器
 */
export const codeSelectors: CodeSelectors = {
  // 代码块容器
  codeBlock: 'pre',

  // 代码内容
  codeContent: 'pre code',

  // 复制按钮
  copyButton: 'button[aria-label*="复制"], button[title*="复制"], button[class*="copy"]',

  // 行号
  lineNumbers: '.line-number',
};

/**
 * 移动端相关选择器
 */
export const mobileSelectors: MobileSelectors = {
  // 菜单按钮(汉堡图标)
  menuButton: 'button[aria-label="Toggle menu"], button[aria-label*="menu"]',

  // 移动端导航
  mobileNav: '.rspress-nav-menu-mobile',

  // 移动端侧边栏
  mobileSidebar: '.rspress-sidebar-mobile',
};

/**
 * 获取完整的页面选择器对象
 */
export function getPageSelectors(): PageSelectors {
  return {
    common: commonSelectors,
    code: codeSelectors,
    mobile: mobileSelectors,
  };
}
