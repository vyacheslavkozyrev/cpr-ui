import type { TCurrentUserDto, TMeApiResponseDto } from '../../dtos'
import type { TApiResponse } from '../../types/apiTypes'
import { apiClient } from '../apiClient'

/**
 * User API Service
 * Handles all user-related API calls and returns DTOs
 */
export class UserApiService {
  /**
   * Get current user information from /me endpoint
   */
  async getMe(): Promise<TApiResponse<TMeApiResponseDto>> {
    return apiClient.get<TMeApiResponseDto>('/me')
  }

  /**
   * Get user profile by ID
   */
  async getUserById(userId: string): Promise<TApiResponse<TCurrentUserDto>> {
    return apiClient.get<TCurrentUserDto>(`/users/${userId}`)
  }

  /**
   * Update current user profile
   * @param userData Partial user data to update
   */
  async updateCurrentUser(
    userData: Partial<TCurrentUserDto>
  ): Promise<TApiResponse<TCurrentUserDto>> {
    return apiClient.patch<TCurrentUserDto>('/users/me', userData)
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(
    file: File,
    onProgress?: (progress: {
      loaded: number
      total: number
      percentage: number
    }) => void
  ): Promise<TApiResponse<{ url: string }>> {
    return apiClient.uploadFile<{ url: string }>(
      '/users/me/avatar',
      file,
      onProgress
    )
  }
}

/**
 * User API service singleton
 */
export const userApiService = new UserApiService()
