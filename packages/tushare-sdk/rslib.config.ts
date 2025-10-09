import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: 'es2020',
      dts: true,
    },
    {
      format: 'cjs',
      syntax: 'es2020',
    },
  ],
  output: {
    target: 'node',
    minify: true,
  },
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
});
