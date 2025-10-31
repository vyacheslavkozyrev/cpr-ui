import { http, HttpResponse } from 'msw'
import type {
  TCreateGoalDto,
  TCreateGoalTaskDto,
  TGoalDto,
  TGoalsSummaryDto,
  TGoalTaskDto,
  TPaginatedGoalsResponseDto,
  TTeamGoalsDto,
  TUpdateGoalDto,
  TUpdateGoalTaskDto,
} from '../../dtos/GoalDto'
// Default fallback API URL for mock handlers
const DEFAULT_API_BASE_URL = 'http://localhost:3000/api'

// Get API base URL from environment variable with fallback
const getApiBaseUrl = () => {
  // In Node.js environment (tests)
  if (typeof process !== 'undefined' && process.env) {
    return process.env['VITE_API_BASE_URL'] || DEFAULT_API_BASE_URL
  }

  // In browser environment (Vite)
  return import.meta.env?.['VITE_API_BASE_URL'] || DEFAULT_API_BASE_URL
}

const API_BASE_URL = getApiBaseUrl()

// Mock data generators
const generateMockGoalTask = (goalId: string, index: number): TGoalTaskDto => {
  const isCompleted = Math.random() > 0.7
  return {
    id: `task-${goalId}-${index}`,
    goalId,
    title: `Task ${index + 1} for goal`,
    description: `Detailed description for task ${index + 1}`,
    deadline: new Date(
      Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000
    ).toISOString(),
    isCompleted,
    ...(isCompleted && { completedAt: new Date().toISOString() }),
    createdAt: new Date(
      Date.now() - (10 - index) * 24 * 60 * 60 * 1000
    ).toISOString(),
  }
}

const generateMockGoal = (index: number): TGoalDto => {
  const goalId = `goal-${index}`
  const status = (['open', 'in_progress', 'completed'] as const)[index % 3]
  const taskCount = Math.floor(Math.random() * 5) + 1

  return {
    id: goalId,
    employeeId: 'test-employee-id',
    title: `Professional Goal ${index + 1}`,
    description: `This is a comprehensive description for goal ${index + 1}. It outlines the objectives, expectations, and success criteria.`,
    status,
    deadline: new Date(
      Date.now() + (index + 1) * 30 * 24 * 60 * 60 * 1000
    ).toISOString(),
    relatedSkillId: `skill-${index % 5}`,
    relatedSkillLevelId: `skill-level-${index % 3}`,
    priority: Math.floor(Math.random() * 100),
    visibility: (['private', 'team', 'org'] as const)[index % 3],
    createdAt: new Date(
      Date.now() - (30 - index) * 24 * 60 * 60 * 1000
    ).toISOString(),
    updatedAt: new Date(
      Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    ).toISOString(),
    createdBy: 'test-employee-id',
    tasks: Array.from({ length: taskCount }, (_, i) =>
      generateMockGoalTask(goalId, i)
    ),
  }
}

// Generate mock goals data
const mockGoals: TGoalDto[] = Array.from({ length: 15 }, (_, i) =>
  generateMockGoal(i)
)

