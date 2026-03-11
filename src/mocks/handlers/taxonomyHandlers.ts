import { http, HttpResponse } from 'msw'
import {
  mockCareerPathDetailsMap,
  mockCareerPathsResponse,
  mockCareerTrackDetailsMap,
  mockCareerTracksResponse,
  mockPositionDetailsMap,
  mockPositionSeniorBE,
  mockSkillCategoriesResponse,
  mockSkillDetailsMap,
  mockSkillsResponse,
} from '../data/taxonomyMockData'

const DEFAULT_API_BASE_URL =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env['VITE_API_BASE_URL'] || 'http://localhost:3000/api'
    : 'http://localhost:3000/api'

const ok = (data: unknown, status = 200) =>
  HttpResponse.json(
    {
      data,
      success: true,
      message: 'OK',
      timestamp: new Date().toISOString(),
    },
    { status }
  )

const notFound = (message = 'Not found') =>
  HttpResponse.json({ data: null, success: false, message }, { status: 404 })

export const taxonomyHandlers = [
  // --- Career Paths ---

  http.get(`${DEFAULT_API_BASE_URL}/taxonomy/career-paths`, () =>
    HttpResponse.json(mockCareerPathsResponse)
  ),

  http.get(
    `${DEFAULT_API_BASE_URL}/taxonomy/career-paths/:id`,
    ({ params }) => {
      const id = params['id'] as string
      const detail = mockCareerPathDetailsMap[id]
      if (!detail) return notFound('Career path not found')
      return HttpResponse.json(detail)
    }
  ),

  http.post(
    `${DEFAULT_API_BASE_URL}/taxonomy/career-paths`,
    async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>
      return ok(
        {
          id: `cp-new-${Date.now()}`,
          title: body['title'] as string,
          description: (body['description'] as string | null) ?? null,
        },
        201
      )
    }
  ),

  http.patch(
    `${DEFAULT_API_BASE_URL}/taxonomy/career-paths/:id`,
    async ({ request, params }) => {
      const id = params['id'] as string
      const body = (await request.json()) as Record<string, unknown>
      const existing = mockCareerPathDetailsMap[id]
      if (!existing) return notFound('Career path not found')
      return ok({
        id,
        title: (body['title'] as string) ?? existing.title,
        description:
          body['description'] !== undefined
            ? (body['description'] as string | null)
            : existing.description,
      })
    }
  ),

  // --- Career Tracks ---

  http.get(`${DEFAULT_API_BASE_URL}/taxonomy/career-tracks`, () =>
    HttpResponse.json(mockCareerTracksResponse)
  ),

  http.get(
    `${DEFAULT_API_BASE_URL}/taxonomy/career-tracks/:id`,
    ({ params }) => {
      const id = params['id'] as string
      const detail = mockCareerTrackDetailsMap[id]
      if (!detail) return notFound('Career track not found')
      return HttpResponse.json(detail)
    }
  ),

  http.post(
    `${DEFAULT_API_BASE_URL}/taxonomy/career-tracks`,
    async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>
      return ok(
        {
          id: `ct-new-${Date.now()}`,
          title: body['title'] as string,
          description: (body['description'] as string | null) ?? null,
          career_path_id: body['career_path_id'] as string,
          career_path_title: 'Engineering',
        },
        201
      )
    }
  ),

  http.patch(
    `${DEFAULT_API_BASE_URL}/taxonomy/career-tracks/:id`,
    async ({ request, params }) => {
      const id = params['id'] as string
      const body = (await request.json()) as Record<string, unknown>
      const existing = mockCareerTrackDetailsMap[id]
      if (!existing) return notFound('Career track not found')
      return ok({
        id,
        title: (body['title'] as string) ?? existing.title,
        description:
          body['description'] !== undefined
            ? (body['description'] as string | null)
            : existing.description,
        career_path_id:
          (body['career_path_id'] as string) ?? existing.career_path_id,
        career_path_title: existing.career_path_title,
      })
    }
  ),

  // --- Positions ---

  http.get(`${DEFAULT_API_BASE_URL}/taxonomy/positions/:id`, ({ params }) => {
    const id = params['id'] as string
    const detail = mockPositionDetailsMap[id]
    if (!detail) return notFound('Position not found')
    return HttpResponse.json(detail)
  }),

  http.post(
    `${DEFAULT_API_BASE_URL}/taxonomy/positions`,
    async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>
      return ok(
        {
          id: `pos-new-${Date.now()}`,
          title: body['title'] as string,
          description: (body['description'] as string | null) ?? null,
          expectations: (body['expectations'] as string | null) ?? null,
          sort_order: (body['sort_order'] as number) ?? 0,
          career_track_id: body['career_track_id'] as string,
          career_track_title: 'Backend Engineering',
        },
        201
      )
    }
  ),

  http.patch(
    `${DEFAULT_API_BASE_URL}/taxonomy/positions/:id`,
    async ({ request, params }) => {
      const id = params['id'] as string
      const body = (await request.json()) as Record<string, unknown>
      const existing = mockPositionDetailsMap[id]
      if (!existing) return notFound('Position not found')
      return ok({
        id,
        title: (body['title'] as string) ?? existing.title,
        description:
          body['description'] !== undefined
            ? (body['description'] as string | null)
            : existing.description,
        expectations:
          body['expectations'] !== undefined
            ? (body['expectations'] as string | null)
            : existing.expectations,
        sort_order: (body['sort_order'] as number) ?? existing.sort_order,
        career_track_id: existing.career_track_id,
        career_track_title: existing.career_track_title,
      })
    }
  ),

  // Position skills

  http.post(
    `${DEFAULT_API_BASE_URL}/taxonomy/positions/:positionId/skills`,
    async ({ request, params }) => {
      const positionId = params['positionId'] as string
      const body = (await request.json()) as Record<string, unknown>
      return ok(
        {
          id: `pts-new-${Date.now()}`,
          skill_id: body['skill_id'] as string,
          skill_title: 'New Skill',
          category_id: 'cat-001-technical',
          category_title: 'Technical',
          skill_level_id: body['skill_level_id'] as string,
          skill_level_title: 'Intermediate',
          skill_level_value: 2,
          is_mandatory: (body['is_mandatory'] as boolean) ?? false,
          rationale: (body['rationale'] as string | null) ?? null,
          position_id: positionId,
        },
        201
      )
    }
  ),

  http.patch(
    `${DEFAULT_API_BASE_URL}/taxonomy/positions/:positionId/skills/:positionSkillId`,
    async ({ request, params }) => {
      const positionSkillId = params['positionSkillId'] as string
      const positionId = params['positionId'] as string
      const body = (await request.json()) as Record<string, unknown>
      const position = mockPositionDetailsMap[positionId]
      const existing = position?.skills.find(s => s.id === positionSkillId)
      if (!existing) return notFound('Position skill not found')
      return ok({
        ...existing,
        skill_level_id:
          (body['skill_level_id'] as string) ?? existing.skill_level_id,
        is_mandatory:
          (body['is_mandatory'] as boolean) ?? existing.is_mandatory,
        rationale:
          body['rationale'] !== undefined
            ? (body['rationale'] as string | null)
            : existing.rationale,
      })
    }
  ),

  http.delete(
    `${DEFAULT_API_BASE_URL}/taxonomy/positions/:positionId/skills/:positionSkillId`,
    () => new HttpResponse(null, { status: 204 })
  ),

  // --- Skill Categories ---

  http.get(`${DEFAULT_API_BASE_URL}/taxonomy/skill-categories`, () =>
    HttpResponse.json(mockSkillCategoriesResponse)
  ),

  http.post(
    `${DEFAULT_API_BASE_URL}/taxonomy/skill-categories`,
    async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>
      return ok(
        {
          id: `cat-new-${Date.now()}`,
          title: body['title'] as string,
          description: (body['description'] as string | null) ?? null,
        },
        201
      )
    }
  ),

  http.patch(
    `${DEFAULT_API_BASE_URL}/taxonomy/skill-categories/:id`,
    async ({ request, params }) => {
      const id = params['id'] as string
      const body = (await request.json()) as Record<string, unknown>
      const existing = mockSkillCategoriesResponse.data.find(c => c.id === id)
      if (!existing) return notFound('Skill category not found')
      return ok({
        id,
        title: (body['title'] as string) ?? existing.title,
        description:
          body['description'] !== undefined
            ? (body['description'] as string | null)
            : existing.description,
      })
    }
  ),

  // --- Skills ---

  http.get(`${DEFAULT_API_BASE_URL}/taxonomy/skills`, () =>
    HttpResponse.json(mockSkillsResponse)
  ),

  http.get(`${DEFAULT_API_BASE_URL}/taxonomy/skills/:id`, ({ params }) => {
    const id = params['id'] as string
    const detail = mockSkillDetailsMap[id]
    if (!detail) return notFound('Skill not found')
    return HttpResponse.json(detail)
  }),

  http.post(`${DEFAULT_API_BASE_URL}/taxonomy/skills`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    return ok(
      {
        id: `skill-new-${Date.now()}`,
        title: body['title'] as string,
        description: (body['description'] as string | null) ?? null,
        category_id: body['category_id'] as string,
        category_title: 'Technical',
        levels: [],
      },
      201
    )
  }),

  http.patch(
    `${DEFAULT_API_BASE_URL}/taxonomy/skills/:id`,
    async ({ request, params }) => {
      const id = params['id'] as string
      const body = (await request.json()) as Record<string, unknown>
      const existing = mockSkillDetailsMap[id]
      if (!existing) return notFound('Skill not found')
      return ok({
        ...existing,
        title: (body['title'] as string) ?? existing.title,
        description:
          body['description'] !== undefined
            ? (body['description'] as string | null)
            : existing.description,
        category_id: (body['category_id'] as string) ?? existing.category_id,
      })
    }
  ),

  http.delete(`${DEFAULT_API_BASE_URL}/taxonomy/skills/:id`, ({ params }) => {
    const id = params['id'] as string
    if (!mockSkillDetailsMap[id]) return notFound('Skill not found')
    return new HttpResponse(null, { status: 204 })
  }),

  // Skill levels

  http.post(
    `${DEFAULT_API_BASE_URL}/taxonomy/skills/:skillId/levels`,
    async ({ request, params }) => {
      const skillId = params['skillId'] as string
      const body = (await request.json()) as Record<string, unknown>
      return ok(
        {
          id: `lvl-new-${skillId}-${Date.now()}`,
          title: body['title'] as string,
          description: (body['description'] as string | null) ?? null,
          value: body['value'] as number,
        },
        201
      )
    }
  ),

  http.patch(
    `${DEFAULT_API_BASE_URL}/taxonomy/skills/:skillId/levels/:levelId`,
    async ({ request, params }) => {
      const skillId = params['skillId'] as string
      const levelId = params['levelId'] as string
      const body = (await request.json()) as Record<string, unknown>
      const skill = mockSkillDetailsMap[skillId]
      const existing = skill?.levels.find(l => l.id === levelId)
      if (!existing) return notFound('Skill level not found')
      return ok({
        id: levelId,
        title: (body['title'] as string) ?? existing.title,
        description:
          body['description'] !== undefined
            ? (body['description'] as string | null)
            : existing.description,
        value: (body['value'] as number) ?? existing.value,
      })
    }
  ),
]

// Also export a default with all handlers so position detail page can use the full mock
export { mockPositionSeniorBE as defaultMockPosition }

export default taxonomyHandlers
