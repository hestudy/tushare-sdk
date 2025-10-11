import React, { useState } from 'react';
import './CodeTabs.css';

/**
 * 代码示例定义
 */
export interface CodeExample {
  /**
   * 标签标题
   * @example 'TypeScript', 'JavaScript'
   */
  title: string;

  /**
   * 代码语言
   */
  language: string;

  /**
   * 代码内容
   */
  code: string;

  /**
   * 示例描述(可选)
   */
  description?: string;
}

/**
 * 代码示例标签页组件 Props
 */
export interface CodeTabsProps {
  /**
   * 代码示例列表
   */
  examples: CodeExample[];

  /**
   * 默认选中的标签索引
   * @default 0
   */
  defaultTab?: number;

  /**
   * 自定义 CSS 类名
   */
  className?: string;
}

/**
 * 代码示例标签页组件
 * 
 * 用于在文档中展示多个代码示例,用户可以通过标签页切换不同的示例。
 * 常用于展示 TypeScript 和 JavaScript 的对比示例。
 * 
 * @example
 * ```tsx
 * <CodeTabs
 *   examples={[
 *     {
 *       title: 'TypeScript',
 *       language: 'typescript',
 *       code: 'const x: number = 1;'
 *     },
 *     {
 *       title: 'JavaScript',
 *       language: 'javascript',
 *       code: 'const x = 1;'
 *     }
 *   ]}
 * />
 * ```
 */
export function CodeTabs({
  examples,
  defaultTab = 0,
  className = '',
}: CodeTabsProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState(defaultTab);

  if (examples.length === 0) {
    return <div className="code-tabs-empty">没有可用的代码示例</div>;
  }

  const currentExample = examples[activeTab];

  if (!currentExample) {
    return <div className="code-tabs-empty">无效的标签索引</div>;
  }

  return (
    <div className={`code-tabs ${className}`.trim()} data-testid="code-tabs">
      {/* 标签页头部 */}
      <div className="code-tabs__header" role="tablist" data-testid="code-tabs-header">
        {examples.map((example, index) => (
          <button
            key={index}
            role="tab"
            aria-selected={activeTab === index}
            className={`code-tabs__tab ${activeTab === index ? 'code-tabs__tab--active' : ''}`}
            onClick={() => setActiveTab(index)}
            data-testid={`code-tab-${index}`}
          >
            {example.title}
          </button>
        ))}
      </div>

      {/* 标签页内容 */}
      <div className="code-tabs__content" role="tabpanel" data-testid="code-tabs-content">
        {currentExample.description && (
          <div className="code-tabs__description" data-testid="code-tabs-description">
            {currentExample.description}
          </div>
        )}
        <pre className="code-tabs__code">
          <code className={`language-${currentExample.language}`} data-testid="code-tabs-code">
            {currentExample.code}
          </code>
        </pre>
      </div>
    </div>
  );
}
