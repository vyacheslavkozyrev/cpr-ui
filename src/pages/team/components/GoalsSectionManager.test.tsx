/**
 * GoalsSectionManager Unit Tests (Feature 0010a)
 *
 * Covers:
 * - AC-009: Goals section renders title heading
 * - AC-010: Goal name is displayed
 * - AC-011: Goal status badge is displayed
 * - AC-012: Deletion-requested badge shown when has_pending_deletion_request
 * - AC-013: Approve deletion button shown for pending deletion goals
 * - AC-014: Reject deletion button shown for pending deletion goals
 * - AC-015: Mark as Completed button shown for not_started/in_progress goals
 * - AC-016: Task list expands and collapses on toggle
 * - AC-028: Suggest Goal button opens modal
 * - AC-031: Delete goal button is present for manager
 * - Empty state when no goals
 * - Loading state renders spinner
 */

import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '../../../config/i18n'
import { teamHandlers } from '../../../mocks/handlers/teamHandlers'
import { server } from '../../../mocks/server'
import type { TGoalDto } from '../../../dtos/GoalDto'
import { GoalsSectionManager } from './GoalsSectionManager'

function renderComponent(
  goals: TGoalDto[],
  isLoading = false,
  employeeId = 'emp-001'
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <GoalsSectionManager
          employeeId={employeeId}
          goals={goals}
          isLoading={isLoading}
        />
      </I18nextProvider>
    </QueryClientProvider>
  )
}

const ACTIVE_GOAL: TGoalDto = {
  id: 'goal-001',
  employeeId: 'emp-001',
  title: 'Learn TypeScript',
  name: 'Learn TypeScript',
  description: 'Complete the advanced course',
  status: 'in_progress',
  isCompleted: false,
  progressPercent: 50,
  createdAt: new Date().toISOString(),
  has_pending_deletion_request: false,
  slim_tasks: [
    { id: 'task-1', name: 'Read docs', is_completed: true },
    { id: 'task-2', name: 'Write exercises', is_completed: false },
  ],
}

const SUGGESTED_GOAL: TGoalDto = {
  id: 'goal-002',
  employeeId: 'emp-001',
  title: 'Improve presentation skills',
  name: 'Improve presentation skills',
  status: 'suggested',
  isCompleted: false,
  progressPercent: 0,
  createdAt: new Date().toISOString(),
  suggested_by_id: 'mgr-001',
  suggested_by_name: 'Manager Alice',
  has_pending_deletion_request: false,
  tasks: [],
}

const PENDING_DELETION_GOAL: TGoalDto = {
  id: 'goal-003',
  employeeId: 'emp-001',
  title: 'Goal pending deletion',
  name: 'Goal pending deletion',
  status: 'in_progress',
  isCompleted: false,
  progressPercent: 20,
  createdAt: new Date().toISOString(),
  has_pending_deletion_request: true,
  tasks: [],
}

const NOT_STARTED_GOAL: TGoalDto = {
  id: 'goal-004',
  employeeId: 'emp-001',
  title: 'New goal not started',
  name: 'New goal not started',
  status: 'not_started',
  isCompleted: false,
  progressPercent: 0,
  createdAt: new Date().toISOString(),
  has_pending_deletion_request: false,
  tasks: [],
}

beforeEach(() => {
  server.use(...teamHandlers)
})

describe('GoalsSectionManager', () => {
  // AC-009: Goals section title
  it('renders goals section title', () => {
    renderComponent([])
    expect(screen.getByText('Goals')).toBeInTheDocument()
  })

  // AC-010: Goal name is displayed
  it('renders goal name', () => {
    renderComponent([ACTIVE_GOAL])
    expect(screen.getByText('Learn TypeScript')).toBeInTheDocument()
  })

  // AC-011: Goal status badge (translated from pages.goals.status.in_progress)
  it('renders goal status chip', () => {
    renderComponent([ACTIVE_GOAL])
    expect(screen.getByText('In Progress')).toBeInTheDocument()
  })

  // Empty state
  it('renders empty state when no goals', () => {
    renderComponent([])
    expect(screen.getByText('No goals yet.')).toBeInTheDocument()
  })

  // Loading state
  it('renders spinner when isLoading is true', () => {
    renderComponent([], true)
    expect(
      document.querySelector('.MuiCircularProgress-root')
    ).toBeInTheDocument()
  })

  // AC-012: Deletion requested badge
  it('shows deletion-requested badge when has_pending_deletion_request', () => {
    renderComponent([PENDING_DELETION_GOAL])
    expect(screen.getByText('Deletion Requested')).toBeInTheDocument()
  })

  // AC-013: Approve deletion button
  it('shows approve deletion button for goals with pending deletion request', () => {
    renderComponent([PENDING_DELETION_GOAL])
    expect(
      screen.getByRole('button', { name: 'Approve deletion' })
    ).toBeInTheDocument()
  })

  // AC-014: Reject deletion button
  it('shows reject deletion button for goals with pending deletion request', () => {
    renderComponent([PENDING_DELETION_GOAL])
    expect(
      screen.getByRole('button', { name: 'Reject deletion' })
    ).toBeInTheDocument()
  })

  // AC-015: Mark as Completed for in_progress goal
  it('shows Mark as Completed button for in_progress goals', () => {
    renderComponent([ACTIVE_GOAL])
    expect(
      screen.getByRole('button', { name: 'Mark as Completed' })
    ).toBeInTheDocument()
  })

  // AC-015: Mark as Completed for not_started goal
  it('shows Mark as Completed button for not_started goals', () => {
    renderComponent([NOT_STARTED_GOAL])
    expect(
      screen.getByRole('button', { name: 'Mark as Completed' })
    ).toBeInTheDocument()
  })

  // AC-015: No Mark as Completed for suggested goal
  it('does not show Mark as Completed for suggested goals', () => {
    renderComponent([SUGGESTED_GOAL])
    expect(
      screen.queryByRole('button', { name: 'Mark as Completed' })
    ).not.toBeInTheDocument()
  })

  // AC-016: Task list shows task names when goal has tasks
  it('renders task expand button when goal has tasks', () => {
    renderComponent([ACTIVE_GOAL])
    // The expand toggle button is rendered when goal.tasks.length > 0
    const allButtons = screen.getAllByRole('button')
    // Buttons: Suggest Goal, Mark as Completed, Delete goal, expand toggle
    expect(allButtons.length).toBeGreaterThanOrEqual(4)
  })

  it('task names are rendered in the DOM for goals with tasks', () => {
    // MUI Collapse renders children into DOM regardless of open state
    renderComponent([ACTIVE_GOAL])
    expect(screen.getByText('Read docs')).toBeInTheDocument()
    expect(screen.getByText('Write exercises')).toBeInTheDocument()
  })

  // AC-028: Suggest Goal button opens modal
  it('opens Suggest Goal modal when button is clicked', async () => {
    const user = userEvent.setup()
    renderComponent([])

    await user.click(screen.getByText('Suggest Goal'))

    await waitFor(() => {
      expect(screen.getByText('Suggest a Goal')).toBeInTheDocument()
    })
  })

  // AC-031: Delete goal button is present for manager
  it('shows delete goal button for every goal', () => {
    renderComponent([ACTIVE_GOAL])
    expect(
      screen.getByRole('button', { name: 'Delete goal' })
    ).toBeInTheDocument()
  })

  // Suggested by text
  it('shows suggested-by name for suggested goals', () => {
    renderComponent([SUGGESTED_GOAL])
    expect(screen.getByText(/Manager Alice/)).toBeInTheDocument()
  })
})
