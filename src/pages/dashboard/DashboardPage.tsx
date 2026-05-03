import { Box, Typography } from '@mui/material'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { UserStatisticsCards } from '../../components/dashboard/cards'
import {
  DashboardCustomization,
  useDashboardCustomization,
} from '../../components/dashboard/customization'
import { DashboardGrid } from '../../components/dashboard/layout/DashboardGrid'
import {
  ActivityFeedWidget,
  FeedbackRequestsWidget,
  FeedbackSummaryWidget,
  GoalSummaryWidget,
  SkillProgressWidget,
} from '../../components/dashboard/widgets'
import { useDashboardSummary } from '../../services/api/dashboardService'

/**
 * DashboardPage Component
 * Main dashboard with comprehensive data widgets and visualizations
 * Features: responsive grid layout, user statistics, widget customization, breadcrumb navigation
 */
export const DashboardPage: React.FC = () => {
  const { t } = useTranslation()
  const { widgets, toggleWidget, resetLayout, getVisibleWidgets } =
    useDashboardCustomization()

  const { data: summaryData, isLoading: summaryLoading } = useDashboardSummary()

  const userStats = useMemo(
    () => ({
      goalsCompleted: summaryData?.goals.completed ?? 0,
      feedbackReceived: summaryData?.feedback.totalReceived ?? 0,
      skillsAssessed: summaryData?.skills.assessedSkills ?? 0,
      isLoading: summaryLoading,
    }),
    [summaryData, summaryLoading]
  )

  const visibleWidgets = getVisibleWidgets()

  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case 'goals':
        return <GoalSummaryWidget />
      case 'feedback':
        return <FeedbackSummaryWidget />
      case 'feedbackRequests':
        return <FeedbackRequestsWidget />
      case 'skills':
        return <SkillProgressWidget />
      case 'activity':
        return <ActivityFeedWidget />
      default:
        return null
    }
  }

  return (
    <Box>
      {/* Page Header with Settings */}
      <Box
        display='flex'
        justifyContent='space-between'
        alignItems='center'
        mb={2}
      >
        <Typography variant='h4' component='h1'>
          {t('navigation.dashboard')}
        </Typography>
        <DashboardCustomization
          widgets={widgets}
          onWidgetToggle={toggleWidget}
          onResetLayout={resetLayout}
          inline
        />
      </Box>

      {/* User Statistics Cards */}
      <UserStatisticsCards
        goalsCompleted={userStats.goalsCompleted}
        feedbackReceived={userStats.feedbackReceived}
        skillsAssessed={userStats.skillsAssessed}
        isLoading={userStats.isLoading}
      />

      {/* Dashboard Widgets Grid */}
      <DashboardGrid>
        {visibleWidgets.map(widget => (
          <Box key={widget.id}>{renderWidget(widget.id)}</Box>
        ))}
      </DashboardGrid>
    </Box>
  )
}
