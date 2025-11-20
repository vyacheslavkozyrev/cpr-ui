import { useToastStore } from '../stores/toastStore'
import type { TApiResponse } from '../types/apiTypes'
import type {
  CreateFeedbackRequestDto,
  FeedbackRequestDto,
  PaginatedFeedbackRequestsDto,
  SendReminderResponseDto,
  UpdateFeedbackRequestDto,
} from '../types/feedbackRequest'
import { logger } from '../utils/logger'
import {
  addToQueue,
  getQueuedRequests,
  removeFromQueue,
  updateQueuedRequest,
  type QueuedRequest,
} from '../utils/offlineQueue'
import { apiClient } from './apiClient'

/**
 * Query parameters for listing feedback requests
 */
export interface FeedbackRequestListParams {
  /** Page number (1-based) */
  page?: number
  /** Items per page (default: 20) */
  page_size?: number
  /** Sort field (created_at, due_date, updated_at) */
  sort_by?: string
  /** Sort order (asc, desc) */
  sort_order?: 'asc' | 'desc'
  /** Filter by status (pending, partial, complete, cancelled) */
  status?: string
  /** Search query (message, requestor name, recipient name) */
  search?: string
}

/**
 * Feedback Request API Service
 * Handles all feedback request-related API calls
 * Feature 0004 - Feedback Request Management
 */
export class FeedbackRequestApiService {
  // ========================================
  // Create Feedback Request
  // ========================================

  /**
   * Create a new multi-recipient feedback request
   * POST /api/feedback/request
   *
   * @param requestData - Feedback request data with 1-20 recipient employee IDs
   * @returns Created feedback request with recipients
   *
   * Error cases:
   * - 400: Validation errors (employee_ids 1-20, message <=500 chars, etc.)
   * - 403: Self-request (requestor in employee_ids)
   * - 409: Duplicate request (same recipients + project/goal combination)
   * - 429: Rate limit exceeded (>50 requests in 24 hours)
   *
   * T039: Offline queue support
   * - Checks navigator.onLine before making request
   * - If offline, saves to IndexedDB queue and shows toast notification
   * - Request will be retried when connection is restored
   */
  async createFeedbackRequest(
    requestData: CreateFeedbackRequestDto
  ): Promise<TApiResponse<FeedbackRequestDto>> {
    // Check if online
    if (!navigator.onLine) {
      // Save to offline queue
      await addToQueue({
        url: '/feedback/request',
        method: 'POST',
        body: requestData,
        maxRetries: 3,
      })

      // Show toast notification
      const addToast = useToastStore.getState().addToast
      addToast(
        'You are offline. Your feedback request will be sent when you reconnect.',
        'warning',
        8000
      )

      // Return a pending response
      return {
        data: {} as FeedbackRequestDto,
        success: false,
        message: 'Request queued for offline processing',
        timestamp: new Date().toISOString(),
      }
    }

    return apiClient.post<FeedbackRequestDto>('/feedback/request', requestData)
  }

  // ========================================
  // Get Feedback Requests
  // ========================================

  /**
   * Get feedback request by ID
   * GET /api/feedback/request/{id}
   *
   * @param id - Feedback request ID
   * @returns Feedback request details with recipients
   *
   * Error cases:
   * - 404: Request not found or user not authorized (not requestor)
   */
  async getFeedbackRequestById(
    id: string
  ): Promise<TApiResponse<FeedbackRequestDto>> {
    return apiClient.get<FeedbackRequestDto>(`/feedback/request/${id}`)
  }

  /**
   * Get sent feedback requests for current user
   * GET /api/me/feedback/request
   *
   * @param params - Query parameters for pagination, filtering, sorting
   * @returns Paginated list of sent requests with per-recipient status
   */
  async getSentRequests(
    params?: FeedbackRequestListParams
  ): Promise<TApiResponse<PaginatedFeedbackRequestsDto>> {
    const queryParams = new URLSearchParams()

    if (params) {
      if (params.page) queryParams.set('page', params.page.toString())
      if (params.page_size)
        queryParams.set('page_size', params.page_size.toString())
      if (params.sort_by) queryParams.set('sort_by', params.sort_by)
      if (params.sort_order) queryParams.set('sort_order', params.sort_order)
      if (params.status) queryParams.set('status', params.status)
      if (params.search) queryParams.set('search', params.search)
    }

    const query = queryParams.toString()
    const url = query ? `/me/feedback/request?${query}` : '/me/feedback/request'

    return apiClient.get<PaginatedFeedbackRequestsDto>(url)
  }

