import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useFeedbackRequestDraftStore } from '../../stores/feedbackRequestDraftStore'
import type { CreateFeedbackRequestDto } from '../../types/feedbackRequest'

/**
 * Feedback Request Draft Store Tests
 * Tests for Zustand store in Feature 0004 - T092
 * Coverage: saveDraft, loadDraft, clearDraft, hasDraft, getDraftAge, 7-day expiry
 */

describe('Feedback Request Draft Store', () => {
  beforeEach(() => {
    // Clear store state before each test
    const store = useFeedbackRequestDraftStore.getState()
    store.resetDraft()

    // Clear localStorage
    localStorage.clear()

    // Reset date mocks
    vi.restoreAllMocks()
  })

  describe('saveDraft', () => {
    it('saves draft data with timestamp and marks as clean', () => {
      const store = useFeedbackRequestDraftStore.getState()
      const employeeId = 'emp-123'
      const draftData: Partial<CreateFeedbackRequestDto> = {
        employee_ids: ['emp-1', 'emp-2'],
        message: 'Test feedback request',
        project_id: 'proj-1',
        goal_id: null,
        due_date: '2025-12-31T23:59:59Z',
      }

      // Save draft
      store.saveDraft(draftData, employeeId)

      // Verify draft was saved
      const { draft } = useFeedbackRequestDraftStore.getState()
      expect(draft.data).toEqual(draftData)
      expect(draft.employeeId).toBe(employeeId)
      expect(draft.isDirty).toBe(false)
      expect(draft.lastSaved).not.toBeNull()
      expect(draft.lastSaved).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })

    it('updates existing draft with new data', () => {
      const store = useFeedbackRequestDraftStore.getState()
      const employeeId = 'emp-123'

      // Save initial draft
      const initialData: Partial<CreateFeedbackRequestDto> = {
        employee_ids: ['emp-1'],
        message: 'Initial message',
      }
      store.saveDraft(initialData, employeeId)

      const firstSaveTime =
        useFeedbackRequestDraftStore.getState().draft.lastSaved

      // Wait a bit and save updated draft
      vi.useFakeTimers()
      vi.advanceTimersByTime(1000) // 1 second

      const updatedData: Partial<CreateFeedbackRequestDto> = {
        employee_ids: ['emp-1', 'emp-2', 'emp-3'],
        message: 'Updated message',
        project_id: 'proj-1',
      }
      store.saveDraft(updatedData, employeeId)

      vi.useRealTimers()

      // Verify draft was updated
      const { draft } = useFeedbackRequestDraftStore.getState()
      expect(draft.data).toEqual(updatedData)
      expect(draft.lastSaved).not.toBe(firstSaveTime)
    })
  })

  describe('loadDraft', () => {
    it('loads valid draft for correct employee', () => {
      const store = useFeedbackRequestDraftStore.getState()
      const employeeId = 'emp-123'
      const draftData: Partial<CreateFeedbackRequestDto> = {
        employee_ids: ['emp-1', 'emp-2'],
        message: 'Test draft',
      }

      // Save and load draft
      store.saveDraft(draftData, employeeId)
      const loadedData = store.loadDraft(employeeId)

      // Verify loaded data matches saved data
      expect(loadedData).toEqual(draftData)
    })

    it('returns null for expired draft (older than 7 days)', () => {
      const store = useFeedbackRequestDraftStore.getState()
      const employeeId = 'emp-123'
      const draftData: Partial<CreateFeedbackRequestDto> = {
        employee_ids: ['emp-1'],
        message: 'Old draft',
      }

      // Mock date to 8 days ago
      const eightDaysAgo = new Date()
      eightDaysAgo.setDate(eightDaysAgo.getDate() - 8)

      vi.useFakeTimers()
      vi.setSystemTime(eightDaysAgo)

      // Save draft 8 days ago
      store.saveDraft(draftData, employeeId)

      // Return to current time
      vi.useRealTimers()

      // Try to load draft (should be expired)
      const loadedData = store.loadDraft(employeeId)

      // Verify draft was not loaded (expired)
      expect(loadedData).toBeNull()

      // Verify draft was cleared
      const { draft } = useFeedbackRequestDraftStore.getState()
      expect(draft.data).toEqual({})
      expect(draft.employeeId).toBeNull()
    })

    it('returns null for different employee', () => {
      const store = useFeedbackRequestDraftStore.getState()
      const employeeId1 = 'emp-123'
      const employeeId2 = 'emp-456'
      const draftData: Partial<CreateFeedbackRequestDto> = {
        employee_ids: ['emp-1'],
        message: 'Employee 1 draft',
      }

      // Save draft for employee 1
      store.saveDraft(draftData, employeeId1)

      // Try to load draft as employee 2
      const loadedData = store.loadDraft(employeeId2)

      // Verify draft was not loaded (wrong employee)
      expect(loadedData).toBeNull()
    })
  })

  describe('clearDraft', () => {
    it('clears draft and resets to initial state', () => {
      const store = useFeedbackRequestDraftStore.getState()
      const employeeId = 'emp-123'
      const draftData: Partial<CreateFeedbackRequestDto> = {
        employee_ids: ['emp-1'],
        message: 'Test draft',
      }

      // Save draft
      store.saveDraft(draftData, employeeId)

      // Verify draft exists
      expect(store.hasDraft(employeeId)).toBe(true)

      // Clear draft
      store.clearDraft()

      // Verify draft was cleared
      const { draft } = useFeedbackRequestDraftStore.getState()
      expect(draft.data).toEqual({})
      expect(draft.employeeId).toBeNull()
      expect(draft.lastSaved).toBeNull()
      expect(draft.isDirty).toBe(false)
    })
  })

  describe('hasDraft', () => {
    it('validates draft existence and expiry correctly', () => {
      const store = useFeedbackRequestDraftStore.getState()
      const employeeId = 'emp-123'

      // Initially no draft
      expect(store.hasDraft(employeeId)).toBe(false)

      // Save draft
      const draftData: Partial<CreateFeedbackRequestDto> = {
        employee_ids: ['emp-1'],
        message: 'Test draft',
      }
      store.saveDraft(draftData, employeeId)

      // Draft should exist
      expect(store.hasDraft(employeeId)).toBe(true)

      // Different employee should not have draft
      expect(store.hasDraft('emp-456')).toBe(false)

      // Test expired draft
      vi.useFakeTimers()
      const eightDaysAgo = new Date()
      eightDaysAgo.setDate(eightDaysAgo.getDate() - 8)
      vi.setSystemTime(eightDaysAgo)

      store.saveDraft(draftData, employeeId)

      vi.useRealTimers()

      // Expired draft should not exist
      expect(store.hasDraft(employeeId)).toBe(false)
    })
  })

  describe('getDraftAge', () => {
    it('calculates draft age in days correctly', () => {
      const store = useFeedbackRequestDraftStore.getState()
      const employeeId = 'emp-123'
      const draftData: Partial<CreateFeedbackRequestDto> = {
        employee_ids: ['emp-1'],
        message: 'Test draft',
      }

      // No draft initially
      expect(store.getDraftAge()).toBeNull()

      // Save draft 3 days ago
      vi.useFakeTimers()
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
      vi.setSystemTime(threeDaysAgo)

      store.saveDraft(draftData, employeeId)

      // Return to current time
      vi.useRealTimers()

      // Draft should be 3 days old
      const age = store.getDraftAge()
      expect(age).toBe(3)
    })
  })

  describe('markDirty and markClean', () => {
    it('marks draft as dirty and clean correctly', () => {
      const store = useFeedbackRequestDraftStore.getState()
      const employeeId = 'emp-123'
      const draftData: Partial<CreateFeedbackRequestDto> = {
        employee_ids: ['emp-1'],
        message: 'Test draft',
      }

      // Save draft (marks as clean)
      store.saveDraft(draftData, employeeId)
      expect(useFeedbackRequestDraftStore.getState().draft.isDirty).toBe(false)

      // Mark as dirty
      store.markDirty()
      expect(useFeedbackRequestDraftStore.getState().draft.isDirty).toBe(true)

      // Mark as clean
      store.markClean()
      expect(useFeedbackRequestDraftStore.getState().draft.isDirty).toBe(false)
    })
  })
})
