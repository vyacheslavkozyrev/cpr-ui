import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  CreateFeedbackRequestDto,
  FeedbackRequestDto,
  UpdateFeedbackRequestDto,
} from '../types/feedbackRequest'
import { logger } from '../utils/logger'
import {
  feedbackRequestApiService,
  type FeedbackRequestListParams,
} from './feedbackRequestService'

/**
 * Feedback Request Query Service
 * React Query hooks for feedback request management
 * Feature 0004 - Feedback Request Management
 */

// ========================================
// Query Hooks (Data Fetching)
// ========================================

/**
 * Hook to get paginated list of sent feedback requests
 * GET /api/me/feedback/request
 */
export const useSentRequests = (
  params?: FeedbackRequestListParams,
  enabled = true
) => {
  return useQuery({
    queryKey: ['feedbackRequests', 'sent', params],
    queryFn: async () => {
      const response = await feedbackRequestApiService.getSentRequests(params)
      return response.success ? response.data : null
    },
    enabled,
    staleTime: 0, // Always refetch when params change
    gcTime: 5 * 60 * 1000, // 5 minutes in cache
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status?: number }).status
        if (status && status >= 400 && status < 500) {
          return false
        }
      }
      return failureCount < 2
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
  })
}

/**
 * Hook to get paginated list of todo feedback requests (as recipient)
 * GET /api/me/feedback/request/todo
 */
export const useTodoRequests = (
  params?: FeedbackRequestListParams,
  enabled = true
) => {
  return useQuery({
    queryKey: ['feedbackRequests', 'todo', params],
    queryFn: async () => {
      const response = await feedbackRequestApiService.getTodoRequests(params)
      return response.success ? response.data : null
    },
    enabled,
    staleTime: 0, // Always refetch when params change
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status?: number }).status
        if (status && status >= 400 && status < 500) {
          return false
        }
      }
      return failureCount < 2
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
  })
}

/**
 * Hook to get paginated list of team sent feedback requests (manager view)
 * GET /api/manager/feedback/request/sent
 */
export const useManagerTeamSentRequests = (
  params?: FeedbackRequestListParams,
  enabled = true
) => {
  return useQuery({
    queryKey: ['feedbackRequests', 'manager', 'sent', params],
    queryFn: async () => {
      const response =
        await feedbackRequestApiService.getTeamSentRequests(params)
      return response.success ? response.data : null
    },
    enabled,
    staleTime: 0, // Always refetch when params change
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status?: number }).status
        if (status && status >= 400 && status < 500) {
          return false
        }
      }
      return failureCount < 2
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
  })
}

/**
 * Hook to get paginated list of team received feedback requests (manager view)
 * GET /api/manager/feedback/request/received
 */
export const useManagerTeamReceivedRequests = (
  params?: FeedbackRequestListParams,
  enabled = true
) => {
  return useQuery({
    queryKey: ['feedbackRequests', 'manager', 'received', params],
    queryFn: async () => {
      const response =
        await feedbackRequestApiService.getTeamReceivedRequests(params)
      return response.success ? response.data : null
    },
    enabled,
    staleTime: 0, // Always refetch when params change
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status?: number }).status
        if (status && status >= 400 && status < 500) {
          return false
        }
      }
      return failureCount < 2
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
  })
}

/**
 * Hook to get count of pending todo requests (for notification badge)
 * Lightweight query that only fetches page 1 to get the total count
 */
export const useTodoRequestsCount = (enabled = true) => {
  return useQuery({
    queryKey: ['feedbackRequests', 'todo', 'count'],
    queryFn: async () => {
      const response = await feedbackRequestApiService.getTodoRequests({
        page: 1,
        page_size: 1, // Minimal data fetch
        status: 'pending',
      })
      return response.success ? (response.data?.summary.pending_count ?? 0) : 0
    },
    enabled,
    staleTime: 1 * 60 * 1000, // 1 minute - refresh frequently for notifications
    gcTime: 5 * 60 * 1000,
    retry: 1,
  })
}

/**
 * Hook to get team sent feedback requests (manager view)
 * GET /api/team/feedback/request/sent
 */
export const useTeamSentRequests = (
  params?: FeedbackRequestListParams,
  enabled = true
) => {
  return useQuery({
    queryKey: ['feedbackRequests', 'team', 'sent', params],
    queryFn: async () => {
      const response =
        await feedbackRequestApiService.getTeamSentRequests(params)
      return response.success ? response.data : null
    },
    enabled,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status?: number }).status
        if (status && status >= 400 && status < 500) {
          return false
        }
      }
      return failureCount < 2
    },
  })
}

/**
 * Hook to get team received feedback requests (manager view)
 * GET /api/team/feedback/request/received
 */
export const useTeamReceivedRequests = (
  params?: FeedbackRequestListParams,
  enabled = true
) => {
  return useQuery({
    queryKey: ['feedbackRequests', 'team', 'received', params],
    queryFn: async () => {
      const response =
        await feedbackRequestApiService.getTeamReceivedRequests(params)
      return response.success ? response.data : null
    },
    enabled,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status?: number }).status
        if (status && status >= 400 && status < 500) {
          return false
        }
      }
      return failureCount < 2
    },
  })
}

/**
 * Hook to get feedback request by ID
 * GET /api/feedback/request/{id}
 */
export const useFeedbackRequest = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['feedbackRequests', 'detail', id],
    queryFn: async () => {
      const response =
        await feedbackRequestApiService.getFeedbackRequestById(id)
      return response.success ? response.data : null
    },
    enabled: enabled && !!id,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

