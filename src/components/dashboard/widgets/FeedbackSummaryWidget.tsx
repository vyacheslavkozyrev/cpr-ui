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
import React, { useMemo, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { DashboardPeriod } from '../../../models/Dashboard'
import { useFeedbackSummary } from '../../../services/api/dashboardService'
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

const getStyles = () => ({
  tabPanel: { pt: 2 },
  summaryContainer: {
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
  ratingContainer: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    gap: 0.5,
  },
  chartWrapper: { height: 200 },
  feedbackListContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  feedbackList: {
    maxHeight: 280,
    overflow: 'auto',
  },
  listItem: { mb: 1 },
  avatar: {
    width: 32,
    height: 32,
    fontSize: '0.75rem',
  },
  feedbackContent: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },
  feedbackText: { flex: 1 },
  viewButton: { alignSelf: 'flex-start' },
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
 * FeedbackSummaryWidget Component
 * Displays feedback statistics, recent feedback, and rating trends
 */
export const FeedbackSummaryWidget: React.FC<IFeedbackSummaryWidgetProps> = ({
  period = 'month',
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const {
    data: feedbackSummary,
    isLoading,
    error,
  } = useFeedbackSummary({ period })
  const [tabValue, setTabValue] = useState(0)
  const styles = useMemo(() => getStyles(), [])

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
    <Box sx={styles.summaryContainer}>
      {/* Statistics Overview */}
      <Box sx={styles.statisticsContainer}>
        <Box sx={styles.statItem}>
          <Typography variant='h4' color='primary'>
            {feedbackSummary.summary.totalReceived}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Received
          </Typography>
        </Box>
        <Box sx={styles.statItem}>
          <Typography variant='h4' color='warning.main'>
            {feedbackSummary.summary.pendingRequests}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Pending
          </Typography>
        </Box>
        <Box sx={styles.ratingContainer}>
          <Rating
            value={feedbackSummary.summary.averageRating}
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
      <Box sx={styles.chartWrapper}>
        <Line data={chartData} options={chartOptions} />
      </Box>
    </Box>
  )

  // Feedback List Tab Content
  const feedbackListContent = feedbackSummary && (
    <Box sx={styles.feedbackListContainer}>
      {/* All Recent Feedback List */}
      <List dense sx={styles.feedbackList}>
        {feedbackSummary.recentFeedback.map(feedback => (
          <ListItem key={feedback.id} disablePadding sx={styles.listItem}>
            <ListItemAvatar>
              <Avatar sx={styles.avatar}>
                {getInitials(feedback.fromUser.name)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={styles.feedbackContent}>
                  <Typography variant='body2' sx={styles.feedbackText}>
                    {feedback.fromUser.name}
                  </Typography>
                  <Rating value={feedback.rating} readOnly size='small' />
                </Box>
              }
              secondary={
                <Typography variant='caption' color='text.secondary'>
                  {new Date(feedback.createdAt).toLocaleDateString()} •{' '}
                  {/* Note: goalTitle not available in new model, using placeholder */}
                  General Feedback
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
        sx={styles.viewButton}
      >
        View All Feedback
      </Button>
    </Box>
  )

  const widgetContent = feedbackSummary && (
    <Box>
      {/* Header with Title and Tabs */}
      <Box sx={styles.headerContainer}>
        <Typography variant='h6' component='h3'>
          Feedback Summary
        </Typography>
        <Tabs value={tabValue} onChange={handleTabChange} sx={styles.tabs}>
          <Tab label={t('dashboard.tabs.chart')} sx={styles.tab} />
          <Tab label={t('dashboard.tabs.feedback')} sx={styles.tab} />
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
