import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

// 检查是否有有效的 Tushare token (非测试用的假 token)
const hasValidToken = () => {
  const token = process.env.TUSHARE_TOKEN;
  return token && token.length > 0 && !token.startsWith('test_token_');
};

describe('MCP Server - Index Data Tool Integration', () => {
  let client: Client;
  let transport: StdioClientTransport;

  beforeAll(async () => {
    if (!hasValidToken()) {
      console.warn('⚠️  跳过集成测试: 未设置有效的 TUSHARE_TOKEN 环境变量');
      return;
    }

    const tushareToken = process.env.TUSHARE_TOKEN!;
    const logLevel = 'error';

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
        name: 'index-data-integration-test',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );

    await client.connect(transport);
  }, 30000);

  afterAll(async () => {
    if (client) {
      await client.close();
    }
  });

  it.skipIf(!hasValidToken())('should list index-data tool in available tools', async () => {
    const response = await client.listTools();

    const indexTool = response.tools.find(
      (tool: Tool) => tool.name === 'query_index'
    );

    expect(indexTool).toBeDefined();
    expect(indexTool?.description).toContain('指数');
  });

  it.skipIf(!hasValidToken())('should successfully query index data', async () => {
    const response = await client.callTool({
      name: 'query_index',
      arguments: {
        ts_code: '000001.SH',
      },
    });

    expect(response.content).toBeDefined();
    expect(response.content[0]).toHaveProperty('type', 'text');
    expect(response.isError).not.toBe(true);
  }, 15000);

  it.skipIf(!hasValidToken())('should return validation error for invalid index code', async () => {
    const response = await client.callTool({
      name: 'query_index',
      arguments: {
        ts_code: 'INVALID',
      },
    });

    expect(response.isError).toBe(true);
    expect(response.content[0]).toHaveProperty('type', 'text');
  }, 10000);
});