// ========================================
// Mutation Hooks (Data Modification)
// ========================================

/**
 * Hook to create a new feedback request
 * POST /api/feedback/request
 */
export const useCreateFeedbackRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (requestData: CreateFeedbackRequestDto) => {
      const response =
        await feedbackRequestApiService.createFeedbackRequest(requestData)
      if (!response.success || !response.data) {
        throw new Error('Failed to create feedback request')
      }
      return response.data
    },
    onSuccess: (newRequest: FeedbackRequestDto) => {
      queryClient.invalidateQueries({
        queryKey: ['feedbackRequests', 'sent'],
      })
      queryClient.setQueryData(
        ['feedbackRequests', 'detail', newRequest.id],
        newRequest
      )
      logger.info('Feedback request created successfully', {
        requestId: newRequest.id,
        recipientCount: newRequest.recipients.length,
      })
    },
    onError: error => {
      logger.error('Failed to create feedback request', { error })
    },
  })
}

/**
 * Hook to update feedback request (due_date only)
 * PATCH /api/feedback/request/{id}
 */
export const useUpdateFeedbackRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      updateData,
    }: {
      id: string
      updateData: UpdateFeedbackRequestDto
    }) => {
      const response = await feedbackRequestApiService.updateFeedbackRequest(
        id,
        updateData
      )
      if (!response.success || !response.data) {
        throw new Error('Failed to update feedback request')
      }
      return response.data
    },
    onSuccess: (updatedRequest: FeedbackRequestDto) => {
      queryClient.invalidateQueries({
        queryKey: ['feedbackRequests', 'sent'],
      })
      queryClient.invalidateQueries({
        queryKey: ['feedbackRequests', 'todo'],
      })
      queryClient.setQueryData(
        ['feedbackRequests', 'detail', updatedRequest.id],
        updatedRequest
      )
      logger.info('Feedback request updated successfully', {
        requestId: updatedRequest.id,
      })
    },
    onError: error => {
      logger.error('Failed to update feedback request', { error })
    },
  })
}

/**
 * Hook to cancel entire feedback request
 * DELETE /api/feedback/request/{id}
 */
export const useCancelFeedbackRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await feedbackRequestApiService.cancelFeedbackRequest(id)
      if (!response.success) {
        throw new Error('Failed to cancel feedback request')
      }
      return id
    },
    onSuccess: (requestId: string) => {
      queryClient.invalidateQueries({
        queryKey: ['feedbackRequests', 'sent'],
      })
      queryClient.invalidateQueries({
        queryKey: ['feedbackRequests', 'todo'],
      })
      queryClient.invalidateQueries({
        queryKey: ['feedbackRequests', 'team'],
      })
      queryClient.removeQueries({
        queryKey: ['feedbackRequests', 'detail', requestId],
      })
      logger.info('Feedback request cancelled successfully', { requestId })
    },
    onError: error => {
      logger.error('Failed to cancel feedback request', { error })
    },
  })
}

/**
 * Hook to cancel specific recipient from feedback request
 * DELETE /api/feedback/request/{id}/recipient/{recipientId}
 */
export const useCancelRecipient = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      requestId,
      recipientId,
    }: {
      requestId: string
      recipientId: string
    }) => {
      const response = await feedbackRequestApiService.cancelRecipient(
        requestId,
        recipientId
      )
      if (!response.success) {
        throw new Error('Failed to cancel recipient')
      }
      return { requestId, recipientId }
    },
    onSuccess: ({ requestId }) => {
      queryClient.invalidateQueries({
        queryKey: ['feedbackRequests', 'sent'],
      })
      queryClient.invalidateQueries({
        queryKey: ['feedbackRequests', 'detail', requestId],
      })
      logger.info('Recipient cancelled successfully', { requestId })
    },
    onError: error => {
      logger.error('Failed to cancel recipient', { error })
    },
  })
}

/**
 * Hook to send reminder to specific recipient
 * POST /api/feedback/request/{id}/recipient/{recipientId}/remind
 */
export const useSendReminder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      requestId,
      recipientId,
    }: {
      requestId: string
      recipientId: string
    }) => {
      const response = await feedbackRequestApiService.sendReminder(
        requestId,
        recipientId
      )
      if (!response.success) {
        throw new Error('Failed to send reminder')
      }
      return { requestId, recipientId }
    },
    onSuccess: ({ requestId }) => {
      queryClient.invalidateQueries({
        queryKey: ['feedbackRequests', 'detail', requestId],
      })
      logger.info('Reminder sent successfully', { requestId })
    },
    onError: error => {
      logger.error('Failed to send reminder', { error })
    },
  })
}

/**
 * Hook to send reminders to all eligible recipients
 * POST /api/feedback/request/{id}/remind-all
 */
export const useSendAllReminders = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (requestId: string) => {
      const response =
        await feedbackRequestApiService.sendAllReminders(requestId)
      if (!response.success || !response.data) {
        throw new Error('Failed to send reminders')
      }
      return { requestId, remindersSent: response.data.reminders_sent }
    },
    onSuccess: ({ requestId, remindersSent }) => {
      queryClient.invalidateQueries({
        queryKey: ['feedbackRequests', 'detail', requestId],
      })
      logger.info('Reminders sent successfully', { requestId, remindersSent })
    },
    onError: error => {
      logger.error('Failed to send reminders', { error })
    },
  })
}
