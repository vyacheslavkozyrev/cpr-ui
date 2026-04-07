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
import type { IPositionSkillRequirement } from '@/types/taxonomy.types'

interface ISkillRadarChartProps {
  skills: IPositionSkillRequirement[]
}

// W2: factory function per CLAUDE.md convention
const getStyles = () => ({
  container: {
    width: '100%',
    mb: 3,
  },
  emptyState: {
    py: 4,
    textAlign: 'center' as const,
    color: 'text.secondary',
  },
})

const SkillRadarChart: React.FC<ISkillRadarChartProps> = React.memo(
  ({ skills }) => {
    const { t } = useTranslation()
    const theme = useTheme()
    const styles = useMemo(() => getStyles(), [])
    const levelColor = theme.palette.primary.main

    const chartData = useMemo(
      () =>
        skills.map(s => ({
          skill: s.skill_title,
          level: s.skill_level_value,
        })),
      [skills]
    )

    if (skills.length === 0) {
      return (
        <Box sx={styles.emptyState}>
          <Typography variant='body1'>
            {t('taxonomy.position.noSkills')}
          </Typography>
        </Box>
      )
    }

    // Fall back to bar chart when fewer than 3 skills
    if (skills.length < 3) {
      return (
        // W6: accessible wrapper for bar chart
        <Box
          sx={styles.container}
          role='img'
          aria-label={t('taxonomy.position.skillBarChartAriaLabel')}
        >
          <ResponsiveContainer width='100%' height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='skill' />
              <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey='level'
                name={t('taxonomy.skill.level')}
                fill={levelColor}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )
    }

    return (
      // W6: accessible wrapper for radar chart
      <Box
        sx={styles.container}
        role='img'
        aria-label={t('taxonomy.position.skillRadarChartAriaLabel')}
      >
        <ResponsiveContainer width='100%' height={350}>
          <RadarChart data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey='skill' />
            <PolarRadiusAxis angle={90} domain={[0, 5]} tickCount={6} />
            <Radar
              name={t('taxonomy.skill.level')}
              dataKey='level'
              stroke={levelColor}
              fill={levelColor}
              fillOpacity={0.3}
            />
            <Legend />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </Box>
    )
  }
)

SkillRadarChart.displayName = 'SkillRadarChart'

export default SkillRadarChart
