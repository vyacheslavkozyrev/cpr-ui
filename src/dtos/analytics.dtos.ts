/**
 * Analytics DTOs — API Response Layer
 * Mirror the api.md wire format exactly (snake_case fields).
 * Feature 0014 — Performance Analytics & Reporting
 */

// ==================== Shared ====================

/** A single monthly bucket in the completion trend series. */
export interface TCompletionTrendEntryDto {
  period_label: string
  created: number
  completed: number
}

// ==================== Goal Analytics ====================

/** Aggregate goal statistics for the requested period. */
export interface TGoalStatsDto {
  total_goals: number
  created_in_period: number
  completed_in_period: number
  open_goals: number
  in_progress_goals: number
  overdue_goals: number
  completion_rate: number | null
  overdue_rate: number | null
  avg_days_to_complete: number | null
}

/** Current distribution of all non-deleted goals by status. */
export interface TGoalsByStatusDto {
  open: number
  in_progress: number
  completed: number
}

/**
 * Full goal analytics response returned by GET /api/me/analytics/goals
 * and GET /api/employees/{id}/analytics/goals.
 */
export interface TGoalAnalyticsDto {
  period: string
  period_start: string
  period_end: string
  stats: TGoalStatsDto
  goals_by_status: TGoalsByStatusDto
  completion_trend: TCompletionTrendEntryDto[]
}

// ==================== Skill Analytics ====================

/** A single skill history snapshot. */
export interface TSkillHistoryEntryDto {
  recorded_at: string
  self_assessment_value: number
  manager_assessment_value: number | null
}

/** A single skill row in the skill analytics response. */
export interface TSkillRowDto {
  skill_id: string
  skill_title: string
  category_title: string
  current_self_assessment: number
  current_manager_assessment: number | null
  required_level: number | null
  gap: number | null
  history: TSkillHistoryEntryDto[]
}

/** Summary of gap closure activity during the period. */
export interface TGapClosureSummaryDto {
  skills_assessed: number
  skills_with_gaps: number
  gaps_closed_in_period: number
  gaps_worsened_in_period: number
  avg_gap_at_period_start: number | null
  avg_gap_at_period_end: number | null
}

/**
 * Full skill analytics response returned by GET /api/me/analytics/skills
 * and GET /api/employees/{id}/analytics/skills.
 */
export interface TSkillAnalyticsDto {
  period: string
  period_start: string
  period_end: string
  gap_closure_summary: TGapClosureSummaryDto
  skills: TSkillRowDto[]
}
