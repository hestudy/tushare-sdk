/**
 * rspress 配置文件
 * 定义文档站的核心配置,包括站点信息、主题、导航、侧边栏等
 */
export default {
  /**
   * 站点根路径
   * 如果部署在子路径下,需要设置此项
   */
  base: '/',

  /**
   * 站点标题
   */
  title: 'Tushare SDK',

  /**
   * 站点描述,用于 SEO
   */
  description: 'Tushare SDK 官方文档 - 快速查阅 API 用法',

  /**
   * 站点图标
   */
  icon: '/logo.svg',

  /**
   * 站点 Logo
   */
  logo: {
    light: '/logo.svg',
    dark: '/logo-dark.svg',
  },

  /**
   * 文档根目录
   */
  root: 'docs',

  /**
   * 输出目录
   */
  outDir: 'dist',

  /**
   * 主题配置
   */
  themeConfig: {
    /**
     * 导航栏配置
     */
    nav: [
      {
        text: '指南',
        link: '/guide/installation',
      },
      {
        text: 'API 文档',
        link: '/api/stock/basic',
      },
      {
        text: '更新日志',
        link: '/changelog/',
      },
      {
        text: 'GitHub',
        link: 'https://github.com/your-org/tushare-sdk',
      },
    ],

    /**
     * 侧边栏配置
     * 使用声明式配置,通过 _meta.json 管理
     */
    sidebar: {
      '/guide/': [
        {
          text: '快速入门',
          items: [
            { text: '安装', link: '/guide/installation' },
            { text: '快速开始', link: '/guide/quick-start' },
            { text: '配置', link: '/guide/configuration' },
          ],
        },
      ],
      '/api/': [
        {
          text: '股票数据',
          items: [
            { text: '基础信息', link: '/api/stock/basic' },
            { text: '日线数据', link: '/api/stock/daily' },
            { text: '实时数据', link: '/api/stock/realtime' },
          ],
        },
        {
          text: '基金数据',
          items: [
            { text: '基础信息', link: '/api/fund/basic' },
            { text: '净值数据', link: '/api/fund/nav' },
          ],
        },
        {
          text: '财务数据',
          items: [
            { text: '利润表', link: '/api/finance/income' },
            { text: '资产负债表', link: '/api/finance/balance' },
          ],
        },
      ],
    },

    /**
     * 社交链接
     */
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/your-org/tushare-sdk',
      },
    ],

    /**
     * 页脚配置
     */
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025-present Tushare SDK Team',
    },

    /**
     * 最后更新时间
     */
    lastUpdated: true,

    /**
     * 编辑链接
     */
    editLink: {
      docRepoBaseUrl:
        'https://github.com/your-org/tushare-sdk/tree/main/apps/docs/docs',
      text: '在 GitHub 上编辑此页',
    },

    /**
     * 上一页/下一页导航
     */
    prevNextPage: true,

    /**
     * 大纲配置
     */
    outline: {
      level: [2, 3], // 显示 h2 和 h3 标题
      title: '目录',
    },
  },

  /**
   * Markdown 配置
   */
  markdown: {
    /**
     * 代码块主题
     */
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },

    /**
     * 显示行号
     */
    showLineNumbers: true,

    /**
     * 默认高亮语言
     */
    defaultWrapCode: true,
  },

  /**
   * 构建配置
   */
  builderConfig: {
    /**
     * 源码映射
     */
    output: {
      sourceMap: {
        js: 'source-map',
      },
    },

    /**
     * 性能优化
     */
    performance: {
      chunkSplit: {
        strategy: 'split-by-experience',
      },
    },
  },

  /**
   * 路由配置
   */
  route: {
    /**
     * 排除的路径
     */
    exclude: ['**/fragments/**', '**/_*.md'],
  },
};
