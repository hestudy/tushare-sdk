import { describe, it, expect } from 'vitest';
import { stockQuoteTool } from '../../../src/tools/stock-quote';

describe('stock-quote 工具定义', () => {
  it('应该有正确的工具名称', () => {
    expect(stockQuoteTool.name).toBe('query_stock_quote');
  });

  it('应该有描述信息', () => {
    expect(stockQuoteTool.description).toBeDefined();
    expect(stockQuoteTool.description.length).toBeGreaterThan(10);
  });

  it('应该有有效的 inputSchema', () => {
    expect(stockQuoteTool.inputSchema).toBeDefined();
    expect(stockQuoteTool.inputSchema.type).toBe('object');
    expect(stockQuoteTool.inputSchema.properties).toBeDefined();
  });

  it('inputSchema 应该包含 ts_code 必填字段', () => {
    const { properties, required } = stockQuoteTool.inputSchema;
    expect(properties.ts_code).toBeDefined();
    expect(properties.ts_code.type).toBe('string');
    expect(required).toContain('ts_code');
  });

  it('inputSchema 应该包含 trade_date 可选字段', () => {
    const { properties, required } = stockQuoteTool.inputSchema;
    expect(properties.trade_date).toBeDefined();
    expect(properties.trade_date.type).toBe('string');
    expect(required).not.toContain('trade_date');
  });

  it('ts_code 应该有格式验证 pattern', () => {
    const tsCodeSchema = stockQuoteTool.inputSchema.properties.ts_code;
    expect(tsCodeSchema.pattern).toBeDefined();
    // 验证正则表达式格式
    expect(tsCodeSchema.pattern).toMatch(/\^.*\$/);
  });

  it('trade_date 应该有格式验证 pattern', () => {
    const tradeDateSchema = stockQuoteTool.inputSchema.properties.trade_date;
    expect(tradeDateSchema.pattern).toBeDefined();
    // 验证正则表达式格式
    expect(tradeDateSchema.pattern).toMatch(/\^.*\$/);
  });
});
