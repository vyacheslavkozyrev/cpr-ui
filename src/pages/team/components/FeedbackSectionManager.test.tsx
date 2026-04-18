/**
 * FeedbackSectionManager Unit Tests (Feature 0010a)
 *
 * Covers:
 * - AC-034: Feedback section renders feedback items with comment text
 * - AC-035: Rating stars are rendered for each feedback entry
 * - AC-036: Empty state shown when no feedback
 * - Loading state shows spinner
 * - Items sorted newest first
 */

import { screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '../../../config/i18n'
import type { IManagerViewFeedback } from '../../../models/TeamMember'
import { FeedbackSectionManager } from './FeedbackSectionManager'

function renderComponent(feedback: IManagerViewFeedback[], isLoading = false) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <FeedbackSectionManager feedback={feedback} isLoading={isLoading} />
      </I18nextProvider>
    </QueryClientProvider>
  )
}

const OLDER_FEEDBACK: IManagerViewFeedback = {
  id: 'fb-001',
  rating: 3,
  comment: 'Good effort on delivery.',
  submittedById: 'user-a',
  submittedByName: 'Carol Davis',
  createdAt: new Date('2025-01-01T10:00:00Z'),
}

const NEWER_FEEDBACK: IManagerViewFeedback = {
  id: 'fb-002',
  rating: 5,
  comment: 'Excellent collaboration.',
  submittedById: 'user-b',
  submittedByName: 'David Brown',
  createdAt: new Date('2025-06-01T10:00:00Z'),
}

describe('FeedbackSectionManager', () => {
  it('renders feedback section title', () => {
    renderComponent([OLDER_FEEDBACK])
    // Translation key 'team_dashboard.feedback_section.title' = 'Feedback'
    expect(screen.getByText('Feedback')).toBeInTheDocument()
  })

  // AC-034: Feedback comment text is rendered
  it('renders feedback comment', () => {
    renderComponent([OLDER_FEEDBACK])
    expect(screen.getByText('Good effort on delivery.')).toBeInTheDocument()
  })

  // AC-034: Submitter name is shown
  it('renders submitter name', () => {
    renderComponent([OLDER_FEEDBACK])
    expect(screen.getByText(/Carol Davis/)).toBeInTheDocument()
  })

  // AC-035: Rating is rendered (MUI Rating uses aria-label)
  it('renders rating component for each feedback entry', () => {
    renderComponent([OLDER_FEEDBACK])
    // MUI Rating renders with role="img" or individual radio inputs
    const ratingEl = document.querySelector('.MuiRating-root')
    expect(ratingEl).toBeInTheDocument()
  })

  // AC-036: Empty state when no feedback
  it('renders empty state when no feedback', () => {
    renderComponent([])
    expect(screen.getByText('No feedback received yet.')).toBeInTheDocument()
  })

  // Loading state
  it('renders spinner when isLoading is true', () => {
    renderComponent([], true)
    expect(
      document.querySelector('.MuiCircularProgress-root')
    ).toBeInTheDocument()
  })

  // Items sorted newest first
  it('renders newer feedback before older feedback', () => {
    renderComponent([OLDER_FEEDBACK, NEWER_FEEDBACK])
    const comments = screen.getAllByText(/effort|collaboration/)
    // Newer ("Excellent collaboration") should appear first in the DOM
    expect(comments[0]).toHaveTextContent('Excellent collaboration.')
    expect(comments[1]).toHaveTextContent('Good effort on delivery.')
  })

  // Multiple entries rendered
  it('renders all feedback entries', () => {
    renderComponent([OLDER_FEEDBACK, NEWER_FEEDBACK])
    expect(screen.getByText('Good effort on delivery.')).toBeInTheDocument()
    expect(screen.getByText('Excellent collaboration.')).toBeInTheDocument()
  })
})
