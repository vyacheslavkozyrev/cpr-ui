import { Box, Typography } from '@mui/material'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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

const CATEGORY_COLORS: Record<string, string> = {
  default: '#1976d2',
  alt1: '#388e3c',
  alt2: '#f57c00',
  alt3: '#7b1fa2',
  alt4: '#c62828',
}

const getCategoryColor = (categoryId: string, index: number): string => {
  const keys = Object.keys(CATEGORY_COLORS)
  return (
    CATEGORY_COLORS[keys[index % keys.length]] ?? CATEGORY_COLORS['default']
  )
}

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
    const styles = useMemo(() => getStyles(), [])

    const categoryIds = useMemo(
      () => Array.from(new Set(skills.map(s => s.category_id))),
      [skills]
    )

    const radarData = useMemo(
      () =>
        skills.map(s => ({
          skill: s.skill_title,
          value: s.skill_level_value,
          category_id: s.category_id,
          is_mandatory: s.is_mandatory,
        })),
      [skills]
    )

    const barData = useMemo(
      () =>
        skills.map(s => ({
          name: s.skill_title,
          level: s.skill_level_value,
          category_id: s.category_id,
        })),
      [skills]
    )

    if (skills.length === 0) {
      return (
        <Box sx={styles.emptyState}>
          <Typography variant='body1'>
            {t('taxonomy.position.noSkills', 'No skill requirements defined.')}
          </Typography>
        </Box>
      )
    }

    // Fall back to bar chart when fewer than 3 skills
    if (skills.length < 3) {
      return (
        <Box sx={styles.container}>
          <ResponsiveContainer width='100%' height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='name' />
              <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
              <Tooltip />
              <Legend />
              <Bar dataKey='level' name={t('taxonomy.skill.level', 'Level')}>
                {barData.map(entry => (
                  <Cell
                    key={entry.name}
                    fill={getCategoryColor(
                      entry.category_id,
                      categoryIds.indexOf(entry.category_id)
                    )}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )
    }

    return (
      <Box sx={styles.container}>
        <ResponsiveContainer width='100%' height={350}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey='skill' />
            <PolarRadiusAxis angle={90} domain={[0, 5]} tickCount={6} />
            {categoryIds.map((categoryId, index) => {
              const categorySkills = skills.filter(
                s => s.category_id === categoryId
              )
              const categoryTitle =
                categorySkills[0]?.category_title ?? categoryId
              const color = getCategoryColor(categoryId, index)
              const hasMandatory = categorySkills.some(s => s.is_mandatory)
              return (
                <Radar
                  key={categoryId}
                  name={categoryTitle}
                  dataKey={(entry: Record<string, unknown>) =>
                    entry['category_id'] === categoryId
                      ? (entry['value'] as number)
                      : null
                  }
                  stroke={color}
                  fill={color}
                  fillOpacity={0.2}
                  strokeDasharray={hasMandatory ? undefined : '5 5'}
                />
              )
            })}
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
