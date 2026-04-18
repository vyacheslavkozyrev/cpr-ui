/**
 * MSW handlers for team management endpoints (Feature 0010a)
 */

import { http, HttpResponse } from 'msw'
import type {
  ITeamMemberDto,
  IManagerViewFeedbackDto,
} from '../../dtos/TeamMemberDto'
import type { TGoalDto, TGoalDeletionRequestDto } from '../../dtos/GoalDto'

const DEFAULT_API_BASE_URL = 'http://localhost:3000/api'
const getApiBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env['VITE_API_BASE_URL'] || DEFAULT_API_BASE_URL
  }
  return DEFAULT_API_BASE_URL
}
const API_BASE_URL = getApiBaseUrl()

// ── Mock data ───────────────────────────────────────────────────────────────

const MOCK_TEAM_MEMBERS: ITeamMemberDto[] = [
  {
    id: 'emp-001',
    full_name: 'Alice Johnson',
    job_title: 'Software Engineer',
    position_id: 'pos-001',
    position_name: 'Individual Contributor',
  },
  {
    id: 'emp-002',
    full_name: 'Bob Williams',
    job_title: 'Product Manager',
    position_id: 'pos-002',
    position_name: 'Senior IC',
  },
]

const MOCK_EMPLOYEE_GOALS: TGoalDto[] = [
  {
    id: 'goal-emp-001',
    employeeId: 'emp-001',
    title: 'Complete TypeScript course',
    name: 'Complete TypeScript course',
    description: 'Finish the advanced TypeScript certification',
    status: 'in_progress',
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    timeframe: 'month',
    isCompleted: false,
    progressPercent: 40,
    progress_percentage: 40,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    has_pending_deletion_request: false,
    slim_tasks: [
      { id: 'task-001', name: 'Read chapters 1-5', is_completed: true },
      { id: 'task-002', name: 'Complete exercises', is_completed: false },
    ],
  },
  {
    id: 'goal-emp-002',
    employeeId: 'emp-001',
    title: 'Suggested goal from manager',
    name: 'Suggested goal from manager',
    description: 'A goal suggested by the manager',
    status: 'suggested',
    due_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    timeframe: 'quarter',
    isCompleted: false,
    progressPercent: 0,
    progress_percentage: 0,
    createdAt: new Date().toISOString(),
    suggested_by_id: 'mgr-001',
    suggested_by_name: 'Manager Name',
    has_pending_deletion_request: false,
    slim_tasks: [],
  },
]

const MOCK_FEEDBACK: IManagerViewFeedbackDto[] = [
  {
    id: 'fb-001',
    rating: 4,
    comment: 'Great work on the last sprint deliverables.',
    submitted_by_id: 'emp-003',
    submitted_by_name: 'Carol Davis',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'fb-002',
    rating: 5,
    comment: 'Excellent collaboration and communication.',
    submitted_by_id: 'emp-004',
    submitted_by_name: 'David Brown',
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// ── Handlers ────────────────────────────────────────────────────────────────

export const teamHandlers = [
  // GET /api/me/team — direct reports list
  http.get(`${API_BASE_URL}/me/team`, () => {
    return HttpResponse.json({ data: MOCK_TEAM_MEMBERS })
  }),

  // GET /api/employees/:id/goals — employee goals (manager view)
  http.get(`${API_BASE_URL}/employees/:employeeId/goals`, ({ params }) => {
    const goals = MOCK_EMPLOYEE_GOALS.filter(
      g =>
        g.employeeId === params['employeeId'] ||
        params['employeeId'] === 'emp-001'
    )
    return HttpResponse.json({ data: goals })
  }),

  // POST /api/employees/:id/goals — suggest a goal
  http.post(
    `${API_BASE_URL}/employees/:employeeId/goals`,
    async ({ request }) => {
      const body = (await request.json()) as {
        name?: string
        description?: string
        due_date?: string
        timeframe?: string
      }
      const suggested: TGoalDto = {
        id: `goal-suggested-${Date.now()}`,
        employeeId: 'emp-001',
        title: body.name ?? 'Suggested goal',
        ...(body.name && { name: body.name }),
        ...(body.description && { description: body.description }),
        status: 'suggested',
        ...(body.due_date && { due_date: body.due_date }),
        ...(body.timeframe && { timeframe: body.timeframe }),
        isCompleted: false,
        progressPercent: 0,
        has_pending_deletion_request: false,
        suggested_by_id: 'mgr-001',
        suggested_by_name: 'Manager Name',
        createdAt: new Date().toISOString(),
        slim_tasks: [],
      }
      return HttpResponse.json(suggested, { status: 201 })
    }
  ),

  // GET /api/employees/:id/feedback — employee feedback (manager view)
  http.get(`${API_BASE_URL}/employees/:employeeId/feedback`, () => {
    return HttpResponse.json({ data: MOCK_FEEDBACK })
  }),

  // PATCH /api/goals/:id/suggestion — accept or reject
  http.patch(
    `${API_BASE_URL}/goals/:goalId/suggestion`,
    async ({ params, request }) => {
      const body = (await request.json()) as { action: string }
      const goalId = params['goalId'] as string
      const goal = MOCK_EMPLOYEE_GOALS.find(g => g.id === goalId)
      if (!goal) {
        return HttpResponse.json({ title: 'Not Found' }, { status: 404 })
      }
      if (body.action === 'accept') {
        return HttpResponse.json({ ...goal, status: 'not_started' })
      }
      return new HttpResponse(null, { status: 204 })
    }
  ),

  // POST /api/goals/:id/deletion-request
  http.post(`${API_BASE_URL}/goals/:goalId/deletion-request`, ({ params }) => {
    const deletionRequest: TGoalDeletionRequestDto = {
      id: `dr-${Date.now()}`,
      goal_id: params['goalId'] as string,
      status: 'pending',
      created_at: new Date().toISOString(),
    }
    return HttpResponse.json(deletionRequest, { status: 201 })
  }),

  // DELETE /api/goals/:id/deletion-request
  http.delete(`${API_BASE_URL}/goals/:goalId/deletion-request`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // PATCH /api/goals/:id/deletion-request
  http.patch(
    `${API_BASE_URL}/goals/:goalId/deletion-request`,
    async ({ params, request }) => {
      const body = (await request.json()) as { action: string }
      const goalId = params['goalId'] as string
      const goal = MOCK_EMPLOYEE_GOALS.find(g => g.id === goalId)
      if (body.action === 'approve') {
        return new HttpResponse(null, { status: 204 })
      }
      return HttpResponse.json(goal ?? {})
    }
  ),

  // DELETE /api/goals/:id — manager direct delete
  http.delete(`${API_BASE_URL}/goals/:goalId`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // GET /api/employees/:id/project-assignments — employee projects (F0011 dependency)
  http.get(`${API_BASE_URL}/employees/:employeeId/project-assignments`, () => {
    return HttpResponse.json([
      {
        id: 'pa-001',
        project_name: 'Alpha Project',
        role: 'Developer',
        start_date: '2025-01-01',
        end_date: '2025-06-30',
        is_current: false,
      },
      {
        id: 'pa-002',
        project_name: 'Beta Initiative',
        role: 'Tech Lead',
        start_date: '2025-07-01',
        end_date: null,
        is_current: true,
      },
    ])
  }),
]

export default teamHandlers
