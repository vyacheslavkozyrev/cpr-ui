// IndexedDB schema for Feedback feature using Dexie
// Stores: drafts, offline queue, cached feedback

import Dexie, { type Table } from 'dexie'
import type {
  CachedFeedback,
  FeedbackDraft,
  QueuedSubmission,
} from '../types/offlineQueue'

/**
 * Database schema for Feedback feature
 * Version 1: Initial schema with drafts, offline queue, and cached feedback
 */
export class FeedbackDatabase extends Dexie {
  // Tables - using string key type instead of literal 'id' to avoid TypeScript issues with delete/get methods
  drafts!: Table<FeedbackDraft, string>
  offlineQueue!: Table<QueuedSubmission, string>
  cachedFeedback!: Table<CachedFeedback, string>

  constructor() {
    super('CPR_Feedback')

    // Define database schema
    this.version(1).stores({
      // Drafts table (auto-saved feedback forms)
      // Indexes: id (primary), expires_at, employee_id, feedback_request_id
      drafts: 'id, expires_at, employee_id, feedback_request_id',

      // Offline queue table (submissions pending sync)
      // Indexes: id (primary), status, created_at, last_attempt_at
      offlineQueue: 'id, status, created_at, last_attempt_at',

      // Cached feedback table (for offline viewing)
      // Indexes: id (primary), expires_at, cached_at
      cachedFeedback: 'id, expires_at, cached_at',
    })
  }
}

// Singleton instance
export const feedbackDb = new FeedbackDatabase()

/**
 * Database utility functions
 */

/**
 * Clean up expired drafts (older than 7 days)
 */
export async function cleanupExpiredDrafts(): Promise<number> {
  const now = new Date().toISOString()
  const deleted = await feedbackDb.drafts
    .where('expires_at')
    .below(now)
    .delete()
  return deleted
}

/**
 * Clean up expired cached feedback
 */
export async function cleanupExpiredCache(): Promise<number> {
  const now = new Date().toISOString()
  const deleted = await feedbackDb.cachedFeedback
    .where('expires_at')
    .below(now)
    .delete()
  return deleted
}

/**
 * Get all pending queue items (status = 'pending')
 */
export async function getPendingQueueItems(): Promise<QueuedSubmission[]> {
  return feedbackDb.offlineQueue
    .where('status')
    .equals('pending')
    .sortBy('created_at')
}

/**
 * Get draft by feedback request ID (for responding to requests)
 */
export async function getDraftByRequestId(
  requestId: string
): Promise<FeedbackDraft | undefined> {
  return feedbackDb.drafts
    .where('feedback_request_id')
    .equals(requestId)
    .first()
}

/**
 * Clear all database data (for testing/reset)
 */
export async function clearAllData(): Promise<void> {
  await Promise.all([
    feedbackDb.drafts.clear(),
    feedbackDb.offlineQueue.clear(),
    feedbackDb.cachedFeedback.clear(),
  ])
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<{
  drafts: number
  queueItems: number
  cachedItems: number
}> {
  const [drafts, queueItems, cachedItems] = await Promise.all([
    feedbackDb.drafts.count(),
    feedbackDb.offlineQueue.count(),
    feedbackDb.cachedFeedback.count(),
  ])

  return { drafts, queueItems, cachedItems }
}
