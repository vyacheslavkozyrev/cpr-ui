// Trend Chart Wrapper for lazy loading
import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { MonthlyFeedbackTrend } from '../../types/feedback'

interface TrendChartProps {
  data: MonthlyFeedbackTrend[]
}

export const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  const { t } = useTranslation()
  return (
    <ResponsiveContainer width='100%' height={300}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis dataKey='monthLabel' />
        <YAxis
          yAxisId='left'
          label={{
            value: t('feedback.analytics.count', 'Count'),
            angle: -90,
            position: 'insideLeft',
          }}
        />
        <YAxis
          yAxisId='right'
          orientation='right'
          domain={[0, 5]}
          label={{
            value: t('feedback.analytics.avgRating', 'Avg Rating'),
            angle: 90,
            position: 'insideRight',
          }}
        />
        <Tooltip
          labelFormatter={(label: string) => label}
          formatter={(value: number | string, name: string) =>
            name === 'average_rating'
              ? `${Number(value).toFixed(1)}\u2605`
              : value
          }
        />
        <Legend />
        <Line
          yAxisId='left'
          type='monotone'
          dataKey='count'
          stroke='#1976d2'
          strokeWidth={2}
          dot={{ r: 4 }}
          name={t('feedback.analytics.feedbackCount', 'Feedback Count')}
        />
        <Line
          yAxisId='right'
          type='monotone'
          dataKey='average_rating'
          stroke='#f57c00'
          strokeWidth={2}
          dot={{ r: 4 }}
          name={t('feedback.analytics.avgRating', 'Avg Rating')}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
