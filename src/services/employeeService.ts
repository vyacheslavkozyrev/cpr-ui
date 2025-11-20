import type { TApiResponse } from '../types/apiTypes'
import { apiClient } from './apiClient'

/**
 * Employee summary from API
 * Note: API should return snake_case per CPR constitution
 */
export interface EmployeeSummaryDto {
  id: string
  display_name: string
  email?: string
  job_title?: string
  department?: string
}

/**
 * Employee search parameters
 */
export interface EmployeeSearchParams {
  /** Search query for name, email, or job title */
  query?: string
  /** Filter by department */
  department?: string
  /** Filter by location */
  location?: string
  /** Filter by job title/role */
  role?: string
}

/**
 * Employee API Service
 * Handles employee search and directory operations
 */
export class EmployeeApiService {
  /**
   * Search for employees with optional filters
   * GET /api/employees/search
   *
   * @param params - Search parameters (query, department, location, role)
   * @returns List of matching employees
   */
  async searchEmployees(
    params?: EmployeeSearchParams
  ): Promise<TApiResponse<EmployeeSummaryDto[]>> {
    const queryParams = new URLSearchParams()

    if (params) {
      if (params.query) queryParams.set('query', params.query)
      if (params.department) queryParams.set('department', params.department)
      if (params.location) queryParams.set('location', params.location)
      if (params.role) queryParams.set('role', params.role)
    }

    const query = queryParams.toString()
    const url = query ? `/employees/search?${query}` : '/employees/search'

    return apiClient.get<EmployeeSummaryDto[]>(url)
  }
}

// Export singleton instance
export const employeeService = new EmployeeApiService()
