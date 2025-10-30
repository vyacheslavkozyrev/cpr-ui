import {
  Box,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import React, { useState } from 'react'
import { Doughnut } from 'react-chartjs-2'
import { useNavigate } from 'react-router-dom'
import { useSkillsSummary } from '../../../services/api/dashboardService'
import { DashboardWidget } from '../layout'

interface ITabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel({ children, value, index }: ITabPanelProps) {
  return (
    <div role='tabpanel' hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  )
}

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend)

/**
 * SkillProgressWidget Component
 * Displays skills assessment progress, skill categories, and recent assessments
 */
export const SkillProgressWidget: React.FC = () => {
  const navigate = useNavigate()
  const { data: skillsSummary, isLoading, error } = useSkillsSummary()
  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  // Chart configuration for skill categories breakdown
  const chartData = {
    labels: skillsSummary?.skillCategories.map(cat => cat.categoryName) || [],
    datasets: [
      {
        data: skillsSummary?.skillCategories.map(cat => cat.averageLevel) || [],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderColor: [
          'rgb(99, 102, 241)',
          'rgb(34, 197, 94)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(168, 85, 247)',
        ],
        borderWidth: 2,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 10,
          },
        },
      },
    },
  }

  const handleViewSkills = () => {
    navigate('/skills')
  }

  const getSkillLevelLabel = (level: number) => {
    if (level >= 4) return 'Expert'
    if (level >= 3) return 'Advanced'
    if (level >= 2) return 'Intermediate'
    return 'Beginner'
  }

  const getSkillLevelColor = (level: number) => {
    if (level >= 4) return 'success'
    if (level >= 3) return 'primary'
    if (level >= 2) return 'warning'
    return 'error'
  }

  // Chart Tab Content
  const chartContent = skillsSummary && (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Statistics Overview */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant='h4' color='primary'>
            {skillsSummary.statistics.assessedSkills}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Assessed
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant='h4' color='warning.main'>
            {skillsSummary.statistics.skillGaps}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Gaps
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant='h4' color='success.main'>
            {skillsSummary.statistics.averageLevel.toFixed(1)}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Avg Level
          </Typography>
        </Box>
      </Box>

      {/* Progress Bar */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant='caption' color='text.secondary'>
            Assessment Progress
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            {skillsSummary.statistics.assessmentProgress.toFixed(0)}%
          </Typography>
        </Box>
        <LinearProgress
          variant='determinate'
          value={skillsSummary.statistics.assessmentProgress}
          sx={{ height: 6, borderRadius: 3 }}
        />
      </Box>

      {/* Skills Categories Chart */}
      <Box sx={{ height: 160 }}>
        <Doughnut data={chartData} options={chartOptions} />
      </Box>
    </Box>
  )

  // Skills List Tab Content
  const skillsListContent = skillsSummary && (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* All Recent Assessments List */}
      <List dense sx={{ maxHeight: 280, overflow: 'auto' }}>
        {skillsSummary.recentAssessments.map(assessment => (
          <ListItem key={assessment.skillId} disablePadding sx={{ mb: 1 }}>
            <ListItemText
              primary={
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography variant='body2'>
                    {assessment.skillName}
                  </Typography>
                  <Typography
                    variant='caption'
                    sx={{
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      bgcolor: `${getSkillLevelColor(assessment.level)}.main`,
                      color: 'white',
                      fontWeight: 'medium',
                    }}
                  >
                    {getSkillLevelLabel(assessment.level)}
                  </Typography>
                </Box>
              }
              secondary={
                <Typography variant='caption' color='text.secondary'>
                  Level {assessment.level}/5 • Assessed:{' '}
                  {new Date(assessment.assessedAt).toLocaleDateString()}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>

      {/* View All Button */}
      <Button
        variant='outlined'
        size='small'
        onClick={handleViewSkills}
        sx={{ alignSelf: 'flex-start' }}
      >
        View Skills Assessment
      </Button>
    </Box>
  )

  const widgetContent = skillsSummary && (
    <Box>
      {/* Header with Title and Tabs */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1,
        }}
      >
        <Typography variant='h6' component='h3'>
          Skills Progress
        </Typography>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ minHeight: 'auto' }}
        >
          <Tab
            label='Chart'
            sx={{ minWidth: 0, px: 2, minHeight: 32, py: 1 }}
          />
          <Tab
            label='Skills'
            sx={{ minWidth: 0, px: 2, minHeight: 32, py: 1 }}
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {chartContent}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {skillsListContent}
      </TabPanel>
    </Box>
  )

  return (
    <DashboardWidget isLoading={isLoading} error={error} height={400}>
      {widgetContent}
    </DashboardWidget>
  )
}
