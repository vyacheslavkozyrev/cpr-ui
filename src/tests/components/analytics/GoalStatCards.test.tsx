/**
 * Component tests for GoalStatCards
 * Feature 0014 — Performance Analytics & Reporting
 *
 * Covers: populated data, empty state ("0"/"—"), loading skeletons.
 */

import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GoalStatCards } from '../../../components/analytics/GoalStatCards'
import type { IGoalStats } from '../../../models/analytics.models'
import { renderWithProviders } from '../../utils'

const fullStats: IGoalStats = {
  totalGoals: 12,
  createdInPeriod: 5,
  completedInPeriod: 4,
  openGoals: 3,
  inProgressGoals: 5,
  overdueGoals: 1,
  completionRate: 0.8,
  overdueRate: 0.083,
  avgDaysToComplete: 38.2,
}

describe('GoalStatCards', () => {
  it('AC-005: renders loading skeletons when isLoading is true', () => {
    renderWithProviders(<GoalStatCards stats={undefined} isLoading={true} />)
    const skeletons = document.querySelectorAll('.MuiSkeleton-root')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('AC-005: does not render skeletons when isLoading is false', () => {
    renderWithProviders(<GoalStatCards stats={fullStats} isLoading={false} />)
    const skeletons = document.querySelectorAll('.MuiSkeleton-root')
    expect(skeletons.length).toBe(0)
  })

  it('AC-005: renders all six stat card values when data is present', () => {
    renderWithProviders(<GoalStatCards stats={fullStats} isLoading={false} />)

    // Total Goals
    expect(screen.getByText('12')).toBeInTheDocument()
    // Created in Period
    expect(screen.getByText('5')).toBeInTheDocument()
    // Completed in Period
    expect(screen.getByText('4')).toBeInTheDocument()
    // Overdue
    expect(screen.getByText('1')).toBeInTheDocument()
    // Avg Days to Complete
    expect(screen.getByText('38.2')).toBeInTheDocument()
    // Completion Rate 80%
    expect(screen.getByText('80%')).toBeInTheDocument()
  })

  it('AC-008: shows "—" for completion_rate when null', () => {
    const stats: IGoalStats = { ...fullStats, completionRate: null }
    renderWithProviders(<GoalStatCards stats={stats} isLoading={false} />)
    // There should be at least one "—" displayed
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(1)
  })

  it('AC-005: shows "—" for avgDaysToComplete when null', () => {
    const stats: IGoalStats = {
      ...fullStats,
      avgDaysToComplete: null,
      completionRate: null,
    }
    renderWithProviders(<GoalStatCards stats={stats} isLoading={false} />)
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(2)
  })

  it('AC-009: shows "0" for all count cards when stats are all zero', () => {
    const zeroStats: IGoalStats = {
      totalGoals: 0,
      createdInPeriod: 0,
      completedInPeriod: 0,
      openGoals: 0,
      inProgressGoals: 0,
      overdueGoals: 0,
      completionRate: null,
      overdueRate: null,
      avgDaysToComplete: null,
    }
    renderWithProviders(<GoalStatCards stats={zeroStats} isLoading={false} />)
    // Several "0" values should appear
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBeGreaterThanOrEqual(4)
    // Completion rate should show "—"
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThanOrEqual(1)
  })

  it('AC-009: shows "0" values when stats is undefined and not loading', () => {
    renderWithProviders(<GoalStatCards stats={undefined} isLoading={false} />)
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBeGreaterThanOrEqual(4)
  })

  it('AC-005: renders stat card label text', () => {
    renderWithProviders(<GoalStatCards stats={fullStats} isLoading={false} />)
    // Check a few label strings
    expect(screen.getByText(/Total Goals/i)).toBeInTheDocument()
    expect(screen.getByText(/Completion Rate/i)).toBeInTheDocument()
    expect(screen.getByText(/Overdue Goals/i)).toBeInTheDocument()
  })
})
