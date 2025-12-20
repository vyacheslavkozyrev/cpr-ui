// React Query hook for Feedback Analytics
// Feature 0005 - Task T084

import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { feedbackApiService } from '../services/feedbackService'
import type { TApiResponse } from '../types/apiTypes'
import type { FeedbackAnalytics } from '../types/feedback'
import type {
  CustomDateRange,
  DateRange,
  TimeRangePreset,
} from '../utils/analyticsCalculations'
import { calculateDateRange } from '../utils/analyticsCalculations'

/**
 * Query parameters for feedback analytics
 */
export interface UseFeedbackAnalyticsParams {
  /** Time range preset */
  preset: TimeRangePreset
  /** Custom date range (required if preset is 'custom') */
  customRange?: CustomDateRange | undefined
  /** Enable comparison with previous period */
  includeComparison?: boolean
}

/**
 * Query key factory for feedback analytics
 */
export const feedbackAnalyticsKeys = {
  all: ['feedbackAnalytics'] as const,
  lists: () => [...feedbackAnalyticsKeys.all, 'list'] as const,
  list: (params: UseFeedbackAnalyticsParams) =>
    [...feedbackAnalyticsKeys.lists(), params] as const,
}

/**
 * React Query hook for fetching feedback analytics
 *
 * Features:
 * - Automatic date range calculation based on preset
 * - Optional comparison with previous period
 * - 10-minute cache (analytics data changes slowly)
 * - 30-minute garbage collection time
 * - Refetch on window focus disabled (analytics are not real-time)
 *
 * @param params - Analytics query parameters (preset, customRange, includeComparison)
 * @param options - React Query options
 * @returns Query result with analytics data, loading state, error
 *
 * @example
 * // Last 30 days analytics
 * const { data, isLoading, error } = useFeedbackAnalytics({
 *   preset: 'last_30_days',
 * })
 *
 * @example
 * // Year to date with comparison to previous year
 * const { data, isLoading } = useFeedbackAnalytics({
 *   preset: 'year_to_date',
 *   includeComparison: true,
 * })
 *
 * @example
 * // Custom date range
 * const { data } = useFeedbackAnalytics({
 *   preset: 'custom',
 *   customRange: { start_date: '2024-01-01', end_date: '2024-12-31' },
 * })
 */
export function useFeedbackAnalytics(
  params: UseFeedbackAnalyticsParams,
  options?: Omit<
    UseQueryOptions<TApiResponse<FeedbackAnalytics>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery<TApiResponse<FeedbackAnalytics>>({
    queryKey: feedbackAnalyticsKeys.list(params),
    queryFn: async () => {
      // Calculate date range based on preset
      const dateRange: DateRange = calculateDateRange(
        params.preset,
        params.customRange
      )

      // Call API with date range parameters
      return feedbackApiService.getFeedbackAnalytics({
        date_from: dateRange.date_from,
        date_to: dateRange.date_to,
        include_comparison: params.includeComparison ?? false,
      })
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (analytics data changes slowly)
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    refetchOnWindowFocus: false, // Analytics are not real-time
    enabled: true, // Always enabled (no conditional logic needed)
    ...options,
  })
}

/**
 * Type guard to check if analytics data is available
 */
export function hasAnalyticsData(
  response: TApiResponse<FeedbackAnalytics> | undefined
): response is TApiResponse<FeedbackAnalytics> {
  return response?.data !== undefined && response?.data !== null
}
