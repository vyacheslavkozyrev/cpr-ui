import { useEffect } from 'react'
import { initializeApiClient } from '../services/apiClient'

/**
 * Hook to initialize the API client with authentication token getter
 * Should be called once during app initialization
 */
export const useInitializeApiClient = (
  getAuthToken: () => Promise<string | null>
): void => {
  useEffect(() => {
    // Initialize the API client with token getter
    initializeApiClient(getAuthToken)
  }, [getAuthToken])
}

export default useInitializeApiClient
