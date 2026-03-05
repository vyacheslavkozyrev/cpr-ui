import { useQuery } from '@tanstack/react-query'
import { apiClient } from './apiClient'

/**
 * Project summary DTO for dropdowns
 */
export interface ProjectSummaryDto {
  id: string
  name: string
  description?: string | null
}

/**
 * Simple hook to get current user's projects for dropdowns
 * GET /api/me/projects - Returns only projects where the user is a team member
 */
export const useProjects = (enabled: boolean = true) => {
  return useQuery<ProjectSummaryDto[], Error>({
    queryKey: ['projects', 'my'],
    queryFn: async () => {
      const response = await apiClient.get<ProjectSummaryDto[]>('/me/projects')
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch projects')
      }
      return response.data || []
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes - projects don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes in cache
  })
}

/**
 * Hook to get projects for a specific employee
 * GET /api/employees/{employeeId}/projects - Returns projects where the employee is a team member
 */
export const useEmployeeProjects = (
  employeeId: string | undefined,
  enabled: boolean = true
) => {
  return useQuery<ProjectSummaryDto[], Error>({
    queryKey: ['projects', 'employee', employeeId],
    queryFn: async () => {
      if (!employeeId) return []
      const response = await apiClient.get<ProjectSummaryDto[]>(
        `/employees/${employeeId}/projects`
      )
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch employee projects')
      }
      return response.data || []
    },
    enabled: enabled && Boolean(employeeId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes in cache
  })
}
