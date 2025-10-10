/**
 * SDK 初始化集成测试
 */

import { describe, it, expect } from 'vitest';
import { TushareClient } from '@hestudy/tushare-sdk';

describe('SDK 初始化', () => {
  it('应该能够创建 SDK 客户端', () => {
    const client = new TushareClient({
      token: 'test_token',
    });

    expect(client).toBeDefined();
    expect(client).toBeInstanceOf(TushareClient);
  });

  it('应该接受自定义 baseUrl', () => {
    const client = new TushareClient({
      token: 'test_token',
      baseUrl: 'https://custom.api.url',
    });

    expect(client).toBeDefined();
  });

  it('应该有 getStockBasic 方法', () => {
    const client = new TushareClient({
      token: 'test_token',
    });

    expect(typeof client.getStockBasic).toBe('function');
  });

  it('应该有 getDailyQuote 方法', () => {
    const client = new TushareClient({
      token: 'test_token',
    });

    expect(typeof client.getDailyQuote).toBe('function');
  });

  it('应该有 getTradeCalendar 方法', () => {
    const client = new TushareClient({
      token: 'test_token',
    });

    expect(typeof client.getTradeCalendar).toBe('function');
  });
});
