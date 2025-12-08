// Feedback Sync Hook
// Feature 0005 - Phase 3 US-002 (T056-T063)
// Handles automatic sync when coming back online

import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { logger } from '../utils/logger'
import { cleanupExpiredCache, initCacheManager } from './feedbackCacheManager'
import { syncOfflineQueue } from './offlineQueueService'

/**
 * Hook to handle feedback sync on reconnect
 *
 * Features:
 * - Detects online/offline status changes
 * - Syncs offline queue when coming back online
 * - Invalidates feedback queries to refetch fresh data
 * - Cleans up expired cache entries
 *
 * Usage: Call once at app root level
 */
export function useFeedbackSync() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Initialize cache manager on mount
    initCacheManager().catch(err => {
      logger.error('Failed to initialize cache manager', { error: err })
    })

    // Handle online event
    const handleOnline = async () => {
      logger.info('Device came online, syncing feedback data')

      try {
        // 1. Sync offline queue
        const syncResult = await syncOfflineQueue()

        if (syncResult.synced > 0) {
          logger.info('Synced offline feedback submissions', {
            synced: syncResult.synced,
            failed: syncResult.failed,
          })
        }

        // 2. Invalidate all feedback queries to refetch fresh data
        await queryClient.invalidateQueries({ queryKey: ['feedback'] })
        await queryClient.refetchQueries({
          queryKey: ['feedback', 'my'],
          type: 'active',
        })

        // 3. Clean up expired cache
        const deletedCount = await cleanupExpiredCache()
        if (deletedCount > 0) {
          logger.info('Cleaned up expired cache entries on reconnect', {
            deleted: deletedCount,
          })
        }

        logger.info('Feedback sync completed successfully')
      } catch (error) {
        logger.error('Failed to sync feedback on reconnect', { error })
      }
    }

    // Handle offline event
    const handleOffline = () => {
      logger.warn('Device went offline, feedback will be queued')
    }

    // Listen for online/offline events
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Log initial state
    if (navigator.onLine) {
      logger.info('Feedback sync initialized (online)')
    } else {
      logger.warn('Feedback sync initialized (offline)')
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [queryClient])
}

/**
 * Hook to manually trigger feedback sync
 * Useful for pull-to-refresh or manual sync buttons
 */
export function useManualFeedbackSync() {
  const queryClient = useQueryClient()

  const syncNow = async (): Promise<{
    success: boolean
    synced: number
    failed: number
    error?: string
  }> => {
    try {
      logger.info('Manual feedback sync triggered')

      // Check if online
      if (!navigator.onLine) {
        logger.warn('Cannot sync: device is offline')
        return {
          success: false,
          synced: 0,
          failed: 0,
          error: 'Device is offline',
        }
      }

      // 1. Sync offline queue
      const syncResult = await syncOfflineQueue()

      // 2. Invalidate and refetch feedback queries
      await queryClient.invalidateQueries({ queryKey: ['feedback'] })
      await queryClient.refetchQueries({
        queryKey: ['feedback', 'my'],
        type: 'active',
      })

      // 3. Clean up expired cache
      await cleanupExpiredCache()

      logger.info('Manual feedback sync completed', {
        synced: syncResult.synced,
        failed: syncResult.failed,
      })

      return {
        success: true,
        synced: syncResult.synced,
        failed: syncResult.failed,
      }
    } catch (error) {
      logger.error('Manual feedback sync failed', { error })
      return {
        success: false,
        synced: 0,
        failed: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  return { syncNow }
}
