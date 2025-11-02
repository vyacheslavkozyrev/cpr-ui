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
import React, { useMemo, useState } from 'react'
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
  const styles = useMemo(() => getStyles(), [])

  return (
    <div role='tabpanel' hidden={value !== index}>
      {value === index && <Box sx={styles.tabPanel}>{children}</Box>}
    </div>
  )
}

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend)

const getStyles = () => ({
  tabPanel: { pt: 2 },
  chartContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  statisticsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    mb: 2,
  },
  statItem: {
    textAlign: 'center',
  },
  progressSection: { mb: 2 },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    mb: 0.5,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  chartWrapper: { height: 160 },
  skillsListContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  skillsList: {
    maxHeight: 280,
    overflow: 'auto',
  },
  listItem: {
    mb: 1,
  },
  skillItemContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skillLevelBadge: {
    px: 1,
    py: 0.25,
    borderRadius: 1,
    color: 'white',
    fontWeight: 'medium',
  },
  viewButton: {
    alignSelf: 'flex-start',
  },
  headerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: 1,
  },
  tabs: { minHeight: 'auto' },
  tab: {
    minWidth: 0,
    px: 2,
    minHeight: 32,
    py: 1,
  },
})

/**
 * SkillProgressWidget Component
 * Displays skills assessment progress, skill categories, and recent assessments
 */
export const SkillProgressWidget: React.FC = () => {
  const navigate = useNavigate()
  const { data: skillsSummary, isLoading, error } = useSkillsSummary()
  const [tabValue, setTabValue] = useState(0)
  const styles = useMemo(() => getStyles(), [])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  // Chart configuration for skill categories breakdown
  const chartData = {
    labels: skillsSummary?.categories.map(cat => cat.name) || [],
    datasets: [
      {
        data: skillsSummary?.categories.map(cat => cat.averageLevel) || [],
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
    <Box sx={styles.chartContainer}>
      {/* Statistics Overview */}
      <Box sx={styles.statisticsContainer}>
        <Box sx={styles.statItem}>
          <Typography variant='h4' color='primary'>
            {skillsSummary.summary.assessedSkills}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Assessed
          </Typography>
        </Box>
        <Box sx={styles.statItem}>
          <Typography variant='h4' color='warning.main'>
            {skillsSummary.improvementAreas.length}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Skill Gaps
          </Typography>
        </Box>
        <Box sx={styles.statItem}>
          <Typography variant='h4' color='success.main'>
            {skillsSummary.summary.averageLevel.toFixed(1)}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Avg Level
          </Typography>
        </Box>
      </Box>

      {/* Progress Bar */}
      <Box sx={styles.progressSection}>
        <Box sx={styles.progressHeader}>
          <Typography variant='caption' color='text.secondary'>
            Assessment Progress
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            {skillsSummary.summary.assessmentProgress.toFixed(0)}%
          </Typography>
        </Box>
        <LinearProgress
          variant='determinate'
          value={skillsSummary.summary.assessmentProgress}
          sx={styles.progressBar}
        />
      </Box>

      {/* Skills Categories Chart */}
      <Box sx={styles.chartWrapper}>
        <Doughnut data={chartData} options={chartOptions} />
      </Box>
    </Box>
  )

  // Skills List Tab Content
  const skillsListContent = skillsSummary && (
    <Box sx={styles.skillsListContainer}>
      {/* All Recent Assessments List */}
      <List dense sx={styles.skillsList}>
        {skillsSummary.recentAssessments.map(assessment => (
          <ListItem key={assessment.id} disablePadding sx={styles.listItem}>
            <ListItemText
              primary={
                <Box sx={styles.skillItemContainer}>
                  <Typography variant='body2'>
                    {assessment.skillName}
                  </Typography>
                  <Typography
                    variant='caption'
                    sx={{
                      ...styles.skillLevelBadge,
                      bgcolor: `${getSkillLevelColor(assessment.level)}.main`,
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
        sx={styles.viewButton}
      >
        View Skills Assessment
      </Button>
    </Box>
  )

  const widgetContent = skillsSummary && (
    <Box>
      {/* Header with Title and Tabs */}
      <Box sx={styles.headerContainer}>
        <Typography variant='h6' component='h3'>
          Skills Progress
        </Typography>
        <Tabs value={tabValue} onChange={handleTabChange} sx={styles.tabs}>
          <Tab label='Chart' sx={styles.tab} />
          <Tab label='Skills' sx={styles.tab} />
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
