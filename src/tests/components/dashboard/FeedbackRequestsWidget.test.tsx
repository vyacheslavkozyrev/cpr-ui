/**
 * Unit tests for FeedbackRequestsWidget
 * Feature 0013 — Personal Performance Dashboard
 * Covers: AC-019, AC-020, AC-021
 */

import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { FeedbackRequestsWidget } from '../../../components/dashboard/widgets/FeedbackRequestsWidget'
import { server } from '../../../mocks/server'
import { renderWithRouter } from '../../utils'

// PaginatedFeedbackRequestsDto shape matching the global feedbackRequestHandlers response
const mockTodoWithPending = {
  data: [],
  pagination: {
    page: 1,
    page_size: 1,
    total_items: 3,
    total_pages: 3,
    has_previous: false,
    has_next: true,
  },
  summary: {
    total_active: 3,
    pending_count: 3,
    partial_count: 0,
    complete_count: 0,
    overdue_count: 0,
  },
}

const mockTodoEmpty = {
  data: [],
  pagination: {
    page: 1,
    page_size: 1,
    total_items: 0,
    total_pages: 0,
    has_previous: false,
    has_next: false,
  },
  summary: {
    total_active: 0,
    pending_count: 0,
    partial_count: 0,
    complete_count: 0,
    overdue_count: 0,
  },
}

describe('FeedbackRequestsWidget', () => {
  describe('AC-019 — shows pending request count', () => {
    it('renders the pending feedback request count from the API', async () => {
      server.use(
        http.get('*/api/me/feedback/request/todo', () =>
          HttpResponse.json(mockTodoWithPending)
        )
      )
      renderWithRouter(<FeedbackRequestsWidget />)
      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument()
      })
    })
  })

  describe('AC-020 — "View Requests" button present when pending > 0', () => {
    it('renders a View Requests button when there are pending requests', async () => {
      server.use(
        http.get('*/api/me/feedback/request/todo', () =>
          HttpResponse.json(mockTodoWithPending)
        )
      )
      renderWithRouter(<FeedbackRequestsWidget />)
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /view all requests/i })
        ).toBeInTheDocument()
      })
    })

    it('View Requests button click navigates to the feedback requests page', async () => {
      const user = userEvent.setup()
      server.use(
        http.get('*/api/me/feedback/request/todo', () =>
          HttpResponse.json(mockTodoWithPending)
        )
      )
      renderWithRouter(<FeedbackRequestsWidget />)
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /view all requests/i })
        ).toBeInTheDocument()
      })
      await user.click(
        screen.getByRole('button', { name: /view all requests/i })
      )
    })
  })

  describe('AC-021 — no pending requests shows "all caught up" message', () => {
    it('shows all-caught-up message when pending count is zero', async () => {
      server.use(
        http.get('*/api/me/feedback/request/todo', () =>
          HttpResponse.json(mockTodoEmpty)
        )
      )
      renderWithRouter(<FeedbackRequestsWidget />)
      await waitFor(() => {
        expect(
          screen.getByText(/no pending feedback requests/i)
        ).toBeInTheDocument()
      })
    })

    it('does not show the View Requests button when there are no pending requests', async () => {
      server.use(
        http.get('*/api/me/feedback/request/todo', () =>
          HttpResponse.json(mockTodoEmpty)
        )
      )
      renderWithRouter(<FeedbackRequestsWidget />)
      await waitFor(() => {
        expect(
          screen.getByText(/no pending feedback requests/i)
        ).toBeInTheDocument()
      })
      expect(
        screen.queryByRole('button', { name: /view all requests/i })
      ).not.toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('shows skeleton while data is loading', () => {
      server.use(
        http.get('*/api/me/feedback/request/todo', async () => {
          await new Promise(resolve => setTimeout(resolve, 500))
          return HttpResponse.json(mockTodoWithPending)
        })
      )
      renderWithRouter(<FeedbackRequestsWidget />)
      const skeletons = document.querySelectorAll('.MuiSkeleton-root')
      expect(skeletons.length).toBeGreaterThan(0)
    })
  })
})