  /**
   * Get todo feedback requests for current user (as recipient)
   * GET /api/me/feedback/request/todo
   *
   * @param params - Query parameters for pagination, filtering, sorting
   * @returns Paginated list of requests where user is recipient
   */
  async getTodoRequests(
    params?: FeedbackRequestListParams
  ): Promise<TApiResponse<PaginatedFeedbackRequestsDto>> {
    const queryParams = new URLSearchParams()

    if (params) {
      if (params.page) queryParams.set('page', params.page.toString())
      if (params.page_size)
        queryParams.set('page_size', params.page_size.toString())
      if (params.sort_by) queryParams.set('sort_by', params.sort_by)
      if (params.sort_order) queryParams.set('sort_order', params.sort_order)
      if (params.status) queryParams.set('status', params.status)
      if (params.search) queryParams.set('search', params.search)
    }

    const query = queryParams.toString()
    const url = query
      ? `/me/feedback/request/todo?${query}`
      : '/me/feedback/request/todo'

    return apiClient.get<PaginatedFeedbackRequestsDto>(url)
  }

  /**
   * Get team sent feedback requests (manager view)
   * GET /api/team/feedback/request/sent
   *
   * Requires: People Manager, Solution Owner, Director, or Administrator role
   *
   * @param params - Query parameters for pagination, filtering, sorting
   * @returns Paginated list of team members' sent requests
   *
   * Error cases:
   * - 403: Not a manager or insufficient permissions
   */
  async getTeamSentRequests(
    params?: FeedbackRequestListParams
  ): Promise<TApiResponse<PaginatedFeedbackRequestsDto>> {
    const queryParams = new URLSearchParams()

    if (params) {
      if (params.page) queryParams.set('page', params.page.toString())
      if (params.page_size)
        queryParams.set('page_size', params.page_size.toString())
      if (params.sort_by) queryParams.set('sort_by', params.sort_by)
      if (params.sort_order) queryParams.set('sort_order', params.sort_order)
      if (params.status) queryParams.set('status', params.status)
      if (params.search) queryParams.set('search', params.search)
    }

    const query = queryParams.toString()
    const url = query
      ? `/team/feedback/request/sent?${query}`
      : '/team/feedback/request/sent'

    return apiClient.get<PaginatedFeedbackRequestsDto>(url)
  }

  /**
   * Get team received feedback requests (manager view)
   * GET /api/team/feedback/request/received
   *
   * Requires: People Manager, Solution Owner, Director, or Administrator role
   *
   * @param params - Query parameters for pagination, filtering, sorting
   * @returns Paginated list of requests addressed to team members
   *
   * Error cases:
   * - 403: Not a manager or insufficient permissions
   */
  async getTeamReceivedRequests(
    params?: FeedbackRequestListParams
  ): Promise<TApiResponse<PaginatedFeedbackRequestsDto>> {
    const queryParams = new URLSearchParams()

    if (params) {
      if (params.page) queryParams.set('page', params.page.toString())
      if (params.page_size)
        queryParams.set('page_size', params.page_size.toString())
      if (params.sort_by) queryParams.set('sort_by', params.sort_by)
      if (params.sort_order) queryParams.set('sort_order', params.sort_order)
      if (params.status) queryParams.set('status', params.status)
      if (params.search) queryParams.set('search', params.search)
    }

    const query = queryParams.toString()
    const url = query
      ? `/team/feedback/request/received?${query}`
      : '/team/feedback/request/received'

    return apiClient.get<PaginatedFeedbackRequestsDto>(url)
  }

  // ========================================
  // Update Feedback Request
  // ========================================

  /**
   * Update feedback request (due_date only)
   * PATCH /api/feedback/request/{id}
   *
   * @param id - Feedback request ID
   * @param updateData - Update data (due_date field)
   * @returns Updated feedback request
   *
   * Error cases:
   * - 400: Invalid due_date (past date)
   * - 403: Not the requestor
   * - 404: Request not found
   */
  async updateFeedbackRequest(
    id: string,
    updateData: UpdateFeedbackRequestDto
  ): Promise<TApiResponse<FeedbackRequestDto>> {
    return apiClient.patch<FeedbackRequestDto>(
      `/feedback/request/${id}`,
      updateData
    )
  }

  // ========================================
  // Cancel Feedback Request
  // ========================================

  /**
   * Cancel entire feedback request (soft delete)
   * DELETE /api/feedback/request/{id}
   *
   * Marks all recipients as cancelled (is_completed=true, no responded_at)
   *
   * @param id - Feedback request ID
   *
   * Error cases:
   * - 403: Not the requestor
   * - 404: Request not found
   */
  async cancelFeedbackRequest(id: string): Promise<TApiResponse<void>> {
    return apiClient.delete<void>(`/feedback/request/${id}`)
  }

  /**
   * Cancel specific recipient from feedback request
   * DELETE /api/feedback/request/{id}/recipient/{recipientId}
   *
   * Marks individual recipient as cancelled, preserves other recipients
   *
   * @param id - Feedback request ID
   * @param recipientId - Recipient ID to cancel
   *
   * Error cases:
   * - 400: Cannot cancel if recipient already responded
   * - 400: Must have at least 1 remaining recipient
   * - 403: Not the requestor
   * - 404: Request or recipient not found
   */
  async cancelRecipient(
    id: string,
    recipientId: string
  ): Promise<TApiResponse<void>> {
    return apiClient.delete<void>(
      `/feedback/request/${id}/recipient/${recipientId}`
    )
  }

