/**
 * 日志工具
 * 
 * 提供详细日志输出功能,支持 verbose 模式
 */

let verboseEnabled = false;

/**
 * 设置是否启用详细日志
 */
export function setVerbose(enabled: boolean): void {
  verboseEnabled = enabled;
}

/**
 * 获取当前是否启用详细日志
 */
export function isVerbose(): boolean {
  return verboseEnabled;
}

/**
 * 输出详细日志(仅在 verbose 模式下)
 */
export function logVerbose(message: string, data?: unknown): void {
  if (!verboseEnabled) {
    return;
  }
  
  console.log(`[VERBOSE] ${message}`);
  if (data !== undefined) {
    console.log(JSON.stringify(data, null, 2));
  }
}

/**
 * 输出 API 请求信息
 */
export function logApiRequest(apiName: string, params: unknown): void {
  if (!verboseEnabled) {
    return;
  }
  
  console.log(`\n[API 请求] ${apiName}`);
  console.log('参数:', JSON.stringify(params, null, 2));
}

/**
 * 输出 API 响应信息
 */
export function logApiResponse(apiName: string, response: unknown, duration: number): void {
  if (!verboseEnabled) {
    return;
  }
  
  console.log(`\n[API 响应] ${apiName} (耗时: ${duration}ms)`);
  
  // 如果响应是数组,只显示前几条和总数
  if (Array.isArray(response)) {
    console.log(`返回 ${response.length} 条数据`);
    if (response.length > 0) {
      console.log('示例数据 (前 3 条):');
      console.log(JSON.stringify(response.slice(0, 3), null, 2));
    }
  } else {
    console.log(JSON.stringify(response, null, 2));
  }
}

/**
 * 输出错误详情
 */
export function logError(error: unknown): void {
  if (!verboseEnabled) {
    return;
  }
  
  console.error('\n[错误详情]');
  if (error instanceof Error) {
    console.error('错误消息:', error.message);
    console.error('错误堆栈:', error.stack);
  } else {
    console.error(JSON.stringify(error, null, 2));
  }
}

/**
 * 输出配置信息
 */
export function logConfig(config: Record<string, unknown>): void {
  if (!verboseEnabled) {
    return;
  }
  
  console.log('\n[配置信息]');
  // 隐藏敏感信息(Token)
  const safeConfig = { ...config };
  if (safeConfig.tushareToken) {
    const token = String(safeConfig.tushareToken);
    safeConfig.tushareToken = token.slice(0, 8) + '***' + token.slice(-4);
  }
  console.log(JSON.stringify(safeConfig, null, 2));
}

/**
 * 输出性能信息
 */
export function logPerformance(operation: string, duration: number): void {
  if (!verboseEnabled) {
    return;
  }
  
  console.log(`\n[性能] ${operation}: ${duration}ms`);
}
