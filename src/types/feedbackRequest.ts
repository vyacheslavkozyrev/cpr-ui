// TypeScript types for Feedback Request Management feature (F0004)
// These types match the C# DTOs in CPR.Application.Contracts.FeedbackDtos.cs

/**
 * DTO for creating a new feedback request with multiple recipients (1-20)
 */
export interface CreateFeedbackRequestDto {
  /** List of employee IDs to request feedback from (1-20 recipients) */
  employee_ids: string[]
  /** Optional project context for the feedback request */
  project_id?: string | null
  /** Optional goal context for the feedback request */
  goal_id?: string | null
  /** Optional message explaining the feedback request (max 500 characters) */
  message?: string | null
  /** Optional due date for the feedback response (ISO 8601 format) */
  due_date?: string | null
}

/**
 * DTO for feedback request details with multi-recipient support
 */
export interface FeedbackRequestDto {
  /** Feedback request identifier */
  id: string
  /** Employee ID who made the request */
  requestor_id: string
  /** Optional project context */
  project_id?: string | null
  /** Optional goal context */
  goal_id?: string | null
  /** Optional request message (max 500 characters) */
  message?: string | null
  /** Optional due date for response (ISO 8601 format) */
  due_date?: string | null
  /** When the request was created (ISO 8601 format) */
  created_at: string
  /** When the request was last updated (ISO 8601 format) */
  updated_at: string
  /** User ID who created the request */
  created_by?: string | null
  /** Whether the request has been soft-deleted */
  is_deleted: boolean
  /** List of recipients with individual status tracking */
  recipients: FeedbackRequestRecipientDto[]
  /** Requestor employee details */
  requestor?: EmployeeSummaryDto | null
  /** Project details (if provided) */
  project?: ProjectSummaryDto | null
  /** Goal details (if provided) */
  goal?: GoalSummaryDto | null
  /** Request status summary */
  status: 'pending' | 'partial' | 'complete' | 'cancelled'
  /** Count of recipients who have responded */
  responded_count: number
  /** Total count of recipients */
  total_recipients: number
}

/**
 * DTO for individual recipient status within a feedback request
 */
export interface FeedbackRequestRecipientDto {
  /** Recipient record identifier */
  id: string
  /** Parent feedback request ID */
  feedback_request_id: string
  /** Employee ID of the recipient */
  employee_id: string
  /** Whether the recipient has completed their response */
  is_completed: boolean
  /** When the recipient responded (ISO 8601 format, null if not yet responded) */
  responded_at?: string | null
  /** When the last reminder was sent to this recipient (ISO 8601 format, null if never reminded) */
  last_reminder_at?: string | null
  /** When this recipient record was created (ISO 8601 format) */
  created_at: string
  /** When this recipient record was last updated (ISO 8601 format) */
  updated_at: string
  /** Recipient employee details */
  employee?: EmployeeSummaryDto | null
  /** Recipient status badge */
  status: 'pending' | 'overdue' | 'responded' | 'cancelled'
  /** Feedback ID if recipient has responded (null if not responded) */
  feedback_id?: string | null
}

/**
 * DTO for updating a feedback request (only due_date can be updated)
 */
export interface UpdateFeedbackRequestDto {
  /** Updated due date for the feedback response (ISO 8601 format) */
  due_date?: string | null
}

/**
 * DTO for feedback request list item (lightweight version for paginated lists)
 */
export interface FeedbackRequestListDto {
  /** Feedback request identifier */
  id: string
  /** Employee ID who made the request */
  requestor_id: string
  /** Message preview (first 100 characters) */
  message_preview?: string | null
  /** Optional due date (ISO 8601 format) */
  due_date?: string | null
  /** When the request was created (ISO 8601 format) */
  created_at: string
  /** Request status summary */
  status: 'pending' | 'partial' | 'complete' | 'cancelled'
  /** Count of recipients who have responded */
  responded_count: number
  /** Total count of recipients */
  total_recipients: number
  /** Whether any recipient is overdue */
  has_overdue: boolean
  /** Requestor employee details */
  requestor?: EmployeeSummaryDto | null
  /** Project details (if provided) */
  project?: ProjectSummaryDto | null
  /** Goal details (if provided) */
  goal?: GoalSummaryDto | null
  /** First 3 recipients for preview (collapsed view) */
  recipients_preview: FeedbackRequestRecipientDto[]
}

/**
 * DTO for pagination metadata
 */
export interface PaginationDto {
  /** Current page number (1-based) */
  page: number
  /** Number of items per page */
  page_size: number
  /** Total number of items across all pages */
  total_items: number
  /** Total number of pages */
  total_pages: number
  /** Whether there is a previous page */
  has_previous: boolean
  /** Whether there is a next page */
  has_next: boolean
}

/**
 * DTO for paginated feedback request list response
 */
export interface PaginatedFeedbackRequestsDto {
  /** List of feedback requests for the current page */
  data: FeedbackRequestListDto[]
  /** Pagination metadata */
  pagination: PaginationDto
  /** Summary statistics */
  summary: FeedbackRequestSummaryDto
}

/**
 * DTO for feedback request summary statistics
 */
export interface FeedbackRequestSummaryDto {
  /** Total count of active (non-deleted) requests */
  total_active: number
  /** Count of requests with all recipients pending */
  pending_count: number
  /** Count of requests with some recipients responded */
  partial_count: number
  /** Count of requests with all recipients responded */
  complete_count: number
  /** Count of requests with any overdue recipient */
  overdue_count: number
}

/**
 * Summary DTO for employee information
 */
export interface EmployeeSummaryDto {
  /** Employee identifier */
  id: string
  /** Employee display name */
  display_name: string
  /** Employee email */
  email?: string | null
  /** Job title */
  job_title?: string | null
  /** Department name */
  department?: string | null
}

/**
 * Summary DTO for project information
 */
export interface ProjectSummaryDto {
  /** Project identifier */
  id: string
  /** Project name */
  name: string
  /** Project description */
  description?: string | null
}

/**
 * Summary DTO for goal information
 */
export interface GoalSummaryDto {
  /** Goal identifier */
  id: string
  /** Goal title */
  title: string
  /** Goal description */
  description?: string | null
}

/**
 * Query parameters for listing feedback requests
 */
export interface FeedbackRequestListQuery {
  /** Current page number (1-based) */
  page?: number
  /** Number of items per page (max: 100) */
  page_size?: number
  /** Sort field */
  sort_by?: 'created_at' | 'due_date' | 'updated_at'
  /** Sort order */
  sort_order?: 'asc' | 'desc'
  /** Filter by status */
  status?: 'pending' | 'partial' | 'complete' | 'cancelled' | 'overdue'
  /** Search in message content */
  search?: string
}
