import { create } from 'zustand'
import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
} from 'zustand/middleware'
import type { TGoalStatus } from '../dtos/GoalDto'
import type { TGoalSortField, TSortDirection } from '../types/goalFilters'

/**
 * User preferences for Goals page
 */
export interface IGoalsPreferences {
  /** View mode: grid or table */
  viewMode: 'grid' | 'table'

  /** Items per page */
  perPage: number

  /** Sort field */
  sortBy: TGoalSortField

  /** Sort direction */
  sortDirection: TSortDirection

  /** Filter preferences */
  filters: {
    /** Status filter */
    status: TGoalStatus[]

    /** Progress filter (min-max range) */
    progress?: { min: number; max: number }

    /** Deadline filter */
    deadline?:
      | 'overdue'
      | 'this_week'
      | 'this_month'
      | 'this_quarter'
      | 'no_deadline'
  }
}

/**
 * Default preferences
 */
export const DEFAULT_GOALS_PREFERENCES: IGoalsPreferences = {
  viewMode: 'grid',
  perPage: 12,
  sortBy: 'createdAt',
  sortDirection: 'desc',
  filters: {
    status: [],
  },
}

/**
 * Preferences store interface
 */
interface IPreferencesStore {
  /** Current goals preferences */
  goals: IGoalsPreferences

  /** Set entire goals preferences */
  setGoalsPreferences: (preferences: Partial<IGoalsPreferences>) => void

  /** Set view mode */
  setViewMode: (viewMode: 'grid' | 'table') => void

  /** Set items per page */
  setPerPage: (perPage: number) => void

  /** Set sort preferences */
  setSortPreferences: (
    sortBy: TGoalSortField,
    sortDirection: TSortDirection
  ) => void

  /** Set filter preferences */
  setFilterPreferences: (filters: Partial<IGoalsPreferences['filters']>) => void

  /** Reset goals preferences to defaults */
  resetGoalsPreferences: () => void

  /** Reset all preferences */
  resetAllPreferences: () => void
}

/**
 * User preferences store with localStorage persistence
 */
export const usePreferencesStore = create<IPreferencesStore>()(
  subscribeWithSelector(
    persist(
      set => ({
        // Initial state
        goals: DEFAULT_GOALS_PREFERENCES,

        // Actions
        setGoalsPreferences: preferences =>
          set(state => ({
            goals: {
              ...state.goals,
              ...preferences,
              filters: {
                ...state.goals.filters,
                ...(preferences.filters || {}),
              },
            },
          })),

        setViewMode: viewMode =>
          set(state => ({
            goals: { ...state.goals, viewMode },
          })),

        setPerPage: perPage =>
          set(state => ({
            goals: { ...state.goals, perPage },
          })),

        setSortPreferences: (sortBy, sortDirection) =>
          set(state => ({
            goals: { ...state.goals, sortBy, sortDirection },
          })),

        setFilterPreferences: filters =>
          set(state => ({
            goals: {
              ...state.goals,
              filters: { ...state.goals.filters, ...filters },
            },
          })),

        resetGoalsPreferences: () => set({ goals: DEFAULT_GOALS_PREFERENCES }),

        resetAllPreferences: () => set({ goals: DEFAULT_GOALS_PREFERENCES }),
      }),
      {
        name: 'cpr-preferences-storage', // localStorage key
        storage: createJSONStorage(() => localStorage),

        // Persist entire store
        partialize: state => ({
          goals: state.goals,
        }),
      }
    )
  )
)
