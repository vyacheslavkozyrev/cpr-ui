/**
 * User DTOs - API Response Layer
 * These types match the exact structure from API responses
 * Used for data transfer and transformation only
 */

/**
 * User position from API response
 */
export interface TUserPositionDto {
  position_id: string
  position_title: string
  department_name: string
  position_level: number
  is_manager: boolean
}

/**
 * Current user from /me API response
 */
export interface TCurrentUserDto {
  user_id: string
  employee_id: string
  user_name: string
  display_name: string
  email: string | null
  position: TUserPositionDto
}

/**
 * /me API response structure
 */
export type TMeApiResponseDto = TCurrentUserDto

/**
 * Authentication response DTO
 */
export interface TAuthResponseDto {
  access_token: string
  token_type: string
  expires_in: number
  user: TCurrentUserDto
  roles: string[]
  permissions: string[]
}

/**
 * Login request DTO
 */
export interface TLoginRequestDto {
  username: string
  password: string
}
