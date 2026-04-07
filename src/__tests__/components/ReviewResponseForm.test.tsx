import { screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { server } from '../../mocks/server'
import ReviewResponseForm from '../../components/ReviewCycles/ReviewResponseForm'
import {
  EReviewCycleStatus,
  EReviewNomineeStatus,
  type IReviewCycleDetail,
  type IReviewNominee,
} from '../../types/reviewCycle.types'
import { renderWithProviders } from '../../tests/utils'

// Translation values from public/locales/en/translation.json:
// components.reviewResponseForm.title            = "Submit Your Review"
// components.reviewResponseForm.reviewingLabel   = "You are reviewing"
// components.reviewResponseForm.alreadySubmittedTitle = "Feedback Submitted"
// components.reviewResponseForm.notAccepting     = "This cycle is not currently accepting responses."
// components.reviewResponseForm.submitError      = "Submission failed. Please try again."

// Shared mutation mock state — mutated per test
const mutationMockState = {
  isError: false,
  isPending: false,
  mutateAsync: vi.fn().mockResolvedValue({}),
}

// Top-level vi.mock so Vitest hoists it properly.
// Controls isError via the shared mutationMockState object.
vi.mock('../../hooks/useReviewCycles', async importOriginal => {
  const actual =
    await importOriginal<typeof import('../../hooks/useReviewCycles')>()
  return {
    ...actual,
    useSubmitReviewResponse: (_cycleId: string) => ({
      mutateAsync: mutationMockState.mutateAsync,
      isPending: mutationMockState.isPending,
      isError: mutationMockState.isError,
      isSuccess: false,
      reset: vi.fn(),
    }),
  }
})

const mockCycleInProgress: IReviewCycleDetail = {
  id: 'cycle-0002-0000-0000-000000000002',
  title: 'Mid-Year Review — Alice Smith',
  description: null,
  subject_employee_id: 'aaaaaaaa-0001-0000-0000-000000000001',
  subject_display_name: 'Alice Smith',
  department_id: 'dddddddd-0001-0000-0000-000000000001',
  status: EReviewCycleStatus.IN_PROGRESS,
  nominee_count: 3,
  response_count: 1,
  opened_at: '2026-02-01T09:00:00Z',
  started_at: '2026-02-10T09:00:00Z',
  closed_at: null,
  created_at: '2026-01-20T09:00:00Z',
  created_by: 'aaaaaaaa-0099-0000-0000-000000000099',
}

const mockCycleDraft: IReviewCycleDetail = {
  ...mockCycleInProgress,
  status: EReviewCycleStatus.DRAFT,
}

const mockNomineeInvited: IReviewNominee = {
  id: 'nominee-0002-0000-0000-000000000002',
  cycle_id: 'cycle-0002-0000-0000-000000000002',
  reviewer_employee_id: 'c7746e91-a5e8-4f8b-9f22-f48374ffa2a4',
  reviewer_display_name: 'Eve Adams',
  nominated_by: 'aaaaaaaa-0099-0000-0000-000000000099',
  nominated_by_display_name: 'Director Dan',
  status: EReviewNomineeStatus.INVITED,
  created_at: '2026-02-01T10:05:00Z',
}

const mockNomineeSubmitted: IReviewNominee = {
  ...mockNomineeInvited,
  status: EReviewNomineeStatus.SUBMITTED,
}

describe('ReviewResponseForm', () => {
  beforeEach(() => {
    server.listen({ onUnhandledRequest: 'warn' })
    // Reset mock state to success defaults before each test
    mutationMockState.isError = false
    mutationMockState.isPending = false
    mutationMockState.mutateAsync = vi.fn().mockResolvedValue({})
  })
  afterEach(() => {
    server.resetHandlers()
    server.close()
    vi.clearAllMocks()
  })

  it('renders title and subject name when nominee is INVITED and cycle is IN_PROGRESS', async () => {
    renderWithProviders(
      <ReviewResponseForm
        cycle={mockCycleInProgress}
        nominee={mockNomineeInvited}
      />
    )

    await waitFor(() => {
      expect(screen.queryByText('Submit Your Review')).not.toBeNull()
    })
    expect(screen.queryByText('Alice Smith')).not.toBeNull()
  })

  it('shows the reviewing label with cycle subject_display_name', async () => {
    renderWithProviders(
      <ReviewResponseForm
        cycle={mockCycleInProgress}
        nominee={mockNomineeInvited}
      />
    )

    // The label text "You are reviewing:" and the subject name "Alice Smith" appear together
    await waitFor(() => {
      const bodyText = document.body.textContent ?? ''
      expect(bodyText).toContain('You are reviewing')
      expect(bodyText).toContain('Alice Smith')
    })
  })

  it('shows "already submitted" state when nominee status is SUBMITTED', async () => {
    renderWithProviders(
      <ReviewResponseForm
        cycle={mockCycleInProgress}
        nominee={mockNomineeSubmitted}
      />
    )

    await waitFor(() => {
      expect(screen.queryByText('Feedback Submitted')).not.toBeNull()
    })
  })

  it('shows "not accepting" when cycle status is not IN_PROGRESS', async () => {
    renderWithProviders(
      <ReviewResponseForm cycle={mockCycleDraft} nominee={mockNomineeInvited} />
    )

    await waitFor(() => {
      expect(
        screen.queryByText('This cycle is not currently accepting responses.')
      ).not.toBeNull()
    })
  })

  it('shows submit error alert text when mutation is in error state', async () => {
    // Set the mock to simulate a failed mutation state
    mutationMockState.isError = true
    mutationMockState.mutateAsync = vi.fn().mockResolvedValue({})

    renderWithProviders(
      <ReviewResponseForm
        cycle={mockCycleInProgress}
        nominee={mockNomineeInvited}
      />
    )

    await waitFor(() => {
      expect(
        screen.queryByText('Submission failed. Please try again.')
      ).not.toBeNull()
    })
  })
})
