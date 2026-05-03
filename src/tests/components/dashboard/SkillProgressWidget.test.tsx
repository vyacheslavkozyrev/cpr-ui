import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { SkillProgressWidget } from '../../../components/dashboard/widgets/SkillProgressWidget'
import { server } from '../../../mocks/server'
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

describe('SkillProgressWidget', () => {
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

  it('AC-025 — skills list renders only API fields, no phantom fields (assessor_name, category, category_id)', async () => {
    const user = userEvent.setup()

    // Override with minimal assessment data that has no phantom fields
    server.use(
      http.get('*/api/dashboard/skill-progress', () =>
        HttpResponse.json({
          summary: {
            total_skills: 20,
            assessed_skills: 16,
            skill_gaps: 4,
            average_level: 3.2,
            assessment_progress: 80.0,
          },
          recent_assessments: [
            {
              skill_id: '550e8400-e29b-41d4-a716-000000000001',
              skill_name: 'React',
              level: 4,
              assessed_at: new Date().toISOString(),
            },
          ],
          improvement_areas: [],
          skill_distribution: {},
        })
      )
    )

    renderWithRouter(<SkillProgressWidget />)

    await waitFor(() => {
      expect(screen.getByText('16')).toBeInTheDocument()
    })

    // Switch to Skills tab
    const skillsTab = screen.getByRole('tab', { name: /skills/i })
    await user.click(skillsTab)

    await waitFor(() => {
      expect(screen.getByText('React')).toBeInTheDocument()
    })

    // Phantom fields must NOT appear in the rendered output
    expect(screen.queryByText('assessor_name')).not.toBeInTheDocument()
    expect(screen.queryByText('category')).not.toBeInTheDocument()
    expect(screen.queryByText('category_id')).not.toBeInTheDocument()
    expect(screen.queryByText('assessorName')).not.toBeInTheDocument()
    expect(screen.queryByText('categoryId')).not.toBeInTheDocument()
  })
})
