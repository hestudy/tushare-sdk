import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VersionBadge } from '../../../src/components/VersionBadge';

describe('VersionBadge', () => {
  it('应该渲染基本的版本标签', () => {
    render(<VersionBadge version="v1.2.0" />);

    expect(screen.getByTestId('version-badge')).toBeInTheDocument();
    expect(screen.getByTestId('version-badge-version')).toHaveTextContent('v1.2.0');
    expect(screen.getByTestId('version-badge-status')).toHaveTextContent('稳定');
  });

  it('应该显示最新版本状态', () => {
    render(<VersionBadge version="v2.0.0" status="latest" />);

    expect(screen.getByTestId('version-badge')).toHaveClass('version-badge--latest');
    expect(screen.getByTestId('version-badge-status')).toHaveTextContent('最新');
  });

  it('应该显示稳定版本状态', () => {
    render(<VersionBadge version="v1.5.0" status="stable" />);

    expect(screen.getByTestId('version-badge')).toHaveClass('version-badge--stable');
    expect(screen.getByTestId('version-badge-status')).toHaveTextContent('稳定');
  });

  it('应该显示已废弃版本状态', () => {
    render(<VersionBadge version="v1.0.0" status="deprecated" />);

    expect(screen.getByTestId('version-badge')).toHaveClass('version-badge--deprecated');
    expect(screen.getByTestId('version-badge-status')).toHaveTextContent('已废弃');
  });

  it('应该渲染为链接', () => {
    render(
      <VersionBadge
        version="v1.2.0"
        linkable={true}
        href="/v1.2.0"
      />
    );

    const badge = screen.getByTestId('version-badge');
    expect(badge.tagName).toBe('A');
    expect(badge).toHaveAttribute('href', '/v1.2.0');
    expect(badge).toHaveAttribute('data-linkable', 'true');
  });

  it('应该渲染为 span 如果不是链接', () => {
    render(<VersionBadge version="v1.2.0" />);

    const badge = screen.getByTestId('version-badge');
    expect(badge.tagName).toBe('SPAN');
    expect(badge).not.toHaveAttribute('href');
  });

  it('应该忽略 href 如果 linkable 为 false', () => {
    render(
      <VersionBadge
        version="v1.2.0"
        linkable={false}
        href="/v1.2.0"
      />
    );

    const badge = screen.getByTestId('version-badge');
    expect(badge.tagName).toBe('SPAN');
    expect(badge).not.toHaveAttribute('href');
  });

  it('应该支持自定义 className', () => {
    render(
      <VersionBadge
        version="v1.2.0"
        className="custom-badge"
      />
    );

    expect(screen.getByTestId('version-badge')).toHaveClass('custom-badge');
  });

  it('应该默认使用 stable 状态', () => {
    render(<VersionBadge version="v1.2.0" />);

    expect(screen.getByTestId('version-badge')).toHaveClass('version-badge--stable');
  });

  it('应该正确显示版本号', () => {
    const versions = ['v1.0.0', 'v2.3.4', 'v10.20.30'];
    
    versions.forEach(version => {
      const { unmount } = render(<VersionBadge version={version} />);
      expect(screen.getByTestId('version-badge-version')).toHaveTextContent(version);
      unmount();
    });
  });
});
