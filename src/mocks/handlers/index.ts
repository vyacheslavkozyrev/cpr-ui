import { dashboardHandlers } from './dashboardHandlers'
import { feedbackRequestHandlers } from './feedbackRequestHandlers'
import goalsHandlers from './goalsHandlers'
import { userHandlers } from './userHandlers'

export {
  dashboardHandlers,
  feedbackRequestHandlers,
  goalsHandlers,
  userHandlers,
}

// Export all handlers for easy importing
export const allHandlers = [
  ...userHandlers,
  ...dashboardHandlers,
  ...goalsHandlers,
  ...feedbackRequestHandlers,
  // Add more handlers here as they are created
]
