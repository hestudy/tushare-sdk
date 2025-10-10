import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TushareClient } from '@hestudy/tushare-sdk';

/**
 * 集成测试: 参数错误场景
 * 测试 SDK 在无效参数场景下的行为
 */
describe('参数错误集成测试', () => {
  let client: TushareClient;

  beforeEach(() => {
    // 使用测试 Token 创建客户端
    // 注意: 这些测试可能会实际调用 API,如果没有有效 Token 会失败
    const token = process.env.TUSHARE_TOKEN || 'test_token';
    client = new TushareClient({ token });
  });

  it('应该在使用无效股票代码时处理错误', async () => {
    // 使用明显无效的股票代码
    await expect(async () => {
      await client.getDailyQuote({
        ts_code: 'INVALID_CODE',
        start_date: '20240101',
        end_date: '20240131',
      });
    }).rejects.toThrow();
  });

  it('应该在使用无效日期格式时处理错误', async () => {
    // 使用错误的日期格式
    await expect(async () => {
      await client.getDailyQuote({
        ts_code: '000001.SZ',
        start_date: '2024-01-01', // 错误格式,应该是 YYYYMMDD
        end_date: '2024-01-31',
      });
    }).rejects.toThrow();
  });

  it('应该在日期范围无效时处理错误', async () => {
    // 结束日期早于开始日期
    await expect(async () => {
      await client.getDailyQuote({
        ts_code: '000001.SZ',
        start_date: '20240131',
        end_date: '20240101', // 早于开始日期
      });
    }).rejects.toThrow();
  });

  it('应该在缺少必需参数时处理错误', async () => {
    // 缺少必需的参数
    await expect(async () => {
      await client.getDailyQuote({} as any);
    }).rejects.toThrow();
  });

  it('应该在交易所代码无效时处理错误', async () => {
    // 使用无效的交易所代码
    await expect(async () => {
      await client.getStockBasic({
        exchange: 'INVALID_EXCHANGE' as any,
      });
    }).rejects.toThrow();
  });
});
