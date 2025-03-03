import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.js'],
    exclude: ['node_modules/**', 'dist/**'],
    reporters: ['default', 'html'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      include: ['src/rules/**/*.js'],
      exclude: ['**/node_modules/**', '**/tests/**']
    },
  },
  resolve: {
    alias: {
      '@': './src'
    }
  }
});