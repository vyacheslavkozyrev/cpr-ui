/**
 * Goal Models - Presentation Layer
 * These types represent how goal data is used in the UI components
 * Independent of API response structure
 * Phase 4 - Goals Management System
 */

import type {
  TGoalDto,
  TGoalStatus,
  TGoalTaskDto,
  TGoalVisibility,
} from '../dtos/GoalDto'

/**
 * Goal Model (Client-side)
 * Extends API DTO with computed properties for UI
 */
export interface Goal extends Omit<TGoalDto, 'tasks'> {
  tasks: GoalTask[]
  // Computed properties for UI
  progress: number // Calculated from completed tasks (0-1)
  isOverdue: boolean // Calculated based on deadline
  tasksCompleted: number // Count of completed tasks
  tasksTotal: number // Total tasks count
  daysUntilDeadline?: number // Days until deadline (negative if overdue)
}

/**
 * Goal Task Model (Client-side)
 * Extends API DTO with computed properties for UI
 */
export interface GoalTask extends TGoalTaskDto {
  // Computed properties for UI
  isOverdue: boolean // Calculated based on deadline
  daysUntilDeadline?: number // Days until deadline (negative if overdue)
}

/**
 * Goals Statistics Model (Client-side)
 * Statistical data about user's goals for UI display
 */
export interface GoalsStatistics {
  total: number // Total goals count
  active: number // Active goals count (open + in_progress)
  completed: number // Completed goals count
  overdue: number // Overdue goals count
  completionRate: number // Completion rate (0.0-1.0)
  averageProgress: number // Average progress across all goals (0.0-1.0)
  // Additional computed statistics for UI
  inProgress: number // Goals specifically in progress
  notStarted: number // Goals that are open/not started
}

/**
 * Recent Goal Model (Client-side)
 * Simplified goal data for dashboard display
 */
export interface RecentGoal {
  id: string
  title: string
  status: TGoalStatus
  progress: number
  deadline?: Date // Converted to Date object for UI
  isOverdue: boolean
  daysUntilDeadline?: number
  priority?: number
}

/**
 * Progress Trend Model (Client-side)
 * Used for goal progress charts and trends in UI
 */
export interface ProgressTrend {
  period: string // Time period identifier (e.g., "2024-10", "Week 42")
  periodDisplay: string // Human-readable period (e.g., "October 2024", "Week of Oct 14")
  completed: number // Goals completed in period
  created: number // Goals created in period
  net: number // Net change (completed - created)
}

/**
 * Team Goals Model (Client-side)
 * Aggregated team goals data for managers UI
 */
export interface TeamGoals {
  totalGoals: number
  activeGoals: number
  completedGoals: number
  overdueGoals: number
  averageProgress: number
  goalsByStatus: Record<TGoalStatus, number>
  memberGoals: TeamMemberGoals[]
  // Additional computed properties for UI
  completionRate: number // Team completion rate
  performanceIndex: number // Overall team performance score
}

/**
 * Team Member Goals Model (Client-side)
 * Individual team member's goals data for UI
 */
export interface TeamMemberGoals {
  employeeId: string
  employeeName: string
  totalGoals: number
  activeGoals: number
  completedGoals: number
  overdueGoals: number
  completionRate: number
  averageProgress: number
  // Additional computed properties for UI
  performanceRank?: number // Relative performance ranking
  trend: 'improving' | 'stable' | 'declining' // Performance trend
}

/**
 * Paginated Goals Model (Client-side)
 * Standard pagination wrapper for goals list in UI
 */
