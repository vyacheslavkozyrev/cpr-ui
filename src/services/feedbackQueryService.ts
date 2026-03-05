import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import type {
  Feedback,
  MyFeedback,
  SubmitFeedbackRequest,
} from '../types/feedback'
import { logger } from '../utils/logger'
import {
  cacheFeedbackItem,
  cacheFeedbackList,
  getCachedFeedbackItem,
  getCachedFeedbackList,
} from './feedbackCacheManager'
import {
  feedbackApiService,
  type FeedbackAnalyticsParams,
  type MyFeedbackQueryParams,
} from './feedbackService'

/**
 * Feedback Query Service
 * React Query hooks for feedback submission and collection
 * Feature 0005 - Feedback Submission Collection
 * Phase 3 US-002: Added offline caching with IndexedDB (T056-T063)
 */

// ========================================
// Query Hooks (Data Fetching)
// ========================================

/**
 * Hook to get paginated list of feedback received by current user
 * GET /api/me/feedback
 * Note: Backend doesn't support query params yet, returns all feedback
 *
 * Phase 3 US-002 (T056-T063): Added offline caching support
 * - Returns cached data when offline
 * - Automatically caches successful fetches (last 100 items)
 * - 5-minute stale time for cache invalidation
 */
export const useMyFeedback = (
  params?: MyFeedbackQueryParams,
  enabled = true
) => {
  const query = useQuery({
    queryKey: ['feedback', 'my', params],
    queryFn: async () => {
      try {
        // Try to fetch from API
        const response = await feedbackApiService.getMyFeedback(params)

        if (response.success && response.data) {
          // Cache successful response (limit to 100 most recent items)
          await cacheFeedbackList(response.data)
          return response.data
        }

        return null
      } catch (error) {
        // If offline or network error, fall back to cache
        logger.warn('Failed to fetch feedback from API, using cache', { error })
        const cachedData = await getCachedFeedbackList()

        if (cachedData.length > 0) {
          logger.info('Using cached feedback data', {
            count: cachedData.length,
          })
          return cachedData
        }

        // Re-throw if no cache available
        throw error
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes - increased for better offline experience
    gcTime: 10 * 60 * 1000, // 10 minutes in cache
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status?: number }).status
        if (status && status >= 400 && status < 500) {
          return false
        }
      }
      return failureCount < 2
    },
    // Return cached data immediately while revalidating
    placeholderData: previousData => previousData,
  })

  // On mount, try to load cached data immediately (for offline-first experience)
  useEffect(() => {
    if (query.data === undefined && !query.isFetching) {
      getCachedFeedbackList()
        .then(cachedData => {
          if (cachedData.length > 0 && !query.data) {
            logger.info('Loaded initial cache data', {
              count: cachedData.length,
            })
            // Note: We can't directly set query data here, React Query will handle it
            // The queryFn will use cache as fallback
          }
        })
        .catch(err => {
          logger.error('Failed to load cached feedback on mount', {
            error: err,
          })
        })
    }
  }, [query.data, query.isFetching])

  return query
}

/**
 * Hook to get a single feedback item by ID
 * GET /api/me/feedback/{id}
 *
 * Phase 3 US-002 (T056-T063): Added offline caching support
 * - Returns cached item when offline
 * - Automatically caches successful fetches
 */
export const useFeedbackById = (feedbackId?: string, enabled = true) => {
  return useQuery({
    queryKey: ['feedback', 'detail', feedbackId],
    queryFn: async () => {
      if (!feedbackId) {
        throw new Error('Feedback ID is required')
      }

      try {
        // Try to fetch from API
        const response = await feedbackApiService.getFeedbackById(feedbackId)

        if (response.success && response.data) {
          // Cache successful response
          await cacheFeedbackItem(response.data as MyFeedback)
          return response.data
        }

        return null
      } catch (error) {
        // If offline or network error, fall back to cache
        logger.warn('Failed to fetch feedback detail from API, using cache', {
          error,
          feedbackId,
        })
        const cachedData = await getCachedFeedbackItem(feedbackId)

        if (cachedData) {
          logger.info('Using cached feedback detail', { feedbackId })
          return cachedData
        }

        // Re-throw if no cache available
        throw error
      }
    },
    enabled: enabled && !!feedbackId,
    staleTime: 5 * 60 * 1000, // 5 minutes - individual feedback rarely changes
    gcTime: 15 * 60 * 1000, // 15 minutes in cache
    // Return cached data immediately while revalidating
    placeholderData: previousData => previousData,
  })
}

/**
 * Hook to get feedback analytics
 * GET /api/me/feedback/analytics
 */
