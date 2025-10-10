/**
 * 浏览器环境集成测试
 * 
 * 测试目标:
 * - T054: 验证 SDK 在浏览器环境中正常工作
 * 
 * 使用 jsdom 模拟浏览器环境
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { TushareClient } from '../../src/client/TushareClient';

describe('T054: 浏览器环境 API 调用', () => {
  let dom: JSDOM;
  let originalWindow: any;
  let originalDocument: any;
  let originalNavigator: any;
  let consoleWarnSpy: any;

  beforeAll(() => {
    // 创建 jsdom 环境
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'http://localhost',
    });

    // 保存原始全局对象
    originalWindow = (globalThis as any).window;
    originalDocument = (globalThis as any).document;
    originalNavigator = (globalThis as any).navigator;

    // 设置浏览器环境
    (globalThis as any).window = dom.window;
    (globalThis as any).document = dom.window.document;
    
    // 使用 Object.defineProperty 设置只读属性
    Object.defineProperty(globalThis, 'navigator', {
      value: dom.window.navigator,
      writable: true,
      configurable: true,
    });

    // 监听 console.warn
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterAll(() => {
    // 恢复原始环境
    (globalThis as any).window = originalWindow;
    (globalThis as any).document = originalDocument;
    
    // 使用 Object.defineProperty 恢复只读属性
    if (originalNavigator !== undefined) {
      Object.defineProperty(globalThis, 'navigator', {
        value: originalNavigator,
        writable: true,
        configurable: true,
      });
    }

    // 恢复 console.warn
    consoleWarnSpy.mockRestore();
  });

  it('应该在浏览器环境中显示安全警告', () => {
    const client = new TushareClient({
      token: 'test_token',
    });

    // 验证显示了安全警告
    expect(consoleWarnSpy).toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Security Warning')
    );
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('browser environment')
    );
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('API token will be exposed')
    );

    expect(client).toBeInstanceOf(TushareClient);
  });

  it('应该在浏览器环境中正常初始化客户端', () => {
    const client = new TushareClient({
      token: 'test_token',
      timeout: 60000,
      retry: {
        maxRetries: 2,
        initialDelay: 500,
        maxDelay: 5000,
        backoffFactor: 2,
      },
      cache: {
        enabled: true,
        ttl: 3600000,
      },
    });

    expect(client).toBeInstanceOf(TushareClient);
    expect(client.query).toBeInstanceOf(Function);
    expect(client.getStockBasic).toBeInstanceOf(Function);
    expect(client.getDailyQuote).toBeInstanceOf(Function);
  });

  it('应该在浏览器环境中正确使用 fetch API', async () => {
    // Mock fetch API
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        code: 0,
        msg: 'success',
        data: {
          fields: ['ts_code', 'name'],
          items: [['000001.SZ', '平安银行']],
        },
      }),
    });

    (globalThis as any).fetch = mockFetch;

    const client = new TushareClient({
      token: 'test_token',
    });

    const result = await client.getStockBasic({ list_status: 'L' });

    // 验证调用了 fetch
    expect(mockFetch).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.tushare.pro',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );

    // 验证返回了正确的数据
    expect(result).toHaveLength(1);
    expect(result[0].ts_code).toBe('000001.SZ');
    expect(result[0].name).toBe('平安银行');
  });

  it('应该在浏览器环境中正确处理 CORS 错误', async () => {
    // Mock fetch 返回 CORS 错误
    const mockFetch = vi.fn().mockRejectedValue(
      new TypeError('Failed to fetch')
    );

    (globalThis as any).fetch = mockFetch;

    const client = new TushareClient({
      token: 'test_token',
      retry: {
        maxRetries: 0, // 禁用重试以避免超时
      },
    });

    await expect(
      client.getStockBasic({ list_status: 'L' })
    ).rejects.toThrow();
  });

  it('应该在浏览器环境中支持缓存', async () => {
    // Mock fetch API
    let callCount = 0;
    const mockFetch = vi.fn().mockImplementation(async () => {
      callCount++;
      return {
        ok: true,
        json: async () => ({
          code: 0,
          msg: 'success',
          data: {
            fields: ['ts_code', 'name'],
            items: [['000001.SZ', '平安银行']],
          },
        }),
      };
    });

    (globalThis as any).fetch = mockFetch;

    const client = new TushareClient({
      token: 'test_token',
      cache: {
        enabled: true,
        ttl: 10000,
      },
    });

    // 第一次调用
    const result1 = await client.getStockBasic({ list_status: 'L' });
    expect(callCount).toBe(1);

    // 第二次调用（应该从缓存返回）
    const result2 = await client.getStockBasic({ list_status: 'L' });
    expect(callCount).toBe(1); // 没有增加，说明使用了缓存

    expect(result1).toEqual(result2);
  });

  it('应该在浏览器环境中支持重试机制', async () => {
    let callCount = 0;
    const mockFetch = vi.fn().mockImplementation(async () => {
      callCount++;
      if (callCount < 3) {
        // 前两次返回 500 错误
        return {
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          text: async () => 'Server error',
        };
      }
      // 第三次成功
      return {
        ok: true,
        json: async () => ({
          code: 0,
          msg: 'success',
          data: {
            fields: ['ts_code'],
            items: [['000001.SZ']],
          },
        }),
      };
    });

    (globalThis as any).fetch = mockFetch;

    const client = new TushareClient({
      token: 'test_token',
      retry: {
        maxRetries: 3,
        initialDelay: 10,
        maxDelay: 100,
        backoffFactor: 2,
      },
    });

    const result = await client.getStockBasic({ list_status: 'L' });

    // 验证重试了 3 次
    expect(callCount).toBe(3);
    expect(result).toHaveLength(1);
  });
});
