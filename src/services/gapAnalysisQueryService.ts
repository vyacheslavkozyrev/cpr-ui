/**
 * Gap Analysis Query Service — React Query hooks
 * Feature 0009 — Skills Gap Analysis & Development Planning
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../config/queryClient'
import type { TCreateGoalDto } from '../dtos/GoalDto'
import { mapGapAnalysis } from '../mappers/gapAnalysisMapper'
import { gapAnalysisApiService } from './api/gapAnalysisApiService'
import { apiClient } from './apiClient'

/**
 * Returns the authenticated user's own gap analysis.
 * Throws on 422 (no position assigned); caller handles the error state.
 */
export const useMyGapAnalysis = () =>
  useQuery({
    queryKey: queryKeys.gapAnalysis.own(),
    queryFn: async () => {
      const res = await gapAnalysisApiService.getMyGapAnalysis()
      return mapGapAnalysis(res.data)
    },
    retry: (failureCount, error) => {
      const status = (error as { status?: number })?.status
      // Do not retry on 422 (business error) or 401.
      if (status === 422 || status === 401) return false
      return failureCount < 2
    },
    staleTime: 2 * 60 * 1000,
  })

/**
 * Returns a specific employee's gap analysis (manager/director/admin view).
 * Enabled only when employeeId is non-empty.
 */
export const useEmployeeGapAnalysis = (employeeId: string) =>
  useQuery({
    queryKey: queryKeys.gapAnalysis.employee(employeeId),
    queryFn: async () => {
      const res = await gapAnalysisApiService.getEmployeeGapAnalysis(employeeId)
      return mapGapAnalysis(res.data)
    },
    enabled: Boolean(employeeId),
    retry: (failureCount, error) => {
      const status = (error as { status?: number })?.status
      if (status === 403 || status === 404 || status === 422 || status === 401)
        return false
      return failureCount < 2
    },
    staleTime: 2 * 60 * 1000,
  })

/**
 * Mutation to create a goal from a skill gap row.
 * On success, invalidates:
 *   - own gap analysis (linked goals list refreshed)
 *   - employee gap analysis for the target employee
 *   - goals list (so the new goal appears in the Goals page)
 */
export const useCreateGoalFromGap = (targetEmployeeId?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: TCreateGoalDto) => apiClient.post<unknown>('/goals', dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gapAnalysis.own() })
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.lists() })
      if (targetEmployeeId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.gapAnalysis.employee(targetEmployeeId),
        })
      }
    },
  })
}
