/**
 * Unit tests for analyticsMapper
 * Feature 0014 — Performance Analytics & Reporting
 *
 * Covers: DTO → model mapping, null-field handling, gap colour derivation.
 */

import { describe, expect, it } from 'vitest'
import type {
  TGoalAnalyticsDto,
  TSkillAnalyticsDto,
  TSkillRowDto,
} from '../../dtos/analytics.dtos'
import {
  deriveGapColor,
  mapCompletionTrendEntry,
  mapGoalAnalytics,
  mapSkillAnalytics,
  mapSkillHistoryEntry,
  mapSkillRow,
} from '../../mappers/analyticsMapper'
import { EAnalyticsPeriod } from '../../models/analytics.models'

// ==================== deriveGapColor ====================

describe('deriveGapColor', () => {
  it('returns "default" when gap is null', () => {
    expect(deriveGapColor(null)).toBe('default')
  })

  it('returns "success" when gap is 0 (met)', () => {
    expect(deriveGapColor(0)).toBe('success')
  })

  it('returns "success" when gap is negative (exceeded)', () => {
    expect(deriveGapColor(-0.5)).toBe('success')
  })

  it('returns "warning" when gap is 0.5', () => {
    expect(deriveGapColor(0.5)).toBe('warning')
  })

  it('returns "warning" when gap is exactly 1', () => {
    expect(deriveGapColor(1)).toBe('warning')
  })

  it('returns "error" when gap is greater than 1', () => {
    expect(deriveGapColor(1.1)).toBe('error')
  })

  it('returns "error" when gap is very large', () => {
    expect(deriveGapColor(5)).toBe('error')
  })
})

// ==================== mapCompletionTrendEntry ====================

describe('mapCompletionTrendEntry', () => {
  it('maps all fields correctly', () => {
    const dto = { period_label: '2025-11', created: 3, completed: 2 }
    const result = mapCompletionTrendEntry(dto)
    expect(result.periodLabel).toBe('2025-11')
    expect(result.created).toBe(3)
    expect(result.completed).toBe(2)
  })

  it('maps zero counts', () => {
    const dto = { period_label: '2024-01', created: 0, completed: 0 }
    const result = mapCompletionTrendEntry(dto)
    expect(result.created).toBe(0)
    expect(result.completed).toBe(0)
  })
})

// ==================== mapSkillHistoryEntry ====================

describe('mapSkillHistoryEntry', () => {
  it('maps all fields including null manager assessment', () => {
    const dto = {
      recorded_at: '2025-12-01T10:00:00Z',
      self_assessment_value: 3.0,
      manager_assessment_value: null,
    }
    const result = mapSkillHistoryEntry(dto)
    expect(result.recordedAt).toBe('2025-12-01T10:00:00Z')
    expect(result.selfAssessmentValue).toBe(3.0)
    expect(result.managerAssessmentValue).toBeNull()
  })

  it('maps manager assessment when present', () => {
    const dto = {
      recorded_at: '2025-12-15T08:00:00Z',
      self_assessment_value: 3.5,
      manager_assessment_value: 3.0,
    }
    const result = mapSkillHistoryEntry(dto)
    expect(result.managerAssessmentValue).toBe(3.0)
  })
})

// ==================== mapSkillRow ====================

