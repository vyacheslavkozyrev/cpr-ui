/**
 * Team API Service
 * HTTP calls for team management endpoints (Feature 0010a)
 */

import type {
  IFeedbackListResponseDto,
  ISuggestGoalDto,
  ITeamListResponseDto,
} from '../dtos/TeamMemberDto'
import type { TGoalDto, TGoalDeletionRequestDto } from '../dtos/GoalDto'
import type { TApiResponse } from '../types/apiTypes'
import { apiClient } from './apiClient'

export class TeamApiService {
  /**
   * Get direct reports for the current authenticated manager.
   * GET /api/me/team
   */
  async getMyTeam(): Promise<TApiResponse<ITeamListResponseDto>> {
    return apiClient.get<ITeamListResponseDto>('/me/team')
  }

  /**
   * Get all non-deleted goals for a specific employee (manager view).
   * GET /api/employees/{id}/goals
   */
  async getEmployeeGoals(
    employeeId: string
  ): Promise<TApiResponse<{ data: TGoalDto[] }>> {
    return apiClient.get<{ data: TGoalDto[] }>(`/employees/${employeeId}/goals`)
  }

  /**
   * Suggest a goal for a direct report.
   * POST /api/employees/{id}/goals
   */
  async suggestGoal(
    employeeId: string,
    dto: ISuggestGoalDto
  ): Promise<TApiResponse<TGoalDto>> {
    return apiClient.post<TGoalDto>(`/employees/${employeeId}/goals`, dto)
  }

  /**
   * Get feedback received by a direct report (manager view).
   * GET /api/employees/{id}/feedback
   */
  async getEmployeeFeedback(
    employeeId: string
  ): Promise<TApiResponse<IFeedbackListResponseDto>> {
    return apiClient.get<IFeedbackListResponseDto>(
      `/employees/${employeeId}/feedback`
    )
  }

  /**
   * Accept or reject a suggested goal (employee action).
   * PATCH /api/goals/{id}/suggestion
   */
  async actOnSuggestion(
    goalId: string,
    action: 'accept' | 'reject'
  ): Promise<TApiResponse<TGoalDto>> {
    return apiClient.patch<TGoalDto>(`/goals/${goalId}/suggestion`, { action })
  }

  /**
   * Submit a deletion request for a goal (employee action).
   * POST /api/goals/{id}/deletion-request
   */
  async requestGoalDeletion(
    goalId: string
  ): Promise<TApiResponse<TGoalDeletionRequestDto>> {
    return apiClient.post<TGoalDeletionRequestDto>(
      `/goals/${goalId}/deletion-request`,
      {}
    )
  }

  /**
   * Cancel a pending deletion request (employee action).
   * DELETE /api/goals/{id}/deletion-request
   */
  async cancelGoalDeletionRequest(goalId: string): Promise<TApiResponse<void>> {
    return apiClient.delete<void>(`/goals/${goalId}/deletion-request`)
  }

  /**
   * Approve or reject a pending deletion request (manager action).
   * PATCH /api/goals/{id}/deletion-request
   */
  async actOnDeletionRequest(
    goalId: string,
    action: 'approve' | 'reject'
  ): Promise<TApiResponse<TGoalDto>> {
    return apiClient.patch<TGoalDto>(`/goals/${goalId}/deletion-request`, {
      action,
    })
  }
}

export const teamApiService = new TeamApiService()
