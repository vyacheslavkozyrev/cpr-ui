import type { IGoalsSummaryDto } from '../dtos/DashboardDto'
import type {
  TCreateGoalDto,
  TCreateGoalTaskDto,
  TGoalDto,
  TGoalTaskDto,
  TPaginatedGoalsResponseDto,
  TTeamGoalsDto,
  TUpdateGoalDto,
  TUpdateGoalTaskDto,
} from '../dtos/GoalDto'
import type { TApiResponse } from '../types/apiTypes'
import type { IGoalsQueryParams } from '../types/goalFilters'
import { apiClient } from './apiClient'

/**
 * Goals API Service
 * Handles all goals-related API calls following React Query patterns
 * Phase 4 - Goals Management System
 */
export class GoalsApiService {
  // ========================================
  // Goals Management
  // ========================================

  /**
   * Create a new goal
   * POST /api/Goals
   */
  async createGoal(goalData: TCreateGoalDto): Promise<TApiResponse<TGoalDto>> {
    return apiClient.post<TGoalDto>('/Goals', goalData)
  }

  /**
   * Get paginated list of current user's goals
   * GET /api/me/goals
   */
  async getMyGoals(
    params?: Partial<IGoalsQueryParams>
  ): Promise<TApiResponse<TPaginatedGoalsResponseDto>> {
    const queryParams = new URLSearchParams()

    if (params) {
      // Add pagination parameters
      if (params.page) queryParams.set('page', params.page.toString())
      if (params.per_page)
        queryParams.set('per_page', params.per_page.toString())

      // Add filter parameters
      if (params.status && params.status !== 'all')
        queryParams.set('status', params.status)
      if (params.visibility && params.visibility !== 'all')
        queryParams.set('visibility', params.visibility)
      if (params.search) queryParams.set('search', params.search)
      if (params.skillId) queryParams.set('skillId', params.skillId)
      if (params.skillLevelId)
        queryParams.set('skillLevelId', params.skillLevelId)
      if (params.employeeId) queryParams.set('employeeId', params.employeeId)
      if (params.sortBy) queryParams.set('sortBy', params.sortBy)
      if (params.sortDirection)
        queryParams.set('sortDirection', params.sortDirection)
      if (params.hasOverdueTasks)
        queryParams.set('hasOverdueTasks', params.hasOverdueTasks.toString())
      if (params.priority && params.priority !== 'all')
        queryParams.set('priority', params.priority)
      if (params.deadline && params.deadline !== 'all')
        queryParams.set('deadline', params.deadline)
    }

    const query = queryParams.toString()
    const url = query ? `/me/goals?${query}` : '/me/goals'

    // Backend currently returns GoalDto[] instead of paginated response
    // Transform the response to match expected format
    const response = await apiClient.get<TGoalDto[]>(url)

    const items = response.data || []
    const page = params?.page || 1
    const perPage = params?.per_page || 20

    // Transform plain array to paginated response
    const paginatedResponse: TPaginatedGoalsResponseDto = {
      items,
      total: items.length, // Backend doesn't return total, using items.length as approximation
      page,
      per_page: perPage,
    }

    const result: TApiResponse<TPaginatedGoalsResponseDto> = {
      success: response.success,
      data: paginatedResponse,
      timestamp: response.timestamp,
    }

    if (response.message) {
      result.message = response.message
    }

    return result
  }

  /**
   * Get goals for a specific employee (filtered by visibility)
   * GET /api/employees/{employeeId}/goals
   */
  async getEmployeeGoals(
    employeeId: string,
    params?: Partial<IGoalsQueryParams>
  ): Promise<TApiResponse<TPaginatedGoalsResponseDto>> {
    const queryParams = new URLSearchParams()

    if (params) {
      // Add pagination parameters
      if (params.page) queryParams.set('page', params.page.toString())
      if (params.per_page)
        queryParams.set('per_page', params.per_page.toString())

      // Add filter parameters if needed
      if (params.status && params.status !== 'all')
        queryParams.set('status', params.status)
    }

    const query = queryParams.toString()
    const url = query
      ? `/employees/${employeeId}/goals?${query}`
      : `/employees/${employeeId}/goals`

    // Backend returns GoalDto[] - transform to paginated response
    const response = await apiClient.get<TGoalDto[]>(url)

    const items = response.data || []
    const page = params?.page || 1
    const perPage = params?.per_page || 20

    const result: TApiResponse<TPaginatedGoalsResponseDto> = {
      success: response.success,
      data: {
        items,
        total: items.length,
        page,
        per_page: perPage,
      },
      timestamp: response.timestamp,
    }

    if (response.message) {
      result.message = response.message
    }

    return result
  }

