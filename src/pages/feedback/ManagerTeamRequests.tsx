import { Box, Tab, Tabs, Typography } from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TeamReceivedRequestsList } from '../../components/FeedbackRequest/lists/TeamReceivedRequestsList'
import { TeamSentRequestsList } from '../../components/FeedbackRequest/lists/TeamSentRequestsList'

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
      id={`team-requests-tabpanel-${index}`}
      aria-labelledby={`team-requests-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `team-requests-tab-${index}`,
    'aria-controls': `team-requests-tabpanel-${index}`,
  }
}

/**
 * Manager Team Requests Page
 * Displays feedback requests sent by and received by team members
 * Feature 0004 - US-002B
 */
export const ManagerTeamRequests: React.FC = () => {
  const { t } = useTranslation()
  const [subTab, setSubTab] = useState(0)

  const handleSubTabChange = (
    _event: React.SyntheticEvent,
    newValue: number
  ) => {
    setSubTab(newValue)
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant='h4' gutterBottom>
          {t('pages.feedback.teamRequests.title')}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          {t('pages.feedback.teamRequests.description')}
        </Typography>
      </Box>

      {/* Sub-tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={subTab}
          onChange={handleSubTabChange}
          aria-label='team requests tabs'
        >
          <Tab
            label={t('pages.feedback.teamRequests.tabs.sentByTeam')}
            {...a11yProps(0)}
          />
          <Tab
            label={t('pages.feedback.teamRequests.tabs.receivedByTeam')}
            {...a11yProps(1)}
          />
        </Tabs>
      </Box>

      {/* Sent by Team Tab */}
      <TabPanel value={subTab} index={0}>
        <TeamSentRequestsList />
      </TabPanel>

      {/* Received by Team Tab */}
      <TabPanel value={subTab} index={1}>
        <TeamReceivedRequestsList />
      </TabPanel>
    </Box>
  )
}
