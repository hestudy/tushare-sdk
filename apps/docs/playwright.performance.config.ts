import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright 性能测试配置
 * 用于测试页面加载时间和性能指标
 */
export default defineConfig({
  // 性能测试文件目录
  testDir: './tests/performance',
  
  // 串行运行性能测试,避免相互干扰
  fullyParallel: false,
  workers: 1,
  
  // CI 环境禁止使用 .only
  forbidOnly: !!process.env.CI,
  
  // 不重试性能测试
  retries: 0,
  
  // 测试报告配置
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report-performance' }],
  ],
  
  // 共享配置
  use: {
    // 基础 URL
    baseURL: 'http://localhost:3000',
    
    // 性能测试不需要追踪
    trace: 'off',
    
    // 性能测试不需要截图和视频
    screenshot: 'off',
    video: 'off',
  },

  // 只在 Desktop Chrome 上运行性能测试
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // 开发服务器配置
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
