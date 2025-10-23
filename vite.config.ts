import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(() => ({
  plugins: [react()],
  server: {
    port: process.env.VITE_PORT ? parseInt(process.env.VITE_PORT) : 3000,
    open: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/pages': resolve(__dirname, './src/pages'),
      '@/services': resolve(__dirname, './src/services'),
      '@/hooks': resolve(__dirname, './src/hooks'),
      '@/store': resolve(__dirname, './src/store'),
      '@/types': resolve(__dirname, './src/types'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/config': resolve(__dirname, './src/config'),
      '@/theme': resolve(__dirname, './src/theme'),
      '@/assets': resolve(__dirname, './src/assets'),
      '@/tests': resolve(__dirname, './src/tests'),
      '@/mocks': resolve(__dirname, './src/mocks'),
    },
  },
}))
