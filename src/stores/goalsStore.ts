import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type {
  TGoalDto,
  TGoalsSummaryDto,
  TPaginatedGoalsResponseDto,
  TTeamGoalsDto,
} from '../dtos/GoalDto'
import type { Goal, GoalTask } from '../models/Goal'
import { convertGoalDtoToGoal } from '../models/Goal'
import type {
  IDashboardFilters,
  IGoalFilters,
  IGoalsViewState,
  IPaginationState,
  ITaskManagementState,
} from '../types/goalFilters'
import {
  DEFAULT_DASHBOARD_FILTERS,
  DEFAULT_GOAL_FILTERS,
  DEFAULT_GOALS_VIEW_STATE,
  DEFAULT_PAGINATION,
  DEFAULT_TASK_MANAGEMENT_STATE,
} from '../types/goalFilters'
import { logger } from '../utils/logger'

/**
 * Goals Store Interface
 * Manages goals data, filters, pagination, and UI state
 * Phase 4 - Goals Management System
 */
export interface IGoalsStore {
  // ========================================
  // Data State
  // ========================================

  // Goals data
  goals: Goal[]
  selectedGoal: Goal | null
  goalsSummary: TGoalsSummaryDto | null
  teamGoals: TTeamGoalsDto | null

  // Loading states
  isLoading: boolean
  isCreatingGoal: boolean
  isUpdatingGoal: boolean
  isDeletingGoal: boolean
  isLoadingSummary: boolean
  isLoadingTeamGoals: boolean

  // Error states
  error: string | null
  goalError: string | null

  // ========================================
  // Filters and Pagination
  // ========================================

  filters: IGoalFilters
  pagination: IPaginationState
  dashboardFilters: IDashboardFilters

  // ========================================
  // UI State Management
  // ========================================

  viewState: IGoalsViewState
  taskManagement: ITaskManagementState

  // ========================================
  // Data Actions
  // ========================================

  // Goals management
  setGoals: (goals: Goal[]) => void
  addGoal: (goal: Goal) => void
  updateGoal: (goalId: string, updates: Partial<Goal>) => void
  removeGoal: (goalId: string) => void
  setSelectedGoal: (goal: Goal | null) => void

  // Goal tasks management
  addTaskToGoal: (goalId: string, task: GoalTask) => void
  updateTaskInGoal: (
    goalId: string,
    taskId: string,
    updates: Partial<GoalTask>
  ) => void
  removeTaskFromGoal: (goalId: string, taskId: string) => void

  // Summary and team data
  setGoalsSummary: (summary: TGoalsSummaryDto) => void
  setTeamGoals: (teamGoals: TTeamGoalsDto) => void

  // ========================================
  // Loading State Actions
  // ========================================

  setLoading: (loading: boolean) => void
  setCreatingGoal: (creating: boolean) => void
  setUpdatingGoal: (updating: boolean) => void
  setDeletingGoal: (deleting: boolean) => void
  setLoadingSummary: (loading: boolean) => void
  setLoadingTeamGoals: (loading: boolean) => void

  // ========================================
  // Error State Actions
  // ========================================

  setError: (error: string | null) => void
  setGoalError: (error: string | null) => void
  clearErrors: () => void

  // ========================================
  // Filter and Pagination Actions
  // ========================================

  updateFilters: (updates: Partial<IGoalFilters>) => void
  resetFilters: () => void
  updatePagination: (updates: Partial<IPaginationState>) => void
  setPaginationFromResponse: (response: TPaginatedGoalsResponseDto) => void
  updateDashboardFilters: (updates: Partial<IDashboardFilters>) => void

  // ========================================
  // UI State Actions
  // ========================================

  updateViewState: (updates: Partial<IGoalsViewState>) => void
  setViewMode: (mode: 'list' | 'grid' | 'kanban') => void
  toggleGoalExpansion: (goalId: string) => void
  setShowFilters: (show: boolean) => void
  setShowCompletedTasks: (show: boolean) => void

