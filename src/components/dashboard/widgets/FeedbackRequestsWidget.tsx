import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck'
import { Box, Button, Chip, Stack, Typography } from '@mui/material'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useTodoRequests } from '../../../services/feedbackRequestQueryService'
import { DashboardWidget } from '../layout'

/**
 * Feedback Requests Dashboard Widget
 * Displays pending feedback requests that need response
 * Feature 0004 - Phase 6 US-003 T082
 */
export const FeedbackRequestsWidget: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Fetch todo requests summary
  const { data, isLoading, error } = useTodoRequests({
    page: 1,
    page_size: 1, // Just need the summary stats
    status: 'pending',
  })

  const pendingCount = data?.summary.pending_count ?? 0
  const overdueCount = data?.summary.overdue_count ?? 0

  const styles = useMemo(
    () => ({
      contentContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        py: 2,
      },
      countContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      },
      largeCount: {
        fontSize: '3rem',
        fontWeight: 'bold',
        lineHeight: 1,
      },
      actionButton: {
        mt: 2,
      },
    }),
    []
  )

  const handleViewRequests = () => {
    navigate('/feedback?tab=requests&subtab=todo')
  }

  return (
    <DashboardWidget
      title={t('dashboard.widgets.feedbackRequests.title')}
      isLoading={isLoading}
      error={
        error
          ? new Error(t('dashboard.widgets.feedbackRequests.errorMessage'))
          : null
      }
    >
      <Box sx={styles.contentContainer}>
        {pendingCount === 0 ? (
          // All caught up state
          <Stack spacing={2} alignItems='center'>
            <PlaylistAddCheckIcon
              sx={{ fontSize: 64, color: 'success.main' }}
            />
            <Typography variant='h6' color='text.secondary' textAlign='center'>
              {t('dashboard.widgets.feedbackRequests.allCaughtUp')}
            </Typography>
            <Typography
              variant='body2'
              color='text.secondary'
              textAlign='center'
            >
              {t('dashboard.widgets.feedbackRequests.noRequests')}
            </Typography>
          </Stack>
        ) : (
          // Pending requests state
          <Stack spacing={2} alignItems='center' width='100%'>
            <Box sx={styles.countContainer}>
              <Typography sx={styles.largeCount} color='primary.main'>
                {pendingCount}
              </Typography>
              <Typography variant='h6' color='text.secondary'>
                {t('dashboard.widgets.feedbackRequests.pendingRequests', {
                  count: pendingCount,
                })}
              </Typography>
            </Box>

            {/* Overdue warning */}
            {overdueCount > 0 && (
              <Chip
                icon={<NotificationsActiveIcon />}
                label={t('dashboard.widgets.feedbackRequests.overdueWarning', {
                  count: overdueCount,
                })}
                color='error'
                size='medium'
              />
            )}

            {/* Action button */}
            <Button
              variant='contained'
              color='primary'
              onClick={handleViewRequests}
              sx={styles.actionButton}
            >
              {t('dashboard.widgets.feedbackRequests.viewRequests')}
            </Button>
          </Stack>
        )}
      </Box>
    </DashboardWidget>
  )
}
