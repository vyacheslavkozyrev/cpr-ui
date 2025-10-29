import { QueryClient } from '@tanstack/react-query'
import { logger } from '../utils/logger'

/**
 * Create and configure the React Query client
 */
export const createQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Global settings for queries
        staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
        gcTime: 10 * 60 * 1000, // 10 minutes - cache time (was cacheTime)
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors (client errors)
          const status = (error as { response?: { status?: number } })?.response
            ?.status
          if (status && status >= 400 && status < 500) {
            return false
          }
          // Retry up to 3 times for other errors
          return failureCount < 3
        },
        refetchOnWindowFocus: false, // Disable automatic refetch on window focus
        refetchOnMount: true, // Refetch when component mounts
        refetchOnReconnect: true, // Refetch when network reconnects
      },
      mutations: {
        // Global settings for mutations
        retry: 1, // Retry mutations once on failure
      },
    },
  })
}

/**
 * Default query client instance
 * Used when a custom client is not provided
 */
export const queryClient = createQueryClient()

/**
 * Query keys factory for consistent cache key generation
 * Helps prevent typos and provides centralized key management
 */
export const queryKeys = {
  // User-related queries
  user: {
    all: ['user'] as const,
    current: () => [...queryKeys.user.all, 'current'] as const,
    me: () => [...queryKeys.user.all, 'me'] as const,
    profile: (userId: string) =>
      [...queryKeys.user.all, 'profile', userId] as const,
  },

  // Goals-related queries
  goals: {
    all: ['goals'] as const,
    lists: () => [...queryKeys.goals.all, 'list'] as const,
    list: (filters?: Record<string, string | number | boolean>) =>
      [...queryKeys.goals.lists(), { filters }] as const,
    details: () => [...queryKeys.goals.all, 'detail'] as const,
    detail: (goalId: string) => [...queryKeys.goals.details(), goalId] as const,
  },

  // Skills-related queries
  skills: {
    all: ['skills'] as const,
    taxonomy: () => [...queryKeys.skills.all, 'taxonomy'] as const,
    assessment: (userId: string) =>
      [...queryKeys.skills.all, 'assessment', userId] as const,
  },

  // Feedback-related queries
  feedback: {
    all: ['feedback'] as const,
    lists: () => [...queryKeys.feedback.all, 'list'] as const,
    received: (userId: string) =>
      [...queryKeys.feedback.lists(), 'received', userId] as const,
    sent: (userId: string) =>
      [...queryKeys.feedback.lists(), 'sent', userId] as const,
  },

  // Team-related queries (for managers)
  team: {
    all: ['team'] as const,
    members: () => [...queryKeys.team.all, 'members'] as const,
    member: (userId: string) => [...queryKeys.team.members(), userId] as const,
  },
} as const

/**
 * Error boundary handler for React Query errors
 */
export const handleQueryError = (error: unknown): void => {
  logger.error('React Query Error', { error })

  // Here you could integrate with error reporting service
  // like Sentry, LogRocket, etc.

  // Example: Sentry.captureException(error);
}
