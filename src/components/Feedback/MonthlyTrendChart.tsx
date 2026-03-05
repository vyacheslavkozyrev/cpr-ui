// Monthly Trend Chart Component - Feature 0005 Task T098
// Line chart showing feedback count per month over last 12 months

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
import type { MonthlyFeedbackTrend } from '../../types/feedback'

// Lazy load the chart wrapper component
const TrendChartComponent = lazy(() =>
  import('./TrendChart').then(module => ({ default: module.TrendChart }))
)

export interface MonthlyTrendChartProps {
  /** Monthly trend data */
  trend: MonthlyFeedbackTrend[]
}

/**
 * Monthly Trend Chart Component
 * Shows line chart with feedback count and average rating per month
 * Includes accessible data table toggle
 */
export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({
  trend,
}) => {
  const { t } = useTranslation()
  const [showTable, setShowTable] = useState(false)

  // Format month labels (YYYY-MM to MMM YYYY)
  const chartData = trend.map(item => ({
    ...item,
    monthLabel: formatMonthLabel(item.month),
  }))

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
            {t('feedback.analytics.charts.monthlyTrend', 'Monthly Trend')}
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
                    {t('feedback.analytics.table.month', 'Month')}
                  </TableCell>
                  <TableCell align='right'>
                    {t('feedback.analytics.table.count', 'Count')}
                  </TableCell>
                  <TableCell align='right'>
                    {t('feedback.analytics.table.avgRating', 'Avg Rating')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {chartData.map(row => (
                  <TableRow key={row.month}>
                    <TableCell>{row.monthLabel}</TableCell>
                    <TableCell align='right'>{row.count}</TableCell>
                    <TableCell align='right'>
                      {row.average_rating.toFixed(1)}★
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
            <TrendChartComponent data={chartData} />
          </Suspense>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Format month from YYYY-MM to MMM YYYY
 */
function formatMonthLabel(month: string): string {
  const date = new Date(`${month}-01`)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
}
