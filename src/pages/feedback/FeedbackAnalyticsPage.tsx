// Feedback Analytics Page - Feature 0005 Task T087
// Displays analytics dashboard with metrics, charts, and insights

import { Box, CircularProgress, Typography } from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MetricsCards } from '../../components/Feedback/MetricsCards'
import { MonthlyTrendChart } from '../../components/Feedback/MonthlyTrendChart'
import { RatingDistributionChart } from '../../components/Feedback/RatingDistributionChart'
import { TimeRangeSelector } from '../../components/Feedback/TimeRangeSelector'
import { TopLists } from '../../components/Feedback/TopLists'
import { useFeedbackAnalytics } from '../../hooks/useFeedbackAnalytics'
import {
  TimeRangePreset,
  type CustomDateRange,
} from '../../utils/analyticsCalculations'

/**
 * Feedback Analytics Page
 * Shows comprehensive analytics and insights for received feedback
 * Includes: metrics cards, charts, top lists, time range selector, comparison toggle
 */
export const FeedbackAnalyticsPage: React.FC = () => {
  const { t } = useTranslation()

  // State for time range selection
  const [timeRangePreset, setTimeRangePreset] = useState<TimeRangePreset>(
    TimeRangePreset.YearToDate
  )
  const [customDateRange, setCustomDateRange] = useState<
    CustomDateRange | undefined
  >()
  const [includeComparison, setIncludeComparison] = useState(false)

  // Fetch analytics data
  const { data, isLoading, error, refetch } = useFeedbackAnalytics({
    preset: timeRangePreset,
    customRange: customDateRange,
    includeComparison,
  })

  const analytics = data?.data

  // Handle time range change
  const handleTimeRangeChange = (
    preset: TimeRangePreset,
    customRange?: CustomDateRange
  ) => {
    setTimeRangePreset(preset)
    setCustomDateRange(customRange)
  }

  // Handle comparison toggle
  const handleComparisonToggle = () => {
    setIncludeComparison(prev => !prev)
  }

  // Loading state
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color='error' gutterBottom>
          {t('feedback.analytics.error.title', 'Failed to load analytics')}
        </Typography>
        <Typography variant='body2' color='text.secondary' gutterBottom>
          {t(
            'feedback.analytics.error.message',
            'An error occurred while loading analytics data. Please try again.'
          )}
        </Typography>
        <Typography
          variant='body2'
          color='primary'
          sx={{ cursor: 'pointer', textDecoration: 'underline', mt: 2 }}
          onClick={() => refetch()}
        >
          {t('common.retry', 'Retry')}
        </Typography>
      </Box>
    )
  }

  // No data state
  if (!analytics) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color='text.secondary'>
          {t('feedback.analytics.noData', 'No analytics data available')}
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header with Time Range Selector */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
        }}
      >
        <Typography variant='h5'>
          {t('feedback.analytics.title', 'Feedback Analytics')}
        </Typography>

        <TimeRangeSelector
          preset={timeRangePreset}
          customRange={customDateRange}
          includeComparison={includeComparison}
          onPresetChange={handleTimeRangeChange}
          onComparisonToggle={handleComparisonToggle}
        />
      </Box>

      {/* Metrics Cards */}
      <Box sx={{ mb: 4 }}>
        <MetricsCards analytics={analytics} />
      </Box>

      {/* Charts Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
          mb: 4,
        }}
      >
        {/* Rating Distribution Chart */}
        <Box>
          <RatingDistributionChart
            distribution={analytics.rating_distribution}
            comparison={analytics.comparison}
          />
        </Box>

        {/* Monthly Trend Chart */}
        <Box>
          <MonthlyTrendChart trend={analytics.monthly_trend} />
        </Box>
      </Box>

      {/* Top Lists */}
      <Box>
        <TopLists
          topProviders={analytics.top_providers}
          topGoals={analytics.top_goals}
          topProjects={analytics.top_projects}
        />
      </Box>
    </Box>
  )
}
