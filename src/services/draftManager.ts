import { feedbackDb } from '../db/feedbackDb'
import type { FeedbackDraft } from '../types/offlineQueue'

/**
 * Service for managing feedback submission drafts
 * Features:
 * - Auto-save with configurable debounce (default 30s)
 * - Load drafts by feedback_request_id or employee_id
 * - Discard drafts with confirmation
 * - Automatic cleanup of expired drafts (7 days)
 * - Event-driven notifications for UI updates
 */

type DraftEventType = 'saved' | 'loaded' | 'discarded' | 'expired'

interface DraftEvent {
  type: DraftEventType
  draft?: FeedbackDraft
  timestamp: Date
}

type DraftEventHandler = (event: DraftEvent) => void

class DraftManagerService {
  private readonly AUTO_SAVE_DELAY_MS = 30000 // 30 seconds
  private readonly DRAFT_EXPIRY_DAYS = 7
  private autoSaveTimers: Map<string, NodeJS.Timeout> = new Map()
  private eventHandlers: Set<DraftEventHandler> = new Set()

  /**
   * Subscribe to draft events for UI updates
   */
  public subscribe(handler: DraftEventHandler): () => void {
    this.eventHandlers.add(handler)
    return () => this.eventHandlers.delete(handler)
  }

  /**
   * Emit draft events to all subscribers
   */
  private emit(event: DraftEvent): void {
    this.eventHandlers.forEach(handler => {
      try {
        handler(event)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Draft event handler error:', error)
      }
    })
  }

  /**
   * Save a draft with auto-save debouncing
   * @param draft - The draft to save
   * @param immediate - Skip debounce and save immediately
   * @returns The saved draft ID
   */
  public async saveDraft(
    draft: Omit<
      FeedbackDraft,
      'id' | 'created_at' | 'updated_at' | 'expires_at'
    >,
    immediate = false
  ): Promise<string> {
    const draftKey = this.getDraftKey(draft)

    // Clear existing auto-save timer
    const existingTimer = this.autoSaveTimers.get(draftKey)
    if (existingTimer) {
      clearTimeout(existingTimer)
      this.autoSaveTimers.delete(draftKey)
    }

    // If immediate save requested, save now
    if (immediate) {
      return this.performSave(draft, draftKey)
    }

    // Otherwise, schedule debounced save
    return new Promise((resolve, reject) => {
      const timer = setTimeout(async () => {
        try {
          const id = await this.performSave(draft, draftKey)
          resolve(id)
        } catch (error) {
          reject(error)
        } finally {
          this.autoSaveTimers.delete(draftKey)
        }
      }, this.AUTO_SAVE_DELAY_MS)

      this.autoSaveTimers.set(draftKey, timer)
    })
  }

  /**
   * Perform the actual save operation
   */
  private async performSave(
    draft: Omit<
      FeedbackDraft,
      'id' | 'created_at' | 'updated_at' | 'expires_at'
    >,
    draftKey: string
  ): Promise<string> {
    const now = new Date()
    const nowISO = now.toISOString()

    // Check if draft already exists
    const existingDraft = await this.loadDraftInternal(draftKey)

    // Calculate expiry (7 days from now)
    const expiryDate = new Date(now)
    expiryDate.setDate(expiryDate.getDate() + this.DRAFT_EXPIRY_DAYS)
    const expiryISO = expiryDate.toISOString()

    const draftToSave: FeedbackDraft = existingDraft
      ? {
          ...existingDraft,
          ...draft,
          updated_at: nowISO,
          expires_at: expiryISO,
        }
      : {
          id: crypto.randomUUID(),
          employee_id: draft.employee_id ?? null,
          goal_id: draft.goal_id ?? null,
          project_id: draft.project_id ?? null,
          content: draft.content ?? null,
          rating: draft.rating ?? null,
          feedback_request_id: draft.feedback_request_id ?? null,
          created_at: nowISO,
          updated_at: nowISO,
          expires_at: expiryISO,
        }

    await feedbackDb.drafts.put(draftToSave)

    this.emit({
      type: 'saved',
      draft: draftToSave,
      timestamp: now,
    })

    return draftToSave.id
  }

