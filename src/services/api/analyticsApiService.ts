/**
 * Analytics API Service
 * Handles analytics API calls and returns raw DTOs (no transformation).
 * Feature 0014 — Performance Analytics & Reporting
 */

import type {
  TGoalAnalyticsDto,
  TSkillAnalyticsDto,
} from '../../dtos/analytics.dtos'
import type { EAnalyticsPeriod } from '../../models/analytics.models'
import type { TApiResponse } from '../../types/apiTypes'
import { apiClient } from '../apiClient'

export class AnalyticsApiService {
  /**
   * Returns goal analytics for the authenticated user.
   * GET /api/me/analytics/goals
   */
  async getMyGoalAnalytics(
    period?: EAnalyticsPeriod
  ): Promise<TApiResponse<TGoalAnalyticsDto>> {
    const query = period ? `?period=${period}` : ''
    return apiClient.get<TGoalAnalyticsDto>(`/me/analytics/goals${query}`)
  }

  /**
   * Returns skill progression analytics for the authenticated user.
   * GET /api/me/analytics/skills
   */
  async getMySkillAnalytics(
    period?: EAnalyticsPeriod
  ): Promise<TApiResponse<TSkillAnalyticsDto>> {
    const query = period ? `?period=${period}` : ''
    return apiClient.get<TSkillAnalyticsDto>(`/me/analytics/skills${query}`)
  }

  /**
   * Returns goal analytics for a specific employee.
   * GET /api/employees/{id}/analytics/goals
   */
  async getEmployeeGoalAnalytics(
    employeeId: string,
    period?: EAnalyticsPeriod
  ): Promise<TApiResponse<TGoalAnalyticsDto>> {
    const query = period ? `?period=${period}` : ''
    return apiClient.get<TGoalAnalyticsDto>(
      `/employees/${employeeId}/analytics/goals${query}`
    )
  }

  /**
   * Returns skill progression analytics for a specific employee.
   * GET /api/employees/{id}/analytics/skills
   */
  async getEmployeeSkillAnalytics(
    employeeId: string,
    period?: EAnalyticsPeriod
  ): Promise<TApiResponse<TSkillAnalyticsDto>> {
    const query = period ? `?period=${period}` : ''
    return apiClient.get<TSkillAnalyticsDto>(
      `/employees/${employeeId}/analytics/skills${query}`
    )
  }
}

/** Analytics API service singleton. */
export const analyticsApiService = new AnalyticsApiService()
