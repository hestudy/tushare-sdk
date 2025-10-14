import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

// 检查是否有有效的 Tushare token (非测试用的假 token)
const hasValidToken = () => {
  const token = process.env.TUSHARE_TOKEN;
  return token && token.length > 0 && !token.startsWith('test_token_');
};

describe('MCP Server - Financial Tool Integration', () => {
  let client: Client;
  let transport: StdioClientTransport;

  beforeAll(async () => {
    if (!hasValidToken()) {
      console.warn('⚠️  跳过集成测试: 未设置有效的 TUSHARE_TOKEN 环境变量');
      return;
    }

    // 设置环境变量
    const tushareToken = process.env.TUSHARE_TOKEN!;
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
    if (client) {
      await client.close();
    }
  });

  it.skipIf(!hasValidToken())('should list financial tool in available tools', async () => {
    const response = await client.listTools();

    const financialTool = response.tools.find(
      (tool: Tool) => tool.name === 'query_financial'
    );

    expect(financialTool).toBeDefined();
    expect(financialTool?.description).toContain('财务');
  });

  it.skipIf(!hasValidToken())('should successfully query income statement', async () => {
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

  it.skipIf(!hasValidToken())('should return validation error for invalid period', async () => {
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
