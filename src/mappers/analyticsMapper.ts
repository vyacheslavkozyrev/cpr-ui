/**
 * Analytics Mappers
 * Transform API DTOs to domain models for the presentation layer.
 * Feature 0014 — Performance Analytics & Reporting
 */

import type {
  TGoalAnalyticsDto,
  TSkillAnalyticsDto,
  TSkillRowDto,
  TCompletionTrendEntryDto,
  TSkillHistoryEntryDto,
} from '../dtos/analytics.dtos'
import type {
  IGoalAnalytics,
  ISkillAnalytics,
  ISkillRow,
  ICompletionTrendEntry,
  ISkillHistoryEntry,
  TGapColor,
} from '../models/analytics.models'
import { EAnalyticsPeriod } from '../models/analytics.models'

/** Derive gap colour coding from a gap value for UI display. */
export const deriveGapColor = (gap: number | null): TGapColor => {
  if (gap === null) return 'default'
  if (gap <= 0) return 'success'
  if (gap <= 1) return 'warning'
  return 'error'
}

/** Safely cast period string to EAnalyticsPeriod enum value, defaulting to last_90_days. */
const toPeriod = (raw: string): EAnalyticsPeriod => {
  const valid = Object.values(EAnalyticsPeriod) as string[]
  return valid.includes(raw)
    ? (raw as EAnalyticsPeriod)
    : EAnalyticsPeriod.LAST_90_DAYS
}

/** Map a completion trend entry DTO to domain model. */
export const mapCompletionTrendEntry = (
  dto: TCompletionTrendEntryDto
): ICompletionTrendEntry => ({
  periodLabel: dto.period_label,
  created: dto.created,
  completed: dto.completed,
})

/** Map a skill history entry DTO to domain model. */
export const mapSkillHistoryEntry = (
  dto: TSkillHistoryEntryDto
): ISkillHistoryEntry => ({
  recordedAt: dto.recorded_at,
  selfAssessmentValue: dto.self_assessment_value,
  managerAssessmentValue: dto.manager_assessment_value,
})

/** Map a skill row DTO to domain model. */
export const mapSkillRow = (dto: TSkillRowDto): ISkillRow => ({
  skillId: dto.skill_id,
  skillTitle: dto.skill_title,
  categoryTitle: dto.category_title,
  currentSelfAssessment: dto.current_self_assessment,
  currentManagerAssessment: dto.current_manager_assessment,
  requiredLevel: dto.required_level,
  gap: dto.gap,
  gapColor: deriveGapColor(dto.gap),
  history: dto.history.map(mapSkillHistoryEntry),
})

/** Map a full goal analytics response DTO to domain model. */
export const mapGoalAnalytics = (dto: TGoalAnalyticsDto): IGoalAnalytics => ({
  period: toPeriod(dto.period),
  periodStart: dto.period_start,
  periodEnd: dto.period_end,
  stats: {
    totalGoals: dto.stats.total_goals,
    createdInPeriod: dto.stats.created_in_period,
    completedInPeriod: dto.stats.completed_in_period,
    openGoals: dto.stats.open_goals,
    inProgressGoals: dto.stats.in_progress_goals,
    overdueGoals: dto.stats.overdue_goals,
    completionRate: dto.stats.completion_rate,
    overdueRate: dto.stats.overdue_rate,
    avgDaysToComplete: dto.stats.avg_days_to_complete,
  },
  goalsByStatus: {
    open: dto.goals_by_status.open,
    inProgress: dto.goals_by_status.in_progress,
    completed: dto.goals_by_status.completed,
  },
  completionTrend: dto.completion_trend.map(mapCompletionTrendEntry),
})

/** Map a full skill analytics response DTO to domain model. */
export const mapSkillAnalytics = (
  dto: TSkillAnalyticsDto
): ISkillAnalytics => ({
  period: toPeriod(dto.period),
  periodStart: dto.period_start,
  periodEnd: dto.period_end,
  gapClosureSummary: {
    skillsAssessed: dto.gap_closure_summary.skills_assessed,
    skillsWithGaps: dto.gap_closure_summary.skills_with_gaps,
    gapsClosedInPeriod: dto.gap_closure_summary.gaps_closed_in_period,
    gapsWorsenedInPeriod: dto.gap_closure_summary.gaps_worsened_in_period,
    avgGapAtPeriodStart: dto.gap_closure_summary.avg_gap_at_period_start,
    avgGapAtPeriodEnd: dto.gap_closure_summary.avg_gap_at_period_end,
  },
  skills: dto.skills.map(mapSkillRow),
})
