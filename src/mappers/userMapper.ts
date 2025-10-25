/**
 * User Mappers
 * Transform DTOs to Models for presentation layer
 */

import type {
  TAuthResponseDto,
  TCurrentUserDto,
  TUserPositionDto,
} from '../dtos'
import type { AuthenticatedUser, User, UserPosition, UserRole } from '../models'

/**
 * Transform user position DTO to model
 */
export const mapUserPosition = (dto: TUserPositionDto): UserPosition => ({
  id: dto.position_id,
  title: dto.position_title,
  department: dto.department_name,
  level: dto.position_level,
  isManager: dto.is_manager,
})

/**
 * Transform current user DTO to model
 */
export const mapUser = (dto: TCurrentUserDto): User => {
  const user: User = {
    id: dto.user_id,
    employeeId: dto.employee_id,
    username: dto.user_name,
    displayName: dto.display_name,
    email: dto.email,
    position: mapUserPosition(dto.position),
  }

  // Add computed properties
  user.fullName = user.displayName || user.username
  user.initials = user.fullName
    .split(' ')
    .map(name => name.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2)

  return user
}

/**
 * Transform authentication response DTO to authenticated user model
 */
export const mapAuthenticatedUser = (
  dto: TAuthResponseDto
): AuthenticatedUser => {
  const user = mapUser(dto.user)

  return {
    ...user,
    token: dto.access_token,
    roles: dto.roles as UserRole[],
    permissions: dto.permissions,
    lastLoginAt: new Date(), // Set to current time for login
  }
}
