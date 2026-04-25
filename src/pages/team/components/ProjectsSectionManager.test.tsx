/**
 * ProjectsSectionManager Unit Tests (Feature 0010a)
 *
 * Covers:
 * - AC-040: Projects section renders project assignments
 * - AC-041: Current vs Past chip is shown correctly
 * - AC-042: Empty state when no project assignments
 * - Error state when API call fails
 * - Loading state shows spinner
 */

import { screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '../../../config/i18n'
import { teamHandlers } from '../../../mocks/handlers/teamHandlers'
import { server } from '../../../mocks/server'
import { ProjectsSectionManager } from './ProjectsSectionManager'

function renderComponent(employeeId = 'emp-001') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <ProjectsSectionManager employeeId={employeeId} />
      </I18nextProvider>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  server.use(...teamHandlers)
})

describe('ProjectsSectionManager', () => {
  // Loading state
  it('renders spinner while loading', () => {
    renderComponent()
    expect(
      document.querySelector('.MuiCircularProgress-root')
    ).toBeInTheDocument()
  })

  // AC-040: Project name rendered
  it('renders project names after data loads', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Alpha Project')).toBeInTheDocument()
    })
    expect(screen.getByText('Beta Initiative')).toBeInTheDocument()
  })

  // AC-040: Role is rendered
  it('renders project roles', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Developer')).toBeInTheDocument()
    })
    expect(screen.getByText('Tech Lead')).toBeInTheDocument()
  })

  // AC-041: Current chip for active projects
  it('renders Current chip for is_current projects', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Current')).toBeInTheDocument()
    })
  })

  // AC-041: Past chip for inactive projects
  it('renders Past chip for non-current projects', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Past')).toBeInTheDocument()
    })
  })

  // AC-042: Empty state
  it('renders empty state when no project assignments', async () => {
    server.use(
      http.get('*/api/employees/:employeeId/project-assignments', () =>
        HttpResponse.json([])
      )
    )

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('No project assignments.')).toBeInTheDocument()
    })
  })

  // Error state
  it('renders error alert when API call fails', async () => {
    server.use(
      http.get('*/api/employees/:employeeId/project-assignments', () =>
        HttpResponse.json({ message: 'Server Error' }, { status: 500 })
      )
    )

    renderComponent()

    await waitFor(() => {
      // Translation key 'team_dashboard.projects_section.error' = 'Failed to load project assignments.'
      expect(
        screen.getByText('Failed to load project assignments.')
      ).toBeInTheDocument()
    })
  })

  // Section title
  it('renders projects section title', async () => {
    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Projects')).toBeInTheDocument()
    })
  })
})
