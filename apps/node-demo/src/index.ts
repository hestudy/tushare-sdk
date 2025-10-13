/**
 * Tushare SDK 演示应用主入口
 * 
 * 演示 SDK 的基本使用方法,包括:
 * - 客户端初始化
 * - API 调用
 * - 错误处理
 * - 数据展示
 */

import { loadConfig } from './config.js';
import { runExamples, calculateSummary } from './utils/example-runner.js';
import { formatOutput } from './utils/formatter.js';
import { printError, getExitCode } from './utils/error-handler.js';
import { setVerbose, logConfig, logVerbose } from './utils/logger.js';
import { runStockListExample } from './examples/stock-list.js';
import { runDailyDataExample } from './examples/daily-data.js';
import { runTradeCalendarExample } from './examples/trade-calendar.js';
import { runDailyBasicExample } from './examples/daily-basic.js';
import { runFinancialDataExample } from './examples/financial-data.js';
import type { DemoOutput, OutputFormat, ExampleName } from './types.js';

// 应用版本(从 package.json 读取)
const APP_VERSION = '1.0.0';
const SDK_VERSION = '1.0.0';

/**
 * 解析命令行参数
 */
function parseArgs(): {
  example: ExampleName;
  verbose: boolean;
  format: OutputFormat;
} {
  const args = process.argv.slice(2);
  
  let example: ExampleName = 'all';
  let verbose = false;
  let format: OutputFormat = 'console';
  
  for (const arg of args) {
    if (arg.startsWith('--example=')) {
      const exampleValue = arg.split('=')[1];
      if (exampleValue === 'stock-list' || exampleValue === 'daily-data' ||
          exampleValue === 'trade-calendar' || exampleValue === 'daily-basic' ||
          exampleValue === 'financial-data' ||
          exampleValue === 'all') {
        example = exampleValue;
      }
    } else if (arg === '--verbose') {
      verbose = true;
    } else if (arg.startsWith('--format=')) {
      const formatValue = arg.split('=')[1];
      if (formatValue === 'json' || formatValue === 'console') {
        format = formatValue;
      }
    }
  }
  
  return { example, verbose, format };
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  try {
    // 解析命令行参数
    const { example, verbose, format } = parseArgs();
    
    // 设置 verbose 模式
    setVerbose(verbose);
    
    logVerbose('启动演示应用', { example, verbose, format });
    
    // 加载配置
    const config = loadConfig();
    
    // 输出配置信息(verbose 模式)
    logConfig({
      tushareToken: config.tushareToken,
      apiBaseUrl: config.apiBaseUrl,
      debug: config.debug,
    });
    
    // 定义所有可用的示例
    const allExamples = [
      {
        name: '股票列表查询',
        key: 'stock-list' as const,
        fn: async () => runStockListExample(config),
      },
      {
        name: '日线数据查询',
        key: 'daily-data' as const,
        fn: async () => runDailyDataExample(config),
      },
      {
        name: '交易日历查询',
        key: 'trade-calendar' as const,
        fn: async () => runTradeCalendarExample(config),
      },
      {
        name: '每日指标查询',
        key: 'daily-basic' as const,
        fn: async () => runDailyBasicExample(config),
      },
      {
        name: '财务数据查询',
        key: 'financial-data' as const,
        fn: async () => runFinancialDataExample(config),
      },
    ];
    
    // 根据命令行参数筛选要执行的示例
    const examples = example === 'all' 
      ? allExamples 
      : allExamples.filter(ex => ex.key === example);
    
    // 执行所有示例
    const results = await runExamples(examples);
    
    // 计算摘要
    const summary = calculateSummary(results);
    
    // 构建输出
    const output: DemoOutput = {
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
      sdkVersion: SDK_VERSION,
      results,
      summary,
    };
    
    // 格式化输出
    formatOutput(output, format);
    
    // 根据结果设置退出码
    if (summary.failed === 0) {
      process.exit(0);
    } else if (summary.success > 0) {
      process.exit(3); // 部分失败
    } else {
      process.exit(2); // 全部失败
    }
    
  } catch (error) {
    // 处理配置错误或其他未捕获的错误
    printError(error);
    process.exit(getExitCode(error));
  }
}

// 运行主函数
main();
