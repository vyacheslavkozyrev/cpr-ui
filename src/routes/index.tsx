import { Navigate, type RouteObject } from 'react-router-dom'
import { ProtectedRoute, RoleGuard } from '../components/auth'
import { NotFoundPage, RouteErrorBoundary } from '../components/errors'
import { AppLayout } from '../components/layout'
import { UserRole } from '../models'
import { AdminPage } from '../pages/admin'
import { LoginPage } from '../pages/auth'
import { DashboardPage } from '../pages/dashboard'
import { FeedbackPage } from '../pages/feedback'
import { GoalsPage } from '../pages/goals'
import { ProfilePage } from '../pages/profile'
import { SettingsPage } from '../pages/settings'
import { SkillsPage } from '../pages/skills'
import { TeamPage } from '../pages/team'
import { TestErrorsPage } from '../pages/test-errors'

/**
 * Application route configuration
 * Defines all routes with protection and role-based access
 */
export const routes: RouteObject[] = [
  // Public routes
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },

  // Protected routes with layout
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      // Default redirect to dashboard
      {
        index: true,
        element: <Navigate to='/dashboard' replace />,
      },

      // Dashboard - accessible to all authenticated users
      {
        path: 'dashboard',
        element: <DashboardPage />,
        errorElement: <RouteErrorBoundary />,
      },

      // Profile - accessible to all authenticated users
      {
        path: 'profile',
        element: <ProfilePage />,
        errorElement: <RouteErrorBoundary />,
      },

      // Goals - accessible to all authenticated users
      {
        path: 'goals',
        element: <GoalsPage />,
        errorElement: <RouteErrorBoundary />,
      },

      // Skills - accessible to all authenticated users
      {
        path: 'skills',
        element: <SkillsPage />,
        errorElement: <RouteErrorBoundary />,
      },

      // Feedback - accessible to all authenticated users
      {
        path: 'feedback',
        element: <FeedbackPage />,
        errorElement: <RouteErrorBoundary />,
      },

      // Settings - accessible to all authenticated users
      {
        path: 'settings',
        element: <SettingsPage />,
        errorElement: <RouteErrorBoundary />,
      },

      // Team management - Manager+ only
      {
        path: 'team',
        element: (
          <RoleGuard
            allowedRoles={[
              UserRole.PEOPLE_MANAGER,
              UserRole.SOLUTION_OWNER,
              UserRole.DIRECTOR,
              UserRole.ADMINISTRATOR,
            ]}
          >
            <TeamPage />
          </RoleGuard>
        ),
        errorElement: <RouteErrorBoundary />,
      },

      // Admin panel - Admin only
      {
        path: 'admin',
        element: (
          <RoleGuard allowedRoles={[UserRole.ADMINISTRATOR]}>
            <AdminPage />
          </RoleGuard>
        ),
        errorElement: <RouteErrorBoundary />,
      },

      // Test error boundaries (development only)
      {
        path: 'test-errors',
        element: <TestErrorsPage />,
        errorElement: <RouteErrorBoundary />,
      },
    ],
  },

  // 404 catch-all route
  {
    path: '*',
    element: <NotFoundPage />,
  },
]
