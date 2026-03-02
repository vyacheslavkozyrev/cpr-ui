import { dashboardHandlers } from './dashboardHandlers'
import goalsHandlers from './goalsHandlers'
import reviewCyclesHandlers from './reviewCyclesHandlers'
import { userHandlers } from './userHandlers'

export { dashboardHandlers, goalsHandlers, reviewCyclesHandlers, userHandlers }

// Export all handlers for easy importing
export const allHandlers = [
  ...userHandlers,
  ...dashboardHandlers,
  ...goalsHandlers,
  ...reviewCyclesHandlers,
]
