/**
 * Analytics Models — Presentation Layer
 * CamelCase, UI-friendly types independent of API wire format.
 * Feature 0014 — Performance Analytics & Reporting
 */

// ==================== Enums ====================

/**
 * Valid period values for analytics time range selection (AC-025).
 */
export const EAnalyticsPeriod = {
  LAST_30_DAYS: 'last_30_days',
  LAST_90_DAYS: 'last_90_days',
  LAST_180_DAYS: 'last_180_days',
  LAST_QUARTER: 'last_quarter',
  LAST_YEAR: 'last_year',
} as const

export type EAnalyticsPeriod =
  (typeof EAnalyticsPeriod)[keyof typeof EAnalyticsPeriod]

// ==================== Goal Analytics ====================

/** A single monthly bucket in the completion trend series. */
export interface ICompletionTrendEntry {
  periodLabel: string
  created: number
  completed: number
}

/** Aggregate goal statistics for the requested period. */
export interface IGoalStats {
  totalGoals: number
  createdInPeriod: number
  completedInPeriod: number
  openGoals: number
  inProgressGoals: number
  overdueGoals: number
  completionRate: number | null
  overdueRate: number | null
  avgDaysToComplete: number | null
}

/** Current distribution of all non-deleted goals by status. */
export interface IGoalsByStatus {
  open: number
  inProgress: number
  completed: number
}

/** Full goal analytics domain model. */
export interface IGoalAnalytics {
  period: EAnalyticsPeriod
  periodStart: string
  periodEnd: string
  stats: IGoalStats
  goalsByStatus: IGoalsByStatus
  completionTrend: ICompletionTrendEntry[]
}

// ==================== Skill Analytics ====================

/** A single skill history snapshot. */
export interface ISkillHistoryEntry {
  recordedAt: string
  selfAssessmentValue: number
  managerAssessmentValue: number | null
}

/** Gap colour coding for a skill row. */
export type TGapColor = 'success' | 'warning' | 'error' | 'default'

/** A single skill row in the skill analytics domain model. */
export interface ISkillRow {
  skillId: string
  skillTitle: string
  categoryTitle: string
  currentSelfAssessment: number
  currentManagerAssessment: number | null
  requiredLevel: number | null
  gap: number | null
  /** Colour coding derived from gap value for UI display. */
  gapColor: TGapColor
  history: ISkillHistoryEntry[]
}

/** Summary of gap closure activity during the period. */
export interface IGapClosureSummary {
  skillsAssessed: number
  skillsWithGaps: number
  gapsClosedInPeriod: number
  gapsWorsenedInPeriod: number
  avgGapAtPeriodStart: number | null
  avgGapAtPeriodEnd: number | null
}

/** Full skill analytics domain model. */
export interface ISkillAnalytics {
  period: EAnalyticsPeriod
  periodStart: string
  periodEnd: string
  gapClosureSummary: IGapClosureSummary
  skills: ISkillRow[]
}
