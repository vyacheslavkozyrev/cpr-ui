import {
  Alert,
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
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TGoalDto } from '../../dtos/GoalDto'
import { useGoals, useMyFeedback, useProjects } from '../../services'
import type { ProjectSummaryDto } from '../../services/projectQueryService'
import type {
  FeedbackFilters as FeedbackFiltersType,
  FeedbackSortField,
  MyFeedback,
  SortOrder,
} from '../../types/feedback'
import { EmptyState } from '../shared'
import { FeedbackFilters } from './FeedbackFilters'
import { FeedbackListItem } from './FeedbackListItem'

// Constants
const ITEMS_PER_PAGE = 20
const FILTERS_STORAGE_KEY = 'cpr_feedback_filters'

/**
 * Props for MyFeedbackList component
 */
export interface MyFeedbackListProps {
  /** Click handler for feedback item */
  onFeedbackClick?: (feedbackId: string) => void
  /** Show as compact mode */
  compact?: boolean
}

/**
 * My Feedback List Component
 * Displays paginated list of feedback received by current user
 * with filtering, sorting, and pagination (20 items per page)
 * Feature 0005 - Phase 3 US-002 (T041-T055)
 *
 * Features:
 * - Card-based layout with pagination (20 items per page)
 * - Comprehensive filtering (date range, rating, goal, project, search)
 * - Multiple sorting options (date, rating, provider name, goal title)
 * - Search functionality with client-side filtering
 * - Filter persistence to LocalStorage
 * - Offline support via React Query caching
 * - Empty state with onboarding content
 */
