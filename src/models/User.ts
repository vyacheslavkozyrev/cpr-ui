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
export const UserRole = {
  EMPLOYEE: 'Employee',
  PEOPLE_MANAGER: 'People Manager',
  SOLUTION_OWNER: 'Solution Owner',
  DIRECTOR: 'Director',
  ADMINISTRATOR: 'Administrator',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

/**
 * User authentication state
 */
export interface AuthenticatedUser extends User {
  token: string
  roles: UserRole[]
  permissions: string[]
  lastLoginAt: Date | null
}
