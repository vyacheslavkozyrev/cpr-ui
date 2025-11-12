/**
 * Goal DTOs - API Response Layer
 * These types match the exact structure from API responses
 * Used for data transfer and transformation only
 * Phase 4 - Goals Management System
 */

// Goal visibility levels (matching API enum)
export type TGoalVisibility = 'private' | 'team' | 'org'

// Goal status options (matching API enum)
export type TGoalStatus = 'open' | 'in_progress' | 'completed'

/**
 * Create Goal Data Transfer Object
 * Used when creating a new goal via API
 */
export interface TCreateGoalDto {
  title: string // Required, 1-250 characters
  description?: string // Optional, max 2000 characters
  deadline?: string // Optional, ISO date format
  relatedSkillId?: string // Optional, UUID format
  relatedSkillLevelId?: string // Optional, UUID format
  employeeId?: string // Optional, UUID format (admin override)
  priority?: number // Optional, 0-100 integer
  visibility?: TGoalVisibility // Optional, enum values
}

/**
 * Update Goal Data Transfer Object
 * Used when partially updating an existing goal via API
 */
export interface TUpdateGoalDto {
  title?: string // Optional, 1-250 characters
  description?: string // Optional, max 2000 characters
  deadline?: string // Optional, ISO datetime format
  status?: TGoalStatus // Optional, enum values
  relatedSkillId?: string // Optional, UUID format
  relatedSkillLevelId?: string // Optional, UUID format
  priority?: number // Optional, 0-100 integer
  visibility?: TGoalVisibility // Optional, enum values
}

/**
 * Goal Data Transfer Object (API Response)
 * Complete goal object from API with tasks and metadata
 */
export interface TGoalDto {
  id: string // UUID format
  employeeId: string // UUID format
  title: string // Goal title
  description?: string // Goal description
  status: TGoalStatus // Current status
  deadline?: string // ISO datetime format
  relatedSkillId?: string // UUID format
  relatedSkillLevelId?: string // UUID format
  priority?: number // 0-100 integer
  visibility?: string // Visibility level
  isCompleted: boolean // Completion status
  completedAt?: string // ISO datetime format
  progressPercent: number // Progress percentage (0.00-100.00)
  createdAt: string // ISO datetime format
  modifiedAt?: string // ISO datetime format (Constitutional Principle 11)
  tasks?: TGoalTaskDto[] // Array of associated tasks (optional in list responses)
}

// Goal Task DTOs

/**
 * Create Goal Task Data Transfer Object
 * Used when adding a new task to a goal via API
 */
export interface TCreateGoalTaskDto {
  title: string // Required, 1-250 characters
  description?: string // Optional, max 2000 characters
  deadline?: string // Optional, ISO datetime format
}

/**
 * Update Goal Task Data Transfer Object
 * Used when updating an existing goal task via API
 */
export interface TUpdateGoalTaskDto {
  title?: string // Optional, 1-250 characters
  description?: string // Optional, max 2000 characters
  deadline?: string // Optional, ISO datetime format
  isCompleted?: boolean // Optional, completion status
}

/**
 * Goal Task Data Transfer Object (API Response)
 * Complete task object with metadata from API
 */
export interface TGoalTaskDto {
  id: string // UUID format
  goalId: string // UUID format
  title: string // Task title
  description?: string // Task description
  deadline?: string // ISO datetime format
  isCompleted: boolean // Completion status
  completedAt?: string // ISO datetime format
  createdAt: string // ISO datetime format
  modifiedAt?: string // ISO datetime format (Constitutional Principle 11)
}

// Dashboard Integration DTOs

/**
 * Goals Summary for Dashboard (API Response)
 * Provides comprehensive goal statistics and recent activity
 * NOTE: TGoalsSummaryDto is now defined in DashboardDto.ts for dashboard refactoring
 * This interface can be removed once migration is complete
 */
export interface TLegacyGoalsSummaryDto {
  statistics: TGoalsStatisticsDto
  recentGoals?: TRecentGoalDto[]
  progressTrend?: TProgressTrendDto[]
}

/**
 * Goals Statistics (API Response)
 * Statistical data about user's goals from API
 */
export interface TGoalsStatisticsDto {
  total: number // Total goals count
  active: number // Active goals count
  completed: number // Completed goals count
  overdue: number // Overdue goals count
  completionRate: number // Completion rate (0.0-1.0)
  averageProgress: number // Average progress (0.0-1.0)
}

/**
 * Recent Goal Summary (API Response)
 * Simplified goal data for dashboard display from API
 */
export interface TRecentGoalDto {
  id: string // UUID format
  title: string // Goal title
  status: string // Goal status
  progress: number // Progress (0.0-1.0)
  deadline?: string // ISO datetime format
  isOverdue: boolean // Overdue flag
}

/**
 * Progress Trend Data (API Response)
 * Used for goal progress charts and trends from API
 */
export interface TProgressTrendDto {
  period: string // Time period identifier
  completed: number // Goals completed in period
  created: number // Goals created in period
}

// Team Management DTOs (People Manager+)

/**
 * Team Goals Overview (API Response)
 * Aggregated team goals data for managers from API
 */
export interface TTeamGoalsDto {
  totalGoals: number // Total team goals
  activeGoals: number // Active team goals
  completedGoals: number // Completed team goals
  overdueGoals: number // Overdue team goals
  averageProgress: number // Average team progress
  goalsByStatus?: Record<string, number> // Goals grouped by status
  memberGoals?: TTeamMemberGoalsDto[] // Per-member breakdown
}

/**
 * Team Member Goals Summary (API Response)
 * Individual team member's goals data from API
 */
export interface TTeamMemberGoalsDto {
  employeeId: string // UUID format
  employeeName: string // Employee display name
  totalGoals: number // Total goals count
  activeGoals: number // Active goals count
  completedGoals: number // Completed goals count
  overdueGoals: number // Overdue goals count
  completionRate: number // Individual completion rate
  averageProgress: number // Individual average progress
}

// Pagination Response DTOs

/**
 * Paginated Goals Response (API Response)
 * Standard pagination wrapper for goals list from API
 */
export interface TPaginatedGoalsResponseDto {
  items: TGoalDto[]
  total: number
  page: number
  per_page: number
}

// Error Response DTOs

/**
 * API Error Response (API Response)
 * Standard error format from backend API
 */
export interface TGoalApiErrorDto {
  type: string
  title: string
  status: number
  errors?: Record<string, string[]>
  detail?: string
}
