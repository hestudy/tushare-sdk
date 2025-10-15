import { describe, it, expect } from 'vitest';
import { dailyBasicTool } from '../../../src/tools/daily-basic';

describe('daily-basic 工具定义', () => {
  it('应该有正确的工具名称', () => {
    expect(dailyBasicTool.name).toBe('query_daily_basic');
  });

  it('应该有描述信息', () => {
    expect(dailyBasicTool.description).toBeDefined();
    expect(dailyBasicTool.description.length).toBeGreaterThan(10);
  });

  it('应该有有效的 inputSchema', () => {
    expect(dailyBasicTool.inputSchema).toBeDefined();
    expect(dailyBasicTool.inputSchema.type).toBe('object');
    expect(dailyBasicTool.inputSchema.properties).toBeDefined();
  });

  it('inputSchema 应该包含 ts_code 必填字段', () => {
    const { properties, required } = dailyBasicTool.inputSchema;
    expect(properties.ts_code).toBeDefined();
    expect(properties.ts_code.type).toBe('string');
    expect(required).toContain('ts_code');
  });

  it('inputSchema 应该包含 trade_date 可选字段', () => {
    const { properties, required } = dailyBasicTool.inputSchema;
    expect(properties.trade_date).toBeDefined();
    expect(properties.trade_date.type).toBe('string');
    expect(required).not.toContain('trade_date');
  });

  it('inputSchema 应该包含 start_date 可选字段', () => {
    const { properties, required } = dailyBasicTool.inputSchema;
    expect(properties.start_date).toBeDefined();
    expect(properties.start_date.type).toBe('string');
    expect(required).not.toContain('start_date');
  });

  it('inputSchema 应该包含 end_date 可选字段', () => {
    const { properties, required } = dailyBasicTool.inputSchema;
    expect(properties.end_date).toBeDefined();
    expect(properties.end_date.type).toBe('string');
    expect(required).not.toContain('end_date');
  });

  it('ts_code 应该有格式验证 pattern', () => {
    const tsCodeSchema = dailyBasicTool.inputSchema.properties.ts_code;
    expect(tsCodeSchema.pattern).toBeDefined();
    expect(tsCodeSchema.pattern).toMatch(/\^.*\$/);
  });

  it('trade_date 应该有格式验证 pattern', () => {
    const tradeDateSchema = dailyBasicTool.inputSchema.properties.trade_date;
    expect(tradeDateSchema.pattern).toBeDefined();
    expect(tradeDateSchema.pattern).toMatch(/\^.*\$/);
  });

  it('start_date 应该有格式验证 pattern', () => {
    const startDateSchema = dailyBasicTool.inputSchema.properties.start_date;
    expect(startDateSchema.pattern).toBeDefined();
    expect(startDateSchema.pattern).toMatch(/\^.*\$/);
  });

  it('end_date 应该有格式验证 pattern', () => {
    const endDateSchema = dailyBasicTool.inputSchema.properties.end_date;
    expect(endDateSchema.pattern).toBeDefined();
    expect(endDateSchema.pattern).toMatch(/\^.*\$/);
  });

  it('ts_code pattern 应该验证正确的股票代码格式', () => {
    const pattern = new RegExp(dailyBasicTool.inputSchema.properties.ts_code.pattern);

    // 有效格式
    expect(pattern.test('600519.SH')).toBe(true);
    expect(pattern.test('000001.SZ')).toBe(true);
    expect(pattern.test('300750.SZ')).toBe(true);

    // 无效格式
    expect(pattern.test('600519')).toBe(false);
    expect(pattern.test('600519.sh')).toBe(false);
    expect(pattern.test('AAPL')).toBe(false);
  });

  it('date pattern 应该验证正确的日期格式', () => {
    const pattern = new RegExp(dailyBasicTool.inputSchema.properties.trade_date.pattern);

    // 有效格式
    expect(pattern.test('20251014')).toBe(true);
    expect(pattern.test('20250101')).toBe(true);

    // 无效格式
    expect(pattern.test('2025-10-14')).toBe(false);
    expect(pattern.test('202510')).toBe(false);
    expect(pattern.test('20251014T00:00:00')).toBe(false);
  });
});
