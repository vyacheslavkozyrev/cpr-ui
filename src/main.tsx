import { CssBaseline, ThemeProvider } from '@mui/material'
import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { ToastContainer } from './components'
import { AppErrorBoundary } from './components/errors'
import { QueryProvider } from './components/providers/QueryProvider'
import { useInitializeApiClient } from './hooks/useInitializeApiClient'
import './index.css'
import { routes } from './routes'
import { useAuthStore } from './stores/authStore'
import { useThemeStore } from './stores/themeStore'
import { darkTheme, lightTheme } from './theme/index'
import { checkExistingAuth, initializeAuth } from './utils/authInit'

// Initialize theme detection
import './utils/themeInit'

// Initialize i18n
import './config/i18n'
import { logger } from './utils/logger'

/**
 * Enable MSW (Mock Service Worker) if configured
 */
async function enableMocking() {
  if (import.meta.env['VITE_USE_MSW'] === 'true') {
    logger.msw('Initializing Mock Service Worker...')

    try {
      const { worker } = await import('./mocks/browser')

      await worker.start({
        onUnhandledRequest: 'warn', // Warn about unhandled requests
        serviceWorker: {
          url: '/mockServiceWorker.js',
        },
      })

      logger.msw('Mock Service Worker initialized successfully')
      logger.msw(`Mock Mode: ${import.meta.env['VITE_API_MODE']}`)
      logger.msw(
        `Mock User Role: ${import.meta.env['VITE_MOCK_USER_ROLE'] || 'employee'}`
      )
    } catch (error) {
      logger.error('Failed to initialize Mock Service Worker', { error })
    }
  }
} /**
 * API Client Initializer component
 * Sets up the API client with authentication token getter
 */
function ApiClientInitializer({ children }: { children: React.ReactNode }) {
  const getAccessToken = useAuthStore(state => state.getAccessToken)

  // Initialize API client with auth token getter
  useInitializeApiClient(getAccessToken)

  return <>{children}</>
}

// Create router instance
const router = createBrowserRouter(routes)

// Theme-aware root component with auth initialization
function ThemedApp() {
  const resolvedTheme = useThemeStore(state => state.resolvedTheme)
  const currentTheme = resolvedTheme === 'dark' ? darkTheme : lightTheme

  useEffect(() => {
    // Initialize authentication system
    const initAuth = async () => {
      await initializeAuth()
      await checkExistingAuth()
    }

    initAuth().catch(error =>
      logger.error('Failed to initialize auth', { error })
    )
  }, [])

  return (
    <AppErrorBoundary>
      <QueryProvider>
        <ApiClientInitializer>
          <ThemeProvider theme={currentTheme}>
            <CssBaseline />
            <RouterProvider router={router} />
            <ToastContainer />
          </ThemeProvider>
        </ApiClientInitializer>
      </QueryProvider>
    </AppErrorBoundary>
  )
}

// Initialize MSW before rendering the app
enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ThemedApp />
    </StrictMode>
  )
})
