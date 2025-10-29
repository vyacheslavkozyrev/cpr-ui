import { setupServer } from 'msw/node'
import { allHandlers } from './handlers'

// Setup MSW server with all handlers
export const server = setupServer(...allHandlers)
