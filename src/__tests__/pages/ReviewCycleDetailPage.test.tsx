import { screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { server } from '../../mocks/server'
import ReviewCycleDetailPage from '../../pages/reviews/ReviewCycleDetailPage'
import { mockReviewCycles } from '../../mocks/data/reviewCyclesMockData'
import { renderWithProviders } from '../../tests/utils'

// Use the in-progress cycle from mock data (index 1) which has nominees
const IN_PROGRESS_CYCLE = mockReviewCycles[1]
const CLOSED_CYCLE = mockReviewCycles[2]

function renderDetailPage(
  cycleId: string,
  userType: 'admin' | 'employee' = 'admin'
) {
  return renderWithProviders(
    <MemoryRouter initialEntries={[`/reviews/${cycleId}`]}>
      <Routes>
        <Route path='/reviews/:id' element={<ReviewCycleDetailPage />} />
      </Routes>
    </MemoryRouter>,
    { contextOptions: { userType } }
  )
}

describe('ReviewCycleDetailPage', () => {
  beforeEach(() => server.listen({ onUnhandledRequest: 'warn' }))
  afterEach(() => {
    server.resetHandlers()
    server.close()
  })

  it('renders cycle title and status badge', async () => {
    renderDetailPage(IN_PROGRESS_CYCLE.id)
    await waitFor(() => {
      expect(screen.queryByText(IN_PROGRESS_CYCLE.title)).not.toBeNull()
    })
    // Status badge chip should be rendered
    const chips = document.querySelectorAll('.MuiChip-root')
    expect(chips.length).toBeGreaterThan(0)
  })

  it('renders nominees section', async () => {
    renderDetailPage(IN_PROGRESS_CYCLE.id)
    await waitFor(() => {
      expect(screen.queryByText(/nominees/i)).not.toBeNull()
    })
  })

  it('shows 404 alert for unknown cycle id', async () => {
    server.use(
      http.get('*/api/review-cycles/:id', () =>
        HttpResponse.json(
          { error: { code: 'not_found', message: 'Not found' } },
          { status: 404 }
        )
      )
    )
    renderDetailPage('00000000-0000-0000-0000-000000000000', 'employee')
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeNull()
    })
  })

  it('shows results section for closed cycle', async () => {
    renderDetailPage(CLOSED_CYCLE.id)
    await waitFor(() => {
      // Results section rendered — either aggregated or detailed title
      const hasResults =
        screen.queryByText(/feedback results/i) ??
        screen.queryByText(/360 feedback/i)
      expect(hasResults).not.toBeNull()
    })
  })
})

describe('NomineePanel status transitions (Director view)', () => {
  beforeEach(() => server.listen({ onUnhandledRequest: 'warn' }))
  afterEach(() => {
    server.resetHandlers()
    server.close()
  })

  it('shows Open for Nominations button for Draft cycle', async () => {
    const DRAFT_CYCLE = mockReviewCycles[0]
    renderDetailPage(DRAFT_CYCLE.id)
    await waitFor(() => {
      expect(screen.queryByText(/open for nominations/i)).not.toBeNull()
    })
  })

  it('shows Start Review button for Open cycle', async () => {
    // Temporarily override the cycle to be OPEN status via MSW override
    server.use(
      http.get('*/api/review-cycles/:id', () =>
        HttpResponse.json({
          data: { ...IN_PROGRESS_CYCLE, status: 'open', started_at: null },
          success: true,
          message: 'OK',
        })
      )
    )
    renderDetailPage(IN_PROGRESS_CYCLE.id)
    await waitFor(() => {
      expect(screen.queryByText(/start review/i)).not.toBeNull()
    })
  })
})
