import { describe, it, expect } from 'vitest';
import { stockBasicTool } from '../../../src/tools/stock-basic';

describe('stock-basic 工具定义', () => {
  it('应该有正确的工具名称', () => {
    expect(stockBasicTool.name).toBe('query_stock_basic');
  });

  it('应该有描述信息', () => {
    expect(stockBasicTool.description).toBeDefined();
    expect(stockBasicTool.description.length).toBeGreaterThan(10);
  });

  it('应该有有效的 inputSchema', () => {
    expect(stockBasicTool.inputSchema).toBeDefined();
    expect(stockBasicTool.inputSchema.type).toBe('object');
    expect(stockBasicTool.inputSchema.properties).toBeDefined();
  });

  it('inputSchema 应该包含 ts_code 可选字段', () => {
    const { properties } = stockBasicTool.inputSchema;
    expect(properties.ts_code).toBeDefined();
    expect(properties.ts_code.type).toBe('string');
    expect(properties.ts_code.pattern).toBeDefined();
  });

  it('inputSchema 应该包含 exchange 可选字段', () => {
    const { properties } = stockBasicTool.inputSchema;
    expect(properties.exchange).toBeDefined();
    expect(properties.exchange.type).toBe('string');
    expect(properties.exchange.enum).toEqual(['SSE', 'SZSE']);
  });

  it('inputSchema 应该包含 list_status 可选字段', () => {
    const { properties } = stockBasicTool.inputSchema;
    expect(properties.list_status).toBeDefined();
    expect(properties.list_status.type).toBe('string');
    expect(properties.list_status.enum).toEqual(['L', 'D', 'P']);
  });

  it('ts_code 应该有格式验证 pattern', () => {
    const tsCodeSchema = stockBasicTool.inputSchema.properties.ts_code;
    expect(tsCodeSchema.pattern).toBeDefined();
    // 验证正则表达式格式
    expect(tsCodeSchema.pattern).toMatch(/\^.*\$/);
  });

  it('ts_code pattern 应该验证正确的股票代码格式', () => {
    const pattern = new RegExp(stockBasicTool.inputSchema.properties.ts_code.pattern);

    // 有效格式
    expect(pattern.test('600519.SH')).toBe(true);
    expect(pattern.test('000001.SZ')).toBe(true);
    expect(pattern.test('300750.SZ')).toBe(true);

    // 无效格式
    expect(pattern.test('600519')).toBe(false);
    expect(pattern.test('600519.sh')).toBe(false);
    expect(pattern.test('AAPL')).toBe(false);
  });

  it('exchange enum 应该只接受 SSE 或 SZSE', () => {
    const exchangeEnum = stockBasicTool.inputSchema.properties.exchange.enum;
    expect(exchangeEnum).toHaveLength(2);
    expect(exchangeEnum).toContain('SSE');
    expect(exchangeEnum).toContain('SZSE');
  });

  it('list_status enum 应该只接受 L, D, 或 P', () => {
    const statusEnum = stockBasicTool.inputSchema.properties.list_status.enum;
    expect(statusEnum).toHaveLength(3);
    expect(statusEnum).toContain('L');
    expect(statusEnum).toContain('D');
    expect(statusEnum).toContain('P');
  });
});
