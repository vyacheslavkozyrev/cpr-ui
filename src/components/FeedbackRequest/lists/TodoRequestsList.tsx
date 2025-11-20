import {
  Alert,
  Box,
  CircularProgress,
  Pagination,
  Stack,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTodoRequests } from '../../../services/feedbackRequestQueryService'
import { FeedbackRequestCard } from '../cards/FeedbackRequestCard'
import { EmptyState } from '../empty/EmptyState'

/**
 * Todo Requests List Component
 * Displays feedback requests addressed to the current user (inbox)
 * Feature 0004 - Phase 6 US-003
 */
export const TodoRequestsList: React.FC = () => {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<'all' | 'pending' | 'overdue'>('pending')

  const statusParam = filter === 'all' ? undefined : filter
  const { data, isLoading, error } = useTodoRequests({
    page,
    page_size: 20,
    sort_by: 'due_date',
    sort_order: 'asc', // Overdue first
    ...(statusParam && { status: statusParam }),
  })

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity='error' sx={{ mt: 2 }}>
        {t('common.error.loadFailed')}
      </Alert>
    )
  }

  // Empty state
  if (!data || data.data.length === 0) {
    return <EmptyState type='todo' />
  }

  const totalPages = data.pagination.total_pages

  return (
    <Stack spacing={3}>
      {/* Summary */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant='body2' color='text.secondary'>
          {t('pages.feedback.request.list.todo.summary', {
            showing: data.data.length,
            total: data.pagination.total_items,
          })}
          {data.summary.overdue_count > 0 && (
            <Typography
              component='span'
              variant='body2'
              color='error'
              sx={{ ml: 1, fontWeight: 'medium' }}
            >
              •{' '}
              {t('pages.feedback.request.list.todo.overdueCount', {
                count: data.summary.overdue_count,
              })}
            </Typography>
          )}
        </Typography>

        {/* Filter */}
        <Stack direction='row' spacing={1}>
          {(['all', 'pending', 'overdue'] as const).map(filterOption => (
            <Box
              key={filterOption}
              onClick={() => {
                setFilter(filterOption)
                setPage(1)
              }}
              sx={{
                px: 2,
                py: 0.5,
                cursor: 'pointer',
                borderRadius: 1,
                fontSize: '0.875rem',
                backgroundColor:
                  filter === filterOption ? 'primary.main' : 'action.hover',
                color:
                  filter === filterOption
                    ? 'primary.contrastText'
                    : 'text.primary',
                '&:hover': {
                  backgroundColor:
                    filter === filterOption
                      ? 'primary.dark'
                      : 'action.selected',
                },
              }}
            >
              {t(`pages.feedback.request.list.todo.filters.${filterOption}`)}
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Request Cards */}
      <Stack spacing={2}>
        {data.data.map(request => (
          <FeedbackRequestCard
            key={request.id}
            request={request}
            isTodoView={true}
          />
        ))}
      </Stack>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color='primary'
          />
        </Box>
      )}
    </Stack>
  )
}
