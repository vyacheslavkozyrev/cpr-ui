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
import type { ISkillCategoryGroup } from '@/types/skillAssessment.types'

interface IAssessmentSkillsRadarChartProps {
  skillCategories: ISkillCategoryGroup[]
  nextPositionNull?: boolean
}

const getStyles = () => ({
  container: { width: '100%', mb: 3 },
  emptyState: { py: 4, textAlign: 'center' as const, color: 'text.secondary' },
  caption: { mt: 1, textAlign: 'center' as const },
})

const AssessmentSkillsRadarChart: React.FC<IAssessmentSkillsRadarChartProps> =
  React.memo(({ skillCategories, nextPositionNull = false }) => {
    const { t } = useTranslation()
    const theme = useTheme()
    const styles = useMemo(() => getStyles(), [])

    const allSkills = useMemo(
      () => skillCategories.flatMap(c => c.skills),
      [skillCategories]
    )

    const chartData = useMemo(
      () =>
        allSkills.map(s => ({
          skill: s.skill_title,
          current: s.assessed?.self_assessment_value ?? 0,
          nextRequired: s.next_position_required_level?.value ?? 0,
        })),
      [allSkills]
    )

    const hasNextData = useMemo(
      () => chartData.some(d => d.nextRequired > 0),
      [chartData]
    )

    if (allSkills.length === 0) {
      return (
        <Box sx={styles.emptyState}>
          <Typography variant='body1'>
            {t('pages.skillAssessment.noSkills', 'No skills to display')}
          </Typography>
        </Box>
      )
    }

    const currentColor = theme.palette.primary.main
    const nextColor = theme.palette.grey[500]

    if (allSkills.length < 3) {
      return (
        <Box
          sx={styles.container}
          role='img'
          aria-label={t(
            'pages.skillAssessment.barChartAriaLabel',
            'Skill assessment bar chart'
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
                dataKey='current'
                name={t(
                  'pages.skillAssessment.myCurrentLevel',
                  'My Current Level'
                )}
                fill={currentColor}
              />
              {!nextPositionNull && hasNextData && (
                <Bar
                  dataKey='nextRequired'
                  name={t(
                    'pages.skillAssessment.nextLevelRequired',
                    'Next Level Required'
                  )}
                  fill={nextColor}
                />
              )}
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
          'pages.skillAssessment.radarChartAriaLabel',
          'Skill assessment radar chart'
        )}
      >
        <ResponsiveContainer width='100%' height={350}>
          <RadarChart data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey='skill' />
            <PolarRadiusAxis angle={90} domain={[0, 5]} tickCount={6} />
            <Radar
              name={t(
                'pages.skillAssessment.myCurrentLevel',
                'My Current Level'
              )}
              dataKey='current'
              stroke={currentColor}
              fill={currentColor}
              fillOpacity={0.3}
            />
            {!nextPositionNull && hasNextData && (
              <Radar
                name={t(
                  'pages.skillAssessment.nextLevelRequired',
                  'Next Level Required'
                )}
                dataKey='nextRequired'
                stroke={nextColor}
                fill={nextColor}
                fillOpacity={0.15}
              />
            )}
            <Legend />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
        {nextPositionNull && (
          <Typography
            variant='caption'
            color='text.secondary'
            display='block'
            sx={styles.caption}
          >
            {t(
              'pages.skillAssessment.highestPosition',
              'You are at the highest position in your career track.'
            )}
          </Typography>
        )}
      </Box>
    )
  })

AssessmentSkillsRadarChart.displayName = 'AssessmentSkillsRadarChart'

export default AssessmentSkillsRadarChart
