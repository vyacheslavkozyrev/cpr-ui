import ClearIcon from '@mui/icons-material/Clear'
import SearchIcon from '@mui/icons-material/Search'
import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import type { IGoalsQueryParams } from '../../../types/goalFilters'

interface GoalFiltersPanelProps {
  filters: Partial<IGoalsQueryParams>
  onChange: (filters: Partial<IGoalsQueryParams>) => void
}

/**
 * Goal Filters Panel Component
 * Provides filtering controls for goals list
 * Feature 0001 - Phase 3
 */
export const GoalFiltersPanel: React.FC<GoalFiltersPanelProps> = ({
  filters,
  onChange,
}) => {
  const { t } = useTranslation()

  const handleChange = (
    key: keyof IGoalsQueryParams,
    value: string | number | boolean | undefined
  ) => {
    onChange({ ...filters, [key]: value })
  }

  const handleClearFilters = () => {
    onChange({
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
  }

  const hasActiveFilters =
    (filters.status && filters.status !== 'all') ||
    (filters.visibility && filters.visibility !== 'all') ||
    (filters.priority && filters.priority !== 'all') ||
    (filters.deadline && filters.deadline !== 'all') ||
    Boolean(filters.search)

  return (
    <Box>
      <Stack spacing={2}>
        {/* Search */}
        <TextField
          fullWidth
          size='small'
          label={t('pages.goals.filters.search', 'Search')}
          placeholder={t(
            'goals.filters.searchPlaceholder',
            'Search by title or description'
          )}
          value={filters.search || ''}
          onChange={e => handleChange('search', e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* Filter Controls Row */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {/* Status Filter */}
          <FormControl fullWidth size='small' sx={{ minWidth: { sm: 150 } }}>
            <InputLabel>{t('pages.goals.filters.status', 'Status')}</InputLabel>
            <Select
              value={filters.status || 'all'}
              label={t('pages.goals.filters.status', 'Status')}
              onChange={e => handleChange('status', e.target.value)}
            >
              <MenuItem value='all'>
                {t('pages.goals.filters.allStatus', 'All Status')}
              </MenuItem>
              <MenuItem value='open'>
                {t('pages.goals.status.open', 'Open')}
              </MenuItem>
              <MenuItem value='in_progress'>
                {t('pages.goals.status.in_progress', 'In Progress')}
              </MenuItem>
              <MenuItem value='completed'>
                {t('pages.goals.status.completed', 'Completed')}
              </MenuItem>
            </Select>
          </FormControl>

          {/* Visibility Filter */}
          <FormControl fullWidth size='small' sx={{ minWidth: { sm: 150 } }}>
            <InputLabel>
              {t('pages.goals.filters.visibility', 'Visibility')}
            </InputLabel>
            <Select
              value={filters.visibility || 'all'}
              label={t('pages.goals.filters.visibility', 'Visibility')}
              onChange={e => handleChange('visibility', e.target.value)}
            >
              <MenuItem value='all'>
                {t('pages.goals.filters.allVisibility', 'All')}
              </MenuItem>
              <MenuItem value='private'>
                {t('pages.goals.visibility.private', 'Private')}
              </MenuItem>
              <MenuItem value='team'>
                {t('pages.goals.visibility.team', 'Team')}
              </MenuItem>
              <MenuItem value='org'>
                {t('pages.goals.visibility.org', 'Organization')}
              </MenuItem>
            </Select>
          </FormControl>

          {/* Priority Filter */}
          <FormControl fullWidth size='small' sx={{ minWidth: { sm: 150 } }}>
            <InputLabel>
              {t('pages.goals.filters.priority', 'Priority')}
            </InputLabel>
            <Select
              value={filters.priority || 'all'}
              label={t('pages.goals.filters.priority', 'Priority')}
              onChange={e => handleChange('priority', e.target.value)}
            >
              <MenuItem value='all'>
                {t('pages.goals.filters.allPriority', 'All')}
              </MenuItem>
              <MenuItem value='high'>
                {t('pages.goals.priority.high', 'High')}
              </MenuItem>
              <MenuItem value='medium'>
                {t('pages.goals.priority.medium', 'Medium')}
              </MenuItem>
              <MenuItem value='low'>
                {t('pages.goals.priority.low', 'Low')}
              </MenuItem>
            </Select>
          </FormControl>

          {/* Deadline Filter */}
          <FormControl fullWidth size='small' sx={{ minWidth: { sm: 150 } }}>
            <InputLabel>
              {t('pages.goals.filters.deadline', 'Deadline')}
            </InputLabel>
            <Select
              value={filters.deadline || 'all'}
              label={t('pages.goals.filters.deadline', 'Deadline')}
              onChange={e => handleChange('deadline', e.target.value)}
            >
              <MenuItem value='all'>
                {t('pages.goals.filters.allDeadlines', 'All')}
              </MenuItem>
              <MenuItem value='overdue'>
                {t('pages.goals.filters.overdue', 'Overdue')}
              </MenuItem>
              <MenuItem value='this_week'>
                {t('pages.goals.filters.thisWeek', 'This Week')}
              </MenuItem>
              <MenuItem value='this_month'>
                {t('pages.goals.filters.thisMonth', 'This Month')}
              </MenuItem>
              <MenuItem value='this_quarter'>
                {t('pages.goals.filters.thisQuarter', 'This Quarter')}
              </MenuItem>
              <MenuItem value='no_deadline'>
                {t('pages.goals.filters.noDeadline', 'No Deadline')}
              </MenuItem>
            </Select>
          </FormControl>

          {/* Sort By */}
          <FormControl fullWidth size='small' sx={{ minWidth: { sm: 150 } }}>
            <InputLabel>
              {t('pages.goals.filters.sortBy', 'Sort By')}
            </InputLabel>
            <Select
              value={filters.sortBy || 'createdAt'}
              label={t('pages.goals.filters.sortBy', 'Sort By')}
              onChange={e => handleChange('sortBy', e.target.value)}
            >
              <MenuItem value='createdAt'>
                {t('pages.goals.sort.createdAt', 'Created Date')}
              </MenuItem>
              <MenuItem value='title'>
                {t('pages.goals.sort.title', 'Title')}
              </MenuItem>
              <MenuItem value='deadline'>
                {t('pages.goals.sort.deadline', 'Deadline')}
              </MenuItem>
              <MenuItem value='progress'>
                {t('pages.goals.sort.progress', 'Progress')}
              </MenuItem>
              <MenuItem value='priority'>
                {t('pages.goals.sort.priority', 'Priority')}
              </MenuItem>
              <MenuItem value='status'>
                {t('pages.goals.sort.status', 'Status')}
              </MenuItem>
            </Select>
          </FormControl>

          {/* Sort Direction */}
          <FormControl fullWidth size='small' sx={{ minWidth: { sm: 120 } }}>
            <InputLabel>
              {t('pages.goals.filters.sortDirection', 'Order')}
            </InputLabel>
            <Select
              value={filters.sortDirection || 'desc'}
              label={t('pages.goals.filters.sortDirection', 'Order')}
              onChange={e => handleChange('sortDirection', e.target.value)}
            >
              <MenuItem value='asc'>
                {t('pages.goals.sort.asc', 'Ascending')}
              </MenuItem>
              <MenuItem value='desc'>
                {t('pages.goals.sort.desc', 'Descending')}
              </MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* Results per page */}
        <Stack direction='row' spacing={2} alignItems='center'>
          <FormControl size='small' sx={{ minWidth: 120 }}>
            <InputLabel>
              {t('pages.goals.filters.perPage', 'Per Page')}
            </InputLabel>
            <Select
              value={filters.per_page || 12}
              label={t('pages.goals.filters.perPage', 'Per Page')}
              onChange={e => {
                const value =
                  typeof e.target.value === 'number'
                    ? e.target.value
                    : parseInt(e.target.value, 10)
                handleChange('per_page', value)
              }}
            >
              <MenuItem value={12}>12</MenuItem>
              <MenuItem value={24}>24</MenuItem>
              <MenuItem value={48}>48</MenuItem>
              <MenuItem value={96}>96</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Box>
            <Button
              variant='outlined'
              size='small'
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
            >
              {t('pages.goals.filters.clear', 'Clear Filters')}
            </Button>
          </Box>
        )}
      </Stack>
    </Box>
  )
}
