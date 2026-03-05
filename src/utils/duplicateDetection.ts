import { feedbackDb } from '../db/feedbackDb'

/**
 * Duplicate detection utility for feedback submissions
 * Prevents users from submitting feedback too frequently to the same person for the same goal
 *
 * Rules:
 * - 24-hour cooldown between feedback submissions for the same employee + goal combination
 * - Bypasses check if feedback is in response to a feedback request (feedback_request_id present)
 * - Uses cached feedback for quick lookup without API calls
 */

const DUPLICATE_WINDOW_HOURS = 24

export interface DuplicateCheckResult {
  isDuplicate: boolean
  existingFeedback?: {
    id: string
    created_at: Date
    hours_ago: number
    hours_remaining: number
  }
}

/**
 * Check if submitting feedback would be a duplicate
 * @param toEmployeeId - The ID of the employee receiving feedback
 * @param goalId - The ID of the goal being referenced
 * @param feedbackRequestId - Optional feedback request ID (bypasses duplicate check)
 * @returns Duplicate check result with details
 */
export async function checkDuplicateFeedback(
  toEmployeeId: string,
  goalId: string,
  feedbackRequestId?: string
): Promise<DuplicateCheckResult> {
  // Bypass duplicate check if responding to a feedback request
  if (feedbackRequestId) {
    return { isDuplicate: false }
  }

  // Calculate time window for duplicate detection
  const cutoffTime = new Date()
  cutoffTime.setHours(cutoffTime.getHours() - DUPLICATE_WINDOW_HOURS)

  // Query cached feedback for matching submissions within time window
  // Note: CachedFeedback stores minimal submission data for duplicate detection
  const allCachedFeedback = await feedbackDb.cachedFeedback.toArray()

  const cachedFeedback = allCachedFeedback.filter(feedback => {
    // Access the stored submission data
    const data = feedback.data as unknown as {
      to_employee_id: string
      goal_id: string
      created_at: string
    }
    return (
      data.to_employee_id === toEmployeeId &&
      data.goal_id === goalId &&
      new Date(data.created_at) >= cutoffTime
    )
  })

  if (cachedFeedback.length === 0) {
    return { isDuplicate: false }
  }

  // Get the most recent duplicate
  const mostRecent = cachedFeedback.sort((a, b) => {
    const aData = a.data as unknown as { created_at: string }
    const bData = b.data as unknown as { created_at: string }
    return (
      new Date(bData.created_at).getTime() -
      new Date(aData.created_at).getTime()
    )
  })[0]

  const createdAt = new Date(
    (mostRecent.data as unknown as { created_at: string }).created_at
  )
  const now = new Date()
  const hoursAgo = Math.floor(
    (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
  )
  const hoursRemaining = DUPLICATE_WINDOW_HOURS - hoursAgo

  return {
    isDuplicate: true,
    existingFeedback: {
      id: mostRecent.id,
      created_at: createdAt,
      hours_ago: hoursAgo,
      hours_remaining: Math.max(0, hoursRemaining),
    },
  }
}

/**
 * Cache a successfully submitted feedback for future duplicate detection
 * Should be called after successful submission
 * @param feedbackId - The ID of the submitted feedback
 * @param toEmployeeId - The ID of the employee who received the feedback
 * @param goalId - The ID of the goal referenced
 * @param projectId - Optional project ID
 * @param createdAt - When the feedback was created
 */
export async function cacheFeedbackForDuplicateDetection(
  feedbackId: string,
  toEmployeeId: string,
  goalId: string,
  projectId: string | null,
  createdAt: Date
): Promise<void> {
  const now = new Date()
  const expiryDate = new Date(now)
  expiryDate.setHours(expiryDate.getHours() + DUPLICATE_WINDOW_HOURS)

  // Store minimal data needed for duplicate detection
  // We're tracking sent feedback, not received feedback
  const submissionData = {
    to_employee_id: toEmployeeId,
    goal_id: goalId,
    project_id: projectId,
    created_at: createdAt.toISOString(),
  }

  await feedbackDb.cachedFeedback.put({
    id: feedbackId,
    data: submissionData as never, // Type cast needed because CachedFeedback.data expects MyFeedback
    cached_at: now.toISOString(),
    expires_at: expiryDate.toISOString(),
  })
}

/**
 * Clean up cached feedback older than the duplicate detection window
 * Should be called periodically (e.g., on app startup)
 * @returns Number of cached items removed
 */
export async function cleanupExpiredCache(): Promise<number> {
  const now = new Date()
  const nowISO = now.toISOString()

  const allCached = await feedbackDb.cachedFeedback.toArray()
  const expiredItems = allCached.filter(item => item.expires_at < nowISO)

  if (expiredItems.length > 0) {
    for (const item of expiredItems) {
      await feedbackDb.cachedFeedback.delete(item.id)
    }
  }

  return expiredItems.length
}

/**
 * Get all cached feedback for debugging/testing purposes
 * @returns Array of all cached feedback items
 */
export async function getAllCachedFeedback() {
  return feedbackDb.cachedFeedback.toArray()
}

/**
 * Clear all cached feedback (use with caution!)
 */
export async function clearCache(): Promise<void> {
  await feedbackDb.cachedFeedback.clear()
}

/**
 * Get duplicate detection window in hours
 */
export function getDuplicateWindowHours(): number {
  return DUPLICATE_WINDOW_HOURS
}
