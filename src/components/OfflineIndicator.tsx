import CloudOffIcon from '@mui/icons-material/CloudOff'
import { Alert, Box, Slide } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useOnlineStatus } from '../hooks'

/**
 * Offline Indicator Component
 * Shows a banner when the user is offline
 * Feature 0001 - Phase 5B
 */
export const OfflineIndicator: React.FC = () => {
  const { t } = useTranslation()
  const isOnline = useOnlineStatus()

  return (
    <Slide direction='down' in={!isOnline} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: theme => theme.zIndex.appBar + 1,
        }}
      >
        <Alert
          severity='warning'
          icon={<CloudOffIcon />}
          sx={{
            borderRadius: 0,
            justifyContent: 'center',
          }}
        >
          {t(
            'common.offline',
            'You are currently offline. Some features may be limited.'
          )}
        </Alert>
      </Box>
    </Slide>
  )
}
