import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../config/queryClient'
import type {
  TCreateGoalDto,
  TCreateGoalTaskDto,
  TGoalDto,
  TUpdateGoalDto,
  TUpdateGoalTaskDto,
} from '../dtos/GoalDto'
import type { IGoalsQueryParams } from '../types/goalFilters'
import { logger } from '../utils/logger'
import { goalsApiService } from './goalsService'

/**
 * Goals Query Service
 * React Query hooks for goal management following Constitutional Principles
 * Phase 1 - Frontend Foundation for Feature 0001
 */

/**
 * React Query hooks for goals operations
 */

/**
 * Hook to get paginated list of goals with filters
 * GET /api/me/goals
 */
export const useGoals = (
  params?: Partial<IGoalsQueryParams>,
  enabled = true
) => {
  return useQuery({
    queryKey: queryKeys.goals.list(params),
    queryFn: async () => {
      const response = await goalsApiService.getMyGoals(params)
      return response.success ? response.data : null
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes - goals data updates frequently
    gcTime: 5 * 60 * 1000, // 5 minutes in cache
    retry: (failureCount, error) => {
      // Don't retry on client errors
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status?: number }).status
        if (status && status >= 400 && status < 500) {
          return false
        }
      }
      return failureCount < 2
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
  })
}

/**
 * Hook to get goals for a specific employee (filtered by visibility)
 * GET /api/employees/{employeeId}/goals
 */
export const useEmployeeGoals = (
  employeeId: string | undefined,
  params?: Partial<IGoalsQueryParams>,
  enabled = true
) => {
  return useQuery({
    queryKey: ['goals', 'employee', employeeId, params],
    queryFn: async () => {
      if (!employeeId) return null
      const response = await goalsApiService.getEmployeeGoals(
        employeeId,
        params
      )
      return response.success ? response.data : null
    },
    enabled: enabled && Boolean(employeeId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes in cache
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status?: number }).status
        if (status && status >= 400 && status < 500) {
          return false
        }
      }
      return failureCount < 2
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
  })
}

/**
 * Hook to get a single goal by ID with tasks
 * GET /api/Goals/{id}
 */
export const useGoal = (goalId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.goals.detail(goalId),
    queryFn: async () => {
      const response = await goalsApiService.getGoalById(goalId)
      return response.success ? response.data : null
    },
    enabled: enabled && !!goalId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes in cache
  })
}

/**
 * Hook to create a new goal
 * POST /api/Goals
 */
export const useCreateGoal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (goalData: TCreateGoalDto) => {
      const response = await goalsApiService.createGoal(goalData)
      if (!response.success || !response.data) {
        throw new Error('Failed to create goal')
      }
      return response.data
    },
    onSuccess: (newGoal: TGoalDto) => {
      // Invalidate goals list to refetch with new goal
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.lists() })

      // Optimistically add to cache
      queryClient.setQueryData(queryKeys.goals.detail(newGoal.id), newGoal)

      logger.info('Goal created successfully', { goalId: newGoal.id })
    },
    onError: error => {
      logger.error('Failed to create goal', { error })
    },
  })
}

/**
 * Hook to update an existing goal
 * PATCH /api/Goals/{id}
 */
export const useUpdateGoal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      goalId,
      goalData,
    }: {
      goalId: string
      goalData: TUpdateGoalDto
    }) => {
      const response = await goalsApiService.updateGoal(goalId, goalData)
      if (!response.success || !response.data) {
        throw new Error('Failed to update goal')
      }
      return response.data
    },
    onSuccess: (updatedGoal: TGoalDto, { goalId }) => {
      // Update the specific goal in cache
      queryClient.setQueryData(queryKeys.goals.detail(goalId), updatedGoal)

      // Invalidate goals list to refetch with updated data
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.lists() })

      logger.info('Goal updated successfully', { goalId })
    },
    onError: (error, { goalId }) => {
      logger.error('Failed to update goal', { error, goalId })
    },
  })
}

/**
 * Hook to delete a goal (soft delete)
 * DELETE /api/Goals/{id}
 */
export const useDeleteGoal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (goalId: string) => {
      const response = await goalsApiService.deleteGoal(goalId)
      if (!response.success) {
        throw new Error('Failed to delete goal')
      }
      return goalId
    },
    onSuccess: (goalId: string) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.goals.detail(goalId) })

      // Invalidate goals list to refetch without deleted goal
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.lists() })

      logger.info('Goal deleted successfully', { goalId })
    },
    onError: (error, goalId) => {
      logger.error('Failed to delete goal', { error, goalId })
    },
  })
}

/**
 * Hook to create a task for a goal
 * POST /api/Goals/{id}/tasks
 */
export const useCreateTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      goalId,
      taskData,
    }: {
      goalId: string
      taskData: TCreateGoalTaskDto
    }) => {
      const response = await goalsApiService.createGoalTask(goalId, taskData)
      if (!response.success || !response.data) {
        throw new Error('Failed to create task')
      }
      return { goalId, task: response.data }
    },
    onSuccess: ({ goalId }) => {
      // Invalidate the specific goal to refetch with new task
      queryClient.invalidateQueries({
        queryKey: queryKeys.goals.detail(goalId),
      })

      // Also invalidate lists as task count affects progress
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.lists() })

      logger.info('Task created successfully', { goalId })
    },
    onError: (error, { goalId }) => {
      logger.error('Failed to create task', { error, goalId })
    },
  })
}

/**
 * Hook to update a goal task
 * PATCH /api/Goals/{id}/tasks/{taskId}
 */
export const useUpdateTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      goalId,
      taskId,
      taskData,
    }: {
      goalId: string
      taskId: string
      taskData: TUpdateGoalTaskDto
    }) => {
      const response = await goalsApiService.updateGoalTask(
        goalId,
        taskId,
        taskData
      )
      if (!response.success || !response.data) {
        throw new Error('Failed to update task')
      }
      return { goalId, taskId, task: response.data }
    },
    onSuccess: ({ goalId, taskId }) => {
      // Invalidate the specific goal to refetch with updated task
      queryClient.invalidateQueries({
        queryKey: queryKeys.goals.detail(goalId),
      })

      // Also invalidate lists as completion affects progress
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.lists() })

      logger.info('Task updated successfully', { goalId, taskId })
    },
    onError: (error, { goalId, taskId }) => {
      logger.error('Failed to update task', { error, goalId, taskId })
    },
  })
}

/**
 * Hook to delete a goal task
 * DELETE /api/Goals/{id}/tasks/{taskId}
 */
export const useDeleteTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      goalId,
      taskId,
    }: {
      goalId: string
      taskId: string
    }) => {
      const response = await goalsApiService.deleteGoalTask(goalId, taskId)
      if (!response.success) {
        throw new Error('Failed to delete task')
      }
      return { goalId, taskId }
    },
    onSuccess: ({ goalId, taskId }) => {
      // Invalidate the specific goal to refetch without deleted task
      queryClient.invalidateQueries({
        queryKey: queryKeys.goals.detail(goalId),
      })

      // Also invalidate lists as task count affects progress
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.lists() })

      logger.info('Task deleted successfully', { goalId, taskId })
    },
    onError: (error, { goalId, taskId }) => {
      logger.error('Failed to delete task', { error, goalId, taskId })
    },
  })
}
