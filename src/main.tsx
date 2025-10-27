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

/**
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

    initAuth().catch(console.error)
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemedApp />
  </StrictMode>
)
