/**
 * Analytics MSW Handlers
 * Feature 0014 — Performance Analytics & Reporting
 */

import { http, HttpResponse } from 'msw'
import type {
  TGoalAnalyticsDto,
  TSkillAnalyticsDto,
} from '../../dtos/analytics.dtos'

const DEFAULT_API_BASE_URL =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env['VITE_API_BASE_URL'] || 'http://localhost:3000/api'
    : 'http://localhost:3000/api'

const VALID_PERIODS = [
  'last_30_days',
  'last_90_days',
  'last_180_days',
  'last_quarter',
  'last_year',
]

const mockGoalAnalytics: TGoalAnalyticsDto = {
  period: 'last_90_days',
  period_start: '2025-11-01T00:00:00Z',
  period_end: '2026-01-30T23:59:59Z',
  stats: {
    total_goals: 12,
    created_in_period: 5,
    completed_in_period: 4,
    open_goals: 3,
    in_progress_goals: 5,
    overdue_goals: 1,
    completion_rate: 0.8,
    overdue_rate: 0.083,
    avg_days_to_complete: 38.2,
  },
  goals_by_status: {
    open: 3,
    in_progress: 5,
    completed: 4,
  },
  completion_trend: [
    { period_label: '2025-11', created: 2, completed: 1 },
    { period_label: '2025-12', created: 2, completed: 2 },
    { period_label: '2026-01', created: 1, completed: 1 },
  ],
}

const mockSkillAnalytics: TSkillAnalyticsDto = {
  period: 'last_90_days',
  period_start: '2025-11-01T00:00:00Z',
  period_end: '2026-01-30T23:59:59Z',
  gap_closure_summary: {
    skills_assessed: 10,
    skills_with_gaps: 3,
    gaps_closed_in_period: 1,
    gaps_worsened_in_period: 0,
    avg_gap_at_period_start: 1.5,
    avg_gap_at_period_end: 1.0,
  },
  skills: [
    {
      skill_id: '550e8400-e29b-41d4-a716-446655440001',
      skill_title: 'TypeScript',
      category_title: 'Frontend',
      current_self_assessment: 4.0,
      current_manager_assessment: 3.5,
      required_level: 4.0,
      gap: 0.0,
      history: [
        {
          recorded_at: '2025-11-15T10:00:00Z',
          self_assessment_value: 3.0,
          manager_assessment_value: null,
        },
        {
          recorded_at: '2025-12-20T14:30:00Z',
          self_assessment_value: 3.5,
          manager_assessment_value: 3.0,
        },
      ],
    },
    {
      skill_id: '550e8400-e29b-41d4-a716-446655440002',
      skill_title: 'React',
      category_title: 'Frontend',
      current_self_assessment: 3.5,
      current_manager_assessment: null,
      required_level: 4.0,
      gap: 0.5,
      history: [],
    },
  ],
}

const respondWithGoalAnalytics = (period: string | null): Response => {
  if (period && !VALID_PERIODS.includes(period)) {
    return HttpResponse.json(
      {
        type: 'https://tools.ietf.org/html/rfc7807',
        title: 'Validation Failed',
        status: 400,
        detail: 'errors.analytics.invalid_period',
      },
      { status: 400 }
    )
  }

  const data = { ...mockGoalAnalytics, period: period ?? 'last_90_days' }
  return HttpResponse.json(data)
}

const respondWithSkillAnalytics = (period: string | null): Response => {
  if (period && !VALID_PERIODS.includes(period)) {
    return HttpResponse.json(
      {
        type: 'https://tools.ietf.org/html/rfc7807',
        title: 'Validation Failed',
        status: 400,
        detail: 'errors.analytics.invalid_period',
      },
      { status: 400 }
    )
  }

  const data = { ...mockSkillAnalytics, period: period ?? 'last_90_days' }
  return HttpResponse.json(data)
}

export const analyticsHandlers = [
  // GET /api/me/analytics/goals
  http.get(`${DEFAULT_API_BASE_URL}/me/analytics/goals`, ({ request }) => {
    const url = new URL(request.url)
    const period = url.searchParams.get('period')
    return respondWithGoalAnalytics(period)
  }),

  // GET /api/me/analytics/skills
  http.get(`${DEFAULT_API_BASE_URL}/me/analytics/skills`, ({ request }) => {
    const url = new URL(request.url)
    const period = url.searchParams.get('period')
    return respondWithSkillAnalytics(period)
  }),

  // GET /api/employees/:id/analytics/goals
  http.get(
    `${DEFAULT_API_BASE_URL}/employees/:id/analytics/goals`,
    ({ params, request }) => {
      const { id } = params
      const url = new URL(request.url)
      const period = url.searchParams.get('period')

      if (id === 'forbidden') {
        return HttpResponse.json(
          {
            type: 'https://tools.ietf.org/html/rfc7807',
            title: 'Forbidden',
            status: 403,
            detail: 'errors.auth.forbidden',
          },
          { status: 403 }
        )
      }

      if (id === 'not-found') {
        return HttpResponse.json(
          {
            type: 'https://tools.ietf.org/html/rfc7807',
            title: 'Not Found',
            status: 404,
            detail: 'errors.employees.not_found',
          },
          { status: 404 }
        )
      }

      return respondWithGoalAnalytics(period)
    }
  ),

  // GET /api/employees/:id/analytics/skills
  http.get(
    `${DEFAULT_API_BASE_URL}/employees/:id/analytics/skills`,
    ({ params, request }) => {
      const { id } = params
      const url = new URL(request.url)
      const period = url.searchParams.get('period')

      if (id === 'forbidden') {
        return HttpResponse.json(
          {
            type: 'https://tools.ietf.org/html/rfc7807',
            title: 'Forbidden',
            status: 403,
            detail: 'errors.auth.forbidden',
          },
          { status: 403 }
        )
      }

      if (id === 'not-found') {
        return HttpResponse.json(
          {
            type: 'https://tools.ietf.org/html/rfc7807',
            title: 'Not Found',
            status: 404,
            detail: 'errors.employees.not_found',
          },
          { status: 404 }
        )
      }

      return respondWithSkillAnalytics(period)
    }
  ),
]

export default analyticsHandlers
