import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolResult,
} from '@modelcontextprotocol/sdk/types.js';
import type {
  MCPToolDefinition,
  ServerConfig,
  ToolCallResponse,
} from './types/mcp-tools.types.js';
import { createLogger } from './utils/logger.js';
import { createRateLimiter } from './utils/rate-limiter.js';

/**
 * 创建并配置 MCP Server 实例
 *
 * @param config 服务器配置
 * @returns 配置完成的 MCP Server 实例
 */
export function createMCPServer(config: ServerConfig): Server {
  const logger = createLogger(config.logLevel);
  const rateLimiter = createRateLimiter({
    maxRequests: config.rateLimitMaxRequests,
    windowMs: config.rateLimitWindowMs,
  });

  // 初始化 MCP Server
  const server = new Server(
    {
      name: 'tushare-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // 工具注册表
  const tools: MCPToolDefinition[] = [];

  // 工具处理器映射
  const toolHandlers = new Map<
    string,
    (args: Record<string, unknown>) => Promise<ToolCallResponse>
  >();

  /**
   * ListToolsRequestSchema handler
   * 返回所有已注册的工具列表
   */
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    logger.debug('ListTools request received');
    return {
      tools,
    };
  });

  /**
   * CallToolRequestSchema handler
   * 处理工具调用请求,包含限流检查和错误处理
   */
  server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
    const { name, arguments: args = {} } = request.params;

    logger.debug('CallTool request received', { toolName: name, args });

    // 限流检查
    if (!rateLimiter.tryAcquire()) {
      const nextResetTime = rateLimiter.getNextResetTime();
      const waitSeconds = Math.ceil((nextResetTime - Date.now()) / 1000);

      logger.warn('Rate limit exceeded', {
        toolName: name,
        remainingQuota: rateLimiter.getRemainingQuota(),
        nextResetTime,
      });

      return {
        content: [
          {
            type: 'text' as const,
            text:
              '请求过于频繁,已触发限流保护,请稍后重试。' +
              `\n当前限流配置:${config.rateLimitMaxRequests}次/${Math.round(config.rateLimitWindowMs / 1000)}秒` +
              `\n预计${waitSeconds}秒后恢复`,
          },
        ],
        isError: true,
      };
    }

    // 查找工具处理器
    const handler = toolHandlers.get(name);
    if (!handler) {
      logger.error('Tool not found', { toolName: name });
      return {
        content: [
          {
            type: 'text' as const,
            text: `未找到工具: ${name}`,
          },
        ],
        isError: true,
      };
    }

    // 执行工具处理器
    try {
      const response = await handler(args);
      logger.info('Tool call success', {
        toolName: name,
        remainingQuota: rateLimiter.getRemainingQuota(),
      });
      return response as CallToolResult;
    } catch (error) {
      logger.error('Tool call failed', {
        toolName: name,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  });

  return server;
}

