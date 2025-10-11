import React from 'react';
import './ApiParameterTable.css';

/**
 * API 参数定义
 */
export interface ApiParameter {
  /**
   * 参数名
   */
  name: string;

  /**
   * 参数类型
   */
  type: string;

  /**
   * 是否必填
   */
  required: boolean;

  /**
   * 参数描述
   */
  description: string;

  /**
   * 默认值
   */
  default?: string;

  /**
   * 示例值
   */
  example?: string;
}

/**
 * API 参数表格组件 Props
 */
export interface ApiParameterTableProps {
  /**
   * 参数列表
   */
  parameters: ApiParameter[];

  /**
   * 是否显示示例列
   * @default true
   */
  showExample?: boolean;

  /**
   * 是否显示默认值列
   * @default true
   */
  showDefault?: boolean;

  /**
   * 自定义 CSS 类名
   */
  className?: string;
}

/**
 * API 参数表格组件
 * 
 * 用于在 API 文档中展示参数列表,支持显示参数名、类型、是否必填、描述、默认值和示例值。
 * 可以通过 props 控制是否显示默认值和示例值列。
 * 
 * @example
 * ```tsx
 * <ApiParameterTable
 *   parameters={[
 *     {
 *       name: 'ts_code',
 *       type: 'string',
 *       required: false,
 *       description: '股票代码',
 *       default: '-',
 *       example: '000001.SZ'
 *     }
 *   ]}
 * />
 * ```
 */
export function ApiParameterTable({
  parameters,
  showExample = true,
  showDefault = true,
  className = '',
}: ApiParameterTableProps): React.ReactElement {
  return (
    <div className={`api-parameter-table-wrapper ${className}`.trim()}>
      <table className="api-parameter-table" data-testid="api-parameter-table">
        <thead>
          <tr>
            <th>参数名</th>
            <th>类型</th>
            <th>必填</th>
            <th>描述</th>
            {showDefault && <th>默认值</th>}
            {showExample && <th>示例</th>}
          </tr>
        </thead>
        <tbody>
          {parameters.map((param, index) => (
            <tr key={index} data-testid="api-parameter-row">
              <td className="api-parameter-table__name">
                <code>{param.name}</code>
              </td>
              <td className="api-parameter-table__type">
                <code>{param.type}</code>
              </td>
              <td className="api-parameter-table__required">
                {param.required ? (
                  <span className="api-parameter-table__badge api-parameter-table__badge--required">
                    是
                  </span>
                ) : (
                  <span className="api-parameter-table__badge api-parameter-table__badge--optional">
                    否
                  </span>
                )}
              </td>
              <td className="api-parameter-table__description">
                {param.description}
              </td>
              {showDefault && (
                <td className="api-parameter-table__default">
                  {param.default ? <code>{param.default}</code> : '-'}
                </td>
              )}
              {showExample && (
                <td className="api-parameter-table__example">
                  {param.example ? <code>{param.example}</code> : '-'}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
