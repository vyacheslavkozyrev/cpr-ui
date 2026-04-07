// Feedback Submission & Collection API Service
// Feature 0005 - Feedback Submission Collection
// Handles API calls for submitting and retrieving feedback

import type { TApiResponse } from '../types/apiTypes'
import type {
  Feedback,
  FeedbackAnalytics,
  FeedbackFilters,
  FeedbackSortOptions,
  MyFeedback,
  SubmitFeedbackRequest,
} from '../types/feedback'
import { apiClient } from './apiClient'

/**
 * Query parameters for GET /api/me/feedback
 * Note: Backend currently does NOT support these params (returns all feedback)
 * Frontend implements client-side filtering as fallback
 */
export interface MyFeedbackQueryParams
  extends FeedbackFilters, Partial<FeedbackSortOptions> {
  /** Page number (1-based) */
  page?: number
  /** Items per page */
  page_size?: number
}

/**
 * Analytics query parameters
 */
export interface FeedbackAnalyticsParams {
  /** Start date for analytics period (ISO 8601) */
  date_from?: string
  /** End date for analytics period (ISO 8601) */
  date_to?: string
  /** Enable comparison with previous period */
  include_comparison?: boolean
}

/**
 * Feedback API Service
 * Handles all feedback submission and retrieval operations
 */
export class FeedbackApiService {
  // ========================================
  // Submit Feedback
  // ========================================

  /**
   * Submit feedback to a colleague
   * POST /api/feedback
   *
   * @param feedbackData - Feedback submission data
   * @returns Created feedback with full details
   *
   * Error cases:
   * - 400: Validation errors (content 10-2000 chars, rating 1-5, etc.)
   * - 401: Unauthorized (no valid token)
   * - 404: Employee/Goal/Project not found
   * - 409: Duplicate feedback (same employee + goal within 24 hours, unless responding to request)
   * - 429: Rate limit exceeded
   *
   * Business Rules:
   * - BR-008: Duplicate detection (24-hour window, bypassed if feedback_request_id present)
   * - BR-009: Content sanitization (input cleaning, no HTML allowed)
   * - BR-010: If responding to feedback request, marks request as completed
   */
  async submitFeedback(
    feedbackData: SubmitFeedbackRequest
  ): Promise<TApiResponse<Feedback>> {
    return apiClient.post<Feedback>('/feedback', feedbackData)
  }

  // ========================================
  // Get My Feedback
  // ========================================

  /**
   * Get all feedback received by current user
   * GET /api/me/feedback
   *
   * @param params - Query parameters (page, filters, sort)
   * @returns List of feedback received by current user
   *
   * Note: Backend currently does NOT support query params
   * Returns all feedback items without filtering/sorting/pagination
   * Frontend must implement client-side filtering as fallback
   */
  async getMyFeedback(
    _params?: MyFeedbackQueryParams
  ): Promise<TApiResponse<MyFeedback[]>> {
    // Backend doesn't support query params yet, so we ignore them
    // Frontend will implement client-side filtering
    return apiClient.get<MyFeedback[]>('/me/feedback')
  }

  // ========================================
  // Get Feedback By ID
  // ========================================

  /**
   * Get detailed feedback by ID
   * GET /api/feedback/:id
   *
   * @param id - Feedback ID
   * @returns Feedback details
   *
   * Error cases:
   * - 404: Feedback not found
   * - 403: Unauthorized (can only view own feedback)
   */
  async getFeedbackById(id: string): Promise<TApiResponse<Feedback>> {
    return apiClient.get<Feedback>(`/feedback/${id}`)
  }

  // ========================================
  // Get Feedback Analytics
  // ========================================

  /**
   * Get analytics for feedback received by current user
   * GET /api/me/feedback/analytics
   *
   * @param params - Analytics query parameters (date range, comparison)
   * @returns Analytics data with metrics, charts, top lists
   *
   * Note: This endpoint may not exist in backend yet
   * Frontend may need to calculate analytics client-side
   */
  async getFeedbackAnalytics(
    params?: FeedbackAnalyticsParams
  ): Promise<TApiResponse<FeedbackAnalytics>> {
    const query = new URLSearchParams()
    if (params?.date_from) query.append('date_from', params.date_from)
    if (params?.date_to) query.append('date_to', params.date_to)
    if (params?.include_comparison) query.append('include_comparison', 'true')

    const queryString = query.toString()
    const url = queryString
      ? `/me/feedback/analytics?${queryString}`
      : '/me/feedback/analytics'

    return apiClient.get<FeedbackAnalytics>(url)
  }
}

