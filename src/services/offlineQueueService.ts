/**
 * Offline Queue Service
 * Manages offline feedback request queue using IndexedDB
 * Feature 0004 - Phase 3 US-001 T039
 */

import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { CreateFeedbackRequestDto } from '../types/feedbackRequest'
import { logger } from '../utils/logger'

// Database schema
interface OfflineQueueDB extends DBSchema {
  feedbackRequests: {
    key: string // UUID
    value: QueuedRequest
    indexes: {
      timestamp: number
      employeeId: string
    }
  }
}

// Queued request structure
export interface QueuedRequest {
  id: string // UUID for this queue entry
  data: CreateFeedbackRequestDto
  timestamp: number
  employeeId: string
  retryCount: number
  lastError?: string
  status: 'pending' | 'syncing' | 'failed'
}

// Database configuration
const DB_NAME = 'cpr-offline-queue'
const DB_VERSION = 1
const STORE_NAME = 'feedbackRequests'
const MAX_RETRIES = 3

class OfflineQueueService {
  private db: IDBPDatabase<OfflineQueueDB> | null = null

  /**
   * Initialize IndexedDB
   */
  async init(): Promise<void> {
    try {
      this.db = await openDB<OfflineQueueDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          // Create object store
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })

            // Create indexes
            store.createIndex('timestamp', 'timestamp')
            store.createIndex('employeeId', 'employeeId')
          }
        },
      })
      logger.info('Offline queue database initialized')
    } catch (error) {
      logger.error('Failed to initialize offline queue database', {
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  /**
   * Ensure database is initialized
   */
  private async ensureDb(): Promise<IDBPDatabase<OfflineQueueDB>> {
    if (!this.db) {
      await this.init()
    }
    if (!this.db) {
      throw new Error('Database not initialized')
    }
    return this.db
  }

  /**
   * Add request to offline queue
   */
  async enqueue(
    data: CreateFeedbackRequestDto,
    employeeId: string
  ): Promise<QueuedRequest> {
    const db = await this.ensureDb()

    const queuedRequest: QueuedRequest = {
      id: crypto.randomUUID(),
      data,
      timestamp: Date.now(),
      employeeId,
      retryCount: 0,
      status: 'pending',
    }

    try {
      await db.add(STORE_NAME, queuedRequest)
      logger.info('Request added to offline queue', { id: queuedRequest.id })
      return queuedRequest
    } catch (error) {
      logger.error('Failed to add request to offline queue', {
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  /**
   * Get all pending requests
   */
  async getPendingRequests(): Promise<QueuedRequest[]> {
    const db = await this.ensureDb()

    try {
      const allRequests = await db.getAll(STORE_NAME)
      return allRequests.filter(
        (req: QueuedRequest) => req.status === 'pending'
      )
    } catch (error) {
      logger.error('Failed to get pending requests', {
        error: error instanceof Error ? error.message : String(error),
      })
      return []
    }
  }

  /**
   * Get all requests (any status)
   */
  async getAllRequests(): Promise<QueuedRequest[]> {
    const db = await this.ensureDb()

    try {
      return await db.getAll(STORE_NAME)
    } catch (error) {
      logger.error('Failed to get all requests', {
        error: error instanceof Error ? error.message : String(error),
      })
      return []
    }
  }

  /**
   * Get pending request count
   */
  async getPendingCount(): Promise<number> {
    const pending = await this.getPendingRequests()
    return pending.length
  }

  /**
   * Update request status
   */
  async updateRequestStatus(
    id: string,
    status: QueuedRequest['status'],
    error?: string
  ): Promise<void> {
    const db = await this.ensureDb()

    try {
      const request = await db.get(STORE_NAME, id)
      if (!request) {
        logger.warn('Request not found for status update', { id })
        return
      }

      request.status = status
      if (error) {
        request.lastError = error
        request.retryCount += 1
      }

      await db.put(STORE_NAME, request)
      logger.debug('Request status updated', { id, status })
    } catch (error) {
      logger.error('Failed to update request status', {
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  /**
   * Remove request from queue
   */
  async dequeue(id: string): Promise<void> {
    const db = await this.ensureDb()

    try {
      await db.delete(STORE_NAME, id)
      logger.info('Request removed from offline queue', { id })
    } catch (error) {
      logger.error('Failed to remove request from queue', {
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  /**
   * Clear all requests from queue
   */
  async clearQueue(): Promise<void> {
    const db = await this.ensureDb()

    try {
      await db.clear(STORE_NAME)
      logger.info('Offline queue cleared')
    } catch (error) {
      logger.error('Failed to clear offline queue', {
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  /**
   * Get failed requests (exceeded retry count)
   */
  async getFailedRequests(): Promise<QueuedRequest[]> {
    const db = await this.ensureDb()

    try {
      const allRequests = await db.getAll(STORE_NAME)
      return allRequests.filter(
        (req: QueuedRequest) =>
          req.status === 'failed' || req.retryCount >= MAX_RETRIES
      )
    } catch (error) {
      logger.error('Failed to get failed requests', {
        error: error instanceof Error ? error.message : String(error),
      })
      return []
    }
  }

  /**
   * Remove old failed requests (cleanup)
   */
  async cleanupFailedRequests(olderThanDays: number = 7): Promise<number> {
    const db = await this.ensureDb()
    const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000

    try {
      const failedRequests = await this.getFailedRequests()
      const toDelete = failedRequests.filter(req => req.timestamp < cutoffTime)

      for (const request of toDelete) {
        await db.delete(STORE_NAME, request.id)
      }

      logger.info('Cleaned up old failed requests', { count: toDelete.length })
      return toDelete.length
    } catch (error) {
      logger.error('Failed to cleanup failed requests', {
        error: error instanceof Error ? error.message : String(error),
      })
      return 0
    }
  }

  /**
   * Check if request can be retried
   */
  canRetry(request: QueuedRequest): boolean {
    return request.retryCount < MAX_RETRIES
  }

  /**
   * Check if browser is online
   */
  isOnline(): boolean {
    return navigator.onLine
  }
}

// Export singleton instance
export const offlineQueueService = new OfflineQueueService()

/**
 * Sync offline queue (helper function for feedback sync)
 * Returns number of requests synced successfully and failed
 */
export async function syncOfflineQueue(): Promise<{
  synced: number
  failed: number
}> {
  const pending = await offlineQueueService.getPendingRequests()

  let synced = 0
  let failed = 0

  for (const request of pending) {
    try {
      // Note: Actual sync logic would call API here
      // For now, just mark as synced (will be implemented with API integration)
      logger.info('Would sync offline request', { id: request.id })
      synced++
    } catch (error) {
      logger.error('Failed to sync offline request', { id: request.id, error })
      failed++
    }
  }

  return { synced, failed }
}
