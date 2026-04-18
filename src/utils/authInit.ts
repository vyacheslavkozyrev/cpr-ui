import { authConfig } from '../config/auth'
import { initializeMsal } from '../services'
import { useAuthStore } from '../stores/authStore'
import type { TCurrentUserDto } from '../dtos/UserDto'
import { logger } from './logger'

// Initialize authentication system
export const initializeAuth = async (): Promise<void> => {
  try {
    logger.auth('Initializing authentication system...')

    // Check if we're in stub mode
    if (authConfig.enableStubAuth) {
      logger.auth('Authentication running in stub mode')
      useAuthStore.getState().setStubMode(true)
      return
    }

    // Initialize MSAL
    await initializeMsal()
    logger.auth('MSAL initialized successfully')

    // Set stub mode to false for real authentication
    useAuthStore.getState().setStubMode(false)
  } catch (error) {
    logger.error('Failed to initialize authentication', { error })

    // Fallback to stub mode on initialization failure
    logger.warn('Falling back to stub authentication mode')
    useAuthStore.getState().setStubMode(true)
    useAuthStore
      .getState()
      .setError(
        `Authentication initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
  }
}

// Check for existing authentication on app startup
export const checkExistingAuth = async (): Promise<void> => {
  const authStore = useAuthStore.getState()

  try {
    // Skip if in stub mode
    if (authStore.isStubMode) {
      return
    }

    // Import auth service dynamically to avoid circular dependencies
    const { authService } = await import('../services/authService')

    // Check if user is already logged in
    const account = authService.getAccount()
    if (account) {
      authStore.setLoading(true)

      try {
        // Get fresh access token
        const accessToken = await authService.getAccessToken()

        // Convert account to user object
        const user = authService.convertToAuthUser(
          account,
          accessToken || undefined
        )

        // Update store with existing authentication
        authStore.setAuthenticated(true)
        authStore.setUser(user)
        authStore.setAccount(account)
        authStore.setTokens(accessToken, account.idToken || null)

        // Fetch roles from the API (roles are in DB, not in the Azure token)
        try {
          const meRes = await fetch(`${authConfig.apiBaseUrl}/me`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          })
          if (meRes.ok) {
            const meData = (await meRes.json()) as TCurrentUserDto
            if (meData.roles && meData.roles.length > 0) {
              authStore.setUser({ ...user, roles: meData.roles })
            }
          }
        } catch (err) {
          logger.warn('Failed to fetch roles from /api/me on restore', { err })
        }

        logger.auth('Existing authentication restored')
      } catch (tokenError) {
        logger.warn('Failed to get fresh token for existing user', {
          tokenError,
        })
        // Clear any stale authentication state
        authStore.reset()
      } finally {
        authStore.setLoading(false)
      }
    }
  } catch (error) {
    logger.error('Error checking existing authentication', { error })
    authStore.setLoading(false)
  }
}
