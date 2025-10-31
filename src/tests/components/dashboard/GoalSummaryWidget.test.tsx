/**
 * GoalSummaryWidget Unit Tests
 */

import { fireEvent, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GoalSummaryWidget } from '../../../components/dashboard/widgets/GoalSummaryWidget'
import { server } from '../../../mocks/server'
import { renderWithRouter } from '../../utils'
import { mockGoalsSummary } from './test-utils'

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
  server.use(
    http.get('*/api/dashboard/goals-summary', () => {
      return HttpResponse.json(mockGoalsSummary)
    })
  )
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
      expect(screen.getByText('Goals Summary')).toBeInTheDocument()
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
      expect(screen.getByText('Goals Summary')).toBeInTheDocument()
    })

    // Initially on Chart tab
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()

    // Switch to Goals tab
    fireEvent.click(screen.getByRole('tab', { name: 'Goals' }))

    // Should show more goals in the list view
    await waitFor(() => {
      expect(screen.getByText('Created: 11/1/2024')).toBeInTheDocument()
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
      expect(screen.getByText('Goals Summary')).toBeInTheDocument()
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
})
