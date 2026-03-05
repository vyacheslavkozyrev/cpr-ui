// TypeScript types for Feedback Submission & Collection feature (F0005)
// These types match the C# DTOs in CPR.Application.Contracts

/**
 * Rating values for feedback (1-5 scale)
 */
export const RatingValue = {
  NeedsImprovement: 1,
  BelowExpectations: 2,
  MeetsExpectations: 3,
  ExceedsExpectations: 4,
  Outstanding: 5,
} as const

export type RatingValue = (typeof RatingValue)[keyof typeof RatingValue]

/**
 * Sort field options for feedback list
 */
export const FeedbackSortField = {
  CreatedAt: 'created_at',
  Rating: 'rating',
  FromEmployee: 'from_employee',
  Goal: 'goal',
  Project: 'project',
} as const

export type FeedbackSortField =
  (typeof FeedbackSortField)[keyof typeof FeedbackSortField]

/**
 * Sort order options
 */
export const SortOrder = {
  Asc: 'asc',
  Desc: 'desc',
} as const

export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]

/**
 * DTO for submitting feedback
 * Matches: SubmitFeedbackRequestDto in CPR.Application.Contracts
 */
export interface SubmitFeedbackRequest {
  /** Employee ID receiving the feedback */
  employee_id: string
  /** Goal ID this feedback is associated with (required) */
  goal_id: string
  /** Optional project ID this feedback is associated with */
  project_id?: string | null
  /** Feedback content (10-2000 characters, plain text) */
  content: string
  /** Rating value (1-5 scale) */
  rating: RatingValue
  /** Optional feedback request ID if responding to a request */
  feedback_request_id?: string | null
}

/**
 * DTO for full feedback details
 * Matches: FeedbackDto in CPR.Application.Contracts
 */
export interface Feedback {
  /** Feedback identifier */
  id: string
  /** Goal this feedback is associated with */
  goal_id: string
  /** Optional project this feedback is associated with */
  project_id?: string | null
  /** Employee who gave the feedback */
  from_employee_id: string
  /** Employee who received the feedback */
  to_employee_id: string
  /** Feedback content (plain text) */
  content: string
  /** Rating value (1-5) */
  rating: number
  /** When the feedback was created (ISO 8601 format) */
  created_at: string
  /** Goal details */
  goal: GoalSummaryDto
  /** Project details (if provided) */
  project?: ProjectSummaryDto | null
  /** From employee details */
  from_employee: EmployeeSummaryDto
  /** To employee details */
  to_employee: EmployeeSummaryDto
  /** Optional feedback request ID if this was a response to a request */
  feedback_request_id?: string | null
}

/**
 * DTO for feedback received by current user
 * Matches: MyFeedbackDto in CPR.Application.Contracts
 */
export interface MyFeedback {
  /** Feedback identifier */
  id: string
  /** Goal this feedback is associated with */
  goal_id: string
  /** Optional project this feedback is associated with */
  project_id?: string | null
  /** Employee who gave the feedback */
  from_employee_id: string
  /** Feedback content (plain text) */
  content: string
  /** Rating value (1-5) */
  rating: number
  /** When the feedback was created (ISO 8601 format) */
  created_at: string
  /** Goal details */
  goal: GoalSummaryDto
  /** Project details (if provided) */
  project?: ProjectSummaryDto | null
  /** From employee details */
  from_employee: EmployeeSummaryDto
}

/**
 * Filter options for feedback list
 */
export interface FeedbackFilters {
  /** Filter by date range - start date (ISO 8601) */
  date_from?: string | null
  /** Filter by date range - end date (ISO 8601) */
  date_to?: string | null
  /** Filter by rating value (1-5) */
  rating?: RatingValue | null
  /** Filter by goal ID */
  goal_id?: string | null
  /** Filter by project ID */
  project_id?: string | null
  /** Filter by feedback provider (from_employee_id) */
  from_employee_id?: string | null
  /** Search term (searches in content, goal title, project title, employee names) */
  search?: string | null
}

/**
 * Sort options for feedback list
 */
export interface FeedbackSortOptions {
  /** Field to sort by */
  sort_by: FeedbackSortField
  /** Sort order (asc/desc) */
  sort_order: SortOrder
}

/**
 * Date range helper type
 */
export interface DateRange {
  /** Start date (ISO 8601) */
  from: string
  /** End date (ISO 8601) */
  to: string
  /** Human-readable label for the range */
  label: string
}

/**
 * Feedback analytics data
 */
export interface FeedbackAnalytics {
  /** Total feedback received */
  total_count: number
  /** Average rating (1-5, decimal) */
  average_rating: number
  /** Rating distribution (count per rating value) */
  rating_distribution: RatingDistribution
  /** Monthly feedback trend (last 12 months) */
  monthly_trend: MonthlyFeedbackTrend[]
  /** Top feedback providers */
  top_providers: TopProvider[]
  /** Goals with most feedback */
  top_goals: TopGoal[]
  /** Projects with most feedback */
  top_projects: TopProject[]
  /** Comparison data (if enabled) */
  comparison?: ComparisonData | null
}

/**
 * Rating distribution (count per rating value)
 */
export interface RatingDistribution {
  /** Count of 1-star ratings */
  one_star: number
  /** Count of 2-star ratings */
  two_star: number
  /** Count of 3-star ratings */
  three_star: number
  /** Count of 4-star ratings */
  four_star: number
  /** Count of 5-star ratings */
  five_star: number
}

/**
 * Monthly feedback trend data point
 */
export interface MonthlyFeedbackTrend {
  /** Month identifier (YYYY-MM format) */
  month: string
  /** Count of feedback received in this month */
  count: number
  /** Average rating for this month */
  average_rating: number
}

/**
 * Top feedback provider
 */
export interface TopProvider {
  /** Employee details */
  employee: EmployeeSummaryDto
  /** Number of feedback items from this employee */
  count: number
  /** Average rating from this employee */
  average_rating: number
}

/**
 * Goal with most feedback
 */
export interface TopGoal {
  /** Goal details */
  goal: GoalSummaryDto
  /** Number of feedback items for this goal */
  count: number
  /** Average rating for this goal */
  average_rating: number
}

/**
 * Project with most feedback
 */
export interface TopProject {
  /** Project details */
  project: ProjectSummaryDto
  /** Number of feedback items for this project */
  count: number
  /** Average rating for this project */
  average_rating: number
}

/**
 * Comparison data for analytics (current vs previous period)
 */
export interface ComparisonData {
  /** Previous period total count */
  previous_total: number
  /** Previous period average rating */
  previous_average_rating: number
  /** Delta percentage for total count */
  total_delta_percent: number
  /** Delta value for average rating */
  rating_delta: number
  /** Previous period start date (ISO 8601) */
  previous_period_start: string
  /** Previous period end date (ISO 8601) */
  previous_period_end: string
}

/**
 * Employee summary (shared type)
 */
export interface EmployeeSummaryDto {
  id: string
  display_name: string
  email?: string | null
  job_title?: string | null
  department?: string | null
}

/**
 * Goal summary (shared type)
 */
export interface GoalSummaryDto {
  id: string
  title: string
  description?: string | null
  status?: string | null
  deadline?: string | null
  progress?: number | null
}

/**
 * Project summary (shared type)
 */
export interface ProjectSummaryDto {
  id: string
  name: string
  description?: string | null
  status?: string | null
}
