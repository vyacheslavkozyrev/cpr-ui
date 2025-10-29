/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // @ts-expect-error - Plugin compatibility issue with Vitest 3.x and React plugin
  plugins: [react()],

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/pages': resolve(__dirname, './src/pages'),
      '@/services': resolve(__dirname, './src/services'),
      '@/hooks': resolve(__dirname, './src/hooks'),
      '@/store': resolve(__dirname, './src/store'),
      '@/stores': resolve(__dirname, './src/stores'),
      '@/types': resolve(__dirname, './src/types'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/config': resolve(__dirname, './src/config'),
      '@/theme': resolve(__dirname, './src/theme'),
      '@/assets': resolve(__dirname, './src/assets'),
      '@/tests': resolve(__dirname, './src/tests'),
      '@/mocks': resolve(__dirname, './src/mocks'),
    },
  },

  test: {
    // Test environment
    environment: 'jsdom',

    // Setup files
    setupFiles: ['./src/tests/setup.ts'],

    // Global test utilities
    globals: true,

    // Environment variables for tests
    env: {
      VITE_API_BASE_URL: 'https://localhost:3000/api',
      VITE_USE_MSW: 'true',
    },

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        'src/mocks/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },

    // Test file patterns
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

    // Exclude patterns
    exclude: ['node_modules/', 'dist/', '.idea/', '.git/', '.cache/'],
  },
})
