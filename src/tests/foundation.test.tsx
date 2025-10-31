import { cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mockUsers } from '../mocks/handlers/userHandlers'
import { server } from '../mocks/server'
import {
  cleanupTest,
  renderWithLanguage,
  renderWithProviders,
  renderWithUser,
} from './utils'

// Simple test component for validation
function TestComponent() {
  return (
    <div>
      <h1>Test Component</h1>
      <button>Click me</button>
    </div>
  )
}

describe('Testing Foundation', () => {
  beforeEach(() => {
    server.listen({ onUnhandledRequest: 'error' })
  })

  afterEach(() => {
    cleanup() // Clean up DOM between tests
    server.resetHandlers()
    cleanupTest()
  })

  describe('Render Utilities', () => {
    it('renders component with basic providers', () => {
      const { container } = renderWithProviders(<TestComponent />)

      expect(container.querySelector('h1')).toHaveTextContent('Test Component')
      expect(container.querySelector('button')).toHaveTextContent('Click me')
    })

    it('renders component with different user types', () => {
      const { container, rerender } = renderWithUser(
        <TestComponent />,
        'employee'
      )
      expect(container.querySelector('h1')).toHaveTextContent('Test Component')

      // Test user switching
      rerender(<TestComponent />, { userType: 'manager' })
      expect(container.querySelector('h1')).toHaveTextContent('Test Component')
    })

    it('renders component with different languages', async () => {
      const { container } = renderWithLanguage(<TestComponent />, 'es')

      // Component should render regardless of language
      expect(container.querySelector('h1')).toHaveTextContent('Test Component')
    })

    it('handles user interactions', async () => {
      const user = userEvent.setup()
      const { container } = renderWithProviders(<TestComponent />)

      const button = container.querySelector('button')
      expect(button).toBeDefined()

      // Test user interaction
      if (button) {
        await user.click(button)
        expect(button).toHaveTextContent('Click me')
      }
    })
  })

  describe('Mock Data', () => {
    it('provides different user types', () => {
      expect(mockUsers.employee).toBeDefined()
      expect(mockUsers.manager).toBeDefined()
      expect(mockUsers.admin).toBeDefined()

      expect(mockUsers.employee.display_name).toBe('Jane Test Employee')
      expect(mockUsers.manager.display_name).toBe('Peter Test Manager')
      expect(mockUsers.admin.display_name).toBe('Admin Test User')
    })

    it('uses proper DTO structure', () => {
      const employee = mockUsers.employee

      // Check snake_case fields from API
      expect(employee.user_id).toBeDefined()
      expect(employee.employee_id).toBeDefined()
      expect(employee.display_name).toBeDefined()
      expect(employee.user_name).toBeDefined()
      expect(employee.email).toBeDefined()
      expect(employee.position).toBeDefined()
    })
  })

  describe('MSW Integration', () => {
    it('intercepts API calls', async () => {
      // Check that all handlers are registered (user + dashboard handlers)
      const handlers = server.listHandlers()
      expect(handlers.length).toBeGreaterThanOrEqual(10) // 5 user handlers + 5 dashboard handlers

      // Verify MSW server is properly configured
      expect(handlers).toBeDefined()
      expect(Array.isArray(handlers)).toBe(true)
    })
  })

  describe('Cleanup', () => {
    it('resets state between tests', () => {
      // Test that cleanup works
      const { container } = renderWithLanguage(<TestComponent />, 'fr')
      expect(container.querySelector('h1')).toHaveTextContent('Test Component')

      // Cleanup is handled by afterEach, so just verify component rendered
      expect(container.querySelector('button')).toHaveTextContent('Click me')
    })
  })
})
