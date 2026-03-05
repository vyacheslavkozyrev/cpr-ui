import { Add as AddIcon } from '@mui/icons-material'
import { Box, Button, Tab, Tabs, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { SentRequestsList } from '../../components/FeedbackRequest/lists/SentRequestsList'
import { TodoRequestsList } from '../../components/FeedbackRequest/lists/TodoRequestsList'
import { UserRole } from '../../models'
import { useAuthStore } from '../../stores/authStore'
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

/**
 * Feedback Page with Tabs
 * Contains two tabs: Feedback (giving/receiving feedback) and Requests (feedback requests management)
 */
export const FeedbackPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [tabValue, setTabValue] = useState(0)
  const [requestsSubTab, setRequestsSubTab] = useState(0)
  const { user } = useAuthStore()

  // Check if user has manager-level roles (People Manager, Solution Owner, Director, Administrator)
  // These roles typically have direct reports and can view team requests
  const isManager = user?.roles?.some(
    role =>
      role === UserRole.PEOPLE_MANAGER ||
      role === UserRole.SOLUTION_OWNER ||
      role === UserRole.DIRECTOR ||
      role === UserRole.ADMINISTRATOR
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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleRequestsSubTabChange = (
    _event: React.SyntheticEvent,
    newValue: number
  ) => {
    setRequestsSubTab(newValue)
  }

  const handleCreateRequest = () => {
    navigate('/feedback/request/new')
  }

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
          <Tab label={t('pages.feedback.tabs.requests')} {...a11yProps(1)} />
          {isManager && (
            <Tab
              label={t('pages.feedback.tabs.teamRequests')}
              {...a11yProps(2)}
            />
          )}
        </Tabs>
      </Box>

      {/* Feedback Tab */}
      <TabPanel value={tabValue} index={0}>
        <Typography>{t('pages.feedback.comingSoon')}</Typography>
      </TabPanel>

      {/* Requests Tab */}
      <TabPanel value={tabValue} index={1}>
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

      {/* Team Requests Tab - US-002B (Managers only) */}
      {isManager && (
        <TabPanel value={tabValue} index={2}>
          <ManagerTeamRequests />
        </TabPanel>
      )}
    </Box>
  )
}
