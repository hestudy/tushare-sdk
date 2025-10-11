import React from 'react';
import './ApiCard.css';

/**
 * API 卡片组件 Props
 */
export interface ApiCardProps {
  /**
   * API 名称
   */
  name: string;

  /**
   * API 描述
   */
  description: string;

  /**
   * API 文档链接
   */
  link: string;

  /**
   * API 分类标签
   * @example ['股票', '基础数据']
   */
  tags?: string[];

  /**
   * 是否为新增 API
   * @default false
   */
  isNew?: boolean;

  /**
   * 是否已废弃
   * @default false
   */
  deprecated?: boolean;

  /**
   * 废弃说明(仅当 deprecated 为 true 时有效)
   */
  deprecationMessage?: string;

  /**
   * 自定义 CSS 类名
   */
  className?: string;
}

/**
 * API 卡片组件
 * 
 * 用于在文档站中展示 API 的概览信息,包括名称、描述、标签等。
 * 支持显示新增标记和废弃警告。
 * 
 * @example
 * ```tsx
 * <ApiCard
 *   name="getStockBasic"
 *   description="获取股票基础信息"
 *   link="/api/stock/basic"
 *   tags={['股票', '基础数据']}
 *   isNew={true}
 * />
 * ```
 */
export function ApiCard({
  name,
  description,
  link,
  tags = [],
  isNew = false,
  deprecated = false,
  deprecationMessage,
  className = '',
}: ApiCardProps): React.ReactElement {
  const cardClassName = `api-card ${deprecated ? 'api-card--deprecated' : ''} ${className}`.trim();

  return (
    <a href={link} className={cardClassName} data-testid="api-card">
      <div className="api-card__header">
        <h3 className="api-card__name">{name}</h3>
        <div className="api-card__badges">
          {isNew && (
            <span className="api-card__badge api-card__badge--new" data-testid="api-card-badge-new">
              新增
            </span>
          )}
          {deprecated && (
            <span className="api-card__badge api-card__badge--deprecated" data-testid="api-card-badge-deprecated">
              已废弃
            </span>
          )}
        </div>
      </div>

      <p className="api-card__description">{description}</p>

      {deprecated && deprecationMessage && (
        <div className="api-card__deprecation" data-testid="api-card-deprecation">
          <strong>废弃说明:</strong> {deprecationMessage}
        </div>
      )}

      {tags.length > 0 && (
        <div className="api-card__tags" data-testid="api-card-tags">
          {tags.map((tag, index) => (
            <span key={index} className="api-card__tag">
              {tag}
            </span>
          ))}
        </div>
      )}
    </a>
  );
}
