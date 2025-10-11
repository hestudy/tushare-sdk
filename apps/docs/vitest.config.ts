import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Vitest 配置
 * 用于单元测试自定义组件和工具函数
 */
export default defineConfig({
  plugins: [react()],
  test: {
    // 使用 jsdom 环境模拟浏览器
    environment: 'jsdom',
    
    // 全局测试设置
    globals: true,
    
    // 测试设置文件
    setupFiles: ['./tests/setup.ts'],
    
    // 只包含单元测试,排除 E2E 和性能测试
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    exclude: ['tests/e2e/**', 'tests/performance/**', 'node_modules/**'],
    
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'dist/',
        '.rspress/',
        '*.config.ts',
      ],
      // 目标覆盖率 ≥ 80%
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
