// Rating Distribution Chart Component - Feature 0005 Task T097
// Horizontal bar chart showing rating distribution with percentages

import {
  Box,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import React, { lazy, Suspense, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ComparisonData, RatingDistribution } from '../../types/feedback'

// Lazy load the chart wrapper component
const RatingChart = lazy(() =>
  import('./RatingChart').then(module => ({ default: module.RatingChart }))
)

export interface RatingDistributionChartProps {
  /** Rating distribution data */
  distribution: RatingDistribution
  /** Optional comparison data for previous period */
  comparison?: ComparisonData | null | undefined
}

/**
 * Rating Distribution Chart Component
 * Shows horizontal bar chart with rating distribution percentages
 * Includes accessible data table toggle for screen readers
 */
export const RatingDistributionChart: React.FC<
  RatingDistributionChartProps
> = ({ distribution }) => {
  const { t } = useTranslation()
  const [showTable, setShowTable] = useState(false)

  // Calculate total count
  const totalCount =
    distribution.one_star +
    distribution.two_star +
    distribution.three_star +
    distribution.four_star +
    distribution.five_star

  // Prepare chart data
  const chartData = [
    {
      rating: t('feedback.analytics.rating.1star', '1★ Needs Improvement'),
      count: distribution.one_star,
      percentage:
        totalCount > 0 ? (distribution.one_star / totalCount) * 100 : 0,
    },
    {
      rating: t('feedback.analytics.rating.2star', '2★ Below Expectations'),
      count: distribution.two_star,
      percentage:
        totalCount > 0 ? (distribution.two_star / totalCount) * 100 : 0,
    },
    {
      rating: t('feedback.analytics.rating.3star', '3★ Meets Expectations'),
      count: distribution.three_star,
      percentage:
        totalCount > 0 ? (distribution.three_star / totalCount) * 100 : 0,
    },
    {
      rating: t('feedback.analytics.rating.4star', '4★ Exceeds Expectations'),
      count: distribution.four_star,
      percentage:
        totalCount > 0 ? (distribution.four_star / totalCount) * 100 : 0,
    },
    {
      rating: t('feedback.analytics.rating.5star', '5★ Outstanding'),
      count: distribution.five_star,
      percentage:
        totalCount > 0 ? (distribution.five_star / totalCount) * 100 : 0,
    },
  ].reverse() // Reverse to show 5★ at top

  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant='h6'>
            {t(
              'feedback.analytics.charts.ratingDistribution',
              'Rating Distribution'
            )}
          </Typography>
          <Typography
            variant='body2'
            color='primary'
            sx={{ cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => setShowTable(!showTable)}
          >
            {showTable
              ? t('feedback.analytics.viewChart', 'View Chart')
              : t('feedback.analytics.viewTable', 'View as Table')}
          </Typography>
        </Box>

        {showTable ? (
          // Accessible data table
          <TableContainer component={Paper} variant='outlined'>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>
                    {t('feedback.analytics.table.rating', 'Rating')}
                  </TableCell>
                  <TableCell align='right'>
                    {t('feedback.analytics.table.count', 'Count')}
                  </TableCell>
                  <TableCell align='right'>
                    {t('feedback.analytics.table.percentage', 'Percentage')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {chartData.map(row => (
                  <TableRow key={row.rating}>
                    <TableCell>{row.rating}</TableCell>
                    <TableCell align='right'>{row.count}</TableCell>
                    <TableCell align='right'>
                      {row.percentage.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          // Chart view
          <Suspense
            fallback={
              <Box
                sx={{
                  height: 300,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography color='text.secondary'>
                  {t('common.loading', 'Loading...')}
                </Typography>
              </Box>
            }
          >
            <RatingChart data={chartData} />
          </Suspense>
        )}
      </CardContent>
    </Card>
  )
}
