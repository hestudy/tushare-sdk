import React from 'react';
import './VersionBadge.css';

/**
 * 版本标签组件 Props
 */
export interface VersionBadgeProps {
  /**
   * 版本号
   * @example 'v1.2.0'
   */
  version: string;

  /**
   * 版本状态
   * - latest: 最新版本
   * - stable: 稳定版本
   * - deprecated: 已废弃版本
   * @default 'stable'
   */
  status?: 'latest' | 'stable' | 'deprecated';

  /**
   * 是否显示为链接
   * @default false
   */
  linkable?: boolean;

  /**
   * 链接地址(仅当 linkable 为 true 时有效)
   */
  href?: string;

  /**
   * 自定义 CSS 类名
   */
  className?: string;
}

/**
 * 版本标签组件
 * 
 * 用于显示 SDK 或 API 的版本信息,支持不同的版本状态样式。
 * 可以配置为链接形式,方便用户切换版本。
 * 
 * @example
 * ```tsx
 * <VersionBadge version="v1.2.0" status="latest" />
 * <VersionBadge version="v1.1.0" status="stable" linkable href="/v1.1.0" />
 * <VersionBadge version="v1.0.0" status="deprecated" />
 * ```
 */
export function VersionBadge({
  version,
  status = 'stable',
  linkable = false,
  href,
  className = '',
}: VersionBadgeProps): React.ReactElement {
  const badgeClassName = `version-badge version-badge--${status} ${className}`.trim();

  const statusText = {
    latest: '最新',
    stable: '稳定',
    deprecated: '已废弃',
  };

  const content = (
    <>
      <span className="version-badge__version" data-testid="version-badge-version">
        {version}
      </span>
      <span className="version-badge__status" data-testid="version-badge-status">
        {statusText[status]}
      </span>
    </>
  );

  if (linkable && href) {
    return (
      <a
        href={href}
        className={badgeClassName}
        data-testid="version-badge"
        data-linkable="true"
      >
        {content}
      </a>
    );
  }

  return (
    <span className={badgeClassName} data-testid="version-badge">
      {content}
    </span>
  );
}
