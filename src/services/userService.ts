import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../config/queryClient'
import { type TCurrentUserDto } from '../dtos'
import { mapUser } from '../mappers'
import type { User } from '../models'
import { userApiService } from './api'

/**
 * User Business Service
 * Handles business logic and maps DTOs to Models
 * React Query hooks operate only with Models
 */
class UserService {
  /**
   * Get current user information from /me endpoint
   * Maps DTO to Model for presentation layer
   */
  async getMe(): Promise<User | null> {
    try {
      const response = await userApiService.getMe()
      if (response.success && response.data) {
        return mapUser(response.data)
      }
      return null
    } catch (error) {
      console.error('Failed to get current user:', error)
      return null
    }
  }

  /**
   * Get user by ID
   * Maps DTO to Model for presentation layer
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const response = await userApiService.getUserById(userId)
      if (response.success && response.data) {
        return mapUser(response.data)
      }
      return null
    } catch (error) {
      console.error('Failed to get user by ID:', error)
      return null
    }
  }

  /**
   * Update current user profile
   * Maps Model to DTO for API, then maps response DTO back to Model
   */
  async updateCurrentUser(userData: Partial<User>): Promise<User> {
    // Convert Model fields to DTO fields for API, filtering out undefined values
    const dtoData: Partial<TCurrentUserDto> = {}

    if (userData.displayName !== undefined) {
      dtoData.display_name = userData.displayName
    }
    if (userData.username !== undefined) {
      dtoData.user_name = userData.username
    }
    if (userData.email !== undefined) {
      dtoData.email = userData.email
    }
    // Note: position updates might need separate handling

    const response = await userApiService.updateCurrentUser(dtoData)
    if (response.success && response.data) {
      return mapUser(response.data)
    }

    // If we reach here, the API call failed
    throw new Error('Failed to update user profile')
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
  ): Promise<{ url: string } | null> {
    try {
      const response = await userApiService.uploadAvatar(file, onProgress)
      return response.success ? response.data : null
    } catch (error) {
      console.error('Failed to upload avatar:', error)
      return null
    }
  }
}

/**
 * User service singleton
 */
export const userService = new UserService()

/**
 * React Query hooks for user operations
 */

/**
 * Hook to get current user with React Query caching
 * Returns the mapped User model for presentation layer
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.user.me(),
    queryFn: () => userService.getMe(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes in cache
    retry: (failureCount, error) => {
      // Don't retry on authentication errors (401, 403)
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as any).status
        if (status === 401 || status === 403) {
          return false
        }
      }
      // Retry up to 2 times for other errors
      return failureCount < 2
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  })
}

/**
 * Hook to get user by ID
 */
export const useUser = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.user.profile(userId),
    queryFn: () => userService.getUserById(userId),
    enabled: enabled && !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes in cache
  })
}

/**
 * Hook to update current user profile
 */
export const useUpdateCurrentUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userData: Partial<User>) =>
      userService.updateCurrentUser(userData),
    onSuccess: updatedUser => {
      // Update the current user cache with the returned User model
      queryClient.setQueryData(queryKeys.user.me(), updatedUser)

      // Invalidate related queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.user.all })
    },
    onError: error => {
      console.error('Failed to update user profile:', error)
    },
  })
}

/**
 * Hook to upload user avatar
 */
export const useUploadAvatar = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      file,
      onProgress,
    }: {
      file: File
      onProgress?: (progress: {
        loaded: number
        total: number
        percentage: number
      }) => void
    }) => userService.uploadAvatar(file, onProgress),
    onSuccess: () => {
      // Invalidate current user data to refetch with new avatar
      queryClient.invalidateQueries({ queryKey: queryKeys.user.current() })
      // Also invalidate /me data
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() })
    },
    onError: error => {
      console.error('Failed to upload avatar:', error)
    },
  })
}
