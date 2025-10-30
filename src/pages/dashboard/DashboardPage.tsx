import { Box, Typography } from '@mui/material'
import React from 'react'
import { DashboardGrid } from '../../components/dashboard/layout/DashboardGrid'
import {
  ActivityFeedWidget,
  FeedbackSummaryWidget,
  GoalSummaryWidget,
  SkillProgressWidget,
} from '../../components/dashboard/widgets'

/**
 * DashboardPage Component
 * Main dashboard with comprehensive data widgets and visualizations
 */
export const DashboardPage: React.FC = () => {
  return (
    <Box>
      <Typography variant='h4' component='h1' gutterBottom>
        Dashboard
      </Typography>

      <DashboardGrid>
        <GoalSummaryWidget />
        <FeedbackSummaryWidget />
        <SkillProgressWidget />
        <ActivityFeedWidget />
      </DashboardGrid>
    </Box>
  )
}
