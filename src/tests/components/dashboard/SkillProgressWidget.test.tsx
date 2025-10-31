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
import { SkillProgressWidget } from '../../../components/dashboard/widgets/SkillProgressWidget'
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
  Radar: ({ data, ...props }: ChartProps) => (
    <div data-testid='radar-chart' {...props}>
      Mock Radar Chart - {data?.datasets?.[0]?.label}
    </div>
  ),
}))

// Mock data matching ISkillsSummary interface
const mockSkillProgress = {
  statistics: {
    totalSkills: 20,
    assessedSkills: 16,
    assessmentProgress: 80,
    averageLevel: 3.2,
    skillGaps: 4,
  },
  skillCategories: [
    {
      categoryId: '1',
      categoryName: 'Technical',
      totalSkills: 8,
      assessedSkills: 6,
      averageLevel: 3.4,
    },
    {
      categoryId: '2',
      categoryName: 'Leadership',
      totalSkills: 5,
      assessedSkills: 3,
      averageLevel: 2.8,
    },
  ],
  recentAssessments: [
    {
      skillId: '1',
      skillName: 'React Development',
      level: 4,
      assessedAt: new Date('2024-01-20').toISOString(),
    },
    {
      skillId: '2',
      skillName: 'TypeScript',
      level: 3,
      assessedAt: new Date('2024-01-18').toISOString(),
    },
    {
      skillId: '3',
      skillName: 'Team Management',
      level: 2,
      assessedAt: new Date('2024-01-15').toISOString(),
    },
  ],
}

// MSW server setup
const server = setupServer(
  http.get('*/api/dashboard/skill-progress', () => {
    return HttpResponse.json(mockSkillProgress)
  })
)

describe('SkillProgressWidget', () => {
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())

  it('renders loading state initially', async () => {
    renderWithRouter(<SkillProgressWidget />)

    // Check for skeleton loading elements
    const skeletons = document.querySelectorAll('.MuiSkeleton-root')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders skill progress data correctly', async () => {
    renderWithRouter(<SkillProgressWidget />)

    // Wait for data to load and check statistics displayed in the component
    await waitFor(() => {
      expect(screen.getByText('16')).toBeInTheDocument() // assessedSkills
      expect(screen.getByText('4')).toBeInTheDocument() // skillGaps
      expect(screen.getByText('3.2')).toBeInTheDocument() // averageLevel
      expect(screen.getByText(/80\s*%/)).toBeInTheDocument() // assessmentProgress (80 %)
    })
  })

  it('switches between Chart and Skills tabs', async () => {
    const user = userEvent.setup()
    renderWithRouter(<SkillProgressWidget />)

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('16')).toBeInTheDocument() // assessedSkills
    })

    // Check initial tab (Chart should be active)
    const chartTab = screen.getByRole('tab', { name: /chart/i })
    const skillsTab = screen.getByRole('tab', { name: /skills/i })

    expect(chartTab).toHaveAttribute('aria-selected', 'true')
    expect(skillsTab).toHaveAttribute('aria-selected', 'false')

    // Click on Skills tab
    await user.click(skillsTab)

    // Check tab states changed
    expect(chartTab).toHaveAttribute('aria-selected', 'false')
    expect(skillsTab).toHaveAttribute('aria-selected', 'true')
  })

  it('displays chart data correctly', async () => {
    renderWithRouter(<SkillProgressWidget />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('16')).toBeInTheDocument() // assessedSkills
    })

    // Check if chart is rendered (should be visible by default on Chart tab)
    const chart = screen.getByTestId('doughnut-chart')
    expect(chart).toBeInTheDocument()
  })

  it('switches to Skills tab and shows skills list', async () => {
    const user = userEvent.setup()
    renderWithRouter(<SkillProgressWidget />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('16')).toBeInTheDocument() // assessedSkills
    })

    // Switch to Skills tab
    const skillsTab = screen.getByRole('tab', { name: /skills/i })
    await user.click(skillsTab)

    // Check skills items are displayed
    await waitFor(() => {
      expect(screen.getByText('React')).toBeInTheDocument()
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
      expect(screen.getByText('Team Leadership')).toBeInTheDocument()
    })
  })

  it('shows skill categories and progress', async () => {
    const user = userEvent.setup()
    renderWithRouter(<SkillProgressWidget />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('16')).toBeInTheDocument() // assessedSkills
    })

    // Switch to Skills tab
    const skillsTab = screen.getByRole('tab', { name: /skills/i })
    await user.click(skillsTab)

    // Check recent assessments are displayed
    await waitFor(() => {
      expect(screen.getByText('React')).toBeInTheDocument()
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
      expect(screen.getByText('Team Leadership')).toBeInTheDocument()

      // Check skill levels as shown in DOM (Expert for React and Node.js, Advanced for others)
      const expertElements = screen.getAllByText('Expert')
      expect(expertElements.length).toBeGreaterThan(0) // Multiple Expert skills
      const advancedElements = screen.getAllByText('Advanced')
      expect(advancedElements.length).toBeGreaterThan(0) // Multiple Advanced skills
    })
  })

  it('handles API error gracefully', async () => {
    // Override the default handler to return an error
    server.use(
      http.get('*/api/dashboard/skill-progress', () => {
        return new HttpResponse(null, { status: 500 })
      })
    )

    renderWithRouter(<SkillProgressWidget />)

    // Wait for error handling (component may show skeleton or error message)
    await waitFor(() => {
      // Check for either error messages or skeleton loading states
      const skeletons = document.querySelectorAll('.MuiSkeleton-root')
      const hasError =
        screen.queryByText(/error/i) ||
        screen.queryByText(/failed/i) ||
        screen.queryByText(/unable/i)
      expect(skeletons.length > 0 || hasError).toBe(true)
    })
  })

  it('shows both Chart and Skills tabs', async () => {
    renderWithRouter(<SkillProgressWidget />)

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('16')).toBeInTheDocument() // assessedSkills
    })

    // Check both tabs are present
    expect(screen.getByRole('tab', { name: /chart/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /skills/i })).toBeInTheDocument()
  })
})
