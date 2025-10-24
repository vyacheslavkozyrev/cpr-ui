import { Navigate, type RouteObject } from 'react-router-dom'
import { ProtectedRoute, RoleGuard } from '../components/auth'
import { AppLayout } from '../components/layout'
import { AdminPage } from '../pages/admin'
import { LoginPage } from '../pages/auth'
import { DashboardPage } from '../pages/dashboard'
import { FeedbackPage } from '../pages/feedback'
import { GoalsPage } from '../pages/goals'
import { ProfilePage } from '../pages/profile'
import { SkillsPage } from '../pages/skills'
import { TeamPage } from '../pages/team'

/**
 * Application route configuration
 * Defines all routes with protection and role-based access
 */
export const routes: RouteObject[] = [
  // Public routes
  {
    path: '/login',
    element: <LoginPage />,
  },

  // Protected routes with layout
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
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
      },

      // Profile - accessible to all authenticated users
      {
        path: 'profile',
        element: <ProfilePage />,
      },

      // Goals - accessible to all authenticated users
      {
        path: 'goals',
        element: <GoalsPage />,
      },

      // Skills - accessible to all authenticated users
      {
        path: 'skills',
        element: <SkillsPage />,
      },

      // Feedback - accessible to all authenticated users
      {
        path: 'feedback',
        element: <FeedbackPage />,
      },

      // Team management - Manager+ only
      {
        path: 'team',
        element: (
          <RoleGuard allowedRoles={['Manager', 'Director', 'Admin']}>
            <TeamPage />
          </RoleGuard>
        ),
      },

      // Admin panel - Admin only
      {
        path: 'admin',
        element: (
          <RoleGuard allowedRoles={['Admin']}>
            <AdminPage />
          </RoleGuard>
        ),
      },
    ],
  },

  // Catch-all route
  {
    path: '*',
    element: <Navigate to='/dashboard' replace />,
  },
]
