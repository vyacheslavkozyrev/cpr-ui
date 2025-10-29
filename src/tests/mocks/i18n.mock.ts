// Mock i18n configuration for tests to prevent memory issues
import { vi } from 'vitest'

// Mock i18next completely to avoid memory leaks
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Just return the key instead of translating
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
    },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
  I18nextProvider: ({ children }: { children: React.ReactNode }) => children,
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}))

// Mock i18next core
vi.mock('i18next', () => ({
  default: {
    use: vi.fn().mockReturnThis(),
    init: vi.fn().mockReturnThis(),
    t: (key: string) => key,
    language: 'en',
    changeLanguage: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  },
}))

// Mock language detector
vi.mock('i18next-browser-languagedetector', () => ({
  default: {
    type: 'languageDetector',
    detect: () => 'en',
    init: vi.fn(),
    cacheUserLanguage: vi.fn(),
  },
}))

// Mock date-fns to prevent complex date operations
vi.mock('date-fns', () => ({
  format: vi.fn(() => '10/28/2025'),
  formatDistance: vi.fn(() => '1 day ago'),
  formatRelative: vi.fn(() => 'yesterday'),
  parseISO: vi.fn(() => new Date('2025-10-28')),
  isValid: vi.fn(() => true),
}))

// Mock @mui/material components that might cause issues
vi.mock('@mui/material/useMediaQuery', () => ({
  default: vi.fn(() => false), // Always return false for mobile queries
}))

export const mockI18nSetup = () => {
  // Additional setup if needed
}