export const useFeedbackAnalytics = (
  params?: FeedbackAnalyticsParams,
  enabled = true
) => {
  return useQuery({
    queryKey: ['feedback', 'analytics', params],
    queryFn: async () => {
      const response = await feedbackApiService.getFeedbackAnalytics(params)
      return response.success ? response.data : null
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes - analytics are less time-sensitive
    gcTime: 15 * 60 * 1000, // 15 minutes in cache
  })
}

// ========================================
// Mutation Hooks (Data Modification)
// ========================================

/**
 * Hook to submit new feedback
 * POST /api/feedback
 *
 * Features:
 * - Optimistic updates for immediate UI feedback
 * - Automatic cache invalidation on success
 * - Support for feedback request completion
 *
 * Phase 3 US-002 (T056-T063): Added optimistic cache updates
 * - Immediately adds submitted feedback to cache
 * - Creates optimistic MyFeedback object for instant UI feedback
 * - Rolls back cache on submission failure
 */
export const useSubmitFeedback = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (feedbackData: SubmitFeedbackRequest) => {
      const response = await feedbackApiService.submitFeedback(feedbackData)
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to submit feedback')
      }
      return response.data
    },
    onMutate: async (newFeedback: SubmitFeedbackRequest) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['feedback', 'my'] })

      // Snapshot previous value for rollback
      const previousFeedback = queryClient.getQueryData<MyFeedback[]>([
        'feedback',
        'my',
      ])

      // Create optimistic feedback object
      // Note: We approximate some fields that will be corrected on server response
      const optimisticFeedback: MyFeedback = {
        id: `temp-${Date.now()}`, // Temporary ID
        from_employee: {
          id: newFeedback.employee_id,
          display_name: 'Loading...', // Will be replaced on success
        },
        from_employee_id: newFeedback.employee_id,
        goal_id: newFeedback.goal_id,
        goal: {
          id: newFeedback.goal_id,
          title: 'Loading...', // Will be replaced
        },
        project_id: newFeedback.project_id || null,
        project: newFeedback.project_id
          ? {
              id: newFeedback.project_id,
              name: 'Loading...',
            }
          : null,
        rating: newFeedback.rating,
        content: newFeedback.content,
        created_at: new Date().toISOString(),
      }

      // Optimistically update cache
      if (previousFeedback) {
        const updatedFeedback = [optimisticFeedback, ...previousFeedback]
        queryClient.setQueryData(['feedback', 'my'], updatedFeedback)

        // Also update IndexedDB cache optimistically
        await cacheFeedbackList(updatedFeedback)
      }

      logger.info('Submitting feedback with optimistic update', {
        to: newFeedback.employee_id,
        goal: newFeedback.goal_id,
      })

      return { previousFeedback }
    },
    onSuccess: async (
      newFeedback: Feedback,
      variables: SubmitFeedbackRequest
    ) => {
      // Update cache with real feedback data from server
      const currentData = queryClient.getQueryData<MyFeedback[]>([
        'feedback',
        'my',
      ])
      if (currentData) {
        // Replace optimistic item with real data
        const updatedData = currentData.map(item =>
          item.id.startsWith('temp-') ? (newFeedback as MyFeedback) : item
        )
        queryClient.setQueryData(['feedback', 'my'], updatedData)

        // Update IndexedDB cache with real data
        await cacheFeedbackList(updatedData)
      }

      // Invalidate feedback lists to refetch with new feedback
      queryClient.invalidateQueries({ queryKey: ['feedback', 'my'] })
      queryClient.invalidateQueries({ queryKey: ['feedback', 'analytics'] })

      // If this was in response to a feedback request, invalidate request queries
      if (variables.feedback_request_id) {
        queryClient.invalidateQueries({
          queryKey: ['feedbackRequests', 'todo'],
        })
        queryClient.invalidateQueries({
          queryKey: [
            'feedbackRequests',
            'detail',
            variables.feedback_request_id,
          ],
        })
      }

      logger.info('Feedback submitted successfully', {
        feedbackId: newFeedback.id,
        to: variables.employee_id,
      })
    },
    onError: async (error, variables, context) => {
      // Rollback on error
      if (context?.previousFeedback) {
        queryClient.setQueryData(['feedback', 'my'], context.previousFeedback)

        // Rollback IndexedDB cache
        await cacheFeedbackList(context.previousFeedback)
      }

      logger.error('Failed to submit feedback', {
        error,
        to: variables.employee_id,
      })
    },
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback', 'my'] })
    },
  })
}

/**
 * Hook to complete a feedback request by submitting feedback
 * This is a convenience wrapper around useSubmitFeedback that ensures
 * the feedback_request_id is properly set and handles completion logic
 */
export const useCompleteFeedbackRequest = () => {
  const submitFeedbackMutation = useSubmitFeedback()

  return {
    ...submitFeedbackMutation,
    mutate: (
      feedbackData: SubmitFeedbackRequest & { feedback_request_id: string }
    ) => {
      // Ensure feedback_request_id is present
      if (!feedbackData.feedback_request_id) {
        throw new Error('feedback_request_id is required to complete a request')
      }
      submitFeedbackMutation.mutate(feedbackData)
    },
    mutateAsync: async (
      feedbackData: SubmitFeedbackRequest & { feedback_request_id: string }
    ) => {
      // Ensure feedback_request_id is present
      if (!feedbackData.feedback_request_id) {
        throw new Error('feedback_request_id is required to complete a request')
      }
      return submitFeedbackMutation.mutateAsync(feedbackData)
    },
  }
}
