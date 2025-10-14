import { describe, it, expect } from 'vitest';
import { klineTool } from '../../../src/tools/kline';

describe('K-Line Tool Definition', () => {
  it('should have correct tool name', () => {
    expect(klineTool.name).toBe('query_kline');
  });

  it('should have valid description', () => {
    expect(klineTool.description).toBeTruthy();
    expect(klineTool.description).toContain('K线');
  });

  it('should have valid input schema with required fields', () => {
    expect(klineTool.inputSchema).toBeDefined();
    expect(klineTool.inputSchema.type).toBe('object');
    expect(klineTool.inputSchema.required).toContain('ts_code');
    expect(klineTool.inputSchema.required).toContain('start_date');
    expect(klineTool.inputSchema.required).toContain('end_date');
  });

  it('should validate ts_code pattern', () => {
    const tsCodeSchema = klineTool.inputSchema.properties.ts_code;
    expect(tsCodeSchema.pattern).toBe('^\\d{6}\\.(SH|SZ)$');
  });

  it('should validate date patterns', () => {
    const startDateSchema = klineTool.inputSchema.properties.start_date;
    const endDateSchema = klineTool.inputSchema.properties.end_date;
    expect(startDateSchema.pattern).toBe('^\\d{8}$');
    expect(endDateSchema.pattern).toBe('^\\d{8}$');
  });

  it('should have valid freq enum', () => {
    const freqSchema = klineTool.inputSchema.properties.freq;
    expect(freqSchema.enum).toEqual(['D', 'W', 'M']);
  });
});
