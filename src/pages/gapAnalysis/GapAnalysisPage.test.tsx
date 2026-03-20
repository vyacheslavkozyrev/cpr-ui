/**
 * Unit tests for GapAnalysisPage
 * Feature 0009 — Skills Gap Analysis & Development Planning
 */

import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  mockAtHighestLevelResponse,
  mockOwnGapAnalysis,
} from '@/mocks/data/gapAnalysisMockData'
import { server } from '@/mocks/server'
import { renderWithProviders } from '@/tests/utils'
import GapAnalysisPage from './GapAnalysisPage'

// ── Helpers ───────────────────────────────────────────────────────────────────

const API_BASE =
  import.meta.env['VITE_API_BASE_URL'] || 'http://localhost:3000/api'

const renderPage = (userType: 'employee' | 'manager' | 'admin' = 'employee') =>
  renderWithProviders(<GapAnalysisPage />, {
    contextOptions: { userType, includeRouter: true },
  })

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('GapAnalysisPage', () => {
  describe('loading state', () => {
    it('renders loading skeletons while data is fetching', () => {
      // Delay the handler so the loading state is visible
      server.use(
        http.get(`${API_BASE}/me/gap-analysis`, async () => {
          await new Promise(resolve => setTimeout(resolve, 500))
          return HttpResponse.json(mockOwnGapAnalysis)
        })
      )
      renderPage()
      // Skeleton elements render while loading
      const skeletons = document.querySelectorAll('[class*="MuiSkeleton"]')
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })

  describe('successful data load', () => {
    it('renders the page title after data loads', async () => {
      renderPage()
      await waitFor(() => {
        expect(screen.getByText(/skills gap analysis/i)).toBeInTheDocument()
      })
    })

    it('displays current and next position names in subtitle', async () => {
      renderPage()
      await waitFor(() => {
        // The mock data has "Junior Software Engineer" → "Software Engineer"
        expect(
          screen.getByText(/Junior Software Engineer/i)
        ).toBeInTheDocument()
        expect(screen.getByText(/Software Engineer/i)).toBeInTheDocument()
      })
    })

    it('renders the skills table with skill rows', async () => {
      renderPage()
      await waitFor(() => {
        expect(screen.getByText('TypeScript')).toBeInTheDocument()
      })
    })

    it('renders the chart container', async () => {
      renderPage()
      await waitFor(() => {
        // Either radar or bar chart container should be present
        expect(screen.getByRole('img')).toBeInTheDocument()
      })
    })

    it('shows Create Goal button for employee role', async () => {
      renderPage('employee')
      await waitFor(() => {
        // At least one Create Goal button (for gaps > 0)
        expect(
          screen.getAllByRole('button', { name: /create goal/i }).length
        ).toBeGreaterThan(0)
      })
    })

    it('does not show Create Goal button for admin role', async () => {
      renderPage('admin')
      await waitFor(() => {
        expect(screen.getByText(/skills gap analysis/i)).toBeInTheDocument()
      })
      expect(
        screen.queryByRole('button', { name: /create goal/i })
      ).not.toBeInTheDocument()
    })
  })

  describe('at highest level (null nextPosition)', () => {
    beforeEach(() => {
      server.use(
        http.get(`${API_BASE}/me/gap-analysis`, () =>
          HttpResponse.json(mockAtHighestLevelResponse)
        )
      )
    })

    it('shows the at-highest-level info alert', async () => {
      renderPage()
      await waitFor(() => {
        expect(
          screen.getByText(/highest level in your career track/i)
        ).toBeInTheDocument()
      })
    })

    it('does not render the chart or table when at highest level', async () => {
      renderPage()
      await waitFor(() => {
        expect(screen.getByText(/highest level/i)).toBeInTheDocument()
      })
      expect(screen.queryByRole('table')).not.toBeInTheDocument()
      expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })
  })

  describe('error states', () => {
    it('shows no-position-assigned warning for 422 error', async () => {
      server.use(
        http.get(`${API_BASE}/me/gap-analysis`, () =>
          HttpResponse.json(
            { status: 422, detail: 'errors.gap_analysis.no_position_assigned' },
            { status: 422 }
          )
        )
      )
      renderPage()
      await waitFor(() => {
        expect(screen.getByText(/no position assigned/i)).toBeInTheDocument()
      })
    })

    it('shows generic error alert and retry button for non-422, non-401 errors', async () => {
      server.use(
        http.get(`${API_BASE}/me/gap-analysis`, () =>
          HttpResponse.json({ status: 500 }, { status: 500 })
        )
      )
      renderPage()
      await waitFor(() => {
        expect(
          screen.getByText(/failed to load gap analysis/i)
        ).toBeInTheDocument()
      })
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    })

    it('renders nothing for 401 error', async () => {
      server.use(
        http.get(`${API_BASE}/me/gap-analysis`, () =>
          HttpResponse.json({ status: 401 }, { status: 401 })
        )
      )
      const { container } = renderPage()
      await waitFor(() => {
        // Give time for the query to settle
        expect(container.firstChild).toBeDefined()
      })
      // Should render nothing meaningful — no heading, no alert
      expect(screen.queryByText(/skills gap analysis/i)).not.toBeInTheDocument()
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })
})
