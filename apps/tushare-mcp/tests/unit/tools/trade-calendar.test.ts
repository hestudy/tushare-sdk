import { describe, it, expect } from 'vitest';
import { tradeCalendarTool } from '../../../src/tools/trade-calendar';

describe('trade-calendar 工具定义', () => {
  it('应该有正确的工具名称', () => {
    expect(tradeCalendarTool.name).toBe('query_trade_calendar');
  });

  it('应该有描述信息', () => {
    expect(tradeCalendarTool.description).toBeDefined();
    expect(tradeCalendarTool.description.length).toBeGreaterThan(10);
  });

  it('应该有有效的 inputSchema', () => {
    expect(tradeCalendarTool.inputSchema).toBeDefined();
    expect(tradeCalendarTool.inputSchema.type).toBe('object');
    expect(tradeCalendarTool.inputSchema.properties).toBeDefined();
  });

  it('inputSchema 应该包含 start_date 必填字段', () => {
    const { properties, required } = tradeCalendarTool.inputSchema;
    expect(properties.start_date).toBeDefined();
    expect(properties.start_date.type).toBe('string');
    expect(required).toContain('start_date');
  });

  it('inputSchema 应该包含 end_date 必填字段', () => {
    const { properties, required } = tradeCalendarTool.inputSchema;
    expect(properties.end_date).toBeDefined();
    expect(properties.end_date.type).toBe('string');
    expect(required).toContain('end_date');
  });

  it('inputSchema 应该包含 exchange 可选字段', () => {
    const { properties, required } = tradeCalendarTool.inputSchema;
    expect(properties.exchange).toBeDefined();
    expect(properties.exchange.type).toBe('string');
    expect(required).not.toContain('exchange');
    expect(properties.exchange.enum).toEqual(['SSE', 'SZSE']);
  });

  it('start_date 应该有格式验证 pattern', () => {
    const startDateSchema = tradeCalendarTool.inputSchema.properties.start_date;
    expect(startDateSchema.pattern).toBeDefined();
    expect(startDateSchema.pattern).toMatch(/\^.*\$/);
  });

  it('end_date 应该有格式验证 pattern', () => {
    const endDateSchema = tradeCalendarTool.inputSchema.properties.end_date;
    expect(endDateSchema.pattern).toBeDefined();
    expect(endDateSchema.pattern).toMatch(/\^.*\$/);
  });

  it('date pattern 应该验证正确的日期格式', () => {
    const pattern = new RegExp(tradeCalendarTool.inputSchema.properties.start_date.pattern);

    // 有效格式
    expect(pattern.test('20251014')).toBe(true);
    expect(pattern.test('20250101')).toBe(true);
    expect(pattern.test('20991231')).toBe(true);

    // 无效格式
    expect(pattern.test('2025-10-14')).toBe(false);
    expect(pattern.test('202510')).toBe(false);
    expect(pattern.test('20251014T00:00:00')).toBe(false);
  });

  it('exchange enum 应该只接受 SSE 或 SZSE', () => {
    const exchangeEnum = tradeCalendarTool.inputSchema.properties.exchange.enum;
    expect(exchangeEnum).toHaveLength(2);
    expect(exchangeEnum).toContain('SSE');
    expect(exchangeEnum).toContain('SZSE');
  });
});
