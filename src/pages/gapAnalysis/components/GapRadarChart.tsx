import { Box, Typography, useTheme } from '@mui/material'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ISkillGap } from '@/models/GapAnalysis'

interface IGapRadarChartProps {
  skillGaps: ISkillGap[]
}

const getStyles = () => ({
  container: { width: '100%', mb: 3 },
  emptyState: { py: 4, textAlign: 'center' as const, color: 'text.secondary' },
})

const GapRadarChart: React.FC<IGapRadarChartProps> = React.memo(
  ({ skillGaps }) => {
    const { t } = useTranslation()
    const theme = useTheme()
    const styles = useMemo(() => getStyles(), [])

    const chartData = useMemo(
      () =>
        skillGaps.map(gap => ({
          skill: gap.skill.title,
          required: gap.requiredLevel.value,
          actual: gap.actualLevel.value,
        })),
      [skillGaps]
    )

    if (skillGaps.length === 0) {
      return (
        <Box sx={styles.emptyState}>
          <Typography variant='body1'>
            {t('gap_analysis.table.no_skills', 'No skills to display')}
          </Typography>
        </Box>
      )
    }

    const requiredColor = theme.palette.primary.main
    const actualColor = theme.palette.grey[500]

    if (skillGaps.length < 3) {
      return (
        <Box
          sx={styles.container}
          role='img'
          aria-label={t(
            'gap_analysis.bar_chart_title',
            'Skills gap bar chart'
          )}
        >
          <ResponsiveContainer width='100%' height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='skill' />
              <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey='required'
                name={t('gap_analysis.radar_required', 'Required Level')}
                fill={requiredColor}
              />
              <Bar
                dataKey='actual'
                name={t('gap_analysis.radar_actual', 'Actual Level')}
                fill={actualColor}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )
    }

    return (
      <Box
        sx={styles.container}
        role='img'
        aria-label={t(
          'gap_analysis.radar_chart_title',
          'Skills gap radar chart'
        )}
      >
        <ResponsiveContainer width='100%' height={350}>
          <RadarChart data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey='skill' />
            <PolarRadiusAxis angle={90} domain={[0, 5]} tickCount={6} />
            <Radar
              name={t('gap_analysis.radar_required', 'Required Level')}
              dataKey='required'
              stroke={requiredColor}
              fill={requiredColor}
              fillOpacity={0.3}
            />
            <Radar
              name={t('gap_analysis.radar_actual', 'Actual Level')}
              dataKey='actual'
              stroke={actualColor}
              fill={actualColor}
              fillOpacity={0.15}
            />
            <Legend />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </Box>
    )
  }
)

GapRadarChart.displayName = 'GapRadarChart'

export default GapRadarChart
