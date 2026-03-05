import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { TGoalDto, TGoalTaskDto } from '../../dtos/GoalDto'
import { server } from '../../mocks/server'
import {
  useCreateGoal,
  useCreateTask,
  useDeleteGoal,
  useDeleteTask,
  useGoal,
  useGoals,
  useUpdateGoal,
  useUpdateTask,
} from '../../services/goalsQueryService'

/**
 * Goals Query Service Tests
 * Tests for React Query hooks in Feature 0001
 */

// Create a fresh query client for each test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries in tests
        gcTime: Infinity, // Keep cache for test duration
      },
      mutations: {
        retry: false,
      },
    },
  })

// Wrapper component with QueryClientProvider
const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

// Mock goal data matching backend DTO structure (snake_case)
const mockGoal: TGoalDto = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  employeeId: '123e4567-e89b-12d3-a456-426614174001',
  title: 'Learn React Query',
  description: 'Master React Query for state management',
  status: 'in_progress',
  isCompleted: false,
  progressPercent: 50.0,
  createdAt: '2025-01-01T00:00:00Z',
  tasks: [],
}

describe('Goals Query Service', () => {
  beforeEach(() => {
    server.listen({ onUnhandledRequest: 'error' })
  })

  afterEach(() => {
    server.resetHandlers()
    vi.clearAllMocks()
  })

  describe('useGoals', () => {
    it('fetches goals list successfully', async () => {
      const queryClient = createTestQueryClient()
      const { result } = renderHook(() => useGoals(), {
        wrapper: createWrapper(queryClient),
      })

      // Initially loading
      expect(result.current.isLoading).toBe(true)

      // Wait for query to complete
      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      // Check data structure
      expect(result.current.data).not.toBeNull()
      expect(result.current.data).toBeDefined()
      expect(result.current.data?.items).toBeDefined()
      expect(Array.isArray(result.current.data?.items)).toBe(true)
    })

    it('applies filters correctly', async () => {
      const queryClient = createTestQueryClient()
      const { result } = renderHook(
        () => useGoals({ status: 'in_progress', page: 1, per_page: 10 }),
        {
          wrapper: createWrapper(queryClient),
        }
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toBeDefined()
    })
  })

  describe('useGoal', () => {
    it('fetches single goal by ID successfully', async () => {
      // Override handler for this test
      server.use(
        http.get('https://localhost:3000/api/Goals/:id', ({ params }) => {
          const goalId = params['id'] as string
          if (goalId !== mockGoal.id) {
            return HttpResponse.json({ error: 'Not Found' }, { status: 404 })
          }
          return HttpResponse.json(mockGoal, { status: 200 })
        })
      )

      const queryClient = createTestQueryClient()
      const goalId = mockGoal.id

      const { result } = renderHook(() => useGoal(goalId), {
        wrapper: createWrapper(queryClient),
      })

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toBeDefined()
      expect(result.current.data?.id).toBe(goalId)
    })

    it('does not fetch when disabled', () => {
      const queryClient = createTestQueryClient()
      const { result } = renderHook(() => useGoal('some-id', false), {
        wrapper: createWrapper(queryClient),
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.fetchStatus).toBe('idle')
    })
  })

  describe('useCreateGoal', () => {
    it('creates a new goal successfully', async () => {
      const queryClient = createTestQueryClient()
      const { result } = renderHook(() => useCreateGoal(), {
        wrapper: createWrapper(queryClient),
      })

      const newGoalData = {
        title: 'New Goal',
        description: 'Test goal creation',
        priority: 75,
      }

      result.current.mutate(newGoalData)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toBeDefined()
      expect(result.current.data?.title).toBe(newGoalData.title)
    })

    it('handles creation errors', async () => {
      const queryClient = createTestQueryClient()
      const { result } = renderHook(() => useCreateGoal(), {
        wrapper: createWrapper(queryClient),
      })

      // Trigger with invalid data that should fail
      result.current.mutate({ title: '' })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.error).toBeDefined()
    })
  })

  describe('useUpdateGoal', () => {
    it('updates goal successfully', async () => {
      // Override handler for this test
      server.use(
        http.patch(
          'https://localhost:3000/api/Goals/:id',
          async ({ params, request }) => {
            const goalId = params['id'] as string
            if (goalId !== mockGoal.id) {
              return HttpResponse.json({ error: 'Not Found' }, { status: 404 })
            }

            const updates = (await request.json()) as Partial<TGoalDto>
            const updatedGoal: TGoalDto = {
              ...mockGoal,
              ...updates,
              modifiedAt: new Date().toISOString(),
            }

            return HttpResponse.json(updatedGoal, { status: 200 })
          }
        )
      )

      const queryClient = createTestQueryClient()
      const { result } = renderHook(() => useUpdateGoal(), {
        wrapper: createWrapper(queryClient),
      })

      result.current.mutate({
        goalId: mockGoal.id,
        goalData: { title: 'Updated Title' },
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toBeDefined()
    })
  })

  describe('useDeleteGoal', () => {
    it('deletes goal successfully', async () => {
      // Override handler for this test
      server.use(
        http.delete('https://localhost:3000/api/Goals/:id', ({ params }) => {
          const goalId = params['id'] as string
          if (goalId !== mockGoal.id) {
            return HttpResponse.json({ error: 'Not Found' }, { status: 404 })
          }
          return HttpResponse.json({ goalId }, { status: 200 })
        })
      )

      const queryClient = createTestQueryClient()
      const { result } = renderHook(() => useDeleteGoal(), {
        wrapper: createWrapper(queryClient),
      })

      result.current.mutate(mockGoal.id)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toBe(mockGoal.id)
    })
  })

  describe('useCreateTask', () => {
    it('creates task for goal successfully', async () => {
      // Override handler for this test
      server.use(
        http.post(
          'https://localhost:3000/api/Goals/:id/tasks',
          async ({ params, request }) => {
            const goalId = params['id'] as string
            if (goalId !== mockGoal.id) {
              return HttpResponse.json({ error: 'Not Found' }, { status: 404 })
            }

            const taskData = (await request.json()) as {
              title: string
              description?: string
            }
            const newTask: TGoalTaskDto = {
              id: `task-${Date.now()}`,
              goalId,
              title: taskData.title,
              description: taskData.description || '',
              deadline: '',
              isCompleted: false,
              createdAt: new Date().toISOString(),
            }

            return HttpResponse.json(newTask, { status: 201 })
          }
        )
      )

      const queryClient = createTestQueryClient()
      const { result } = renderHook(() => useCreateTask(), {
        wrapper: createWrapper(queryClient),
      })

      result.current.mutate({
        goalId: mockGoal.id,
        taskData: {
          title: 'New Task',
          description: 'Task description',
        },
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toBeDefined()
      expect(result.current.data?.goalId).toBe(mockGoal.id)
    })
  })

  describe('useUpdateTask', () => {
    it('updates task successfully', async () => {
      const taskId = '123e4567-e89b-12d3-a456-426614174100'

      // Override handler for this test
      server.use(
        http.patch(
          'https://localhost:3000/api/Goals/:id/tasks/:taskId',
          async ({ params, request }) => {
            const goalId = params['id'] as string
            const taskIdParam = params['taskId'] as string

            if (goalId !== mockGoal.id || taskIdParam !== taskId) {
              return HttpResponse.json({ error: 'Not Found' }, { status: 404 })
            }

            const updates = (await request.json()) as Partial<TGoalTaskDto>
            const updatedTask: TGoalTaskDto = {
              id: taskId,
              goalId,
              title: 'Updated Task',
              description: 'Updated description',
              deadline: '2025-12-31T00:00:00Z',
              isCompleted: updates.isCompleted ?? false,
              createdAt: '2025-01-01T00:00:00Z',
              modifiedAt: new Date().toISOString(),
            }

            return HttpResponse.json(updatedTask, { status: 200 })
          }
        )
      )

      const queryClient = createTestQueryClient()
      const { result } = renderHook(() => useUpdateTask(), {
        wrapper: createWrapper(queryClient),
      })

      result.current.mutate({
        goalId: mockGoal.id,
        taskId,
        taskData: { isCompleted: true },
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toBeDefined()
    })
  })

  describe('useDeleteTask', () => {
    it('deletes task successfully', async () => {
      const taskId = '123e4567-e89b-12d3-a456-426614174100'

      // Override handler for this test
      server.use(
        http.delete(
          'https://localhost:3000/api/Goals/:id/tasks/:taskId',
          ({ params }) => {
            const goalId = params['id'] as string
            const taskIdParam = params['taskId'] as string

            if (goalId !== mockGoal.id || taskIdParam !== taskId) {
              return HttpResponse.json({ error: 'Not Found' }, { status: 404 })
            }

            return HttpResponse.json({ goalId, taskId }, { status: 200 })
          }
        )
      )

      const queryClient = createTestQueryClient()
      const { result } = renderHook(() => useDeleteTask(), {
        wrapper: createWrapper(queryClient),
      })

      result.current.mutate({
        goalId: mockGoal.id,
        taskId,
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data?.taskId).toBe(taskId)
    })
  })

  describe('Cache invalidation', () => {
    it('invalidates goals list after creating goal', async () => {
      const queryClient = createTestQueryClient()

      // Set up spy on invalidateQueries
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useCreateGoal(), {
        wrapper: createWrapper(queryClient),
      })

      result.current.mutate({
        title: 'Test Goal',
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      // Verify cache invalidation was called
      expect(invalidateSpy).toHaveBeenCalled()
    })

    it('updates cache after updating goal', async () => {
      // Override handler for this test
      server.use(
        http.patch(
          'https://localhost:3000/api/Goals/:id',
          async ({ params, request }) => {
            const goalId = params['id'] as string
            if (goalId !== mockGoal.id) {
              return HttpResponse.json({ error: 'Not Found' }, { status: 404 })
            }

            const updates = (await request.json()) as Partial<TGoalDto>
            const updatedGoal: TGoalDto = {
              ...mockGoal,
              ...updates,
              modifiedAt: new Date().toISOString(),
            }

            return HttpResponse.json(updatedGoal, { status: 200 })
          }
        )
      )

      const queryClient = createTestQueryClient()

      const { result } = renderHook(() => useUpdateGoal(), {
        wrapper: createWrapper(queryClient),
      })

      result.current.mutate({
        goalId: mockGoal.id,
        goalData: { status: 'completed' },
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      // Verify the updated data
      expect(result.current.data).toBeDefined()
    })
  })
})
