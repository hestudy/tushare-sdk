/**
 * T019 [US3] 存储与查询端到端测试
 *
 * 验证完整的存储和查询流程
 * - 场景 1: 插入测试数据 → 按时间范围查询 → 验证结果
 * - 场景 2: 插入测试数据 → 按股票代码查询 → 验证结果
 * - 场景 3: 查询并导出 CSV → 验证格式
 * - 场景 4: 数据去重测试(重复插入同一日期数据)
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { db } from '../../lib/database.js';
import type { DailyQuote } from '../../types/index.js';

// 测试数据集
const testQuotes: Omit<DailyQuote, 'id' | 'createdAt'>[] = [
  {
    tsCode: '600519.SH',
    tradeDate: '2024-01-02',
    open: 1650.0,
    high: 1680.0,
    low: 1645.0,
    close: 1670.0,
    preClose: 1640.0,
    change: 30.0,
    pctChg: 1.83,
    vol: 150000,
    amount: 250000000,
  },
  {
    tsCode: '600519.SH',
    tradeDate: '2024-01-03',
    open: 1670.0,
    high: 1690.0,
    low: 1665.0,
    close: 1685.0,
    preClose: 1670.0,
    change: 15.0,
    pctChg: 0.9,
    vol: 120000,
    amount: 200000000,
  },
  {
    tsCode: '600519.SH',
    tradeDate: '2024-01-04',
    open: 1685.0,
    high: 1700.0,
    low: 1680.0,
    close: 1695.0,
    preClose: 1685.0,
    change: 10.0,
    pctChg: 0.59,
    vol: 100000,
    amount: 169000000,
  },
  {
    tsCode: '000001.SZ',
    tradeDate: '2024-01-02',
    open: 12.5,
    high: 12.8,
    low: 12.4,
    close: 12.7,
    preClose: 12.5,
    change: 0.2,
    pctChg: 1.6,
    vol: 500000,
    amount: 6300000,
  },
  {
    tsCode: '000001.SZ',
    tradeDate: '2024-01-03',
    open: 12.7,
    high: 13.0,
    low: 12.6,
    close: 12.9,
    preClose: 12.7,
    change: 0.2,
    pctChg: 1.57,
    vol: 550000,
    amount: 7050000,
  },
];

describe('T019 [US3] 存储与查询端到端测试', () => {
  beforeAll(() => {
    // 清理并准备测试数据
    db.clearAllData();
    db.saveQuotes(testQuotes);
  });

  afterAll(() => {
    // 清理测试数据
    db.clearAllData();
  });

  describe('场景 1: 按时间范围查询', () => {
    it('应该能查询指定时间范围内的所有股票数据', () => {
      const results = db.queryQuotes({
        startDate: '2024-01-02',
        endDate: '2024-01-03',
      });

      // 验证返回记录数
      expect(results.length).toBe(4); // 600519.SH (2条) + 000001.SZ (2条)

      // 验证数据按日期降序排列
      expect(results[0].tradeDate).toBe('2024-01-03');
      expect(results[results.length - 1].tradeDate).toBe('2024-01-02');

      // 验证数据完整性
      const quote = results.find(
        (q) => q.tsCode === '600519.SH' && q.tradeDate === '2024-01-02'
      );
      expect(quote).toBeDefined();
      expect(quote?.open).toBe(1650.0);
      expect(quote?.close).toBe(1670.0);
      expect(quote?.vol).toBe(150000);
    });

    it('应该能查询单日数据', () => {
      const results = db.queryQuotes({
        startDate: '2024-01-02',
        endDate: '2024-01-02',
      });

      // 验证返回记录数
      expect(results.length).toBe(2); // 600519.SH + 000001.SZ

      // 验证所有记录都是指定日期
      results.forEach((quote) => {
        expect(quote.tradeDate).toBe('2024-01-02');
      });
    });

    it('应该正确处理开放式时间范围查询', () => {
      // 只指定开始日期
      const resultsFrom = db.queryQuotes({
        startDate: '2024-01-03',
      });

      expect(resultsFrom.length).toBe(3); // 01-03 (2条) + 01-04 (1条)

      // 只指定结束日期
      const resultsTo = db.queryQuotes({
        endDate: '2024-01-03',
      });

      expect(resultsTo.length).toBe(4); // 01-02 (2条) + 01-03 (2条)
    });
  });

  describe('场景 2: 按股票代码查询', () => {
    it('应该能查询指定股票的所有数据', () => {
      const results = db.queryQuotes({
        tsCode: '600519.SH',
      });

      // 验证返回记录数
      expect(results.length).toBe(3); // 3个交易日的数据

      // 验证所有记录都是指定股票
      results.forEach((quote) => {
        expect(quote.tsCode).toBe('600519.SH');
      });

      // 验证按日期降序排列
      expect(results[0].tradeDate).toBe('2024-01-04');
      expect(results[1].tradeDate).toBe('2024-01-03');
      expect(results[2].tradeDate).toBe('2024-01-02');
    });

    it('应该能查询指定股票的指定时间范围数据', () => {
      const results = db.queryQuotes({
        tsCode: '600519.SH',
        startDate: '2024-01-02',
        endDate: '2024-01-03',
      });

      // 验证返回记录数
      expect(results.length).toBe(2); // 01-02 和 01-03

      // 验证所有记录都符合条件
      results.forEach((quote) => {
        expect(quote.tsCode).toBe('600519.SH');
        expect(quote.tradeDate >= '2024-01-02').toBe(true);
        expect(quote.tradeDate <= '2024-01-03').toBe(true);
      });
    });

    it('应该正确处理不存在的股票代码', () => {
      const results = db.queryQuotes({
        tsCode: '999999.SH',
      });

      expect(results.length).toBe(0);
    });
  });

  describe('场景 3: 查询并导出 CSV', () => {
    it('应该能将查询结果导出为 CSV 格式', async () => {
      // 查询数据
      const results = db.queryQuotes({
        tsCode: '600519.SH',
        limit: 10,
      });

      expect(results.length).toBeGreaterThan(0);

      // 导入导出模块
      const { handler } = await import('../../steps/export-data.step.js');

      const req = {
        query: {
          tsCode: '600519.SH',
          format: 'csv',
          limit: '10',
        },
      };

      const mockLogger = {
        info: () => {},
        warn: () => {},
        error: () => {},
      };

      const response = await handler(req, { logger: mockLogger });

      // 验证响应成功
      expect(response.status).toBe(200);
      expect(response.headers).toBeDefined();
      expect(response.headers!['Content-Type']).toContain('text/csv');

      // 验证 CSV 内容
      const csvBody = response.body as string;
      expect(csvBody).toBeTypeOf('string');

      // 验证 CSV 格式
      const lines = csvBody.split('\n').filter((line: string) => line.trim());
      expect(lines[0]).toContain('ts_code,trade_date');

      // 验证数据行数 >= 查询结果数
      expect(lines.length).toBeGreaterThanOrEqual(results.length);

      // 验证数据内容
      expect(csvBody).toContain('600519.SH');
      expect(csvBody).toContain('2024-01-');
    });

    it('应该能将查询结果导出为 JSON 格式', async () => {
      const { handler } = await import('../../steps/export-data.step.js');

      const req = {
        query: {
          tsCode: '000001.SZ',
          format: 'json',
        },
      };

      const mockLogger = {
        info: () => {},
        warn: () => {},
        error: () => {},
      };

      const response = await handler(req, { logger: mockLogger });

      // 验证响应成功
      expect(response.status).toBe(200);
      expect(response.headers).toBeDefined();
      expect(response.headers!['Content-Type']).toContain('application/json');

      // 验证 JSON 内容
      const jsonBody = response.body as {
        success: boolean;
        data: DailyQuote[];
        count: number;
      };
      expect(jsonBody.success).toBe(true);
      expect(jsonBody.data).toBeInstanceOf(Array);
      expect(jsonBody.count).toBe(2); // 000001.SZ 有 2 条记录

      // 验证数据结构
      expect(jsonBody.data[0].tsCode).toBe('000001.SZ');
      expect(jsonBody.data[0]).toHaveProperty('tradeDate');
      expect(jsonBody.data[0]).toHaveProperty('close');
    });
  });

  describe('场景 4: 数据去重测试', () => {
    it('应该能正确处理重复插入同一日期的数据', () => {
      // 初始查询
      const initialResults = db.queryQuotes({
        tsCode: '600519.SH',
        startDate: '2024-01-02',
        endDate: '2024-01-02',
      });

      const initialCount = initialResults.length;
      const initialClose = initialResults[0]?.close;

      // 重复插入相同日期的数据，但价格不同
      const duplicateQuote: Omit<DailyQuote, 'id' | 'createdAt'> = {
        tsCode: '600519.SH',
        tradeDate: '2024-01-02',
        open: 1660.0, // 不同的开盘价
        high: 1690.0,
        low: 1655.0,
        close: 1680.0, // 不同的收盘价
        preClose: 1640.0,
        change: 40.0,
        pctChg: 2.44,
        vol: 160000,
        amount: 268000000,
      };

      db.saveQuotes([duplicateQuote]);

      // 再次查询
      const updatedResults = db.queryQuotes({
        tsCode: '600519.SH',
        startDate: '2024-01-02',
        endDate: '2024-01-02',
      });

      // 验证记录数没有增加 (去重生效)
      expect(updatedResults.length).toBe(initialCount);

      // 验证数据被更新 (INSERT OR REPLACE)
      expect(updatedResults[0]?.close).toBe(1680.0);
      expect(updatedResults[0]?.close).not.toBe(initialClose);
      expect(updatedResults[0]?.open).toBe(1660.0);
    });

    it('应该能批量插入数据并正确去重', () => {
      // 准备包含重复和新数据的批量数据
      const batchQuotes: Omit<DailyQuote, 'id' | 'createdAt'>[] = [
        // 重复数据 (已存在)
        {
          tsCode: '600519.SH',
          tradeDate: '2024-01-03',
          open: 1675.0,
          high: 1695.0,
          low: 1670.0,
          close: 1690.0, // 更新后的价格
          preClose: 1670.0,
          change: 20.0,
          pctChg: 1.19,
          vol: 125000,
          amount: 210000000,
        },
        // 新数据
        {
          tsCode: '600519.SH',
          tradeDate: '2024-01-05',
          open: 1695.0,
          high: 1710.0,
          low: 1690.0,
          close: 1705.0,
          preClose: 1695.0,
          change: 10.0,
          pctChg: 0.59,
          vol: 95000,
          amount: 161000000,
        },
      ];

      // 插入前查询总数
      const beforeCount = db.queryQuotes({ tsCode: '600519.SH' }).length;

      db.saveQuotes(batchQuotes);

      // 插入后查询总数
      const afterCount = db.queryQuotes({ tsCode: '600519.SH' }).length;

      // 验证总数增加 1 (1条重复 + 1条新数据)
      expect(afterCount).toBe(beforeCount + 1);

      // 验证重复数据被更新
      const updatedQuote = db.queryQuotes({
        tsCode: '600519.SH',
        startDate: '2024-01-03',
        endDate: '2024-01-03',
      })[0];
      expect(updatedQuote?.close).toBe(1690.0);

      // 验证新数据被插入
      const newQuote = db.queryQuotes({
        tsCode: '600519.SH',
        startDate: '2024-01-05',
        endDate: '2024-01-05',
      })[0];
      expect(newQuote).toBeDefined();
      expect(newQuote?.close).toBe(1705.0);
    });
  });

  describe('Limit 参数测试', () => {
    beforeEach(() => {
      // 清理并重新插入初始测试数据
      db.clearAllData();
      db.saveQuotes(testQuotes);
    });

    it('应该正确限制返回记录数', () => {
      const results = db.queryQuotes({
        limit: 2,
      });

      expect(results.length).toBe(2);
    });

    it('应该在设置 limit 的情况下按日期降序返回最新数据', () => {
      const results = db.queryQuotes({
        limit: 1,
      });

      expect(results.length).toBe(1);
      // 最新的数据应该是初始测试数据中的最新日期 2024-01-04
      expect(results[0].tradeDate).toBe('2024-01-04');
    });
  });

  describe('数据完整性验证', () => {
    it('查询结果应该包含所有必需字段', () => {
      const results = db.queryQuotes({
        tsCode: '600519.SH',
        limit: 1,
      });

      expect(results.length).toBe(1);

      const quote = results[0];

      // 验证必需字段存在
      expect(quote).toHaveProperty('id');
      expect(quote).toHaveProperty('tsCode');
      expect(quote).toHaveProperty('tradeDate');
      expect(quote).toHaveProperty('createdAt');

      // 验证字段类型
      expect(typeof quote.id).toBe('number');
      expect(typeof quote.tsCode).toBe('string');
      expect(typeof quote.tradeDate).toBe('string');
      expect(typeof quote.createdAt).toBe('string');

      // 验证价格字段
      expect(quote).toHaveProperty('open');
      expect(quote).toHaveProperty('high');
      expect(quote).toHaveProperty('low');
      expect(quote).toHaveProperty('close');
    });

    it('插入的数据应该能完整查询回来', () => {
      // 插入新的测试数据
      const newQuote: Omit<DailyQuote, 'id' | 'createdAt'> = {
        tsCode: '600000.SH',
        tradeDate: '2024-01-10',
        open: 10.5,
        high: 10.8,
        low: 10.4,
        close: 10.7,
        preClose: 10.5,
        change: 0.2,
        pctChg: 1.9,
        vol: 100000,
        amount: 1070000,
      };

      db.saveQuotes([newQuote]);

      // 查询刚插入的数据
      const results = db.queryQuotes({
        tsCode: '600000.SH',
        startDate: '2024-01-10',
        endDate: '2024-01-10',
      });

      expect(results.length).toBe(1);

      const retrieved = results[0];

      // 验证所有字段值一致
      expect(retrieved.tsCode).toBe(newQuote.tsCode);
      expect(retrieved.tradeDate).toBe(newQuote.tradeDate);
      expect(retrieved.open).toBe(newQuote.open);
      expect(retrieved.high).toBe(newQuote.high);
      expect(retrieved.low).toBe(newQuote.low);
      expect(retrieved.close).toBe(newQuote.close);
      expect(retrieved.preClose).toBe(newQuote.preClose);
      expect(retrieved.change).toBe(newQuote.change);
      expect(retrieved.pctChg).toBe(newQuote.pctChg);
      expect(retrieved.vol).toBe(newQuote.vol);
      expect(retrieved.amount).toBe(newQuote.amount);
    });
  });
});
