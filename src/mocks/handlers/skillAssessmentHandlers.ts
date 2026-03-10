import { http, HttpResponse } from 'msw'
import {
  mockEmployeeSkillAssessmentResponse,
  mockSkillAssessmentResponse,
  mockTeamSkillSummaryResponse,
} from '../data/skillAssessmentMockData'

const DEFAULT_API_BASE_URL =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env['VITE_API_BASE_URL'] || 'http://localhost:3000/api'
    : 'http://localhost:3000/api'

const ok = (data: unknown) =>
  HttpResponse.json({
    data,
    success: true,
    message: 'OK',
    timestamp: new Date().toISOString(),
  })

export const skillAssessmentHandlers = [
  // GET /api/me/feedback — returns received feedback items for the evidence linking modal
  http.get(`${DEFAULT_API_BASE_URL}/me/feedback`, () =>
    HttpResponse.json([
      {
        id: 'fb-001',
        sender_display_name: 'Alice Johnson',
        rating: 4,
        content:
          'Great job leading the API review and migration. Excellent technical leadership.',
      },
      {
        id: 'fb-002',
        sender_display_name: 'Bob Chen',
        rating: 5,
        content:
          'Outstanding collaboration and communication skills throughout the quarter.',
      },
      {
        id: 'fb-003',
        sender_display_name: 'Carol White',
        rating: 3,
        content:
          'Good technical skills, could improve on documentation and knowledge sharing.',
      },
    ])
  ),

  // GET /api/me/skill-assessment
  http.get(`${DEFAULT_API_BASE_URL}/me/skill-assessment`, () =>
    HttpResponse.json(mockSkillAssessmentResponse)
  ),

  // PUT /api/me/skill-assessment/skills/:skillId
  http.put(
    `${DEFAULT_API_BASE_URL}/me/skill-assessment/skills/:skillId`,
    async ({ request, params }) => {
      const body = (await request.json()) as Record<string, unknown>
      const skillId = params['skillId'] as string
      const skillLevelId = body['skill_level_id'] as string

      // Simulate 422 target_conflict: if level-004 (Expert) is used and target exists at level-004
      if (skillLevelId === 'target-conflict-level') {
        return HttpResponse.json(
          { data: null, success: false, message: 'target_conflict' },
          { status: 422 }
        )
      }

      return ok({
        id: `assess-${skillId}`,
        skill_id: skillId,
        skill_level_id: skillLevelId,
        skill_level_title: 'Intermediate',
        skill_level_value: 2,
        notes: (body['notes'] as string | null) ?? null,
      })
    }
  ),

  // DELETE /api/me/skill-assessment/skills/:skillId
  http.delete(
    `${DEFAULT_API_BASE_URL}/me/skill-assessment/skills/:skillId`,
    () => new HttpResponse(null, { status: 204 })
  ),

  // PUT /api/me/skill-assessment/skills/:skillId/target
  http.put(
    `${DEFAULT_API_BASE_URL}/me/skill-assessment/skills/:skillId/target`,
    async ({ request, params }) => {
      const body = (await request.json()) as Record<string, unknown>
      const skillId = params['skillId'] as string
      const skillLevelId = body['skill_level_id'] as string

      if (skillLevelId === 'target-too-low-level') {
        return HttpResponse.json(
          { data: null, success: false, message: 'target_too_low' },
          { status: 422 }
        )
      }

      return ok({
        id: `target-${skillId}`,
        skill_id: skillId,
        skill_level_id: skillLevelId,
        skill_level_title: 'Advanced',
        skill_level_value: 3,
      })
    }
  ),

  // DELETE /api/me/skill-assessment/skills/:skillId/target
  http.delete(
    `${DEFAULT_API_BASE_URL}/me/skill-assessment/skills/:skillId/target`,
    () => new HttpResponse(null, { status: 204 })
  ),

  // POST /api/me/skill-assessment/skills/:skillId/evidence
  http.post(
    `${DEFAULT_API_BASE_URL}/me/skill-assessment/skills/:skillId/evidence`,
    async ({ request, params }) => {
      const body = (await request.json()) as Record<string, unknown>
      const skillId = params['skillId'] as string
      const feedbackId = body['feedback_id'] as string

      if (feedbackId === 'assessment-required-feedback') {
        return HttpResponse.json(
          { data: null, success: false, message: 'assessment_required' },
          { status: 422 }
        )
      }

      return HttpResponse.json(
        {
          data: {
            id: `evid-${skillId}-${feedbackId}`,
            feedback_id: feedbackId,
            sender_display_name: 'Test Sender',
            rating: 4,
            content_excerpt: 'Excellent technical contribution to the project.',
          },
          success: true,
          message: 'Created',
          timestamp: new Date().toISOString(),
        },
        { status: 201 }
      )
    }
  ),

  // DELETE /api/me/skill-assessment/skills/:skillId/evidence/:feedbackId
  http.delete(
    `${DEFAULT_API_BASE_URL}/me/skill-assessment/skills/:skillId/evidence/:feedbackId`,
    () => new HttpResponse(null, { status: 204 })
  ),

  // GET /api/me/team/skill-assessment-summary
  http.get(`${DEFAULT_API_BASE_URL}/me/team/skill-assessment-summary`, () =>
    HttpResponse.json(mockTeamSkillSummaryResponse)
  ),

  // GET /api/employees/:employeeId/skill-assessment
  http.get(
    `${DEFAULT_API_BASE_URL}/employees/:employeeId/skill-assessment`,
    () => HttpResponse.json(mockEmployeeSkillAssessmentResponse)
  ),
]

export default skillAssessmentHandlers
