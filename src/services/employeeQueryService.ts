import { useQuery } from '@tanstack/react-query'
import {
  employeeService,
  type EmployeeSearchParams,
  type EmployeeSummaryDto,
} from './employeeService'

// Re-export types for convenience
export type { EmployeeSearchParams, EmployeeSummaryDto }

/**
 * React Query hook for searching employees
 *
 * @param params - Search parameters (query, department, location, role)
 * @param enabled - Whether the query should run (default: true)
 * @returns React Query result with employee list
 */
export const useEmployeeSearch = (
  params?: EmployeeSearchParams,
  enabled: boolean = true
) => {
  return useQuery<EmployeeSummaryDto[], Error>({
    queryKey: ['employees', 'search', params],
    queryFn: async () => {
      const response = await employeeService.searchEmployees(params)
      if (!response.success) {
        throw new Error(response.message || 'Failed to search employees')
      }
      return response.data
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
