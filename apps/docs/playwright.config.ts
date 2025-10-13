import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E 测试配置
 * 用于测试用户交互流程和页面功能
 */
export default defineConfig({
  // 测试文件目录
  testDir: './tests/e2e',

  // 完全并行运行测试
  fullyParallel: true,

  // CI 环境禁止使用 .only
  forbidOnly: !!process.env.CI,

  // CI 环境重试失败的测试
  retries: process.env.CI ? 2 : 0,

  // CI 环境使用单个 worker,本地使用默认
  workers: process.env.CI ? 1 : undefined,

  // 测试报告配置
  // 使用 list 报告器(终端输出)和 html 报告器(生成报告文件但不自动打开)
  reporter: [
    ['list'], // 终端输出测试结果
    ['html', { open: 'never' }], // 生成 HTML 报告但不自动打开浏览器
  ],

  // 共享配置
  use: {
    // 基础 URL (rspress 默认端口 3000)
    // 开发环境 rspress 使用根路径
    baseURL: 'http://localhost:3000',

    // 失败时记录追踪
    trace: 'on-first-retry',

    // 截图配置
    screenshot: 'only-on-failure',

    // 视频配置
    video: 'retain-on-failure',

    // 剪贴板权限
    permissions: ['clipboard-read', 'clipboard-write'],
  },

  // 测试项目配置
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // 开发服务器配置
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000', // rspress 默认端口
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 分钟超时
    stdout: 'pipe', // 显示服务器输出
    stderr: 'pipe', // 显示错误输出
  },
});
