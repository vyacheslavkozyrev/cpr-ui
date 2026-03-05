import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import ReviewRequestsPage from '../../pages/reviews/ReviewRequestsPage'
import AggregatedResultsView from '../../components/ReviewCycles/AggregatedResultsView'
import DetailedResultsView from '../../components/ReviewCycles/DetailedResultsView'
import {
  mockAggregatedResults,
  mockDetailedResults,
} from '../../mocks/data/reviewCyclesMockData'
import { renderWithProviders } from '../../tests/utils'

describe('ReviewRequestsPage', () => {
  beforeEach(() => server.listen({ onUnhandledRequest: 'warn' }))
  afterEach(() => {
    server.resetHandlers()
    server.close()
  })

  it('renders page title', async () => {
    renderWithProviders(<ReviewRequestsPage />, {
      contextOptions: { includeRouter: true, userType: 'employee' },
    })
    expect(await screen.findByText(/review requests/i)).toBeInTheDocument()
  })

  it('renders pending review request cards from MSW mock', async () => {
    renderWithProviders(<ReviewRequestsPage />, {
      contextOptions: { includeRouter: true, userType: 'employee' },
    })
    await waitFor(() => {
      const submitButtons = screen.queryAllByRole('button', {
        name: /submit feedback/i,
      })
      expect(submitButtons.length).toBeGreaterThan(0)
    })
  })

  it('renders empty state when no review requests exist', async () => {
    server.use(
      http.get('*/api/me/review-requests', () => HttpResponse.json([]))
    )
    renderWithProviders(<ReviewRequestsPage />, {
      contextOptions: { includeRouter: true, userType: 'employee' },
    })
    expect(
      await screen.findByText(/no pending review requests/i)
    ).toBeInTheDocument()
  })

  it('Submit Feedback button navigates to the cycle detail page', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ReviewRequestsPage />, {
      contextOptions: { includeRouter: true, userType: 'employee' },
    })
    const buttons = await screen.findAllByRole('button', {
      name: /submit feedback/i,
    })
    await user.click(buttons[0])
    // After clicking, URL should change to /reviews/:cycle_id (BrowserRouter updates location)
    expect(window.location.pathname).toMatch(/^\/reviews\//)
  })
})

describe('AggregatedResultsView', () => {
  it('renders average rating and comments without reviewer names', () => {
    renderWithProviders(
      <AggregatedResultsView results={mockAggregatedResults} />
    )
    // Average rating value should appear
    expect(
      screen.getByText(
        new RegExp(mockAggregatedResults.average_rating.toFixed(1))
      )
    ).toBeInTheDocument()
    // Comments should be visible
    mockAggregatedResults.comments.forEach(item => {
      expect(screen.getByText(item.comments)).toBeInTheDocument()
    })
    // No "reviewer" column header (anonymous view)
    expect(screen.queryByText(/reviewer/i)).toBeNull()
  })

  it('renders response count', () => {
    renderWithProviders(
      <AggregatedResultsView results={mockAggregatedResults} />
    )
    // Match the response count as part of the summary line "X.X — N responses"
    const matches = screen.getAllByText(
      new RegExp(`${mockAggregatedResults.response_count}`)
    )
    expect(matches.length).toBeGreaterThan(0)
  })
})

describe('DetailedResultsView', () => {
  it('renders reviewer display names in each row', () => {
    renderWithProviders(<DetailedResultsView results={mockDetailedResults} />)
    mockDetailedResults.responses.forEach(r => {
      expect(screen.getByText(r.reviewer_display_name)).toBeInTheDocument()
    })
  })

  it('renders Reviewer column header', () => {
    renderWithProviders(<DetailedResultsView results={mockDetailedResults} />)
    expect(screen.getByText(/reviewer/i)).toBeInTheDocument()
  })
})
