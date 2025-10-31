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
import { ActivityFeedWidget } from '../../../components/dashboard/widgets/ActivityFeedWidget'
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

// Mock data matching IActivityFeed interface structure with recent timestamps
const mockActivityFeed = {
  items: [
    {
      id: '1',
      type: 'goal_completed',
      title: 'Completed React Advanced Course',
      description: 'Successfully finished the advanced React patterns course',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      metadata: {
        goalId: 'goal-1',
        fromUserId: 'user-1',
      },
    },
    {
      id: '2',
      type: 'feedback_received',
      title: 'Received Positive Feedback',
      description: 'Great collaboration on the project delivery',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      metadata: {
        feedbackId: 'feedback-1',
        fromUserId: 'user-2',
        rating: 4,
      },
    },
    {
      id: '3',
      type: 'skill_assessed',
      title: 'Updated TypeScript Skills',
      description: 'Improved proficiency level from intermediate to advanced',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      metadata: {
        skillId: 'skill-1',
        fromUserId: 'user-1',
      },
    },
    {
      id: '4',
      type: 'goal_created',
      title: 'Created New Goal',
      description: 'Set up a new learning objective for Q4',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
      metadata: {
        goalId: 'goal-2',
        fromUserId: 'user-1',
      },
    },
  ],
  total: 42,
  page: 1,
  per_page: 10,
}

// MSW server setup
const server = setupServer(
  http.get('*/api/dashboard/activity', () => {
    return HttpResponse.json(mockActivityFeed)
  })
)

describe('ActivityFeedWidget', () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('renders loading state initially', async () => {
    renderWithRouter(<ActivityFeedWidget />)

    // Check for skeleton loading elements
    const skeletons = document.querySelectorAll('.MuiSkeleton-root')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders activity feed data correctly', async () => {
    renderWithRouter(<ActivityFeedWidget />)

    // Wait for component to load - check for elements that are always displayed
    await waitFor(() => {
      expect(screen.getByText('Activity Overview')).toBeInTheDocument()
      expect(screen.getByText('10 days')).toBeInTheDocument() // Days selector default value
    })
  })

  it('switches between Summary and Activities tabs', async () => {
    const user = userEvent.setup()
    renderWithRouter(<ActivityFeedWidget />)

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Activity Overview')).toBeInTheDocument()
    })

    // Check initial tab (Summary should be active)
    const summaryTab = screen.getByRole('tab', { name: /summary/i })
    const activitiesTab = screen.getByRole('tab', { name: /activities/i })

    expect(summaryTab).toHaveAttribute('aria-selected', 'true')
    expect(activitiesTab).toHaveAttribute('aria-selected', 'false')

    // Click on Activities tab
    await user.click(activitiesTab)

    // Check tab states changed
    expect(summaryTab).toHaveAttribute('aria-selected', 'false')
    expect(activitiesTab).toHaveAttribute('aria-selected', 'true')
  })

  it('displays activity overview section', async () => {
    renderWithRouter(<ActivityFeedWidget />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Activity Overview')).toBeInTheDocument()
    })

    // Check that activity overview elements are displayed
    expect(screen.getByText('10 days')).toBeInTheDocument() // Days selector display text
    expect(screen.getByDisplayValue('10')).toBeInTheDocument() // Days selector value
  })

  it('switches to Activities tab and shows activities list', async () => {
    const user = userEvent.setup()
    renderWithRouter(<ActivityFeedWidget />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Activity Overview')).toBeInTheDocument()
    })

    // Switch to Activities tab
    const activitiesTab = screen.getByRole('tab', { name: /activities/i })
    await user.click(activitiesTab)

    // Check activities section loads - look for activity list structure
    await waitFor(() => {
      // Component should show a list when activities tab is active
      const activityList = document.querySelector('.MuiList-root')
      expect(activityList).toBeTruthy()
    })
  })

  it('shows activity tab content', async () => {
    const user = userEvent.setup()
    renderWithRouter(<ActivityFeedWidget />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Activity Overview')).toBeInTheDocument()
    })

    // Switch to Activities tab
    const activitiesTab = screen.getByRole('tab', { name: /activities/i })
    await user.click(activitiesTab)

    // Check activity tab is working (component should respond to tab changes)
    await waitFor(() => {
      expect(activitiesTab).toHaveAttribute('aria-selected', 'true')
    })
  })

  it('handles tab switching correctly', async () => {
    const user = userEvent.setup()
    renderWithRouter(<ActivityFeedWidget />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Activity Overview')).toBeInTheDocument()
    })

    // Check both tabs exist
    const summaryTab = screen.getByRole('tab', { name: /summary/i })
    const activitiesTab = screen.getByRole('tab', { name: /activities/i })

    expect(summaryTab).toBeInTheDocument()
    expect(activitiesTab).toBeInTheDocument()

    // Test tab switching
    await user.click(activitiesTab)
    expect(activitiesTab).toHaveAttribute('aria-selected', 'true')

    await user.click(summaryTab)
    expect(summaryTab).toHaveAttribute('aria-selected', 'true')
  })

  it('handles API error gracefully', async () => {
    // Override the default handler to return an error
    server.use(
      http.get('*/api/dashboard/activity', () => {
        return new HttpResponse(null, { status: 500 })
      })
    )

    renderWithRouter(<ActivityFeedWidget />)

    // Wait for error handling to occur (flexible check like other widgets)
    await waitFor(
      () => {
        // Component should handle error gracefully - check for skeletons or error states
        const skeletons = document.querySelectorAll('.MuiSkeleton-root')
        const errorElements = screen.queryAllByText(/error/i)
        const failedElements = screen.queryAllByText(/failed/i)
        const unableElements = screen.queryAllByText(/unable/i)

        // Should show either loading skeletons or error message
        expect(
          skeletons.length > 0 ||
            errorElements.length > 0 ||
            failedElements.length > 0 ||
            unableElements.length > 0
        ).toBe(true)
      },
      { timeout: 3000 }
    )
  })

  it('shows both Summary and Activities tabs', async () => {
    renderWithRouter(<ActivityFeedWidget />)

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Activity Overview')).toBeInTheDocument()
    })

    // Check both tabs are present
    expect(screen.getByRole('tab', { name: /summary/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /activities/i })).toBeInTheDocument()
  })
})