export interface PaginatedGoals {
  items: Goal[]
  total: number
  page: number
  perPage: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

/**
 * Goal Summary Model (Client-side)
 * Complete summary data for dashboard integration
 * NOTE: GoalsSummary is now defined in Dashboard.ts for dashboard refactoring
 * This interface can be removed once migration is complete
 */

/**
 * Goal Insights Model (Client-side)
 * Analytical insights derived from goal data for UI
 */
export interface GoalInsights {
  mostActiveSkill?: string // Skill with most associated goals
  averageDaysToComplete?: number // Average days to complete goals
  upcomingDeadlines: Goal[] // Goals with deadlines in next 7 days
  staleGoals: Goal[] // Goals not updated in 30+ days
  recommendations: GoalRecommendation[]
}

/**
 * Goal Recommendation Model (Client-side)
 * AI/system-generated recommendations for goal management
 */
export interface GoalRecommendation {
  type: 'create' | 'update' | 'complete' | 'deadline'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  actionText?: string
  goalId?: string // Related goal if applicable
}

// Utility types for goal operations

/**
 * Goal Creation Input (Client-side)
 * Data needed to create a new goal in UI forms
 */
export interface GoalCreationInput {
  title: string
  description?: string
  deadline?: Date // Date object for UI date pickers
  relatedSkillId?: string
  relatedSkillLevelId?: string
  priority?: number
  visibility?: TGoalVisibility
}

/**
 * Goal Update Input (Client-side)
 * Data for updating goals in UI forms
 */
export interface GoalUpdateInput extends Partial<GoalCreationInput> {
  status?: TGoalStatus
}

/**
 * Task Creation Input (Client-side)
 * Data needed to create a new task in UI forms
 */
export interface TaskCreationInput {
  title: string
  description?: string
  deadline?: Date // Date object for UI date pickers
}

/**
 * Task Update Input (Client-side)
 * Data for updating tasks in UI forms
 */
export interface TaskUpdateInput extends Partial<TaskCreationInput> {
  isCompleted?: boolean
}

/**
 * Helper function to convert Goal DTO to Goal Model
 */
export function convertGoalDtoToGoal(goalDto: TGoalDto): Goal {
  const tasks = goalDto.tasks || []
  const completedTasks = tasks.filter(task => task.isCompleted).length
  const totalTasks = tasks.length
  const progress = totalTasks > 0 ? completedTasks / totalTasks : 0

  const now = new Date()
  const deadline = goalDto.deadline ? new Date(goalDto.deadline) : null
  const isOverdue = deadline
    ? deadline < now && goalDto.status !== 'completed'
    : false

  const daysUntilDeadline = deadline
    ? Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : undefined

  return {
    ...goalDto,
    tasks: tasks.map(convertGoalTaskDtoToGoalTask),
    progress,
    isOverdue,
    tasksCompleted: completedTasks,
    tasksTotal: totalTasks,
    ...(daysUntilDeadline !== undefined && { daysUntilDeadline }),
  }
}

/**
 * Helper function to convert Goal Task DTO to Goal Task Model
 */
export function convertGoalTaskDtoToGoalTask(taskDto: TGoalTaskDto): GoalTask {
  const now = new Date()
  const deadline = taskDto.deadline ? new Date(taskDto.deadline) : null
  const isOverdue = deadline ? deadline < now && !taskDto.isCompleted : false
  const daysUntilDeadline = deadline
    ? Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : undefined

  return {
    ...taskDto,
    isOverdue,
    ...(daysUntilDeadline !== undefined && { daysUntilDeadline }),
  }
}

/**
 * Helper function to convert Goal Creation Input to Create Goal DTO
 */
export function convertGoalCreationInputToDto(
  input: GoalCreationInput
): import('../dtos/GoalDto').TCreateGoalDto {
  return {
    title: input.title,
    ...(input.description && { description: input.description }),
    ...(input.deadline && { deadline: input.deadline.toISOString() }),
    ...(input.relatedSkillId && { relatedSkillId: input.relatedSkillId }),
    ...(input.relatedSkillLevelId && {
      relatedSkillLevelId: input.relatedSkillLevelId,
    }),
    ...(input.priority !== undefined && { priority: input.priority }),
    ...(input.visibility && { visibility: input.visibility }),
  }
}

/**
 * Helper function to convert Goal Update Input to Update Goal DTO
 */
export function convertGoalUpdateInputToDto(
  input: GoalUpdateInput
): import('../dtos/GoalDto').TUpdateGoalDto {
  return {
    ...(input.title && { title: input.title }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.deadline && { deadline: input.deadline.toISOString() }),
    ...(input.status && { status: input.status }),
    ...(input.relatedSkillId && { relatedSkillId: input.relatedSkillId }),
    ...(input.relatedSkillLevelId && {
      relatedSkillLevelId: input.relatedSkillLevelId,
    }),
    ...(input.priority !== undefined && { priority: input.priority }),
    ...(input.visibility && { visibility: input.visibility }),
  }
}
