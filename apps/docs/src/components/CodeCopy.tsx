import { useState } from 'react';
import './CodeCopy.css';

/**
 * 代码复制按钮组件 Props
 */
export interface CodeCopyProps {
  /**
   * 要复制的代码内容
   */
  code: string;

  /**
   * 代码语言类型
   * @example 'typescript', 'javascript', 'bash'
   */
  language?: string;

  /**
   * 自定义复制成功提示文本
   * @default '✓ 已复制'
   */
  successText?: string;

  /**
   * 自定义复制按钮文本
   * @default '复制代码'
   */
  buttonText?: string;

  /**
   * 复制成功后提示显示时长(毫秒)
   * @default 2000
   */
  successDuration?: number;

  /**
   * 自定义 CSS 类名
   */
  className?: string;

  /**
   * 复制成功回调
   */
  onCopySuccess?: () => void;

  /**
   * 复制失败回调
   */
  onCopyError?: (error: Error) => void;
}

/**
 * 代码复制按钮组件
 * 
 * 提供一键复制代码功能,支持自定义文本和回调
 * 
 * @example
 * ```tsx
 * <CodeCopy code="const x = 1;" language="typescript" />
 * ```
 */
export function CodeCopy({
  code,
  language,
  successText = '✓ 已复制',
  buttonText = '复制代码',
  successDuration = 2000,
  className = '',
  onCopySuccess,
  onCopyError,
}: CodeCopyProps) {
  const [copied, setCopied] = useState(false);

  /**
   * 处理复制操作
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      onCopySuccess?.();

      // 在指定时长后恢复默认状态
      setTimeout(() => {
        setCopied(false);
      }, successDuration);
    } catch (error) {
      console.error('复制失败:', error);
      onCopyError?.(error as Error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`code-copy-btn ${className}`}
      data-testid="code-copy-btn"
      aria-label={copied ? successText : buttonText}
      type="button"
    >
      {copied ? successText : buttonText}
    </button>
  );
}
