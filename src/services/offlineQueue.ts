import { feedbackDb } from '../db/feedbackDb'
import type { SubmitFeedbackRequest } from '../types/feedback'
import type { QueuedSubmission, SyncStatus } from '../types/offlineQueue'
import { feedbackApiService } from './feedbackService'

/**
 * Service for managing offline feedback submission queue
 * Features:
 * - Queue submissions when offline
 * - Automatic sync when connection restored
 * - Retry failed submissions with exponential backoff
 * - Event-driven notifications for UI updates
 * - Maximum 3 retry attempts per submission
 */

type QueueEventType = 'added' | 'syncing' | 'success' | 'failed' | 'retry'

interface QueueEvent {
  type: QueueEventType
  submission: QueuedSubmission
  timestamp: Date
  error?: Error
}

type QueueEventHandler = (event: QueueEvent) => void

interface RetryConfig {
  max_attempts: number
  base_delay_ms: number
  max_delay_ms: number
}

class OfflineQueueService {
  private readonly RETRY_CONFIG: RetryConfig = {
    max_attempts: 3,
    base_delay_ms: 1000, // 1 second
    max_delay_ms: 8000, // 8 seconds max
  }

  private eventHandlers: Set<QueueEventHandler> = new Set()
  private isSyncing = false
  private syncInterval: NodeJS.Timeout | null = null
  private readonly SYNC_INTERVAL_MS = 30000 // Check every 30 seconds

