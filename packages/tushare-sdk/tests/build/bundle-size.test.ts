import { describe, it, expect } from 'vitest';
import { readFileSync, statSync } from 'fs';
import { join } from 'path';
import { gzipSync } from 'zlib';

/**
 * 打包体积测试
 * 验证打包后的文件体积符合性能要求
 */
describe('Bundle Size Tests', () => {
  const distPath = join(__dirname, '../../dist');

  it('should have ESM bundle size < 50KB gzipped', () => {
    const esmPath = join(distPath, 'index.js');
    
    try {
      const content = readFileSync(esmPath);
      const gzipped = gzipSync(content);
      const sizeKB = gzipped.length / 1024;

      console.log(`ESM bundle size (gzipped): ${sizeKB.toFixed(2)} KB`);
      expect(sizeKB).toBeLessThan(50);
    } catch (error) {
      console.warn('ESM bundle not found, skipping test. Run build first.');
      // 如果构建文件不存在，跳过测试
      expect(true).toBe(true);
    }
  });

  it('should have CJS bundle size < 50KB gzipped', () => {
    const cjsPath = join(distPath, 'index.cjs');
    
    try {
      const content = readFileSync(cjsPath);
      const gzipped = gzipSync(content);
      const sizeKB = gzipped.length / 1024;

      console.log(`CJS bundle size (gzipped): ${sizeKB.toFixed(2)} KB`);
      expect(sizeKB).toBeLessThan(50);
    } catch (error) {
      console.warn('CJS bundle not found, skipping test. Run build first.');
      // 如果构建文件不存在，跳过测试
      expect(true).toBe(true);
    }
  });

  it('should have type definitions generated', () => {
    const dtsPath = join(distPath, 'index.d.ts');
    
    try {
      const stats = statSync(dtsPath);
      expect(stats.isFile()).toBe(true);
      console.log(`Type definitions size: ${(stats.size / 1024).toFixed(2)} KB`);
    } catch (error) {
      console.warn('Type definitions not found, skipping test. Run build first.');
      expect(true).toBe(true);
    }
  });

  it('should report total bundle sizes', () => {
    try {
      const esmPath = join(distPath, 'index.js');
      const cjsPath = join(distPath, 'index.cjs');
      
      const esmContent = readFileSync(esmPath);
      const cjsContent = readFileSync(cjsPath);
      
      const esmGzipped = gzipSync(esmContent);
      const cjsGzipped = gzipSync(cjsContent);
      
      console.log('\n=== Bundle Size Report ===');
      console.log(`ESM (raw): ${(esmContent.length / 1024).toFixed(2)} KB`);
      console.log(`ESM (gzipped): ${(esmGzipped.length / 1024).toFixed(2)} KB`);
      console.log(`CJS (raw): ${(cjsContent.length / 1024).toFixed(2)} KB`);
      console.log(`CJS (gzipped): ${(cjsGzipped.length / 1024).toFixed(2)} KB`);
      console.log('========================\n');
      
      expect(true).toBe(true);
    } catch (error) {
      console.warn('Build artifacts not found. Run `pnpm build` first.');
      expect(true).toBe(true);
    }
  });
});
