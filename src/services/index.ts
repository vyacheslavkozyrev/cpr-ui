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
  useUpdateCurrentUser,
  useUploadAvatar,
  useUser,
  userService,
} from './userService'

// Goals Query Service (React Query hooks for Feature 0001)
export {
  useCreateGoal,
  useCreateTask,
  useDeleteGoal,
  useDeleteTask,
  useGoal,
  useGoals,
  useUpdateGoal,
  useUpdateTask,
} from './goalsQueryService'

// Feedback Request Service (Feature 0004)
export {
  FeedbackRequestApiService,
  feedbackRequestApiService,
  type FeedbackRequestListParams,
} from './feedbackRequestService'

// Feedback Request Query Service (React Query hooks for Feature 0004)
export {
  useCancelFeedbackRequest,
  useCancelRecipient,
  useCreateFeedbackRequest,
  useFeedbackRequest,
  useManagerTeamReceivedRequests,
  useManagerTeamSentRequests,
  useSendAllReminders,
  useSendReminder,
  useSentRequests,
  useTeamReceivedRequests,
  useTeamSentRequests,
  useTodoRequests,
  useUpdateFeedbackRequest,
} from './feedbackRequestQueryService'

// Project Query Service (React Query hooks)
export { useProjects, type ProjectSummaryDto } from './projectQueryService'
