import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CodeCopy } from '@/components/CodeCopy';

/**
 * CodeCopy 组件单元测试
 * 测试代码复制功能的各种场景
 */
describe('CodeCopy 组件', () => {
  beforeEach(() => {
    // Reset clipboard mock
    const writeTextMock = navigator.clipboard.writeText as ReturnType<typeof vi.fn>;
    writeTextMock.mockClear?.();
    writeTextMock.mockResolvedValue?.(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('应该渲染复制按钮', () => {
    render(<CodeCopy code="const x = 1;" />);
    expect(screen.getByRole('button')).toHaveTextContent('复制代码');
  });

  test('应该使用自定义按钮文本', () => {
    render(<CodeCopy code="const x = 1;" buttonText="Copy" />);
    expect(screen.getByRole('button')).toHaveTextContent('Copy');
  });

  test('点击按钮应该复制代码到剪贴板', async () => {
    const user = userEvent.setup();
    const code = 'const x = 1;';
    const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText');
    
    render(<CodeCopy code={code} />);
    const button = screen.getByRole('button');
    
    await user.click(button);
    
    expect(writeTextSpy).toHaveBeenCalledWith(code);
  });

  test('复制成功后应该显示成功提示', async () => {
    const user = userEvent.setup();
    
    render(<CodeCopy code="const x = 1;" />);
    const button = screen.getByRole('button');
    
    await user.click(button);
    
    expect(button).toHaveTextContent('✓ 已复制');
  });

  test('应该使用自定义成功提示文本', async () => {
    const user = userEvent.setup();
    
    render(<CodeCopy code="const x = 1;" successText="Copied!" />);
    const button = screen.getByRole('button');
    
    await user.click(button);
    
    expect(button).toHaveTextContent('Copied!');
  });

  test.skip('2秒后应该恢复默认文本', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ delay: null });
    vi.spyOn(navigator.clipboard, 'writeText');
    
    render(<CodeCopy code="const x = 1;" />);
    const button = screen.getByRole('button');
    
    await user.click(button);
    expect(button).toHaveTextContent('✓ 已复制');
    
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    
    expect(button).toHaveTextContent('复制代码');
    
    vi.useRealTimers();
  });

  test.skip('应该使用自定义成功提示显示时长', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ delay: null });
    vi.spyOn(navigator.clipboard, 'writeText');
    
    render(<CodeCopy code="const x = 1;" successDuration={1000} />);
    const button = screen.getByRole('button');
    
    await user.click(button);
    expect(button).toHaveTextContent('✓ 已复制');
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(button).toHaveTextContent('复制代码');
    
    vi.useRealTimers();
  });

  test.skip('复制成功应该调用 onCopySuccess 回调', async () => {
    const user = userEvent.setup();
    const onCopySuccess = vi.fn();
    vi.spyOn(navigator.clipboard, 'writeText');
    
    render(<CodeCopy code="const x = 1;" onCopySuccess={onCopySuccess} />);
    const button = screen.getByRole('button');
    
    await user.click(button);
    
    // Wait for async operation
    await waitFor(() => {
      expect(onCopySuccess).toHaveBeenCalledTimes(1);
    });
  });

  test.skip('复制失败应该调用 onCopyError 回调', async () => {
    const user = userEvent.setup();
    const onCopyError = vi.fn();
    const mockError = new Error('Clipboard error');
    
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValueOnce(mockError);
    
    render(<CodeCopy code="const x = 1;" onCopyError={onCopyError} />);
    const button = screen.getByRole('button');
    
    await user.click(button);
    
    // Wait for async operation
    await waitFor(() => {
      expect(onCopyError).toHaveBeenCalledWith(mockError);
    });
  });

  test('应该应用自定义 CSS 类名', () => {
    render(<CodeCopy code="const x = 1;" className="custom-class" />);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('custom-class');
  });

  test('应该有正确的 data-testid', () => {
    render(<CodeCopy code="const x = 1;" />);
    expect(screen.getByTestId('code-copy-btn')).toBeInTheDocument();
  });
});