  /**
   * Load a draft by feedback request ID or employee ID
   * @param feedbackRequestId - Optional feedback request ID
   * @param employeeId - Optional employee ID for general feedback
   * @returns The loaded draft or null if not found
   */
  public async loadDraft(
    feedbackRequestId?: string,
    employeeId?: string
  ): Promise<FeedbackDraft | null> {
    if (!feedbackRequestId && !employeeId) {
      throw new Error('Either feedbackRequestId or employeeId must be provided')
    }

    const draftKey = this.getDraftKeyFromParams(feedbackRequestId, employeeId)
    const draft = await this.loadDraftInternal(draftKey)

    if (draft) {
      // Check if draft has expired
      const expiryDate = new Date(draft.created_at)
      expiryDate.setDate(expiryDate.getDate() + this.DRAFT_EXPIRY_DAYS)

      if (new Date() > expiryDate) {
        // Draft expired, delete it
        await this.discardDraft(draft.id)
        this.emit({
          type: 'expired',
          draft,
          timestamp: new Date(),
        })
        return null
      }

      this.emit({
        type: 'loaded',
        draft,
        timestamp: new Date(),
      })
    }

    return draft
  }

  /**
   * Internal method to load draft without events or expiry checks
   */
  private async loadDraftInternal(
    draftKey: string
  ): Promise<FeedbackDraft | null> {
    // Try to find by exact key match
    const allDrafts = await feedbackDb.drafts.toArray()
    const draft = allDrafts.find(d => {
      const key = this.getDraftKey(d)
      return key === draftKey
    })

    return draft || null
  }

  /**
   * Discard a draft by ID
   * @param draftId - The ID of the draft to discard
   */
  public async discardDraft(draftId: string): Promise<void> {
    const draft = await feedbackDb.drafts.get({ id: draftId })

    if (draft) {
      // Cancel any pending auto-save
      const draftKey = this.getDraftKey(draft)
      const timer = this.autoSaveTimers.get(draftKey)
      if (timer) {
        clearTimeout(timer)
        this.autoSaveTimers.delete(draftKey)
      }

      await feedbackDb.drafts.delete(draftId)

      this.emit({
        type: 'discarded',
        draft,
        timestamp: new Date(),
      })
    }
  }

  /**
   * Discard drafts by feedback request ID or employee ID
   * @param feedbackRequestId - Optional feedback request ID
   * @param employeeId - Optional employee ID
   */
  public async discardDraftByKey(
    feedbackRequestId?: string,
    employeeId?: string
  ): Promise<void> {
    if (!feedbackRequestId && !employeeId) {
      throw new Error('Either feedbackRequestId or employeeId must be provided')
    }

    const draftKey = this.getDraftKeyFromParams(feedbackRequestId, employeeId)
    const draft = await this.loadDraftInternal(draftKey)

    if (draft) {
      await this.discardDraft(draft.id)
    }
  }

  /**
   * Clean up expired drafts (older than 7 days)
   * Should be called on app initialization
   * @returns Number of drafts cleaned up
   */
  public async cleanupExpiredDrafts(): Promise<number> {
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() - this.DRAFT_EXPIRY_DAYS)

    const expiredDrafts = await feedbackDb.drafts
      .where('created_at')
      .below(expiryDate)
      .toArray()

    if (expiredDrafts.length > 0) {
      for (const draft of expiredDrafts) {
        await feedbackDb.drafts.delete(draft.id)
      }

      expiredDrafts.forEach(draft => {
        this.emit({
          type: 'expired',
          draft,
          timestamp: new Date(),
        })
      })
    }

    return expiredDrafts.length
  }

  /**
   * Get all active drafts (not expired)
   * @returns Array of active drafts
   */
  public async getAllDrafts(): Promise<FeedbackDraft[]> {
    const allDrafts = await feedbackDb.drafts.toArray()
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() - this.DRAFT_EXPIRY_DAYS)

    return allDrafts.filter(draft => new Date(draft.created_at) >= expiryDate)
  }

  /**
   * Cancel all pending auto-saves (useful for cleanup)
   */
  public cancelAllAutoSaves(): void {
    this.autoSaveTimers.forEach(timer => clearTimeout(timer))
    this.autoSaveTimers.clear()
  }

  /**
   * Generate a unique key for a draft based on feedback_request_id or employee_id
   */
  private getDraftKey(
    draft: Pick<FeedbackDraft, 'feedback_request_id' | 'employee_id'>
  ): string {
    return this.getDraftKeyFromParams(
      draft.feedback_request_id,
      draft.employee_id
    )
  }

  /**
   * Generate draft key from parameters
   */
  private getDraftKeyFromParams(
    feedbackRequestId?: string | null,
    employeeId?: string | null
  ): string {
    if (feedbackRequestId) {
      return `request:${feedbackRequestId}`
    }
    if (employeeId) {
      return `employee:${employeeId}`
    }
    throw new Error('Either feedbackRequestId or employeeId must be provided')
  }
}

// Export singleton instance
export const draftManager = new DraftManagerService()

// Export types
export type { DraftEvent, DraftEventHandler, DraftEventType }
