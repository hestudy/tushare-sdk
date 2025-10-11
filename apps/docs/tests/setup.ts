/**
 * Vitest 测试环境设置
 */
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
  writable: true,
  configurable: true,
});
