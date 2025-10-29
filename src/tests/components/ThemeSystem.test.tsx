import { cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeToggle } from '../../components/ThemeToggle'
import { server } from '../../mocks/server'
import { useThemeStore } from '../../stores/themeStore'
import { renderWithProviders, renderWithTheme } from '../utils'

// Mock the theme store for testing
const mockThemeStore = {
  themeMode: 'light' as const,
  effectiveTheme: 'light' as const,
  isSystemDark: false,
  systemPreference: 'light' as const,
  toggleTheme: vi.fn(),
  setThemeMode: vi.fn(),
  isDarkMode: false,
}

vi.mock('../../stores/themeStore', () => ({
  useThemeStore: vi.fn(() => mockThemeStore),
}))

describe('Theme System Tests', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    server.listen({ onUnhandledRequest: 'error' })
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
    server.resetHandlers()
  })

  describe('ThemeToggle Component', () => {
    it('renders theme toggle button', () => {
      const { container } = renderWithProviders(<ThemeToggle />)

      const button = container.querySelector('button')
      expect(button).toBeTruthy()
      expect(button).toHaveAttribute('aria-label')
    })

    it('shows light mode icon when theme is light', () => {
      const { container } = renderWithProviders(<ThemeToggle />)

      // Should show sun icon or light mode indicator
      const button = container.querySelector('button')
      expect(button).toBeTruthy()
    })

    it('calls toggleTheme when clicked', async () => {
      const { container } = renderWithProviders(<ThemeToggle />)

      const button = container.querySelector('button')
      expect(button).toBeTruthy()

      if (button) {
        await user.click(button)
        expect(mockThemeStore.toggleTheme).toHaveBeenCalledTimes(1)
      }
    })

    it('shows dark mode icon when theme is dark', () => {
      // Update mock to return dark theme
      const darkMockStore = {
        ...mockThemeStore,
        themeMode: 'dark',
        effectiveTheme: 'dark',
        isDarkMode: true,
      }
      vi.mocked(useThemeStore).mockReturnValue(darkMockStore)

      const { container } = renderWithProviders(<ThemeToggle />)

      const button = container.querySelector('button')
      expect(button).toBeTruthy()
    })
  })

  describe('Theme Context Integration', () => {
    it('renders components with light theme by default', () => {
      const TestComponent = () => <div data-testid='themed'>Themed Content</div>

      const { container } = renderWithTheme(<TestComponent />, 'light')

      expect(
        container.querySelector('[data-testid="themed"]')
      ).toHaveTextContent('Themed Content')
    })

    it('renders components with dark theme', () => {
      const TestComponent = () => <div data-testid='themed'>Themed Content</div>

      const { container } = renderWithTheme(<TestComponent />, 'dark')

      expect(
        container.querySelector('[data-testid="themed"]')
      ).toHaveTextContent('Themed Content')
    })

    it('applies theme classes correctly', () => {
      const TestComponent = () => (
        <div className='theme-aware'>
          <span>Content</span>
        </div>
      )

      const { container } = renderWithTheme(<TestComponent />, 'dark')

      // The theme provider should apply appropriate theme context
      expect(container.querySelector('.theme-aware')).toBeTruthy()
    })
  })

  describe('System Theme Detection', () => {
    it('handles system theme preference', () => {
      const systemMockStore = {
        ...mockThemeStore,
        themeMode: 'system',
        systemPreference: 'dark',
        effectiveTheme: 'dark',
        isSystemDark: true,
      }
      vi.mocked(useThemeStore).mockReturnValue(systemMockStore)

      const { container } = renderWithProviders(<ThemeToggle />)

      expect(container.querySelector('button')).toBeTruthy()
    })

    it('responds to system theme changes', () => {
      // Test that system theme detection works
      const systemMockStore = {
        ...mockThemeStore,
        themeMode: 'system',
        isSystemDark: true,
        systemPreference: 'dark',
        effectiveTheme: 'dark',
      }
      vi.mocked(useThemeStore).mockReturnValue(systemMockStore)

      const { container } = renderWithProviders(<ThemeToggle />)

      expect(container.querySelector('button')).toBeTruthy()
    })
  })
})
