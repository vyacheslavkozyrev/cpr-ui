/**
 * TeamListPage Unit Tests (Feature 0010a)
 *
 * Covers:
 * - Loading state renders spinner
 * - Loaded state renders team member cards
 * - Empty state message when no direct reports
 * - Error state renders alert
 */

import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { teamHandlers } from '../../mocks/handlers/teamHandlers'
import { server } from '../../mocks/server'
import { renderWithRouter } from '../../tests/utils'
import TeamListPage from './TeamListPage'

beforeEach(() => {
  server.use(...teamHandlers)
})

describe('TeamListPage', () => {
  it('renders loading spinner initially', () => {
    renderWithRouter(<TeamListPage />)
    // MUI CircularProgress renders as role="progressbar"
    expect(
      document.querySelector('.MuiCircularProgress-root')
    ).toBeInTheDocument()
  })

  it('renders team member cards after data loads', async () => {
    renderWithRouter(<TeamListPage />)

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    })
    expect(screen.getByText('Bob Williams')).toBeInTheDocument()
  })

  it('renders page title', async () => {
    renderWithRouter(<TeamListPage />)

    await waitFor(() => {
      expect(screen.getByText('My Team')).toBeInTheDocument()
    })
  })

  it('renders empty state when no direct reports', async () => {
    server.use(http.get('*/api/me/team', () => HttpResponse.json({ data: [] })))

    renderWithRouter(<TeamListPage />)

    await waitFor(() => {
      expect(screen.getByText('No direct reports found.')).toBeInTheDocument()
    })
  })

  it('renders error alert when API call fails', async () => {
    server.use(
      http.get('*/api/me/team', () =>
        HttpResponse.json({ message: 'Server Error' }, { status: 500 })
      )
    )

    renderWithRouter(<TeamListPage />)

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load team members.')
      ).toBeInTheDocument()
    })
  })
})
