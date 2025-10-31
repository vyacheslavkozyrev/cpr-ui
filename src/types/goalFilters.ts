/**
 * Goal Filters and Pagination Types
 * Phase 4 - Goals Management System
 */

import type { TGoalStatus, TGoalVisibility } from '../dtos/GoalDto'

// Filter Options

/**
 * Goal Status Filter Options
 * Extends goal statuses with 'all' option
 */
export type TGoalStatusFilter = TGoalStatus | 'all'

/**
 * Goal Visibility Filter Options
 * Extends visibility levels with 'all' option
 */
export type TGoalVisibilityFilter = TGoalVisibility | 'all'

/**
 * Goal Priority Filter Options
 * Priority ranges and 'all' option
 */
export type TGoalPriorityFilter = 'all' | 'high' | 'medium' | 'low'

/**
 * Goal Deadline Filter Options
 * Time-based filtering options
 */
export type TGoalDeadlineFilter =
  | 'all'
  | 'overdue'
  | 'this_week'
  | 'this_month'
  | 'this_quarter'
  | 'no_deadline'

/**
 * Goal Sort Options
 * Available sorting criteria
 */
export type TGoalSortField =
  | 'title'
  | 'status'
  | 'priority'
  | 'deadline'
  | 'createdAt'
  | 'progress'

/**
 * Sort Direction Options
 */
export type TSortDirection = 'asc' | 'desc'

// Filter State Interfaces

/**
 * Goal Filters State
 * Comprehensive filtering options for goals
 */
export interface IGoalFilters {
  status: TGoalStatusFilter
  visibility: TGoalVisibilityFilter
  priority: TGoalPriorityFilter
  deadline: TGoalDeadlineFilter
  search: string // Text search in title/description
  skillId?: string // Filter by related skill
  skillLevelId?: string // Filter by skill level
  employeeId?: string // Filter by employee (manager view)
  hasOverdueTasks: boolean // Filter goals with overdue tasks
  sortBy: TGoalSortField
  sortDirection: TSortDirection
}

/**
 * Default Goal Filters
 * Initial state for goal filters
 */
export const DEFAULT_GOAL_FILTERS: IGoalFilters = {
  status: 'all',
  visibility: 'all',
  priority: 'all',
  deadline: 'all',
  search: '',
  hasOverdueTasks: false,
  sortBy: 'createdAt',
  sortDirection: 'desc',
}

// Pagination Interfaces

/**
 * Pagination State
 * Current pagination parameters
 */
export interface IPaginationState {
  page: number // Current page (1-based)
  per_page: number // Items per page
  total: number // Total items available
  totalPages: number // Total pages available
}

/**
 * Default Pagination State
 * Initial pagination parameters
 */
export const DEFAULT_PAGINATION: IPaginationState = {
  page: 1,
  per_page: 20,
  total: 0,
  totalPages: 0,
}

/**
 * Pagination Request Parameters
 * Parameters sent to API for pagination
 */
export interface IPaginationParams {
  page: number
  per_page: number
}

// Query State Management

/**
 * Goals Query State
 * Combines filters and pagination for API queries
 */
export interface IGoalsQueryState {
  filters: IGoalFilters
  pagination: IPaginationState
}

/**
 * Goals Query Parameters
 * Flattened parameters for API requests
 */
export interface IGoalsQueryParams extends IPaginationParams {
  status?: TGoalStatusFilter
  visibility?: TGoalVisibilityFilter
  search?: string
  skillId?: string
  skillLevelId?: string
  employeeId?: string
  sortBy?: TGoalSortField
  sortDirection?: TSortDirection
  hasOverdueTasks?: boolean
  priority?: TGoalPriorityFilter
  deadline?: TGoalDeadlineFilter
}

// Dashboard Time Period Filters

/**
 * Dashboard Time Period Options
 * Time periods for dashboard statistics
 */
export type TDashboardPeriod = 'week' | 'month' | 'quarter' | 'year'

/**
 * Dashboard Filter State
 * Filters specific to dashboard views
 */
export interface IDashboardFilters {
  period: TDashboardPeriod
  employeeId?: string // For manager dashboard
}

/**
 * Default Dashboard Filters
 */
export const DEFAULT_DASHBOARD_FILTERS: IDashboardFilters = {
  period: 'month',
}

// UI State Interfaces

/**
 * Goals View State
 * UI state for goals management views
 */
export interface IGoalsViewState {
  viewMode: 'list' | 'grid' | 'kanban' // Display mode
  selectedGoalId?: string // Currently selected goal
  expandedGoalIds: Set<string> // Expanded goals in list view
  showFilters: boolean // Filter panel visibility
  showCompletedTasks: boolean // Show/hide completed tasks
  isCreatingGoal: boolean // Goal creation dialog state
  isEditingGoal?: string // Goal being edited (ID)
}

/**
 * Default Goals View State
 */
export const DEFAULT_GOALS_VIEW_STATE: IGoalsViewState = {
  viewMode: 'list',
  expandedGoalIds: new Set(),
  showFilters: false,
  showCompletedTasks: true,
  isCreatingGoal: false,
}

// Task Management State

/**
 * Task Management State
 * UI state for task operations within goals
 */
export interface ITaskManagementState {
  isCreatingTask: Record<string, boolean> // Creating task for goal ID
  isEditingTask: Record<string, string> // Editing task ID for goal ID
  expandedTaskIds: Set<string> // Expanded task details
}

/**
 * Default Task Management State
 */
export const DEFAULT_TASK_MANAGEMENT_STATE: ITaskManagementState = {
  isCreatingTask: {},
  isEditingTask: {},
  expandedTaskIds: new Set(),
}

// Helper Functions for Filters

/**
 * Convert priority number to priority filter category
 */
export function getPriorityCategory(priority?: number): TGoalPriorityFilter {
  if (priority === undefined || priority === null) return 'low'
  if (priority >= 75) return 'high'
  if (priority >= 50) return 'medium'
  return 'low'
}

/**
 * Convert deadline date to deadline filter category
 */
export function getDeadlineCategory(deadline?: string): TGoalDeadlineFilter {
  if (!deadline) return 'no_deadline'

  const deadlineDate = new Date(deadline)
  const now = new Date()
  const diffTime = deadlineDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'overdue'
  if (diffDays <= 7) return 'this_week'
  if (diffDays <= 30) return 'this_month'
  if (diffDays <= 90) return 'this_quarter'
  return 'all'
}

/**
 * Check if goal matches current filters
 */
export function doesGoalMatchFilters(
  goal: {
    status: TGoalStatus
    visibility?: TGoalVisibility
    priority?: number
    deadline?: string
    title: string
    description?: string
  },
  filters: IGoalFilters
): boolean {
  // Status filter
  if (filters.status !== 'all' && goal.status !== filters.status) {
    return false
  }

  // Visibility filter
  if (filters.visibility !== 'all' && goal.visibility !== filters.visibility) {
    return false
  }

  // Priority filter
  if (filters.priority !== 'all') {
    const goalPriority = getPriorityCategory(goal.priority)
    if (goalPriority !== filters.priority) {
      return false
    }
  }

  // Deadline filter
  if (filters.deadline !== 'all') {
    const goalDeadline = getDeadlineCategory(goal.deadline)
    if (goalDeadline !== filters.deadline) {
      return false
    }
  }

  // Search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    const titleMatch = goal.title.toLowerCase().includes(searchLower)
    const descriptionMatch =
      goal.description?.toLowerCase().includes(searchLower) || false
    if (!titleMatch && !descriptionMatch) {
      return false
    }
  }

  return true
}
