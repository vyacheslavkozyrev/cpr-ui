/**
 * GoalsByStatusChart component
 * Recharts pie/donut chart displaying goals distribution by status (AC-007).
 * Feature 0014 — Performance Analytics & Reporting
 */

import { Box, Typography } from '@mui/material'
import React, { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { IGoalsByStatus } from '../../models/analytics.models'

export interface GoalsByStatusChartProps {
  data: IGoalsByStatus | undefined
}

const STATUS_COLORS: Record<string, string> = {
  open: '#1976d2',
  in_progress: '#ff9800',
  completed: '#4caf50',
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
 * Donut/pie chart showing goals by status distribution.
 */
export const GoalsByStatusChart: React.FC<GoalsByStatusChartProps> = memo(
  ({ data }) => {
    const { t } = useTranslation()
    const styles = useMemo(() => getStyles(), [])

    const chartData = useMemo(() => {
      if (!data) return []
      return [
        {
          name: t('analytics.goals.status.open', 'Open'),
          value: data.open,
          key: 'open',
        },
        {
          name: t('analytics.goals.status.in_progress', 'In Progress'),
          value: data.inProgress,
          key: 'in_progress',
        },
        {
          name: t('analytics.goals.status.completed', 'Completed'),
          value: data.completed,
          key: 'completed',
        },
      ].filter(item => item.value > 0)
    }, [data, t])

    if (chartData.length === 0) {
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
          <PieChart>
            <Pie
              data={chartData}
              cx='50%'
              cy='50%'
              innerRadius={60}
              outerRadius={90}
              dataKey='value'
              label
            >
              {chartData.map(entry => (
                <Cell
                  key={entry.key}
                  fill={STATUS_COLORS[entry.key] ?? '#9e9e9e'}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    )
  }
)

GoalsByStatusChart.displayName = 'GoalsByStatusChart'