  /**
   * Get specific goal by ID with tasks and metadata
   * GET /api/Goals/{id}
   */
  async getGoalById(goalId: string): Promise<TApiResponse<TGoalDto>> {
    return apiClient.get<TGoalDto>(`/Goals/${goalId}`)
  }

  /**
   * Update goal properties
   * PATCH /api/Goals/{id}
   */
  async updateGoal(
    goalId: string,
    goalData: TUpdateGoalDto
  ): Promise<TApiResponse<TGoalDto>> {
    return apiClient.patch<TGoalDto>(`/Goals/${goalId}`, goalData)
  }

  /**
   * Delete a goal (soft delete)
   * DELETE /api/Goals/{id}
   */
  async deleteGoal(goalId: string): Promise<TApiResponse<void>> {
    return apiClient.delete<void>(`/Goals/${goalId}`)
  }

  // ========================================
  // Goal Tasks Management
  // ========================================

  /**
   * Add a new task to an existing goal
   * POST /api/Goals/{id}/tasks
   */
  async createGoalTask(
    goalId: string,
    taskData: TCreateGoalTaskDto
  ): Promise<TApiResponse<TGoalTaskDto>> {
    return apiClient.post<TGoalTaskDto>(`/Goals/${goalId}/tasks`, taskData)
  }

  /**
   * Update task properties including completion status
   * PATCH /api/Goals/{id}/tasks/{taskId}
   */
  async updateGoalTask(
    goalId: string,
    taskId: string,
    taskData: TUpdateGoalTaskDto
  ): Promise<TApiResponse<TGoalTaskDto>> {
    return apiClient.patch<TGoalTaskDto>(
      `/Goals/${goalId}/tasks/${taskId}`,
      taskData
    )
  }

  /**
   * Delete a task from goal
   * DELETE /api/Goals/{id}/tasks/{taskId}
   */
  async deleteGoalTask(
    goalId: string,
    taskId: string
  ): Promise<TApiResponse<void>> {
    return apiClient.delete<void>(`/Goals/${goalId}/tasks/${taskId}`)
  }

  // ========================================
  // Dashboard Integration
  // ========================================

  /**
   * Get detailed goals statistics and trends for dashboard
   * GET /api/dashboard/goals-summary
   */
  async getGoalsSummary(
    period: string = 'month'
  ): Promise<TApiResponse<IGoalsSummaryDto>> {
    const queryParams = new URLSearchParams({ period })
    return apiClient.get<IGoalsSummaryDto>(
      `/dashboard/goals-summary?${queryParams.toString()}`
    )
  }

  // ========================================
  // Team Management (People Manager+)
  // ========================================

  /**
   * Get aggregated goals for all team members
   * GET /api/team/goals
   */
  async getTeamGoals(): Promise<TApiResponse<TTeamGoalsDto>> {
    return apiClient.get<TTeamGoalsDto>('/team/goals')
  }

  // ========================================
  // Batch Operations (Future Enhancement)
  // ========================================

  /**
   * Bulk update multiple goals
   * POST /api/Goals/bulk-update (when implemented)
   */
  async bulkUpdateGoals(
    updates: Array<{ id: string; data: TUpdateGoalDto }>
  ): Promise<TApiResponse<TGoalDto[]>> {
    return apiClient.post<TGoalDto[]>('/Goals/bulk-update', { updates })
  }

  /**
   * Bulk delete multiple goals
   * POST /api/Goals/bulk-delete (when implemented)
   */
  async bulkDeleteGoals(goalIds: string[]): Promise<TApiResponse<void>> {
    return apiClient.post<void>('/Goals/bulk-delete', { goalIds })
  }

  /**
   * Export goals to various formats
   * GET /api/Goals/export (when implemented)
   */
  async exportGoals(
    format: 'csv' | 'xlsx' | 'pdf' = 'csv',
    params?: Partial<IGoalsQueryParams>
  ): Promise<TApiResponse<Blob>> {
    const queryParams = new URLSearchParams({ format })

    if (params) {
      // Add filter parameters for export
      if (params.status && params.status !== 'all')
        queryParams.set('status', params.status)
      if (params.visibility && params.visibility !== 'all')
        queryParams.set('visibility', params.visibility)
      if (params.search) queryParams.set('search', params.search)
      // Add other relevant filter parameters...
    }

    return apiClient.get<Blob>(`/Goals/export?${queryParams.toString()}`)
  }
}

// Export singleton instance
export const goalsApiService = new GoalsApiService()
