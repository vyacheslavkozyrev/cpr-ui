/**
 * GoalCompletionTrendChart component
 * Recharts bar chart displaying monthly goal creation/completion buckets (AC-006).
 * Feature 0014 — Performance Analytics & Reporting
 */

import { Box, Typography } from '@mui/material'
import React, { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ICompletionTrendEntry } from '../../models/analytics.models'

export interface GoalCompletionTrendChartProps {
  data: ICompletionTrendEntry[]
}

const getStyles = () => ({
  container: { width: '100%', height: 240 },
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 240,
    color: 'text.secondary',
  },
})

/**
 * Bar chart showing monthly goals created vs completed.
 */
export const GoalCompletionTrendChart: React.FC<GoalCompletionTrendChartProps> =
  memo(({ data }) => {
    const { t } = useTranslation()
    const styles = useMemo(() => getStyles(), [])

    if (data.length === 0) {
      return (
        <Box sx={styles.emptyState}>
          <Typography variant='body2'>
            {t('analytics.goals.empty', 'No goal data for this period')}
          </Typography>
        </Box>
      )
    }

    return (
      <Box sx={styles.container}>
        <ResponsiveContainer width='100%' height='100%'>
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          >
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='periodLabel' tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar
              dataKey='created'
              name={t('analytics.goals.trend.created', 'Created')}
              fill='#1976d2'
            />
            <Bar
              dataKey='completed'
              name={t('analytics.goals.trend.completed', 'Completed')}
              fill='#4caf50'
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    )
  })

GoalCompletionTrendChart.displayName = 'GoalCompletionTrendChart'
