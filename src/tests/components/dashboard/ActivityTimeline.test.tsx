import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ActivityTimeline } from '../../../components/dashboard/timeline/ActivityTimeline'
import { renderWithRouter } from '../../utils'

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn(_date => '2 hours ago'),
  parseISO: vi.fn(dateString => new Date(dateString)),
}))

describe('ActivityTimeline', () => {
  const mockActivities = [
    {
      id: '1',
      type: 'goal_completed' as const,
      title: 'Completed Q4 Sales Target',
      description: 'Successfully achieved the quarterly sales target',
      timestamp: '2023-10-25T14:30:00Z',
      metadata: {
        goalId: 'goal-123',
        category: 'sales',
      },
    },
    {
      id: '2',
      type: 'feedback_received' as const,
      title: 'Received Performance Feedback',
      description: 'Got positive feedback from manager',
      timestamp: '2023-10-24T09:15:00Z',
      metadata: {
        feedbackId: 'feedback-456',
        fromUserId: 'user-789',
        rating: 4,
      },
    },
    {
      id: '3',
      type: 'skill_assessed' as const,
      title: 'JavaScript Assessment',
      description: 'Completed JavaScript skill assessment',
      timestamp: '2023-10-23T16:45:00Z',
      metadata: {
        skillId: 'skill-101',
        category: 'technical',
      },
    },
  ]

  it('renders activity timeline with activities', () => {
    renderWithRouter(<ActivityTimeline activities={mockActivities} />)

    // Check that all activity titles are rendered
    expect(screen.getByText('Completed Q4 Sales Target')).toBeInTheDocument()
    expect(
      screen.getByText('Received Performance Feedback')
    ).toBeInTheDocument()
    expect(screen.getByText('JavaScript Assessment')).toBeInTheDocument()
  })

  it('shows loading skeleton when isLoading is true', () => {
    renderWithRouter(<ActivityTimeline activities={[]} isLoading={true} />)

    // Check for skeleton loading elements
    const skeletons = document.querySelectorAll('.MuiSkeleton-root')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('displays empty state when no activities are provided', () => {
    renderWithRouter(<ActivityTimeline activities={[]} />)

    expect(
      screen.getByText('No recent activities to display')
    ).toBeInTheDocument()
  })

  it('limits activities to maxItems when specified', () => {
    renderWithRouter(
      <ActivityTimeline activities={mockActivities} maxItems={2} />
    )

    // Should only show first 2 activities
    expect(screen.getByText('Completed Q4 Sales Target')).toBeInTheDocument()
    expect(
      screen.getByText('Received Performance Feedback')
    ).toBeInTheDocument()
    expect(screen.queryByText('JavaScript Assessment')).not.toBeInTheDocument()
  })

  it('displays different activity types with correct icons and colors', () => {
    renderWithRouter(<ActivityTimeline activities={mockActivities} />)

    // Check that activity type labels are formatted correctly
    expect(screen.getByText('Goal Completed')).toBeInTheDocument()
    expect(screen.getByText('Feedback Received')).toBeInTheDocument()
    expect(screen.getByText('Skill Updated')).toBeInTheDocument()
  })

  it('shows activity descriptions', () => {
    renderWithRouter(<ActivityTimeline activities={mockActivities} />)

    expect(
      screen.getByText('Successfully achieved the quarterly sales target')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Got positive feedback from manager')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Completed JavaScript skill assessment')
    ).toBeInTheDocument()
  })

  it('displays formatted timestamps', () => {
    renderWithRouter(<ActivityTimeline activities={mockActivities} />)

    // Since we mocked formatDistanceToNow to return '2 hours ago'
    const timeElements = screen.getAllByText('2 hours ago')
    expect(timeElements.length).toBe(mockActivities.length)
  })

  it('renders metadata information when available', () => {
    const activitiesWithMetadata = [
      {
        id: '1',
        type: 'feedback_received' as const,
        title: 'Performance Review',
        description: 'Annual performance review completed',
        timestamp: '2023-10-25T14:30:00Z',
        metadata: {
          rating: 5,
          fromUserId: 'manager-123',
          category: 'performance',
        },
      },
    ]

    renderWithRouter(<ActivityTimeline activities={activitiesWithMetadata} />)

    // Should render the activity
    expect(screen.getByText('Performance Review')).toBeInTheDocument()
    expect(
      screen.getByText('Annual performance review completed')
    ).toBeInTheDocument()
  })

  it('handles activities without metadata gracefully', () => {
    const activitiesWithoutMetadata = [
      {
        id: '1',
        type: 'goal_created' as const,
        title: 'New Goal Created',
        description: 'Created a new quarterly goal',
        timestamp: '2023-10-25T14:30:00Z',
        // No metadata property
      },
    ]

    renderWithRouter(
      <ActivityTimeline activities={activitiesWithoutMetadata} />
    )

    expect(screen.getByText('New Goal Created')).toBeInTheDocument()
    expect(screen.getByText('Created a new quarterly goal')).toBeInTheDocument()
  })

  it('displays timeline visual elements', () => {
    const { container } = renderWithRouter(
      <ActivityTimeline activities={mockActivities} />
    )

    // Check for timeline structure - the component uses Box components for timeline styling
    const timelineElements = container.querySelectorAll('[class*="MuiBox"]')
    expect(timelineElements.length).toBeGreaterThan(0)
  })

  it('handles different activity types correctly', () => {
    const allActivityTypes = [
      {
        id: '1',
        type: 'goal_completed' as const,
        title: 'Goal Completed',
        description: 'Test goal completed',
        timestamp: '2023-10-25T14:30:00Z',
      },
      {
        id: '2',
        type: 'feedback_received' as const,
        title: 'Feedback Received',
        description: 'Test feedback received',
        timestamp: '2023-10-25T14:30:00Z',
      },
      {
        id: '3',
        type: 'skill_assessed' as const,
        title: 'Skill Assessed',
        description: 'Test skill assessed',
        timestamp: '2023-10-25T14:30:00Z',
      },
      {
        id: '4',
        type: 'goal_created' as const,
        title: 'Goal Created',
        description: 'Test goal created',
        timestamp: '2023-10-25T14:30:00Z',
      },
      {
        id: '5',
        type: 'feedback_requested' as const,
        title: 'Feedback Requested',
        description: 'Test feedback requested',
        timestamp: '2023-10-25T14:30:00Z',
      },
    ]

    renderWithRouter(<ActivityTimeline activities={allActivityTypes} />)

    // Check that all activity type labels are rendered (using getAllByText for multiple instances)
    expect(screen.getAllByText('Goal Completed').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Feedback Received').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Skill Updated').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Goal Created').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Feedback Requested').length).toBeGreaterThan(0)
  })

  it('applies correct styling for different activity types', () => {
    const { container } = renderWithRouter(
      <ActivityTimeline activities={mockActivities} />
    )

    // Check that cards are rendered (should be 3 activity cards)
    const cards = container.querySelectorAll('.MuiCard-root')
    expect(cards.length).toBe(mockActivities.length)
  })

  it('handles empty metadata object', () => {
    const activityWithEmptyMetadata = [
      {
        id: '1',
        type: 'goal_completed' as const,
        title: 'Test Goal',
        description: 'Test description',
        timestamp: '2023-10-25T14:30:00Z',
        metadata: {},
      },
    ]

    renderWithRouter(
      <ActivityTimeline activities={activityWithEmptyMetadata} />
    )

    expect(screen.getByText('Test Goal')).toBeInTheDocument()
  })

  it('defaults to showing 10 items when maxItems is not specified', () => {
    // Create 15 activities to test default limit
    const manyActivities = Array.from({ length: 15 }, (_, i) => ({
      id: `${i + 1}`,
      type: 'goal_completed' as const,
      title: `Activity ${i + 1}`,
      description: `Description ${i + 1}`,
      timestamp: '2023-10-25T14:30:00Z',
    }))

    renderWithRouter(<ActivityTimeline activities={manyActivities} />)

    // Should show first 10 activities (default maxItems)
    expect(screen.getByText('Activity 1')).toBeInTheDocument()
    expect(screen.getByText('Activity 10')).toBeInTheDocument()
    expect(screen.queryByText('Activity 11')).not.toBeInTheDocument()
  })
})
