import { useEffect, useState } from 'react'

/**
 * Online/Offline Status Hook
 * Detects network connectivity changes
 * Feature 0001 - Phase 5B
 */

/**
 * Custom hook to detect online/offline status
 *
 * @returns boolean - true if online, false if offline
 *
 * @example
 * ```tsx
 * const isOnline = useOnlineStatus()
 *
 * if (!isOnline) {
 *   return <OfflineBanner />
 * }
 * ```
 */
export const useOnlineStatus = (): boolean => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}
