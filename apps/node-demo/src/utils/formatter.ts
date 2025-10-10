/**
 * 输出格式化工具
 * 
 * 支持控制台和 JSON 两种输出格式
 */

import type { DemoOutput, ExampleResult, OutputFormat } from '../types.js';

/**
 * 格式化演示输出
 * 
 * @param output - 演示输出数据
 * @param format - 输出格式
 */
export function formatOutput(output: DemoOutput, format: OutputFormat): void {
  if (format === 'json') {
    formatJson(output);
  } else {
    formatConsole(output);
  }
}

/**
 * 格式化为 JSON 输出
 * 
 * @param output - 演示输出数据
 */
function formatJson(output: DemoOutput): void {
  console.log(JSON.stringify(output, null, 2));
}

/**
 * 格式化为控制台输出
 * 
 * @param output - 演示输出数据
 */
function formatConsole(output: DemoOutput): void {
  // 打印标题
  printHeader(output);
  
  // 打印每个示例的结果
  output.results.forEach((result, index) => {
    printExampleResult(result, index + 1, output.results.length);
  });
  
  // 打印摘要
  printSummary(output.summary);
}

/**
 * 打印标题
 * 
 * @param output - 演示输出数据
 */
function printHeader(output: DemoOutput): void {
  console.log('\n========================================');
  console.log('Tushare SDK 演示应用');
  console.log(`版本: ${output.version}`);
  console.log(`SDK 版本: ${output.sdkVersion}`);
  console.log(`时间: ${new Date(output.timestamp).toLocaleString('zh-CN')}`);
  console.log('========================================\n');
}

/**
 * 打印示例结果
 * 
 * @param result - 示例结果
 * @param index - 当前索引
 * @param total - 总数
 */
function printExampleResult(result: ExampleResult, index: number, total: number): void {
  console.log(`[${index}/${total}] 运行示例: ${result.name}`);
  
  if (result.success) {
    console.log(`✓ 成功 (耗时: ${result.duration}ms)`);
    
    if (result.data && typeof result.data === 'object' && 'count' in result.data) {
      const count = (result.data as { count: number }).count;
      console.log(`返回 ${count} 条数据`);
    }
  } else {
    console.log(`✗ 失败 (耗时: ${result.duration}ms)`);
    
    if (result.error) {
      console.log(`错误类型: ${result.error.type}`);
      console.log(`错误信息: ${result.error.message}`);
      
      if (result.error.code) {
        console.log(`错误代码: ${result.error.code}`);
      }
    }
  }
  
  console.log('');
}

/**
 * 打印摘要
 * 
 * @param summary - 摘要数据
 */
function printSummary(summary: { total: number; success: number; failed: number; totalDuration: number }): void {
  console.log('========================================');
  console.log('执行摘要');
  console.log('========================================');
  console.log(`总计: ${summary.total} 个示例`);
  console.log(`成功: ${summary.success} 个`);
  console.log(`失败: ${summary.failed} 个`);
  console.log(`总耗时: ${summary.totalDuration}ms`);
  console.log('========================================\n');
}

/**
 * 格式化表格数据
 * 
 * @param data - 数据数组
 * @param columns - 列定义
 */
export function formatTable(
  data: Array<Record<string, unknown>>,
  columns: Array<{ key: string; label: string; width?: number }>
): void {
  if (data.length === 0) {
    console.log('(无数据)');
    return;
  }

  // 打印表头
  const header = columns.map(col => col.label.padEnd(col.width || 12)).join(' | ');
  console.log(header);
  console.log('-'.repeat(header.length));

  // 打印数据行(最多显示 5 行)
  const displayData = data.slice(0, 5);
  displayData.forEach(row => {
    const line = columns.map(col => {
      const value = String(row[col.key] ?? '');
      return value.padEnd(col.width || 12);
    }).join(' | ');
    console.log(line);
  });

  if (data.length > 5) {
    console.log(`... (还有 ${data.length - 5} 条数据)`);
  }
}
