/**
 * Employee-scoped analytics React Query hooks (for team member tab).
 * Feature 0014 — Performance Analytics & Reporting
 */

import { useQuery } from '@tanstack/react-query'
import { mapGoalAnalytics, mapSkillAnalytics } from '../mappers/analyticsMapper'
import { EAnalyticsPeriod } from '../models/analytics.models'
import { analyticsApiService } from '../services/api/analyticsApiService'

// ==================== Query Key Factory ====================

export const employeeAnalyticsKeys = {
  all: ['analytics', 'employee'] as const,
  goals: (employeeId: string, period: EAnalyticsPeriod) =>
    [...employeeAnalyticsKeys.all, employeeId, 'goals', period] as const,
  skills: (employeeId: string, period: EAnalyticsPeriod) =>
    [...employeeAnalyticsKeys.all, employeeId, 'skills', period] as const,
} as const

// ==================== Hooks ====================

/**
 * Fetches goal analytics for a specific employee.
 * Used in the team member dashboard Analytics tab (AC-016).
 * Maps DTO → domain model before returning.
 */
export const useEmployeeGoalAnalytics = (
  employeeId: string | undefined,
  period: EAnalyticsPeriod = EAnalyticsPeriod.LAST_90_DAYS
) => {
  return useQuery({
    queryKey: employeeAnalyticsKeys.goals(employeeId ?? '', period),
    queryFn: async () => {
      const res = await analyticsApiService.getEmployeeGoalAnalytics(
        employeeId!,
        period
      )
      return mapGoalAnalytics(res.data)
    },
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

/**
 * Fetches skill progression analytics for a specific employee.
 * Used in the team member dashboard Analytics tab (AC-016).
 * Maps DTO → domain model before returning.
 */
export const useEmployeeSkillAnalytics = (
  employeeId: string | undefined,
  period: EAnalyticsPeriod = EAnalyticsPeriod.LAST_90_DAYS
) => {
  return useQuery({
    queryKey: employeeAnalyticsKeys.skills(employeeId ?? '', period),
    queryFn: async () => {
      const res = await analyticsApiService.getEmployeeSkillAnalytics(
        employeeId!,
        period
      )
      return mapSkillAnalytics(res.data)
    },
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}
