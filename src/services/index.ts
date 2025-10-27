/**
 * Services Index
 * Centralized exports for all services and related functionality
 */

// API Client
export type { TApiError, TApiResponse } from '../types/apiTypes'
export { apiClient, initializeApiClient } from './apiClient'

// Auth Service
export { authService, initializeMsal, msal, msalInstance } from './authService'

// API Services (return DTOs only)
export * from './api'

// Business Services (handle DTO->Model mapping and React Query hooks)
export {
  useCurrentUser,
  userService,
  useUpdateCurrentUser,
  useUploadAvatar,
  useUser,
} from './userService'
