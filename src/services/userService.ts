import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../config/queryClient'
import type { TMeApiResponseDto } from '../dtos'
import { mapUser } from '../mappers'
import type { User } from '../models'
import type { TApiResponse } from '../types/apiTypes'
import { apiClient } from './apiClient'

/**
 * User data type
 */
export interface IUser {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  bio?: string
  createdAt: string
  updatedAt: string
}

/**
 * User API service class
 */
class UserService {
  /**
   * Get current user information from /me endpoint (raw DTO)
   */
  async getMeDto(): Promise<TApiResponse<TMeApiResponseDto>> {
    return apiClient.get<TMeApiResponseDto>('/me')
  }

  /**
   * Get current user information mapped to presentation model
   */
  async getMe(): Promise<User | null> {
    try {
      const response = await this.getMeDto()
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
   * Get current user profile (legacy endpoint)
   */
  async getCurrentUser(): Promise<TApiResponse<IUser>> {
    return apiClient.get<IUser>('/users/me')
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<TApiResponse<IUser>> {
    return apiClient.get<IUser>(`/users/${userId}`)
  }

  /**
   * Update current user profile
   */
  async updateCurrentUser(
    userData: Partial<IUser>
  ): Promise<TApiResponse<IUser>> {
    return apiClient.patch<IUser>('/users/me', userData)
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
    select: response => response.data,
    enabled: enabled && !!userId,
  })
}

/**
 * Hook to update current user profile
 */
export const useUpdateCurrentUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userData: Partial<IUser>) =>
      userService.updateCurrentUser(userData),
    onSuccess: response => {
      // Update the current user cache
      queryClient.setQueryData(queryKeys.user.current(), response)

      // Invalidate related queries
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
