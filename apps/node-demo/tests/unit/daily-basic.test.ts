/**
 * 每日指标示例单元测试
 * 
 * 测试 runDailyBasicExample 函数的返回值结构和基本逻辑
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runDailyBasicExample } from '../../src/examples/daily-basic.js';
import { TushareClient } from '@hestudy/tushare-sdk';
import type { AppConfig } from '../../src/config.js';

// Mock TushareClient
vi.mock('@hestudy/tushare-sdk', () => ({
  TushareClient: vi.fn(),
}));

describe('runDailyBasicExample', () => {
  const mockConfig: AppConfig = {
    tushareToken: 'test_token',
    apiBaseUrl: 'https://api.tushare.pro',
    debug: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该返回正确的结构', async () => {
    // Mock getDailyBasic 返回数据
    const mockData = [
      {
        ts_code: '000001.SZ',
        trade_date: '20241008',
        pe: 5.23,
        pb: 0.68,
        turnover_rate: 0.45,
        total_mv: 23456789,
      },
      {
        ts_code: '000002.SZ',
        trade_date: '20241008',
        pe: 12.45,
        pb: 1.23,
        turnover_rate: 0.78,
        total_mv: 12345678,
      },
    ];

    const mockGetDailyBasic = vi.fn().mockResolvedValue(mockData);
    (TushareClient as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      getDailyBasic: mockGetDailyBasic,
    }));

    const result = await runDailyBasicExample(mockConfig);

    // 验证返回值结构
    expect(result).toHaveProperty('count');
    expect(result).toHaveProperty('sample');
    expect(Array.isArray(result.sample)).toBe(true);
    // count 是三个场景的总和: 2 + 2 + 2 = 6
    expect(result.count).toBe(6);
    expect(result.sample.length).toBeLessThanOrEqual(3);
  });

  it('应该处理无数据情况', async () => {
    // Mock 返回空数组
    const mockGetDailyBasic = vi.fn().mockResolvedValue([]);
    (TushareClient as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      getDailyBasic: mockGetDailyBasic,
    }));

    const result = await runDailyBasicExample(mockConfig);

    expect(result.count).toBe(0);
    expect(result.sample).toEqual([]);
  });

  it('应该最多返回 3 条示例数据', async () => {
    // Mock 返回大量数据
    const mockData = Array.from({ length: 100 }, (_, i) => ({
      ts_code: `00000${i}.SZ`,
      trade_date: '20241008',
      pe: 5.0 + i * 0.1,
      pb: 0.5 + i * 0.01,
    }));

    const mockGetDailyBasic = vi.fn().mockResolvedValue(mockData);
    (TushareClient as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      getDailyBasic: mockGetDailyBasic,
    }));

    const result = await runDailyBasicExample(mockConfig);

    // count 是三个场景的总和: 100 + 100 + 100 = 300
    expect(result.count).toBe(300);
    expect(result.sample.length).toBe(3);
  });

  it('应该传播错误', async () => {
    // Mock 抛出错误
    const mockError = new Error('API 调用失败');
    const mockGetDailyBasic = vi.fn().mockRejectedValue(mockError);
    (TushareClient as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      getDailyBasic: mockGetDailyBasic,
    }));

    await expect(runDailyBasicExample(mockConfig)).rejects.toThrow('API 调用失败');
  });

  it('应该调用 getDailyBasic 三次(三个场景)', async () => {
    // Mock getDailyBasic 返回数据
    const mockGetDailyBasic = vi.fn().mockResolvedValue([
      { ts_code: '000001.SZ', trade_date: '20241008', pe: 5.23 },
    ]);
    (TushareClient as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      getDailyBasic: mockGetDailyBasic,
    }));

    await runDailyBasicExample(mockConfig);

    // 验证调用了三次(场景 1、2、3)
    expect(mockGetDailyBasic).toHaveBeenCalledTimes(3);
  });

  it('应该使用正确的参数调用三个场景', async () => {
    const mockGetDailyBasic = vi.fn().mockResolvedValue([]);
    (TushareClient as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      getDailyBasic: mockGetDailyBasic,
    }));

    await runDailyBasicExample(mockConfig);

    // 验证场景 1: 按交易日期查询
    expect(mockGetDailyBasic).toHaveBeenNthCalledWith(1, {
      trade_date: expect.any(String),
    });

    // 验证场景 2: 按股票代码查询
    expect(mockGetDailyBasic).toHaveBeenNthCalledWith(2, {
      ts_code: expect.any(String),
      start_date: expect.any(String),
      end_date: expect.any(String),
    });

    // 验证场景 3: 自定义字段
    expect(mockGetDailyBasic).toHaveBeenNthCalledWith(3, {
      trade_date: expect.any(String),
      fields: expect.any(String),
    });
  });
});
