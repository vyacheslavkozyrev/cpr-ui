import { dashboardHandlers } from './dashboardHandlers'
import { userHandlers } from './userHandlers'

export { dashboardHandlers, userHandlers }

// Export all handlers for easy importing
export const allHandlers = [
  ...userHandlers,
  ...dashboardHandlers,
  // Add more handlers here as they are created
]