// Mock handlers
export const goalsHandlers = [
  // ========================================
  // Goals Management Endpoints
  // ========================================

  // Create Goal - POST /api/Goals
  http.post(`${API_BASE_URL}/Goals`, async ({ request }) => {
    try {
      const goalData = (await request.json()) as TCreateGoalDto

      // Validate required fields
      if (!goalData.title || goalData.title.length === 0) {
        return HttpResponse.json(
          {
            type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
            title: 'One or more validation errors occurred.',
            status: 400,
            errors: {
              Title: ['Title is required'],
            },
          },
          { status: 400 }
        )
      }

      // Create new goal
      const newGoal: TGoalDto = {
        id: `goal-new-${Date.now()}`,
        employeeId: goalData.employeeId || 'test-employee-id',
        title: goalData.title,
        ...(goalData.description && { description: goalData.description }),
        status: 'open',
        ...(goalData.deadline && { deadline: goalData.deadline }),
        ...(goalData.relatedSkillId && {
          relatedSkillId: goalData.relatedSkillId,
        }),
        ...(goalData.relatedSkillLevelId && {
          relatedSkillLevelId: goalData.relatedSkillLevelId,
        }),
        ...(goalData.priority !== undefined && { priority: goalData.priority }),
        ...(goalData.visibility && { visibility: goalData.visibility }),
        createdAt: new Date().toISOString(),
        createdBy: 'test-employee-id',
        tasks: [],
      }

      // Add to mock data
      mockGoals.unshift(newGoal)

      return HttpResponse.json(newGoal, { status: 201 })
    } catch {
      return HttpResponse.json(
        {
          type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
          title: 'Bad Request',
          status: 400,
        },
        { status: 400 }
      )
    }
  }),

  // Get User Goals - GET /api/me/goals
  http.get(`${API_BASE_URL}/me/goals`, ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const perPage = parseInt(url.searchParams.get('per_page') || '20')
    const status = url.searchParams.get('status')
    const search = url.searchParams.get('search')

    let filteredGoals = [...mockGoals]

    // Apply status filter
    if (status && status !== 'all') {
      filteredGoals = filteredGoals.filter(goal => goal.status === status)
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filteredGoals = filteredGoals.filter(
        goal =>
          goal.title.toLowerCase().includes(searchLower) ||
          goal.description?.toLowerCase().includes(searchLower)
      )
    }

    // Calculate pagination
    const total = filteredGoals.length
    const startIndex = (page - 1) * perPage
    const endIndex = startIndex + perPage
    const paginatedGoals = filteredGoals.slice(startIndex, endIndex)

    const response: TPaginatedGoalsResponseDto = {
      items: paginatedGoals,
      total,
      page,
      per_page: perPage,
    }

    return HttpResponse.json(response)
  }),

  // Get Goal by ID - GET /api/Goals/{id}
  http.get(`${API_BASE_URL}/Goals/:id`, ({ params }) => {
    const goalId = params['id'] as string
    const goal = mockGoals.find(g => g.id === goalId)

    if (!goal) {
      return HttpResponse.json(
        {
          type: 'https://tools.ietf.org/html/rfc7231#section-6.5.4',
          title: 'Not Found',
          status: 404,
        },
        { status: 404 }
      )
    }

    return HttpResponse.json(goal)
  }),

  // Update Goal - PATCH /api/Goals/{id}
  http.patch(`${API_BASE_URL}/Goals/:id`, async ({ params, request }) => {
    const goalId = params['id'] as string
    const goalIndex = mockGoals.findIndex(g => g.id === goalId)

    if (goalIndex === -1) {
      return HttpResponse.json(
        {
          type: 'https://tools.ietf.org/html/rfc7231#section-6.5.4',
          title: 'Not Found',
          status: 404,
        },
        { status: 404 }
      )
    }

    try {
      const updateData = (await request.json()) as TUpdateGoalDto

      // Update goal
      const updatedGoal = {
        ...mockGoals[goalIndex],
        ...updateData,
        updatedAt: new Date().toISOString(),
      }

      mockGoals[goalIndex] = updatedGoal

      return HttpResponse.json(updatedGoal)
    } catch {
      return HttpResponse.json(
        {
          type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
          title: 'Bad Request',
          status: 400,
        },
        { status: 400 }
      )
    }
  }),

  // Delete Goal - DELETE /api/Goals/{id}
  http.delete(`${API_BASE_URL}/Goals/:id`, ({ params }) => {
    const goalId = params['id'] as string
    const goalIndex = mockGoals.findIndex(g => g.id === goalId)

    if (goalIndex === -1) {
      return HttpResponse.json(
        {
          type: 'https://tools.ietf.org/html/rfc7231#section-6.5.4',
          title: 'Not Found',
          status: 404,
        },
        { status: 404 }
      )
    }

    // Remove goal (soft delete simulation)
    mockGoals.splice(goalIndex, 1)

    return new HttpResponse(null, { status: 200 })
  }),

  // ========================================
  // Goal Tasks Endpoints
  // ========================================

  // Add Task to Goal - POST /api/Goals/{id}/tasks
  http.post(`${API_BASE_URL}/Goals/:id/tasks`, async ({ params, request }) => {
    const goalId = params['id'] as string
    const goal = mockGoals.find(g => g.id === goalId)

    if (!goal) {
      return HttpResponse.json(
        {
          type: 'https://tools.ietf.org/html/rfc7231#section-6.5.4',
          title: 'Not Found',
          status: 404,
        },
        { status: 404 }
      )
    }

    try {
      const taskData = (await request.json()) as TCreateGoalTaskDto

      // Create new task
      const newTask: TGoalTaskDto = {
        id: `task-${goalId}-${Date.now()}`,
        goalId,
        title: taskData.title,
        ...(taskData.description && { description: taskData.description }),
        ...(taskData.deadline && { deadline: taskData.deadline }),
        isCompleted: false,
        createdAt: new Date().toISOString(),
      }

      // Add task to goal
      goal.tasks.push(newTask)
      goal.updatedAt = new Date().toISOString()

      return HttpResponse.json(newTask)
    } catch {
      return HttpResponse.json(
        {
          type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
          title: 'Bad Request',
          status: 400,
        },
        { status: 400 }
      )
    }
  }),

  // Update Task - PATCH /api/Goals/{id}/tasks/{taskId}
  http.patch(
    `${API_BASE_URL}/Goals/:id/tasks/:taskId`,
    async ({ params, request }) => {
      const goalId = params['id'] as string
      const taskId = params['taskId'] as string
      const goal = mockGoals.find(g => g.id === goalId)

      if (!goal) {
        return HttpResponse.json(
          {
            type: 'https://tools.ietf.org/html/rfc7231#section-6.5.4',
            title: 'Not Found',
            status: 404,
          },
          { status: 404 }
        )
      }

      const taskIndex = goal.tasks.findIndex(t => t.id === taskId)
      if (taskIndex === -1) {
        return HttpResponse.json(
          {
            type: 'https://tools.ietf.org/html/rfc7231#section-6.5.4',
            title: 'Not Found',
            status: 404,
          },
          { status: 404 }
        )
      }

      try {
        const updateData = (await request.json()) as TUpdateGoalTaskDto

        // Update task
        const updatedTask: TGoalTaskDto = {
          ...goal.tasks[taskIndex],
          ...updateData,
          ...(updateData.isCompleted && {
            completedAt: new Date().toISOString(),
          }),
        }

        goal.tasks[taskIndex] = updatedTask
        goal.updatedAt = new Date().toISOString()

        return HttpResponse.json(updatedTask)
      } catch {
        return HttpResponse.json(
          {
            type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
            title: 'Bad Request',
            status: 400,
          },
          { status: 400 }
        )
      }
    }
  ),

  // Delete Task - DELETE /api/Goals/{id}/tasks/{taskId}
  http.delete(`${API_BASE_URL}/Goals/:id/tasks/:taskId`, ({ params }) => {
    const goalId = params['id'] as string
    const taskId = params['taskId'] as string
    const goal = mockGoals.find(g => g.id === goalId)

    if (!goal) {
      return HttpResponse.json(
        {
          type: 'https://tools.ietf.org/html/rfc7231#section-6.5.4',
          title: 'Not Found',
          status: 404,
        },
        { status: 404 }
      )
    }

    const taskIndex = goal.tasks.findIndex(t => t.id === taskId)
    if (taskIndex === -1) {
      return HttpResponse.json(
        {
          type: 'https://tools.ietf.org/html/rfc7231#section-6.5.4',
          title: 'Not Found',
          status: 404,
        },
        { status: 404 }
      )
    }

    // Remove task
    goal.tasks.splice(taskIndex, 1)
    goal.updatedAt = new Date().toISOString()

    return new HttpResponse(null, { status: 204 })
  }),

  // ========================================
  // Dashboard Integration Endpoints
  // ========================================

  // Goals Summary for Dashboard - GET /api/dashboard/goals-summary
  http.get(`${API_BASE_URL}/dashboard/goals-summary`, ({ request }) => {
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || 'month'

    // Filter goals based on period - for now using all goals as mock data doesn't have timestamps
    // In a real implementation, would filter by createdAt/updatedAt based on period
    const filteredGoals = period ? mockGoals : mockGoals // TODO: Add date-based filtering when goals have proper timestamps

    const completedGoals = filteredGoals.filter(
      g => g.status === 'completed'
    ).length
    const activeGoals = filteredGoals.filter(
      g => g.status === 'in_progress'
    ).length
    const openGoals = filteredGoals.filter(g => g.status === 'open').length
    const total = filteredGoals.length

    const goalsStatistics = {
      total,
      active: activeGoals + openGoals,
      completed: completedGoals,
      overdue: Math.floor(total * 0.1), // 10% overdue simulation
      completionRate: total > 0 ? completedGoals / total : 0,
      averageProgress: 0.65, // Simulated average progress
    }

    const response: TGoalsSummaryDto = {
      statistics: goalsStatistics,
      recentGoals: filteredGoals.slice(0, 5).map(goal => ({
        id: goal.id,
        title: goal.title,
        status: goal.status,
        progress: Math.random(),
        ...(goal.deadline && { deadline: goal.deadline }),
        isOverdue: false,
      })),
      progressTrend: [
        { period: '2024-10', completed: 5, created: 8 },
        { period: '2024-11', completed: 3, created: 6 },
        { period: '2024-12', completed: 7, created: 4 },
      ],
    }

    return HttpResponse.json(response)
  }),

  // ========================================
  // Team Management Endpoints
  // ========================================

  // Team Goals Overview - GET /api/team/goals
  http.get(`${API_BASE_URL}/team/goals`, () => {
    const teamGoals: TTeamGoalsDto = {
      totalGoals: 45,
      activeGoals: 28,
      completedGoals: 15,
      overdueGoals: 2,
      averageProgress: 0.72,
      goalsByStatus: {
        open: 12,
        in_progress: 16,
        completed: 15,
        overdue: 2,
      },
      memberGoals: [
        {
          employeeId: 'emp-001',
          employeeName: 'John Smith',
          totalGoals: 8,
          activeGoals: 5,
          completedGoals: 3,
          overdueGoals: 0,
          completionRate: 0.375,
          averageProgress: 0.68,
        },
        {
          employeeId: 'emp-002',
          employeeName: 'Sarah Johnson',
          totalGoals: 6,
          activeGoals: 4,
          completedGoals: 2,
          overdueGoals: 0,
          completionRate: 0.333,
          averageProgress: 0.75,
        },
      ],
    }

    return HttpResponse.json(teamGoals)
  }),
]

// Export for use in main handlers
export default goalsHandlers
