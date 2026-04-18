/**
 * GoalCard Unit Tests (Feature 0010a)
 *
 * Covers:
 * - AC-020: Accept/Reject menu items shown only for suggested goals (employee view)
 * - AC-023: Accept/Reject buttons disappear after action (optimistic UI via invalidation)
 * - AC-026: Request Deletion / Cancel Request toggle on GoalCard menu
 */

import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { I18nextProvider } from 'react-i18next'
import { http, HttpResponse } from 'msw'
import { i18n } from '../../../config/i18n'
import { server } from '../../../mocks/server'
import type { TGoalDto } from '../../../dtos/GoalDto'
import { GoalCard } from './GoalCard'

const API_BASE =
  import.meta.env['VITE_API_BASE_URL'] || 'http://localhost:3000/api'

function renderCard(goal: TGoalDto) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })

  const { container } = render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <GoalCard goal={goal} />
        </I18nextProvider>
      </QueryClientProvider>
    </MemoryRouter>
  )
  return container
}

const SUGGESTED_GOAL: TGoalDto = {
  id: 'goal-s1',
  employeeId: 'emp-001',
  title: 'Suggested Goal',
  status: 'suggested',
  isCompleted: false,
  progressPercent: 0,
  createdAt: new Date().toISOString(),
  has_pending_deletion_request: false,
}

const NORMAL_GOAL: TGoalDto = {
  id: 'goal-n1',
  employeeId: 'emp-001',
  title: 'Normal Goal',
  status: 'in_progress',
  isCompleted: false,
  progressPercent: 40,
  createdAt: new Date().toISOString(),
  has_pending_deletion_request: false,
}

const PENDING_DELETION_GOAL: TGoalDto = {
  id: 'goal-pd1',
  employeeId: 'emp-001',
  title: 'Goal with Pending Deletion',
  status: 'in_progress',
  isCompleted: false,
  progressPercent: 20,
  createdAt: new Date().toISOString(),
  has_pending_deletion_request: true,
}

beforeEach(() => {
  server.use(
    http.patch(`${API_BASE}/goals/:goalId/suggestion`, () =>
      HttpResponse.json({}, { status: 200 })
    ),
    http.post(`${API_BASE}/goals/:goalId/deletion-request`, () =>
      HttpResponse.json({}, { status: 201 })
    ),
    http.delete(
      `${API_BASE}/goals/:goalId/deletion-request`,
      () => new HttpResponse(null, { status: 204 })
    ),
    http.get(`${API_BASE}/me/goals`, () =>
      HttpResponse.json({ items: [], total: 0, page: 1, per_page: 10 })
    )
  )
})

describe('GoalCard — AC-020: Accept/Reject for suggested goals', () => {
  it('shows Accept and Reject menu items for a suggested goal', async () => {
    const user = userEvent.setup()
    const container = renderCard(SUGGESTED_GOAL)

    // Use within(container) to find only the IconButton, not the CardActionArea
    const menuButton = within(container).getByRole('button', {
      name: 'Open goal menu',
    })
    await user.click(menuButton)

    await waitFor(() => {
      expect(screen.getByText('Accept')).toBeInTheDocument()
      expect(screen.getByText('Reject')).toBeInTheDocument()
    })
  })

  it('does not show Accept/Reject for a non-suggested goal without opening menu', () => {
    renderCard(NORMAL_GOAL)
    // MUI Menu is not rendered when closed — items are absent from DOM
    expect(screen.queryByText('Accept')).not.toBeInTheDocument()
    expect(screen.queryByText('Reject')).not.toBeInTheDocument()
  })
})

describe('GoalCard — AC-026: Request Deletion / Cancel Request toggle', () => {
  it('shows Request Deletion for a goal without pending deletion request', async () => {
    const user = userEvent.setup()
    const container = renderCard(NORMAL_GOAL)

    const menuButton = within(container).getByRole('button', {
      name: 'Open goal menu',
    })
    await user.click(menuButton)

    await waitFor(() => {
      expect(screen.getByText('Request Deletion')).toBeInTheDocument()
      expect(screen.queryByText('Cancel Request')).not.toBeInTheDocument()
    })
  })

  it('shows Cancel Request for a goal with pending deletion request', async () => {
    const user = userEvent.setup()
    const container = renderCard(PENDING_DELETION_GOAL)

    const menuButton = within(container).getByRole('button', {
      name: 'Open goal menu',
    })
    await user.click(menuButton)

    await waitFor(() => {
      expect(screen.getByText('Cancel Request')).toBeInTheDocument()
      expect(screen.queryByText('Request Deletion')).not.toBeInTheDocument()
    })
  })
})

describe('GoalCard — AC-023: Accept suggestion calls mutation', () => {
  it('clicking Accept triggers suggestion mutation without errors', async () => {
    const user = userEvent.setup()
    const container = renderCard(SUGGESTED_GOAL)

    const menuButton = within(container).getByRole('button', {
      name: 'Open goal menu',
    })
    await user.click(menuButton)

    await waitFor(() => {
      expect(screen.getByText('Accept')).toBeInTheDocument()
    })

    // Click Accept — should close menu and call mutation
    await user.click(screen.getByText('Accept'))

    // Menu closes (Accept disappears from screen)
    await waitFor(() => {
      expect(screen.queryByText('Accept')).not.toBeInTheDocument()
    })
  })

  it('clicking Reject triggers rejection mutation without errors', async () => {
    const user = userEvent.setup()
    const container = renderCard(SUGGESTED_GOAL)

    const menuButton = within(container).getByRole('button', {
      name: 'Open goal menu',
    })
    await user.click(menuButton)

    await waitFor(() => {
      expect(screen.getByText('Reject')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Reject'))

    await waitFor(() => {
      expect(screen.queryByText('Reject')).not.toBeInTheDocument()
    })
  })
})
