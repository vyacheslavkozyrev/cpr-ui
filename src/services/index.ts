/**
 * Services Index
 * Centralized exports for all services and related functionality
 */

// API Client
export type { TApiError, TApiResponse } from '../types/apiTypes'
export { apiClient, initializeApiClient } from './apiClient'

// Auth Service
export { authService, initializeMsal, msal, msalInstance } from './authService'

// User Service
export {
  useCurrentUser,
  userService,
  useUpdateCurrentUser,
  useUploadAvatar,
  useUser,
} from './userService'
export type { IUser } from './userService'
