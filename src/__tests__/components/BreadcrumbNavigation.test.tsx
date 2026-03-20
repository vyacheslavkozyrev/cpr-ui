import { screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { server } from '../../mocks/server'
import { BreadcrumbNavigation } from '../../components/layout/BreadcrumbNavigation'
import { renderWithProviders } from '../../tests/utils'

// Translation values from public/locales/en/translation.json
// pages.feedback.tabs.reviews360 = "360 Reviews"
// pages.reviewCycleDetail.title = "Review Details"
// navigation.feedback = "Feedback"

describe('BreadcrumbNavigation', () => {
  beforeEach(() => server.listen({ onUnhandledRequest: 'warn' }))
  afterEach(() => {
    server.resetHandlers()
    server.close()
  })

  it('renders "360 Reviews" label for the reviews segment and links to /feedback', () => {
    renderWithProviders(
      <MemoryRouter
        initialEntries={['/reviews/cycle-0002-0000-0000-000000000002']}
      >
        <BreadcrumbNavigation />
      </MemoryRouter>
    )

    // The "reviews" segment should render as "360 Reviews" and link to /feedback
    const reviewsLink = screen.queryByText('360 Reviews')
    expect(reviewsLink).not.toBeNull()
  })

  it('renders "Review Details" label for a UUID-like segment under reviews', async () => {
    // Use a proper UUID (all hex chars + dashes) so isIdSegment() matches it
    // cycle-0002-... fails because 'y','l' are not hex chars; use a real UUID instead
    const REAL_UUID = 'aabb0002-0000-0000-0000-000000000002'
    renderWithProviders(
      <MemoryRouter initialEntries={[`/reviews/${REAL_UUID}`]}>
        <BreadcrumbNavigation />
      </MemoryRouter>
    )

    // The UUID segment under "reviews" should render the detail title (pages.reviewCycleDetail.title)
    await waitFor(() => {
      expect(screen.queryByText('Review Details')).not.toBeNull()
    })
  })

  it('renders "Feedback" label for /feedback route', () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/feedback']}>
        <BreadcrumbNavigation />
      </MemoryRouter>
    )

    // "feedback" segment label comes from navigation.feedback = "Feedback"
    const feedbackLabel = screen.queryByText('Feedback')
    expect(feedbackLabel).not.toBeNull()
  })

  it('returns null on /dashboard (no breadcrumbs shown)', () => {
    const { container } = renderWithProviders(
      <MemoryRouter initialEntries={['/dashboard']}>
        <BreadcrumbNavigation />
      </MemoryRouter>
    )

    expect(container.firstChild).toBeNull()
  })

  it('reviews segment link points to /feedback', () => {
    renderWithProviders(
      <MemoryRouter
        initialEntries={['/reviews/cycle-0002-0000-0000-000000000002']}
      >
        <BreadcrumbNavigation />
      </MemoryRouter>
    )

    const reviewsLink = screen.queryByText('360 Reviews')
    expect(reviewsLink).not.toBeNull()
    // The link should have href pointing to /feedback
    const anchor = reviewsLink?.closest('a')
    expect(anchor?.getAttribute('href')).toBe('/feedback')
  })
})
