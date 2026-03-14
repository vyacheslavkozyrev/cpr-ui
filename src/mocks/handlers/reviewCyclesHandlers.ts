import { http, HttpResponse } from 'msw'
import {
  EReviewCycleStatus,
  EReviewNomineeStatus,
  type IReviewNominee,
} from '../../types/reviewCycle.types'
import {
  mockAggregatedResults,
  mockDetailedResults,
  mockReviewCycles,
  mockReviewNominees,
  mockReviewRequests,
  mockReviewResponses,
} from '../data/reviewCyclesMockData'

const DEFAULT_API_BASE_URL =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env['VITE_API_BASE_URL'] || 'http://localhost:3000/api'
    : 'http://localhost:3000/api'

export const reviewCyclesHandlers = [
  // POST /api/review-cycles — create cycle
  http.post(`${DEFAULT_API_BASE_URL}/review-cycles`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>
    const newCycle = {
      ...mockReviewCycles[0],
      id: `cycle-new-${Date.now()}`,
      title: (body['title'] as string) || 'New Review Cycle',
      created_at: new Date().toISOString(),
    }
    return HttpResponse.json(newCycle, { status: 201 })
  }),

  // GET /api/review-cycles — list cycles
  http.get(`${DEFAULT_API_BASE_URL}/review-cycles`, ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') || '1')
    const pageSize = Number(url.searchParams.get('page_size') || '20')
    const status = url.searchParams.get('status')
    let filtered = mockReviewCycles
    if (status) filtered = filtered.filter(c => c.status === status)
    const total = filtered.length
    const data = filtered.slice((page - 1) * pageSize, page * pageSize)
    return HttpResponse.json({
      data,
      pagination: {
        page,
        page_size: pageSize,
        total_items: total,
        total_pages: Math.ceil(total / pageSize),
      },
    })
  }),

  // GET /api/review-cycles/:id — get cycle detail
  http.get(`${DEFAULT_API_BASE_URL}/review-cycles/:id`, ({ params }) => {
    const cycle = mockReviewCycles.find(c => c.id === params['id'])
    if (!cycle) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return HttpResponse.json(cycle)
  }),

  // PATCH /api/review-cycles/:id/status — transition status
  http.patch(
    `${DEFAULT_API_BASE_URL}/review-cycles/:id/status`,
    async ({ params, request }) => {
      const cycle = mockReviewCycles.find(c => c.id === params['id'])
      if (!cycle)
        return HttpResponse.json({ error: 'Not found' }, { status: 404 })
      const body = (await request.json()) as Record<string, unknown>
      const newStatus = body['status'] as string
      // Simulate invalid transition: closed → open
      if (cycle.status === EReviewCycleStatus.CLOSED && newStatus === 'open') {
        return HttpResponse.json(
          {
            error: {
              code: 'errors.review_cycle.invalid_transition',
              message: 'Invalid status transition',
            },
          },
          { status: 409 }
        )
      }
      const updated = { ...cycle, status: newStatus as EReviewCycleStatus }
      return HttpResponse.json(updated)
    }
  ),

  // POST /api/review-cycles/:id/nominees — add nominee
  http.post(
    `${DEFAULT_API_BASE_URL}/review-cycles/:id/nominees`,
    async ({ params, request }) => {
      const body = (await request.json()) as Record<string, unknown>
      const reviewerId = body['reviewer_employee_id'] as string
      const cycleId = params['id'] as string
      // Self-nomination simulation
      if (reviewerId === 'self-employee-id') {
        return HttpResponse.json(
          { error: { code: 'errors.review_nominee.self_nomination' } },
          { status: 422 }
        )
      }
      // Duplicate simulation
      const existing = mockReviewNominees.find(
        n => n.cycle_id === cycleId && n.reviewer_employee_id === reviewerId
      )
      if (existing) {
        return HttpResponse.json(
          { error: { code: 'errors.review_nominee.duplicate' } },
          { status: 409 }
        )
      }
      const newNominee: IReviewNominee = {
        id: `nominee-new-${Date.now()}`,
        cycle_id: cycleId,
        reviewer_employee_id: reviewerId,
        reviewer_display_name: 'New Reviewer',
        nominated_by: 'actor-id',
        nominated_by_display_name: 'Actor Name',
        status: EReviewNomineeStatus.PENDING,
        created_at: new Date().toISOString(),
      }
      return HttpResponse.json(newNominee, { status: 201 })
    }
  ),

  // DELETE /api/review-cycles/:id/nominees/:nomineeId — remove nominee
  http.delete(
    `${DEFAULT_API_BASE_URL}/review-cycles/:id/nominees/:nomineeId`,
    ({ params }) => {
      const nominee = mockReviewNominees.find(n => n.id === params['nomineeId'])
      if (!nominee)
        return HttpResponse.json({ error: 'Not found' }, { status: 404 })
      return new HttpResponse(null, { status: 204 })
    }
  ),

  // GET /api/review-cycles/:id/nominees — list nominees
  http.get(
    `${DEFAULT_API_BASE_URL}/review-cycles/:id/nominees`,
    ({ params }) => {
      const nominees = mockReviewNominees.filter(
        n => n.cycle_id === params['id']
      )
      return HttpResponse.json({
        data: nominees,
        success: true,
        message: 'OK',
        timestamp: new Date().toISOString(),
      })
    }
  ),

  // POST /api/review-cycles/:id/responses — submit response
  http.post(
    `${DEFAULT_API_BASE_URL}/review-cycles/:id/responses`,
    async ({ params, request }) => {
      const body = (await request.json()) as Record<string, unknown>
      // Simulate already submitted
      if (body['_simulate_duplicate'] === true) {
        return HttpResponse.json(
          { error: { code: 'errors.review_response.already_submitted' } },
          { status: 409 }
        )
      }
      const response = {
        ...mockReviewResponses[0],
        id: `response-new-${Date.now()}`,
        cycle_id: params['id'] as string,
        overall_rating: body['overall_rating'] as number,
        comments: body['comments'] as string,
        created_at: new Date().toISOString(),
      }
      return HttpResponse.json(response, { status: 201 })
    }
  ),

  // GET /api/review-cycles/:id/results — get results
  http.get(
    `${DEFAULT_API_BASE_URL}/review-cycles/:id/results`,
    ({ request }) => {
      const url = new URL(request.url)
      const roleHeader =
        request.headers.get('X-Role') ||
        url.searchParams.get('role') ||
        'Employee'
      if (roleHeader === 'Employee') {
        return HttpResponse.json(mockAggregatedResults)
      }
      return HttpResponse.json(mockDetailedResults)
    }
  ),

  // GET /api/me/review-requests — list review requests
  http.get(`${DEFAULT_API_BASE_URL}/me/review-requests`, () => {
    return HttpResponse.json({
      data: mockReviewRequests,
      success: true,
      message: 'OK',
      timestamp: new Date().toISOString(),
    })
  }),
]

export default reviewCyclesHandlers
