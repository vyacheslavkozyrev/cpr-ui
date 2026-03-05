/**
 * Review Cycle Types — 360-Degree Feedback Feature (0006)
 * Field names match wire format (snake_case) from the API.
 */

export const EReviewCycleStatus = {
  DRAFT: 'draft',
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  CLOSED: 'closed',
} as const
export type EReviewCycleStatus =
  (typeof EReviewCycleStatus)[keyof typeof EReviewCycleStatus]

export const EReviewNomineeStatus = {
  PENDING: 'pending',
  INVITED: 'invited',
  SUBMITTED: 'submitted',
} as const
export type EReviewNomineeStatus =
  (typeof EReviewNomineeStatus)[keyof typeof EReviewNomineeStatus]

export interface ICommentItem {
  overall_rating: number
  comments: string
}

export interface IPagination {
  page: number
  page_size: number
  total_items: number
  total_pages: number
}

export interface IPaginatedResponse<T> {
  data: T[]
  pagination: IPagination
}

export interface IReviewCycleSummary {
  id: string
  title: string
  subject_display_name: string
  status: EReviewCycleStatus
  nominee_count: number
  response_count: number
  created_at: string
  closed_at: string | null
}

export interface IReviewCycleDetail {
  id: string
  title: string
  description: string | null
  subject_employee_id: string
  subject_display_name: string
  department_id: string
  status: EReviewCycleStatus
  nominee_count: number
  response_count: number
  opened_at: string | null
  started_at: string | null
  closed_at: string | null
  created_at: string
  created_by: string | null
}

export interface IReviewCycleStatusTransition {
  id: string
  title: string
  status: EReviewCycleStatus
  opened_at: string | null
  started_at: string | null
  closed_at: string | null
}

export interface IReviewNominee {
  id: string
  cycle_id: string
  reviewer_employee_id: string
  reviewer_display_name: string
  nominated_by: string
  nominated_by_display_name: string
  status: EReviewNomineeStatus
  created_at: string
}

export interface IReviewResponse {
  id: string
  cycle_id: string
  nominee_id: string
  overall_rating: number
  comments: string
  created_at: string
}

export interface IDetailedResponseItem {
  reviewer_display_name: string
  reviewer_employee_id: string
  overall_rating: number
  comments: string
  submitted_at: string
}

export interface IAggregatedResults {
  view: 'aggregated'
  cycle_id: string
  cycle_title: string
  status: EReviewCycleStatus
  average_rating: number
  response_count: number
  comments: ICommentItem[]
}

export interface IDetailedResults {
  view: 'detailed'
  cycle_id: string
  cycle_title: string
  subject_display_name: string
  status: EReviewCycleStatus
  average_rating: number
  response_count: number
  responses: IDetailedResponseItem[]
}

export interface IReviewRequest {
  cycle_id: string
  cycle_title: string
  subject_display_name: string
  nominee_status: EReviewNomineeStatus
  cycle_started_at: string | null
}

// Request interfaces
export interface ICreateReviewCycleRequest {
  title: string
  subject_employee_id: string
  description?: string
}

export interface ITransitionStatusRequest {
  status: 'open' | 'in_progress' | 'closed'
}

export interface IAddNomineeRequest {
  reviewer_employee_id: string
}

export interface ISubmitResponseRequest {
  overall_rating: number
  comments: string
}

export interface IListReviewCyclesParams {
  page?: number
  page_size?: number
  status?: string
  sort_dir?: 'asc' | 'desc'
}