describe('mapSkillRow', () => {
  const baseDto: TSkillRowDto = {
    skill_id: 'skill-001',
    skill_title: 'TypeScript',
    category_title: 'Frontend',
    current_self_assessment: 4.0,
    current_manager_assessment: 3.5,
    required_level: 4.0,
    gap: 0.0,
    history: [],
  }

  it('maps all fields correctly', () => {
    const result = mapSkillRow(baseDto)
    expect(result.skillId).toBe('skill-001')
    expect(result.skillTitle).toBe('TypeScript')
    expect(result.categoryTitle).toBe('Frontend')
    expect(result.currentSelfAssessment).toBe(4.0)
    expect(result.currentManagerAssessment).toBe(3.5)
    expect(result.requiredLevel).toBe(4.0)
    expect(result.gap).toBe(0.0)
  })

  it('maps null manager assessment', () => {
    const dto = { ...baseDto, current_manager_assessment: null }
    const result = mapSkillRow(dto)
    expect(result.currentManagerAssessment).toBeNull()
  })

  it('maps null required_level', () => {
    const dto = { ...baseDto, required_level: null, gap: null }
    const result = mapSkillRow(dto)
    expect(result.requiredLevel).toBeNull()
    expect(result.gap).toBeNull()
  })

  it('derives gapColor = "success" when gap is 0', () => {
    const dto = { ...baseDto, gap: 0 }
    const result = mapSkillRow(dto)
    expect(result.gapColor).toBe('success')
  })

  it('derives gapColor = "warning" when gap is 0.5', () => {
    const dto = { ...baseDto, gap: 0.5 }
    const result = mapSkillRow(dto)
    expect(result.gapColor).toBe('warning')
  })

  it('derives gapColor = "error" when gap is 2', () => {
    const dto = { ...baseDto, gap: 2 }
    const result = mapSkillRow(dto)
    expect(result.gapColor).toBe('error')
  })

  it('derives gapColor = "default" when gap is null', () => {
    const dto = { ...baseDto, gap: null }
    const result = mapSkillRow(dto)
    expect(result.gapColor).toBe('default')
  })

  it('maps history entries', () => {
    const dto = {
      ...baseDto,
      history: [
        {
          recorded_at: '2025-11-01T00:00:00Z',
          self_assessment_value: 3.0,
          manager_assessment_value: null,
        },
      ],
    }
    const result = mapSkillRow(dto)
    expect(result.history).toHaveLength(1)
    expect(result.history[0].selfAssessmentValue).toBe(3.0)
  })

  it('maps empty history array', () => {
    const result = mapSkillRow({ ...baseDto, history: [] })
    expect(result.history).toEqual([])
  })
})

// ==================== mapGoalAnalytics ====================

describe('mapGoalAnalytics', () => {
  const dto: TGoalAnalyticsDto = {
    period: 'last_90_days',
    period_start: '2025-11-01T00:00:00Z',
    period_end: '2026-01-30T23:59:59Z',
    stats: {
      total_goals: 12,
      created_in_period: 5,
      completed_in_period: 4,
      open_goals: 3,
      in_progress_goals: 5,
      overdue_goals: 1,
      completion_rate: 0.8,
      overdue_rate: 0.083,
      avg_days_to_complete: 38.2,
    },
    goals_by_status: { open: 3, in_progress: 5, completed: 4 },
    completion_trend: [
      { period_label: '2025-11', created: 2, completed: 1 },
      { period_label: '2025-12', created: 2, completed: 2 },
    ],
  }

  it('maps period string to EAnalyticsPeriod', () => {
    const result = mapGoalAnalytics(dto)
    expect(result.period).toBe(EAnalyticsPeriod.LAST_90_DAYS)
  })

  it('maps period_start and period_end as strings', () => {
    const result = mapGoalAnalytics(dto)
    expect(result.periodStart).toBe('2025-11-01T00:00:00Z')
    expect(result.periodEnd).toBe('2026-01-30T23:59:59Z')
  })

  it('maps stats correctly', () => {
    const result = mapGoalAnalytics(dto)
    expect(result.stats.totalGoals).toBe(12)
    expect(result.stats.createdInPeriod).toBe(5)
    expect(result.stats.completedInPeriod).toBe(4)
    expect(result.stats.openGoals).toBe(3)
    expect(result.stats.inProgressGoals).toBe(5)
    expect(result.stats.overdueGoals).toBe(1)
    expect(result.stats.completionRate).toBe(0.8)
    expect(result.stats.overdueRate).toBeCloseTo(0.083)
    expect(result.stats.avgDaysToComplete).toBe(38.2)
  })

  it('maps goalsByStatus correctly', () => {
    const result = mapGoalAnalytics(dto)
    expect(result.goalsByStatus.open).toBe(3)
    expect(result.goalsByStatus.inProgress).toBe(5)
    expect(result.goalsByStatus.completed).toBe(4)
  })

  it('maps completionTrend entries', () => {
    const result = mapGoalAnalytics(dto)
    expect(result.completionTrend).toHaveLength(2)
    expect(result.completionTrend[0].periodLabel).toBe('2025-11')
    expect(result.completionTrend[0].created).toBe(2)
    expect(result.completionTrend[0].completed).toBe(1)
  })

  it('handles null completion_rate', () => {
    const dtoWithNull: TGoalAnalyticsDto = {
      ...dto,
      stats: {
        ...dto.stats,
        completion_rate: null,
        avg_days_to_complete: null,
      },
    }
    const result = mapGoalAnalytics(dtoWithNull)
    expect(result.stats.completionRate).toBeNull()
    expect(result.stats.avgDaysToComplete).toBeNull()
  })

  it('defaults to LAST_90_DAYS for unknown period string', () => {
    const dtoWithUnknown: TGoalAnalyticsDto = {
      ...dto,
      period: 'unknown_value',
    }
    const result = mapGoalAnalytics(dtoWithUnknown)
    expect(result.period).toBe(EAnalyticsPeriod.LAST_90_DAYS)
  })

  it('correctly maps each valid period string', () => {
    const periods = [
      ['last_30_days', EAnalyticsPeriod.LAST_30_DAYS],
      ['last_90_days', EAnalyticsPeriod.LAST_90_DAYS],
      ['last_180_days', EAnalyticsPeriod.LAST_180_DAYS],
      ['last_quarter', EAnalyticsPeriod.LAST_QUARTER],
      ['last_year', EAnalyticsPeriod.LAST_YEAR],
    ] as const
    for (const [raw, expected] of periods) {
      const result = mapGoalAnalytics({ ...dto, period: raw })
      expect(result.period).toBe(expected)
    }
  })
})

