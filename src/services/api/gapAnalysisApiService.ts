import type { TGapAnalysisDto } from '../../dtos/GapAnalysisDto'
import type { TApiResponse } from '../../types/apiTypes'
import { apiClient } from '../apiClient'

/**
 * Gap Analysis API Service
 * Handles gap-analysis API calls and returns raw DTOs (no transformation).
 * Feature 0009 — Skills Gap Analysis & Development Planning
 */
export class GapAnalysisApiService {
  /**
   * Returns the authenticated user's own skills gap analysis.
   * GET /api/me/gap-analysis
   */
  async getMyGapAnalysis(): Promise<TApiResponse<TGapAnalysisDto>> {
    return apiClient.get<TGapAnalysisDto>('/me/gap-analysis')
  }

  /**
   * Returns the skills gap analysis for a specific employee.
   * Caller must have PeopleManager, Director, or Administrator role.
   * GET /api/employees/{id}/gap-analysis
   */
  async getEmployeeGapAnalysis(
    employeeId: string
  ): Promise<TApiResponse<TGapAnalysisDto>> {
    return apiClient.get<TGapAnalysisDto>(
      `/employees/${employeeId}/gap-analysis`
    )
  }
}

/** Gap analysis API service singleton. */
export const gapAnalysisApiService = new GapAnalysisApiService()