export const MyFeedbackList: React.FC<MyFeedbackListProps> = ({
  onFeedbackClick,
  compact = false,
}) => {
  const { t } = useTranslation()

  // State with LocalStorage persistence for filters
  const [filters, setFilters] = useState<FeedbackFiltersType>(() => {
    // Load filters from LocalStorage on mount
    const stored = localStorage.getItem(FILTERS_STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return {
          date_from: null,
          date_to: null,
          rating: null,
          goal_id: null,
          project_id: null,
          from_employee_id: null,
          search: null,
        }
      }
    }
    return {
      date_from: null,
      date_to: null,
      rating: null,
      goal_id: null,
      project_id: null,
      from_employee_id: null,
      search: null,
    }
  })
  const [sortBy, setSortBy] = useState<FeedbackSortField>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [currentPage, setCurrentPage] = useState(1)

  // Persist filters to LocalStorage whenever they change
  useEffect(() => {
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters))
  }, [filters])

  // Fetch data
  const {
    data: feedbackData,
    isLoading: feedbackLoading,
    error: feedbackError,
  } = useMyFeedback()

  const { data: goalsData, isLoading: goalsLoading } = useGoals({
    per_page: 100,
  })

  const { data: projectsData, isLoading: projectsLoading } = useProjects()

  const feedback = useMemo<MyFeedback[]>(
    () => feedbackData || [],
    [feedbackData]
  )

  const goals = useMemo<TGoalDto[]>(() => goalsData?.items || [], [goalsData])

  const projects = useMemo<ProjectSummaryDto[]>(
    () => projectsData || [],
    [projectsData]
  )

  // Client-side filtering (backend doesn't support query params yet)
  const filteredFeedback = useMemo(() => {
    return feedback.filter(item => {
      // Date range filter
      if (filters.date_from) {
        const itemDate = new Date(item.created_at)
        const fromDate = new Date(filters.date_from)
        if (itemDate < fromDate) return false
      }
      if (filters.date_to) {
        const itemDate = new Date(item.created_at)
        const toDate = new Date(filters.date_to)
        if (itemDate > toDate) return false
      }

      // Rating filter
      if (filters.rating !== null && item.rating !== filters.rating) {
        return false
      }

      // Goal filter
      if (filters.goal_id && item.goal_id !== filters.goal_id) {
        return false
      }

      // Project filter
      if (filters.project_id && item.project_id !== filters.project_id) {
        return false
      }

      // From employee filter
      if (
        filters.from_employee_id &&
        item.from_employee_id !== filters.from_employee_id
      ) {
        return false
      }

      // Search filter (searches content, goal title, project name, employee name)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const contentMatch = item.content.toLowerCase().includes(searchLower)
        const goalMatch = item.goal.title.toLowerCase().includes(searchLower)
        const projectMatch = item.project?.name
          ?.toLowerCase()
          .includes(searchLower)
        const employeeMatch = item.from_employee.display_name
          .toLowerCase()
          .includes(searchLower)

        if (!contentMatch && !goalMatch && !projectMatch && !employeeMatch) {
          return false
        }
      }

      return true
    })
  }, [feedback, filters])

  // Client-side sorting
  const sortedFeedback = useMemo(() => {
    const sorted = [...filteredFeedback]

    sorted.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'created_at':
          comparison =
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case 'rating':
          comparison = a.rating - b.rating
          break
        case 'from_employee':
          comparison = a.from_employee.display_name.localeCompare(
            b.from_employee.display_name
          )
          break
        case 'goal':
          comparison = a.goal.title.localeCompare(b.goal.title)
          break
        case 'project':
          comparison = (a.project?.name || '').localeCompare(
            b.project?.name || ''
          )
          break
        default:
          comparison = 0
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return sorted
  }, [filteredFeedback, sortBy, sortOrder])

  // Pagination
  const totalPages = Math.ceil(sortedFeedback.length / ITEMS_PER_PAGE)
  const paginatedFeedback = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedFeedback.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [sortedFeedback, currentPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters, sortBy, sortOrder])

  // Handler for page change
  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page)
    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Loading state
  if (feedbackLoading || goalsLoading || projectsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  // Error state
  if (feedbackError) {
    return <Alert severity='error'>{t('common.error.loadFailed')}</Alert>
  }

  // Empty state (no feedback received yet)
  if (feedback.length === 0) {
    return (
      <EmptyState
        heading={t('pages.feedback.list.empty_state.title')}
        description={t('pages.feedback.list.empty_state.description')}
        actionLabel={t('pages.feedback.list.empty_state.action')}
        onAction={() => {
          // Navigate to feedback request page
          window.location.href = '/feedback?tab=requests'
        }}
      />
    )
  }

  // No results after filtering
  if (sortedFeedback.length === 0) {
    return (
      <Box>
        <FeedbackFilters
          filters={filters}
          onFiltersChange={setFilters}
          goals={goals}
          projects={projects}
          compact={compact}
        />
        <EmptyState
          heading={t('pages.feedback.list.no_results.title')}
          description={t('pages.feedback.list.no_results.description')}
          actionLabel={t('pages.feedback.list.no_results.action')}
          onAction={() => {
            setFilters({
              date_from: null,
              date_to: null,
              rating: null,
              goal_id: null,
              project_id: null,
              from_employee_id: null,
              search: null,
            })
          }}
        />
      </Box>
    )
  }

  return (
    <Box>
      {/* Summary Stats */}
      <Stack direction='row' spacing={3} sx={{ mb: 3 }}>
        <Box>
          <Typography variant='h6' color='primary'>
            {feedback.length}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            {t('pages.feedback.list.stats.total')}
          </Typography>
        </Box>
        <Box>
          <Typography variant='h6' color='primary'>
            {(
              feedback.reduce((sum, item) => sum + item.rating, 0) /
              feedback.length
            ).toFixed(1)}
            ⭐
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            {t('pages.feedback.list.stats.average_rating')}
          </Typography>
        </Box>
        <Box>
          <Typography variant='h6' color='primary'>
            {
              feedback.filter(item => {
                const daysSince =
                  (Date.now() - new Date(item.created_at).getTime()) /
                  (1000 * 60 * 60 * 24)
                return daysSince <= 7
              }).length
            }
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            {t('pages.feedback.list.stats.recent')}
          </Typography>
        </Box>
      </Stack>

      {/* Filters */}
      <FeedbackFilters
        filters={filters}
        onFiltersChange={setFilters}
        goals={goals}
        projects={projects}
        compact={compact}
      />

      {/* Sort Controls and Results Count */}
      <Stack
        direction='row'
        spacing={2}
        alignItems='center'
        justifyContent='space-between'
        sx={{ mb: 2 }}
        role='group'
        aria-label='Sort and filter controls'
      >
        <Typography
          variant='body2'
          color='text.secondary'
          role='status'
          aria-live='polite'
        >
          {t('pages.feedback.list.summary', {
            showing: sortedFeedback.length,
            total: feedback.length,
          })}
        </Typography>

        <FormControl size='small' sx={{ minWidth: 200 }}>
          <InputLabel>{t('pages.feedback.list.sort.label')}</InputLabel>
          <Select
            value={`${sortBy}_${sortOrder}`}
            onChange={e => {
              const [field, order] = e.target.value.split('_')
              setSortBy(field as FeedbackSortField)
              setSortOrder(order as SortOrder)
            }}
            label={t('pages.feedback.list.sort.label')}
          >
            <MenuItem value='created_at_desc'>
              {t('pages.feedback.list.sort.date_newest')}
            </MenuItem>
            <MenuItem value='created_at_asc'>
              {t('pages.feedback.list.sort.date_oldest')}
            </MenuItem>
            <MenuItem value='rating_desc'>
              {t('pages.feedback.list.sort.rating_highest')}
            </MenuItem>
            <MenuItem value='rating_asc'>
              {t('pages.feedback.list.sort.rating_lowest')}
            </MenuItem>
            <MenuItem value='from_employee_asc'>
              {t('pages.feedback.list.sort.provider_name')}
            </MenuItem>
            <MenuItem value='goal_asc'>
              {t('pages.feedback.list.sort.goal_title')}
            </MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Feedback List */}
      <Stack spacing={2} role='region' aria-label='Feedback list'>
        {paginatedFeedback.map((item: MyFeedback) => (
          <FeedbackListItem
            key={item.id}
            feedback={item}
            {...(onFeedbackClick ? { onClick: onFeedbackClick } : {})}
            compact={compact}
          />
        ))}
      </Stack>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color='primary'
            showFirstButton
            showLastButton
            aria-label={t('pages.feedback.list.pagination.label')}
          />
        </Box>
      )}
    </Box>
  )
}
