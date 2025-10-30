import {
  Avatar,
  Box,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Rating,
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
import { useFeedbackSummary } from '../../../services/api/dashboardService'
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

interface IFeedbackSummaryWidgetProps {
  period?: DashboardPeriod
}

/**
 * FeedbackSummaryWidget Component
 * Displays feedback statistics, recent feedback, and rating trends
 */
export const FeedbackSummaryWidget: React.FC<IFeedbackSummaryWidgetProps> = ({
  period = 'month',
}) => {
  const navigate = useNavigate()
  const {
    data: feedbackSummary,
    isLoading,
    error,
  } = useFeedbackSummary({ period })
  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  // Chart configuration for rating trend
  const chartData = {
    labels:
      feedbackSummary?.ratingTrend.map(trend => {
        const date = new Date(trend.period)
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
      }) || [],
    datasets: [
      {
        label: 'Average Rating',
        data:
          feedbackSummary?.ratingTrend.map(trend => trend.averageRating) || [],
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        ticks: {
          stepSize: 1,
        },
      },
    },
  }

  const handleViewAllFeedback = () => {
    navigate('/feedback')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
  }

  // Chart Tab Content
  const chartContent = feedbackSummary && (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Statistics Overview */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant='h4' color='primary'>
            {feedbackSummary.statistics.totalReceived}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Received
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant='h4' color='warning.main'>
            {feedbackSummary.statistics.pendingRequests}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Pending
          </Typography>
        </Box>
        <Box
          sx={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Rating
            value={feedbackSummary.statistics.averageRating}
            precision={0.1}
            readOnly
            size='small'
          />
          <Typography variant='caption' color='text.secondary'>
            Avg Rating
          </Typography>
        </Box>
      </Box>

      {/* Rating Trend Chart */}
      <Box sx={{ height: 200 }}>
        <Line data={chartData} options={chartOptions} />
      </Box>
    </Box>
  )

  // Feedback List Tab Content
  const feedbackListContent = feedbackSummary && (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* All Recent Feedback List */}
      <List dense sx={{ maxHeight: 280, overflow: 'auto' }}>
        {feedbackSummary.recentFeedback.map(feedback => (
          <ListItem key={feedback.id} disablePadding sx={{ mb: 1 }}>
            <ListItemAvatar>
              <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                {getInitials(feedback.fromEmployeeName)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant='body2' sx={{ flex: 1 }}>
                    {feedback.fromEmployeeName}
                  </Typography>
                  <Rating value={feedback.rating} readOnly size='small' />
                </Box>
              }
              secondary={
                <Typography variant='caption' color='text.secondary'>
                  {new Date(feedback.createdAt).toLocaleDateString()} •{' '}
                  {feedback.goalTitle}
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
        onClick={handleViewAllFeedback}
        sx={{ alignSelf: 'flex-start' }}
      >
        View All Feedback
      </Button>
    </Box>
  )

  const widgetContent = feedbackSummary && (
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
          Feedback Summary
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
            label='Feedback'
            sx={{ minWidth: 0, px: 2, minHeight: 32, py: 1 }}
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {chartContent}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {feedbackListContent}
      </TabPanel>
    </Box>
  )

  return (
    <DashboardWidget isLoading={isLoading} error={error} height={400}>
      {widgetContent}
    </DashboardWidget>
  )
}
