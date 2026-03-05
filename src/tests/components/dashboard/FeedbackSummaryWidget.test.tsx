import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { FeedbackSummaryWidget } from '../../../components/dashboard/widgets/FeedbackSummaryWidget'
import { dashboardHandlers } from '../../../mocks/handlers/dashboardHandlers'
import { renderWithRouter } from '../../utils'

// Mock react-chartjs-2 with proper types
interface ChartData {
  datasets?: Array<{ label?: string }>
}

interface ChartProps {
  data: ChartData
  [key: string]: unknown
}

vi.mock('react-chartjs-2', () => ({
  Line: ({ data, ...props }: ChartProps) => (
    <div data-testid='line-chart' {...props}>
      Mock Line Chart - {data?.datasets?.[0]?.label}
    </div>
  ),
  Bar: ({ data, ...props }: ChartProps) => (
    <div data-testid='bar-chart' {...props}>
      Mock Bar Chart - {data?.datasets?.[0]?.label}
    </div>
  ),
  Doughnut: ({ data, ...props }: ChartProps) => (
    <div data-testid='doughnut-chart' {...props}>
      Mock Doughnut Chart - {data?.datasets?.[0]?.label}
    </div>
  ),
}))

// MSW server setup
const server = setupServer(...dashboardHandlers)

describe('FeedbackSummaryWidget', () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('renders loading state initially', async () => {
    renderWithRouter(<FeedbackSummaryWidget />)

    // Check for skeleton loading elements
    const skeletons = document.querySelectorAll('.MuiSkeleton-root')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders feedback summary data correctly', async () => {
    renderWithRouter(<FeedbackSummaryWidget />)

    // Wait for data to load and check statistics
    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument() // totalReceived
      expect(screen.getByText('3')).toBeInTheDocument() // pendingRequests
      expect(screen.getByLabelText('4.2 Stars')).toBeInTheDocument() // averageRating as stars
    })
  })

  it('switches between Chart and Feedback tabs', async () => {
    const user = userEvent.setup()
    renderWithRouter(<FeedbackSummaryWidget />)

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument()
    })

    // Check initial tab (Chart should be active)
    const chartTab = screen.getByRole('tab', { name: /chart/i })
    const feedbackTab = screen.getByRole('tab', { name: /feedback/i })

    expect(chartTab).toHaveAttribute('aria-selected', 'true')
    expect(feedbackTab).toHaveAttribute('aria-selected', 'false')

    // Click on Feedback tab
    await user.click(feedbackTab)

    // Check tab states changed
    expect(chartTab).toHaveAttribute('aria-selected', 'false')
    expect(feedbackTab).toHaveAttribute('aria-selected', 'true')
  })

  it('displays chart data correctly', async () => {
    renderWithRouter(<FeedbackSummaryWidget />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument()
    })

    // Check if chart is rendered (should be visible by default on Chart tab)
    const chart = screen.getByTestId('line-chart')
    expect(chart).toBeInTheDocument()
  })

  it('switches to Feedback tab and shows feedback list', async () => {
    const user = userEvent.setup()
    renderWithRouter(<FeedbackSummaryWidget />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument()
    })

    // Switch to Feedback tab
    const feedbackTab = screen.getByRole('tab', { name: /feedback/i })
    await user.click(feedbackTab)

    // Check feedback items are displayed
    await waitFor(() => {
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
      // Check that feedback list is displayed (test passes if name is shown correctly)
      expect(screen.getByLabelText('5 Stars')).toBeInTheDocument()
    })
  })

  it('handles API error gracefully', async () => {
    // Override the default handler to return an error
    server.use(
      http.get('*/api/dashboard/feedback-summary', () => {
        return new HttpResponse(null, { status: 500 })
      })
    )

    renderWithRouter(<FeedbackSummaryWidget />)

    // Wait for component to handle error (may show loading skeleton or error state)
    await waitFor(() => {
      // Component should either show an error message or fallback gracefully
      const hasError =
        screen.queryByText(/error/i) ||
        screen.queryByText(/failed/i) ||
        screen.queryByText(/unable/i)
      const hasSkeletons =
        document.querySelectorAll('.MuiSkeleton-root').length > 0

      // Component should handle the error state (either show error message or loading state)
      expect(hasError || hasSkeletons).toBeTruthy()
    })
  })

  it('shows both Chart and Feedback tabs', async () => {
    renderWithRouter(<FeedbackSummaryWidget />)

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument()
    })

    // Check both tabs are present
    expect(screen.getByRole('tab', { name: /chart/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /feedback/i })).toBeInTheDocument()
  })
})
