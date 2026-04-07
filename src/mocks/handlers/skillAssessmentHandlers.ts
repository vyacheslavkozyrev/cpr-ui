import { http, HttpResponse, type JsonBodyType } from 'msw'
import {
  mockEmployeeSkillAssessmentResponse,
  mockSkillAssessmentResponse,
  mockTeamSkillSummaryResponse,
} from '../data/skillAssessmentMockData'

const DEFAULT_API_BASE_URL =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env['VITE_API_BASE_URL'] || 'http://localhost:3000/api'
    : 'http://localhost:3000/api'

const ok = (data: JsonBodyType) => HttpResponse.json(data)

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
      const selfAssessmentValue = body['self_assessment_value'] as number

      return ok({
        id: `assess-${skillId}`,
        skill_id: skillId,
        self_assessment_value: selfAssessmentValue,
        manager_assessment_value: null,
        notes: (body['notes'] as string | null) ?? null,
      })
    }
  ),

  // DELETE /api/me/skill-assessment/skills/:skillId
  http.delete(
    `${DEFAULT_API_BASE_URL}/me/skill-assessment/skills/:skillId`,
    () => new HttpResponse(null, { status: 204 })
  ),

  // PUT /api/me/skill-assessment/skills/:skillId/target — removed, returns 404
  http.put(
    `${DEFAULT_API_BASE_URL}/me/skill-assessment/skills/:skillId/target`,
    () =>
      HttpResponse.json(
        {
          title: 'Not Found',
          detail: 'Target level endpoints have been removed.',
        },
        { status: 404 }
      )
  ),

  // DELETE /api/me/skill-assessment/skills/:skillId/target — removed, returns 404
  http.delete(
    `${DEFAULT_API_BASE_URL}/me/skill-assessment/skills/:skillId/target`,
    () =>
      HttpResponse.json(
        {
          title: 'Not Found',
          detail: 'Target level endpoints have been removed.',
        },
        { status: 404 }
      )
  ),

  // PUT /api/employees/:employeeId/skill-assessment/skills/:skillId/manager-assessment
  http.put(
    `${DEFAULT_API_BASE_URL}/employees/:employeeId/skill-assessment/skills/:skillId/manager-assessment`,
    async ({ request, params }) => {
      const body = (await request.json()) as Record<string, unknown>
      const skillId = params['skillId'] as string
      const managerAssessmentValue = body['manager_assessment_value'] as number

      return ok({
        id: `assess-${skillId}`,
        skill_id: skillId,
        self_assessment_value: 2,
        manager_assessment_value: managerAssessmentValue,
        notes: null,
      })
    }
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
          id: `evid-${skillId}-${feedbackId}`,
          feedback_id: feedbackId,
          sender_display_name: 'Test Sender',
          rating: 4,
          feedback_content: 'Excellent technical contribution to the project.',
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
