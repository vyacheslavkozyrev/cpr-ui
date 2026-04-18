/**
 * TeamMemberDashboardPage Unit Tests (Feature 0010a)
 *
 * Covers:
 * - Section headings are rendered (Goals, Feedback Received, Skills, Projects)
 * - Back button is present
 * - Missing employeeId shows error alert
 */

import { screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '../../config/i18n'
import { teamHandlers } from '../../mocks/handlers/teamHandlers'
import { server } from '../../mocks/server'
import TeamMemberDashboardPage from './TeamMemberDashboardPage'

function renderWithEmployeeId(employeeId: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={[`/team/${employeeId}`]}>
          <Routes>
            <Route
              path='/team/:employeeId'
              element={<TeamMemberDashboardPage />}
            />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  server.use(...teamHandlers)
})

describe('TeamMemberDashboardPage', () => {
  it('renders Goals section heading', async () => {
    renderWithEmployeeId('emp-001')

    await waitFor(() => {
      expect(screen.getByText('Goals')).toBeInTheDocument()
    })
  })

  it('renders Feedback Received section heading', async () => {
    renderWithEmployeeId('emp-001')

    await waitFor(() => {
      // Translation key 'team_dashboard.feedback_section.title' = 'Feedback'
      expect(screen.getByText('Feedback')).toBeInTheDocument()
    })
  })

  it('renders Skills section heading', async () => {
    renderWithEmployeeId('emp-001')

    await waitFor(() => {
      expect(screen.getByText('Skills')).toBeInTheDocument()
    })
  })

  it('renders Projects section heading', async () => {
    renderWithEmployeeId('emp-001')

    await waitFor(() => {
      expect(screen.getByText('Projects')).toBeInTheDocument()
    })
  })

  it('renders back button', async () => {
    renderWithEmployeeId('emp-001')

    await waitFor(() => {
      expect(screen.getByLabelText('Back')).toBeInTheDocument()
    })
  })

  it('shows member name when team data is loaded', async () => {
    renderWithEmployeeId('emp-001')

    await waitFor(() => {
      // Alice Johnson is emp-001 in the mock data
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    })
  })

  it('shows placeholder when member not found in team data', async () => {
    server.use(http.get('*/api/me/team', () => HttpResponse.json({ data: [] })))

    renderWithEmployeeId('unknown-emp')

    await waitFor(() => {
      // Avatar shows '?' when member not found
      expect(screen.getByText('?')).toBeInTheDocument()
    })
  })
})
