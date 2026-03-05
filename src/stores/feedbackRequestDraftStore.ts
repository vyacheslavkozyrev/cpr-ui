import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CreateFeedbackRequestDto } from '../types/feedbackRequest'
import { logger } from '../utils/logger'

/**
 * Draft data structure with metadata
 */
export interface FeedbackRequestDraft {
  /** Draft form data matching CreateFeedbackRequestDto */
  data: Partial<CreateFeedbackRequestDto>
  /** Timestamp when draft was last saved (ISO 8601) */
  lastSaved: string | null
  /** Whether draft has unsaved changes */
  isDirty: boolean
  /** Employee ID who owns this draft */
  employeeId: string | null
}

/**
 * Feedback Request Draft Store Interface
 * Manages auto-save draft functionality for feedback request form
 * - Auto-saves every 30 seconds when form is dirty
 * - Persists to localStorage with 7-day retention
 * - Supports load/clear/reset operations
 */
export interface IFeedbackRequestDraftStore {
  // ========================================
  // Draft State
  // ========================================

  /** Current draft data */
  draft: FeedbackRequestDraft

  // ========================================
  // Actions
  // ========================================

  /**
   * Save draft data to store and localStorage
   * @param data - Partial CreateFeedbackRequestDto to save
   * @param employeeId - ID of employee creating the request
   */
  saveDraft: (
    data: Partial<CreateFeedbackRequestDto>,
    employeeId: string
  ) => void

  /**
   * Load existing draft from localStorage
   * Validates draft age (max 7 days) and clears if expired
   * @param employeeId - ID of employee to load draft for
   * @returns Draft data if valid, null if expired or not found
   */
  loadDraft: (employeeId: string) => Partial<CreateFeedbackRequestDto> | null

  /**
   * Clear draft from store and localStorage
   */
  clearDraft: () => void

  /**
   * Reset draft to empty state
   */
  resetDraft: () => void

  /**
   * Mark draft as dirty (has unsaved changes)
   */
  markDirty: () => void

  /**
   * Mark draft as clean (saved)
   */
  markClean: () => void

  /**
   * Check if draft exists and is valid
   * @param employeeId - ID of employee to check draft for
   * @returns true if valid draft exists, false otherwise
   */
  hasDraft: (employeeId: string) => boolean

  /**
   * Get draft age in days
   * @returns Number of days since last save, or null if no draft
   */
  getDraftAge: () => number | null
}

/**
 * Initial draft state
 */
const INITIAL_DRAFT: FeedbackRequestDraft = {
  data: {},
  lastSaved: null,
  isDirty: false,
  employeeId: null,
}

/**
 * Draft retention period in milliseconds (7 days)
 */
const DRAFT_RETENTION_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Feedback Request Draft Store
 * Persists to localStorage with key: 'feedback-request-draft-store'
 */
export const useFeedbackRequestDraftStore =
  create<IFeedbackRequestDraftStore>()(
    persist(
      (set, get) => ({
        // ========================================
        // Initial State
        // ========================================

        draft: INITIAL_DRAFT,

        // ========================================
        // Actions
        // ========================================

        saveDraft: (data, employeeId) => {
          const now = new Date().toISOString()

          set({
            draft: {
              data,
              lastSaved: now,
              isDirty: false,
              employeeId,
            },
          })

          logger.debug('Draft saved', {
            employeeId,
            timestamp: now,
            fieldsCount: Object.keys(data).length,
          })
        },

        loadDraft: employeeId => {
          const { draft } = get()

          // Check if draft exists for this employee
          if (!draft.employeeId || draft.employeeId !== employeeId) {
            logger.debug('No draft found for employee', { employeeId })
            return null
          }

          // Check if draft is expired (older than 7 days)
          if (draft.lastSaved) {
            const savedDate = new Date(draft.lastSaved)
            const now = new Date()
            const ageMs = now.getTime() - savedDate.getTime()

            if (ageMs > DRAFT_RETENTION_MS) {
              logger.info('Draft expired, clearing', {
                employeeId,
                lastSaved: draft.lastSaved,
                ageDays: Math.floor(ageMs / (24 * 60 * 60 * 1000)),
              })
              get().clearDraft()
              return null
            }
          }

          logger.debug('Draft loaded', {
            employeeId,
            lastSaved: draft.lastSaved,
            fieldsCount: Object.keys(draft.data).length,
          })

          return draft.data
        },

        clearDraft: () => {
          logger.debug('Draft cleared')
          set({ draft: INITIAL_DRAFT })
        },

        resetDraft: () => {
          logger.debug('Draft reset')
          set({ draft: INITIAL_DRAFT })
        },

        markDirty: () => {
          set(state => ({
            draft: {
              ...state.draft,
              isDirty: true,
            },
          }))
        },

        markClean: () => {
          set(state => ({
            draft: {
              ...state.draft,
              isDirty: false,
            },
          }))
        },

        hasDraft: employeeId => {
          const { draft } = get()

          // Check employee matches
          if (!draft.employeeId || draft.employeeId !== employeeId) {
            return false
          }

          // Check draft has data
          if (!draft.data || Object.keys(draft.data).length === 0) {
            return false
          }

          // Check not expired
          if (draft.lastSaved) {
            const savedDate = new Date(draft.lastSaved)
            const now = new Date()
            const ageMs = now.getTime() - savedDate.getTime()

            if (ageMs > DRAFT_RETENTION_MS) {
              return false
            }
          }

          return true
        },

        getDraftAge: () => {
          const { draft } = get()

          if (!draft.lastSaved) {
            return null
          }

          const savedDate = new Date(draft.lastSaved)
          const now = new Date()
          const ageMs = now.getTime() - savedDate.getTime()
          const ageDays = ageMs / (24 * 60 * 60 * 1000)

          return Math.floor(ageDays)
        },
      }),
      {
        name: 'feedback-request-draft-store',
        version: 1,
      }
    )
  )
