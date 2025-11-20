import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { feedbackRequestApiService } from '../services/feedbackRequestService'
import { useToastStore } from '../stores/toastStore'
import { logger } from '../utils/logger'

/**
 * Hook for sending reminder to a specific recipient
 * Feature 0004 - T086: Send Reminder button
 */
export const useSendReminder = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const addToast = useToastStore(state => state.addToast)

  return useMutation({
    mutationFn: ({
      requestId,
      recipientId,
    }: {
      requestId: string
      recipientId: string
    }) => feedbackRequestApiService.sendReminder(requestId, recipientId),
    onSuccess: () => {
      // Invalidate sent requests query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['feedbackRequests', 'sent'] })

      addToast(
        t('pages.feedback.request.toasts.success.reminderSent'),
        'success'
      )
    },
    onError: (error: unknown) => {
      logger.error('Failed to send reminder', { error })

      // Check if it's a 429 (cooldown) error
      const isErrorWithStatus = (
        err: unknown
      ): err is {
        status?: number
        response?: { status?: number; data?: { detail?: string } }
      } => {
        return typeof err === 'object' && err !== null
      }

      if (
        isErrorWithStatus(error) &&
        (error?.status === 429 || error?.response?.status === 429)
      ) {
        // Extract cooldown message from error
        const detail = error?.response?.data?.detail
        addToast(
          detail || t('pages.feedback.request.toasts.error.reminderCooldown'),
          'warning',
          6000
        )
      } else {
        addToast(t('pages.feedback.request.toasts.error.generic'), 'error')
      }
    },
  })
}

/**
 * Hook for sending reminders to all eligible recipients
 * Feature 0004 - T087: Remind All button
 */
export const useSendAllReminders = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const addToast = useToastStore(state => state.addToast)

  return useMutation({
    mutationFn: (requestId: string) =>
      feedbackRequestApiService.sendAllReminders(requestId),
    onSuccess: data => {
      // Invalidate sent requests query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['feedbackRequests', 'sent'] })

      const count = data.data?.reminders_sent ?? 0

      if (count === 0) {
        addToast(
          t('pages.feedback.request.toasts.info.noRemindersNeeded'),
          'info'
        )
      } else {
        addToast(
          t('pages.feedback.request.toasts.success.remindersSent', { count }),
          'success'
        )
      }
    },
    onError: (error: unknown) => {
      logger.error('Failed to send reminders', { error })
      addToast(t('pages.feedback.request.toasts.error.generic'), 'error')
    },
  })
}
