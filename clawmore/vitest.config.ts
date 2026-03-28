import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    exclude: [
      '**/e2e/**',
      '**/.next/**',
      '**/.open-next/**',
      '**/.sst/**',
      '**/node_modules/**',
    ],
    setupFiles: ['./vitest.setup.ts'],
    alias: {
      '@/*': path.resolve(__dirname, './*'),
      '@aiready/core': path.resolve(__dirname, '../packages/core/src'),
    },
  },
});
