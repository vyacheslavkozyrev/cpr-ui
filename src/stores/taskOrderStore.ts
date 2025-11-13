import { create } from 'zustand'
import {
  createJSONStorage,
  persist,
  subscribeWithSelector,
} from 'zustand/middleware'

/**
 * Task Order Store
 * Persists drag-and-drop task ordering in localStorage per goal.
 *
 * Storage Structure:
 * - Key: goal ID
 * - Value: Array of task IDs in custom order
 *
 * Note: Order is client-side only (no database order_index column).
 * Order resets on data refetch or page refresh, but provides UX enhancement.
 */

interface ITaskOrderStore {
  /**
   * Maps goal ID to ordered array of task IDs
   * Example: { "goal-123": ["task-456", "task-789", "task-101"] }
   */
  taskOrders: Record<string, string[]>

  /**
   * Set custom task order for a goal
   * @param goalId - Goal identifier
   * @param taskIds - Ordered array of task IDs
   */
  setTaskOrder: (goalId: string, taskIds: string[]) => void

  /**
   * Get custom task order for a goal
   * @param goalId - Goal identifier
   * @returns Ordered task IDs array, or undefined if no custom order set
   */
  getTaskOrder: (goalId: string) => string[] | undefined

  /**
   * Clear custom task order for a goal
   * @param goalId - Goal identifier
   */
  clearTaskOrder: (goalId: string) => void

  /**
   * Reset all task orders (clear localStorage)
   */
  resetAllTaskOrders: () => void
}

export const useTaskOrderStore = create<ITaskOrderStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        taskOrders: {},

        setTaskOrder: (goalId: string, taskIds: string[]) =>
          set(state => ({
            taskOrders: {
              ...state.taskOrders,
              [goalId]: taskIds,
            },
          })),

        getTaskOrder: (goalId: string): string[] | undefined => {
          return get().taskOrders[goalId]
        },

        clearTaskOrder: (goalId: string) =>
          set(state => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [goalId]: _, ...rest } = state.taskOrders
            return { taskOrders: rest }
          }),

        resetAllTaskOrders: () => set({ taskOrders: {} }),
      }),
      {
        name: 'cpr-task-order-storage',
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
)
