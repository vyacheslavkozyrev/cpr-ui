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
import React, { useState } from 'react'
import { Line } from 'react-chartjs-2'
import { useNavigate } from 'react-router-dom'
import { useGoalsSummary } from '../../../services/api/dashboardService'
import type { DashboardPeriod } from '../../../types/dashboard'
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
  const navigate = useNavigate()
  const { data: goalsSummary, isLoading, error } = useGoalsSummary({ period })
  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  // Chart configuration for progress trend
  const chartData = {
    labels:
      goalsSummary?.progressTrend.map(trend => {
        const date = new Date(trend.period)
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
      }) || [],
    datasets: [
      {
        label: 'Created',
        data: goalsSummary?.progressTrend.map(trend => trend.created) || [],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Completed',
        data: goalsSummary?.progressTrend.map(trend => trend.completed) || [],
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
      case 'in_progress':
        return 'primary'
      case 'open':
        return 'default'
      default:
        return 'default'
    }
  }

  // Chart Tab Content
  const chartContent = goalsSummary && (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Statistics Overview */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant='h4' color='primary'>
            {goalsSummary.statistics.active}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Active
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant='h4' color='success.main'>
            {goalsSummary.statistics.completed}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Completed
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant='h4' color='error.main'>
            {goalsSummary.statistics.overdue}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Overdue
          </Typography>
        </Box>
      </Box>

      {/* Progress Chart */}
      <Box sx={{ height: 200 }}>
        <Line data={chartData} options={chartOptions} />
      </Box>
    </Box>
  )

  // Goals List Tab Content
  const goalsListContent = goalsSummary && (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* All Recent Goals List */}
      <List dense sx={{ maxHeight: 280, overflow: 'auto' }}>
        {goalsSummary.recentGoals.map(goal => (
          <ListItem key={goal.id} disablePadding sx={{ mb: 1 }}>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant='body2' sx={{ flex: 1 }}>
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
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mt: 0.5,
                  }}
                >
                  <Typography variant='caption'>
                    {goal.progress}% complete
                  </Typography>
                  {goal.isOverdue && (
                    <Chip
                      label='Overdue'
                      size='small'
                      color='error'
                      variant='filled'
                    />
                  )}
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ ml: 'auto' }}
                  >
                    Created: {new Date(goal.createdAt).toLocaleDateString()}
                  </Typography>
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
        sx={{ alignSelf: 'flex-start' }}
      >
        View All Goals
      </Button>
    </Box>
  )

  const widgetContent = goalsSummary && (
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
          Goals Summary
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
            label='Goals'
            sx={{ minWidth: 0, px: 2, minHeight: 32, py: 1 }}
          />
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
