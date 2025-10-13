/**
 * 测试配置契约
 *
 * 定义 Playwright 测试配置的 TypeScript 类型和验证规则
 */

import { PlaywrightTestConfig, devices } from '@playwright/test';

/**
 * E2E 测试配置接口
 * 扩展 Playwright 的标准配置
 */
export interface E2ETestConfig extends PlaywrightTestConfig {
  /**
   * 文档站基础 URL
   * @default 'http://localhost:3000'
   */
  baseURL: string;

  /**
   * 测试文件目录
   * @default './tests/e2e'
   */
  testDir: string;

  /**
   * 测试超时时间(毫秒)
   * @default 30000
   */
  timeout?: number;

  /**
   * 全局设置超时时间(毫秒)
   * @default 60000
   */
  globalTimeout?: number;

  /**
   * 是否并行运行测试
   * @default true (本地), false (CI)
   */
  fullyParallel: boolean;

  /**
   * 失败时重试次数
   * @default 0 (本地), 2 (CI)
   */
  retries: number;

  /**
   * Worker 数量
   * @default undefined (CPU核心数), 1 (CI)
   */
  workers?: number;

  /**
   * 是否禁止使用 .only
   * @default true (CI), false (本地)
   */
  forbidOnly: boolean;

  /**
   * 截图配置
   * @default 'only-on-failure'
   */
  screenshot: 'on' | 'off' | 'only-on-failure';

  /**
   * 视频录制配置
   * @default 'retain-on-failure'
   */
  video: 'on' | 'off' | 'retain-on-failure' | 'on-first-retry';

  /**
   * Trace 追踪配置
   * @default 'on-first-retry'
   */
  trace: 'on' | 'off' | 'retain-on-failure' | 'on-first-retry';

  /**
   * 浏览器权限
   */
  permissions?: string[];

  /**
   * 开发服务器配置
   */
  webServer: WebServerConfig;

  /**
   * 测试项目配置
   */
  projects: TestProjectConfig[];
}

/**
 * 开发服务器配置
 */
export interface WebServerConfig {
  /**
   * 启动命令
   * @example 'pnpm dev'
   */
  command: string;

  /**
   * 服务器 URL
   * @example 'http://localhost:3000'
   */
  url: string;

  /**
   * 启动超时时间(毫秒)
   * @default 120000 (2分钟)
   */
  timeout: number;

  /**
   * 是否复用已运行的服务器
   * @default true (本地), false (CI)
   */
  reuseExistingServer: boolean;

  /**
   * 标准输出配置
   * @default 'pipe'
   */
  stdout: 'pipe' | 'ignore';

  /**
   * 错误输出配置
   * @default 'pipe'
   */
  stderr: 'pipe' | 'ignore';
}

/**
 * 测试项目配置
 */
export interface TestProjectConfig {
  /**
   * 项目名称
   * @example 'chromium', 'Mobile Chrome'
   */
  name: string;

  /**
   * 设备配置
   * 使用 Playwright 内置设备或自定义配置
   */
  use: DeviceConfig;

  /**
   * 项目特定的测试目录
   */
  testDir?: string;

  /**
   * 项目特定的测试匹配模式
   */
  testMatch?: string | string[];

  /**
   * 依赖的其他项目
   */
  dependencies?: string[];
}

/**
 * 设备配置
 */
export interface DeviceConfig {
  /**
   * 视口尺寸
   */
  viewport?: {
    width: number;
    height: number;
  };

  /**
   * 设备像素比
   * @default 1
   */
  deviceScaleFactor?: number;

  /**
   * 是否为移动设备
   * @default false
   */
  isMobile?: boolean;

  /**
   * 是否支持触摸
   * @default false
   */
  hasTouch?: boolean;

  /**
   * User Agent
   */
  userAgent?: string;

  /**
   * 浏览器权限
   */
  permissions?: string[];
}

/**
 * 测试报告配置
 */
export interface ReporterConfig {
  /**
   * 报告器类型
   */
  type: 'list' | 'html' | 'json' | 'junit' | 'dot';

  /**
   * 输出目录
   */
  outputFolder?: string;

  /**
   * 是否自动打开报告
   * @default 'never'
   */
  open?: 'always' | 'never' | 'on-failure';
}

/**
 * 预定义的测试项目
 */
export const TEST_PROJECTS = {
  /**
   * 桌面 Chrome 浏览器
   */
  DESKTOP_CHROME: {
    name: 'chromium',
    use: {
      ...devices['Desktop Chrome'],
      permissions: ['clipboard-read', 'clipboard-write']
    }
  },

  /**
   * 移动 Chrome 浏览器 (Pixel 5)
   */
  MOBILE_CHROME: {
    name: 'Mobile Chrome',
    use: {
      ...devices['Pixel 5'],
      permissions: ['clipboard-read', 'clipboard-write']
    }
  },

  /**
   * iPhone SE
   */
  IPHONE_SE: {
    name: 'iPhone SE',
    use: {
      ...devices['iPhone SE'],
      permissions: ['clipboard-read', 'clipboard-write']
    }
  },

  /**
   * iPad Mini
   */
  IPAD_MINI: {
    name: 'iPad Mini',
    use: {
      ...devices['iPad Mini'],
      permissions: ['clipboard-read', 'clipboard-write']
    }
  }
} as const;

/**
 * 默认配置
 */
export const DEFAULT_CONFIG: Partial<E2ETestConfig> = {
  baseURL: 'http://localhost:3000',
  testDir: './tests/e2e',
  timeout: 30000,
  globalTimeout: 60000,
  fullyParallel: true,
  retries: 0,
  forbidOnly: false,
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  trace: 'on-first-retry',
  permissions: ['clipboard-read', 'clipboard-write'],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    timeout: 120000,
    reuseExistingServer: true,
    stdout: 'pipe',
    stderr: 'pipe'
  }
};

/**
 * CI 环境配置
 */
export const CI_CONFIG: Partial<E2ETestConfig> = {
  ...DEFAULT_CONFIG,
  fullyParallel: false,
  retries: 2,
  workers: 1,
  forbidOnly: true,
  webServer: {
    ...DEFAULT_CONFIG.webServer!,
    reuseExistingServer: false
  }
};

/**
 * 配置验证函数
 */
export function validateConfig(config: Partial<E2ETestConfig>): string[] {
  const errors: string[] = [];

  if (!config.baseURL) {
    errors.push('baseURL 是必需的');
  }

  if (!config.testDir) {
    errors.push('testDir 是必需的');
  }

  if (config.timeout && config.timeout <= 0) {
    errors.push('timeout 必须大于 0');
  }

  if (config.retries && config.retries < 0) {
    errors.push('retries 不能为负数');
  }

  if (config.workers && config.workers <= 0) {
    errors.push('workers 必须大于 0');
  }

  if (!config.webServer) {
    errors.push('webServer 配置是必需的');
  } else {
    if (!config.webServer.command) {
      errors.push('webServer.command 是必需的');
    }
    if (!config.webServer.url) {
      errors.push('webServer.url 是必需的');
    }
  }

  if (!config.projects || config.projects.length === 0) {
    errors.push('至少需要配置一个测试项目');
  }

  return errors;
}

/**
 * 获取环境配置
 * 根据 CI 环境变量返回相应的配置
 */
export function getEnvConfig(): Partial<E2ETestConfig> {
  return process.env.CI ? CI_CONFIG : DEFAULT_CONFIG;
}
