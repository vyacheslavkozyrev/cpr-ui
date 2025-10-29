import { userHandlers } from './userHandlers'

export { userHandlers }

// Export all handlers for easy importing
export const allHandlers = [
  ...userHandlers,
  // Add more handlers here as they are created
]
