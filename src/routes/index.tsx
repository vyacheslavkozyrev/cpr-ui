import { Navigate, type RouteObject } from 'react-router-dom'
import { ProtectedRoute, RoleGuard } from '../components/auth'
import { NotFoundPage, RouteErrorBoundary } from '../components/errors'
import { FeedbackRequestForm } from '../components/FeedbackRequest/form'
import { AppLayout } from '../components/layout'
import TaxonomyAdminTabs from '../components/taxonomy/admin/TaxonomyAdminTabs'
import { EUserRole } from '../models'
import { AdminPage } from '../pages/admin'
import { LoginPage } from '../pages/auth'
import { DashboardPage } from '../pages/dashboard'
import {
  FeedbackDetailPage,
  FeedbackPage,
  GiveFeedbackPage,
  NewFeedbackPage,
} from '../pages/feedback'
import { GoalDetailPage, GoalFormPage, GoalsPage } from '../pages/goals'
import { ProfilePage } from '../pages/profile'
import ReviewCycleDetailPage from '../pages/reviews/ReviewCycleDetailPage'
import ReviewCyclesPage from '../pages/reviews/ReviewCyclesPage'
import MyCyclesPage from '../pages/reviews/MyCyclesPage'
import ReviewRequestsPage from '../pages/reviews/ReviewRequestsPage'
import { SettingsPage } from '../pages/settings'
import EmployeeGapAnalysisPage from '../pages/gapAnalysis/EmployeeGapAnalysisPage'
import GapAnalysisPage from '../pages/gapAnalysis/GapAnalysisPage'
import EmployeeAssessmentPage from '../pages/skillAssessment/EmployeeAssessmentPage'
import SkillAssessmentPage from '../pages/skillAssessment/SkillAssessmentPage'
import TeamSkillOverviewPage from '../pages/skillAssessment/TeamSkillOverviewPage'
import CareerFrameworkPage from '../pages/taxonomy/CareerFrameworkPage'
import CareerPathDetailPage from '../pages/taxonomy/CareerPathDetailPage'
import CareerTrackDetailPage from '../pages/taxonomy/CareerTrackDetailPage'
import PositionDetailPage from '../pages/taxonomy/PositionDetailPage'
import AnalyticsPage from '../pages/analytics/AnalyticsPage'
import TeamListPage from '../pages/team/TeamListPage'
import TeamMemberDashboardPage from '../pages/team/TeamMemberDashboardPage'
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
        errorElement: <RouteErrorBoundary />,
        children: [
          {
            index: true,
            element: <GoalsPage />,
          },
          {
            path: 'new',
            element: <GoalFormPage />,
          },
          {
            path: ':goalId',
            element: <GoalDetailPage />,
          },
          {
            path: ':goalId/edit',
            element: <GoalFormPage />,
          },
        ],
      },

      // Skills - accessible to all authenticated users
      {
        path: 'skills',
        errorElement: <RouteErrorBoundary />,
        children: [
          {
            index: true,
            element: <SkillAssessmentPage />,
          },
          {
            path: 'assessment',
            element: <SkillAssessmentPage />,
          },
          {
            path: 'team',
            element: (
              <RoleGuard allowedRoles={[EUserRole.PEOPLE_MANAGER]}>
                <TeamSkillOverviewPage />
              </RoleGuard>
            ),
          },
          {
            path: 'employees/:employeeId/assessment',
            element: (
              <RoleGuard
                allowedRoles={[
                  EUserRole.PEOPLE_MANAGER,
                  EUserRole.DIRECTOR,
                  EUserRole.ADMINISTRATOR,
                ]}
              >
                <EmployeeAssessmentPage />
              </RoleGuard>
            ),
          },
        ],
      },

      // Analytics - accessible to all authenticated users (AC-001, AC-002)
      {
        path: 'analytics',
        element: <AnalyticsPage />,
        errorElement: <RouteErrorBoundary />,
      },

      // Gap Analysis - accessible to all authenticated users
      {
        path: 'gap-analysis',
        element: <GapAnalysisPage />,
        errorElement: <RouteErrorBoundary />,
      },

      // Employee Gap Analysis - Manager/Director/Admin only
      {
        path: 'employees/:id/gap-analysis',
        element: (
          <RoleGuard
            allowedRoles={[
              EUserRole.PEOPLE_MANAGER,
              EUserRole.DIRECTOR,
              EUserRole.ADMINISTRATOR,
            ]}
          >
            <EmployeeGapAnalysisPage />
          </RoleGuard>
        ),
        errorElement: <RouteErrorBoundary />,
      },

      // Feedback - accessible to all authenticated users
      {
        path: 'feedback',
        errorElement: <RouteErrorBoundary />,
        children: [
          {
            index: true,
            element: <FeedbackPage />,
          },
          {
            path: 'new',
            element: <NewFeedbackPage />,
          },
          {
            // Entry point from FeedbackRequestCard — reads employee_id,
            // feedback_request_id query params to pre-fill the form
            path: 'give',
            element: <GiveFeedbackPage />,
          },
          {
            path: ':id',
            element: <FeedbackDetailPage />,
          },
          {
            path: 'request/new',
            element: <FeedbackRequestForm />,
          },
        ],
      },

      // Review Cycles - Director/Admin only (management view)
      {
        path: 'reviews',
        errorElement: <RouteErrorBoundary />,
        children: [
          {
            index: true,
            element: (
              <RoleGuard
                allowedRoles={[EUserRole.DIRECTOR, EUserRole.ADMINISTRATOR]}
              >
                <ReviewCyclesPage />
              </RoleGuard>
            ),
          },
          {
            path: ':id',
            element: <ReviewCycleDetailPage />,
          },
        ],
      },

      // My Reviews - accessible to all authenticated users
      {
        path: 'my-reviews',
        element: <MyCyclesPage />,
        errorElement: <RouteErrorBoundary />,
      },

      // My Review Requests - accessible to all authenticated users
      {
        path: 'my-review-requests',
        element: <ReviewRequestsPage />,
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
        errorElement: <RouteErrorBoundary />,
        children: [
          {
            index: true,
            element: (
              <RoleGuard
                allowedRoles={[
                  EUserRole.PEOPLE_MANAGER,
                  EUserRole.SOLUTION_OWNER,
                  EUserRole.DIRECTOR,
                  EUserRole.ADMINISTRATOR,
                ]}
              >
                <TeamListPage />
              </RoleGuard>
            ),
          },
          {
            path: ':employeeId',
            element: (
              <RoleGuard
                allowedRoles={[
                  EUserRole.PEOPLE_MANAGER,
                  EUserRole.DIRECTOR,
                  EUserRole.ADMINISTRATOR,
                ]}
              >
                <TeamMemberDashboardPage />
              </RoleGuard>
            ),
          },
        ],
      },

      // Career Framework - accessible to all authenticated users
      {
        path: 'career-framework',
        errorElement: <RouteErrorBoundary />,
        children: [
          {
            index: true,
            element: <CareerFrameworkPage />,
          },
          {
            path: ':pathId',
            element: <CareerPathDetailPage />,
          },
          {
            path: ':pathId/tracks/:trackId',
            element: <CareerTrackDetailPage />,
          },
          {
            path: ':pathId/tracks/:trackId/positions/:positionId',
            element: <PositionDetailPage />,
          },
        ],
      },

      // Career Framework Admin - Administrator only
      {
        path: 'settings/career-framework',
        element: (
          <RoleGuard allowedRoles={[EUserRole.ADMINISTRATOR]}>
            <TaxonomyAdminTabs />
          </RoleGuard>
        ),
        errorElement: <RouteErrorBoundary />,
      },

      // Admin panel - Admin only
      {
        path: 'admin',
        element: (
          <RoleGuard allowedRoles={[EUserRole.ADMINISTRATOR]}>
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
