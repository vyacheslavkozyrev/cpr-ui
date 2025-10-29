import { cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RoleGuard } from '../../components/auth/RoleGuard'
import { server } from '../../mocks/server'
import { UserRole } from '../../models'
import { renderWithUser } from '../utils'

// Mock the auth store to prevent any hanging async operations
vi.mock('../../stores/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    isAuthenticated: true,
    isLoading: false,
    user: { roles: [UserRole.EMPLOYEE] },
    error: null,
  })),
}))

// Import the mocked hook for dynamic configuration
import { useAuthStore as mockUseAuthStore } from '../../stores/authStore'

// Helper to set mock user roles for specific tests
const setMockUserRoles = (roles: UserRole[]) => {
  vi.mocked(mockUseAuthStore).mockReturnValue({
    isAuthenticated: true,
    isLoading: false,
    user: { roles },
    error: null,
  })
}

// Mock auth hooks to prevent navigation hangs
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    login: vi.fn(),
    logout: vi.fn(),
    isLoading: false,
    error: null,
    isStubMode: true,
    isAuthenticated: true,
  })),
}))

// Mock components for testing
const MockProtectedComponent = () => (
  <div data-testid='protected-content'>Protected Content</div>
)
const MockUnauthorizedComponent = () => (
  <div data-testid='unauthorized'>Unauthorized Access</div>
)

describe('Authentication System Tests', () => {
  beforeEach(() => {
    server.listen({ onUnhandledRequest: 'error' })
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
    server.resetHandlers()
  })

  describe('RoleGuard Component', () => {
    it('allows access for users with required role', () => {
      setMockUserRoles([UserRole.EMPLOYEE])

      const { container } = renderWithUser(
        <RoleGuard allowedRoles={[UserRole.EMPLOYEE]}>
          <MockProtectedComponent />
        </RoleGuard>,
        'employee'
      )

      expect(
        container.querySelector('[data-testid="protected-content"]')
      ).toHaveTextContent('Protected Content')
    })

    it('allows access for users with multiple roles', () => {
      setMockUserRoles([UserRole.PEOPLE_MANAGER])

      const { container } = renderWithUser(
        <RoleGuard allowedRoles={[UserRole.EMPLOYEE, UserRole.PEOPLE_MANAGER]}>
          <MockProtectedComponent />
        </RoleGuard>,
        'manager'
      )

      expect(
        container.querySelector('[data-testid="protected-content"]')
      ).toHaveTextContent('Protected Content')
    })

    it('denies access for users without required role', () => {
      setMockUserRoles([UserRole.EMPLOYEE])

      const { container } = renderWithUser(
        <RoleGuard
          allowedRoles={[UserRole.ADMINISTRATOR]}
          fallback={<MockUnauthorizedComponent />}
        >
          <MockProtectedComponent />
        </RoleGuard>,
        'employee' // Employee trying to access admin content
      )

      expect(
        container.querySelector('[data-testid="unauthorized"]')
      ).toHaveTextContent('Unauthorized Access')
      expect(
        container.querySelector('[data-testid="protected-content"]')
      ).toBeFalsy()
    })

    it('allows admin users to access all content', () => {
      setMockUserRoles([UserRole.ADMINISTRATOR])

      const { container } = renderWithUser(
        <RoleGuard allowedRoles={[UserRole.ADMINISTRATOR]}>
          <MockProtectedComponent />
        </RoleGuard>,
        'admin'
      )

      expect(
        container.querySelector('[data-testid="protected-content"]')
      ).toHaveTextContent('Protected Content')
    })
  })

  describe('Authentication Flow Integration', () => {
    it('handles role access correctly for employees', () => {
      setMockUserRoles([UserRole.EMPLOYEE])

      const { container } = renderWithUser(
        <RoleGuard
          allowedRoles={[UserRole.EMPLOYEE]}
          fallback={<MockUnauthorizedComponent />}
        >
          <MockProtectedComponent />
        </RoleGuard>,
        'employee'
      )

      // Employee should have access to employee content
      expect(
        container.querySelector('[data-testid="protected-content"]')
      ).toBeTruthy()
      expect(
        container.querySelector('[data-testid="unauthorized"]')
      ).toBeFalsy()
    })

    it('handles role access correctly for managers', () => {
      setMockUserRoles([UserRole.PEOPLE_MANAGER])

      const { container } = renderWithUser(
        <RoleGuard
          allowedRoles={[UserRole.PEOPLE_MANAGER]}
          fallback={<MockUnauthorizedComponent />}
        >
          <MockProtectedComponent />
        </RoleGuard>,
        'manager'
      )

      // Manager should have access to manager content
      expect(
        container.querySelector('[data-testid="protected-content"]')
      ).toBeTruthy()
      expect(
        container.querySelector('[data-testid="unauthorized"]')
      ).toBeFalsy()
    })

    it('denies access when roles do not match', () => {
      setMockUserRoles([UserRole.EMPLOYEE])

      const { container } = renderWithUser(
        <RoleGuard
          allowedRoles={[UserRole.PEOPLE_MANAGER]}
          fallback={<MockUnauthorizedComponent />}
        >
          <MockProtectedComponent />
        </RoleGuard>,
        'employee'
      )

      // Employee should not have access to manager content
      expect(
        container.querySelector('[data-testid="unauthorized"]')
      ).toBeTruthy()
      expect(
        container.querySelector('[data-testid="protected-content"]')
      ).toBeFalsy()
    })

    it('renders protected content correctly with proper wrapper', () => {
      setMockUserRoles([UserRole.ADMINISTRATOR])

      const TestComponent = () => (
        <MemoryRouter>
          <RoleGuard
            allowedRoles={[UserRole.ADMINISTRATOR]}
            fallback={<MockUnauthorizedComponent />}
          >
            <MockProtectedComponent />
          </RoleGuard>
        </MemoryRouter>
      )

      // Use renderWithUser to get proper auth context
      const { container } = renderWithUser(<TestComponent />, 'admin')

      expect(
        container.querySelector('[data-testid="protected-content"]')
      ).toHaveTextContent('Protected Content')
    })
  })
})
