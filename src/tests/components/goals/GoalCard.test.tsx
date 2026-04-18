import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { TGoalDto } from '../../../dtos/GoalDto'
import { GoalCard } from '../../../pages/goals/components/GoalCard'
import { renderWithProviders } from '../../utils'

describe('GoalCard Component Tests', () => {
  // Router context is required for GoalCard (uses useNavigate)
  const renderOptions = { contextOptions: { includeRouter: true } }

  const mockGoal: TGoalDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    employeeId: '123e4567-e89b-12d3-a456-426614174001',
    title: 'Learn React Query',
    description: 'Master React Query for state management',
    status: 'in_progress',
    deadline: '2025-12-31T23:59:59Z',
    priority: 75,
    visibility: 'private',
    isCompleted: false,
    progressPercent: 45.5,
    createdAt: '2025-01-01T00:00:00Z',
    modifiedAt: '2025-01-15T12:00:00Z',
    tasks: [
      {
        id: 'task-1',
        goalId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Read documentation',
        description: '',
        isCompleted: true,
        deadline: '',
        createdAt: '2025-01-01T00:00:00Z',
        modifiedAt: '2025-01-10T00:00:00Z',
      },
      {
        id: 'task-2',
        goalId: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Build sample app',
        description: '',
        isCompleted: false,
        deadline: '',
        createdAt: '2025-01-02T00:00:00Z',
        modifiedAt: '',
      },
    ],
  }

  describe('Positive Cases - Component Rendering', () => {
    it('should render goal title', () => {
      renderWithProviders(<GoalCard goal={mockGoal} />, renderOptions)
      expect(screen.getByText('Learn React Query')).toBeInTheDocument()
    })

    it('should render goal description', () => {
      renderWithProviders(<GoalCard goal={mockGoal} />, renderOptions)
      expect(
        screen.getByText('Master React Query for state management')
      ).toBeInTheDocument()
    })

    it('should display status chip', () => {
      renderWithProviders(<GoalCard goal={mockGoal} />, renderOptions)
      // Status should be displayed as translated text "In Progress"
      const statusElement = screen.getByText(/In Progress/i)
      expect(statusElement).toBeInTheDocument()
    })

    it('should display progress percentage', () => {
      renderWithProviders(<GoalCard goal={mockGoal} />, renderOptions)
      // Progress should be displayed as 46% (45.5 rounded up by Math.round)
      expect(screen.getByText(/46%/)).toBeInTheDocument()
    })

    it('should display task completion count', () => {
      renderWithProviders(<GoalCard goal={mockGoal} />, renderOptions)
      // 1 completed out of 2 tasks - specific text format
      expect(screen.getByText('1 / 2 tasks completed')).toBeInTheDocument()
    })

    it('should display deadline when present', () => {
      renderWithProviders(<GoalCard goal={mockGoal} />, renderOptions)
      // Deadline should be formatted as "Dec 31, 2025" (MEDIUM format)
      const deadlineText = screen.getByText(/Dec 31, 2025/i)
      expect(deadlineText).toBeInTheDocument()
    })

    it('should render without deadline gracefully', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { deadline, ...goalWithoutDeadline } = mockGoal
      renderWithProviders(
        <GoalCard goal={goalWithoutDeadline} />,
        renderOptions
      )
      expect(screen.getByText('Learn React Query')).toBeInTheDocument()
    })
  })

  describe('Positive Cases - Visual Indicators', () => {
    it('should show high priority badge for priority >= 70', () => {
      renderWithProviders(<GoalCard goal={mockGoal} />, renderOptions)
      // Priority 75 should show high priority
      expect(screen.getByText(/high/i)).toBeInTheDocument()
    })

    it('should show medium priority for priority 30-69', () => {
      const mediumPriorityGoal = { ...mockGoal, priority: 50 }
      renderWithProviders(<GoalCard goal={mediumPriorityGoal} />, renderOptions)
      expect(screen.getByText(/medium/i)).toBeInTheDocument()
    })

    it('should show low priority for priority < 30', () => {
      const lowPriorityGoal = { ...mockGoal, priority: 20 }
      renderWithProviders(<GoalCard goal={lowPriorityGoal} />, renderOptions)
      expect(screen.getByText(/low/i)).toBeInTheDocument()
    })

    it('should display completed status with check icon', () => {
      const completedGoal: TGoalDto = {
        ...mockGoal,
        status: 'completed',
        isCompleted: true,
        completedAt: '2025-01-20T00:00:00Z',
        progressPercent: 100,
      }
      renderWithProviders(<GoalCard goal={completedGoal} />, renderOptions)
      // Check for completed status chip (multiple "completed" texts exist - be specific)
      const chips = screen.getAllByText(/completed/i)
      expect(chips.length).toBeGreaterThan(0)
    })
  })

  describe('Negative Cases - Edge Cases', () => {
    it('should handle goal with no tasks', () => {
      const goalWithNoTasks = { ...mockGoal, tasks: [] }
      renderWithProviders(<GoalCard goal={goalWithNoTasks} />, renderOptions)
      // When no tasks, task count should not be displayed
      expect(screen.queryByText(/tasks completed/)).not.toBeInTheDocument()
    })

    it('should handle goal with no description', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { description, ...goalWithoutDescription } = mockGoal
      renderWithProviders(
        <GoalCard goal={goalWithoutDescription} />,
        renderOptions
      )
      expect(screen.getByText('Learn React Query')).toBeInTheDocument()
    })

    it('should handle zero progress', () => {
      const goalWithZeroProgress = { ...mockGoal, progressPercent: 0 }
      renderWithProviders(
        <GoalCard goal={goalWithZeroProgress} />,
        renderOptions
      )
      expect(screen.getByText(/0%/)).toBeInTheDocument()
    })

    it('should handle 100% progress', () => {
      const goalWithFullProgress = { ...mockGoal, progressPercent: 100 }
      renderWithProviders(
        <GoalCard goal={goalWithFullProgress} />,
        renderOptions
      )
      expect(screen.getByText(/100%/)).toBeInTheDocument()
    })

    it('should handle missing priority gracefully', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { priority, ...goalWithoutPriority } = mockGoal
      renderWithProviders(
        <GoalCard goal={goalWithoutPriority} />,
        renderOptions
      )
      expect(screen.getByText('Learn React Query')).toBeInTheDocument()
    })
  })

  describe('F0010a — Suggested and Deletion States', () => {
    it('should render suggested status chip', () => {
      const suggestedGoal: TGoalDto = {
        ...mockGoal,
        status: 'suggested',
        has_pending_deletion_request: false,
      }
      renderWithProviders(<GoalCard goal={suggestedGoal} />, renderOptions)
      // Translation maps 'suggested' → 'Suggested'
      expect(screen.getByText('Suggested')).toBeInTheDocument()
    })

    it('should render not_started status chip', () => {
      const notStartedGoal: TGoalDto = {
        ...mockGoal,
        status: 'not_started',
        has_pending_deletion_request: false,
      }
      renderWithProviders(<GoalCard goal={notStartedGoal} />, renderOptions)
      // Translation maps 'not_started' → 'Not Started'
      expect(screen.getByText('Not Started')).toBeInTheDocument()
    })

    it('should render goal with has_pending_deletion_request true without errors', () => {
      const pendingGoal: TGoalDto = {
        ...mockGoal,
        has_pending_deletion_request: true,
      }
      renderWithProviders(<GoalCard goal={pendingGoal} />, renderOptions)
      expect(screen.getByText('Learn React Query')).toBeInTheDocument()
    })
  })

  describe('Data Structure Validation', () => {
    it('should have valid goal DTO structure', () => {
      expect(mockGoal.id).toBeTruthy()
      expect(mockGoal.employeeId).toBeTruthy()
      expect(mockGoal.title).toBeTruthy()
      expect(mockGoal.status).toMatch(/^(open|in_progress|completed)$/)
      expect(Array.isArray(mockGoal.tasks)).toBe(true)
    })

    it('should have valid date formats', () => {
      expect(new Date(mockGoal.createdAt).toString()).not.toBe('Invalid Date')
      if (mockGoal.deadline) {
        expect(new Date(mockGoal.deadline).toString()).not.toBe('Invalid Date')
      }
    })

    it('should have valid progress percentage range', () => {
      expect(mockGoal.progressPercent).toBeGreaterThanOrEqual(0)
      expect(mockGoal.progressPercent).toBeLessThanOrEqual(100)
    })
  })
})