  // Task management UI state
  updateTaskManagement: (updates: Partial<ITaskManagementState>) => void
  setCreatingTask: (goalId: string, creating: boolean) => void
  setEditingTask: (goalId: string, taskId: string | null) => void
  toggleTaskExpansion: (taskId: string) => void

  // ========================================
  // Computed Properties and Helpers
  // ========================================

  // Get filtered goals based on current filters
  getFilteredGoals: () => Goal[]

  // Get goals statistics
  getGoalsStatistics: () => {
    total: number
    completed: number
    active: number
    overdue: number
    completionRate: number
  }

  // Check if goal is expanded
  isGoalExpanded: (goalId: string) => boolean

  // Check if task is expanded
  isTaskExpanded: (taskId: string) => boolean

  // Utility methods
  reset: () => void
}

// Conversion function is now imported from ../models/Goal.ts

/**
 * Goals Store Implementation
 */
export const useGoalsStore = create<IGoalsStore>()(
  subscribeWithSelector((set, get) => ({
    // ========================================
    // Initial State
    // ========================================

    // Data state
    goals: [],
    selectedGoal: null,
    goalsSummary: null,
    teamGoals: null,

    // Loading states
    isLoading: false,
    isCreatingGoal: false,
    isUpdatingGoal: false,
    isDeletingGoal: false,
    isLoadingSummary: false,
    isLoadingTeamGoals: false,

    // Error states
    error: null,
    goalError: null,

    // Filters and pagination
    filters: DEFAULT_GOAL_FILTERS,
    pagination: DEFAULT_PAGINATION,
    dashboardFilters: DEFAULT_DASHBOARD_FILTERS,

    // UI state
    viewState: DEFAULT_GOALS_VIEW_STATE,
    taskManagement: DEFAULT_TASK_MANAGEMENT_STATE,

    // ========================================
    // Data Actions Implementation
    // ========================================

    setGoals: goals => {
      logger.debug('Goals store: Setting goals', { count: goals.length })
      set({ goals })
    },

    addGoal: goal => {
      logger.debug('Goals store: Adding goal', {
        goalId: goal.id,
        title: goal.title,
      })
      set(state => ({
        goals: [goal, ...state.goals],
      }))
    },

    updateGoal: (goalId, updates) => {
      logger.debug('Goals store: Updating goal', { goalId, updates })
      set(state => ({
        goals: state.goals.map(goal =>
          goal.id === goalId ? { ...goal, ...updates } : goal
        ),
        selectedGoal:
          state.selectedGoal?.id === goalId
            ? { ...state.selectedGoal, ...updates }
            : state.selectedGoal,
      }))
    },

    removeGoal: goalId => {
      logger.debug('Goals store: Removing goal', { goalId })
      set(state => ({
        goals: state.goals.filter(goal => goal.id !== goalId),
        selectedGoal:
          state.selectedGoal?.id === goalId ? null : state.selectedGoal,
      }))
    },

    setSelectedGoal: goal => {
      logger.debug('Goals store: Setting selected goal', { goalId: goal?.id })
      set({ selectedGoal: goal })
    },

    addTaskToGoal: (goalId, task) => {
      logger.debug('Goals store: Adding task to goal', {
        goalId,
        taskId: task.id,
      })
      set(state => ({
        goals: state.goals.map(goal =>
          goal.id === goalId
            ? {
                ...goal,
                tasks: [...goal.tasks, task],
                tasksTotal: goal.tasksTotal + 1,
                progress:
                  goal.tasksTotal > 0
                    ? goal.tasksCompleted / (goal.tasksTotal + 1)
                    : 0,
              }
            : goal
        ),
      }))
    },

    updateTaskInGoal: (goalId, taskId, updates) => {
      logger.debug('Goals store: Updating task in goal', {
        goalId,
        taskId,
        updates,
      })
      set(state => ({
        goals: state.goals.map(goal =>
          goal.id === goalId
            ? {
                ...goal,
                tasks: goal.tasks.map(task =>
                  task.id === taskId ? { ...task, ...updates } : task
                ),
                tasksCompleted: goal.tasks.filter(t =>
                  t.id === taskId
                    ? (updates.isCompleted ?? t.isCompleted)
                    : t.isCompleted
                ).length,
                progress:
                  goal.tasksTotal > 0
                    ? goal.tasks.filter(t =>
                        t.id === taskId
                          ? (updates.isCompleted ?? t.isCompleted)
                          : t.isCompleted
                      ).length / goal.tasksTotal
                    : 0,
              }
            : goal
        ),
      }))
    },

    removeTaskFromGoal: (goalId, taskId) => {
      logger.debug('Goals store: Removing task from goal', { goalId, taskId })
      set(state => ({
        goals: state.goals.map(goal =>
          goal.id === goalId
            ? {
                ...goal,
                tasks: goal.tasks.filter(task => task.id !== taskId),
                tasksTotal: Math.max(0, goal.tasksTotal - 1),
                tasksCompleted: goal.tasks.filter(
                  t => t.id !== taskId && t.isCompleted
                ).length,
                progress:
                  goal.tasksTotal - 1 > 0
                    ? goal.tasks.filter(t => t.id !== taskId && t.isCompleted)
                        .length /
                      (goal.tasksTotal - 1)
                    : 0,
              }
            : goal
        ),
      }))
    },

    setGoalsSummary: summary => {
      logger.debug('Goals store: Setting goals summary', {
        totalGoals: summary.statistics.total,
        completed: summary.statistics.completed,
      })
      set({ goalsSummary: summary })
    },

    setTeamGoals: teamGoals => {
      logger.debug('Goals store: Setting team goals', {
        totalGoals: teamGoals.totalGoals,
        activeGoals: teamGoals.activeGoals,
      })
      set({ teamGoals })
    },

    // ========================================
    // Loading State Actions Implementation
    // ========================================

    setLoading: loading => set({ isLoading: loading }),
    setCreatingGoal: creating => set({ isCreatingGoal: creating }),
    setUpdatingGoal: updating => set({ isUpdatingGoal: updating }),
    setDeletingGoal: deleting => set({ isDeletingGoal: deleting }),
    setLoadingSummary: loading => set({ isLoadingSummary: loading }),
    setLoadingTeamGoals: loading => set({ isLoadingTeamGoals: loading }),

    // ========================================
    // Error State Actions Implementation
    // ========================================

    setError: error => {
      if (error) logger.error('Goals store: Setting error', { error })
      set({ error })
    },

    setGoalError: error => {
      if (error) logger.error('Goals store: Setting goal error', { error })
      set({ goalError: error })
    },

    clearErrors: () => {
      logger.debug('Goals store: Clearing errors')
      set({ error: null, goalError: null })
    },

    // ========================================
    // Filter and Pagination Actions Implementation
    // ========================================

    updateFilters: updates => {
      logger.debug('Goals store: Updating filters', updates)
      set(state => ({
        filters: { ...state.filters, ...updates },
        // Reset pagination when filters change
        pagination: { ...state.pagination, page: 1 },
      }))
    },

    resetFilters: () => {
      logger.debug('Goals store: Resetting filters')
      set({
        filters: DEFAULT_GOAL_FILTERS,
        pagination: DEFAULT_PAGINATION,
      })
    },

    updatePagination: updates => {
      logger.debug('Goals store: Updating pagination', updates)
      set(state => ({
        pagination: { ...state.pagination, ...updates },
      }))
    },

    setPaginationFromResponse: response => {
      logger.debug('Goals store: Setting pagination from response', {
        page: response.page,
        total: response.total,
        per_page: response.per_page,
      })
      set(state => ({
        pagination: {
          ...state.pagination,
          page: response.page,
          per_page: response.per_page,
          total: response.total,
          totalPages: Math.ceil(response.total / response.per_page),
        },
      }))
    },

    updateDashboardFilters: updates => {
      logger.debug('Goals store: Updating dashboard filters', updates)
      set(state => ({
        dashboardFilters: { ...state.dashboardFilters, ...updates },
      }))
    },

    // ========================================
    // UI State Actions Implementation
    // ========================================

    updateViewState: updates => {
      logger.debug('Goals store: Updating view state', updates)
      set(state => ({
        viewState: { ...state.viewState, ...updates },
      }))
    },

    setViewMode: mode => {
      logger.debug('Goals store: Setting view mode', { mode })
      set(state => ({
        viewState: { ...state.viewState, viewMode: mode },
      }))
    },

    toggleGoalExpansion: goalId => {
      logger.debug('Goals store: Toggling goal expansion', { goalId })
      set(state => {
        const newExpanded = new Set(state.viewState.expandedGoalIds)
        if (newExpanded.has(goalId)) {
          newExpanded.delete(goalId)
        } else {
          newExpanded.add(goalId)
        }
        return {
          viewState: {
            ...state.viewState,
            expandedGoalIds: newExpanded,
          },
        }
      })
    },

    setShowFilters: show => {
      logger.debug('Goals store: Setting show filters', { show })
      set(state => ({
        viewState: { ...state.viewState, showFilters: show },
      }))
    },

    setShowCompletedTasks: show => {
      logger.debug('Goals store: Setting show completed tasks', { show })
      set(state => ({
        viewState: { ...state.viewState, showCompletedTasks: show },
      }))
    },

    updateTaskManagement: updates => {
      logger.debug('Goals store: Updating task management', updates)
      set(state => ({
        taskManagement: { ...state.taskManagement, ...updates },
      }))
    },

    setCreatingTask: (goalId, creating) => {
      logger.debug('Goals store: Setting creating task', { goalId, creating })
      set(state => ({
        taskManagement: {
          ...state.taskManagement,
          isCreatingTask: {
            ...state.taskManagement.isCreatingTask,
            [goalId]: creating,
          },
        },
      }))
    },

    setEditingTask: (goalId, taskId) => {
      logger.debug('Goals store: Setting editing task', { goalId, taskId })
      set(state => ({
        taskManagement: {
          ...state.taskManagement,
          isEditingTask: {
            ...state.taskManagement.isEditingTask,
            [goalId]: taskId || '',
          },
        },
      }))
    },

    toggleTaskExpansion: taskId => {
      logger.debug('Goals store: Toggling task expansion', { taskId })
      set(state => {
        const newExpanded = new Set(state.taskManagement.expandedTaskIds)
        if (newExpanded.has(taskId)) {
          newExpanded.delete(taskId)
        } else {
          newExpanded.add(taskId)
        }
        return {
          taskManagement: {
            ...state.taskManagement,
            expandedTaskIds: newExpanded,
          },
        }
      })
    },

    // ========================================
    // Computed Properties and Helpers Implementation
    // ========================================

    getFilteredGoals: () => {
      const { goals, filters } = get()

      return goals
        .filter(goal => {
          // Status filter
          if (filters.status !== 'all' && goal.status !== filters.status) {
            return false
          }

          // Visibility filter
          if (
            filters.visibility !== 'all' &&
            goal.visibility !== filters.visibility
          ) {
            return false
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

          // Priority filter
          if (filters.priority !== 'all') {
            const priority = goal.priority || 0
            switch (filters.priority) {
              case 'high':
                if (priority < 75) return false
                break
              case 'medium':
                if (priority < 50 || priority >= 75) return false
                break
              case 'low':
                if (priority >= 50) return false
                break
            }
          }

          // Deadline filter
          if (filters.deadline !== 'all') {
            const now = new Date()
            const deadline = goal.deadline ? new Date(goal.deadline) : null

            switch (filters.deadline) {
              case 'overdue':
                if (!deadline || deadline >= now) return false
                break
              case 'this_week': {
                if (!deadline) return false
                const weekFromNow = new Date(
                  now.getTime() + 7 * 24 * 60 * 60 * 1000
                )
                if (deadline < now || deadline > weekFromNow) return false
                break
              }
              case 'this_month': {
                if (!deadline) return false
                const monthFromNow = new Date(
                  now.getTime() + 30 * 24 * 60 * 60 * 1000
                )
                if (deadline < now || deadline > monthFromNow) return false
                break
              }
              case 'no_deadline':
                if (deadline) return false
                break
            }
          }

          // Overdue tasks filter
          if (filters.hasOverdueTasks) {
            const hasOverdueTasks = goal.tasks.some(task => task.isOverdue)
            if (!hasOverdueTasks) return false
          }

          return true
        })
        .sort((a, b) => {
          // Apply sorting
          let aValue: string | number | Date
          let bValue: string | number | Date

          switch (filters.sortBy) {
            case 'title':
              aValue = a.title.toLowerCase()
              bValue = b.title.toLowerCase()
              break
            case 'status':
              aValue = a.status
              bValue = b.status
              break
            case 'priority':
              aValue = a.priority || 0
              bValue = b.priority || 0
              break
            case 'deadline':
              aValue = a.deadline ? new Date(a.deadline).getTime() : 0
              bValue = b.deadline ? new Date(b.deadline).getTime() : 0
              break
            case 'progress':
              aValue = a.progress
              bValue = b.progress
              break
            case 'createdAt':
            default:
              aValue = new Date(a.createdAt).getTime()
              bValue = new Date(b.createdAt).getTime()
              break
          }

          if (filters.sortDirection === 'desc') {
            return bValue > aValue ? 1 : bValue < aValue ? -1 : 0
          } else {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
          }
        })
    },

    getGoalsStatistics: () => {
      const { goals } = get()

      const total = goals.length
      const completed = goals.filter(g => g.status === 'completed').length
      const active = goals.filter(
        g => g.status === 'in_progress' || g.status === 'open'
      ).length
      const overdue = goals.filter(g => g.isOverdue).length
      const completionRate = total > 0 ? completed / total : 0

      return { total, completed, active, overdue, completionRate }
    },

    isGoalExpanded: goalId => {
      return get().viewState.expandedGoalIds.has(goalId)
    },

    isTaskExpanded: taskId => {
      return get().taskManagement.expandedTaskIds.has(taskId)
    },

    reset: () => {
      logger.debug('Goals store: Resetting all state')
      set({
        goals: [],
        selectedGoal: null,
        goalsSummary: null,
        teamGoals: null,
        isLoading: false,
        isCreatingGoal: false,
        isUpdatingGoal: false,
        isDeletingGoal: false,
        isLoadingSummary: false,
        isLoadingTeamGoals: false,
        error: null,
        goalError: null,
        filters: DEFAULT_GOAL_FILTERS,
        pagination: DEFAULT_PAGINATION,
        dashboardFilters: DEFAULT_DASHBOARD_FILTERS,
        viewState: DEFAULT_GOALS_VIEW_STATE,
        taskManagement: DEFAULT_TASK_MANAGEMENT_STATE,
      })
    },
  }))
)

// Utility function to convert API response to store data
export const convertGoalsDtoToGoals = (goalDtos: TGoalDto[]): Goal[] => {
  return goalDtos.map(convertGoalDtoToGoal)
}

// Subscribe to store changes for debugging in development
if (import.meta.env.DEV) {
  useGoalsStore.subscribe(
    state => state.goals,
    goals => logger.debug('Goals store: Goals updated', { count: goals.length })
  )

  useGoalsStore.subscribe(
    state => state.filters,
    filters =>
      logger.debug('Goals store: Filters updated', {
        status: filters.status,
        search: filters.search,
        sortBy: filters.sortBy,
      })
  )
}
