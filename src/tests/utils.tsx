import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { RenderOptions, RenderResult } from '@testing-library/react'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import React from 'react'
import { I18nextProvider } from 'react-i18next'
import { BrowserRouter } from 'react-router-dom'
import { i18n } from '../config/i18n'
import { mockUsers, setMockCurrentUser } from '../mocks/handlers/userHandlers'

// Types for test context setup
interface TestContextOptions {
  /** Initial route for React Router */
  initialRoute?: string
  /** Theme mode for testing */
  themeMode?: 'light' | 'dark'
  /** Language for i18n testing */
  language?: string
  /** Mock user type for authentication testing */
  userType?: keyof typeof mockUsers | null
  /** Custom query client for React Query testing */
  queryClient?: QueryClient
  /** Additional wrapper components */
  wrapper?: React.ComponentType<{ children: React.ReactNode }>
  /** Whether to include router (for testing components that need routing) */
  includeRouter?: boolean
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  contextOptions?: TestContextOptions
}

/**
 * Creates a comprehensive test wrapper with all necessary providers
 */
function createTestWrapper(
  options: TestContextOptions = {}
): React.ComponentType<{ children: React.ReactNode }> {
  const {
    initialRoute = '/',
    themeMode = 'light',
    language = 'en',
    userType = 'employee',
    queryClient,
    wrapper: AdditionalWrapper,
    includeRouter = false,
  } = options

  // Set up mock user if specified
  if (userType) {
    setMockCurrentUser(userType)
  }

  // Create query client if not provided
  const testQueryClient =
    queryClient ||
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
    })

  // Create simple theme for testing
  const theme = createTheme({
    palette: {
      mode: themeMode,
    },
  })

  // Set i18n language
  if (language !== i18n.language) {
    i18n.changeLanguage(language)
  }

  return function TestWrapper({ children }: { children: React.ReactNode }) {
    // Set initial route
    if (initialRoute !== '/') {
      window.history.pushState({}, 'Test page', initialRoute)
    }

    let content = (
      <QueryClientProvider client={testQueryClient}>
        <I18nextProvider i18n={i18n}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {includeRouter ? (
              <BrowserRouter>{children}</BrowserRouter>
            ) : (
              children
            )}
          </ThemeProvider>
        </I18nextProvider>
      </QueryClientProvider>
    )

    // Wrap with additional wrapper if provided
    if (AdditionalWrapper) {
      content = <AdditionalWrapper>{content}</AdditionalWrapper>
    }

    return content
  }
}

/**
 * Enhanced render function with full provider context
 */
export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult & {
  queryClient: QueryClient
  rerender: (ui: ReactElement, options?: TestContextOptions) => void
} {
  const { contextOptions = {}, ...renderOptions } = options

  // Create test wrapper with context
  const TestWrapper = createTestWrapper(contextOptions)
  const queryClient =
    contextOptions.queryClient ||
    new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
        mutations: { retry: false },
      },
    })

  const result = render(ui, {
    wrapper: TestWrapper,
    ...renderOptions,
  })

  // Custom rerender function that preserves context options
  const customRerender = (
    newUi: ReactElement,
    newContextOptions: TestContextOptions = {}
  ) => {
    const mergedOptions = { ...contextOptions, ...newContextOptions }
    const NewWrapper = createTestWrapper(mergedOptions)
    return result.rerender(<NewWrapper>{newUi}</NewWrapper>)
  }

  return {
    ...result,
    queryClient,
    rerender: customRerender as typeof result.rerender,
  }
}

/**
 * Utility for testing components with different user roles
 */
export function renderWithUser(
  ui: ReactElement,
  userType: keyof typeof mockUsers,
  options: Omit<CustomRenderOptions, 'contextOptions'> = {}
) {
  return renderWithProviders(ui, {
    ...options,
    contextOptions: {
      userType,
      ...options,
    },
  })
}

/**
 * Utility for testing components with different themes
 */
export function renderWithTheme(
  ui: ReactElement,
  themeMode: 'light' | 'dark',
  options: Omit<CustomRenderOptions, 'contextOptions'> = {}
) {
  return renderWithProviders(ui, {
    ...options,
    contextOptions: {
      themeMode,
      ...options,
    },
  })
}

/**
 * Utility for testing components with different languages
 */
export function renderWithLanguage(
  ui: ReactElement,
  language: string,
  options: Omit<CustomRenderOptions, 'contextOptions'> = {}
) {
  return renderWithProviders(ui, {
    ...options,
    contextOptions: {
      language,
      ...options,
    },
  })
}

/**
 * Utility for testing protected routes
 */
export function renderProtectedRoute(
  ui: ReactElement,
  initialRoute: string,
  userType: keyof typeof mockUsers | null = null,
  options: Omit<CustomRenderOptions, 'contextOptions'> = {}
) {
  return renderWithProviders(ui, {
    ...options,
    contextOptions: {
      initialRoute,
      userType,
      includeRouter: true,
      ...options,
    },
  })
}

/**
 * Utility for testing components that need routing
 */
export function renderWithRouter(
  ui: ReactElement,
  options: Omit<CustomRenderOptions, 'contextOptions'> = {}
) {
  return renderWithProviders(ui, {
    ...options,
    contextOptions: {
      includeRouter: true,
      ...options,
    },
  })
}

/**
 * Clean up function for tests
 */
export function cleanupTest() {
  // Reset to default user
  setMockCurrentUser('employee')

  // Reset i18n to English
  if (i18n.language !== 'en') {
    i18n.changeLanguage('en')
  }

  // Reset browser history
  window.history.pushState({}, '', '/')
}

// Re-export testing utilities
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
