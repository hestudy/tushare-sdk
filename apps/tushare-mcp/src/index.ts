#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadConfig } from './config/config.js';
import { createMCPServer } from './server.js';
import { createLogger } from './utils/logger.js';

/**
 * MCP 服务器入口点
 * 初始化配置、创建服务器实例并连接 stdio 传输层
 */
async function main(): Promise<void> {
  try {
    // 加载配置
    const config = loadConfig();
    const logger = createLogger(config.logLevel);

    logger.info('Starting Tushare MCP Server', {
      version: '1.0.0',
      logLevel: config.logLevel,
      rateLimitMaxRequests: config.rateLimitMaxRequests,
      rateLimitWindowMs: config.rateLimitWindowMs,
    });

    // 创建 MCP Server 实例
    const server = createMCPServer(config);

    // TODO: 注册工具和处理器
    // 这部分将在 Phase 3-6 中实现各个用户故事时逐步添加
    // 例如:
    // import { registerStockQuoteTool } from './handlers/stock-quote.handler.js';
    // registerStockQuoteTool(server, config);

    // 连接 stdio 传输层
    const transport = new StdioServerTransport();
    await server.connect(transport);

    logger.info('Tushare MCP Server started successfully', {
      transport: 'stdio',
    });

    // 配置优雅关闭
    const shutdown = async (signal: string): Promise<void> => {
      logger.info('Received shutdown signal', { signal });
      try {
        await server.close();
        logger.info('Server closed gracefully');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown', error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('Fatal error during server startup:', error);
    process.exit(1);
  }
}

// 启动服务器
main().catch((error) => {
  console.error('Unhandled error in main():', error);
  process.exit(1);
});
