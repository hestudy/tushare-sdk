import { describe, it, expect } from 'vitest';
import { indexDataTool } from '../../../src/tools/index-data';

describe('Index Data Tool Definition', () => {
  it('should have correct tool name', () => {
    expect(indexDataTool.name).toBe('query_index');
  });

  it('should have valid description', () => {
    expect(indexDataTool.description).toBeTruthy();
    expect(indexDataTool.description).toContain('指数');
  });

  it('should have valid input schema with required ts_code', () => {
    expect(indexDataTool.inputSchema).toBeDefined();
    expect(indexDataTool.inputSchema.type).toBe('object');
    expect(indexDataTool.inputSchema.required).toContain('ts_code');
  });

  it('should validate ts_code pattern', () => {
    const tsCodeSchema = indexDataTool.inputSchema.properties.ts_code;
    expect(tsCodeSchema.pattern).toBe('^\\d{6}\\.(SH|SZ)$');
  });

  it('should have optional trade_date field', () => {
    const tradeDateSchema = indexDataTool.inputSchema.properties.trade_date;
    expect(tradeDateSchema).toBeDefined();
    expect(tradeDateSchema.pattern).toBe('^\\d{8}$');
    expect(indexDataTool.inputSchema.required).not.toContain('trade_date');
  });
});
