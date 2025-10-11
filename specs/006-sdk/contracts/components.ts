/**
 * 自定义组件契约
 * 
 * 定义文档站中使用的自定义 React 组件的 Props 接口
 */

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
 * 搜索结果高亮组件 Props
 */
export interface SearchHighlightProps {
  /**
   * 原始文本
   */
  text: string;

  /**
   * 要高亮的关键词
   */
  keyword: string;

  /**
   * 高亮样式类名
   * @default 'search-highlight'
   */
  highlightClassName?: string;

  /**
   * 是否区分大小写
   * @default false
   */
  caseSensitive?: boolean;
}

/**
 * 面包屑导航组件 Props
 */
export interface BreadcrumbProps {
  /**
   * 面包屑路径项
   */
  items: BreadcrumbItem[];

  /**
   * 分隔符
   * @default '/'
   */
  separator?: string | React.ReactNode;

  /**
   * 自定义 CSS 类名
   */
  className?: string;
}

/**
 * 面包屑路径项
 */
export interface BreadcrumbItem {
  /**
   * 显示文本
   */
  label: string;

  /**
   * 链接地址(最后一项通常不需要链接)
   */
  href?: string;

  /**
   * 图标(可选)
   */
  icon?: React.ReactNode;
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
 * 版本选择器组件 Props (预留,初期不实现)
 */
export interface VersionSelectorProps {
  /**
   * 当前版本
   */
  currentVersion: string;

  /**
   * 可用版本列表
   */
  versions: VersionOption[];

  /**
   * 版本切换回调
   */
  onVersionChange: (version: string) => void;

  /**
   * 自定义 CSS 类名
   */
  className?: string;
}

/**
 * 版本选项
 */
export interface VersionOption {
  /**
   * 版本号
   */
  value: string;

  /**
   * 显示标签
   */
  label: string;

  /**
   * 版本状态
   */
  status?: 'latest' | 'stable' | 'deprecated';

  /**
   * 是否禁用
   */
  disabled?: boolean;
}

/**
 * 组件导出
 */
export type {
  // 基础组件
  CodeCopyProps,
  ApiCardProps,
  VersionBadgeProps,
  BreadcrumbProps,
  CalloutProps,
  
  // 表格组件
  ApiParameterTableProps,
  ApiParameter,
  
  // 搜索组件
  SearchHighlightProps,
  
  // 代码示例组件
  CodeTabsProps,
  CodeExample,
  
  // 版本管理组件 (预留)
  VersionSelectorProps,
  VersionOption,
  
  // 导航组件
  BreadcrumbItem,
};
