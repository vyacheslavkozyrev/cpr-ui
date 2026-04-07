import { Add as AddIcon } from '@mui/icons-material'
import { Box, Button, Tab, Tabs, Typography } from '@mui/material'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { MyFeedbackList } from '../../components/Feedback/MyFeedbackList'
import { SentRequestsList } from '../../components/FeedbackRequest/lists/SentRequestsList'
import { TodoRequestsList } from '../../components/FeedbackRequest/lists/TodoRequestsList'
import { EUserRole } from '../../models'
import MyCyclesPage from '../../pages/reviews/MyCyclesPage'
import ReviewCyclesPage from '../../pages/reviews/ReviewCyclesPage'
import ReviewRequestsPage from '../../pages/reviews/ReviewRequestsPage'
import { useAuthStore } from '../../stores/authStore'
import { FeedbackAnalyticsPage } from './FeedbackAnalyticsPage'
import { ManagerTeamRequests } from './ManagerTeamRequests'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`feedback-tabpanel-${index}`}
      aria-labelledby={`feedback-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `feedback-tab-${index}`,
    'aria-controls': `feedback-tabpanel-${index}`,
  }
}

const getStyles = () => ({
  reviews360TabPanel: { pt: 1 },
})

/**
 * Feedback Page with Tabs
 * Contains tabs: Feedback, Analytics, Requests, 360 Reviews, Team Requests (managers)
 */
export const FeedbackPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [tabValue, setTabValue] = useState(0)
  const [requestsSubTab, setRequestsSubTab] = useState(0)
  const [reviews360SubTab, setReviews360SubTab] = useState(0)
  const { user } = useAuthStore()
  const styles = useMemo(() => getStyles(), [])

  // Check if user has manager-level roles (People Manager, Solution Owner, Director, Administrator)
  // These roles typically have direct reports and can view team requests
  const isManager = user?.roles?.some(
    role =>
      role === EUserRole.PEOPLE_MANAGER ||
      role === EUserRole.SOLUTION_OWNER ||
      role === EUserRole.DIRECTOR ||
      role === EUserRole.ADMINISTRATOR
  )

  // Check if user can manage 360 cycles (Director or Administrator)
  const canManageCycles = user?.roles?.some(
    role => role === EUserRole.DIRECTOR || role === EUserRole.ADMINISTRATOR
  )

  // Handle navigation state to set active tab
  useEffect(() => {
    if (location.state) {
      const state = location.state as { tab?: number; subTab?: number }
      if (typeof state.tab === 'number') {
        setTabValue(state.tab)
      }
      if (typeof state.subTab === 'number') {
        setRequestsSubTab(state.subTab)
      }
    }
  }, [location.state])

  const handleTabChange = useCallback(
    (_event: React.SyntheticEvent, newValue: number) => {
      setTabValue(newValue)
    },
    []
  )

  const handleRequestsSubTabChange = useCallback(
    (_event: React.SyntheticEvent, newValue: number) => {
      setRequestsSubTab(newValue)
    },
    []
  )

  const handleReviews360SubTabChange = useCallback(
    (_event: React.SyntheticEvent, newValue: number) => {
      setReviews360SubTab(newValue)
    },
    []
  )

  const handleCreateRequest = useCallback(() => {
    navigate('/feedback/request/new')
  }, [navigate])

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant='h4' gutterBottom>
          {t('pages.feedback.title')}
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label='feedback tabs'
        >
          <Tab label={t('pages.feedback.tabs.feedback')} {...a11yProps(0)} />
          <Tab label={t('pages.feedback.tabs.analytics')} {...a11yProps(1)} />
          <Tab label={t('pages.feedback.tabs.requests')} {...a11yProps(2)} />
          <Tab
            label={t('pages.feedback.tabs.reviews360', '360 Reviews')}
            {...a11yProps(3)}
          />
          {isManager && (
            <Tab
              label={t('pages.feedback.tabs.teamRequests')}
              {...a11yProps(4)}
            />
          )}
        </Tabs>
      </Box>

      {/* Feedback Tab - US-002: View Received Feedback + US-003: Give Feedback Button */}
      <TabPanel value={tabValue} index={0}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant='h6'>
            {t('pages.feedback.list.title', 'My Feedback')}
          </Typography>
          <Button
            variant='contained'
            color='primary'
            startIcon={<AddIcon />}
            onClick={() => navigate('/feedback/new')}
          >
            {t('pages.feedback.new.button')}
          </Button>
        </Box>
        <MyFeedbackList
          onFeedbackClick={feedbackId => navigate(`/feedback/${feedbackId}`)}
        />
      </TabPanel>

      {/* Analytics Tab - US-004: Feedback Analytics */}
      <TabPanel value={tabValue} index={1}>
        <FeedbackAnalyticsPage />
      </TabPanel>

      {/* Requests Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant='h6'>
            {t('pages.feedback.requests.title')}
          </Typography>
          <Button
            variant='contained'
            color='primary'
            startIcon={<AddIcon />}
            onClick={handleCreateRequest}
          >
            {t('pages.feedback.requests.createButton')}
          </Button>
        </Box>

        {/* Sub-tabs for Sent and Todo Requests */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={requestsSubTab}
            onChange={handleRequestsSubTabChange}
            aria-label='requests sub-tabs'
          >
            <Tab label={t('pages.feedback.requests.tabs.todo')} />
            <Tab label={t('pages.feedback.requests.tabs.sent')} />
          </Tabs>
        </Box>

        {/* Todo Requests List - US-003 */}
        {requestsSubTab === 0 && <TodoRequestsList />}

        {/* Sent Requests List - US-002 */}
        {requestsSubTab === 1 && <SentRequestsList />}
      </TabPanel>

      {/* 360 Reviews Tab */}
      <TabPanel value={tabValue} index={3}>
        <Box sx={styles.reviews360TabPanel}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs
              value={reviews360SubTab}
              onChange={handleReviews360SubTabChange}
              aria-label='360 reviews sub-tabs'
            >
              <Tab label={t('pages.myReviews.title', 'My Reviews')} />
              <Tab
                label={t('pages.reviewRequests.title', 'Pending Requests')}
              />
              {canManageCycles && (
                <Tab label={t('pages.reviewCycles.title', 'Manage Cycles')} />
              )}
            </Tabs>
          </Box>
          {reviews360SubTab === 0 && <MyCyclesPage />}
          {reviews360SubTab === 1 && <ReviewRequestsPage />}
          {reviews360SubTab === 2 && canManageCycles && <ReviewCyclesPage />}
        </Box>
      </TabPanel>

      {/* Team Requests Tab - US-002B (Managers only) */}
      {isManager && (
        <TabPanel value={tabValue} index={4}>
          <ManagerTeamRequests />
        </TabPanel>
      )}
    </Box>
  )
}
