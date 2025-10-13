/**
 * 测试辅助工具函数
 *
 * 提供通用的测试辅助功能,如权限授予、剪贴板操作等
 */

import { Page, BrowserContext } from '@playwright/test';

/**
 * 授予浏览器权限
 * @param context - Playwright BrowserContext
 * @param permissions - 权限列表
 * @example
 * await grantPermissions(context, ['clipboard-read', 'clipboard-write']);
 */
export async function grantPermissions(
  context: BrowserContext,
  permissions: string[]
): Promise<void> {
  await context.grantPermissions(permissions);
}

/**
 * 读取剪贴板内容
 * @param page - Playwright Page 实例
 * @returns 剪贴板文本内容
 */
export async function readClipboard(page: Page): Promise<string> {
  return page.evaluate(async () => {
    return navigator.clipboard.readText();
  });
}

/**
 * 写入剪贴板内容
 * @param page - Playwright Page 实例
 * @param text - 要写入的文本
 */
export async function writeClipboard(page: Page, text: string): Promise<void> {
  await page.evaluate(async (content) => {
    await navigator.clipboard.writeText(content);
  }, text);
}

/**
 * 等待指定时间
 * @param ms - 毫秒数
 * @returns Promise
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 验证 URL 是否包含指定路径
 * @param page - Playwright Page 实例
 * @param path - 期望的路径片段
 * @returns 是否包含该路径
 */
export async function urlContains(page: Page, path: string): Promise<boolean> {
  const currentUrl = page.url();
  return currentUrl.includes(path);
}

/**
 * 获取元素的可见性状态
 * @param page - Playwright Page 实例
 * @param selector - 选择器
 * @returns 是否可见
 */
export async function isElementVisible(
  page: Page,
  selector: string
): Promise<boolean> {
  try {
    const element = page.locator(selector);
    return await element.isVisible();
  } catch {
    return false;
  }
}

/**
 * 获取元素的文本内容
 * @param page - Playwright Page 实例
 * @param selector - 选择器
 * @returns 文本内容或 null
 */
export async function getTextContent(
  page: Page,
  selector: string
): Promise<string | null> {
  try {
    const element = page.locator(selector).first();
    return await element.textContent();
  } catch {
    return null;
  }
}

/**
 * 滚动到页面顶部
 * @param page - Playwright Page 实例
 */
export async function scrollToTop(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/**
 * 滚动到页面底部
 * @param page - Playwright Page 实例
 */
export async function scrollToBottom(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  });
}

/**
 * 获取视口尺寸
 * @param page - Playwright Page 实例
 * @returns 视口宽度和高度
 */
export async function getViewportSize(
  page: Page
): Promise<{ width: number; height: number } | null> {
  return page.viewportSize();
}
