// Rating Chart Wrapper for lazy loading
import React from 'react'
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

export interface RatingChartData {
  rating: string
  count: number
  percentage: number
}

interface RatingChartProps {
  data: RatingChartData[]
}

export const RatingChart: React.FC<RatingChartProps> = ({ data }) => {
  const { t } = useTranslation()
  return (
    <ResponsiveContainer width='100%' height={300}>
      <BarChart
        data={data}
        layout='vertical'
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis type='number' domain={[0, 100]} unit='%' />
        <YAxis dataKey='rating' type='category' width={150} />
        <Tooltip
          formatter={(value: number | string) => `${Number(value).toFixed(1)}%`}
          labelFormatter={(label: string) => label}
        />
        <Legend />
        <Bar
          dataKey='percentage'
          fill='#1976d2'
          name={t('feedback.analytics.percentage', 'Percentage')}
          label={{
            position: 'right',
            formatter: (val: number) => `${val.toFixed(0)}%`,
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
