/**
 * GoalSummaryWidget Unit Tests
 */

import { fireEvent, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GoalSummaryWidget } from '../../../components/dashboard/widgets/GoalSummaryWidget'
import { dashboardHandlers } from '../../../mocks/handlers/dashboardHandlers'
import { server } from '../../../mocks/server'
import { renderWithRouter } from '../../utils'

// Mock Chart.js to avoid canvas rendering issues
interface ChartProps {
  data: unknown
}

vi.mock('react-chartjs-2', () => ({
  Line: ({ data }: ChartProps) => (
    <div data-testid='line-chart' data-chart-data={JSON.stringify(data)}>
      Line Chart Mock
    </div>
  ),
}))

// Mock navigation
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Setup MSW handlers for this test suite
beforeEach(() => {
  vi.clearAllMocks()
  server.use(...dashboardHandlers)
})

describe('GoalSummaryWidget', () => {
  it('renders loading state initially', () => {
    renderWithRouter(<GoalSummaryWidget />)

    // Should show skeleton loading elements (MUI Skeleton components)
    const skeletons = document.querySelectorAll('.MuiSkeleton-root')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders goals summary data correctly', async () => {
    renderWithRouter(<GoalSummaryWidget />)

    await waitFor(() => {
      expect(screen.getByText('Goal Summary')).toBeInTheDocument()
    })

    // Check statistics on the Chart tab
    expect(screen.getByText('5')).toBeInTheDocument() // Active goals
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument() // Completed goals
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument() // Overdue goals
    expect(screen.getByText('Overdue')).toBeInTheDocument()
  })

  it('switches between Chart and Goals tabs', async () => {
    renderWithRouter(<GoalSummaryWidget />)

    await waitFor(() => {
      expect(screen.getByText('Goal Summary')).toBeInTheDocument()
    })

    // Initially on Chart tab
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()

    // Switch to Goals tab
    fireEvent.click(screen.getByRole('tab', { name: 'Goals' }))

    // Should show goals in the list view
    await waitFor(() => {
      expect(screen.getByText('Improve API Design Skills')).toBeInTheDocument()
      expect(
        screen.getByText('Learn Advanced React Patterns')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Learn Docker Containerization')
      ).toBeInTheDocument()
      expect(screen.getByText('Mentor Junior Developers')).toBeInTheDocument()
    })
  })

  it('displays chart data correctly', async () => {
    renderWithRouter(<GoalSummaryWidget />)

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    const chartElement = screen.getByTestId('line-chart')
    const chartData = JSON.parse(
      chartElement.getAttribute('data-chart-data') || '{}'
    )

    expect(chartData.datasets).toHaveLength(2) // Should have two datasets
  })

  it('switches to Goals tab and shows goals list', async () => {
    renderWithRouter(<GoalSummaryWidget />)

    await waitFor(() => {
      expect(screen.getByText('Goal Summary')).toBeInTheDocument()
    })

    // Switch to Goals tab
    fireEvent.click(screen.getByRole('tab', { name: 'Goals' }))

    // Should show goals in the list view
    await waitFor(() => {
      expect(screen.getByText('Improve API Design Skills')).toBeInTheDocument()
    })

    expect(
      screen.getByText('Learn Advanced React Patterns')
    ).toBeInTheDocument()
  })

  it('handles API error gracefully', async () => {
    server.use(
      http.get('*/api/dashboard/goals-summary', () => {
        return HttpResponse.json({ message: 'Server Error' }, { status: 500 })
      })
    )

    renderWithRouter(<GoalSummaryWidget />)

    await waitFor(() => {
      expect(screen.getByText(/Failed to load/)).toBeInTheDocument()
    })
  })

  it('shows both Chart and Goals tabs', async () => {
    renderWithRouter(<GoalSummaryWidget />)

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Chart' })).toBeInTheDocument()
    })

    expect(screen.getByRole('tab', { name: 'Goals' })).toBeInTheDocument()
  })

  it('AC-012 — overdue goals are visually distinguished with an Overdue chip', async () => {
    server.use(
      http.get('*/api/dashboard/goals-summary', () =>
        HttpResponse.json({
          statistics: {
            total: 2,
            active: 1,
            completed: 0,
            overdue: 1,
            completionRate: 0,
            averageProgress: 0,
          },
          recentGoals: [
            {
              id: 'goal-overdue-1',
              title: 'Overdue Goal',
              status: 'active',
              progress: 0.3,
              isOverdue: true,
              deadline: new Date(Date.now() - 86400000).toISOString(),
            },
            {
              id: 'goal-active-1',
              title: 'On Track Goal',
              status: 'active',
              progress: 0.6,
              isOverdue: false,
              deadline: null,
            },
          ],
          progressTrend: [],
        })
      )
    )

    renderWithRouter(<GoalSummaryWidget />)

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Goals' })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('tab', { name: 'Goals' }))

    await waitFor(() => {
      expect(screen.getByText('Overdue Goal')).toBeInTheDocument()
      // Overdue goal should show the "Overdue" chip as visual distinction
      expect(screen.getByText('Overdue')).toBeInTheDocument()
    })

    // Non-overdue goal should NOT have the overdue chip
    expect(screen.getByText('On Track Goal')).toBeInTheDocument()
    const overdueChips = screen.queryAllByText('Overdue')
    expect(overdueChips).toHaveLength(1) // Only the overdue goal has the chip
  })

  it('AC-013 — shows empty state with Create Goal CTA when user has no goals', async () => {
    server.use(
      http.get('*/api/dashboard/goals-summary', () =>
        HttpResponse.json({
          statistics: {
            total: 0,
            active: 0,
            completed: 0,
            overdue: 0,
            completionRate: 0,
            averageProgress: 0,
          },
          recentGoals: [],
          progressTrend: [],
        })
      )
    )

    renderWithRouter(<GoalSummaryWidget />)

    // Switch to Goals tab
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Goals' })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('tab', { name: 'Goals' }))

    // Empty state message and CTA should appear
    await waitFor(() => {
      expect(screen.getByText(/no goals yet/i)).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /create goal/i })
      ).toBeInTheDocument()
    })
  })
})
