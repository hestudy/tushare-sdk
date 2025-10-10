import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: 'es2020',
    },
    {
      format: 'cjs',
      syntax: 'es2020',
    },
  ],
  output: {
    target: 'web',
    minify: true,
  },
  source: {
    entry: {
      index: './src/index.ts',
    },
  },
});
