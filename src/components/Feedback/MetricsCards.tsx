// Metrics Cards Component - Feature 0005 Tasks T092-T095
// Displays key metrics in card format with trend indicators

import { Box, Card, CardContent, Grid, Rating, Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import type { FeedbackAnalytics } from '../../types/feedback'
import {
  formatPercentageChange,
  getTrendColorClass,
  getTrendIndicator,
} from '../../utils/analyticsCalculations'

export interface MetricsCardsProps {
  /** Analytics data */
  analytics: FeedbackAnalytics
}

/**
 * Metrics Cards Component
 * Displays 4 key metrics in a responsive grid:
 * 1. Total Feedback Received (with trend)
 * 2. Average Rating (with star visualization and trend)
 * 3. Distribution Summary (top rating percentage)
 * 4. Recent Activity (count in current period)
 */
export const MetricsCards: React.FC<MetricsCardsProps> = ({ analytics }) => {
  const { t } = useTranslation()

  // Calculate trend indicators
  const totalChange = analytics.comparison
    ? analytics.comparison.total_delta_percent
    : 0
  const ratingChange = analytics.comparison
    ? analytics.comparison.rating_delta
    : 0

  const hasComparison = Boolean(analytics.comparison)

  // Find dominant rating (highest count)
  const distribution = analytics.rating_distribution
  const ratings = [
    { star: 5, count: distribution.five_star },
    { star: 4, count: distribution.four_star },
    { star: 3, count: distribution.three_star },
    { star: 2, count: distribution.two_star },
    { star: 1, count: distribution.one_star },
  ]
  const topRating = ratings.reduce((prev, current) =>
    current.count > prev.count ? current : prev
  )
  const topRatingPercentage =
    analytics.total_count > 0
      ? ((topRating.count / analytics.total_count) * 100).toFixed(0)
      : 0

  return (
    <Grid container spacing={3}>
      {/* Total Feedback Card */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              {t('feedback.analytics.metrics.totalFeedback', 'Total Feedback')}
            </Typography>
            <Box
              sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}
            >
              <Typography variant='h4'>{analytics.total_count}</Typography>
              {hasComparison && totalChange !== 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography
                    variant='body2'
                    className={getTrendColorClass(totalChange)}
                  >
                    {getTrendIndicator(totalChange)}
                    {formatPercentageChange(totalChange)}
                  </Typography>
                </Box>
              )}
            </Box>
            {hasComparison && (
              <Typography variant='caption' color='text.secondary'>
                {t(
                  'feedback.analytics.metrics.vsPrevious',
                  'vs. previous period'
                )}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Average Rating Card */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              {t('feedback.analytics.metrics.avgRating', 'Average Rating')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant='h4'>
                {analytics.average_rating.toFixed(1)}
              </Typography>
              <Rating
                value={analytics.average_rating}
                precision={0.1}
                readOnly
                size='small'
              />
            </Box>
            {hasComparison && ratingChange !== 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography
                  variant='body2'
                  className={getTrendColorClass(ratingChange)}
                >
                  {getTrendIndicator(ratingChange)}
                  {ratingChange > 0 ? '+' : ''}
                  {ratingChange.toFixed(1)}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  {t(
                    'feedback.analytics.metrics.vsPrevious',
                    'vs. previous period'
                  )}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Distribution Summary Card */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              {t('feedback.analytics.metrics.topRating', 'Most Common Rating')}
            </Typography>
            <Box
              sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}
            >
              <Typography variant='h4'>{topRating.star}★</Typography>
              <Typography variant='h6' color='text.secondary'>
                {topRatingPercentage}%
              </Typography>
            </Box>
            <Typography variant='caption' color='text.secondary'>
              {t('feedback.analytics.metrics.distributionNote', {
                count: topRating.count,
                defaultValue: '{{count}} feedback items',
              })}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Activity Card */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              {t('feedback.analytics.metrics.recentActivity', 'This Period')}
            </Typography>
            <Box
              sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}
            >
              <Typography variant='h4'>{analytics.total_count}</Typography>
              <Typography variant='body2' color='text.secondary'>
                {t('feedback.analytics.metrics.items', 'items')}
              </Typography>
            </Box>
            {analytics.monthly_trend.length > 0 && (
              <Typography variant='caption' color='text.secondary'>
                {t('feedback.analytics.metrics.trend', {
                  avgRating: analytics.average_rating.toFixed(1),
                  defaultValue: 'Avg {{avgRating}}★',
                })}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
