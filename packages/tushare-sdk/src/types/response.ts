/**
 * Tushare API 响应数据结构
 */
export interface TushareResponseData {
  /** 字段名列表 */
  fields: string[];

  /** 数据项列表 (每项是数组) */
  items: unknown[][];
}

/**
 * Tushare API 响应结构
 */
export interface TushareResponse {
  /** 响应代码: 0 表示成功, 其他表示失败 */
  code: number;

  /** 响应消息 */
  msg: string;

  /** 响应数据 (成功时存在) */
  data: TushareResponseData | null;
}

/**
 * Tushare API 请求结构
 */
export interface TushareRequest {
  /** API 名称 (如 'stock_basic', 'daily') */
  api_name: string;

  /** 认证 Token */
  token: string;

  /** 请求参数 */
  params?: Record<string, unknown>;

  /** 返回字段 (逗号分隔的字段名) */
  fields?: string;
}

/**
 * 将 Tushare 响应数据转换为对象数组
 * 
 * @param data - Tushare 响应数据
 * @returns 对象数组
 * 
 * @example
 * ```typescript
 * const data = {
 *   fields: ['ts_code', 'name'],
 *   items: [
 *     ['000001.SZ', '平安银行'],
 *     ['000002.SZ', '万科A']
 *   ]
 * };
 * 
 * const result = transformResponseData(data);
 * // [
 * //   { ts_code: '000001.SZ', name: '平安银行' },
 * //   { ts_code: '000002.SZ', name: '万科A' }
 * // ]
 * ```
 */
export function transformResponseData<T = Record<string, unknown>>(
  data: TushareResponseData
): T[] {
  const { fields, items } = data;
  const result: T[] = [];

  // 使用 for 循环优化性能
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item) continue;
    
    const obj: Record<string, unknown> = {};

    for (let j = 0; j < fields.length; j++) {
      const field = fields[j];
      if (field) {
        obj[field] = item[j];
      }
    }

    result.push(obj as T);
  }

  return result;
}
