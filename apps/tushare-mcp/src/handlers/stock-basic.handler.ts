import { z } from 'zod';
import { TushareClient } from '@hestudy/tushare-sdk';
import type { ToolCallResponse, TextContent } from '../types/mcp-tools.types.js';
import { handleTushareError } from '../utils/error-handler.js';
import { createLogger } from '../utils/logger.js';
import { formatDate } from '../utils/date-formatter.js';

const logger = createLogger('info');

/**
 * 股票基本信息查询参数 schema
 */
const StockBasicArgsSchema = z
  .object({
    ts_code: z
      .string()
      .regex(/^\d{6}\.(SH|SZ)$/, '股票代码格式错误,示例: 600519.SH')
      .optional(),
    exchange: z.enum(['SSE', 'SZSE'], {
      errorMap: () => ({ message: '交易所代码必须为 SSE 或 SZSE' }),
    }).optional(),
    list_status: z.enum(['L', 'D', 'P'], {
      errorMap: () => ({ message: '上市状态必须为 L(上市)、D(退市)或 P(暂停)' }),
    }).optional(),
  })
  .refine(
    (data) => data.ts_code || data.exchange || data.list_status,
    {
      message: '请提供至少一个筛选条件(股票代码、交易所或上市状态)',
    }
  );

/**
 * 股票基本信息数据类型
 */
interface StockBasicData {
  ts_code: string;
  symbol: string;
  name: string;
  area: string;
  industry: string;
  market: string;
  exchange: string;
  list_status: string;
  list_date: string;
  delist_date?: string;
  fullname?: string;
}

/**
 * 处理股票基本信息查询请求
 *
 * @param args - 工具调用参数
 * @returns MCP 工具响应,包含文本内容和结构化数据
 * @throws 参数验证失败或 API 调用失败时抛出错误
 */
export async function handleStockBasic(
  args: unknown
): Promise<ToolCallResponse> {
  try {
    // 1. 参数验证
    logger.debug('验证股票基本信息查询参数', { args });
    const validated = StockBasicArgsSchema.parse(args);

    // 2. 调用 Tushare SDK
    logger.info('调用 Tushare API 查询股票基本信息', validated);

    const client = new TushareClient({
      token: process.env.TUSHARE_TOKEN || '',
    });

    const response = await client.getStockBasic(validated);

    // 3. 检查返回数据
    if (!response || response.length === 0) {
      logger.warn('未找到股票基本信息', validated);
      throw new Error(
        validated.ts_code
          ? `未找到股票 ${validated.ts_code},请检查代码是否正确`
          : '未找到符合条件的股票数据'
      );
    }

    // 4. 格式化响应
    const data = response[0] as StockBasicData;

    // 单个股票查询或批量查询?
    if (validated.ts_code || response.length === 1) {
      // 单个股票:显示完整信息
      const text = formatSingleStockText(data);
      logger.info('股票基本信息查询成功', { ts_code: data.ts_code });

      return {
        content: [
          {
            type: 'text',
            text,
          } as TextContent,
        ],
        structuredContent: data,
      };
    } else {
      // 批量查询:显示简化列表
      const text = formatStockListText(response as StockBasicData[], validated);
      logger.info('股票列表查询成功', { count: response.length });

      return {
        content: [
          {
            type: 'text',
            text,
          } as TextContent,
        ],
        structuredContent: response.slice(0, 50), // 限制返回数量
      };
    }
  } catch (error) {
    // 5. 错误处理
    logger.error('股票基本信息查询失败', { error });
    return handleTushareError(error);
  }
}

/**
 * 格式化单个股票基本信息为文本
 *
 * @param data - 股票基本信息数据
 * @returns 格式化后的文本描述
 */
function formatSingleStockText(data: StockBasicData): string {
  const {
    ts_code,
    name,
    industry,
    market,
    list_date,
    list_status,
    area,
    delist_date,
  } = data;

  // 格式化上市状态
  const statusMap: Record<string, string> = {
    L: '正常上市',
    D: '已退市',
    P: '暂停上市',
  };
  const statusText = statusMap[list_status] || list_status;

  // 基本信息
  let text = `股票基本信息:
- 股票代码: ${ts_code}
- 股票名称: ${name}
- 所属行业: ${industry}
- 所属市场: ${market}
- 所属地区: ${area}
- 上市日期: ${formatDate(list_date)}
- 上市状态: ${statusText}`;

  // 如果已退市,显示退市日期
  if (list_status === 'D' && delist_date) {
    text += `\n- 退市日期: ${formatDate(delist_date)}`;
  }

  return text;
}

/**
 * 格式化股票列表为文本
 *
 * @param data - 股票列表数据
 * @param filters - 筛选条件
 * @returns 格式化后的文本描述
 */
function formatStockListText(
  data: StockBasicData[],
  filters: { exchange?: string; list_status?: string }
): string {
  const { exchange, list_status } = filters;

  // 构建标题
  let title = '';
  if (exchange && list_status) {
    const exchangeMap: Record<string, string> = { SSE: '上交所', SZSE: '深交所' };
    const statusMap: Record<string, string> = { L: '上市', D: '退市', P: '暂停上市' };
    title = `${exchangeMap[exchange]}${statusMap[list_status]}股票列表`;
  } else if (exchange) {
    const exchangeMap: Record<string, string> = { SSE: '上交所', SZSE: '深交所' };
    title = `${exchangeMap[exchange]}股票列表`;
  } else if (list_status) {
    const statusMap: Record<string, string> = { L: '上市', D: '退市', P: '暂停上市' };
    title = `${statusMap[list_status]}股票列表`;
  } else {
    title = '股票列表';
  }

  // 只显示前 50 条
  const displayData = data.slice(0, 50);
  const listText = displayData
    .map((stock, index) => `${index + 1}. ${stock.ts_code} - ${stock.name}`)
    .join('\n');

  let text = `${title}(前50条):\n${listText}`;

  // 如果数据超过 50 条,添加提示
  if (data.length > 50) {
    text += `\n\n提示:共找到 ${data.length} 只股票,仅显示前 50 条。如需查询特定股票,请提供股票代码。`;
  }

  return text;
}