// ==================== mapSkillAnalytics ====================

describe('mapSkillAnalytics', () => {
  const dto: TSkillAnalyticsDto = {
    period: 'last_90_days',
    period_start: '2025-11-01T00:00:00Z',
    period_end: '2026-01-30T23:59:59Z',
    gap_closure_summary: {
      skills_assessed: 10,
      skills_with_gaps: 3,
      gaps_closed_in_period: 1,
      gaps_worsened_in_period: 0,
      avg_gap_at_period_start: 1.5,
      avg_gap_at_period_end: 1.0,
    },
    skills: [
      {
        skill_id: 'skill-001',
        skill_title: 'TypeScript',
        category_title: 'Frontend',
        current_self_assessment: 4.0,
        current_manager_assessment: 3.5,
        required_level: 4.0,
        gap: 0.0,
        history: [],
      },
    ],
  }

  it('maps gapClosureSummary correctly', () => {
    const result = mapSkillAnalytics(dto)
    expect(result.gapClosureSummary.skillsAssessed).toBe(10)
    expect(result.gapClosureSummary.skillsWithGaps).toBe(3)
    expect(result.gapClosureSummary.gapsClosedInPeriod).toBe(1)
    expect(result.gapClosureSummary.gapsWorsenedInPeriod).toBe(0)
    expect(result.gapClosureSummary.avgGapAtPeriodStart).toBe(1.5)
    expect(result.gapClosureSummary.avgGapAtPeriodEnd).toBe(1.0)
  })

  it('maps null avg_gap fields', () => {
    const dtoNullGap: TSkillAnalyticsDto = {
      ...dto,
      gap_closure_summary: {
        ...dto.gap_closure_summary,
        avg_gap_at_period_start: null,
        avg_gap_at_period_end: null,
      },
    }
    const result = mapSkillAnalytics(dtoNullGap)
    expect(result.gapClosureSummary.avgGapAtPeriodStart).toBeNull()
    expect(result.gapClosureSummary.avgGapAtPeriodEnd).toBeNull()
  })

  it('maps skills array', () => {
    const result = mapSkillAnalytics(dto)
    expect(result.skills).toHaveLength(1)
    expect(result.skills[0].skillTitle).toBe('TypeScript')
  })

  it('maps empty skills array', () => {
    const result = mapSkillAnalytics({ ...dto, skills: [] })
    expect(result.skills).toEqual([])
  })

  it('applies gap colour to each skill row', () => {
    const result = mapSkillAnalytics(dto)
    // gap=0 → success
    expect(result.skills[0].gapColor).toBe('success')
  })
})
