import { Box, Typography } from '@mui/material'
import {
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip,
} from 'chart.js'
import React from 'react'
import { Radar } from 'react-chartjs-2'
import type { ISkillCategoryGroup } from '../../types/skillAssessment.types'

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

interface AssessmentRadarChartProps {
  skillCategories: ISkillCategoryGroup[]
  nextPositionNull?: boolean
}

const AssessmentRadarChart: React.FC<AssessmentRadarChartProps> = ({
  skillCategories,
  nextPositionNull = false,
}) => {
  // Flatten all skills from current-position categories
  const allSkills = skillCategories.flatMap(c => c.skills)

  if (allSkills.length === 0) return null

  const labels = allSkills.map(s => s.skill_title)

  const requiredData = allSkills.map(s => s.required_level.value)
  const assessedData = allSkills.map(
    s => s.assessed?.self_assessment_value ?? 0
  )
  const nextRequiredData = allSkills.map(
    s => s.next_position_required_level?.value ?? null
  )
  const hasNextPositionData = nextRequiredData.some(v => v !== null)

  const datasets = [
    {
      label: 'Position Required',
      data: requiredData,
      borderColor: 'rgba(25, 118, 210, 0.9)',
      backgroundColor: 'rgba(25, 118, 210, 0.1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(25, 118, 210, 0.9)',
    },
    {
      label: 'Self-Assessed',
      data: assessedData,
      borderColor: 'rgba(46, 125, 50, 0.9)',
      backgroundColor: 'rgba(46, 125, 50, 0.1)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(46, 125, 50, 0.9)',
    },
  ]

  if (!nextPositionNull && hasNextPositionData) {
    datasets.push({
      label: 'Next Position Required',
      data: nextRequiredData.map(v => v ?? 0),
      borderColor: 'rgba(117, 117, 117, 0.7)',
      backgroundColor: 'rgba(117, 117, 117, 0.05)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(117, 117, 117, 0.7)',
    })
  }

  const data = { labels, datasets }

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' as const },
    },
    scales: {
      r: {
        min: 0,
        max: 5,
        ticks: { stepSize: 1 },
      },
    },
  }

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto', mb: 2 }}>
      <Radar data={data} options={options} />
      {nextPositionNull && (
        <Typography
          variant='caption'
          color='text.secondary'
          align='center'
          display='block'
          sx={{ mt: 1 }}
        >
          You are at the highest position in your career track.
        </Typography>
      )}
    </Box>
  )
}

export default AssessmentRadarChart
