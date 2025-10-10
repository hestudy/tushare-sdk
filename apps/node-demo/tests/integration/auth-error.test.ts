import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TushareClient } from '@hestudy/tushare-sdk';

/**
 * 集成测试: 认证错误场景
 * 测试 SDK 在无效 Token 场景下的行为
 */
describe('认证错误集成测试', () => {
  beforeEach(() => {
    // 清理环境变量
    vi.unstubAllEnvs();
  });

  it('应该在使用空 Token 时抛出认证错误', () => {
    // 创建使用空 Token 的客户端应该在构造函数中就抛出错误
    expect(() => {
      new TushareClient({
        token: '',
      });
    }).toThrow('Token cannot be empty');
  });

  it('应该在使用无效 Token 时抛出认证错误', async () => {
    // 创建使用无效 Token 的客户端
    const client = new TushareClient({
      token: 'invalid_token_12345',
    });

    // 尝试调用 API,应该抛出错误
    await expect(async () => {
      await client.getStockBasic();
    }).rejects.toThrow();
  });

  it('应该在 Token 格式错误时抛出认证错误', async () => {
    // 创建使用格式错误 Token 的客户端
    const client = new TushareClient({
      token: '!!!invalid!!!',
    });

    // 尝试调用 API,应该抛出错误
    await expect(async () => {
      await client.getStockBasic();
    }).rejects.toThrow();
  });

  it('应该在缺少 Token 时抛出配置错误', () => {
    // 尝试创建没有 Token 的客户端,应该抛出错误
    expect(() => {
      new TushareClient({
        token: undefined as any,
      });
    }).toThrow();
  });
});
