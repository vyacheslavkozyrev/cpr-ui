import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import translationEN from '../../public/locales/en/translation.json'
import i18n from '../config/i18n'
import { server } from '../mocks/server'

// Setup MSW server
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })

  // Add translation resources for testing
  i18n.addResourceBundle('en', 'translation', translationEN, true, true)
})

// Cleanup after each test
afterEach(() => {
  cleanup()
  server.resetHandlers()
  vi.clearAllMocks()
})

// Cleanup i18n after all tests to prevent unhandled promise rejection
afterAll(() => {
  // Wait for any pending i18n operations to complete
  return new Promise(resolve => {
    if (i18n.isInitialized) {
      // Allow time for any pending async operations
      setTimeout(() => {
        resolve(undefined)
      }, 100)
    } else {
      resolve(undefined)
    }
  })
})

// Mock window.matchMedia (used by MUI components)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver (used by some MUI components)
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver (used by some MUI components)
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
})

// Mock console methods to reduce noise in tests
// eslint-disable-next-line no-console
const originalError = console.error
// eslint-disable-next-line no-console
console.error = (...args: unknown[]) => {
  const firstArg = args[0]
  if (
    (typeof firstArg === 'string' &&
      firstArg.includes('Warning: ReactDOM.render is no longer supported')) ||
    (typeof firstArg === 'string' &&
      firstArg.includes('Warning: React.createFactory() is deprecated'))
  ) {
    return
  }
  originalError(...args)
}

// Setup timezone for consistent date testing
process.env['TZ'] = 'UTC'
