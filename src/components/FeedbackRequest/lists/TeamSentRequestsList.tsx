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
import { useManagerTeamSentRequests } from '../../../services'
import { useDirectReports } from '../../../services/employeeQueryService'
import type { FeedbackRequestListDto } from '../../../types/feedbackRequest'
import { FeedbackRequestCard } from '../cards/FeedbackRequestCard'
import { EmptyState } from '../empty/EmptyState'
import { RequestsSummary } from '../summary/RequestsSummary'

/**
 * Team Sent Requests List Component
 * Displays paginated list of feedback requests sent by team members (read-only manager view)
 * Feature 0004 - US-002B
 */
export const TeamSentRequestsList: React.FC = () => {
  const { t } = useTranslation()

  // State for filters, sorting, and pagination
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [teamMemberId, setTeamMemberId] = useState<string>('all')

  // Fetch direct reports for team member filter
  const { data: directReports } = useDirectReports()

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
    ...(teamMemberId !== 'all' && { team_member_id: teamMemberId }),
    ...sortParams,
  }

  // Fetch team sent requests
  const { data, isLoading, error } = useManagerTeamSentRequests(params)

  // Handle filter change
  const handleFilterChange = (newFilter: string) => {
    setStatusFilter(newFilter)
    setPage(1) // Reset to first page
  }

  // Handle team member filter change
  const handleTeamMemberChange = (memberId: string) => {
    setTeamMemberId(memberId)
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
  }

  // Loading state
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color='error'>
          {t('pages.feedback.requests.error')}
        </Typography>
      </Box>
    )
  }

  const requests = data?.data || []
  const totalPages = data?.pagination
    ? Math.ceil(data.pagination.total_items / data.pagination.page_size)
    : 0

  // Extract summary data
  const summary = data?.summary || {
    pending_count: 0,
    partial_count: 0,
    complete_count: 0,
  }

  // Check if truly empty (no data at all with no filters)
  const isTrulyEmpty =
    (!data || data.pagination.total_items === 0) && statusFilter === 'all'

  // Show empty state only if truly empty with no filters
  if (isTrulyEmpty) {
    return <EmptyState type='teamSent' />
  }

  return (
    <Box>
      {/* Summary Statistics */}
      {data && (
        <RequestsSummary
          showing={data.data.length}
          total={data.pagination.total_items}
          pending={summary.pending_count}
          partial={summary.partial_count}
          complete={summary.complete_count}
        />
      )}

      {/* Filters and Sorting */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 3, mt: 2 }}
      >
        {/* Team Member Filter */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id='team-member-filter-label'>
            {t('pages.feedback.teamRequests.filters.teamMember')}
          </InputLabel>
          <Select
            labelId='team-member-filter-label'
            id='team-member-filter'
            value={teamMemberId}
            label={t('pages.feedback.teamRequests.filters.teamMember')}
            onChange={e => handleTeamMemberChange(e.target.value)}
          >
            <MenuItem value='all'>
              {t('pages.feedback.teamRequests.filters.allTeamMembers')}
            </MenuItem>
            {directReports?.map(member => (
              <MenuItem key={member.id} value={member.id}>
                {member.display_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Status Filter */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id='status-filter-label'>
            {t('pages.feedback.requests.filters.status')}
          </InputLabel>
          <Select
            labelId='status-filter-label'
            id='status-filter'
            value={statusFilter}
            label={t('pages.feedback.requests.filters.status')}
            onChange={e => handleFilterChange(e.target.value)}
          >
            <MenuItem value='all'>
              {t('pages.feedback.requests.filters.allStatuses')}
            </MenuItem>
            <MenuItem value='draft'>
              {t('pages.feedback.requests.status.draft')}
            </MenuItem>
            <MenuItem value='pending'>
              {t('pages.feedback.requests.status.pending')}
            </MenuItem>
            <MenuItem value='in_progress'>
              {t('pages.feedback.requests.status.inProgress')}
            </MenuItem>
            <MenuItem value='completed'>
              {t('pages.feedback.requests.status.completed')}
            </MenuItem>
            <MenuItem value='cancelled'>
              {t('pages.feedback.requests.status.cancelled')}
            </MenuItem>
          </Select>
        </FormControl>

        {/* Sort */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id='sort-label'>
            {t('pages.feedback.requests.sort.label')}
          </InputLabel>
          <Select
            labelId='sort-label'
            id='sort'
            value={sortBy}
            label={t('pages.feedback.requests.sort.label')}
            onChange={e => handleSortChange(e.target.value)}
          >
            <MenuItem value='newest'>
              {t('pages.feedback.requests.sort.newest')}
            </MenuItem>
            <MenuItem value='oldest'>
              {t('pages.feedback.requests.sort.oldest')}
            </MenuItem>
            <MenuItem value='dueDate'>
              {t('pages.feedback.requests.sort.dueDate')}
            </MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Requests List */}
      {requests.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color='text.secondary'>
            {t('pages.feedback.requests.empty.description')}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {requests.map((request: FeedbackRequestListDto) => (
            <FeedbackRequestCard
              key={request.id}
              request={request}
              isManagerView={true}
            />
          ))}
        </Stack>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color='primary'
          />
        </Box>
      )}
    </Box>
  )
}
