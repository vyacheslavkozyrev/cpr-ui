/**
 * Offline Queue Hook
 * React hook for managing offline feedback request queue
 * Feature 0004 - Phase 3 US-001 T039
 */

import { useCallback, useEffect, useState } from 'react'
import { feedbackRequestApiService } from '../services/feedbackRequestService'
import {
  offlineQueueService,
  type QueuedRequest,
} from '../services/offlineQueueService'
import { logger } from '../utils/logger'

interface UseOfflineQueueOptions {
  /**
   * Enable automatic sync when online
   * @default true
   */
  autoSync?: boolean
  /**
   * Sync interval in milliseconds
   * @default 30000 (30 seconds)
   */
  syncInterval?: number
}

interface UseOfflineQueueResult {
  /** Pending request count */
  pendingCount: number
  /** Whether currently syncing */
  isSyncing: boolean
  /** Whether browser is online */
  isOnline: boolean
  /** All queued requests */
  queuedRequests: QueuedRequest[]
  /** Failed requests */
  failedRequests: QueuedRequest[]
  /** Manually trigger sync */
  sync: () => Promise<void>
  /** Refresh queue data */
  refresh: () => Promise<void>
  /** Clear all queued requests */
  clearQueue: () => Promise<void>
  /** Remove specific request */
  removeRequest: (id: string) => Promise<void>
}

/**
 * Hook for managing offline feedback request queue
 *
 * @param options Configuration options
 * @returns Queue state and control functions
 */
export function useOfflineQueue(
  options: UseOfflineQueueOptions = {}
): UseOfflineQueueResult {
  const { autoSync = true, syncInterval = 30000 } = options

  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [queuedRequests, setQueuedRequests] = useState<QueuedRequest[]>([])
  const [failedRequests, setFailedRequests] = useState<QueuedRequest[]>([])

  /**
   * Refresh queue data from IndexedDB
   */
  const refresh = useCallback(async () => {
    try {
      const [all, failed, count] = await Promise.all([
        offlineQueueService.getAllRequests(),
        offlineQueueService.getFailedRequests(),
        offlineQueueService.getPendingCount(),
      ])
      setQueuedRequests(all)
      setFailedRequests(failed)
      setPendingCount(count)
    } catch (error) {
      logger.error('Failed to refresh offline queue', {
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }, [])

  /**
   * Sync pending requests with server
   */
  const sync = useCallback(async () => {
    if (isSyncing || !isOnline) {
      return
    }

    setIsSyncing(true)
    logger.info('Starting offline queue sync')

    try {
      const pending = await offlineQueueService.getPendingRequests()

      for (const queuedRequest of pending) {
        try {
          // Mark as syncing
          await offlineQueueService.updateRequestStatus(
            queuedRequest.id,
            'syncing'
          )

          // Attempt to submit
          const response =
            await feedbackRequestApiService.createFeedbackRequest(
              queuedRequest.data
            )

          if (response.success) {
            // Success - remove from queue
            await offlineQueueService.dequeue(queuedRequest.id)
            logger.info('Successfully synced queued request', {
              queueId: queuedRequest.id,
            })
          } else {
            // Failed - mark as failed or retry
            if (offlineQueueService.canRetry(queuedRequest)) {
              await offlineQueueService.updateRequestStatus(
                queuedRequest.id,
                'pending',
                response.message
              )
            } else {
              await offlineQueueService.updateRequestStatus(
                queuedRequest.id,
                'failed',
                response.message
              )
            }
            logger.warn('Failed to sync queued request', {
              queueId: queuedRequest.id,
              error: response.message,
            })
          }
        } catch (error) {
          // Network or other error - retry or mark failed
          const errorMessage =
            error instanceof Error ? error.message : String(error)

          if (offlineQueueService.canRetry(queuedRequest)) {
            await offlineQueueService.updateRequestStatus(
              queuedRequest.id,
              'pending',
              errorMessage
            )
          } else {
            await offlineQueueService.updateRequestStatus(
              queuedRequest.id,
              'failed',
              errorMessage
            )
          }

          logger.error('Error syncing queued request', {
            queueId: queuedRequest.id,
            error: errorMessage,
          })
        }
      }

      // Refresh queue data
      await refresh()

      logger.info('Offline queue sync completed', {
        processed: pending.length,
      })
    } catch (error) {
      logger.error('Offline queue sync failed', {
        error: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setIsSyncing(false)
    }
  }, [isSyncing, isOnline, refresh])

  /**
   * Clear all queued requests
   */
  const clearQueue = async () => {
    try {
      await offlineQueueService.clearQueue()
      await refresh()
      logger.info('Offline queue cleared')
    } catch (error) {
      logger.error('Failed to clear offline queue', {
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  /**
   * Remove specific request
   */
  const removeRequest = async (id: string) => {
    try {
      await offlineQueueService.dequeue(id)
      await refresh()
      logger.info('Request removed from queue', { id })
    } catch (error) {
      logger.error('Failed to remove request from queue', {
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  /**
   * Initialize database and load initial data
   */
  useEffect(() => {
    const initialize = async () => {
      try {
        await offlineQueueService.init()
        await refresh()
      } catch (error) {
        logger.error('Failed to initialize offline queue', {
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    initialize()
  }, [refresh])

  /**
   * Listen for online/offline events
   */
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      logger.info('Browser is online')
      if (autoSync) {
        sync()
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      logger.info('Browser is offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [autoSync, sync])

  /**
   * Periodic sync when online and auto-sync enabled
   */
  useEffect(() => {
    if (!autoSync || !isOnline) {
      return
    }

    const intervalId = setInterval(() => {
      sync()
    }, syncInterval)

    return () => {
      clearInterval(intervalId)
    }
  }, [autoSync, isOnline, syncInterval, sync])

  return {
    pendingCount,
    isSyncing,
    isOnline,
    queuedRequests,
    failedRequests,
    sync,
    refresh,
    clearQueue,
    removeRequest,
  }
}
