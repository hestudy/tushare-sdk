import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

describe('MCP Server - Financial Tool Integration', () => {
  let client: Client;
  let transport: StdioClientTransport;

  beforeAll(async () => {
    // 设置环境变量 (至少 32 字符)
    const tushareToken = process.env.TUSHARE_TOKEN || 'test_token_1234567890123456789012345678';
    const logLevel = 'error'; // 减少测试日志

    // 启动 MCP 服务器
    transport = new StdioClientTransport({
      command: 'tsx',
      args: ['src/index.ts'],
      cwd: process.cwd(),
      env: {
        ...process.env,
        TUSHARE_TOKEN: tushareToken,
        LOG_LEVEL: logLevel,
      },
    });

    client = new Client(
      {
        name: 'financial-integration-test',
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

  it('should list financial tool in available tools', async () => {
    const response = await client.listTools();

    const financialTool = response.tools.find(
      (tool: Tool) => tool.name === 'query_financial'
    );

    expect(financialTool).toBeDefined();
    expect(financialTool?.description).toContain('财务');
  });

  it('should successfully query income statement', async () => {
    const response = await client.callTool({
      name: 'query_financial',
      arguments: {
        ts_code: '600519.SH',
        period: '20231231',
        report_type: 'income',
      },
    });

    expect(response.content).toBeDefined();
    expect(response.content[0]).toHaveProperty('type', 'text');
    expect(response.isError).not.toBe(true);
  }, 15000);

  it('should return validation error for invalid period', async () => {
    const response = await client.callTool({
      name: 'query_financial',
      arguments: {
        ts_code: '600519.SH',
        period: '20231212', // 不是季度末
        report_type: 'income',
      },
    });

    expect(response.isError).toBe(true);
    expect(response.content[0]).toHaveProperty('type', 'text');
  }, 10000);
});
