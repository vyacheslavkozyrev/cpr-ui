/**
 * User Models - Presentation Layer
 * These types represent how user data is used in the UI components
 * Independent of API response structure
 */

export interface User {
  id: string
  employeeId: string
  username: string
  displayName: string
  email: string | null
  position: UserPosition
  fullName?: string // Computed property
  initials?: string // Computed property
}

export interface UserPosition {
  id: string
  title: string
}

/**
 * User role enumeration matching DB values exactly
 */
export const EUserRole = {
  EMPLOYEE: 'Employee',
  PEOPLE_MANAGER: 'People Manager',
  SOLUTION_OWNER: 'Solution Owner',
  DIRECTOR: 'Director',
  ADMINISTRATOR: 'Administrator',
} as const

export type EUserRole = (typeof EUserRole)[keyof typeof EUserRole]

/**
 * User authentication state
 */
export interface AuthenticatedUser extends User {
  token: string
  roles: EUserRole[]
  permissions: string[]
  lastLoginAt: Date | null
}
