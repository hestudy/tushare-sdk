import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

describe('MCP Server - K-Line Tool Integration', () => {
  let client: Client;
  let transport: StdioClientTransport;

  beforeAll(async () => {
    process.env.TUSHARE_TOKEN = process.env.TUSHARE_TOKEN || 'test_token';
    process.env.LOG_LEVEL = 'error';

    transport = new StdioClientTransport({
      command: 'tsx',
      args: ['src/index.ts'],
      cwd: process.cwd(),
    });

    client = new Client(
      {
        name: 'kline-integration-test',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );

    await client.connect(transport);
  }, 30000);

  afterAll(async () => {
    await client.close();
  });

  it('should list kline tool in available tools', async () => {
    const response = await client.listTools();

    const klineTool = response.tools.find(
      (tool: Tool) => tool.name === 'query_kline'
    );

    expect(klineTool).toBeDefined();
    expect(klineTool?.description).toContain('K线');
  });

  it('should successfully query daily K-line data', async () => {
    const response = await client.callTool({
      name: 'query_kline',
      arguments: {
        ts_code: '600519.SH',
        start_date: '20230901',
        end_date: '20230930',
        freq: 'D',
      },
    });

    expect(response.content).toBeDefined();
    expect(response.content[0]).toHaveProperty('type', 'text');
    expect(response.isError).not.toBe(true);
  }, 15000);

  it('should return validation error for invalid date range', async () => {
    const response = await client.callTool({
      name: 'query_kline',
      arguments: {
        ts_code: '600519.SH',
        start_date: '20251002',
        end_date: '20251001',
      },
    });

    expect(response.isError).toBe(true);
    expect(response.content[0]).toHaveProperty('type', 'text');
  }, 10000);
});
