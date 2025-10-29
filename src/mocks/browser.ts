import { setupWorker } from 'msw/browser'
import { allHandlers } from './handlers'

// Setup MSW worker with all handlers
export const worker = setupWorker(...allHandlers)
