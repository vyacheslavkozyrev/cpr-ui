// TypeScript types for offline queue management (Feature 0005)
// Handles offline submission queue, draft storage, and sync status

import type { SubmitFeedbackRequest } from './feedback'

/**
 * Sync status for queued submissions
 */
export const SyncStatus = {
  /** Waiting to be synced */
  Pending: 'pending',
  /** Currently being synced */
  Syncing: 'syncing',
  /** Successfully synced */
  Synced: 'synced',
  /** Failed to sync (after retries) */
  Failed: 'failed',
} as const

export type SyncStatus = (typeof SyncStatus)[keyof typeof SyncStatus]

/**
 * Queued feedback submission (stored in IndexedDB)
 */
export interface QueuedSubmission {
  /** Unique ID for this queue item */
  id: string
  /** Feedback submission data */
  data: SubmitFeedbackRequest
  /** Current sync status */
  status: SyncStatus
  /** Number of retry attempts */
  retry_count: number
  /** When this was queued (ISO 8601) */
  created_at: string
  /** Last sync attempt timestamp (ISO 8601) */
  last_attempt_at?: string | null
  /** Error message from last failed attempt */
  error_message?: string | null
}

/**
 * Retry configuration for offline queue
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  max_retries: number
  /** Base delay in milliseconds (for exponential backoff) */
  base_delay: number
  /** Maximum delay in milliseconds */
  max_delay: number
}

/**
 * Draft feedback submission (auto-saved)
 */
export interface FeedbackDraft {
  /** Draft ID (unique per form instance) */
  id: string
  /** Recipient employee ID */
  employee_id?: string | null
  /** Goal ID */
  goal_id?: string | null
  /** Project ID */
  project_id?: string | null
  /** Feedback content */
  content?: string | null
  /** Rating value */
  rating?: number | null
  /** Feedback request ID (if responding to request) */
  feedback_request_id?: string | null
  /** When draft was created (ISO 8601) */
  created_at: string
  /** When draft was last updated (ISO 8601) */
  updated_at: string
  /** Draft expiration timestamp (7 days from last update) */
  expires_at: string
}

/**
 * Cached feedback item (for offline viewing)
 */
export interface CachedFeedback {
  /** Feedback ID */
  id: string
  /** Feedback data */
  data: import('./feedback').MyFeedback
  /** When this was cached (ISO 8601) */
  cached_at: string
  /** Cache expiration timestamp */
  expires_at: string
}

/**
 * Sync result for a single queue item
 */
export interface SyncResult {
  /** Queue item ID */
  id: string
  /** Whether sync was successful */
  success: boolean
  /** Error message (if failed) */
  error?: string | null
  /** Server response (if successful) */
  response?: unknown | null
}

/**
 * Overall sync summary
 */
export interface SyncSummary {
  /** Total items in queue */
  total: number
  /** Successfully synced items */
  synced: number
  /** Failed items */
  failed: number
  /** Pending items */
  pending: number
  /** Last sync timestamp (ISO 8601) */
  last_sync_at?: string | null
}
