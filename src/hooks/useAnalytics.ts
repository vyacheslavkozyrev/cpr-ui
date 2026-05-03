/**
 * Personal analytics React Query hooks.
 * Feature 0014 — Performance Analytics & Reporting
 */

import { useQuery } from '@tanstack/react-query'
import { mapGoalAnalytics, mapSkillAnalytics } from '../mappers/analyticsMapper'
import { EAnalyticsPeriod } from '../models/analytics.models'
import { analyticsApiService } from '../services/api/analyticsApiService'

// ==================== Query Key Factory ====================

export const analyticsKeys = {
  all: ['analytics'] as const,
  myGoals: (period: EAnalyticsPeriod) =>
    [...analyticsKeys.all, 'my', 'goals', period] as const,
  mySkills: (period: EAnalyticsPeriod) =>
    [...analyticsKeys.all, 'my', 'skills', period] as const,
} as const

// ==================== Hooks ====================

/**
 * Fetches goal analytics for the authenticated user.
 * Maps DTO → domain model before returning.
 * Period defaults to last_90_days (AC-022).
 */
export const useMyGoalAnalytics = (
  period: EAnalyticsPeriod = EAnalyticsPeriod.LAST_90_DAYS
) => {
  return useQuery({
    queryKey: analyticsKeys.myGoals(period),
    queryFn: async () => {
      const res = await analyticsApiService.getMyGoalAnalytics(period)
      return mapGoalAnalytics(res.data)
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

/**
 * Fetches skill progression analytics for the authenticated user.
 * Maps DTO → domain model before returning.
 * Period defaults to last_90_days (AC-022).
 */
export const useMySkillAnalytics = (
  period: EAnalyticsPeriod = EAnalyticsPeriod.LAST_90_DAYS
) => {
  return useQuery({
    queryKey: analyticsKeys.mySkills(period),
    queryFn: async () => {
      const res = await analyticsApiService.getMySkillAnalytics(period)
      return mapSkillAnalytics(res.data)
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}
