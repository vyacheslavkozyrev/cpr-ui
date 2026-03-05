import {
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSendAllReminders, useSendReminder } from '../../../hooks'
import { useSentRequests } from '../../../services'
import { useToastStore } from '../../../stores/toastStore'
import { FeedbackRequestCard } from '../cards/FeedbackRequestCard'
import { EmptyState } from '../empty/EmptyState'
import { CancelRequestModal } from '../modals/CancelRequestModal'
import { RequestsSummary } from '../summary/RequestsSummary'

/**
 * Sent Requests List Component
 * Displays paginated list of sent feedback requests with filtering and sorting
 * Feature 0004 - Phase 4 US-002
 */
export const SentRequestsList: React.FC = () => {
  const { t } = useTranslation()
  const addToast = useToastStore(state => state.addToast)

  // Mutations for reminders
  const sendReminderMutation = useSendReminder()
  const sendAllRemindersMutation = useSendAllReminders()

  // State for filters, sorting, and pagination
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')

  // State for cancel modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [requestToCancel, setRequestToCancel] = useState<string | null>(null)
  const [recipientToCancel, setRecipientToCancel] = useState<{
    requestId: string
    recipientId: string
    recipientName: string
  } | null>(null)

  // Build query params - map sortBy to separate sort_by and sort_order
  const getSortParams = () => {
    switch (sortBy) {
      case 'newest':
        return { sort_by: 'created_at', sort_order: 'desc' as const }
      case 'oldest':
        return { sort_by: 'created_at', sort_order: 'asc' as const }
      case 'dueDate':
        return { sort_by: 'due_date', sort_order: 'asc' as const }
      default:
        return { sort_by: 'created_at', sort_order: 'desc' as const }
    }
  }

  const sortParams = getSortParams()
  const params = {
    page,
    page_size: pageSize,
    ...(statusFilter !== 'all' && { status: statusFilter }),
    ...sortParams,
  }

  // Fetch sent requests
  const { data, isLoading, error, refetch } = useSentRequests(params)

  // Handle filter change
  const handleFilterChange = (newFilter: string) => {
    setStatusFilter(newFilter)
    setPage(1) // Reset to first page
  }

  // Handle sort change
  const handleSortChange = (newSort: string) => {
    setSortBy(newSort)
    setPage(1) // Reset to first page
  }

  // Handle page change
  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value)
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle cancel request
  const handleCancelRequest = (requestId: string) => {
    setRequestToCancel(requestId)
    setCancelModalOpen(true)
  }

  // Handle cancel individual recipient
  const handleCancelRecipient = (requestId: string, recipientId: string) => {
    const request = data?.data.find(r => r.id === requestId)
    const recipient = request?.recipients_preview.find(
      r => r.id === recipientId
    )

    if (recipient && recipient.employee) {
      setRecipientToCancel({
        requestId,
        recipientId,
        recipientName: recipient.employee.display_name,
      })
      setCancelModalOpen(true)
    }
  }

  // Handle send reminder
  const handleSendReminder = async (requestId: string, recipientId: string) => {
    sendReminderMutation.mutate({ requestId, recipientId })
  }

  // Handle remind all
  const handleRemindAll = async (requestId: string) => {
    sendAllRemindersMutation.mutate(requestId)
  }

  // Confirm cancel
  const handleConfirmCancel = async () => {
    try {
      if (recipientToCancel) {
        // Cancel individual recipient
        // TODO: Implement cancel recipient API call
        addToast(
          t('pages.feedback.request.toasts.success.cancelled', {
            name: recipientToCancel.recipientName,
          }),
          'success'
        )
      } else if (requestToCancel) {
        // Cancel entire request
        // TODO: Implement cancel request API call
        addToast(
          t('pages.feedback.request.toasts.success.cancelledAll'),
          'success'
        )
      }

      // Reset state
      setCancelModalOpen(false)
      setRequestToCancel(null)
      setRecipientToCancel(null)

      // Refetch data
      refetch()
    } catch {
      addToast(t('pages.feedback.request.toasts.error.generic'), 'error')
    }
  }

  // Cancel modal close
  const handleCancelModal = () => {
    setCancelModalOpen(false)
    setRequestToCancel(null)
    setRecipientToCancel(null)
  }

  // Calculate summary statistics
  const summary = data?.summary || {
    pending_count: 0,
    partial_count: 0,
    complete_count: 0,
  }

  // Check if filters are active
  const hasActiveFilters = statusFilter !== 'all' || sortBy !== 'newest'

  // Loading state
  if (isLoading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight={400}
      >
        <CircularProgress />
      </Box>
    )
  }

  // Error state
  if (error) {
    return (
      <Box py={4} textAlign='center'>
        <Typography color='error'>
          {t('pages.feedback.request.toasts.error.generic')}
        </Typography>
      </Box>
    )
  }

  // Check if truly empty (no data at all with no filters)
  const isTrulyEmpty =
    (!data || data.pagination.total_items === 0) && !hasActiveFilters

  // Show empty state only if truly empty with no filters
  if (isTrulyEmpty) {
    return <EmptyState type='sent' />
  }

  return (
    <Box>
      {/* Filters and Sorting - Always show */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        mb={3}
        justifyContent='space-between'
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        {/* Status Filter */}
        <FormControl size='small' sx={{ minWidth: 200 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label='Status'
            onChange={e => handleFilterChange(e.target.value)}
          >
            <MenuItem value='all'>
              {t('pages.feedback.request.list.sent.filters.all')}
            </MenuItem>
            <MenuItem value='pending'>
              {t('pages.feedback.request.list.sent.filters.pending')}
            </MenuItem>
            <MenuItem value='partial'>
              {t('pages.feedback.request.list.sent.filters.partial')}
            </MenuItem>
            <MenuItem value='complete'>
              {t('pages.feedback.request.list.sent.filters.complete')}
            </MenuItem>
            <MenuItem value='overdue'>
              {t('pages.feedback.request.list.sent.filters.overdue')}
            </MenuItem>
          </Select>
        </FormControl>

        {/* Sort Dropdown */}
        <FormControl size='small' sx={{ minWidth: 200 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label='Sort By'
            onChange={e => handleSortChange(e.target.value)}
          >
            <MenuItem value='newest'>
              {t('pages.feedback.request.list.sent.sort.newest')}
            </MenuItem>
            <MenuItem value='oldest'>
              {t('pages.feedback.request.list.sent.sort.oldest')}
            </MenuItem>
            <MenuItem value='dueDate'>
              {t('pages.feedback.request.list.sent.sort.dueDate')}
            </MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Show empty message if filtered results are empty */}
      {data && data.data.length === 0 ? (
        <Box py={8} textAlign='center'>
          <Typography variant='h6' color='text.secondary' gutterBottom>
            No requests found
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Try adjusting your filters to see more results
          </Typography>
        </Box>
      ) : data ? (
        <>
          {/* Summary Statistics */}
          <RequestsSummary
            showing={data.data.length}
            total={data.pagination.total_items}
            pending={summary.pending_count}
            partial={summary.partial_count}
            complete={summary.complete_count}
          />

          {/* Request Cards */}
          <Box>
            {data.data.map(request => (
              <FeedbackRequestCard
                key={request.id}
                request={request}
                onCancelRequest={handleCancelRequest}
                onCancelRecipient={handleCancelRecipient}
                onSendReminder={handleSendReminder}
                onRemindAll={handleRemindAll}
              />
            ))}
          </Box>

          {/* Pagination */}
          {data.pagination.total_pages > 1 && (
            <Box display='flex' justifyContent='center' mt={4}>
              <Pagination
                count={data.pagination.total_pages}
                page={page}
                onChange={handlePageChange}
                color='primary'
                size='large'
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      ) : null}

      {/* Cancel Request Modal */}
      <CancelRequestModal
        open={cancelModalOpen}
        {...(recipientToCancel?.recipientName && {
          recipientName: recipientToCancel.recipientName,
        })}
        {...(requestToCancel &&
          data && {
            totalRecipients: data.data.find(r => r.id === requestToCancel)
              ?.total_recipients,
          })}
        onConfirm={handleConfirmCancel}
        onCancel={handleCancelModal}
        isCancellingIndividual={!!recipientToCancel}
      />
    </Box>
  )
}
