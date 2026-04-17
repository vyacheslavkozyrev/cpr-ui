/**
 * Unit tests for DashboardPage
 * Feature 0013 — Personal Performance Dashboard
 */

import { QueryClient } from '@tanstack/react-query'
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/mocks/server'
import { renderWithProviders } from '@/tests/utils'
import { DashboardPage } from './DashboardPage'

const API_BASE =
  import.meta.env['VITE_API_BASE_URL'] || 'http://localhost:3000/api'

const makeFreshQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  })

const renderPage = () =>
  renderWithProviders(<DashboardPage />, {
    contextOptions: {
      userType: 'employee',
      includeRouter: true,
      queryClient: makeFreshQueryClient(),
    },
  })

describe('DashboardPage', () => {
  describe('loading state', () => {
    it('renders loading skeletons while data is fetching', () => {
      server.use(
        http.get(`${API_BASE}/dashboard/summary`, async () => {
          await new Promise(resolve => setTimeout(resolve, 500))
          return HttpResponse.json({})
        })
      )
      renderPage()
      const skeletons = document.querySelectorAll('[class*="MuiSkeleton"]')
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })

  describe('successful data load', () => {
    it('renders the dashboard title', async () => {
      renderPage()
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
      })
    })

    it('renders stat cards from API data (not hardcoded)', async () => {
      // Field names match the actual API wire format (snake_case from .NET SnakeCaseNamingStrategy)
      server.use(
        http.get(`${API_BASE}/dashboard/summary`, () =>
          HttpResponse.json({
            goals: {
              total: 10,
              active: 7,
              completed: 7,
              overdue: 2,
              completion_rate: 70.0,
            },
            feedback: {
              total_received: 8,
              pending_requests: 1,
              average_rating: 4.5,
              recent_count: 3,
            },
            skills: {
              total_skills: 12,
              assessed_skills: 9,
              assessment_progress: 75.0,
              average_level: 3.0,
            },
            activity: {
              total_activities: 20,
              recent_activities: 6,
            },
          })
        )
      )
      renderPage()
      await waitFor(() => {
        // goals.completed (field name is same in both snake_case and camelCase) = 7
        // Verifies the value flows from the API response through the transformation to the stat card,
        // not from a hardcoded default (0).
        expect(screen.getByText('7')).toBeInTheDocument()
      })
    })

    it('renders the Goals Completed stat card label', async () => {
      renderPage()
      await waitFor(() => {
        expect(screen.getByText(/goals completed/i)).toBeInTheDocument()
      })
    })

    it('renders the Feedback Received stat card label', async () => {
      renderPage()
      await waitFor(() => {
        expect(screen.getByText(/feedback received/i)).toBeInTheDocument()
      })
    })

    it('renders the Skills Assessed stat card label', async () => {
      renderPage()
      await waitFor(() => {
        expect(screen.getByText(/skills assessed/i)).toBeInTheDocument()
      })
    })
  })

  describe('error state', () => {
    it('still renders the page title when summary API fails', async () => {
      server.use(
        http.get(`${API_BASE}/dashboard/summary`, () =>
          HttpResponse.json({ error: 'Server Error' }, { status: 500 })
        )
      )
      renderPage()
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
      })
      // Stat cards fall back to 0 on error — labels still present
      expect(screen.getByText(/goals completed/i)).toBeInTheDocument()
    })
  })
})
