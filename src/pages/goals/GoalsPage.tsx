import AddIcon from '@mui/icons-material/Add'
import FilterListIcon from '@mui/icons-material/FilterList'
import GridViewIcon from '@mui/icons-material/GridView'
import ViewListIcon from '@mui/icons-material/ViewList'
import {
  Alert,
  Box,
  Button,
  Container,
  Fab,
  Pagination,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useGoals } from '../../services'
import { usePreferencesStore } from '../../stores'
import type { IGoalsQueryParams, TGoalSortField } from '../../types/goalFilters'
import {
  GoalCard,
  GoalCardSkeleton,
  GoalFiltersPanel,
  GoalTableSkeleton,
  GoalTableView,
} from './components'

/**
 * Goals List Page
 * Feature 0001 - Personal Goal Management
 * Phase 5A - Enhanced UI Implementation
 */

type ViewMode = 'grid' | 'list'

export const GoalsPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Get preferences from store
  const {
    goals: preferences,
    setViewMode: saveViewMode,
    setPerPage: savePerPage,
    setSortPreferences,
    resetGoalsPreferences,
  } = usePreferencesStore()

  // View mode state (initialized from preferences)
  // Note: preferences uses 'table' but ViewMode uses 'list'
  const [viewMode, setViewMode] = useState<ViewMode>(
    preferences.viewMode === 'table' ? 'list' : 'grid'
  )
  const [showFilters, setShowFilters] = useState(false)

  // Filter and pagination state (initialized from preferences)
  const [filters, setFilters] = useState<Partial<IGoalsQueryParams>>({
    page: 1,
    per_page: preferences.perPage,
    status: 'all',
    visibility: 'all',
    priority: 'all',
    deadline: 'all',
    sortBy: preferences.sortBy,
    sortDirection: preferences.sortDirection,
  })

  // Sync preferences when they change
  useEffect(() => {
    if (filters.sortBy && filters.sortDirection) {
      setSortPreferences(filters.sortBy, filters.sortDirection)
    }
  }, [filters.sortBy, filters.sortDirection, setSortPreferences])

  useEffect(() => {
    if (filters.per_page) {
      savePerPage(filters.per_page)
    }
  }, [filters.per_page, savePerPage])

  // Fetch goals using React Query hook
  const { data, isLoading, isError, error } = useGoals(filters)

  // Handlers
  const handleFilterChange = (newFilters: Partial<IGoalsQueryParams>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }))
  }

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setFilters(prev => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCreateGoal = () => {
    navigate('/goals/new')
  }

  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: ViewMode | null
  ) => {
    if (newMode !== null) {
      setViewMode(newMode)
      // Save to preferences (convert 'list' to 'table')
      saveViewMode(newMode === 'list' ? 'table' : 'grid')
    }
  }

  const handleSortChange = (field: TGoalSortField) => {
    setFilters(prev => {
      // Toggle direction if clicking same field, otherwise default to desc
      const newDirection =
        prev.sortBy === field && prev.sortDirection === 'desc' ? 'asc' : 'desc'
      return {
        ...prev,
        sortBy: field,
        sortDirection: newDirection,
      }
    })
  }

  const handleResetPreferences = () => {
    // Reset preferences in store
    resetGoalsPreferences()
    // Reset local state to defaults
    setViewMode('grid')
    setFilters({
      page: 1,
      per_page: 12,
      status: 'all',
      visibility: 'all',
      priority: 'all',
      deadline: 'all',
      sortBy: 'createdAt',
      sortDirection: 'desc',
    })
  }

  // Calculate pagination
  const totalPages =
    data?.total && filters.per_page
      ? Math.ceil(data.total / filters.per_page)
      : 0

  return (
    <Container maxWidth='xl' sx={{ py: 3 }}>
      {/* Header */}
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        mb={3}
      >
        <Box>
          <Typography variant='h4' component='h1' gutterBottom>
            {t('pages.goals.title', 'My Goals')}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {data && typeof data.total === 'number'
              ? t('pages.goals.totalCount', {
                  count: data.total,
                  defaultValue: `${data.total} goals`,
                })
              : t('pages.goals.loading', 'Loading...')}
          </Typography>
          {/* Active filters indicator */}
          {!isLoading &&
            (filters.status !== 'all' ||
              filters.visibility !== 'all' ||
              filters.priority !== 'all' ||
              filters.deadline !== 'all' ||
              Boolean(filters.search)) && (
              <Typography
                variant='caption'
                color='primary'
                sx={{ display: 'block', mt: 0.5 }}
              >
                {t('pages.goals.filtersActive', 'Filters active')}
              </Typography>
            )}
        </Box>

        <Stack direction='row' spacing={2}>
          {/* View mode toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size='small'
            aria-label={t('pages.goals.viewMode', 'view mode')}
          >
            <ToggleButton
              value='grid'
              aria-label={t('pages.goals.gridView', 'Grid View')}
            >
              <Tooltip title={t('pages.goals.gridView', 'Grid View')}>
                <GridViewIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton
              value='list'
              aria-label={t('pages.goals.listView', 'List View')}
            >
              <Tooltip title={t('pages.goals.listView', 'List View')}>
                <ViewListIcon />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Filter toggle */}
          <Button
            variant={showFilters ? 'contained' : 'outlined'}
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            {t('pages.goals.filtersButton', 'Filters')}
          </Button>

          {/* Reset preferences button */}
          <Tooltip
            title={t(
              'pages.goals.resetPreferences',
              'Reset filters and view to defaults'
            )}
          >
            <Button
              variant='text'
              size='small'
              onClick={handleResetPreferences}
            >
              {t('pages.goals.reset', 'Reset')}
            </Button>
          </Tooltip>

          {/* Create goal button */}
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={handleCreateGoal}
          >
            {t('pages.goals.createGoal', 'Create Goal')}
          </Button>
        </Stack>
      </Stack>

      {/* Filters Panel */}
      {showFilters && (
        <Paper sx={{ mb: 3, p: 2 }}>
          <GoalFiltersPanel filters={filters} onChange={handleFilterChange} />
        </Paper>
      )}

      {/* Loading State - Skeleton Grid or Table */}
      {isLoading && (
        <>
          {viewMode === 'grid' ? (
            <Box
              display='grid'
              gridTemplateColumns={{
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              }}
              gap={2}
              mb={4}
            >
              {Array.from({ length: filters.per_page || 12 }).map(
                (_, index) => (
                  <GoalCardSkeleton key={index} />
                )
              )}
            </Box>
          ) : (
            <GoalTableSkeleton rows={filters.per_page || 12} />
          )}
        </>
      )}

      {/* Error State */}
      {isError && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {t('pages.goals.errorLoading', 'Failed to load goals')}:{' '}
          {error?.message}
        </Alert>
      )}

      {/* Empty State - Different variations based on context */}
      {!isLoading &&
        !isError &&
        data &&
        data.items &&
        data.items.length === 0 && (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            {/* No results due to filters */}
            {(filters.search ||
              filters.status !== 'all' ||
              filters.visibility !== 'all' ||
              filters.priority !== 'all' ||
              filters.deadline !== 'all') && (
              <>
                <Typography variant='h6' gutterBottom color='text.secondary'>
                  {t('pages.goals.noResults', 'No goals match your filters')}
                </Typography>
                <Typography variant='body2' color='text.secondary' mb={3}>
                  {t(
                    'pages.goals.tryDifferentFilters',
                    'Try adjusting your filters or search criteria'
                  )}
                </Typography>
                <Button
                  variant='outlined'
                  onClick={() => {
                    setFilters({
                      page: 1,
                      per_page: filters.per_page || 12,
                      status: 'all',
                      visibility: 'all',
                      priority: 'all',
                      deadline: 'all',
                      search: '',
                      sortBy: 'createdAt',
                      sortDirection: 'desc',
                    })
                  }}
                >
                  {t('pages.goals.clearFilters', 'Clear All Filters')}
                </Button>
              </>
            )}

            {/* All goals completed */}
            {!filters.search &&
              filters.status === 'all' &&
              filters.visibility === 'all' &&
              filters.priority === 'all' &&
              filters.deadline === 'all' &&
              data.total === 0 && (
                <>
                  <Typography variant='h6' gutterBottom color='text.secondary'>
                    {t('pages.goals.noGoals', 'No goals yet')}
                  </Typography>
                  <Typography variant='body2' color='text.secondary' mb={3}>
                    {t(
                      'pages.goals.getStarted',
                      'Create your first goal to start tracking your career progress'
                    )}
                  </Typography>
                  <Button
                    variant='contained'
                    startIcon={<AddIcon />}
                    onClick={handleCreateGoal}
                  >
                    {t('pages.goals.createFirstGoal', 'Create Your First Goal')}
                  </Button>
                </>
              )}
          </Paper>
        )}

      {/* Goals Grid/List View */}
      {!isLoading &&
        !isError &&
        data &&
        data.items &&
        data.items.length > 0 && (
          <>
            {viewMode === 'grid' ? (
              <Box
                display='grid'
                gridTemplateColumns={{
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(4, 1fr)',
                }}
                gap={2}
                mb={4}
              >
                {data.items.map(goal => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </Box>
            ) : (
              <Box mb={4}>
                <GoalTableView
                  goals={data.items}
                  sortBy={filters.sortBy}
                  sortDirection={filters.sortDirection}
                  onSortChange={handleSortChange}
                />
              </Box>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Box display='flex' justifyContent='center' mt={4}>
                <Pagination
                  count={totalPages}
                  page={filters.page || 1}
                  onChange={handlePageChange}
                  color='primary'
                  size='large'
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </>
        )}

      {/* Floating Action Button for mobile */}
      <Fab
        color='primary'
        aria-label={t('pages.goals.createGoal', 'Create Goal')}
        onClick={handleCreateGoal}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', sm: 'none' },
        }}
      >
        <AddIcon />
      </Fab>
    </Container>
  )
}
