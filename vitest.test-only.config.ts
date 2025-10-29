import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    globals: true,
    // Limit resources to prevent memory issues
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true, // Force single thread to prevent memory issues
      },
    },
    // Set strict timeouts
    testTimeout: 30000, // 30 seconds max per test
    hookTimeout: 10000, // 10 seconds max for hooks
    // Limit memory usage
    maxConcurrency: 1,
    // Force cleanup between tests
    isolate: true,
    // Disable coverage to save memory
    coverage: {
      enabled: false,
    },
    // Reduce output to minimize memory usage
    reporters: ['basic'],
    // Clear mocks between tests
    clearMocks: true,
    restoreMocks: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  esbuild: {
    target: 'es2022',
  },
})
