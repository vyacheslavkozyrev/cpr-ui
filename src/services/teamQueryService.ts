/**
 * Team Query Service
 * React Query hooks for team management (Feature 0010a)
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../config/queryClient'
import type { ISuggestGoalDto } from '../dtos/TeamMemberDto'
import { teamApiService } from './teamService'

/**
 * Hook to get the current manager's direct reports.
 * GET /api/me/team
 */
export const useMyTeam = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.team.members(),
    queryFn: async () => {
      const response = await teamApiService.getMyTeam()
      return response.success ? response.data : null
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

/**
 * Hook to get a direct report's goals (manager view).
 * GET /api/employees/{id}/goals
 */
export const useEmployeeGoalsManager = (
  employeeId: string | undefined,
  enabled = true
) => {
  return useQuery({
    queryKey: ['team', 'employee-goals', employeeId],
    queryFn: async () => {
      if (!employeeId) return null
      const response = await teamApiService.getEmployeeGoals(employeeId)
      return response.success ? response.data : null
    },
    enabled: enabled && Boolean(employeeId),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to suggest a goal for a direct report.
 * POST /api/employees/{id}/goals
 */
export const useSuggestGoal = (employeeId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: ISuggestGoalDto) =>
      teamApiService.suggestGoal(employeeId, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['team', 'employee-goals', employeeId],
      })
    },
  })
}

/**
 * Hook to get a direct report's received feedback (manager view).
 * GET /api/employees/{id}/feedback
 */
export const useEmployeeFeedbackManager = (
  employeeId: string | undefined,
  enabled = true
) => {
  return useQuery({
    queryKey: ['team', 'employee-feedback', employeeId],
    queryFn: async () => {
      if (!employeeId) return null
      const response = await teamApiService.getEmployeeFeedback(employeeId)
      return response.success ? response.data : null
    },
    enabled: enabled && Boolean(employeeId),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}
