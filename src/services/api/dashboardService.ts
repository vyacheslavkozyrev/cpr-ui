import { useQuery } from '@tanstack/react-query'
import type {
  IActivityFeedDto,
  IDashboardSummaryDto,
  IFeedbackSummaryDto,
  IGoalsSummaryDto,
  ISkillsSummaryDto,
} from '../../dtos/DashboardDto'
import type {
  ActivityFeed,
  ActivityFeedParams,
  DashboardSummary,
  DashboardSummaryParams,
  FeedbackSummary,
  FeedbackSummaryParams,
  GoalsSummary,
  GoalsSummaryParams,
  SkillsSummary,
} from '../../models/Dashboard'
import { apiClient } from '../apiClient'
import {
  transformActivityFeed,
  transformDashboardSummary,
  transformFeedbackSummary,
  transformGoalsSummary,
  transformSkillsSummary,
} from '../transformations/dashboardTransformations'

/**
 * Dashboard API Service
 * Service layer for dashboard-related API calls with React Query integration
 */

// API endpoints (without /api prefix since it's in the base URL)
const DASHBOARD_ENDPOINTS = {
  summary: '/dashboard/summary',
  activity: '/dashboard/activity',
  goalsSummary: '/dashboard/goals-summary',
  feedbackSummary: '/dashboard/feedback-summary',
  skillsSummary: '/dashboard/skills-summary',
} as const

// Query keys
export const DASHBOARD_QUERY_KEYS = {
  all: ['dashboard'] as const,
  summary: (params?: DashboardSummaryParams) =>
    [...DASHBOARD_QUERY_KEYS.all, 'summary', params] as const,
  activity: (params?: ActivityFeedParams) =>
    [...DASHBOARD_QUERY_KEYS.all, 'activity', params] as const,
  goals: (params?: GoalsSummaryParams) =>
    [...DASHBOARD_QUERY_KEYS.all, 'goals', params] as const,
  feedback: (params?: FeedbackSummaryParams) =>
    [...DASHBOARD_QUERY_KEYS.all, 'feedback', params] as const,
  skills: () => [...DASHBOARD_QUERY_KEYS.all, 'skills'] as const,
}

// API functions
export const dashboardApi = {
  /**
   * Get dashboard summary statistics
   */
  getSummary: async (
    params?: DashboardSummaryParams
  ): Promise<DashboardSummary> => {
    const searchParams = new URLSearchParams()
    if (params?.period) {
      searchParams.append('period', params.period)
    }

    const url = `${DASHBOARD_ENDPOINTS.summary}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    const response = await apiClient.get<IDashboardSummaryDto>(url)
    return transformDashboardSummary(response.data)
  },

  /**
   * Get activity feed
   */
  getActivity: async (params?: ActivityFeedParams): Promise<ActivityFeed> => {
    const searchParams = new URLSearchParams()
    if (params?.days) {
      searchParams.append('days', params.days.toString())
    }
    if (params?.page) {
      searchParams.append('page', params.page.toString())
    }
    if (params?.perPage) {
      searchParams.append('per_page', params.perPage.toString())
    }

    const url = `${DASHBOARD_ENDPOINTS.activity}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    const response = await apiClient.get<IActivityFeedDto>(url)
    return transformActivityFeed(response.data)
  },

  /**
   * Get goals summary statistics
   */
  getGoalsSummary: async (
    params?: GoalsSummaryParams
  ): Promise<GoalsSummary> => {
    const searchParams = new URLSearchParams()
    if (params?.period) {
      searchParams.append('period', params.period)
    }

    const url = `${DASHBOARD_ENDPOINTS.goalsSummary}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    const response = await apiClient.get<IGoalsSummaryDto>(url)
    return transformGoalsSummary(response.data)
  },

  /**
   * Get feedback summary statistics
   */
  getFeedbackSummary: async (
    params?: FeedbackSummaryParams
  ): Promise<FeedbackSummary> => {
    const searchParams = new URLSearchParams()
    if (params?.period) {
      searchParams.append('period', params.period)
    }

    const url = `${DASHBOARD_ENDPOINTS.feedbackSummary}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    const response = await apiClient.get<IFeedbackSummaryDto>(url)
    return transformFeedbackSummary(response.data)
  },

  /**
   * Get skills summary statistics
   */
  getSkillsSummary: async (): Promise<SkillsSummary> => {
    const response = await apiClient.get<ISkillsSummaryDto>(
      DASHBOARD_ENDPOINTS.skillsSummary
    )
    return transformSkillsSummary(response.data)
  },
}

// React Query Hooks

/**
 * Hook for fetching dashboard summary
 */
export const useDashboardSummary = (params?: DashboardSummaryParams) => {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.summary(params),
    queryFn: () => dashboardApi.getSummary(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook for fetching activity feed
 */
export const useActivityFeed = (params?: ActivityFeedParams) => {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.activity(params),
    queryFn: () => dashboardApi.getActivity(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook for fetching goals summary
 */
export const useGoalsSummary = (params?: GoalsSummaryParams) => {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.goals(params),
    queryFn: () => dashboardApi.getGoalsSummary(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook for fetching feedback summary
 */
export const useFeedbackSummary = (params?: FeedbackSummaryParams) => {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.feedback(params),
    queryFn: () => dashboardApi.getFeedbackSummary(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook for fetching skills summary
 */
export const useSkillsSummary = () => {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.skills(),
    queryFn: () => dashboardApi.getSkillsSummary(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}
