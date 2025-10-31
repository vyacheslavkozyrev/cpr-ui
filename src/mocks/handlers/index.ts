import { dashboardHandlers } from './dashboardHandlers'
import goalsHandlers from './goalsHandlers'
import { userHandlers } from './userHandlers'

export { dashboardHandlers, goalsHandlers, userHandlers }

// Export all handlers for easy importing
export const allHandlers = [
  ...userHandlers,
  ...dashboardHandlers,
  ...goalsHandlers,
  // Add more handlers here as they are created
]
