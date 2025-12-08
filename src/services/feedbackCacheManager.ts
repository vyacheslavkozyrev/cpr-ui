// Feedback Cache Manager
// Feature 0005 - Phase 3 US-002 (T056-T063)
// Manages IndexedDB caching for offline feedback viewing

import { feedbackDb } from '../db/feedbackDb'
import type { MyFeedback } from '../types/feedback'
import type { CachedFeedback } from '../types/offlineQueue'
import { logger } from '../utils/logger'

/**
 * Cache configuration
 */
const CACHE_CONFIG = {
  MAX_ITEMS: 100, // Maximum number of items to cache
  EXPIRY_DAYS: 7, // Cache expiry in days
  STALE_TIME_MS: 5 * 60 * 1000, // 5 minutes - when to consider cache stale
} as const

/**
 * Convert MyFeedback to CachedFeedback
 */
function toCachedFeedback(feedback: MyFeedback): CachedFeedback {
  const now = new Date().toISOString()
  const expiresAt = new Date(
    Date.now() + CACHE_CONFIG.EXPIRY_DAYS * 24 * 60 * 60 * 1000
  ).toISOString()

  return {
    id: feedback.id,
    data: feedback,
    cached_at: now,
    expires_at: expiresAt,
  }
}

/**
 * Cache feedback items (limit to MAX_ITEMS most recent)
 * @param feedbackList - List of feedback items to cache
 * @returns Number of items cached
 */
export async function cacheFeedbackList(
  feedbackList: MyFeedback[]
): Promise<number> {
  try {
    // Sort by created_at desc and take only MAX_ITEMS most recent
    const sortedFeedback = [...feedbackList]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, CACHE_CONFIG.MAX_ITEMS)

    // Convert to cached format
    const cachedItems = sortedFeedback.map(toCachedFeedback)

    // Clear old cache and insert new items
    await feedbackDb.cachedFeedback.clear()
    await feedbackDb.cachedFeedback.bulkAdd(cachedItems)

    logger.info('Cached feedback list', {
      count: cachedItems.length,
      maxItems: CACHE_CONFIG.MAX_ITEMS,
    })

    return cachedItems.length
  } catch (error) {
    logger.error('Failed to cache feedback list', { error })
    return 0
  }
}

/**
 * Cache a single feedback item
 * @param feedback - Feedback item to cache
 */
export async function cacheFeedbackItem(
  feedback: MyFeedback
): Promise<boolean> {
  try {
    const cachedItem = toCachedFeedback(feedback)
    await feedbackDb.cachedFeedback.put(cachedItem)

    logger.info('Cached feedback item', { feedbackId: feedback.id })
    return true
  } catch (error) {
    logger.error('Failed to cache feedback item', { error, id: feedback.id })
    return false
  }
}

/**
 * Get cached feedback list
 * @returns Cached feedback items, sorted by created_at desc
 */
export async function getCachedFeedbackList(): Promise<MyFeedback[]> {
  try {
    const cachedItems = await feedbackDb.cachedFeedback.toArray()

    // Filter out expired items
    const now = new Date().toISOString()
    const validItems = cachedItems.filter(item => item.expires_at > now)

    // Extract data and sort by created_at desc
    const feedbackList = validItems
      .map(item => item.data)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

    logger.info('Retrieved cached feedback list', {
      count: feedbackList.length,
    })
    return feedbackList
  } catch (error) {
    logger.error('Failed to retrieve cached feedback list', { error })
    return []
  }
}

/**
 * Get cached feedback item by ID
 * @param feedbackId - ID of feedback item
 * @returns Cached feedback item or null if not found/expired
 */
export async function getCachedFeedbackItem(
  feedbackId: string
): Promise<MyFeedback | null> {
  try {
    const cachedItem = await feedbackDb.cachedFeedback.get(feedbackId)

    if (!cachedItem) {
      return null
    }

    // Check if expired
    const now = new Date().toISOString()
    if (cachedItem.expires_at <= now) {
      // Clean up expired item
      await feedbackDb.cachedFeedback.delete(feedbackId)
      return null
    }

    logger.info('Retrieved cached feedback item', { feedbackId })
    return cachedItem.data
  } catch (error) {
    logger.error('Failed to retrieve cached feedback item', {
      error,
      feedbackId,
    })
    return null
  }
}

/**
 * Check if cache is stale (needs refresh)
 * @param cachedAt - ISO timestamp when cache was created
 * @returns True if cache is older than STALE_TIME_MS
 */
export function isCacheStale(cachedAt: string): boolean {
  const cacheAge = Date.now() - new Date(cachedAt).getTime()
  return cacheAge > CACHE_CONFIG.STALE_TIME_MS
}

/**
 * Get cache metadata for debugging
 */
export async function getCacheMetadata(): Promise<{
  count: number
  oldestCachedAt: string | null
  newestCachedAt: string | null
  hasExpiredItems: boolean
}> {
  try {
    const cachedItems = await feedbackDb.cachedFeedback.toArray()
    const now = new Date().toISOString()

    if (cachedItems.length === 0) {
      return {
        count: 0,
        oldestCachedAt: null,
        newestCachedAt: null,
        hasExpiredItems: false,
      }
    }

    const sortedByDate = [...cachedItems].sort(
      (a, b) =>
        new Date(a.cached_at).getTime() - new Date(b.cached_at).getTime()
    )

    return {
      count: cachedItems.length,
      oldestCachedAt: sortedByDate[0].cached_at,
      newestCachedAt: sortedByDate[sortedByDate.length - 1].cached_at,
      hasExpiredItems: cachedItems.some(item => item.expires_at <= now),
    }
  } catch (error) {
    logger.error('Failed to get cache metadata', { error })
    return {
      count: 0,
      oldestCachedAt: null,
      newestCachedAt: null,
      hasExpiredItems: false,
    }
  }
}

/**
 * Clean up expired cache entries
 * @returns Number of items deleted
 */
export async function cleanupExpiredCache(): Promise<number> {
  try {
    const now = new Date().toISOString()
    const deleted = await feedbackDb.cachedFeedback
      .where('expires_at')
      .below(now)
      .delete()

    if (deleted > 0) {
      logger.info('Cleaned up expired cache entries', { deleted })
    }

    return deleted
  } catch (error) {
    logger.error('Failed to cleanup expired cache', { error })
    return 0
  }
}

/**
 * Clear all cached feedback (for manual refresh)
 */
export async function clearAllCache(): Promise<void> {
  try {
    await feedbackDb.cachedFeedback.clear()
    logger.info('Cleared all feedback cache')
  } catch (error) {
    logger.error('Failed to clear cache', { error })
  }
}

/**
 * Initialize cache manager (cleanup expired items on app start)
 */
export async function initCacheManager(): Promise<void> {
  try {
    const deleted = await cleanupExpiredCache()
    const metadata = await getCacheMetadata()

    logger.info('Feedback cache manager initialized', {
      cachedItems: metadata.count,
      expiredItemsDeleted: deleted,
    })
  } catch (error) {
    logger.error('Failed to initialize cache manager', { error })
  }
}
