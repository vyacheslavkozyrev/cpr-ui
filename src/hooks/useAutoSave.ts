import { useEffect, useRef } from 'react'

/**
 * Auto-save hook with localStorage persistence
 * Debounces form data and saves to localStorage
 * Feature 0001 - Phase 5B
 */

interface UseAutoSaveOptions<T> {
  /**
   * Unique key for localStorage
   */
  storageKey: string

  /**
   * Form data to auto-save
   */
  data: T

  /**
   * Whether the form is dirty (has unsaved changes)
   */
  isDirty: boolean

  /**
   * Debounce delay in milliseconds
   * @default 2000
   */
  delay?: number

  /**
   * Callback when data is restored from localStorage
   */
  onRestore?: (data: T) => void
}

/**
 * Custom hook for auto-saving form data to localStorage
 *
 * @example
 * ```tsx
 * const { clearDraft, hasDraft } = useAutoSave({
 *   storageKey: 'goal-form-draft',
 *   data: formData,
 *   isDirty: isDirty,
 *   onRestore: (restored) => setFormData(restored),
 * })
 *
 * // Clear on successful submit
 * const handleSubmit = async () => {
 *   await submitForm()
 *   clearDraft()
 * }
 * ```
 */
export const useAutoSave = <T>({
  storageKey,
  data,
  isDirty,
  delay = 2000,
  onRestore,
}: UseAutoSaveOptions<T>) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasRestoredRef = useRef(false)

  // Restore from localStorage on mount
  useEffect(() => {
    if (!hasRestoredRef.current && onRestore) {
      try {
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          const parsed = JSON.parse(stored) as T
          onRestore(parsed)
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to restore auto-saved data:', error)
      }
      hasRestoredRef.current = true
    }
  }, [storageKey, onRestore])

  // Auto-save with debounce
  useEffect(() => {
    if (!isDirty || !hasRestoredRef.current) {
      return
    }

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(data))
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to auto-save data:', error)
      }
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, isDirty, delay, storageKey])

  /**
   * Clear the draft from localStorage
   */
  const clearDraft = () => {
    try {
      localStorage.removeItem(storageKey)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to clear auto-saved data:', error)
    }
  }

  /**
   * Check if a draft exists in localStorage
   */
  const hasDraft = () => {
    try {
      return localStorage.getItem(storageKey) !== null
    } catch {
      return false
    }
  }

  return {
    clearDraft,
    hasDraft,
  }
}
