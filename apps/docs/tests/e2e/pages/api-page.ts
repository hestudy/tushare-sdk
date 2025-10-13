/**
 * ApiPage 页面对象
 *
 * API文档页面的页面对象,继承 BasePage
 * 处理所有API文档页面的共性功能
 */

import { Page } from '@playwright/test';
import { BasePage } from './base-page';

export class ApiPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * 导航到指定的API文档页
   * @param apiPath - API路径 (例如: stock/basic, stock/daily, calendar, daily-basic)
   */
  async gotoApiPage(apiPath: string): Promise<void> {
    await super.goto(`/api/${apiPath}`);
  }

  /**
   * 导航到股票基础信息API页
   */
  async gotoStockBasic(): Promise<void> {
    await this.gotoApiPage('stock/basic');
  }

  /**
   * 导航到日线数据API页
   */
  async gotoStockDaily(): Promise<void> {
    await this.gotoApiPage('stock/daily');
  }

  /**
   * 导航到交易日历API页
   */
  async gotoCalendar(): Promise<void> {
    await this.gotoApiPage('calendar');
  }

  /**
   * 导航到每日指标API页
   */
  async gotoDailyBasic(): Promise<void> {
    await this.gotoApiPage('daily-basic');
  }

  /**
   * 验证API文档是否包含代码示例
   */
  async hasCodeExamples(): Promise<boolean> {
    const codeBlocks = await this.getCodeBlocks();
    return codeBlocks.length > 0;
  }

  /**
   * 验证API文档是否包含参数说明
   */
  async hasParameterDescription(): Promise<boolean> {
    // 查找包含 "参数" 或 "Parameters" 的标题
    const paramHeader = this.page.locator('h2, h3').filter({
      hasText: /参数|Parameters|请求参数/,
    });
    const count = await paramHeader.count();
    return count > 0;
  }

  /**
   * 验证API文档是否包含返回值说明
   */
  async hasReturnDescription(): Promise<boolean> {
    // 查找包含 "返回" 或 "Return" 的标题
    const returnHeader = this.page.locator('h2, h3').filter({
      hasText: /返回|Return|响应|Response/,
    });
    const count = await returnHeader.count();
    return count > 0;
  }

  /**
   * 验证页面内容是否包含特定关键词
   */
  async contentContains(keyword: string): Promise<boolean> {
    const content = this.page.locator(this.selectors.common.mainContent);
    const text = await content.textContent();
    return text?.includes(keyword) ?? false;
  }
}