/**
 * Singleton instance
 */
export const feedbackApiService = new FeedbackApiService()

/**
 * Utility functions for data transformation
 */

/**
 * Transform camelCase filter keys to snake_case for API
 * (Not needed currently since backend doesn't accept params,
 *  but included for future backend enhancement)
 */
export function transformFiltersToSnakeCase(
  filters: FeedbackFilters
): Record<string, string> {
  const snakeCase: Record<string, string> = {}

  if (filters.date_from) snakeCase['date_from'] = filters.date_from
  if (filters.date_to) snakeCase['date_to'] = filters.date_to
  if (filters.rating !== undefined && filters.rating !== null)
    snakeCase['rating'] = filters.rating.toString()
  if (filters.goal_id) snakeCase['goal_id'] = filters.goal_id
  if (filters.project_id) snakeCase['project_id'] = filters.project_id
  if (filters.from_employee_id)
    snakeCase['from_employee_id'] = filters.from_employee_id
  if (filters.search) snakeCase['search'] = filters.search

  return snakeCase
}

/**
 * Transform snake_case API response to camelCase for frontend
 * (API already returns snake_case as per CPR naming conventions)
 */
export function transformMyFeedbackFromApi(
  apiFeedback: MyFeedback
): MyFeedback {
  // API already uses snake_case, so no transformation needed
  // This function exists for consistency and future flexibility
  return apiFeedback
}

/**
 * Calculate client-side filters for MyFeedback list
 * (Used when backend doesn't support query params)
 */
export function applyClientSideFilters(
  feedback: MyFeedback[],
  filters: FeedbackFilters
): MyFeedback[] {
  let filtered = [...feedback]

  // Date range filter
  if (filters.date_from) {
    const fromDate = new Date(filters.date_from)
    filtered = filtered.filter(f => new Date(f.created_at) >= fromDate)
  }
  if (filters.date_to) {
    const toDate = new Date(filters.date_to)
    filtered = filtered.filter(f => new Date(f.created_at) <= toDate)
  }

  // Rating filter
  if (filters.rating !== undefined && filters.rating !== null) {
    filtered = filtered.filter(f => f.rating === filters.rating)
  }

  // Goal filter
  if (filters.goal_id) {
    filtered = filtered.filter(f => f.goal_id === filters.goal_id)
  }

  // Project filter
  if (filters.project_id) {
    filtered = filtered.filter(f => f.project_id === filters.project_id)
  }

  // From employee filter
  if (filters.from_employee_id) {
    filtered = filtered.filter(
      f => f.from_employee_id === filters.from_employee_id
    )
  }

  // Search filter (searches content, goal title, project name, employee name)
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(
      f =>
        f.content.toLowerCase().includes(searchLower) ||
        f.goal.title.toLowerCase().includes(searchLower) ||
        f.project?.name?.toLowerCase().includes(searchLower) ||
        f.from_employee.display_name.toLowerCase().includes(searchLower)
    )
  }

  return filtered
}

/**
 * Apply client-side sorting to MyFeedback list
 * (Used when backend doesn't support query params)
 */
export function applyClientSideSorting(
  feedback: MyFeedback[],
  sortOptions: FeedbackSortOptions
): MyFeedback[] {
  const sorted = [...feedback]

  sorted.sort((a, b) => {
    let comparison = 0

    switch (sortOptions.sort_by) {
      case 'created_at':
        comparison =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        break
      case 'rating':
        comparison = a.rating - b.rating
        break
      case 'from_employee':
        comparison = a.from_employee.display_name.localeCompare(
          b.from_employee.display_name
        )
        break
      case 'goal':
        comparison = a.goal.title.localeCompare(b.goal.title)
        break
      case 'project':
        comparison = (a.project?.name ?? '').localeCompare(
          b.project?.name ?? ''
        )
        break
      default:
        comparison = 0
    }

    return sortOptions.sort_order === 'desc' ? -comparison : comparison
  })

  return sorted
}

/**
 * Apply client-side pagination to MyFeedback list
 */
export function applyClientSidePagination(
  feedback: MyFeedback[],
  page: number,
  pageSize: number
): MyFeedback[] {
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  return feedback.slice(startIndex, endIndex)
}
