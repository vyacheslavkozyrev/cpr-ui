import { http, HttpResponse } from 'msw'
import type { TCurrentUserDto } from '../../dtos'

// Default fallback API URL for mock handlers
const DEFAULT_API_BASE_URL = 'http://localhost:3000/api'

// Get API base URL from environment variable with fallback
// Support both browser (import.meta.env) and Node.js (process.env) environments
const getApiBaseUrl = () => {
  // In Node.js environment (tests)
  if (typeof process !== 'undefined' && process.env) {
    return process.env['VITE_API_BASE_URL'] || DEFAULT_API_BASE_URL
  }

  // In browser environment (Vite) - access import.meta.env
  // This is safe because import.meta is available in browser Vite environment
  return import.meta.env?.['VITE_API_BASE_URL'] || DEFAULT_API_BASE_URL
}

const API_BASE_URL = getApiBaseUrl()

// Mock user data for testing (using API DTO structure)
export const mockUsers = {
  employee: {
    user_id: 'test-employee-id',
    employee_id: 'EMP001',
    user_name: 'jane.employee@company.com',
    display_name: 'Jane Test Employee',
    email: 'jane.employee@company.com',
    position: {
      id: 'pos-001',
      title: 'Software Developer',
    },
  } as TCurrentUserDto,

  manager: {
    user_id: 'test-manager-id',
    employee_id: 'MGR001',
    user_name: 'peter.manager@company.com',
    display_name: 'Peter Test Manager',
    email: 'peter.manager@company.com',
    position: {
      id: 'pos-002',
      title: 'Principal Software Engineer',
    },
  } as TCurrentUserDto,

  admin: {
    user_id: 'test-admin-id',
    employee_id: 'ADM001',
    user_name: 'admin@company.com',
    display_name: 'Admin Test User',
    email: 'admin@company.com',
    position: {
      id: 'pos-003',
      title: 'System Administrator',
    },
  } as TCurrentUserDto,
}

// Default current user (can be overridden in tests)
let currentMockUser = mockUsers.employee

// Helper to set the current user for tests
export const setMockCurrentUser = (userType: keyof typeof mockUsers) => {
  currentMockUser = mockUsers[userType]
}

// MSW request handlers
export const userHandlers = [
  // GET /api/me - Current user endpoint
  http.get(`${API_BASE_URL}/me`, () => {
    return HttpResponse.json(currentMockUser)
  }),

  // PUT /api/me - Update current user
  http.put(`${API_BASE_URL}/me`, async ({ request }) => {
    const updatedData = (await request.json()) as Partial<TCurrentUserDto>

    // Simulate updating the current user
    const updatedUser = {
      ...currentMockUser,
      ...updatedData,
      // Don't allow changing sensitive fields
      user_id: currentMockUser.user_id,
      employee_id: currentMockUser.employee_id,
    }

    // Update the mock user
    currentMockUser = updatedUser

    return HttpResponse.json(updatedUser)
  }),

  // Error scenarios for testing
  http.get(`${API_BASE_URL}/me/error`, () => {
    return HttpResponse.json({ message: 'User not found' }, { status: 404 })
  }),

  http.get(`${API_BASE_URL}/me/server-error`, () => {
    return HttpResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }),

  // Network error simulation
  http.get(`${API_BASE_URL}/me/network-error`, () => {
    return HttpResponse.error()
  }),
]
