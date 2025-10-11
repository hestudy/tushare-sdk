import React, { useState } from 'react';
import './Callout.css';

/**
 * 提示框组件 Props
 */
export interface CalloutProps {
  /**
   * 提示框类型
   * - info: 信息提示
   * - warning: 警告提示
   * - danger: 危险提示
   * - success: 成功提示
   */
  type: 'info' | 'warning' | 'danger' | 'success';

  /**
   * 提示框标题
   */
  title?: string;

  /**
   * 提示框内容
   */
  children: React.ReactNode;

  /**
   * 是否可折叠
   * @default false
   */
  collapsible?: boolean;

  /**
   * 默认是否展开(仅当 collapsible 为 true 时有效)
   * @default true
   */
  defaultOpen?: boolean;

  /**
   * 自定义 CSS 类名
   */
  className?: string;
}

/**
 * 提示框组件
 * 
 * 用于在文档中显示重要信息、警告、错误或成功消息。
 * 支持四种类型(info, warning, danger, success),可选择性地支持折叠功能。
 * 
 * @example
 * ```tsx
 * <Callout type="info" title="提示">
 *   这是一条信息提示
 * </Callout>
 * 
 * <Callout type="warning" title="注意" collapsible defaultOpen={false}>
 *   这是一条可折叠的警告
 * </Callout>
 * ```
 */
export function Callout({
  type,
  title,
  children,
  collapsible = false,
  defaultOpen = true,
  className = '',
}: CalloutProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const icons = {
    info: 'ℹ️',
    warning: '⚠️',
    danger: '❌',
    success: '✅',
  };

  const defaultTitles = {
    info: '信息',
    warning: '警告',
    danger: '危险',
    success: '成功',
  };

  const displayTitle = title || defaultTitles[type];

  const handleToggle = () => {
    if (collapsible) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div
      className={`callout callout--${type} ${className}`.trim()}
      data-testid="callout"
      data-type={type}
    >
      <div
        className={`callout__header ${collapsible ? 'callout__header--collapsible' : ''}`}
        onClick={handleToggle}
        data-testid="callout-header"
      >
        <span className="callout__icon" data-testid="callout-icon">
          {icons[type]}
        </span>
        <span className="callout__title" data-testid="callout-title">
          {displayTitle}
        </span>
        {collapsible && (
          <span
            className={`callout__toggle ${isOpen ? 'callout__toggle--open' : ''}`}
            data-testid="callout-toggle"
          >
            ▼
          </span>
        )}
      </div>
      {(!collapsible || isOpen) && (
        <div className="callout__content" data-testid="callout-content">
          {children}
        </div>
      )}
    </div>
  );
}