  // ========================================
  // Send Reminders
  // ========================================

  /**
   * Send reminder to specific recipient
   * POST /api/feedback/request/{id}/recipient/{recipientId}/remind
   *
   * Enforces 48-hour throttling per recipient
   *
   * @param id - Feedback request ID
   * @param recipientId - Recipient ID to remind
   *
   * Error cases:
   * - 400: Recipient already responded
   * - 400: Recipient already completed/cancelled
   * - 403: Not the requestor
   * - 404: Request or recipient not found
   * - 429: Reminder sent within last 48 hours
   */
  async sendReminder(
    id: string,
    recipientId: string
  ): Promise<TApiResponse<void>> {
    return apiClient.post<void>(
      `/feedback/request/${id}/recipient/${recipientId}/remind`,
      {}
    )
  }

  /**
   * Send reminders to all eligible recipients
   * POST /api/feedback/request/{id}/remind-all
   *
   * Sends reminders to recipients who:
   * - Have not responded
   * - Not cancelled/completed
   * - Last reminder >48 hours ago (or never reminded)
   *
   * @param id - Feedback request ID
   * @returns Number of reminders sent
   *
   * Error cases:
   * - 403: Not the requestor
   * - 404: Request not found
   */
  async sendAllReminders(
    id: string
  ): Promise<TApiResponse<SendReminderResponseDto>> {
    return apiClient.post<SendReminderResponseDto>(
      `/feedback/request/${id}/remind-all`,
      {}
    )
  }
}

/**
 * Singleton instance of FeedbackRequestApiService
 */
export const feedbackRequestApiService = new FeedbackRequestApiService()

// ========================================
// Offline Queue Management (T039)
// ========================================

/**
 * Process queued requests when back online
 * Retries all queued requests and removes successful ones from queue
 */
async function processOfflineQueue(): Promise<void> {
  try {
    const queuedRequests = await getQueuedRequests()

    if (queuedRequests.length === 0) {
      return
    }

    const addToast = useToastStore.getState().addToast
    addToast(
      `Processing ${queuedRequests.length} queued request(s)...`,
      'info',
      4000
    )

    let successCount = 0
    let failureCount = 0

    for (const request of queuedRequests) {
      try {
        // Retry the request
        let response: TApiResponse<unknown>

        switch (request.method) {
          case 'POST':
            response = await apiClient.post(request.url, request.body)
            break
          case 'PUT':
            response = await apiClient.put(request.url, request.body)
            break
          case 'PATCH':
            response = await apiClient.patch(request.url, request.body)
            break
          case 'DELETE':
            response = await apiClient.delete(request.url)
            break
          case 'GET':
          default:
            response = await apiClient.get(request.url)
            break
        }

        if (response.success) {
          // Remove from queue on success
          await removeFromQueue(request.id)
          successCount++
        } else {
          // Increment retry count
          const updatedRequest: QueuedRequest = {
            ...request,
            retryCount: request.retryCount + 1,
          }

          if (updatedRequest.retryCount >= updatedRequest.maxRetries) {
            // Max retries reached, remove from queue
            await removeFromQueue(request.id)
            failureCount++
          } else {
            // Update retry count
            await updateQueuedRequest(updatedRequest)
          }
        }
      } catch {
        // Increment retry count on error
        const updatedRequest: QueuedRequest = {
          ...request,
          retryCount: request.retryCount + 1,
        }

        if (updatedRequest.retryCount >= updatedRequest.maxRetries) {
          // Max retries reached, remove from queue
          await removeFromQueue(request.id)
          failureCount++
        } else {
          // Update retry count
          await updateQueuedRequest(updatedRequest)
        }
      }
    }

    // Show results toast
    if (successCount > 0) {
      addToast(
        `Successfully sent ${successCount} queued request(s)`,
        'success',
        6000
      )
    }
    if (failureCount > 0) {
      addToast(
        `Failed to send ${failureCount} request(s). Please try again later.`,
        'error',
        8000
      )
    }
  } catch (error) {
    logger.error('Failed to process offline queue', { error })
  }
}

/**
 * Initialize offline queue listeners
 * Sets up event listener for when connection is restored
 * Should be called once during app initialization
 */
export function initializeOfflineQueue(): void {
  // Listen for online event
  window.addEventListener('online', () => {
    const addToast = useToastStore.getState().addToast
    addToast(
      'Connection restored. Processing queued requests...',
      'success',
      4000
    )

    // Process the queue
    processOfflineQueue()
  })

  // Listen for offline event
  window.addEventListener('offline', () => {
    const addToast = useToastStore.getState().addToast
    addToast(
      'You are offline. Your requests will be queued and sent when reconnected.',
      'warning',
      6000
    )
  })

  // Check if there are queued requests on initialization
  getQueuedRequests().then(requests => {
    if (requests.length > 0 && navigator.onLine) {
      // Process queue if online and has pending requests
      processOfflineQueue()
    }
  })
}
