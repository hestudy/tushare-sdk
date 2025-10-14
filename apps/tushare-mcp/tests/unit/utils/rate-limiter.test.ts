import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { RateLimiter, createRateLimiter } from '../../../src/utils/rate-limiter.js';

describe('rate-limiter.ts - RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('基本限流功能', () => {
    it('应在未超过限额时允许请求', () => {
      const limiter = new RateLimiter({
        maxRequests: 5,
        windowMs: 60000,
      });

      expect(limiter.tryAcquire()).toBe(true);
      expect(limiter.tryAcquire()).toBe(true);
      expect(limiter.tryAcquire()).toBe(true);
    });

    it('应在超过限额时拒绝请求', () => {
      const limiter = new RateLimiter({
        maxRequests: 3,
        windowMs: 60000,
      });

      expect(limiter.tryAcquire()).toBe(true);
      expect(limiter.tryAcquire()).toBe(true);
      expect(limiter.tryAcquire()).toBe(true);
      expect(limiter.tryAcquire()).toBe(false); // 第4次请求应被拒绝
    });

    it('应在时间窗口过期后允许新请求', () => {
      const limiter = new RateLimiter({
        maxRequests: 2,
        windowMs: 1000,
      });

      // 使用前2次请求配额
      expect(limiter.tryAcquire()).toBe(true);
      expect(limiter.tryAcquire()).toBe(true);
      expect(limiter.tryAcquire()).toBe(false); // 第3次被拒绝

      // 前进1秒,时间窗口过期
      vi.advanceTimersByTime(1000);

      // 应该可以再次请求
      expect(limiter.tryAcquire()).toBe(true);
      expect(limiter.tryAcquire()).toBe(true);
    });
  });

  describe('滑动窗口算法', () => {
    it('应正确清理过期的请求记录', () => {
      const limiter = new RateLimiter({
        maxRequests: 3,
        windowMs: 1000,
      });

      // 第一批请求
      expect(limiter.tryAcquire()).toBe(true);
      expect(limiter.tryAcquire()).toBe(true);

      // 前进600ms
      vi.advanceTimersByTime(600);

      // 第二批请求
      expect(limiter.tryAcquire()).toBe(true);
      expect(limiter.tryAcquire()).toBe(false); // 达到限制

      // 前进500ms(总共1100ms),第一批请求应该过期
      vi.advanceTimersByTime(500);

      // 应该可以再次请求(因为第一批的2个请求已过期)
      expect(limiter.tryAcquire()).toBe(true);
    });
  });

  describe('getCurrentRequestCount', () => {
    it('应返回当前时间窗口内的请求数', () => {
      const limiter = new RateLimiter({
        maxRequests: 10,
        windowMs: 1000,
      });

      expect(limiter.getCurrentRequestCount()).toBe(0);

      limiter.tryAcquire();
      expect(limiter.getCurrentRequestCount()).toBe(1);

      limiter.tryAcquire();
      limiter.tryAcquire();
      expect(limiter.getCurrentRequestCount()).toBe(3);
    });

    it('应在时间窗口过期后返回0', () => {
      const limiter = new RateLimiter({
        maxRequests: 10,
        windowMs: 1000,
      });

      limiter.tryAcquire();
      limiter.tryAcquire();
      expect(limiter.getCurrentRequestCount()).toBe(2);

      vi.advanceTimersByTime(1000);
      expect(limiter.getCurrentRequestCount()).toBe(0);
    });
  });

  describe('getRemainingQuota', () => {
    it('应返回剩余可用配额', () => {
      const limiter = new RateLimiter({
        maxRequests: 5,
        windowMs: 1000,
      });

      expect(limiter.getRemainingQuota()).toBe(5);

      limiter.tryAcquire();
      expect(limiter.getRemainingQuota()).toBe(4);

      limiter.tryAcquire();
      limiter.tryAcquire();
      expect(limiter.getRemainingQuota()).toBe(2);
    });

    it('应在配额用完时返回0', () => {
      const limiter = new RateLimiter({
        maxRequests: 2,
        windowMs: 1000,
      });

      limiter.tryAcquire();
      limiter.tryAcquire();
      expect(limiter.getRemainingQuota()).toBe(0);
    });
  });

  describe('getNextResetTime', () => {
    it('应在无请求时返回0', () => {
      const limiter = new RateLimiter({
        maxRequests: 5,
        windowMs: 1000,
      });

      expect(limiter.getNextResetTime()).toBe(0);
    });

    it('应返回最早请求的过期时间', () => {
      const limiter = new RateLimiter({
        maxRequests: 5,
        windowMs: 1000,
      });

      const startTime = Date.now();
      limiter.tryAcquire();

      const resetTime = limiter.getNextResetTime();
      expect(resetTime).toBe(startTime + 1000);
    });

    it('应在请求过期后更新重置时间', () => {
      const limiter = new RateLimiter({
        maxRequests: 5,
        windowMs: 1000,
      });

      const startTime = Date.now();
      limiter.tryAcquire();

      vi.advanceTimersByTime(500);
      limiter.tryAcquire();

      // 第一个请求仍然是最早的
      expect(limiter.getNextResetTime()).toBe(startTime + 1000);

      // 等待第一个请求过期
      vi.advanceTimersByTime(600);
      limiter.getCurrentRequestCount(); // 触发清理

      // 现在第二个请求是最早的
      expect(limiter.getNextResetTime()).toBe(startTime + 500 + 1000);
    });
  });

  describe('reset', () => {
    it('应清空所有请求记录', () => {
      const limiter = new RateLimiter({
        maxRequests: 3,
        windowMs: 1000,
      });

      limiter.tryAcquire();
      limiter.tryAcquire();
      limiter.tryAcquire();

      expect(limiter.getCurrentRequestCount()).toBe(3);
      expect(limiter.getRemainingQuota()).toBe(0);

      limiter.reset();

      expect(limiter.getCurrentRequestCount()).toBe(0);
      expect(limiter.getRemainingQuota()).toBe(3);
      expect(limiter.getNextResetTime()).toBe(0);
    });

    it('应在重置后允许新请求', () => {
      const limiter = new RateLimiter({
        maxRequests: 2,
        windowMs: 1000,
      });

      limiter.tryAcquire();
      limiter.tryAcquire();
      expect(limiter.tryAcquire()).toBe(false); // 被拒绝

      limiter.reset();

      expect(limiter.tryAcquire()).toBe(true); // 应该成功
    });
  });

  describe('getConfig', () => {
    it('应返回当前配置', () => {
      const config = {
        maxRequests: 100,
        windowMs: 60000,
      };

      const limiter = new RateLimiter(config);
      expect(limiter.getConfig()).toEqual(config);
    });
  });
});

describe('rate-limiter.ts - createRateLimiter', () => {
  it('应创建 RateLimiter 实例', () => {
    const limiter = createRateLimiter({
      maxRequests: 10,
      windowMs: 1000,
    });

    expect(limiter).toBeInstanceOf(RateLimiter);
  });

  it('应使用指定的配置创建限流器', () => {
    const config = {
      maxRequests: 50,
      windowMs: 30000,
    };

    const limiter = createRateLimiter(config);
    expect(limiter.getConfig()).toEqual(config);
  });
});
