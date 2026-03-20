/**
 * Gap Analysis MSW Handlers
 * Feature 0009 — Skills Gap Analysis & Development Planning
 */

import { http, HttpResponse } from 'msw'
import {
  mockAtHighestLevelResponse,
  mockEmployeeGapAnalysis,
  mockOwnGapAnalysis,
} from '../data/gapAnalysisMockData'

const DEFAULT_API_BASE_URL =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env['VITE_API_BASE_URL'] || 'http://localhost:3000/api'
    : 'http://localhost:3000/api'

export const gapAnalysisHandlers = [
  // GET /api/me/gap-analysis — own profile gap analysis
  http.get(`${DEFAULT_API_BASE_URL}/me/gap-analysis`, () =>
    HttpResponse.json(mockOwnGapAnalysis)
  ),

  // GET /api/employees/:id/gap-analysis — manager/director/admin view
  http.get(
    `${DEFAULT_API_BASE_URL}/employees/:id/gap-analysis`,
    ({ params }) => {
      const { id } = params

      // Simulate specific error scenarios via sentinel IDs.
      if (id === 'no-position') {
        return HttpResponse.json(
          {
            type: 'https://tools.ietf.org/html/rfc7807',
            title: 'Unprocessable Entity',
            status: 422,
            detail: 'errors.gap_analysis.no_position_assigned',
          },
          { status: 422 }
        )
      }

      if (id === 'at-highest-level') {
        return HttpResponse.json(mockAtHighestLevelResponse)
      }

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
            detail: 'errors.employee.not_found',
          },
          { status: 404 }
        )
      }

      return HttpResponse.json(mockEmployeeGapAnalysis)
    }
  ),
]

export default gapAnalysisHandlers
