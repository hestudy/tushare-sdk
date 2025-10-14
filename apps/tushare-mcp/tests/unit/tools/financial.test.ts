import { describe, it, expect } from 'vitest';
import { financialTool } from '../../../src/tools/financial';

describe('Financial Tool Definition', () => {
  it('should have correct tool name', () => {
    expect(financialTool.name).toBe('query_financial');
  });

  it('should have valid description', () => {
    expect(financialTool.description).toBeTruthy();
    expect(financialTool.description).toContain('财务');
  });

  it('should have valid input schema with required fields', () => {
    expect(financialTool.inputSchema).toBeDefined();
    expect(financialTool.inputSchema.type).toBe('object');
    expect(financialTool.inputSchema.required).toContain('ts_code');
    expect(financialTool.inputSchema.required).toContain('period');
    expect(financialTool.inputSchema.required).toContain('report_type');
  });

  it('should validate ts_code pattern', () => {
    const tsCodeSchema = financialTool.inputSchema.properties.ts_code;
    expect(tsCodeSchema.pattern).toBe('^\\d{6}\\.(SH|SZ)$');
  });

  it('should validate period pattern for quarter end dates', () => {
    const periodSchema = financialTool.inputSchema.properties.period;
    expect(periodSchema.pattern).toBe('^\\d{4}(0331|0630|0930|1231)$');
  });

  it('should have valid report_type enum', () => {
    const reportTypeSchema = financialTool.inputSchema.properties.report_type;
    expect(reportTypeSchema.enum).toEqual(['income', 'balance', 'cashflow']);
  });
});
