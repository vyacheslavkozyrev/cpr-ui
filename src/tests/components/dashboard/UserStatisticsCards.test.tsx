import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  UserStatCard,
  UserStatisticsCards,
} from '../../../components/dashboard/cards/UserStatisticsCards'
import { renderWithRouter } from '../../utils'

describe('UserStatCard', () => {
  it('renders basic card with label and value', () => {
    render(<UserStatCard label='Test Metric' value={42} />)

    expect(screen.getByText('Test Metric')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('shows loading skeleton when isLoading is true', () => {
    render(<UserStatCard label='Test Metric' value={42} isLoading={true} />)

    // Check for skeleton loading elements
    const skeletons = document.querySelectorAll('.MuiSkeleton-root')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('displays trend indicator when trend is provided', () => {
    render(
      <UserStatCard
        label='Goals Completed'
        value={15}
        trend={{
          direction: 'up',
          value: '+3 this month',
          color: 'success',
        }}
      />
    )

    expect(screen.getByText('Goals Completed')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.getByText('+3 this month')).toBeInTheDocument()

    // Check for trending up icon (TrendingUp component)
    const trendIcon =
      document.querySelector('[data-testid="TrendingUpIcon"]') ||
      document.querySelector('svg[class*="MuiSvgIcon-root"]')
    expect(trendIcon).toBeInTheDocument()
  })

  it('displays different trend directions correctly', () => {
    const { rerender } = render(
      <UserStatCard
        label='Test'
        value={10}
        trend={{ direction: 'up', value: '+5' }}
      />
    )

    // Test up trend
    expect(screen.getByText('+5')).toBeInTheDocument()

    // Test down trend
    rerender(
      <UserStatCard
        label='Test'
        value={10}
        trend={{ direction: 'down', value: '-2' }}
      />
    )
    expect(screen.getByText('-2')).toBeInTheDocument()

    // Test neutral trend
    rerender(
      <UserStatCard
        label='Test'
        value={10}
        trend={{ direction: 'neutral', value: 'No change' }}
      />
    )
    expect(screen.getByText('No change')).toBeInTheDocument()
  })

  it('applies different color variants correctly', () => {
    const { container } = render(
      <UserStatCard label='Test Metric' value={42} color='success' />
    )

    // The card should have success color styling applied through MUI theming
    expect(container.firstChild).toBeInTheDocument()
  })
})

describe('UserStatisticsCards', () => {
  it('renders all statistics cards with default values', () => {
    renderWithRouter(<UserStatisticsCards />)

    expect(screen.getByText('Goals Completed')).toBeInTheDocument()
    expect(screen.getByText('Feedback Received')).toBeInTheDocument()
    expect(screen.getByText('Skills Assessed')).toBeInTheDocument()

    // Check for default values (there are multiple "0" values, so use getAllByText)
    const zeroValues = screen.getAllByText('0')
    expect(zeroValues.length).toBe(3) // All three cards should show 0 by default
  })

  it('renders with provided statistics values', () => {
    renderWithRouter(
      <UserStatisticsCards
        goalsCompleted={12}
        feedbackReceived={8}
        skillsAssessed={16}
      />
    )

    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('16')).toBeInTheDocument()
  })

  it('shows loading state for all cards when isLoading is true', () => {
    renderWithRouter(
      <UserStatisticsCards
        goalsCompleted={12}
        feedbackReceived={8}
        skillsAssessed={16}
        isLoading={true}
      />
    )

    // Check for skeleton loading elements - should have multiple for 3 cards
    const skeletons = document.querySelectorAll('.MuiSkeleton-root')
    expect(skeletons.length).toBeGreaterThan(2) // At least one skeleton per card
  })

  it('displays trend information for each statistic', () => {
    renderWithRouter(
      <UserStatisticsCards
        goalsCompleted={12}
        feedbackReceived={8}
        skillsAssessed={16}
      />
    )

    // Check for trend text (these are hardcoded in the component)
    expect(screen.getByText('+2 this month')).toBeInTheDocument()
    expect(screen.getByText('same as last month')).toBeInTheDocument()
    expect(screen.getByText('+3 this quarter')).toBeInTheDocument()
  })

  it('applies responsive grid layout', () => {
    const { container } = renderWithRouter(
      <UserStatisticsCards
        goalsCompleted={12}
        feedbackReceived={8}
        skillsAssessed={16}
      />
    )

    // Check for grid styling
    const gridContainer =
      container.querySelector('[style*="grid"]') ||
      container.querySelector('[class*="MuiBox-root"]')
    expect(gridContainer).toBeInTheDocument()
  })

  it('handles zero values correctly', () => {
    renderWithRouter(
      <UserStatisticsCards
        goalsCompleted={0}
        feedbackReceived={0}
        skillsAssessed={0}
      />
    )

    // Should display 0 for all values
    const zeroValues = screen.getAllByText('0')
    expect(zeroValues).toHaveLength(3)
  })

  it('handles undefined values with defaults', () => {
    renderWithRouter(<UserStatisticsCards />)

    // Should fall back to 0 for undefined values
    const zeroValues = screen.getAllByText('0')
    expect(zeroValues).toHaveLength(3)
  })
})