  constructor() {
    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.onConnectionRestored())
      window.addEventListener('offline', () => this.onConnectionLost())
    }
  }

  /**
   * Subscribe to queue events for UI updates
   */
  public subscribe(handler: QueueEventHandler): () => void {
    this.eventHandlers.add(handler)
    return () => this.eventHandlers.delete(handler)
  }

  /**
   * Emit queue events to all subscribers
   */
  private emit(event: QueueEvent): void {
    this.eventHandlers.forEach(handler => {
      try {
        handler(event)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Queue event handler error:', error)
      }
    })
  }

  /**
   * Add a feedback submission to the offline queue
   * @param request - The feedback submission request
   * @param draftId - Optional draft ID to clean up after successful submission
   * @returns The queued submission ID
   */
  public async addToQueue(request: SubmitFeedbackRequest): Promise<string> {
    const now = new Date()

    const submission: QueuedSubmission = {
      id: crypto.randomUUID(),
      data: request,
      status: 'pending' as SyncStatus,
      created_at: now.toISOString(),
      retry_count: 0,
      last_attempt_at: null,
      error_message: null,
    }

    await feedbackDb.offlineQueue.add(submission)

    this.emit({
      type: 'added',
      submission,
      timestamp: now,
    })

    // Try to sync immediately if online
    if (this.isOnline()) {
      void this.syncQueue()
    }

    return submission.id
  }

  /**
   * Sync all pending submissions in the queue
   * Processes items sequentially with retry logic
   * @returns Number of successfully synced submissions
   */
  public async syncQueue(): Promise<number> {
    // Prevent concurrent syncs
    if (this.isSyncing) {
      return 0
    }

    // Check if online
    if (!this.isOnline()) {
      return 0
    }

    this.isSyncing = true
    let successCount = 0

    try {
      const pendingItems = await feedbackDb.offlineQueue
        .where('status')
        .equals('pending' as SyncStatus)
        .toArray()

      // Also get failed items that haven't exceeded retry limit
      const failedItems = await feedbackDb.offlineQueue
        .where('status')
        .equals('failed' as SyncStatus)
        .toArray()

      const retriableItems = failedItems.filter(
        item => item.retry_count < this.RETRY_CONFIG.max_attempts
      )

      const allItems = [...pendingItems, ...retriableItems]

      for (const item of allItems) {
        try {
          await this.syncItem(item)
          successCount++
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(`Failed to sync item ${item.id}:`, error)
          // Continue with next item
        }
      }
    } finally {
      this.isSyncing = false
    }

    return successCount
  }

  /**
   * Sync a single queued submission
   * @param submission - The submission to sync
   */
  private async syncItem(submission: QueuedSubmission): Promise<void> {
    const now = new Date()

    // Update status to syncing
    const updatedForSync = { ...submission, status: 'syncing' as SyncStatus }
    await feedbackDb.offlineQueue.put(updatedForSync)

    this.emit({
      type: 'syncing',
      submission: updatedForSync,
      timestamp: now,
    })

    try {
      // Attempt to submit feedback
      await feedbackApiService.submitFeedback(submission.data)

      // Success! Remove from queue
      await feedbackDb.offlineQueue.delete(submission.id)

      this.emit({
        type: 'success',
        submission: { ...submission, status: 'synced' as SyncStatus },
        timestamp: now,
      })
    } catch (error) {
      // Failed - update retry count and status
      const retryCount = submission.retry_count + 1
      const hasRetriesLeft = retryCount < this.RETRY_CONFIG.max_attempts

      const submissionsToUpdate = await feedbackDb.offlineQueue
        .where('id')
        .equals(submission.id)
        .toArray()

      if (submissionsToUpdate.length > 0) {
        const updated = {
          ...submissionsToUpdate[0],
          status: hasRetriesLeft
            ? ('pending' as SyncStatus)
            : ('failed' as SyncStatus),
          retry_count: retryCount,
          last_attempt_at: now.toISOString(),
          error_message:
            error instanceof Error ? error.message : 'Unknown error',
        }
        await feedbackDb.offlineQueue.put(updated)
      }

      const updatedSubmission: QueuedSubmission = {
        ...submission,
        status: hasRetriesLeft
          ? ('pending' as SyncStatus)
          : ('failed' as SyncStatus),
        retry_count: retryCount,
        last_attempt_at: now.toISOString(),
        error_message: error instanceof Error ? error.message : 'Unknown error',
      }

      this.emit({
        type: hasRetriesLeft ? 'retry' : 'failed',
        submission: updatedSubmission,
        timestamp: now,
        error: error instanceof Error ? error : new Error('Unknown error'),
      })

      // Schedule retry with exponential backoff if retries left
      if (hasRetriesLeft) {
        const delay = this.calculateRetryDelay(retryCount)
        await this.scheduleRetry(updatedSubmission, delay)
      }

      // Re-throw to signal failure
      throw error
    }
  }

  /**
   * Calculate exponential backoff delay
   * @param retryCount - Current retry attempt number
   * @returns Delay in milliseconds
   */
  private calculateRetryDelay(retryCount: number): number {
    const delay = this.RETRY_CONFIG.base_delay_ms * Math.pow(2, retryCount - 1)
    return Math.min(delay, this.RETRY_CONFIG.max_delay_ms)
  }

  /**
   * Schedule a retry for a failed submission
   * @param submission - The submission to retry
   * @param delay - Delay in milliseconds
   */
  private async scheduleRetry(
    submission: QueuedSubmission,
    delay: number
  ): Promise<void> {
    return new Promise(resolve => {
      setTimeout(async () => {
        try {
          await this.syncItem(submission)
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_error) {
          // Error already handled in syncItem
        }
        resolve()
      }, delay)
    })
  }

  /**
   * Get all items in the queue (any status)
   * @returns Array of all queued submissions
   */
  public async getAllQueuedItems(): Promise<QueuedSubmission[]> {
    return feedbackDb.offlineQueue.toArray()
  }

  /**
   * Get pending items count
   * @returns Number of pending submissions
   */
  public async getPendingCount(): Promise<number> {
    return feedbackDb.offlineQueue
      .where('status')
      .equals('pending' as SyncStatus)
      .count()
  }

  /**
   * Get failed items that can't be retried anymore
   * @returns Array of permanently failed submissions
   */
  public async getFailedItems(): Promise<QueuedSubmission[]> {
    const failed = await feedbackDb.offlineQueue
      .where('status')
      .equals('failed' as SyncStatus)
      .toArray()

    return failed.filter(
      item => item.retry_count >= this.RETRY_CONFIG.max_attempts
    )
  }

  /**
   * Manually retry a specific failed submission
   * Resets retry count to allow retrying
   * @param submissionId - The ID of the submission to retry
   */
  public async retryFailedItem(submissionId: string): Promise<void> {
    const submissions = await feedbackDb.offlineQueue
      .where('id')
      .equals(submissionId)
      .toArray()

    if (submissions.length === 0) {
      throw new Error(`Submission ${submissionId} not found in queue`)
    }

    const submission = submissions[0]

    // Reset retry count and status
    const updated = {
      ...submission,
      status: 'pending' as SyncStatus,
      retry_count: 0,
      last_attempt_at: null,
      error_message: null,
    }
    await feedbackDb.offlineQueue.put(updated)

    // Try to sync if online
    if (this.isOnline()) {
      await this.syncItem(updated)
    }
  }

  /**
   * Remove a permanently failed item from the queue
   * @param submissionId - The ID of the submission to remove
   */
  public async removeFailedItem(submissionId: string): Promise<void> {
    await feedbackDb.offlineQueue.delete(submissionId)
  }

  /**
   * Clear all items from the queue (use with caution!)
   */
  public async clearQueue(): Promise<void> {
    await feedbackDb.offlineQueue.clear()
  }

  /**
   * Start automatic sync polling
   * Checks for pending items every 30 seconds when online
   */
  public startAutoSync(): void {
    if (this.syncInterval) {
      return // Already running
    }

    this.syncInterval = setInterval(() => {
      if (this.isOnline()) {
        void this.syncQueue()
      }
    }, this.SYNC_INTERVAL_MS)
  }

  /**
   * Stop automatic sync polling
   */
  public stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  /**
   * Handle connection restored event
   */
  private onConnectionRestored(): void {
    // eslint-disable-next-line no-console
    console.log('Connection restored, attempting to sync offline queue...')
    void this.syncQueue()
  }

  /**
   * Handle connection lost event
   */
  private onConnectionLost(): void {
    // eslint-disable-next-line no-console
    console.log('Connection lost, queuing submissions for later sync...')
  }

  /**
   * Check if browser is online
   */
  private isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true
  }

  /**
   * Clean up event listeners (call on unmount)
   */
  public destroy(): void {
    this.stopAutoSync()
    this.eventHandlers.clear()

    if (typeof window !== 'undefined') {
      window.removeEventListener('online', () => this.onConnectionRestored())
      window.removeEventListener('offline', () => this.onConnectionLost())
    }
  }
}

// Export singleton instance
export const offlineQueue = new OfflineQueueService()

// Export types
export type { QueueEvent, QueueEventHandler, QueueEventType }
