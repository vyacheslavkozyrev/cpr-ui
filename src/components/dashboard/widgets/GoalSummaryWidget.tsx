import {
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'
import React, { useMemo, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { DashboardPeriod } from '../../../models/Dashboard'
import { useGoalsSummary } from '../../../services/api/dashboardService'
import { DashboardWidget } from '../layout'

// Style factory outside component
const getStyles = () => ({
  tabPanel: {
    pt: 2,
  },
  chartContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  statisticsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    mb: 2,
  },
  statisticBox: {
    textAlign: 'center',
  },
  chartBox: {
    height: 200,
  },
  goalsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  goalsList: {
    maxHeight: 280,
    overflow: 'auto',
  },
  listItem: {
    mb: 1,
  },
  goalTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },
  goalTitleText: {
    flex: 1,
  },
  goalSecondary: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mt: 0.5,
  },
  goalActions: {
    display: 'flex',
    gap: 2,
    ml: 'auto',
  },
  viewMoreButton: {
    alignSelf: 'flex-start',
  },
  widgetHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    mb: 1,
  },
  tabs: {
    minHeight: 'auto',
  },
  tab: {
    minWidth: 0,
    px: 2,
    minHeight: 32,
    py: 1,
  },
})

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
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface IGoalSummaryWidgetProps {
  period?: DashboardPeriod
}

/**
 * GoalSummaryWidget Component
 * Displays goals statistics, recent goals, and progress trends
 */
export const GoalSummaryWidget: React.FC<IGoalSummaryWidgetProps> = ({
  period = 'month',
}) => {
  const styles = useMemo(() => getStyles(), [])
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: goalsSummary, isLoading, error } = useGoalsSummary({ period })
  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  // Chart configuration for progress trend
  const chartData = {
    labels:
      goalsSummary?.trendData.map(trend => {
        const date = new Date(trend.period)
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
      }) || [],
    datasets: [
      {
        label: 'Created',
        data: goalsSummary?.trendData.map(trend => trend.created) || [],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Completed',
        data: goalsSummary?.trendData.map(trend => trend.completed) || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 6,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  }

  const handleViewAllGoals = () => {
    navigate('/goals')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'active':
        return 'primary'
      case 'on_hold':
        return 'warning'
      default:
        return 'default'
    }
  }

  // Chart Tab Content
  const chartContent = goalsSummary && (
    <Box sx={styles.chartContainer}>
      {/* Statistics Overview */}
      <Box sx={styles.statisticsRow}>
        <Box sx={styles.statisticBox}>
          <Typography variant='h4' color='primary'>
            {goalsSummary.summary.active}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Active
          </Typography>
        </Box>
        <Box sx={styles.statisticBox}>
          <Typography variant='h4' color='success.main'>
            {goalsSummary.summary.completed}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Completed
          </Typography>
        </Box>
        <Box sx={styles.statisticBox}>
          <Typography variant='h4' color='error.main'>
            {goalsSummary.summary.overdue}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Overdue
          </Typography>
        </Box>
      </Box>

      {/* Progress Chart */}
      <Box sx={styles.chartBox}>
        <Line data={chartData} options={chartOptions} />
      </Box>
    </Box>
  )

  // Goals List Tab Content
  const goalsListContent = goalsSummary && (
    <Box sx={styles.goalsContainer}>
      {/* All Recent Goals List */}
      <List dense sx={styles.goalsList}>
        {goalsSummary.recentGoals.map(goal => (
          <ListItem key={goal.id} disablePadding sx={styles.listItem}>
            <ListItemText
              primary={
                <Box sx={styles.goalTitleRow}>
                  <Typography variant='body2' sx={styles.goalTitleText}>
                    {goal.title}
                  </Typography>
                  <Chip
                    label={goal.status.replace('_', ' ')}
                    size='small'
                    color={getStatusColor(goal.status)}
                    variant='outlined'
                  />
                </Box>
              }
              secondary={
                <Box sx={styles.goalSecondary}>
                  <Typography variant='caption'>
                    {goal.progress}% complete
                  </Typography>
                  {goal.isOverdue && (
                    <Chip
                      label={t('dashboard.labels.overdue')}
                      size='small'
                      color='error'
                      variant='filled'
                    />
                  )}
                  <Box sx={styles.goalActions}>
                    {goal.createdDate && (
                      <Typography variant='caption' color='text.secondary'>
                        Created:{' '}
                        {new Date(goal.createdDate).toLocaleDateString()}
                      </Typography>
                    )}
                    {goal.dueDate && (
                      <Typography variant='caption' color='text.secondary'>
                        Due: {new Date(goal.dueDate).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>

      {/* View All Button */}
      <Button
        variant='outlined'
        size='small'
        onClick={handleViewAllGoals}
        sx={styles.viewMoreButton}
      >
        View All Goals
      </Button>
    </Box>
  )

  const widgetContent = goalsSummary && (
    <Box>
      {/* Header with Title and Tabs */}
      <Box sx={styles.widgetHeaderRow}>
        <Typography variant='h6' component='h3'>
          Goals Summary
        </Typography>
        <Tabs value={tabValue} onChange={handleTabChange} sx={styles.tabs}>
          <Tab label={t('dashboard.tabs.chart')} sx={styles.tab} />
          <Tab label={t('dashboard.tabs.goals')} sx={styles.tab} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {chartContent}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {goalsListContent}
      </TabPanel>
    </Box>
  )

  return (
    <DashboardWidget isLoading={isLoading} error={error} height={400}>
      {widgetContent}
    </DashboardWidget>
  )
}
